# Implementation in Vespa <img src="https://img.shields.io/badge/upcoming-v4.0--beta-blue">

## Document Types

We will need five primary document types in Vespa:

1. **`subject`** — unified conceptual entities (places, periods, routes, itineraries, networks, collections)
2. **`name`** — name labels with multiple semantic types and vector embeddings
3. **`geometry`** — spatial representations with derived fields
4. **`timespan`** — temporal bounds with PeriodO integration
5. **`attestation`** — temporal, evidentiary relationships

**Note**: Provenance/changelog is maintained separately in the Django application database, not in Vespa.

---

## Indexing Strategy

### Attestation Records

**Heavily index on:**
- `subject_id` + `relation_type` (for finding all attestations about a subject)
- `object_id` + `relation_type` (for reverse lookups)
- `relation_type` + `subject_type` + `object_type` (for relationship filtering)
- `source` array (for dataset attribution and provenance filtering, including DOI lookups)
- `sequence` (for route/itinerary reconstruction with ORDER BY)
- `connection_metadata` fields (for network filtering by connection type, directionality, etc.)
- `certainty` (for confidence-weighted queries)

**Index structure recommendations:**
```
attestation {
  field id type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field subject_id type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field object_id type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field relation_type type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field sequence type int {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field source type array<string> {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field certainty type float {
    indexing: summary | attribute
  }
  
  field connection_metadata type string {
    indexing: summary
  }
}
```

---

### Subject Records

**Index on:**
- `id` (primary key, attribute for fast lookups)
- Full-text search on `description` field

**Index structure:**
```
subject {
  field id type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field description type string {
    indexing: summary | index
    index: enable-bm25
  }
}
```

---

### Name Records

**Index on:**
- `name` (with language-specific text analyzers)
- `embedding` vector (for semantic similarity search - critical for Dynamic Clustering)
- `ipa` (for phonetic search)
- `name_type` array (for filtering by semantic function)
- `language` and `script` (for language filtering)

**Index structure:**
```
name {
  field id type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field name type string {
    indexing: summary | index
    index: enable-bm25
    match: text
  }
  
  field embedding type tensor<float>(x[384]) {
    indexing: summary | attribute | index
    attribute: distance-metric: angular
    index {
      hnsw {
        max-links-per-node: 16
        neighbors-to-explore-at-insert: 200
      }
    }
  }
  
  field ipa type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field name_type type array<string> {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field language type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field script type string {
    indexing: summary | attribute
  }
}
```

**Notes:**
- Vector embedding dimension (384) is example - adjust based on chosen model
- HNSW parameters tunable for performance vs. recall tradeoff
- Language-specific analyzers needed for non-Latin scripts

---

### Geometry Records

**Index on:**
- Spatial indexing on `geom` (primary geometry)
- Spatial indexing on `representative_point` for efficient point queries (critical for Dynamic Clustering)
- `bbox` for quick spatial filtering
- `precision` and `precision_km` arrays for quality filtering

**Index structure:**
```
geometry {
  field id type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field geom type position {
    indexing: summary | attribute
  }
  
  field representative_point type position {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field bbox type array<double> {
    indexing: summary | attribute
  }
  
  field hull type position {
    indexing: summary
  }
  
  field precision type array<string> {
    indexing: summary | attribute
  }
  
  field precision_km type array<float> {
    indexing: summary | attribute
  }
  
  field source_crs type string {
    indexing: summary | attribute
  }
}
```

**Notes on Vespa spatial capabilities:**
- Vespa natively supports **bounding box queries** on position fields
- For radius and polygon queries, use two-phase approach:
  1. Vespa bbox query to get candidates
  2. Application-level geo-filtering for precise radius/polygon containment
- `representative_point` enables fast approximate spatial searches for clustering
- Consider using geohash for additional spatial indexing efficiency

---

### Timespan Records

**Index on:**
- Temporal range fields for point-in-time and overlap queries
- `label` for period name search
- `precision` for filtering by temporal certainty

**Index structure:**
```
timespan {
  field id type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field start_earliest type long {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field start_latest type long {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field stop_earliest type long {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field stop_latest type long {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  field label type string {
    indexing: summary | index
    index: enable-bm25
  }
  
  field precision type string {
    indexing: summary | attribute
  }
  
  field precision_value type int {
    indexing: summary | attribute
  }
}
```

**Notes:**
- Store dates as Unix timestamps (long) or ISO 8601 strings
- For geological time, use sentinel values (e.g., -999999999000000 for billion years BCE)
- Enable range queries: `WHERE start_latest <= query_date AND stop_earliest >= query_date`

---

## Query Patterns

### Name Resolution Over Time

**Query:** "What was Chang'an called in 700 AD?"

**Vespa YQL:**
```
SELECT name.name, attestation.id
FROM name, attestation, timespan
WHERE attestation.subject_id = "whg:subject-changan"
  AND attestation.relation_type = "has_name"
  AND attestation.object_id = name.id
  AND attestation2.subject_id = attestation.id
  AND attestation2.relation_type = "has_timespan"
  AND attestation2.object_id = timespan.id
  AND timespan.start_latest <= 700
  AND timespan.stop_earliest >= 700
```

---

### Spatial Queries with Temporal Filter

**Query:** "Places within 100km of Constantinople in the 13th century"

**Two-phase approach:**

**Phase 1 - Vespa bbox query:**
```
SELECT subject.id, geometry.representative_point
FROM subject, attestation AS a1, geometry
WHERE a1.subject_id = subject.id
  AND a1.relation_type = "has_geometry"
  AND a1.object_id = geometry.id
  AND closeness(field, geometry.representative_point) <= 100000
  AND a1.object_id IN (
    SELECT a2.subject_id
    FROM attestation AS a2, timespan
    WHERE a2.relation_type = "has_timespan"
      AND a2.object_id = timespan.id
      AND timespan.start_latest <= 1300
      AND timespan.stop_earliest >= 1200
  )
```

**Phase 2 - Application-level filtering:**
- Calculate precise geodesic distance for candidates
- Filter to exact 100km radius

---

### Vector Similarity Search for Toponyms

**Query:** "Find names similar to 'Chang'an' across languages"

**Vespa ANN query:**
```
SELECT name.name, name.language
FROM name
WHERE {targetHits: 10}nearestNeighbor(embedding, query_embedding)
```

Where `query_embedding` is the vector for "Chang'an" from the same model used for indexing.

---

### Network Connection Query

**Query:** "All trade connections from Constantinople 1200-1300 CE"

**Vespa YQL:**
```
SELECT attestation.object_id, attestation.connection_metadata
FROM attestation, timespan
WHERE attestation.subject_id = "pleiades:520998"
  AND attestation.relation_type = "connected_to"
  AND attestation.connection_metadata contains "\"connection_type\":\"trade\""
  AND attestation2.subject_id = attestation.id
  AND attestation2.relation_type = "has_timespan"
  AND attestation2.object_id = timespan.id
  AND timespan.start_latest <= 1300
  AND timespan.stop_earliest >= 1200
```

---

## Handling Temporal Nulls and Geological Time

### Sentinel Values

For `start_earliest`, `start_latest`, `stop_earliest`, `stop_latest` fields representing infinity or deep time:

**Modern era unbounded:**
- Unknown start: `-9999-01-01` → `-315619200000` (Unix timestamp)
- Ongoing/present: `9999-12-31` → `253402300799000` (Unix timestamp)

**Geological time:**
- Billion years BCE: `-999999999-01-01` → `-31556889832000000000` (approximate)
- Use large negative/positive long values

**PeriodO identifiers:**
- Can represent geological periods (e.g., `periodo:p0pleistocene`)
- Import PeriodO temporal bounds into Timespan records

### Query Logic

**Point-in-time queries:**
```
WHERE timespan.start_latest <= query_date
  AND timespan.stop_earliest >= query_date
```

**Overlap queries:**
```
WHERE timespan.start_latest <= query_end
  AND timespan.stop_earliest >= query_start
```

**Unknown bounds handling:**
```
WHERE (timespan.start_earliest IS NULL OR timespan.start_earliest <= query_date)
  AND (timespan.stop_latest IS NULL OR timespan.stop_latest >= query_date)
```

---

## Vespa Capabilities Assessment

### What Vespa Handles Well

**Temporal Range Queries:**
✅ Efficient range queries on numeric/timestamp fields
✅ Multi-field predicates for complex temporal logic
✅ Fast "point-in-time" queries with proper indexing

**Spatial Queries:**
✅ Native bounding box queries on position fields
⚠️ Radius queries: bbox first, then app-level filtering
⚠️ Polygon queries: bbox first, then app-level filtering
✅ Efficient nearest-neighbor on `representative_point`
✅ Combined spatial + temporal predicates

**Vector/Semantic Search:**
✅ Built-in HNSW for approximate nearest neighbor (ANN)
✅ Perfect for Name `embedding` fields (critical for Dynamic Clustering)
✅ Can combine vector similarity with filters (language, name_type, etc.)

**Graph-style Queries:**
⚠️ Not a native graph database
✅ Can handle attestation-based relationships efficiently
✅ Parent/child document references for single-hop queries
⚠️ Multi-hop traversals require application-level logic or multiple query phases
✅ Network queries benefit from indexed `connection_metadata`

**Full-Text Search:**
✅ Rich text search with language-specific analyzers
✅ BM25 ranking for relevance
✅ Supports multiple languages and scripts

**Source Attribution:**
✅ Efficient filtering by `source` array
✅ DOI-based queries for dataset tracking

**Sequence-based Queries:**
✅ Indexed `sequence` field for route/itinerary ordering
✅ Fast ORDER BY on sequence

---

### Advantages of Vespa-Only Approach

**vs. Postgres + ElasticSearch:**
- ✅ Single system eliminates sync issues and data duplication
- ✅ No eventual consistency problems
- ✅ Simpler architecture, easier maintenance
- ✅ Built-in distributed computing
- ✅ Real-time indexing (no lag between write and query)

**Performance:**
- ✅ Low-latency queries (sub-100ms for most patterns)
- ✅ Horizontal scalability for read load
- ✅ Native vector search without external plugin

**Features:**
- ✅ Machine-learned ranking models (can train on user behavior)
- ✅ Streaming search for large result sets
- ✅ Content similarity features

---

### Considerations and Tradeoffs

**Optimized for read-heavy workloads:**
- ✅ Great for WHG's query-dominant usage
- ⚠️ Write throughput lower than specialized OLTP databases

**Complex graph traversals:**
- ⚠️ Multi-hop queries (e.g., "friends of friends") require application logic
- ✅ Single-hop attestation queries work well
- ✅ Can denormalize frequently-accessed paths for performance

**Geometry inheritance:**
- ⚠️ Recursive computation should happen at index time, not query time
- ✅ Pre-compute inherited geometries during ingestion
- ✅ Store as materialized field or separate derived document

**Django/Postgres still needed for:**
- ✅ User accounts, sessions, authentication
- ✅ Admin interface (Django Admin)
- ✅ Changelog and audit trails
- ✅ Namespace schema mapping
- ✅ Traditional CRUD operations on metadata

**Connection metadata as JSON:**
- ⚠️ Requires string matching for complex filters
- ✅ Consider flattening frequently-queried fields to top-level attributes

---

## Schema Design Best Practices

### Denormalization for Performance

**When to denormalize:**
- Frequently co-queried data (e.g., primary name with subject)
- Avoid multiple joins for common patterns
- Pre-compute aggregations (e.g., member counts)

**Example:**
Add `primary_name` field to Subject document:
```
subject {
  field id type string { ... }
  field description type string { ... }
  field primary_name type string {
    indexing: summary | index
  }
}
```

Updated during indexing by:
1. Finding attestation with `relation_type: "has_name"` and highest certainty
2. Copying name string to Subject's `primary_name` field
3. Re-indexing when attestations change

**Tradeoff:** Storage duplication vs. query speed. For high-traffic queries, worth it.

---

### Parent-Child Relationships

**For closely related documents:**

Use Vespa's parent-child feature to co-locate related documents:

```
subject {
  field id type string { ... }
}

attestation {
  field id type string { ... }
  field subject_id type string {
    indexing: summary | attribute
    attribute: fast-search
  }
  
  import field subject_id from parent.id {}
}
```

**Benefits:**
- Efficient joins without cross-shard queries
- Atomic updates of related documents

---

### Materialized Views

**For expensive computations:**

Create derived document types for pre-computed results:

**Example: Subject with inherited geometry**
```
subject_with_geometry {
  field subject_id type string { ... }
  field inherited_geom type position { ... }
  field computed_at type long { ... }
}
```

Updated via:
- Django signal triggers geometry inheritance computation
- Writes derived document to Vespa
- Query reads from materialized view instead of computing recursively

---

### Handling Updates

**Update strategies:**

**Full re-index:**
- When schema changes significantly
- Periodic rebuilds for consistency

**Partial updates:**
- Update individual documents without full re-index
- Use Vespa's update API for field-level changes

**Cascade updates:**
- When attestation changes, update denormalized fields in related documents
- Django handles update propagation logic
- Vespa receives updated documents

---

## Dynamic Clustering Support

### Required Indexes for Clustering

**Toponymic clustering (Name similarity):**
```
name.embedding: tensor<float>(x[384]) with HNSW index
name.name_type: array<string> with fast-search
name.language: string with fast-search
```

**Spatial clustering (Geometry proximity):**
```
geometry.representative_point: position with attribute
geometry.bbox: array<double> with attribute
geometry.precision_km: array<float> for confidence filtering
```

**Temporal clustering (Timespan overlap):**
```
timespan.start_earliest: long with fast-search
timespan.start_latest: long with fast-search
timespan.stop_earliest: long with fast-search
timespan.stop_latest: long with fast-search
```

**Typological clustering (Classification):**
```
attestation.relation_type: string with fast-search (filter to has_type)
attestation.object_id: string with fast-search (the classification value)
```

---

### Clustering Query Pattern

**Phase 1: Pre-filter candidates**
```sql
SELECT subject.id
FROM subject, attestation AS a1, geometry, attestation AS a2, timespan
WHERE a1.subject_id = subject.id
  AND a1.relation_type = "has_geometry"
  AND a1.object_id = geometry.id
  AND geometry.bbox within query_bbox
  AND a2.subject_id = subject.id
  AND a2.relation_type = "has_timespan"
  AND a2.object_id = timespan.id
  AND timespan.start_latest <= query_end
  AND timespan.stop_earliest >= query_start
```

**Phase 2: Similarity scoring**
For each candidate subject:
1. Retrieve Names via `has_name` attestations
2. Compute vector similarity to query names
3. Score spatial distance using representative_point
4. Score temporal overlap
5. Combine scores with configurable weights

**Phase 3: Cluster merging**
```sql
SELECT attestation.object_id
FROM attestation
WHERE attestation.subject_id IN (candidate_ids)
  AND attestation.relation_type IN ("same_as", "coextensive_with", "succeeds")
```

Apply merge logic based on relationship predicates and certainty thresholds.

---

### Performance Optimization for Clustering

**Batch queries:**
- Use Vespa's multi-search API for parallel candidate retrieval
- Group by spatial regions to reduce query load

**Caching:**
- Cache vector embeddings for frequent query terms
- Cache bounding boxes for regions

**Sampling:**
- For large candidate sets, sample before detailed similarity computation
- Refine top-N matches with full computation

---

## Monitoring and Performance Tuning

### Key Metrics

**Query performance:**
- Latency percentiles (p50, p95, p99)
- Throughput (queries per second)
- Cache hit rates

**Index health:**
- Document count per type
- Index size and growth rate
- Reindexing duration

**Resource usage:**
- CPU utilization
- Memory usage
- Disk I/O

---

### Optimization Techniques

**Query optimization:**
- Use `timeout` parameter to fail fast
- Limit result counts with `hits` parameter
- Use `summary` fields sparingly

**Index optimization:**
- Tune HNSW parameters for vector search (max-links-per-node, neighbors-to-explore)
- Adjust attribute fast-search settings based on query patterns
- Consider multi-value attribute packing

**Caching:**
- Enable Vespa's query result cache for repeated queries
- Use CDN for static geographic regions

---

### Scaling Strategy

**Horizontal scaling:**
- Add content nodes for increased storage/query capacity
- Partition data across nodes by geographic region or temporal period
- Replicate frequently-accessed documents

**Vertical scaling:**
- Increase memory for larger indexes
- Faster CPUs for vector similarity computations

**Hybrid approach:**
- Scale out for read capacity
- Scale up for complex queries (clustering, vector search)

---

## Migration from Postgres + ElasticSearch

### Migration Strategy

**Phase 1: Parallel run**
- Keep existing Postgres + ElasticSearch
- Populate Vespa alongside
- Compare query results for validation

**Phase 2: Read migration**
- Route read queries to Vespa
- Keep writes to both systems
- Monitor performance and correctness

**Phase 3: Write migration**
- Direct writes to Vespa only
- Django signals update Vespa instead of ElasticSearch
- Deprecate ElasticSearch

**Phase 4: Cleanup**
- Remove ElasticSearch cluster
- Archive Postgres historical data
- Vespa becomes source of truth for place data

---

### Data Migration Process

**Extract from Postgres:**
```python
# Django ORM queries, for example:
places = Place.objects.all()
names = Name.objects.all()
geometries = Geometry.objects.all()
attestations = Attestation.objects.all()
```

**Transform to Vespa schema:**
```python
def transform_place_to_subject(place):
    return {
        "id": f"whg:subject-{place.id}",
        "description": place.description
    }

def transform_name(name):
    embedding = compute_embedding(name.name)
    return {
        "id": f"whg:name-{name.id}",
        "name": name.name,
        "language": name.language,
        "embedding": embedding.tolist(),
        "name_type": name.name_types  # array
    }
```

**Load into Vespa:**
```python
import requests

def index_document(doc_type, doc_id, document):
    url = f"http://vespa:8080/document/v1/whg/{doc_type}/docid/{doc_id}"
    response = requests.post(url, json={"fields": document})
    return response.status_code == 200
```

**Batch loading:**
```python
from concurrent.futures import ThreadPoolExecutor

def batch_index(documents, doc_type):
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [
            executor.submit(index_document, doc_type, doc["id"], doc)
            for doc in documents
        ]
        results = [f.result() for f in futures]
    return sum(results)  # count successes
```

---

### Validation

**Query comparison:**
```python
def compare_results(query):
    vespa_results = query_vespa(query)
    postgres_results = query_postgres(query)
    
    vespa_ids = set(r["id"] for r in vespa_results)
    postgres_ids = set(r["id"] for r in postgres_results)
    
    recall = len(vespa_ids & postgres_ids) / len(postgres_ids)
    precision = len(vespa_ids & postgres_ids) / len(vespa_ids)
    
    return recall, precision
```

**Acceptance criteria:**
- Recall > 0.99 (Vespa finds nearly all Postgres results)
- Precision > 0.95 (Vespa results are mostly correct)
- Latency improvement > 2x

---

## Django Integration

### Django Signals for Vespa Updates

**On Subject create/update:**
```python
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=Subject)
def update_vespa_subject(sender, instance, **kwargs):
    vespa_doc = {
        "id": instance.get_namespaced_id(),
        "description": instance.description
    }
    index_to_vespa("subject", vespa_doc)
```

**On Attestation create:**
```python
@receiver(post_save, sender=Attestation)
def update_vespa_attestation(sender, instance, **kwargs):
    vespa_doc = {
        "id": instance.get_namespaced_id(),
        "subject_id": instance.subject.get_namespaced_id(),
        "relation_type": instance.relation_type,
        "object_id": instance.object.get_namespaced_id() if instance.object else None,
        "source": instance.source_list,  # array
        "sequence": instance.sequence,
        "certainty": instance.certainty
    }
    index_to_vespa("attestation", vespa_doc)
    
    # If denormalized fields exist, update parent documents
    if instance.relation_type == "has_name" and instance.certainty > 0.9:
        update_subject_primary_name(instance.subject)
```

**On Name create with embedding:**
```python
@receiver(post_save, sender=Name)
def update_vespa_name(sender, instance, **kwargs):
    # Compute embedding if not present
    if not instance.embedding:
        instance.embedding = compute_embedding(instance.name)
        instance.save()
    
    vespa_doc = {
        "id": instance.get_namespaced_id(),
        "name": instance.name,
        "language": instance.language,
        "script": instance.script,
        "embedding": instance.embedding.tolist(),
        "name_type": instance.name_types
    }
    index_to_vespa("name", vespa_doc)
```

---

### Django Views for Queries

**Reconciliation API:**
```python
from rest_framework.views import APIView
from rest_framework.response import Response

class ReconciliationView(APIView):
    def post(self, request):
        query_name = request.data.get("name")
        query_date = request.data.get("date")  # optional
        
        # Get embedding for query name
        query_embedding = compute_embedding(query_name)
        
        # Vector search in Vespa
        vespa_query = {
            "yql": "select * from name where {targetHits:10}nearestNeighbor(embedding,q)",
            "ranking.features.query(q)": query_embedding.tolist()
        }
        
        candidates = query_vespa(vespa_query)
        
        # If temporal filter, apply via attestations
        if query_date:
            candidates = filter_by_timespan(candidates, query_date)
        
        return Response(candidates)
```

---

### Namespace Resolution

**Django model:**
```python
class NamespaceMapping(models.Model):
    namespace = models.CharField(max_length=50, unique=True)
    url_root = models.URLField()
    description = models.TextField(blank=True)
    
    class Meta:
        db_table = "namespace_mappings"
```

**Signal to sync to Vespa:**
```python
@receiver(post_save, sender=NamespaceMapping)
def sync_namespace_to_vespa(sender, instance, **kwargs):
    # Store namespace mappings in Vespa config
    # or as special document type for resolution
    pass
```

**Resolution function:**
```python
def resolve_id(namespaced_id):
    namespace, local_id = namespaced_id.split(":", 1)
    mapping = NamespaceMapping.objects.get(namespace=namespace)
    return f"{mapping.url_root}{local_id}"
```

---

## Summary

### Vespa Strengths for WHG

✅ **Unified storage and indexing** - eliminates sync complexity
✅ **Native vector search** - essential for Dynamic Clustering toponymic similarity
✅ **Spatial indexing** - bbox queries with app-level refinement
✅ **Temporal range queries** - efficient point-in-time and overlap queries
✅ **Real-time updates** - no indexing lag
✅ **Horizontal scalability** - handles growth in data and query load
✅ **Rich query language** - YQL supports complex filters and joins

### Implementation Priorities

1. **Core document types** - Subject, Name, Geometry, Timespan, Attestation
2. **Essential indexes** - Embeddings (HNSW), spatial (representative_point), temporal (range fields)
3. **Django signals** - Keep Vespa in sync with database changes
4. **Query patterns** - Name resolution, spatial+temporal, vector similarity
5. **Dynamic Clustering support** - Pre-filtering and similarity scoring
6. **Namespace resolution** - Django→Vespa sync for ID mappings
7. **Denormalization** - Primary names, frequently-accessed relationships
8. **Monitoring** - Query latency, index health, resource usage

### Next Steps

1. Set up Vespa cluster (development → staging → production)
2. Define schemas for five document types
3. Implement Django signals for synchronization
4. Build data migration pipeline from Postgres
5. Validate query results against existing system
6. Performance test with production-scale data
7. Develop Dynamic Clustering queries
8. Cutover to Vespa for reads, then writes
9. Decommission Postgres+ElasticSearch for place data