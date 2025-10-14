# Database Technology Assessment <img src="https://img.shields.io/badge/upcoming-v4.0--beta-blue">

## TL;DR

**WHG v4** is transitioning to a property graph data model centered on attestations (source-backed claims about historical places). We need a database that natively supports:
- Property graphs with rich edge metadata
- GeoJSON geometries for complex historical boundaries
- Vector similarity search for phonetic name matching
- Temporal queries
- Single integrated system (solo technical team)

**Assessment finding**: **ArangoDB is the optimal technical fit** - native multi-model architecture matches our requirements precisely, operational simplicity suits our team size, and superior GeoJSON support handles complex historical geometries.

**Critical dependency**: Sustainable licensing for academic/non-commercial research infrastructure funded primarily by University of Pittsburgh with grant support.

**Alternative**: PostgreSQL with extensions provides fallback but requires accepting greater complexity.

**Hosting**: Prefer self-hosted at Pitt, but open to ArangoDB-managed solution depending on terms.

**Next step**: Licensing discussion to determine viability.

**Data model details**: See [WHG v4 Data Model Documentation](https://docs.whgazetteer.org/content/v4/data-model.html)

---

## Executive Summary

The World Historical Gazetteer (WHG) is undergoing a fundamental redesign of its data model for v4, transitioning from a traditional relational structure to a property graph model centered on attestations. This document evaluates database technologies suitable for this new architecture.

**What is WHG?**
- Free, open-access research infrastructure for historical geography
- Serves researchers worldwide with temporal-aware place data
- Supports discovery, linking, and analysis of historical place information
- Non-commercial academic project

**Understanding the Data Model**

WHG v4 is built around **Things** (entities such as locations, historical entities, collections, periods, routes, itineraries, and networks) connected through **Attestations** (source-backed claims with temporal bounds and certainty assessments).

**Complete technical details**: [WHG v4 Data Model Documentation](https://docs.whgazetteer.org/content/v4/data-model.html)

**Key concepts**:
- **Thing**: Any entity that can be described (what we used to call "places" but now expanded)
- **Attestation**: A claim connecting a Thing to information (names, geometries, timespans, types, or other Things)
- **Provenance**: Every claim cites sources, has certainty assessment, and temporal bounds
- **Graph structure**: Attestations form edges in a property graph where nodes are Things, Names, Geometries, and Timespans

**Current Status**: Previous documentation references Vespa as the intended backend. However, the shift to an attestation-based graph model requires reassessment of technology choices.

**Key Requirements**:
- Property graph with rich edge properties (attestations)
- Native GeoJSON support for complex historical geometries
- Vector similarity search for phonetic name matching across scripts/languages
- Temporal query capabilities
- Single integrated system (critical for small technical team)
- Sustainable licensing for academic/non-commercial use

**Project Context**:
- **Funding**: Primarily supported by University of Pittsburgh with grant funding
- **Technical Team**: Currently one developer
- **Scale**: Anticipated 500GB-1TB working dataset, 73M+ nodes
- **Mission**: Free, open-access research infrastructure for historical geography
- **Hosting**: Intended self-hosted at University of Pittsburgh infrastructure

## Data Volume Projection

### Source Data Estimates

| Source | Records | Avg Size | Total |
|--------|---------|----------|-------|
| GeoNames | 12M | 2KB | 24GB |
| OpenStreetMap (subset) | 50M | 1KB | 50GB |
| Wikidata Places | 10M | 3KB | 30GB |
| Pleiades | 38K | 50KB | 2GB |
| Contributed Data | 1-5M | 10KB | 10-50GB |
| **Subtotal** | **~73M** | - | **116-156GB** |

### WHG Attestation Layer

Per Thing averages:
- 5 name attestations × 1KB = 5KB
- 2 geometry attestations × 2KB = 4KB
- 3 timespan attestations × 0.5KB = 1.5KB
- 5 relation attestations × 1KB = 5KB
- 2 type attestations × 0.5KB = 1KB

**Attestation overhead**: 73M Things × 16.5KB = **~1.2TB**

### Total Storage Requirements

**Raw data**: 116-156GB + 1.2TB = **~1.3-1.4TB**
**With compression** (2-3x typical): **500-700GB**
**With indexes** (vector, spatial, full-text): **+300GB**

**Final estimate**: **800GB - 1TB** working set

### Growth Projections

**Year 1**: 800GB-1TB
**Year 3**: 1.5-2TB (with new contributions)
**Year 5**: 2.5-3TB (if major datasets added)

## Option 1: ArangoDB

### Technical Advantages

**1. Optimal Data Model Alignment**

ArangoDB's native multi-model architecture (graph + document + geospatial) maps directly to WHG's attestation model:

```javascript
// Things as documents with graph capabilities
{
    "_key": "constantinople",
    "_id": "things/constantinople",
    "thing_type": "location",
    "description": "Major Byzantine/Ottoman city on the Bosphorus"
}

// Attestations as graph edges with properties
{
    "_from": "things/constantinople",
    "_to": "names/istanbul",
    "relation_type": "has_name",
    "source": ["Turkish Geographic Board decision", "1930"],
    "certainty": 1.0,
    "timespan": {
    "start_earliest": "1930-01-01",
        "stop_latest": null
}
}
```

This eliminates impedance mismatch between application logic and database structure.

**2. Superior GeoJSON Support**

ArangoDB provides native GeoJSON storage and querying with support for Point, MultiPoint, LineString, MultiLineString, Polygon, and MultiPolygon types:

```javascript
// Store complex geometries
db.things.insert({
    _key: "constantinople",
    geometry: {
        type: "MultiPolygon",
        coordinates: [
            // First polygon: city center
            [[
                [28.94, 41.01],
                [29.00, 41.01],
                [29.00, 41.05],
                [28.94, 41.05],
                [28.94, 41.01]
            ]],
            // Second polygon: disputed boundary region
            [[
                [28.90, 41.00],
                [28.92, 41.00],
                [28.92, 41.02],
                [28.90, 41.02],
                [28.90, 41.00]
            ]]
        ]
    }
})

// Geospatial queries
db.things.find({
    geometry: {
        $geoWithin: {
            $geometry: queryPolygon
        }
    }
})
```

**Key advantages**:
- S2-based geospatial indexing for spherical geometry
- Supports all standard GeoJSON types (Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon)
- Native handling of complex historical geometries without conversion
- No encoding or workarounds required

**Note on GeometryCollection**: ArangoDB does not support the GeometryCollection type. For WHG data containing heterogeneous geometry sets (e.g., a place represented by both a point and a polygon), we would either:
- Store multiple geometry attestations (one per geometry type) - aligns naturally with our attestation model
- Convert to MultiPolygon by buffering points and lines into small polygons where single-geometry representation is required

**Comparison**: PostgreSQL PostGIS supports GeometryCollection natively; Neo4j spatial plugin has limited GeoJSON support; Vespa has no GeoJSON support.

**3. Unified Query Language (AQL)**

AQL integrates graph traversal, document filtering, geospatial queries, and vector similarity in a single, coherent language:

```aql
// Complex query combining multiple capabilities
FOR thing IN Things
  // Vector similarity search (index-accelerated with FAISS)
  LET similarity = APPROX_NEAR_COSINE(thing.name_embedding, @query_embedding)
  FILTER similarity > 0.8
  SORT similarity DESC
  
  // Geospatial constraint
  FILTER GEO_DISTANCE(thing.geometry, @query_point) < 50000
  
  // Graph traversal for network relationships
  LET partners = (
    FOR v, e IN 1..3 OUTBOUND thing Attestations
      FILTER e.relation_type == "connected_to"
      FILTER e.timespan.start_earliest <= @query_end
      FILTER e.timespan.stop_latest >= @query_start
      RETURN {place: v, relation: e}
  )
  
  LIMIT 10
  RETURN {
    thing: thing,
    similarity: similarity,
    trade_partners: partners
  }
```

This eliminates the need to combine multiple query languages or systems.

**4. Operational Simplicity**

**Critical for small team**: Single system handles:
- ✅ Graph queries (paths, networks, traversals)
- ✅ Document search (full-text, filtering)
- ✅ Vector similarity (name matching)
- ✅ Geospatial (GeoJSON native)
- ✅ Temporal queries (JSON documents)

**Impact**:
- One database to maintain and monitor
- Single backup/recovery strategy
- Unified deployment process
- No data synchronization between systems
- Reduced cognitive load for solo developer

**5. JSON-Native Architecture**

Every node is a JSON document, matching WHG's data modeling approach and facilitating:
- Flexible schema evolution
- Natural representation of complex temporal structures
- Direct mapping from [Linked Places Format (LPF)](https://github.com/LinkedPasts/linked-places-format)
- Easy integration with Django REST framework

**6. Vector Indexes for Phonetic Name Matching**

ArangoDB provides vector indexes for approximate nearest neighbor search, powered by the FAISS library:

```javascript
db.names.ensureIndex({
  type: "vector",
  fields: ["embedding"],
  params: {
    metric: "cosine",
    dimension: 384  // or dimension appropriate for model
  }
})
```

**AQL Vector Search** uses the `APPROX_NEAR_COSINE()` function for index-accelerated queries:

```aql
FOR name IN names
  LET similarity = APPROX_NEAR_COSINE(name.embedding, @query_embedding)
  SORT similarity DESC
  LIMIT 10
  RETURN {name: name.name, similarity: similarity}
```

**WHG Use Case**: Our embeddings are derived from **phonetic representations of toponyms** combined with **orthographical metadata** (script, language, transliteration). This enables matching of:
- Names across different scripts (e.g., "Constantinople" ↔ "Κωνσταντινούπολις" ↔ "القسطنطينية")
- Transliteration variations (e.g., "Samarkand" ↔ "Samarqand" ↔ "Самарканд")
- Historical name forms that sound similar but are spelled differently

**Scale**: Name similarity search across 10M+ name variants with phonetic embeddings.

**Note**: AQL also provides a non-indexed `COSINE_SIMILARITY()` function for exact similarity calculations, but `APPROX_NEAR_COSINE()` is the index-accelerated function required for performance at scale. ArangoDB's vector search capabilities were added more recently than its core graph and geospatial features, so early benchmarking with WHG's specific phonetic embedding workload is recommended to validate performance characteristics.

### Deployment Considerations

**Preferred Approach: Self-Hosted at University of Pittsburgh**

WHG intends to host ArangoDB on University of Pittsburgh infrastructure:

**Hardware Requirements** (estimated for 1TB working set):
- **CPU**: 16-32 cores for query parallelization and indexing
- **RAM**: 128-256GB
    - Minimum: 128GB (for reasonable in-memory operations)
    - Recommended: 256GB (for optimal performance with vector indexes)
    - Working set should fit in memory for best performance
- **Storage**:
    - Primary: 5-10TB NVMe SSD (for database, indexes, growth)
    - Backup: Additional storage for snapshots
- **Network**: High-bandwidth internal network for cluster coordination (if clustered)

**Software Requirements**:
- Linux (Ubuntu 20.04+ or RHEL 8+)
- ArangoDB Enterprise Edition
- Monitoring tools (Prometheus, Grafana)

**Operational Requirements**:
- System administration support from Pitt IT
- Backup infrastructure (automated snapshots, offsite replication)
- Monitoring and alerting
- Security updates and maintenance

**Alternative: ArangoDB-Managed Hosting**

Given practical considerations, we are **open to ArangoDB-managed hosting** (ArangoGraph or similar) as an alternative to self-hosting.

**Benefits of managed hosting**:
- Reduces operational burden on solo developer
- Professional database administration
- Automated backups and updates
- Better resource scaling
- Faster time to production

**Consideration**: Managed hosting pricing should be part of licensing discussion, as it may provide better total cost of ownership than self-hosted given staffing constraints.

### Limitations

**1. Licensing Constraints**

**Community Edition** (v3.12+):
- 100 GiB dataset limit per cluster
- Restricted to non-commercial use under BSL 1.1
- **Insufficient for WHG** (requires 500GB-1TB)

**Enterprise Edition**:
- Required for WHG's dataset size
- Licensing terms require negotiation
- Academic/non-commercial pricing available but not published
- **Uncertainty** in long-term cost sustainability

**2. GeometryCollection Not Supported**

ArangoDB does not support the GeoJSON GeometryCollection type. For WHG:
- **Workaround**: Store separate geometry attestations for each geometry type (aligns with our attestation model)
- **Alternative**: Convert to MultiPolygon where needed by buffering points/lines
- **Impact**: Minimal - our attestation model naturally accommodates multiple geometries per Thing

**3. Vendor Ecosystem**

- Smaller community than PostgreSQL or Neo4j
- Proprietary query language (AQL) creates some lock-in
- Fewer third-party tools and integrations
- Limited pool of developers with ArangoDB experience

**4. Vector Search Maturity**

- Vector indexes powered by FAISS library
- Index-accelerated similarity search via `APPROX_NEAR_COSINE()` function
- Less battle-tested than specialized systems (Vespa, pgvector) for very large vector datasets
- Performance characteristics at 10M+ vectors should be validated
- **Critical: Early benchmarking with WHG's phonetic embedding workload (10M+ name variants) is essential to validate that performance meets requirements before committing to this architecture**

### Assessment for WHG

ArangoDB represents the **best technical fit** for WHG's requirements:
- Direct data model mapping
- Excellent GeoJSON support (covering our needs despite GeometryCollection limitation)
- Unified architecture for small team
- Scales to anticipated dataset size
- Single system reduces operational complexity

**Critical question**: Can sustainable licensing be negotiated for academic/research use?

---

## Option 2: PostgreSQL + Extensions

### Architecture

**PostgreSQL 16+** with:
- **PostGIS**: Geospatial (GeoJSON, spatial indexes)
- **pgvector**: Vector similarity search (embeddings)
- **Apache AGE**: Graph database (Cypher-compatible queries)
- **pg_trgm**: Fuzzy text matching
- **Full-text search**: Built-in (tsquery/tsvector)

### Advantages

**1. Licensing & Sustainability** ⭐

- PostgreSQL License (permissive, OSI-approved)
- No dataset size limits
- No commercial restrictions
- No vendor lock-in
- Sustainable for academic use indefinitely

**2. Proven at Scale**

- Powers massive applications (Instagram, Spotify, Reddit)
- Organizations successfully run multi-TB Postgres deployments
- Excellent query optimizer
- Mature partitioning and sharding
- 30+ years of continuous development

**3. Excellent Geospatial (PostGIS)**

- Industry standard for GIS
- Full GeoJSON support: `geometry(GEOMETRY, 4326)` columns
- **Supports GeometryCollection**: Can store heterogeneous geometry types per record
- Sophisticated spatial indexing (GIST, SP-GIST)
- Rich spatial functions
- **Superior to ArangoDB for GeometryCollection support**

Example:
```sql
-- Store GeoJSON including GeometryCollection
CREATE TABLE geometries (
  id UUID PRIMARY KEY,
  geom GEOMETRY(GEOMETRYCOLLECTION, 4326),
  precision VARCHAR(20)
);

INSERT INTO geometries VALUES (
  gen_random_uuid(),
  ST_GeomFromGeoJSON('{
    "type": "GeometryCollection",
    "geometries": [
      {"type": "Point", "coordinates": [28.98, 41.01]},
      {"type": "Polygon", "coordinates": [[[28.94, 41.01], ...]]}
    ]
  }'),
  'mixed'
);

-- Geospatial query
SELECT * FROM geometries
WHERE ST_DWithin(
  geom,
  ST_SetSRID(ST_MakePoint(28.98, 41.01), 4326),
  50000  -- 50km
);
```

**4. Strong Vector Search (pgvector)**

- HNSW indexes for approximate nearest neighbor search
- Handles millions of vectors efficiently
- Active development (major improvements 2023-2024)
- Mature enough for production use
- **Suitable for phonetic name embeddings**

Example:
```sql
CREATE TABLE names (
  id UUID PRIMARY KEY,
  name TEXT,
  phonetic_embedding vector(384)  -- from phonetic representation
);

CREATE INDEX ON names USING hnsw (phonetic_embedding vector_cosine_ops);

-- Phonetic similarity query
SELECT name, 1 - (phonetic_embedding <=> query_vector) AS similarity
FROM names
ORDER BY phonetic_embedding <=> query_vector
LIMIT 10;
```

**5. Massive Ecosystem**

- Huge community (largest of any database)
- Extensive tooling (monitoring, backup, replication)
- Universal hosting provider support
- Easy to recruit developers
- Abundant learning resources
- Well-known to university IT departments

### Deployment Considerations

**Self-Hosted at University of Pittsburgh**

**Hardware Requirements** (for 1TB working set):
- **CPU**: 16-32 cores
- **RAM**: 128-256GB
    - Recommended: 256GB for multiple large indexes (PostGIS, pgvector, AGE)
- **Storage**: 5-10TB NVMe SSD
- **Note**: May require more resources than ArangoDB due to extension overhead

**Software Requirements**:
- Linux (Ubuntu 20.04+ or RHEL 8+)
- PostgreSQL 16+
- PostGIS extension
- pgvector extension
- Apache AGE extension
- Connection pooler (PgBouncer)
- Monitoring (PostgreSQL-specific tools well-established)

### Limitations

**1. Graph Queries Less Elegant**

Apache AGE provides Cypher queries over PostgreSQL, but:

- Newer extension (2021), less mature than Neo4j
- Graph traversals slower than native graph databases
- Combining SQL and Cypher requires switching contexts
- Multi-hop queries can require careful optimization

**2. Multi-Extension Complexity**

Three extensions to coordinate (PostGIS, pgvector, AGE), each with its own query patterns, index types, and performance characteristics.

**Impact**: More cognitive overhead than unified system, though manageable.

**3. Unified Query Complexity**

Combining all capabilities requires mixing SQL, Cypher, and spatial functions - significantly more verbose than ArangoDB's unified AQL.

**4. Graph Performance Ceiling**

- Not optimized for graph traversals
- Deep graph queries (4+ hops) may require denormalization
- Network analysis algorithms less efficient than Neo4j

### Assessment for WHG

PostgreSQL provides a **viable alternative** with:
- ✅ Guaranteed sustainability (free, permissive license)
- ✅ All required capabilities (including GeometryCollection)
- ✅ Proven at scale
- ✅ Familiar to university IT environments

**Trade-offs**:
- More complex query patterns
- Requires more careful optimization
- Multiple extensions to coordinate

---

## Option 3: Neo4j

### Limitations

**1. Weaker Spatial Support**
- Limited GeoJSON support, **no GeometryCollection support**
- **Would likely need secondary system for spatial queries**

**2. Vector Search in Enterprise Only**
- Enterprise Edition required for phonetic embeddings
- Introduces licensing costs

**3. Multi-System Architecture Required**
- **Problematic for solo developer**

### Assessment for WHG

**Not recommended** given operational constraints and licensing requirements.

---

## Option 4: Vespa

### Context

**Note**: Previous WHG v4 documentation references Vespa as the intended backend. This assessment reflects re-evaluation following the data model redesign toward property graphs.

### Limitations for WHG v4

**1. Not a Graph Database** - Fundamental mismatch with attestation model
**2. No GeoJSON Support** - Cannot handle historical geometries
**3. No GeometryCollection** - Would require extensive custom encoding

### Assessment

Vespa is **unsuitable for the redesigned data model**.

---

## Detailed Comparison Matrix

| Feature | ArangoDB | PostgreSQL + Extensions | Neo4j Enterprise | Vespa |
|---------|----------|------------------------|------------------|-------|
| **Licensing Model** | BSL 1.1 CE / Commercial EE | PostgreSQL (permissive) | GPL CE / Commercial EE | Apache 2.0 |
| **Academic Viability** | Requires negotiation | ✅ Guaranteed | Requires negotiation | ✅ Guaranteed |
| **Dataset Limits** | 100GB CE / None EE | ✅ None | ✅ None | ✅ None |
| **Graph Queries** | ✅✅ Native AQL | ⚠️ AGE/Cypher | ✅✅✅ Native Cypher | ❌ Manual |
| **Graph Performance** | ✅✅ Excellent | ⚠️ Good with tuning | ✅✅✅ Best | ❌ Poor |
| **Vector Search** | ✅ Good (v3.10+) | ✅ Good (pgvector) | ✅ EE only (v5.11+) | ✅✅✅ Best |
| **Phonetic Embeddings** | ✅ Supported | ✅ Supported | ✅ EE only | ✅✅✅ Ideal |
| **GeoJSON Support** | ✅✅ Native (6 types) | ✅✅✅ PostGIS (all types) | ⚠️ Plugin, limited | ❌ None |
| **GeometryCollection** | ❌ Not supported | ✅✅✅ Fully supported | ❌ Not supported | ❌ Not supported |
| **Single System** | ✅✅✅ Yes | ✅✅✅ Yes | ❌ Need additional DB | ✅ Yes (but inadequate) |
| **Query Elegance** | ✅✅✅ Unified AQL | ⚠️ SQL + Cypher + spatial | ✅✅ Cypher | ❌ Complex custom code |
| **Operational Complexity** | ✅ Low | ✅ Low-Medium | ❌ High (multi-system) | ⚠️ Medium |
| **Fit for WHG Model** | ✅✅✅ Excellent | ✅✅ Very Good | ⚠️ Graph only | ❌ Poor |

## Recommendation

### Primary Option: ArangoDB

**ArangoDB represents the best technical fit for WHG v4** based on:

1. **Data Model Alignment**: Native property graph with document properties directly matches attestation architecture (see [WHG v4 Data Model](https://docs.whgazetteer.org/content/v4/data-model.html))
2. **GeoJSON Support**: Native support for 6 GeoJSON types sufficient for our needs; GeometryCollection limitation addressed by our multi-attestation model
3. **Query Integration**: Unified AQL for all operations reduces complexity
4. **Operational Simplicity**: Single system manageable by small team
5. **Adequate Scale**: Handles anticipated 1TB dataset
6. **Vector Capabilities**: Suitable for phonetic name embedding search

**Critical dependency**: Securing sustainable licensing terms for academic/research use.

**WHG Project Context**:
- Non-commercial research infrastructure
- Free access to all users
- Primary funding from University of Pittsburgh
- Grant-dependent for operational costs
- Solo technical team
- Long-term sustainability essential

**Deployment Preference**: Self-hosted at Pitt, but **open to ArangoDB-managed hosting** if terms are favorable and reduce operational burden.

**Request**: Academic licensing discussion with ArangoDB to determine viability, including both self-hosted and managed hosting options.

### Alternative: PostgreSQL + Extensions

**PostgreSQL provides a viable fallback** with:
- Guaranteed long-term sustainability
- Full GeometryCollection support via PostGIS
- All required capabilities (with greater complexity)

**Scenario**: If ArangoDB licensing proves unsustainable, PostgreSQL is a defensible alternative that meets all requirements.

## Next Steps

1. **Initiate licensing discussion** with ArangoDB regarding academic use case
2. **Provide project details**: scale, funding model, technical team size, mission
3. **Explore deployment options**: self-hosted vs. managed hosting pricing
4. **Benchmark vector search**: Test `APPROX_NEAR_COSINE()` performance with realistic phonetic embeddings (10M+ vectors) early in evaluation process
5. **Validate combined queries**: Test queries mixing graph traversal, geospatial constraints, and vector filtering to verify unified query performance
6. **Decision timeline**: Required for v4 development planning (target: Q2 2025)

## Conclusion

The shift to an attestation-based property graph model necessitates reconsideration of the database backend documented in previous WHG v4 plans (Vespa). For full details on the data model, see [WHG v4 Data Model Documentation](https://docs.whgazetteer.org/content/v4/data-model.html).

**ArangoDB emerges as the optimal technical solution**, offering native support for graph, document, geospatial, and vector capabilities in an integrated, operationally simple architecture suited to a small technical team. The lack of GeometryCollection support is adequately addressed by our attestation model, which naturally accommodates multiple geometry attestations per Thing.

**The viability of ArangoDB depends on establishing sustainable licensing** appropriate for an academic, non-commercial research infrastructure project funded primarily by University of Pittsburgh.

**PostgreSQL with extensions provides a proven alternative** that guarantees sustainability and includes full GeometryCollection support, but requires accepting greater query complexity and careful performance optimization.

The database choice is a critical architectural decision that will shape WHG v4's development timeline, operational requirements, and long-term sustainability.