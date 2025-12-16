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

## Error Handling

| Condition | Response |
|-----------|----------|
| Embedding generation fails | Fall back to text-only search |
| No vector results | Expand to fuzzy text search |
| Elasticsearch timeout | Return partial results with warning |
| Empty results | Progressively relax filters (language, geography, time) |

## Performance Optimisation

- **Query embedding cache**: Cache embeddings for frequent queries (LRU, 10k entries)
- **Pre-computed embeddings**: Top 10k toponyms cached in memory
- **Index optimisation**: HNSW parameters tuned for recall/latency tradeoff
- **Connection pooling**: Persistent Elasticsearch connections