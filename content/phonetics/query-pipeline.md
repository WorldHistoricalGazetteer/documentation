# Query Pipeline

## Search Strategy

Phonetic search uses a multi-stage approach with graceful fallback:

```
1. User input: "Springfeld" (typo or variant spelling)
   ↓
2. Language detection (optional):
   - Use UI locale hint
   - Or attempt automatic detection
   - Default: treat as multilingual
   ↓
3. Generate query embedding:
   - Siamese BiLSTM model encodes query string directly
   - Same model used for indexing (consistency)
   - No IPA conversion required at query time
   - Inference latency target: <10ms
   ↓
4. Elasticsearch multi-stage search on toponyms index:

   Stage A: Vector kNN search (primary)
   - Index: toponyms
   - Field: embedding_bilstm
   - k: 100 candidates
   - Similarity: cosine
   
   Stage B: Text search (fallback/boost)
   - Fuzzy match on name field
   - Edge n-gram on name for prefix matching
   - Exact match on name_lower for precise queries
   
   Stage C: Completion suggest (autocomplete)
   - Type-ahead suggestions with language context
   ↓
5. Score combination:
   - Weighted blend: 0.7 × vector_score + 0.3 × text_score
   - Return top-scoring toponym_ids (name@lang)
   ↓
6. Join to places:
   - Query places index for documents referencing matched toponyms
   - Apply geographic/temporal filters if specified
   - Deduplicate and rank by best toponym match score
   ↓
7. Return ranked place results with matched toponym and confidence scores
```

## Elasticsearch Query Structure

### Vector Search

```json
{
  "knn": {
    "field": "embedding_bilstm",
    "query_vector": [0.12, -0.34, "..."],
    "k": 100,
    "num_candidates": 500
  },
  "_source": ["toponym_id", "name", "lang"]
}
```

### Hybrid Search (Vector + Text)

```json
{
  "query": {
    "bool": {
      "should": [
        {
          "knn": {
            "field": "embedding_bilstm",
            "query_vector": [0.12, -0.34, "..."],
            "k": 50,
            "boost": 0.7
          }
        },
        {
          "match": {
            "name": {
              "query": "Springfeld",
              "fuzziness": "AUTO",
              "boost": 0.3
            }
          }
        }
      ]
    }
  }
}
```

### Completion Suggest

```json
{
  "suggest": {
    "toponym-suggest": {
      "prefix": "Lond",
      "completion": {
        "field": "suggest",
        "size": 10,
        "contexts": {
          "lang": ["en"]
        }
      }
    }
  }
}
```

## Spatial Containment Filtering

`POST /api/search` and `POST /api/reconcile` can filter results to places that
fall **inside a region**. The region is defined either by a set of existing
place_ids (`contained_in` — e.g. a country `un:ita`, or any administrative
polygon such as `osm:r…`) or by raw GeoJSON (`bounds`). This powers the Atlas
**Area** filter and augments the WHG Reconciliation API. The query string is
optional: omit it for a *pure-spatial* query ("everything in this region"),
or combine it with a query for *text + spatial*.

| Field | Values | Meaning |
|-------|--------|---------|
| `contained_in` | `place_id[]` | Region = union of these places' geometries |
| `bounds` | GeoJSON | Region from raw geometry |
| `containment` | `fuzzy` (default) \| `exact` | H3-cell test vs true Shapely geometry |
| `relation` | `intersects` (default) \| `within` | Any overlap vs candidate fully inside |

### Two-phase design (H3 prefilter → exact refine)

The filter does **no Elasticsearch reindex** — it reuses fields already
indexed per geometry: `repr_point` (a representative point *guaranteed to lie
within* the geometry), `h3_cover` (a compacted, multi-resolution set of [Uber
H3](https://h3geo.org/) cells covering the geometry's extent), and `bounds`.
Full polygons are **not** held in Elasticsearch; they live in the geometry
store and are read on demand only for exact tests.

1. **Resolve region** — build the region's H3 cover from the `contained_in`
   places' own `h3_cover` (cached across requests; the Atlas pattern reuses
   the same country repeatedly).
2. **Gather candidates** — an Elasticsearch pre-filter: `repr_point`
   intersecting the region bounding box **OR** `h3_cover` matching the region's
   cells (the latter recovers large polygons that overlap the region far from
   their representative point).
3. **Refine** —
   - **fuzzy**: test each candidate's H3 cells for membership in the region
     cover. Cheap and tolerant (precision is bounded by the coarsest region
     cell).
   - **exact**: test the candidate's real polygon (loaded from the geometry
     store) against the region with Shapely. Because `repr_point` is guaranteed
     within the geometry, a representative point inside the region already
     proves `intersects` — so the expensive polygon load runs only on the
     remainder.

### Why H3? (performance)

H3 is used as a cheap prefilter so the expensive exact test runs on as few
candidates as possible. Per-candidate cost, measured on a country-scale polygon
(~2,000 vertices):

| Operation | Cost / candidate |
|-----------|-----------------|
| H3 fuzzy cell test (membership) | ~5 µs |
| Shapely *prepared* point-in-polygon | ~13 µs |
| Building one polygon into Shapely (what exact must pay per polygon) | ~thousands of µs |

So H3 is only ~3× faster than a prepared point test on the *operation alone* —
but the real win is that fuzzy reuses the small `h3_cover` already returned by
Elasticsearch and touches **no geometry I/O**, whereas exact must fetch and
parse each candidate's polygon. For polygon-bearing candidates that makes H3
roughly **two orders of magnitude** faster, and at scale the difference is
sub-millisecond filtering versus seconds. The exact pass is reserved for when
true geometric precision is required, run only on the prefilter's survivors.

## Error Handling

| Condition | Response |
|-----------|----------|
| Embedding generation fails | Fall back to text-only search |
| No vector results | Expand to fuzzy text search |
| Elasticsearch timeout | Return partial results with warning |
| Empty results | Progressively relax filters (language, geography, time) |
| `contained_in` region has no geometry | `422 Unprocessable Entity` |
| Geometry store unavailable (exact) | Exact silently degrades to the fuzzy test |

## Performance Optimisation

- **Query embedding cache**: Cache embeddings for frequent queries (LRU, 10k entries)
- **Pre-computed embeddings**: Top 10k toponyms cached in memory
- **Index optimisation**: HNSW parameters tuned for recall/latency tradeoff
- **Connection pooling**: Persistent Elasticsearch connections
- **Spatial containment**: H3-cell prefilter before exact geometry tests, with
  resolved regions cached across requests (see *Spatial Containment Filtering*)