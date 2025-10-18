# Implementation in ArangoDB

## Overview

This document details the implementation of the WHG v4 data model using ArangoDB's multi-model architecture. ArangoDB naturally supports the attestation-based graph model through its combination of document collections and edge collections.

## Document Collections

We use seven primary collections:

- **things** — unified conceptual entities (locations, historical entities, collections, periods, routes, itineraries, networks)
- **names** — name labels with multiple semantic types and vector embeddings
- **geometries** — spatial representations with derived fields
- **timespans** — temporal bounds with PeriodO integration
- **attestations** — evidentiary nodes (document collection) containing metadata about claims
- **edges** — typed connections between all entities (edge collection)
- **authorities** — unified reference data for sources, datasets, relation types, periods, and certainty levels

**Critical Distinction:** 
- **attestations** is a **document collection** (nodes/vertices), NOT an edge collection
- **edges** is the **edge collection** that connects attestations to other entities
- This separation enables attestations to act as junction points in the graph

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
  "end_earliest": 693878400000,      // Unix timestamp: 1453 CE
  "end_latest": 694483200000,        // Unix timestamp: 1453 CE
  "label": "Byzantine Period in Constantinople",
  "precision": "year",
  "precision_value": 1,
  "periodo_id": "periodo:p0byzantine"
}
```

**Field Naming Note:** WHG uses `end_earliest` and `end_latest` (not `stop_earliest`/`stop_latest`) for consistency with W3C Time Ontology. This applies to both internal storage and all exports.

### Attestations Collection (Document Collection)

```javascript
// Document in 'attestations' collection
// This is a DOCUMENT collection, NOT an edge collection
{
  "_key": "att-001",
  "_id": "attestations/att-001",
  "_rev": "_xyz789",
  "sequence": null,                    // For ordered sequences in routes/itineraries
  "connection_metadata": null,         // For network relationships
  "certainty": 0.95,                   // Confidence level (0.0-1.0)
  "certainty_note": "Well-documented in primary sources",
  "notes": "Additional context",
  "created": "2024-01-15T10:30:00Z",
  "modified": "2024-02-20T14:45:00Z",
  "contributor": "researcher@example.edu"
}
```

**What's NOT in attestations:**
- No `_from` or `_to` fields (those are in edges)
- No `subject_id`, `object_id`, or `relation_type` fields
- No embedded relationships

**Relationships are expressed through the edges collection below.**

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
  "end_earliest": 693878400000,
  "end_latest": 694483200000
}
```

### Edges Collection (Edge Collection)

```javascript
// Generic edge collection for ALL graph relationships
// This is an EDGE collection with _from and _to fields

// Thing to Attestation edge
{
  "_key": "edge-001",
  "_id": "edges/edge-001",
  "_from": "things/constantinople",
  "_to": "attestations/att-001",
  "edge_type": "subject_of",
  "created": "2025-01-15T10:30:00Z"
}

// Attestation to Name edge
{
  "_key": "edge-002",
  "_id": "edges/edge-002",
  "_from": "attestations/att-001",
  "_to": "names/name-istanbul-tr",
  "edge_type": "attests_name",
  "created": "2025-01-15T10:30:00Z"
}

// Attestation to Geometry edge
{
  "_key": "edge-003",
  "_id": "edges/edge-003",
  "_from": "attestations/att-001",
  "_to": "geometries/geom-constantinople-city",
  "edge_type": "attests_geometry",
  "created": "2025-01-15T10:30:00Z"
}

// Attestation to Timespan edge
{
  "_key": "edge-004",
  "_id": "edges/edge-004",
  "_from": "attestations/att-001",
  "_to": "timespans/timespan-byzantine-period",
  "edge_type": "attests_timespan",
  "created": "2025-01-15T10:30:00Z"
}

// Attestation to Source (Authority) edge
{
  "_key": "edge-005",
  "_id": "edges/edge-005",
  "_from": "attestations/att-001",
  "_to": "authorities/source-al-tabari",
  "edge_type": "sourced_by",
  "created": "2025-01-15T10:30:00Z"
}

// Thing-to-Thing relationship via attestation
{
  "_key": "edge-006",
  "_id": "edges/edge-006",
  "_from": "attestations/att-capital-of",
  "_to": "authorities/relation-capital-of",
  "edge_type": "typed_by",
  "created": "2025-01-15T10:30:00Z"
}

{
  "_key": "edge-007",
  "_id": "edges/edge-007",
  "_from": "attestations/att-capital-of",
  "_to": "things/ottoman-empire",
  "edge_type": "relates_to",
  "created": "2025-01-15T10:30:00Z"
}

// Meta-attestation edge
{
  "_key": "edge-008",
  "_id": "edges/edge-008",
  "_from": "attestations/att-meta",
  "_to": "attestations/att-001",
  "edge_type": "meta_attestation",
  "properties": {
    "meta_type": "contradicts"
  },
  "created": "2025-01-15T10:30:00Z"
}
```

**Edge Types Summary:**

| Edge Type | From | To | Purpose |
|-----------|------|-----|---------|
| `subject_of` | Thing | Attestation | Links attestation to the Thing it describes |
| `attests_name` | Attestation | Name | Links attestation to a Name claim |
| `attests_geometry` | Attestation | Geometry | Links attestation to a Geometry claim |
| `attests_timespan` | Attestation | Timespan | Links attestation to temporal bounds |
| `sourced_by` | Attestation | Authority | Links attestation to source citation |
| `typed_by` | Attestation | Authority | Links attestation to relation type definition |
| `relates_to` | Attestation | Thing | Links attestation to related Thing |
| `meta_attestation` | Attestation | Attestation | Links meta-attestation to target attestation |
| `part_of` | Authority | Authority | Links Source to parent Dataset |

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
  fields: ["start_latest", "end_earliest"]
});

// Temporal bounds for overlap queries
db.timespans.ensureIndex({
  type: "persistent",
  fields: ["start_earliest", "end_latest"]
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

// Created timestamp for temporal queries
db.attestations.ensureIndex({
  type: "persistent",
  fields: ["created"]
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
  
  // Traverse to attestations via edges
  FOR e1 IN edges
    FILTER e1._from == thing._id
    FILTER e1.edge_type == "subject_of"
    LET att = DOCUMENT(e1._to)
    
    // Get the name via edges
    FOR e2 IN edges
      FILTER e2._from == att._id
      FILTER e2.edge_type == "attests_name"
      LET name = DOCUMENT(e2._to)
      
      // Check temporal validity via edges
      FOR e3 IN edges
        FILTER e3._from == att._id
        FILTER e3.edge_type == "attests_timespan"
        LET ts = DOCUMENT(e3._to)
        FILTER ts.start_latest <= query_date
        FILTER ts.end_earliest >= query_date
        
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
    FOR e1 IN edges
      FILTER e1._from == thing._id
      FILTER e1.edge_type == "subject_of"
      LET att = DOCUMENT(e1._to)
      
      FOR e2 IN edges
        FILTER e2._from == att._id
        FILTER e2.edge_type == "attests_geometry"
        
        FOR e3 IN edges
          FILTER e3._from == att._id
          FILTER e3.edge_type == "attests_timespan"
          LET ts = DOCUMENT(e3._to)
          FILTER ts.start_latest <= query_end
          FILTER ts.end_earliest >= query_start
          RETURN true
  )
  
  FILTER LENGTH(temporal_check) > 0
  
  // Get full geometries
  LET geometries = (
    FOR e1 IN edges
      FILTER e1._from == thing._id
      FILTER e1.edge_type == "subject_of"
      LET att = DOCUMENT(e1._to)
      
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
  
  // Find outgoing attestations via edges
  FOR e1 IN edges
    FILTER e1._from == thing._id
    FILTER e1.edge_type == "subject_of"
    LET att = DOCUMENT(e1._to)
    
    // Check if it's a connection via typed_by edge
    FOR e2 IN edges
      FILTER e2._from == att._id
      FILTER e2.edge_type == "typed_by"
      LET rel_type = DOCUMENT(e2._to)
      FILTER rel_type.label == "connected_to"
      FILTER att.connection_metadata LIKE "%trade%"
      
      // Get the connected Thing via relates_to edge
      FOR e3 IN edges
        FILTER e3._from == att._id
        FILTER e3.edge_type == "relates_to"
        LET connected_thing = DOCUMENT(e3._to)
        
        // Check temporal validity via attests_timespan edge
        FOR e4 IN edges
          FILTER e4._from == att._id
          FILTER e4.edge_type == "attests_timespan"
          LET ts = DOCUMENT(e4._to)
          FILTER ts.start_latest <= query_end
          FILTER ts.end_earliest >= query_start
          
          RETURN {
            connected_place: connected_thing,
            connection_type: att.connection_metadata,
            certainty: att.certainty,
            timespan: ts
          }
```

## Handling Temporal Nulls and Geological Time

### Sentinel Values

For `start_earliest`, `start_latest`, `end_earliest`, `end_latest` fields representing infinity or deep time:

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
  FILTER ts.end_earliest >= @query_date
  RETURN ts

// Overlap query
FOR ts IN timespans
  FILTER ts.start_latest <= @query_end
  FILTER ts.end_earliest >= @query_start
  RETURN ts

// Unknown bounds handling
FOR ts IN timespans
  FILTER (ts.start_earliest == null OR ts.start_earliest <= @query_date)
  FILTER (ts.end_latest == null OR ts.end_latest >= @query_date)
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

## Summary

### ArangoDB Strengths for WHG

✅ **Native property graph** - Direct mapping to attestation model with Attestations as document nodes
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

1. **Core collections** - Things, Names, Geometries, Timespans, Attestations (documents), Edges, Authorities
2. **Essential indexes** - Vector (FAISS), geospatial, temporal, edge
3. **Django integration** - Signals for real-time sync
4. **Query patterns** - Name resolution, spatio-temporal, vector similarity
5. **Dynamic Clustering** - Multi-dimensional similarity scoring
6. **Migration pipeline** - From Postgres + ElasticSearch
7. **closeMatch migration** - Preserve 38K curated relationships
8. **Monitoring** - Query performance, index health, resource usage
9. **Performance testing** - Validate at production scale
10. **Documentation** - Query examples, operational procedures

---

**Related Documentation:**
- [WHG v4 Data Model Overview](overview.md) - Core data model specification
- [Attestations & Relations](attestations.md) - Detailed attestation patterns