# 3.9. Implementation in ArangoDB (Proposed Alternative)

> **Note:** This document presents an alternative implementation approach using ArangoDB instead of Vespa. It complements the database technology assessment in [Section 4.1](https://docs.whgazetteer.org/content/v4/architecture/database.html) and the Vespa-based implementation in [Section 3.8](https://docs.whgazetteer.org/content/v4/data-model/implementation.html).

## Document Collections

ArangoDB's multi-model architecture naturally maps to WHG's attestation-based data model using both document collections and edge collections.

We will need six primary collections:

- **things** — unified conceptual entities (locations, historical entities, collections, periods, routes, itineraries, networks)
- **names** — name labels with multiple semantic types and vector embeddings
- **geometries** — spatial representations with derived fields
- **timespans** — temporal bounds with PeriodO integration
- **attestations** (edge collection) — temporal, evidentiary relationships connecting Things to other entities
- **provenance** — changelog and audit trails (optional; could remain in Django)

### Things Collection

```javascript
// Document in 'things' collection
{
  "_key": "constantinople",
  "_id": "things/constantinople",
  "_rev": "_abc123",
  "thing_type": "location",
  "description": "Major Byzantine/Ottoman city on the Bosphorus",
  "namespace": "whg",
  "primary_name": "Constantinople", // denormalized for quick access
  "representative_point": [28.98, 41.01], // denormalized for spatial queries
  "created": "2025-01-15T10:30:00Z",
  "modified": "2025-03-20T14:22:00Z"
}
```

### Names Collection

```javascript
// Document in 'names' collection
{
  "_key": "name-istanbul-tr",
  "_id": "names/name-istanbul-tr",
  "name": "İstanbul",
  "language": "tr",
  "script": "Latn",
  "ipa": "isˈtanbuɫ",
  "name_type": ["preferred", "toponym"],
  "embedding": [0.234, -0.567, 0.123, ...], // 384-dimensional vector
  "transliteration_system": null,
  "romanized": "Istanbul"
}
```

### Geometries Collection

```javascript
// Document in 'geometries' collection
{
  "_key": "geom-constantinople-city",
  "_id": "geometries/geom-constantinople-city",
  "geom": {
    "type": "MultiPolygon",
    "coordinates": [
      [[[28.94, 41.01], [29.00, 41.01], [29.00, 41.05], [28.94, 41.05], [28.94, 41.01]]],
      [[[28.90, 41.00], [28.92, 41.00], [28.92, 41.02], [28.90, 41.02], [28.90, 41.00]]]
    ]
  },
  "representative_point": [28.97, 41.03],
  "bbox": [28.90, 41.00, 29.00, 41.05],
  "precision": ["historical_approximate", "uncertain_boundary"],
  "precision_km": [5.0, 2.0],
  "source_crs": "EPSG:4326"
}
```

**Note on GeometryCollection:** ArangoDB does not support the GeoJSON `GeometryCollection` type. For places with heterogeneous geometry sets (e.g., both point and polygon), store multiple geometry attestations—one per geometry type. This aligns naturally with our attestation model where each geometry claim is a separate evidential statement.

### Timespans Collection

```javascript
// Document in 'timespans' collection
{
  "_key": "timespan-byzantine-period",
  "_id": "timespans/timespan-byzantine-period",
  "start_earliest": -11644444800000, // Unix timestamp: 330 CE
  "start_latest": -11612908800000,   // Unix timestamp: 331 CE
  "stop_earliest": 693878400000,     // Unix timestamp: 1453 CE
  "stop_latest": 694483200000,       // Unix timestamp: 1453 CE
  "label": "Byzantine Period in Constantinople",
  "precision": "year",
  "precision_value": 1,
  "periodo_id": "periodo:p0byzantine"
}
```

### Attestations Edge Collection

```javascript
// Edge document in 'attestations' collection
{
  "_key": "attestation-const-name-istanbul",
  "_id": "attestations/attestation-const-name-istanbul",
  "_from": "things/constantinople",
  "_to": "names/name-istanbul-tr",
  "_rev": "_xyz789",
  "relation_type": "has_name",
  "source": ["Turkish Geographic Board decision", "1930"],
  "source_type": ["government_decree", "date"],
  "certainty": 1.0,
  "certainty_note": "Official administrative name change",
  "sequence": null, // used for routes/itineraries
  "connection_metadata": null, // used for network connections
  "notes": "Official name adopted after establishment of Turkish Republic"
}
```

## Indexing Strategy

### Things Collection Indexes

```javascript
// Primary key (automatic)
db.things.ensureIndex({ type: "primary", fields: ["_key"] });

// Full-text search on description
db.things.ensureIndex({
  type: "fulltext",
  fields: ["description"],
  minLength: 3
});

// Thing type for filtering
db.things.ensureIndex({
  type: "persistent",
  fields: ["thing_type"]
});

// Geospatial index on representative_point
db.things.ensureIndex({
  type: "geo",
  fields: ["representative_point"],
  geoJson: false // using [lon, lat] array format
});
```

### Names Collection Indexes

```javascript
// Full-text search on name
db.names.ensureIndex({
  type: "fulltext",
  fields: ["name"],
  minLength: 2
});

// Vector index for semantic similarity (FAISS-backed)
db.names.ensureIndex({
  type: "vector",
  fields: ["embedding"],
  params: {
    metric: "cosine",
    dimension: 384,
    lists: 1000 // IVF parameter for clustering
  }
});

// Language and script for filtering
db.names.ensureIndex({
  type: "persistent",
  fields: ["language", "script"]
});

// IPA for phonetic search
db.names.ensureIndex({
  type: "persistent",
  fields: ["ipa"]
});

// Name type for filtering
db.names.ensureIndex({
  type: "persistent",
  fields: ["name_type[*]"]
});
```

### Geometries Collection Indexes

```javascript
// Geospatial index on main geometry
db.geometries.ensureIndex({
  type: "geo",
  fields: ["geom"],
  geoJson: true
});

// Geospatial index on representative point
db.geometries.ensureIndex({
  type: "geo",
  fields: ["representative_point"],
  geoJson: false
});

// Bounding box for quick spatial filters
db.geometries.ensureIndex({
  type: "persistent",
  fields: ["bbox"]
});

// Precision for quality filtering
db.geometries.ensureIndex({
  type: "persistent",
  fields: ["precision[*]"]
});
```

### Timespans Collection Indexes

```javascript
// Temporal range indexes for point-in-time queries
db.timespans.ensureIndex({
  type: "persistent",
  fields: ["start_latest", "stop_earliest"]
});

// Temporal bounds for overlap queries
db.timespans.ensureIndex({
  type: "persistent",
  fields: ["start_earliest", "stop_latest"]
});

// Full-text search on label
db.timespans.ensureIndex({
  type: "fulltext",
  fields: ["label"]
});

// Precision for temporal certainty filtering
db.timespans.ensureIndex({
  type: "persistent",
  fields: ["precision"]
});
```

### Attestations Edge Collection Indexes

```javascript
// Edge indexes (automatic for _from and _to)
db.attestations.ensureIndex({ type: "edge" });

// Relation type for filtering
db.attestations.ensureIndex({
  type: "persistent",
  fields: ["relation_type"]
});

// Source for provenance filtering
db.attestations.ensureIndex({
  type: "persistent",
  fields: ["source[*]"]
});

// Certainty for confidence filtering
db.attestations.ensureIndex({
  type: "persistent",
  fields: ["certainty"]
});

// Sequence for ordered relationships (routes/itineraries)
db.attestations.ensureIndex({
  type: "persistent",
  fields: ["sequence"]
});

// Composite index for efficient traversals
db.attestations.ensureIndex({
  type: "persistent",
  fields: ["_from", "relation_type"]
});

db.attestations.ensureIndex({
  type: "persistent",
  fields: ["_to", "relation_type"]
});
```

## Query Patterns in AQL

ArangoDB's unified query language (AQL) integrates graph traversal, document filtering, geospatial queries, and vector similarity seamlessly.

### Name Resolution Over Time

**Query:** "What was Chang'an called in 700 AD?"

```aql
LET query_date = DATE_TIMESTAMP("700-01-01")

FOR thing IN things
  FILTER thing._key == "changan"
  
  // Traverse to names via attestations
  FOR name, attestation IN OUTBOUND thing attestations
    FILTER attestation.relation_type == "has_name"
    
    // Check temporal validity
    LET timespan_valid = (
      FOR v, e IN OUTBOUND attestation attestations
        FILTER e.relation_type == "has_timespan"
        LET ts = DOCUMENT(e._to)
        FILTER ts.start_latest <= query_date
        FILTER ts.stop_earliest >= query_date
        RETURN ts
    )
    
    FILTER LENGTH(timespan_valid) > 0
    
    RETURN {
      name: name.name,
      language: name.language,
      certainty: attestation.certainty,
      timespan: timespan_valid[0]
    }
```

### Spatial Queries with Temporal Filter

**Query:** "Places within 100km of Constantinople in the 13th century"

```aql
LET constantinople_point = [28.98, 41.01]
LET query_start = DATE_TIMESTAMP("1200-01-01")
LET query_end = DATE_TIMESTAMP("1300-12-31")

FOR thing IN things
  // Spatial filter using representative_point
  FILTER GEO_DISTANCE(thing.representative_point, constantinople_point) <= 100000
  
  // Verify temporal validity
  LET temporal_check = (
    FOR v, e, p IN 1..2 OUTBOUND thing attestations
      FILTER p.edges[0].relation_type == "has_geometry"
      FILTER LENGTH(p.edges) == 2 AND p.edges[1].relation_type == "has_timespan"
      LET ts = p.vertices[2]
      FILTER ts.start_latest <= query_end
      FILTER ts.stop_earliest >= query_start
      RETURN true
  )
  
  FILTER LENGTH(temporal_check) > 0
  
  // Get full geometry for precise calculation
  LET geometries = (
    FOR geom, e IN OUTBOUND thing attestations
      FILTER e.relation_type == "has_geometry"
      FILTER GEO_DISTANCE(geom.representative_point, constantinople_point) <= 100000
      RETURN geom
  )
  
  FILTER LENGTH(geometries) > 0
  
  RETURN {
    thing: thing,
    distance: GEO_DISTANCE(thing.representative_point, constantinople_point),
    geometries: geometries
  }
```

**Note:** For complex polygon containment or precise distance calculations beyond simple point-to-point, additional application-level filtering may be required after retrieving candidates.

### Vector Similarity Search for Toponyms

**Query:** "Find names similar to 'Chang'an' across languages"

```aql
LET query_embedding = @query_vector // passed as bind parameter

FOR name IN names
  LET similarity = APPROX_NEAR_COSINE(name.embedding, query_embedding)
  FILTER similarity > 0.8
  SORT similarity DESC
  LIMIT 10
  
  RETURN {
    name: name.name,
    language: name.language,
    script: name.script,
    similarity: similarity,
    name_type: name.name_type
  }
```

**Important:** Use `APPROX_NEAR_COSINE()` for index-accelerated searches. The non-indexed `COSINE_SIMILARITY()` function is available but will be much slower at scale.

### Network Connection Query

**Query:** "All trade connections from Constantinople 1200-1300 CE"

```aql
LET query_start = DATE_TIMESTAMP("1200-01-01")
LET query_end = DATE_TIMESTAMP("1300-12-31")

FOR thing IN things
  FILTER thing._key == "constantinople"
  
  FOR connected_thing, connection IN OUTBOUND thing attestations
    FILTER connection.relation_type == "connected_to"
    FILTER connection.connection_metadata LIKE "%trade%"
    
    // Check temporal validity of connection
    LET temporal_valid = (
      FOR v, e IN OUTBOUND connection attestations
        FILTER e.relation_type == "has_timespan"
        LET ts = DOCUMENT(e._to)
        FILTER ts.start_latest <= query_end
        FILTER ts.stop_earliest >= query_start
        RETURN ts
    )
    
    FILTER LENGTH(temporal_valid) > 0
    
    RETURN {
      connected_place: connected_thing,
      connection_type: connection.connection_metadata,
      certainty: connection.certainty,
      timespan: temporal_valid[0]
    }
```

### Complex Multi-Constraint Query

**Example:** Combining vector search, geospatial constraints, temporal filtering, and graph traversal.

```aql
LET query_embedding = @query_vector
LET query_point = @query_location
LET query_date = @query_date

FOR thing IN things
  // Geospatial constraint
  FILTER GEO_DISTANCE(thing.representative_point, query_point) < 50000
  
  // Find names with vector similarity
  LET matching_names = (
    FOR name, e IN OUTBOUND thing attestations
      FILTER e.relation_type == "has_name"
      LET similarity = APPROX_NEAR_COSINE(name.embedding, query_embedding)
      FILTER similarity > 0.8
      SORT similarity DESC
      LIMIT 5
      RETURN {name: name.name, similarity: similarity}
  )
  
  FILTER LENGTH(matching_names) > 0
  
  // Check temporal validity
  LET temporal_valid = (
    FOR v, e, p IN 1..2 OUTBOUND thing attestations
      FILTER p.edges[0].relation_type == "has_timespan"
      LET ts = p.vertices[1]
      FILTER ts.start_latest <= query_date
      FILTER ts.stop_earliest >= query_date
      RETURN true
  )
  
  FILTER LENGTH(temporal_valid) > 0
  
  // Find trade network partners
  LET trade_partners = (
    FOR v, e IN 1..3 OUTBOUND thing attestations
      FILTER e.relation_type == "connected_to"
      FILTER e.connection_metadata LIKE "%trade%"
      
      // Temporal filter on connections
      LET conn_temporal = (
        FOR ts_v, ts_e IN OUTBOUND e attestations
          FILTER ts_e.relation_type == "has_timespan"
          LET ts = DOCUMENT(ts_e._to)
          FILTER ts.start_latest <= query_date
          FILTER ts.stop_earliest >= query_date
          RETURN ts
      )
      FILTER LENGTH(conn_temporal) > 0
      
      RETURN {place: v, relation: e}
  )
  
  LIMIT 10
  
  RETURN {
    thing: thing,
    names: matching_names,
    name_similarity: matching_names[0].similarity,
    distance: GEO_DISTANCE(thing.representative_point, query_point),
    trade_partners: trade_partners
  }
```

## Handling Temporal Nulls and Geological Time

### Sentinel Values

For `start_earliest`, `start_latest`, `stop_earliest`, `stop_latest` fields representing infinity or deep time:

**Modern era unbounded:**
- Unknown start: `-9999-01-01` → `-315619200000` (Unix timestamp)
- Ongoing/present: `9999-12-31` → `253402300799000` (Unix timestamp)

**Geological time:**
- Billion years BCE: `-999999999-01-01` → `-31556889832000000000` (approximate)
- Use large negative/positive integer values

**PeriodO identifiers:**
- Store PeriodO URIs in timespan documents
- Import PeriodO temporal bounds into Timespan records

### Query Logic

```aql
// Point-in-time query
FOR ts IN timespans
  FILTER ts.start_latest <= @query_date
  FILTER ts.stop_earliest >= @query_date
  RETURN ts

// Overlap query
FOR ts IN timespans
  FILTER ts.start_latest <= @query_end
  FILTER ts.stop_earliest >= @query_start
  RETURN ts

// Unknown bounds handling
FOR ts IN timespans
  FILTER (ts.start_earliest == null OR ts.start_earliest <= @query_date)
  FILTER (ts.stop_latest == null OR ts.stop_latest >= @query_date)
  RETURN ts
```

## ArangoDB Capabilities Assessment

### What ArangoDB Handles Well

**Property Graph Queries:**
- ✅ Native graph database with efficient edge traversals
- ✅ Multi-hop queries optimized (1-10+ hops)
- ✅ Bidirectional traversals (OUTBOUND, INBOUND, ANY)
- ✅ Named graphs for domain separation
- ✅ Shortest path algorithms built-in

**Spatial Queries:**
- ✅ Native GeoJSON support (Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon)
- ✅ S2-based geospatial indexing for spherical geometry
- ✅ `GEO_DISTANCE`, `GEO_CONTAINS`, `GEO_INTERSECTS` functions
- ✅ Efficient spatial filtering with geo indexes
- ❌ No `GeometryCollection` support (workaround: multiple geometry attestations)

**Vector/Semantic Search:**
- ✅ Vector indexes powered by FAISS
- ✅ `APPROX_NEAR_COSINE()` for index-accelerated similarity
- ✅ Cosine, Euclidean, and other distance metrics
- ⚠️ Less mature than specialized systems (Vespa, pgvector) for very large vector datasets
- ⚠️ Performance validation needed for 10M+ vectors

**Temporal Range Queries:**
- ✅ Efficient range queries on numeric timestamp fields
- ✅ Multi-field predicates for complex temporal logic
- ✅ Fast point-in-time and overlap queries with proper indexing

**Document Search:**
- ✅ Full-text search with language analyzers
- ✅ JSON document storage with flexible schemas
- ✅ Complex filtering on nested fields

**Unified Query Language:**
- ✅ AQL integrates all capabilities (graph, document, spatial, vector)
- ✅ Single query syntax reduces cognitive load
- ✅ No need to combine multiple query languages or systems

**Operational Benefits:**
- ✅ Single system for all data types
- ✅ No data synchronization between systems
- ✅ Unified backup/recovery strategy
- ✅ Real-time consistency (no eventual consistency issues)

### Advantages of ArangoDB-Only Approach

**vs. PostgreSQL + Extensions:**
- ✅ Native graph support (vs. Apache AGE extension)
- ✅ More elegant graph traversal syntax
- ✅ Better performance for multi-hop queries
- ✅ Unified query language (vs. mixing SQL/Cypher)
- ❌ No `GeometryCollection` support (PostgreSQL has full GeoJSON via PostGIS)

**vs. Vespa:**
- ✅ Native property graph model (Vespa is not a graph database)
- ✅ Native GeoJSON support (Vespa has no GeoJSON support)
- ✅ Better fit for attestation-based architecture
- ❌ Vector search less mature than Vespa

**vs. Neo4j:**
- ✅ Native geospatial support (Neo4j has limited spatial)
- ✅ Multi-model flexibility (document + graph)
- ✅ No need for separate spatial database

### Considerations and Tradeoffs

**Vector Search Maturity:**
- ⚠️ Vector indexes added more recently than core features
- ⚠️ Less battle-tested than Vespa or pgvector for very large vector datasets
- ⚠️ Requires early benchmarking with WHG's phonetic embedding workload

**GeometryCollection Limitation:**
- ❌ Cannot store heterogeneous geometry collections in single document
- ✅ Workaround: Multiple geometry attestations (aligns with attestation model)
- ✅ Alternative: Convert to MultiPolygon by buffering points/lines

**Licensing:**
- ⚠️ Community Edition limited to 100 GiB (insufficient for WHG)
- ⚠️ Enterprise Edition required for production use
- ⚠️ Academic licensing terms require negotiation

**Vendor Ecosystem:**
- ⚠️ Smaller community than PostgreSQL or Neo4j
- ⚠️ Fewer third-party tools and integrations
- ⚠️ Limited pool of developers with ArangoDB experience
- ⚠️ Proprietary query language (AQL) creates some lock-in

**Django/PostgreSQL Still Needed For:**
- ✅ User accounts, sessions, authentication
- ✅ Admin interface (Django Admin)
- ✅ Audit trails and provenance changelog
- ✅ Namespace schema mapping
- ✅ Traditional CRUD operations on application metadata

## Schema Design Best Practices

### Denormalization for Performance

When to denormalize:

- Frequently co-queried data (e.g., primary name with Thing)
- Avoid multiple traversals for common patterns
- Pre-compute aggregations (e.g., member counts)

**Example:** Add `primary_name` and `representative_point` fields to Things:

```javascript
// Denormalized Thing document
{
  "_key": "constantinople",
  "_id": "things/constantinople",
  "thing_type": "location",
  "description": "...",
  "primary_name": "Constantinople", // denormalized
  "representative_point": [28.98, 41.01] // denormalized
}
```

**Update Strategy:**

```javascript
// When name attestation changes
db._query(aql`
  FOR attestation IN attestations
    FILTER attestation._from == "things/constantinople"
    FILTER attestation.relation_type == "has_name"
    FILTER attestation.certainty >= 0.9
    SORT attestation.certainty DESC
    LIMIT 1
    
    LET name = DOCUMENT(attestation._to)
    
    UPDATE { _key: "constantinople" }
      WITH { primary_name: name.name }
      IN things
`);
```

**Tradeoff:** Storage duplication vs. query speed. For high-traffic queries, worth it.

### Materialized Views via Computed Fields

For expensive computations, create derived collections:

```javascript
// Collection: things_with_inherited_geometry
{
  "_key": "constantinople-computed",
  "thing_id": "things/constantinople",
  "inherited_geom": {
    "type": "Polygon",
    "coordinates": [...]
  },
  "computed_at": 1710345600000
}
```

**Update Strategy:**

```python
# Django signal triggers geometry inheritance computation
@receiver(post_save, sender=Attestation)
def update_inherited_geometry(sender, instance, **kwargs):
    if instance.relation_type == "has_geometry":
        compute_and_store_inherited_geometry(instance.subject)
```

### Named Graphs for Domain Separation

ArangoDB supports named graphs to organize different relationship types:

```javascript
// Define named graph for spatial-temporal relationships
db._createGraph('spatio-temporal', [
  {
    collection: 'attestations',
    from: ['things'],
    to: ['geometries', 'timespans']
  }
]);

// Define named graph for network relationships
db._createGraph('networks', [
  {
    collection: 'attestations',
    from: ['things'],
    to: ['things']
  }
]);
```

**Query with named graph:**

```aql
FOR v, e, p IN 1..3 OUTBOUND "things/constantinople" 
  GRAPH "networks"
  FILTER p.edges[*].relation_type ALL == "connected_to"
  RETURN v
```

## Dynamic Clustering Support

### Required Indexes for Clustering

**Toponymic clustering (Name similarity):**
- `names.embedding`: vector index with FAISS
- `names.name_type`: persistent index
- `names.language`: persistent index

**Spatial clustering (Geometry proximity):**
- `geometries.representative_point`: geo index
- `geometries.bbox`: persistent index
- `geometries.precision_km`: persistent index

**Temporal clustering (Timespan overlap):**
- `timespans.start_earliest`, `start_latest`: persistent indexes
- `timespans.stop_earliest`, `stop_latest`: persistent indexes

**Typological clustering (Classification):**
- `attestations.relation_type`: persistent index
- `attestations._to`: edge index (automatic)

### Clustering Query Pattern

```aql
LET query_point = @location
LET query_bbox = @bounding_box
LET query_start = @temporal_start
LET query_end = @temporal_end
LET query_embedding = @name_vector

// Phase 1: Pre-filter candidates
FOR thing IN things
  // Spatial pre-filter
  FILTER GEO_DISTANCE(thing.representative_point, query_point) < 100000
  
  // Get detailed geometry
  LET geometries = (
    FOR geom, e IN OUTBOUND thing attestations
      FILTER e.relation_type == "has_geometry"
      RETURN geom
  )
  FILTER LENGTH(geometries) > 0
  
  // Temporal filter
  LET temporal_valid = (
    FOR ts, e, p IN 1..2 OUTBOUND thing attestations
      FILTER p.edges[0].relation_type == "has_timespan"
      FILTER ts.start_latest <= query_end
      FILTER ts.stop_earliest >= query_start
      RETURN ts
  )
  FILTER LENGTH(temporal_valid) > 0
  
  // Phase 2: Similarity scoring
  LET names = (
    FOR name, e IN OUTBOUND thing attestations
      FILTER e.relation_type == "has_name"
      LET similarity = APPROX_NEAR_COSINE(name.embedding, query_embedding)
      FILTER similarity > 0.7
      SORT similarity DESC
      LIMIT 3
      RETURN {name: name.name, similarity: similarity}
  )
  
  FILTER LENGTH(names) > 0
  
  LET spatial_score = 1 - (GEO_DISTANCE(thing.representative_point, query_point) / 100000)
  LET name_score = names[0].similarity
  LET temporal_score = 1.0 // could compute overlap percentage
  
  // Combined score (configurable weights)
  LET combined_score = (name_score * 0.5) + (spatial_score * 0.3) + (temporal_score * 0.2)
  
  SORT combined_score DESC
  LIMIT 50
  
  RETURN {
    thing: thing,
    names: names,
    combined_score: combined_score,
    spatial_score: spatial_score,
    name_score: name_score
  }
```

### Cluster Merging via Relationship Traversal

```aql
// Phase 3: Find existing cluster relationships
LET candidate_ids = @candidate_thing_ids

FOR thing_id IN candidate_ids
  LET thing = DOCUMENT(thing_id)
  
  // Find same_as relationships
  LET same_as_links = (
    FOR v, e IN 1..2 ANY thing attestations
      FILTER e.relation_type IN ["same_as", "coextensive_with"]
      FILTER e.certainty >= 0.8
      RETURN {
        target: v,
        relation: e.relation_type,
        certainty: e.certainty
      }
  )
  
  RETURN {
    thing: thing,
    cluster_members: same_as_links
  }
```

## Migration from PostgreSQL + ElasticSearch

### Migration Strategy

**Phase 1: Parallel Run**
- Keep existing Postgres + ElasticSearch
- Populate ArangoDB alongside
- Compare query results for validation

**Phase 2: Read Migration**
- Route read queries to ArangoDB
- Keep writes to both systems
- Monitor performance and correctness

**Phase 3: Write Migration**
- Direct writes to ArangoDB only
- Django signals update ArangoDB instead of ElasticSearch
- Deprecate ElasticSearch

**Phase 4: Cleanup**
- Remove ElasticSearch cluster
- Archive Postgres historical data
- ArangoDB becomes source of truth for place data

### Data Migration Process

**Extract from PostgreSQL:**

```python
# Django ORM queries
places = Place.objects.all()
names = Name.objects.all()
geometries = Geometry.objects.all()
attestations = Attestation.objects.all()
```

**Transform to ArangoDB schema:**

```python
def transform_place_to_thing(place):
    return {
        "_key": f"{place.id}",
        "thing_type": "location",
        "description": place.description,
        "namespace": "whg",
        "created": place.created.isoformat(),
        "modified": place.modified.isoformat()
    }

def transform_name(name):
    # Compute embedding if not present
    embedding = compute_embedding(name.name) if not name.embedding else name.embedding
    
    return {
        "_key": f"name-{name.id}",
        "name": name.name,
        "language": name.language,
        "script": name.script,
        "ipa": name.ipa,
        "embedding": embedding.tolist(),
        "name_type": name.name_types,  # array
        "romanized": name.romanized
    }

def transform_geometry(geometry):
    return {
        "_key": f"geom-{geometry.id}",
        "geom": geometry.geojson,  # native GeoJSON
        "representative_point": [geometry.lon, geometry.lat],
        "bbox": geometry.bbox,
        "precision": geometry.precision_list,
        "precision_km": geometry.precision_km_list,
        "source_crs": "EPSG:4326"
    }

def transform_attestation(attestation):
    return {
        "_key": f"attestation-{attestation.id}",
        "_from": f"things/{attestation.subject_id}",
        "_to": f"{get_collection(attestation.object_type)}/{attestation.object_id}",
        "relation_type": attestation.relation_type,
        "source": attestation.source_list,
        "source_type": attestation.source_type_list,
        "certainty": attestation.certainty,
        "certainty_note": attestation.certainty_note,
        "sequence": attestation.sequence,
        "connection_metadata": attestation.connection_metadata,
        "notes": attestation.notes
    }
```

**Load into ArangoDB:**

```python
from arango import ArangoClient

client = ArangoClient(hosts='http://localhost:8529')
db = client.db('whg', username='root', password='password')

def index_document(collection_name, document):
    """Insert or update document in ArangoDB"""
    collection = db.collection(collection_name)
    try:
        collection.insert(document)
        return True
    except Exception as e:
        print(f"Error indexing document: {e}")
        return False

def batch_index(documents, collection_name):
    """Batch insert documents"""
    collection = db.collection(collection_name)
    try:
        result = collection.import_bulk(documents)
        return result['created']
    except Exception as e:
        print(f"Error in batch indexing: {e}")
        return 0
```

**Parallel batch loading:**

```python
from concurrent.futures import ThreadPoolExecutor
from itertools import islice

def chunked(iterable, size):
    """Split iterable into chunks"""
    iterator = iter(iterable)
    while chunk := list(islice(iterator, size)):
        yield chunk

def migrate_collection(django_queryset, transform_func, collection_name, batch_size=1000):
    """Migrate a collection with progress tracking"""
    total = django_queryset.count()
    completed = 0
    
    for batch in chunked(django_queryset.iterator(), batch_size):
        documents = [transform_func(obj) for obj in batch]
        created = batch_index(documents, collection_name)
        completed += created
        print(f"Migrated {completed}/{total} to {collection_name}")
    
    return completed

# Execute migration
migrate_collection(Place.objects.all(), transform_place_to_thing, 'things')
migrate_collection(Name.objects.all(), transform_name, 'names')
migrate_collection(Geometry.objects.all(), transform_geometry, 'geometries')
migrate_collection(Timespan.objects.all(), transform_timespan, 'timespans')
migrate_collection(Attestation.objects.all(), transform_attestation, 'attestations')
```

### Validation

**Query comparison:**

```python
def compare_results(query_params):
    """Compare results between legacy system and ArangoDB"""
    arango_results = query_arangodb(query_params)
    postgres_results = query_postgres(query_params)
    
    arango_ids = set(r["id"] for r in arango_results)
    postgres_ids = set(r["id"] for r in postgres_results)
    
    recall = len(arango_ids & postgres_ids) / len(postgres_ids) if postgres_ids else 0
    precision = len(arango_ids & postgres_ids) / len(arango_ids) if arango_ids else 0
    
    return {
        'recall': recall,
        'precision': precision,
        'arango_count': len(arango_ids),
        'postgres_count': len(postgres_ids),
        'missing_in_arango': postgres_ids - arango_ids,
        'extra_in_arango': arango_ids - postgres_ids
    }

# Run validation suite
test_queries = [
    {'type': 'name_search', 'name': 'Constantinople'},
    {'type': 'spatial', 'point': [28.98, 41.01], 'radius': 50000},
    {'type': 'temporal', 'date': '1200-01-01'},
]

for query in test_queries:
    result = compare_results(query)
    print(f"Query: {query}")
    print(f"Recall: {result['recall']:.2%}, Precision: {result['precision']:.2%}")
```

**Acceptance criteria:**
- Recall > 0.99 (ArangoDB finds nearly all PostgreSQL results)
- Precision > 0.95 (ArangoDB results are mostly correct)
- Latency improvement > 2x

## Migrating Legacy closeMatch Data

### Overview

The V3 system contains approximately 38,000 curated `closeMatch` attestations representing valuable human-reviewed linkages between places. These must be preserved and migrated to the V4 attestation-based model in ArangoDB.

### Migration to ArangoDB Edge Model

**V3 closeMatch → ArangoDB attestation edge mapping:**

```python
def migrate_close_match_to_arangodb(close_match, v4_thing_map):
    """
    Convert V3 closeMatch to V4 same_as attestation in ArangoDB
    
    Args:
        close_match: V3 CloseMatch instance
        v4_thing_map: Dict mapping V3 place IDs to V4 Thing _keys
    """
    subject_key = v4_thing_map[close_match.place.id]
    object_id = resolve_authority_id(
        close_match.authority,
        close_match.matched_id
    )
    
    # Create attestation edge document
    attestation = {
        "_key": f"migrated-cm-{close_match.id}",
        "_from": f"things/{subject_key}",
        "_to": object_id,  # may be external namespace or internal thing
        "relation_type": "same_as",
        "source": [
            "WHG V3 closeMatch (migrated)",
            close_match.notes if close_match.notes else ""
        ],
        "source_type": ["dataset", "annotation"],
        "certainty": close_match.confidence,
        "certainty_note": (
            f"Curated by {close_match.reviewed_by.username} on {close_match.created.date()}"
            if close_match.reviewed_by
            else "Automated match"
        ),
        "notes": f"Migrated from V3 close_matches table. Original ID: {close_match.id}",
        "sequence": None,
        "connection_metadata": None
    }
    
    return attestation

def resolve_authority_id(authority, matched_id):
    """Map V3 authority references to V4 namespaced IDs"""
    authority_map = {
        'wikidata': 'wikidata:',
        'geonames': 'geonames:',
        'pleiades': 'pleiades:',
        'tgn': 'tgn:',
        'whg': 'things/'  # Internal WHG places
    }
    prefix = authority_map.get(authority.lower(), 'unknown:')
    return f"{prefix}{matched_id}"
```

**Batch migration with validation:**

```python
def migrate_all_close_matches():
    """Migrate all V3 closeMatches to ArangoDB attestations"""
    close_matches = CloseMatch.objects.select_related(
        'place', 'matched_place', 'reviewed_by'
    ).all()
    
    # Build Thing mapping
    v4_thing_map = {}
    for place in Place.objects.all():
        v4_thing_map[place.id] = str(place.id)
    
    attestations = []
    errors = []
    
    for cm in close_matches:
        try:
            attestation = migrate_close_match_to_arangodb(cm, v4_thing_map)
            attestations.append(attestation)
        except Exception as e:
            errors.append({'close_match_id': cm.id, 'error': str(e)})
    
    # Batch insert
    created = batch_index(attestations, 'attestations')
    
    print(f"Migrated {created}/{len(close_matches)} closeMatches")
    print(f"Errors: {len(errors)}")
    
    return {'created': created, 'errors': errors}
```

### Handling Special Cases

**WHG-internal closeMatches (bidirectional):**

```aql
// Query to verify bidirectional same_as relationships
FOR attestation IN attestations
  FILTER attestation.relation_type == "same_as"
  FILTER STARTS_WITH(attestation._from, "things/")
  FILTER STARTS_WITH(attestation._to, "things/")
  
  // Check if reverse edge exists
  LET reverse = FIRST(
    FOR a IN attestations
      FILTER a._from == attestation._to
      FILTER a._to == attestation._from
      FILTER a.relation_type == "same_as"
      RETURN a
  )
  
  FILTER reverse == null
  
  // Create reverse edge if missing
  INSERT {
    _from: attestation._to,
    _to: attestation._from,
    relation_type: "same_as",
    source: ["Inferred bidirectional relationship"],
    certainty: attestation.certainty
  } INTO attestations
```

**Conflicting matches (transitive closure):**

```python
def detect_conflicting_matches():
    """Find cases where A→B and A→C but B and C are not linked"""
    query = """
    FOR a1 IN attestations
      FILTER a1.relation_type == "same_as"
      
      FOR a2 IN attestations
        FILTER a2._from == a1._from
        FILTER a2._to != a1._to
        FILTER a2.relation_type == "same_as"
        
        // Check if B and C are linked
        LET linked = FIRST(
          FOR a3 IN attestations
            FILTER a3._from == a1._to
            FILTER a3._to == a2._to
            FILTER a3.relation_type == "same_as"
            RETURN a3
        )
        
        FILTER linked == null
        
        RETURN {
          subject: a1._from,
          target1: a1._to,
          target2: a2._to,
          certainty1: a1.certainty,
          certainty2: a2.certainty
        }
    """
    
    cursor = db.aql.execute(query)
    conflicts = list(cursor)
    
    print(f"Found {len(conflicts)} potential conflicts requiring review")
    return conflicts
```

### Post-Migration Validation

```python
def validate_closematch_migration():
    """Validate closeMatch migration completeness"""
    # Count V3 closeMatches
    v3_count = CloseMatch.objects.count()
    
    # Count migrated attestations in ArangoDB
    query = """
    FOR a IN attestations
      FILTER STARTS_WITH(a._key, "migrated-cm-")
      COLLECT WITH COUNT INTO count
      RETURN count
    """
    v4_count = db.aql.execute(query).next()
    
    # Check for duplicates
    duplicate_query = """
    FOR a IN attestations
      FILTER STARTS_WITH(a._key, "migrated-cm-")
      COLLECT from = a._from, to = a._to WITH COUNT INTO count
      FILTER count > 1
      RETURN {from, to, count}
    """
    duplicates = list(db.aql.execute(duplicate_query))
    
    # Verify sample matches resolve correctly
    sample_cms = CloseMatch.objects.order_by('?')[:100]
    resolution_errors = 0
    
    for cm in sample_cms:
        query = f"""
        FOR a IN attestations
          FILTER a._key == "migrated-cm-{cm.id}"
          RETURN a
        """
        result = db.aql.execute(query).next()
        if not result:
            resolution_errors += 1
    
    report = {
        'v3_count': v3_count,
        'v4_count': v4_count,
        'migration_rate': v4_count / v3_count if v3_count > 0 else 0,
        'duplicates': len(duplicates),
        'sample_resolution_errors': resolution_errors
    }
    
    print(f"Migration validation: {report}")
    return report
```

## Django Integration

### ArangoDB Connection Setup

```python
# settings.py
ARANGO_CONFIG = {
    'hosts': os.environ.get('ARANGO_HOSTS', 'http://localhost:8529'),
    'username': os.environ.get('ARANGO_USER', 'root'),
    'password': os.environ.get('ARANGO_PASSWORD'),
    'database': os.environ.get('ARANGO_DB', 'whg'),
}

# utils/arango_client.py
from arango import ArangoClient
from django.conf import settings

class ArangoConnection:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            client = ArangoClient(hosts=settings.ARANGO_CONFIG['hosts'])
            cls._instance.db = client.db(
                settings.ARANGO_CONFIG['database'],
                username=settings.ARANGO_CONFIG['username'],
                password=settings.ARANGO_CONFIG['password']
            )
        return cls._instance
    
    @property
    def database(self):
        return self.db

# Usage
arango = ArangoConnection()
db = arango.database
```

### Django Signals for ArangoDB Updates

```python
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .utils.arango_client import arango

@receiver(post_save, sender=Thing)
def sync_thing_to_arango(sender, instance, created, **kwargs):
    """Sync Thing changes to ArangoDB"""
    db = arango.database
    things = db.collection('things')
    
    doc = {
        "_key": str(instance.id),
        "thing_type": instance.thing_type,
        "description": instance.description,
        "namespace": instance.namespace,
        "created": instance.created.isoformat(),
        "modified": instance.modified.isoformat()
    }
    
    if created:
        things.insert(doc)
    else:
        things.update({"_key": str(instance.id)}, doc)

@receiver(post_save, sender=Attestation)
def sync_attestation_to_arango(sender, instance, created, **kwargs):
    """Sync Attestation changes to ArangoDB"""
    db = arango.database
    attestations = db.collection('attestations')
    
    # Determine target collection
    object_collection = get_collection_for_type(instance.object_type)
    
    doc = {
        "_key": str(instance.id),
        "_from": f"things/{instance.subject_id}",
        "_to": f"{object_collection}/{instance.object_id}",
        "relation_type": instance.relation_type,
        "source": instance.source_list,
        "source_type": instance.source_type_list,
        "certainty": instance.certainty,
        "certainty_note": instance.certainty_note,
        "sequence": instance.sequence,
        "connection_metadata": instance.connection_metadata,
        "notes": instance.notes
    }
    
    if created:
        attestations.insert(doc)
    else:
        attestations.update({"_key": str(instance.id)}, doc)
    
    # Update denormalized fields if needed
    if instance.relation_type == "has_name" and instance.certainty >= 0.9:
        update_thing_primary_name(instance.subject_id)

@receiver(post_save, sender=Name)
def sync_name_to_arango(sender, instance, created, **kwargs):
    """Sync Name with embedding to ArangoDB"""
    db = arango.database
    names = db.collection('names')
    
    # Compute embedding if not present
    embedding = instance.embedding
    if not embedding:
        embedding = compute_embedding(instance.name)
        instance.embedding = embedding
        instance.save(update_fields=['embedding'])
    
    doc = {
        "_key": str(instance.id),
        "name": instance.name,
        "language": instance.language,
        "script": instance.script,
        "ipa": instance.ipa,
        "embedding": embedding.tolist() if hasattr(embedding, 'tolist') else embedding,
        "name_type": instance.name_types,
        "romanized": instance.romanized
    }
    
    if created:
        names.insert(doc)
    else:
        names.update({"_key": str(instance.id)}, doc)

@receiver(post_delete, sender=Attestation)
def delete_attestation_from_arango(sender, instance, **kwargs):
    """Delete attestation from ArangoDB"""
    db = arango.database
    attestations = db.collection('attestations')
    attestations.delete({"_key": str(instance.id)})

def update_thing_primary_name(thing_id):
    """Update denormalized primary_name field on Thing"""
    db = arango.database
    
    query = """
    FOR attestation IN attestations
      FILTER attestation._from == @thing_id
      FILTER attestation.relation_type == "has_name"
      SORT attestation.certainty DESC
      LIMIT 1
      
      LET name = DOCUMENT(attestation._to)
      
      UPDATE { _key: @thing_key }
        WITH { primary_name: name.name }
        IN things
      
      RETURN NEW
    """
    
    db.aql.execute(query, bind_vars={
        'thing_id': f"things/{thing_id}",
        'thing_key': str(thing_id)
    })
```

### Django Views for Queries

**Reconciliation API:**

```python
from rest_framework.views import APIView
from rest_framework.response import Response
from .utils.arango_client import arango
from .utils.embeddings import compute_embedding

class ReconciliationView(APIView):
    def post(self, request):
        query_name = request.data.get("name")
        query_date = request.data.get("date")  # optional ISO date
        query_location = request.data.get("location")  # optional [lon, lat]
        
        # Get embedding for query name
        query_embedding = compute_embedding(query_name)
        
        db = arango.database
        
        # Build AQL query
        bind_vars = {
            'query_embedding': query_embedding.tolist(),
            'similarity_threshold': 0.7
        }
        
        aql = """
        FOR name IN names
          LET similarity = APPROX_NEAR_COSINE(name.embedding, @query_embedding)
          FILTER similarity > @similarity_threshold
          SORT similarity DESC
          LIMIT 20
          
          // Find associated Things
          FOR attestation IN INBOUND name attestations
            FILTER attestation.relation_type == "has_name"
            LET thing = DOCUMENT(attestation._from)
        """
        
        # Add temporal filter if date provided
        if query_date:
            aql += """
            LET temporal_valid = (
              FOR v, e, p IN 1..2 OUTBOUND thing attestations
                FILTER p.edges[0].relation_type == "has_timespan"
                LET ts = p.vertices[1]
                FILTER ts.start_latest <= @query_date
                FILTER ts.stop_earliest >= @query_date
                RETURN true
            )
            FILTER LENGTH(temporal_valid) > 0
            """
            bind_vars['query_date'] = query_date
        
        # Add spatial filter if location provided
        if query_location:
            aql += """
            FILTER GEO_DISTANCE(thing.representative_point, @query_location) < 100000
            """
            bind_vars['query_location'] = query_location
        
        aql += """
          RETURN {
            thing_id: thing._key,
            thing_type: thing.thing_type,
            matched_name: name.name,
            primary_name: thing.primary_name,
            similarity: similarity,
            description: thing.description
          }
        """
        
        cursor = db.aql.execute(aql, bind_vars=bind_vars)
        candidates = list(cursor)
        
        return Response({
            'query': query_name,
            'candidates': candidates,
            'count': len(candidates)
        })
```

**Spatial-Temporal Query View:**

```python
class SpatioTemporalSearchView(APIView):
    def get(self, request):
        location = request.query_params.getlist('location')  # [lon, lat]
        radius = int(request.query_params.get('radius', 50000))  # meters
        start_date = request.query_params.get('start')
        end_date = request.query_params.get('end')
        
        if not location or len(location) != 2:
            return Response({'error': 'Invalid location'}, status=400)
        
        location = [float(location[0]), float(location[1])]
        
        db = arango.database
        
        query = """
        FOR thing IN things
          FILTER GEO_DISTANCE(thing.representative_point, @location) <= @radius
          
          LET temporal_valid = (
            FOR v, e, p IN 1..2 OUTBOUND thing attestations
              FILTER p.edges[0].relation_type == "has_timespan"
              LET ts = p.vertices[1]
              FILTER ts.start_latest <= @end_date
              FILTER ts.stop_earliest >= @start_date
              RETURN ts
          )
          
          FILTER LENGTH(temporal_valid) > 0
          
          LET distance = GEO_DISTANCE(thing.representative_point, @location)
          
          SORT distance ASC
          LIMIT 100
          
          RETURN {
            thing: thing,
            distance: distance,
            timespans: temporal_valid
          }
        """
        
        cursor = db.aql.execute(query, bind_vars={
            'location': location,
            'radius': radius,
            'start_date': start_date,
            'end_date': end_date
        })
        
        results = list(cursor)
        
        return Response({
            'results': results,
            'count': len(results),
            'query_params': {
                'location': location,
                'radius': radius,
                'temporal_range': [start_date, end_date]
            }
        })
```

## Monitoring and Performance Tuning

### Key Metrics

**Query Performance:**
- Latency percentiles (p50, p95, p99)
- Throughput (queries per second)
- Query execution plans

**Index Health:**
- Document count per collection
- Index size and memory usage
- Vector index recall metrics

**Resource Usage:**
- CPU utilization
- Memory usage (especially for vector indexes)
- Disk I/O
- Network throughput (for cluster setups)

### ArangoDB Monitoring Setup

```python
# monitoring/arango_metrics.py
from arango import ArangoClient
from prometheus_client import Gauge, Histogram
import time

# Define Prometheus metrics
query_latency = Histogram(
    'arango_query_latency_seconds',
    'Query latency in seconds',
    ['query_type']
)

collection_size = Gauge(
    'arango_collection_documents',
    'Number of documents in collection',
    ['collection']
)

memory_usage = Gauge(
    'arango_memory_bytes',
    'Memory usage in bytes'
)

def collect_metrics():
    """Collect ArangoDB metrics for monitoring"""
    db = arango.database
    
    # Collection sizes
    for collection_name in ['things', 'names', 'geometries', 'timespans', 'attestations']:
        collection = db.collection(collection_name)
        count = collection.count()
        collection_size.labels(collection=collection_name).set(count)
    
    # Memory usage
    stats = db.statistics()
    memory_usage.set(stats.get('system', {}).get('memoryUsage', 0))
```

### Query Optimization Techniques

**Explain plans:**

```python
def explain_query(aql_query, bind_vars=None):
    """Explain query execution plan"""
    db = arango.database
    result = db.aql.explain(aql_query, bind_vars=bind_vars)
    
    print(f"Estimated cost: {result['plan']['estimatedCost']}")
    print(f"Estimated items: {result['plan']['estimatedNrItems']}")
    print("\nExecution nodes:")
    for node in result['plan']['nodes']:
        print(f"  - {node['type']}")
    
    return result
```

**Index usage analysis:**

```aql
// Check which indexes are being used
FOR query IN _queries
  RETURN {
    query: query.query,
    indexes_used: query.indexes
  }
```

**Vector search tuning:**

```javascript
// Tune vector index parameters
db.names.ensureIndex({
  type: "vector",
  fields: ["embedding"],
  params: {
    metric: "cosine",
    dimension: 384,
    lists: 1000,  // Increase for better recall, decrease for speed
    nprobe: 10    // Number of lists to search (higher = better recall, slower)
  }
});
```

### Scaling Strategy

**Vertical Scaling:**
- Increase memory for larger vector indexes (256GB recommended)
- Faster CPUs for vector similarity computations
- NVMe SSDs for faster disk I/O

**Horizontal Scaling (Cluster Mode):**

```javascript
// Configure ArangoDB cluster
// Requires ArangoDB Enterprise Edition

// 3 agents for coordination
// 3+ DBServers for data distribution
// 2+ Coordinators for query load balancing

// Example cluster deployment:
// - 3 agents: 4GB RAM each
// - 3 DBServers: 64GB RAM, 2TB NVMe each
// - 2 Coordinators: 32GB RAM each
```

**Sharding strategy:**

```javascript
// Shard things collection by geographic region
db._create('things', {
  numberOfShards: 9,
  shardKeys: ['region'],  // Add region field for geographic sharding
  replicationFactor: 2
});

// Shard attestations by relation_type
db._createEdgeCollection('attestations', {
  numberOfShards: 6,
  shardKeys: ['relation_type'],
  replicationFactor: 2
});
```

## Summary

### ArangoDB Strengths for WHG

✅ **Native property graph** - Direct mapping to attestation model
✅ **Unified multi-model** - Graph + document + geospatial + vector in single system  
✅ **Superior GeoJSON** - Native support for complex historical geometries  
✅ **Elegant queries** - AQL integrates all capabilities seamlessly  
✅ **Operational simplicity** - Single system for small team  
✅ **Real-time consistency** - No sync issues between systems  
✅ **Flexible schema** - JSON documents adapt easily to evolving requirements

### Key Considerations

⚠️ **Licensing required** - Enterprise Edition needed for production dataset size  
⚠️ **Vector search maturity** - Early benchmarking essential for phonetic embedding workload  
⚠️ **GeometryCollection limitation** - Workaround via multiple attestations (aligns with model)  
⚠️ **Smaller ecosystem** - Fewer third-party tools than PostgreSQL  
⚠️ **Vendor lock-in** - Proprietary AQL creates some switching costs

### Implementation Priorities

1. **Core collections** - Things, Names, Geometries, Timespans, Attestations
2. **Essential indexes** - Vector (FAISS), geospatial, temporal, edge
3. **Django integration** - Signals for real-time sync
4. **Query patterns** - Name resolution, spatio-temporal, vector similarity
5. **Dynamic Clustering** - Multi-dimensional similarity scoring
6. **Migration pipeline** - From Postgres + ElasticSearch
7. **closeMatch migration** - Preserve 38K curated relationships
8. **Monitoring** - Query performance, index health, resource usage
9. **Performance testing** - Validate at production scale
10. **Documentation** - Query examples, operational procedures

### Comparison with Vespa Implementation

| Aspect | ArangoDB | Vespa |
|--------|----------|-------|
| **Data Model Fit** | ✅✅✅ Native graph | ❌ Not a graph DB |
| **GeoJSON Support** | ✅✅✅ Native (6 types) | ❌ None |
| **Query Elegance** | ✅✅✅ Unified AQL | ⚠️ YQL + app logic |
| **Vector Search** | ✅ Good (validate at scale) | ✅✅✅ Best in class |
| **Graph Traversals** | ✅✅✅ Multi-hop native | ❌ Manual implementation |
| **Operational Complexity** | ✅✅✅ Single system | ✅✅✅ Single system |
| **Licensing** | ⚠️ Enterprise required | ✅ Apache 2.0 |
| **Maturity** | ⚠️ Smaller community | ✅ Battle-tested at scale |

**Key Decision Factor:** ArangoDB's native graph model and GeoJSON support make it the superior technical fit for the attestation-based architecture. The primary trade-off is licensing requirements vs. Vespa's open-source model.

### Decision Criteria

**Choose ArangoDB if:**
- Academic/non-commercial licensing can be secured at sustainable cost
- Native graph model is critical for complex relationship queries
- GeoJSON support for historical geometries is essential
- Operational simplicity for small team is high priority
- Vector search performance meets requirements (validate early)

**Choose Vespa if:**
- Licensing sustainability cannot be guaranteed
- Vector search performance is the highest priority
- Willing to implement graph logic at application level
- Willing to encode geometries without native GeoJSON
- Need absolute maximum scale (billions of documents)

**Choose PostgreSQL + Extensions if:**
- Neither ArangoDB nor Vespa licensing/technical fit works
- Long-term sustainability and zero vendor lock-in are paramount
- Willing to accept higher query complexity
- Full GeometryCollection support is required
- Prefer familiar, widely-supported technology

### Next Steps

1. **Licensing discussion** - Negotiate academic terms with ArangoDB
2. **Proof of concept** - Build prototype with representative data
3. **Benchmark vector search** - Test FAISS-backed phonetic embeddings at 10M+ scale
4. **Validate query patterns** - Test combined graph + spatial + temporal + vector queries
5. **Compare with alternatives** - Run same tests on Vespa and PostgreSQL
6. **Capacity planning** - Determine hardware requirements for self-hosted vs. managed
7. **Migration strategy** - Plan phased rollout with validation gates
8. **Training** - Develop AQL expertise and operational procedures
9. **Monitoring setup** - Establish metrics and alerting
10. **Decision point** - Commit to architecture based on validation results

### Risk Mitigation

**Licensing Risk:**
- Maintain PostgreSQL implementation as fallback
- Document migration path from ArangoDB to PostgreSQL if needed
- Negotiate multi-year academic pricing to reduce uncertainty

**Performance Risk:**
- Benchmark early with production-scale data
- Test worst-case query patterns (complex multi-hop + vector + spatial)
- Validate vector index recall and latency trade-offs
- Load test with concurrent users

**Operational Risk:**
- Develop runbooks for common operations
- Set up monitoring and alerting before production
- Train backup personnel on ArangoDB operations
- Consider managed hosting to reduce operational burden

**Vendor Lock-in Risk:**
- Document all AQL queries and conversion patterns
- Maintain abstraction layer in Django for database operations
- Keep schema design portable where possible
- Preserve ability to export all data in standard formats

## Conclusion

ArangoDB represents a compelling alternative to the Vespa-based implementation documented in Section 3.8. Its native multi-model architecture—combining property graphs, documents, geospatial data, and vector embeddings—maps directly to WHG's attestation-based data model without the impedance mismatch present in other approaches.

**Key Technical Advantages:**
- Property graph structure naturally represents attestations as edges with rich metadata
- Native GeoJSON support handles complex historical geometries without encoding
- Unified AQL eliminates the need to combine multiple query languages
- Single integrated system reduces operational complexity for a small team

**Primary Challenge:**
Sustainable licensing for academic use remains the critical dependency. The Community Edition's 100 GiB limit is insufficient for WHG's anticipated 500GB-1TB dataset, requiring Enterprise Edition with negotiated academic terms.

**Recommended Path Forward:**
1. Pursue licensing discussion with ArangoDB as highest priority
2. Conduct proof-of-concept with vector search benchmarking
3. Validate query performance with production-scale data
4. Make architecture decision based on licensing viability and technical validation
5. Maintain PostgreSQL + extensions as documented fallback option

The choice between ArangoDB, Vespa, and PostgreSQL ultimately depends on balancing technical fit, operational simplicity, licensing sustainability, and performance requirements. ArangoDB offers the best technical alignment with the data model, but only if sustainable academic licensing can be established.

---

**Related Documentation:**
- [Database Technology Assessment](https://docs.whgazetteer.org/content/v4/architecture/database.html) - Comprehensive evaluation of all options
- [Implementation in Vespa](https://docs.whgazetteer.org/content/v4/data-model/implementation.html) - Alternative implementation approach
- [WHG v4 Data Model](https://docs.whgazetteer.org/content/v4/data-model.html) - Core data model specification