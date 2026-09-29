# Implementation in ArangoDB

```{admonition} Archived: the 2025 v4 design
:class: warning
This page belongs to the **2025 design** for WHG v4, which was superseded in 2026. It describes
features and an architecture that WHG v4 does not have. For the current guide, see the
[User Guide](../userguide_index.md).
```

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
  "label": "Constantinople", // denormalized for quick access
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
  "toponym": "İstanbul",
  "language": "tr",
  "script": "Latn",
  "ipa": "isˈtanbuɫ",
  "nameType": ["preferred", "toponym"],
  "nameEmbedding": [0.234, -0.567, 0.123, ...], // 256-dimensional vector
  "transliterationSystem": null,
  "romanized": "Istanbul"
}
```

### Geometries Collection

```javascript
// Document in 'geometries' collection
{
  "_key": "geom-constantinople-city",
  "_id": "geometries/geom-constantinople-city",
  "geojson": {
    "type": "MultiPolygon",
    "coordinates": [
      [[[28.94, 41.01], [29.00, 41.01], [29.00, 41.05], [28.94, 41.05], [28.94, 41.01]]],
      [[[28.90, 41.00], [28.92, 41.00], [28.92, 41.02], [28.90, 41.02], [28.90, 41.00]]]
    ]
  },
  "reprPoint": [28.97, 41.03],
  "bbox": [28.90, 41.00, 29.00, 41.05],
  "spatialPrecision": ["historical_approximate", "uncertain_boundary"],
  "precisionKm": [5.0, 2.0],
  "sourceCrs": "EPSG:4326"
}
```

**Note on GeometryCollection:** ArangoDB does not support the GeoJSON `GeometryCollection` type. For places with heterogeneous geometry sets (e.g., both point and polygon), store multiple geometry attestations—one per geometry type. This aligns naturally with our attestation model where each geometry claim is a separate evidential statement.

### Timespans Collection

```javascript
// Document in 'timespans' collection
{
  "_key": "timespan-byzantine-period",
  "_id": "timespans/timespan-byzantine-period",
  "startEarliest": -11644444800000, // Unix timestamp: 330 CE
  "startLatest": -11612908800000,   // Unix timestamp: 331 CE
  "endEarliest": 693878400000,      // Unix timestamp: 1453 CE
  "endLatest": 694483200000,        // Unix timestamp: 1453 CE
  "label": "Byzantine Period in Constantinople",
  "precision": "year",
  "precisionValue": 1,
  "periodoUri": "periodo:p0byzantine"
}
```

### Attestations Collection (Document Collection)

```javascript
// Document in 'attestations' collection
// This is a DOCUMENT collection, NOT an edge collection
{
  "_key": "att-001",
  "_id": "attestations/att-001",
  "_rev": "_xyz789",
  "sequence": null,                    // For ordered sequences in routes/itineraries
  "certainty": 0.95,                   // Confidence level (0.0-1.0)
  "certaintyNote": "Well-documented in primary sources",
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
  "authorityType": "source",
  "citation": "Al-Tabari, History of the Prophets and Kings",
  "source_type": "manuscript",
  "record_id": "tabari-vol-27",
  "uri": "https://example.org/tabari"
}

// Dataset Authority
{
  "_key": "dataset-islamic-cities",
  "_id": "authorities/dataset-islamic-cities",
  "authorityType": "dataset",
  "title": "Islamic Cities Database",
  "publisher": "University Research Center",
  "version": "1.0",
  "licence": "CC-BY-4.0",
  "doi": "doi:10.83427/whg-dataset-123"
}

// Relation Type Authority
{
  "_key": "relation-member-of",
  "_id": "authorities/relation-member-of",
  "authorityType": "relationType",
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
  "authorityType": "period",
  "label": "Abbasid Caliphate",
  "uri": "periodo:p0abbasid",
  "startEarliest": -11644444800000,
  "startLatest": -11612908800000,
  "endEarliest": 693878400000,
  "endLatest": 694483200000
}
```

### Edges Collection (Edge Collection)

```javascript
// Generic edge collection for ALL graph relationships
// This is an EDGE collection with _from and _to fields

// Attestation to Thing edge
{
  "_key": "edge-001",
  "_id": "edges/edge-001",
  "_from": "attestations/att-001",
  "_to": "things/constantinople",
  "edge_type": "attests_about",
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
  "edge_type": "has_relation_type",
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
| `attests_about` | Attestation | Thing | Links attestation to the Thing it describes |
| `attests_name` | Attestation | Name | Links attestation to a Name claim |
| `attests_geometry` | Attestation | Geometry | Links attestation to a Geometry claim |
| `attests_timespan` | Attestation | Timespan | Links attestation to temporal bounds |
| `sourced_by` | Attestation | Authority | Links attestation to source citation |
| `attests_type` | Attestation | Type | Links attestation to a classification (Type) |
| `has_relation_type` | Attestation | RelationType | Links attestation to relation type definition |
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

// Vector index for phonetic similarity (FAISS-backed)
db.names.ensureIndex({
  type: "vector",
  fields: ["embedding"],
  params: {
    metric: "cosine",
    dimension: 256,
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

## Query Patterns

Common queries combine traversal from a SpatialEntity through its Attestations with filters on Names, Geometries, Timespans and RelationTypes. Each pattern below describes what the query finds and which entities and properties it passes through.

### Name Resolution Over Time

**Query:** "What was Chang'an called in 700 AD?"

Start from the SpatialEntity for Chang'an and collect every Attestation that `attests_about` it. From each, follow `attests_name` to the Name and `attests_timespan` to the Timespan, keeping only Attestations whose Timespan certainly includes 700 CE: its `start_latest` is no later than 700 and its `end_earliest` no earlier. The answer lists each Name with its language, the Timespan's label and the Attestation's `certainty`.

### Spatial Queries with Temporal Filter

**Query:** "Places within 100km of Constantinople in the 13th century"

1. Narrow the candidates to SpatialEntities located within 100 km of Constantinople.
2. For each candidate, look at the Attestations that `attests_about` it and keep the candidate only if at least one of them both `attests_geometry` a Geometry and `attests_timespan` a Timespan overlapping 1200–1300 (`start_latest` no later than 1300, `end_earliest` no earlier than 1200).
3. Return each remaining SpatialEntity with its distance from Constantinople and those of its attested Geometries that lie within the 100 km radius.

### Vector Similarity Search for Toponyms

**Query:** "Find names similar to 'Chang'an' across languages"

Each Name can carry a `nameEmbedding`, a vector representing its sound. Compare the embedding of "Chang'an" with those of all Names, keep the Names whose cosine similarity exceeds 0.8, and return the ten closest with their language, script, `nameType` and similarity score.

**Important:** at scale this search must use an approximate nearest-neighbour index; comparing the query against every Name's embedding will be much slower.

### Network Connection Query

**Query:** "All connections from Constantinople 1200-1300 CE"

Start from Constantinople and find the Attestations that `attests_about` it and whose `has_relation_type` is the RelationType `connected_to`. Follow each one's `relates_to` to the connected SpatialEntity, keep the connections whose `attests_timespan` overlaps 1200–1300, and return each connected SpatialEntity with the Attestation's `certainty` and Timespan.

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

Timespans are matched against a query date or range by comparing their four bounds:

- **Point in time:** a Timespan certainly includes a date when its `start_latest` is on or before the date and its `end_earliest` is on or after it.
- **Overlap with a range:** a Timespan overlaps a range when its `start_latest` is on or before the end of the range and its `end_earliest` is on or after its start.
- **Unknown bounds:** to include Timespans that may have included a date, compare the outer bounds instead and treat a missing bound as open: `start_earliest` is absent or on or before the date, and `end_latest` is absent or on or after it.

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

**Vector/Phonetic Search:**
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