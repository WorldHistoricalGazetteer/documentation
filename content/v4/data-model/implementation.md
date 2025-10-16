# Implementation in ArangoDB

## Overview

This document details the implementation of the WHG v4 data model using ArangoDB's multi-model architecture. ArangoDB naturally supports the attestation-based graph model through its combination of document collections and edge collections.

## Document Collections

We use six primary collections:

- **things** — unified conceptual entities (locations, historical entities, collections, periods, routes, itineraries, networks)
- **names** — name labels with multiple semantic types and vector embeddings
- **geometries** — spatial representations with derived fields
- **timespans** — temporal bounds with PeriodO integration
- **attestations** (edge collection) — evidentiary relationships connecting Things to Names, Geometries, Timespans, and other Things
- **authorities** — unified reference data for sources, datasets, relation types, periods, and certainty levels

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

### Authorities Collection

```javascript
// Source Authority
{
  "_key": "source-al-tabari",
  "_id": "authorities/source-al-tabari",
  "authority_type": "source",
  "citation": "Al-Tabari, History of the Prophets and Kings",
  "source_type": "manuscript",
  "record_id": "tabari-vol-27",
  "uri": "https://example.org/tabari"
}

// Dataset Authority
{
  "_key": "dataset-islamic-cities",
  "_id": "authorities/dataset-islamic-cities",
  "authority_type": "dataset",
  "title": "Islamic Cities Database",
  "publisher": "University Research Center",
  "version": "1.0",
  "license": "CC-BY-4.0",
  "doi": "doi:10.83427/whg-dataset-123"
}

// Relation Type Authority
{
  "_key": "relation-member-of",
  "_id": "authorities/relation-member-of",
  "authority_type": "relation_type",
  "label": "member_of",
  "inverse": "contains",
  "domain": ["thing"],
  "range": ["thing"],
  "description": "Subject is part of object entity"
}

// Period Authority (from PeriodO)
{
  "_key": "period-abbasid",
  "_id": "authorities/period-abbasid",
  "authority_type": "period",
  "label": "Abbasid Caliphate",
  "uri": "periodo:p0abbasid",
  "start_earliest": -11644444800000,
  "start_latest": -11612908800000,
  "stop_earliest": 693878400000,
  "stop_latest": 694483200000
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
  "sequence": null, // used for routes/itineraries
  "connection_metadata": null, // used for network connections
  "certainty": 1.0,
  "certainty_note": "Official administrative name change",
  "notes": "Official name adopted after establishment of Turkish Republic"
}

// Separate edges for metadata about the attestation
// (Edge type determined by target collection)
{
  "_from": "attestations/attestation-const-name-istanbul",
  "_to": "authorities/source-turkish-gov",
  "edge_type": "sourced_by"
}

{
  "_from": "attestations/attestation-const-name-istanbul",
  "_to": "timespans/timespan-modern-turkey",
  "edge_type": "attests_timespan"
}
```

### Edges Collection

```javascript
// Generic edge collection for all graph relationships
{
  "_key": "edge-001",
  "_id": "edges/edge-001",
  "_from": "things/constantinople",
  "_to": "attestations/attestation-const-name-istanbul",
  "edge_type": "subject_of",
  "created": "2025-01-15T10:30:00Z"
}

{
  "_from": "attestations/attestation-const-name-istanbul",
  "_to": "names/name-istanbul-tr",
  "edge_type": "attests_name"
}

{
  "_from": "attestations/attestation-capital-of",
  "_to": "authorities/relation-capital-of",
  "edge_type": "typed_by"
}

{
  "_from": "attestations/attestation-capital-of",
  "_to": "things/ottoman-empire",
  "edge_type": "relates_to"
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

### Authorities Collection Indexes

```javascript
// Authority type discriminator
db.authorities.ensureIndex({
  type: "persistent",
  fields: ["authority_type"]
});

// Full-text search on title/citation
db.authorities.ensureIndex({
  type: "fulltext",
  fields: ["title", "citation", "label"]
});

// DOI for dataset authorities
db.authorities.ensureIndex({
  type: "persistent",
  fields: ["doi"]
});

// URI for external authorities
db.authorities.ensureIndex({
  type: "persistent",
  fields: ["uri"]
});

// Label for relation types
db.authorities.ensureIndex({
  type: "persistent",
  fields: ["label"]
});
```

### Attestations Collection Indexes

```javascript
// Primary key (automatic)
db.attestations.ensureIndex({ type: "primary", fields: ["_key"] });

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
```

### Edges Collection Indexes

```javascript
// Edge indexes (automatic for _from and _to)
db.edges.ensureIndex({ type: "edge" });

// Edge type for filtering
db.edges.ensureIndex({
  type: "persistent",
  fields: ["edge_type"]
});

// Composite index for efficient traversals
db.edges.ensureIndex({
  type: "persistent",
  fields: ["_from", "edge_type"]
});

db.edges.ensureIndex({
  type: "persistent",
  fields: ["_to", "edge_type"]
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
  
  // Traverse to attestations
  FOR att IN attestations
    FOR e1 IN edges
      FILTER e1._from == thing._id
      FILTER e1._to == att._id
      FILTER e1.edge_type == "subject_of"
      
      // Get the name
      FOR e2 IN edges
        FILTER e2._from == att._id
        FILTER e2.edge_type == "attests_name"
        LET name = DOCUMENT(e2._to)
        
        // Check temporal validity
        FOR e3 IN edges
          FILTER e3._from == att._id
          FILTER e3.edge_type == "attests_timespan"
          LET ts = DOCUMENT(e3._to)
          FILTER ts.start_latest <= query_date
          FILTER ts.stop_earliest >= query_date
          
          RETURN {
            name: name.name,
            language: name.language,
            certainty: att.certainty,
            timespan: ts.label
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
  
  // Verify temporal validity via graph traversal
  LET temporal_check = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        FILTER e1.edge_type == "subject_of"
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "attests_geometry"
          
          FOR e3 IN edges
            FILTER e3._from == att._id
            FILTER e3.edge_type == "attests_timespan"
            LET ts = DOCUMENT(e3._to)
            FILTER ts.start_latest <= query_end
            FILTER ts.stop_earliest >= query_start
            RETURN true
  )
  
  FILTER LENGTH(temporal_check) > 0
  
  // Get full geometries
  LET geometries = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "attests_geometry"
          LET geom = DOCUMENT(e2._to)
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
  
  // Find outgoing attestations
  FOR att IN attestations
    FOR e1 IN edges
      FILTER e1._from == thing._id
      FILTER e1._to == att._id
      FILTER e1.edge_type == "subject_of"
      
      // Check if it's a connection
      FOR e2 IN edges
        FILTER e2._from == att._id
        FILTER e2.edge_type == "typed_by"
        LET rel_type = DOCUMENT(e2._to)
        FILTER rel_type.label == "connected_to"
        FILTER att.connection_metadata LIKE "%trade%"
        
        // Get the connected Thing
        FOR e3 IN edges
          FILTER e3._from == att._id
          FILTER e3.edge_type == "relates_to"
          LET connected_thing = DOCUMENT(e3._to)
          
          // Check temporal validity
          FOR e4 IN edges
            FILTER e4._from == att._id
            FILTER e4.edge_type == "attests_timespan"
            LET ts = DOCUMENT(e4._to)
            FILTER ts.start_latest <= query_end
            FILTER ts.stop_earliest >= query_start
            
            RETURN {
              connected_place: connected_thing,
              connection_type: att.connection_metadata,
              certainty: att.certainty,
              timespan: ts
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
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        FILTER e1.edge_type == "subject_of"
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "attests_name"
          LET name = DOCUMENT(e2._to)
          LET similarity = APPROX_NEAR_COSINE(name.embedding, query_embedding)
          FILTER similarity > 0.8
          SORT similarity DESC
          LIMIT 5
          RETURN {name: name.name, similarity: similarity}
  )
  
  FILTER LENGTH(matching_names) > 0
  
  // Check temporal validity
  LET temporal_valid = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "attests_timespan"
          LET ts = DOCUMENT(e2._to)
          FILTER ts.start_latest <= query_date
          FILTER ts.stop_earliest >= query_date
          RETURN true
  )
  
  FILTER LENGTH(temporal_valid) > 0
  
  // Find trade network partners
  LET trade_partners = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "typed_by"
          LET rel = DOCUMENT(e2._to)
          FILTER rel.label == "connected_to"
          FILTER att.connection_metadata LIKE "%trade%"
          
          // Temporal filter on connections
          FOR e3 IN edges
            FILTER e3._from == att._id
            FILTER e3.edge_type == "attests_timespan"
            LET ts = DOCUMENT(e3._to)
            FILTER ts.start_latest <= query_date
            FILTER ts.stop_earliest >= query_date
            
            FOR e4 IN edges
              FILTER e4._from == att._id
              FILTER e4.edge_type == "relates_to"
              LET partner = DOCUMENT(e4._to)
              RETURN {place: partner, relation: att}
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
- Store PeriodO URIs in AUTHORITY documents
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

### Considerations and Tradeoffs

**Vector Search Maturity:**
- ⚠️ Vector indexes added more recently than core features
- ⚠️ Requires early benchmarking with WHG's phonetic embedding workload
- ⚠️ Validate performance with 10M+ name embeddings

**GeometryCollection Limitation:**
- ❌ Cannot store heterogeneous geometry collections in single document
- ✅ Workaround: Multiple geometry attestations (aligns with attestation model)
- ✅ Alternative: Convert to MultiPolygon by buffering points/lines

**Licensing:**
- ⚠️ Community Edition limited to 100 GiB (insufficient for WHG)
- ⚠️ Enterprise Edition required for production use (expected 500GB-1TB dataset)
- ⚠️ Academic licensing terms require negotiation

**Vendor Ecosystem:**
- ⚠️ Smaller community than PostgreSQL
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
  FOR att IN attestations
    FOR e1 IN edges
      FILTER e1._from == "things/constantinople"
      FILTER e1._to == att._id
      FILTER e1.edge_type == "subject_of"
      
      FOR e2 IN edges
        FILTER e2._from == att._id
        FILTER e2.edge_type == "attests_name"
        
        LET name = DOCUMENT(e2._to)
        FILTER att.certainty >= 0.9
        SORT att.certainty DESC
        LIMIT 1
        
        UPDATE { _key: "constantinople" }
          WITH { primary_name: name.name }
          IN things
        
        RETURN NEW
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
    # Check if this is a geometry attestation
    for edge in Edge.objects.filter(from_id=instance.id, edge_type='attests_geometry'):
        compute_and_store_inherited_geometry(instance.thing_id)
```

### Named Graphs for Domain Separation

ArangoDB supports named graphs to organize different relationship types:

```javascript
// Define named graph for spatial-temporal relationships
db._createGraph('spatio-temporal', [
  {
    collection: 'edges',
    from: ['things', 'attestations'],
    to: ['attestations', 'geometries', 'timespans', 'names', 'authorities']
  }
]);

// Define named graph for network relationships
db._createGraph('networks', [
  {
    collection: 'edges',
    from: ['things', 'attestations'],
    to: ['attestations', 'things', 'authorities']
  }
]);
```

**Query with named graph:**

```aql
FOR v, e, p IN 1..3 OUTBOUND "things/constantinople" 
  GRAPH "networks"
  FILTER p.edges[*].edge_type ALL == "relates_to"
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
- `edges.edge_type`: persistent index
- `authorities.label`: persistent index for relation types

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
  
  // Get detailed geometry via graph traversal
  LET geometries = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "attests_geometry"
          RETURN DOCUMENT(e2._to)
  )
  FILTER LENGTH(geometries) > 0
  
  // Temporal filter via graph traversal
  LET temporal_valid = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "attests_timespan"
          LET ts = DOCUMENT(e2._to)
          FILTER ts.start_latest <= query_end
          FILTER ts.stop_earliest >= query_start
          RETURN ts
  )
  FILTER LENGTH(temporal_valid) > 0
  
  // Phase 2: Similarity scoring
  LET names = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "attests_name"
          LET name = DOCUMENT(e2._to)
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
  
  // Find same_as relationships via graph traversal
  LET same_as_links = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "typed_by"
          LET rel_type = DOCUMENT(e2._to)
          FILTER rel_type.label IN ["same_as", "coextensive_with"]
          FILTER att.certainty >= 0.8
          
          FOR e3 IN edges
            FILTER e3._from == att._id
            FILTER e3.edge_type == "relates_to"
            LET target = DOCUMENT(e3._to)
            
            RETURN {
              target: target,
              relation: rel_type.label,
              certainty: att.certainty
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
    """Transform attestation to node + edges"""
    att_doc = {
        "_key": f"attestation-{attestation.id}",
        "sequence": attestation.sequence,
        "connection_metadata": attestation.connection_metadata,
        "certainty": attestation.certainty,
        "certainty_note": attestation.certainty_note,
        "notes": attestation.notes
    }
    
    # Create edges
    edges = [
        # Thing to Attestation
        {
            "_from": f"things/{attestation.subject_id}",
            "_to": f"attestations/attestation-{attestation.id}",
            "edge_type": "subject_of"
        }
    ]
    
    # Add appropriate edges based on attestation type
    # This would be expanded based on the specific attestation
    
    return att_doc, edges
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
# Attestations require special handling for edges
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

### Migration to ArangoDB Graph Model

**V3 closeMatch → V4 attestation + edges mapping:**

```python
def migrate_close_match_to_arangodb(close_match, v4_thing_map):
    """
    Convert V3 closeMatch to V4 same_as attestation
    
    Args:
        close_match: V3 CloseMatch instance
        v4_thing_map: Dict mapping V3 place IDs to V4 Thing _keys
    """
    subject_key = v4_thing_map[close_match.place.id]
    object_id = resolve_authority_id(
        close_match.authority,
        close_match.matched_id
    )
    
    # Create attestation document
    attestation = {
        "_key": f"migrated-cm-{close_match.id}",
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
    
    # Create AUTHORITY for same_as relation type if not exists
    same_as_authority = {
        "_key": "relation-same-as",
        "authority_type": "relation_type",
        "label": "same_as",
        "inverse": "same_as",
        "description": "Subject represents the same entity as object"
    }
    
    # Create source AUTHORITY
    source_authority = {
        "_key": f"source-whg-v3-cm-{close_match.id}",
        "authority_type": "source",
        "citation": "WHG V3 closeMatch (migrated)",
        "source_type": "dataset",
        "notes": close_match.notes if close_match.notes else ""
    }
    
    # Create edges
    edges = [
        # Thing to Attestation
        {
            "_from": f"things/{subject_key}",
            "_to": f"attestations/migrated-cm-{close_match.id}",
            "edge_type": "subject_of"
        },
        # Attestation to relation type
        {
            "_from": f"attestations/migrated-cm-{close_match.id}",
            "_to": "authorities/relation-same-as",
            "edge_type": "typed_by"
        },
        # Attestation to target
        {
            "_from": f"attestations/migrated-cm-{close_match.id}",
            "_to": object_id,
            "edge_type": "relates_to"
        },
        # Attestation to source
        {
            "_from": f"attestations/migrated-cm-{close_match.id}",
            "_to": f"authorities/source-whg-v3-cm-{close_match.id}",
            "edge_type": "sourced_by"
        }
    ]
    
    return attestation, same_as_authority, source_authority, edges

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
    """Migrate all V3 closeMatches to ArangoDB"""
    close_matches = CloseMatch.objects.select_related(
        'place', 'matched_place', 'reviewed_by'
    ).all()
    
    # Build Thing mapping
    v4_thing_map = {}
    for place in Place.objects.all():
        v4_thing_map[place.id] = str(place.id)
    
    attestations = []
    authorities = {}  # deduplicate authorities
    edges = []
    errors = []
    
    for cm in close_matches:
        try:
            att, same_as_auth, source_auth, att_edges = migrate_close_match_to_arangodb(cm, v4_thing_map)
            attestations.append(att)
            authorities[same_as_auth["_key"]] = same_as_auth
            authorities[source_auth["_key"]] = source_auth
            edges.extend(att_edges)
        except Exception as e:
            errors.append({'close_match_id': cm.id, 'error': str(e)})
    
    # Batch insert
    att_created = batch_index(attestations, 'attestations')
    auth_created = batch_index(list(authorities.values()), 'authorities')
    edge_created = batch_index(edges, 'edges')
    
    print(f"Migrated {att_created}/{len(close_matches)} closeMatches")
    print(f"Created {auth_created} authorities, {edge_created} edges")
    print(f"Errors: {len(errors)}")
    
    return {
        'created': att_created,
        'authorities': auth_created,
        'edges': edge_created,
        'errors': errors
    }
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
    
    # Verify sample matches resolve correctly
    sample_cms = CloseMatch.objects.order_by('?')[:100]
    resolution_errors = 0
    
    for cm in sample_cms:
        query = f"""
        FOR a IN attestations
          FILTER a._key == "migrated-cm-{cm.id}"
          RETURN a
        """
        result = list(db.aql.execute(query))
        if not result:
            resolution_errors += 1
    
    report = {
        'v3_count': v3_count,
        'v4_count': v4_count,
        'migration_rate': v4_count / v3_count if v3_count > 0 else 0,
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
          
          // Find associated Things via graph traversal
          FOR att IN attestations
            FOR e IN edges
              FILTER e._to == att._id
              FILTER e.edge_type == "subject_of"
              
              FOR e2 IN edges
                FILTER e2._from == att._id
                FILTER e2.edge_type == "attests_name"
                FILTER e2._to == name._id
                
                LET thing = DOCUMENT(e._from)
        """
        
        # Add temporal filter if date provided
        if query_date:
            aql += """
            LET temporal_valid = (
              FOR e3 IN edges
                FILTER e3._from == att._id
                FILTER e3.edge_type == "attests_timespan"
                LET ts = DOCUMENT(e3._to)
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

## Summary

### ArangoDB Strengths for WHG

✅ **Native property graph** - Direct mapping to attestation model with Attestations as nodes
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

1. **Core collections** - Things, Names, Geometries, Timespans, Attestations, Authorities, Edges
2. **Essential indexes** - Vector (FAISS), geospatial, temporal, edge
3. **Django integration** - Signals for real-time sync
4. **Query patterns** - Name resolution, spatio-temporal, vector similarity
5. **Dynamic Clustering** - Multi-dimensional similarity scoring
6. **Migration pipeline** - From Postgres + ElasticSearch
7. **closeMatch migration** - Preserve 38K curated relationships
8. **Monitoring** - Query performance, index health, resource usage
9. **Performance testing** - Validate at production scale
10. **Documentation** - Query examples, operational procedures

### Next Steps

1. **Licensing discussion** - Negotiate academic terms with ArangoDB
2. **Proof of concept** - Build prototype with representative data
3. **Benchmark vector search** - Test FAISS-backed phonetic embeddings at 10M+ scale
4. **Validate query patterns** - Test combined graph + spatial + temporal + vector queries
5. **Capacity planning** - Determine hardware requirements
6. **Migration strategy** - Plan phased rollout with validation gates
7. **Training** - Develop AQL expertise and operational procedures
8. **Monitoring setup** - Establish metrics and alerting
9. **Decision point** - Commit to architecture based on validation results

---

**Related Documentation:**
- [Database Technology Assessment](database.md) - Evaluation of database options
- [WHG v4 Data Model Overview](overview.md) - Core data model specification
- [Attestations & Relations](attestations.md) - Detailed attestation patterns