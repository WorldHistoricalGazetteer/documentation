# Database Technology Assessment

## TL;DR

**WHG v4** is transitioning to a property graph data model centered on attestations (source-backed claims about historical places). We need a database that natively supports:
- Property graphs with rich node and edge metadata
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

WHG v4 is built around **Things** (entities such as locations, historical entities, collections, periods, routes, itineraries, and networks) connected through **Attestations** (nodes that bundle source-backed claims with temporal bounds and certainty assessments).

**Complete technical details**: [WHG v4 Data Model Documentation](https://docs.whgazetteer.org/content/v4/data-model.html)

**Key concepts**:
- **Thing**: Any entity that can be described (what we used to call "places" but now expanded)
- **Attestation**: A node that bundles claims connecting a Thing to information (names, geometries, timespans, types, or other Things)
- **Authority**: Unified reference data for sources, datasets, relation types, periods, and certainty levels
- **Provenance**: Every claim cites sources via AUTHORITY nodes, has certainty assessment, and temporal bounds
- **Graph structure**: Attestations are nodes (not just edges) in a property graph where edges connect Things → Attestations → Names/Geometries/Timespans/Things

**Current Status**: Previous documentation references Vespa as the intended backend. However, the shift to an attestation-based graph model requires reassessment of technology choices.

**Key Requirements**:
- Property graph with Attestations as first-class nodes (not just edge metadata)
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

**Per Thing Estimates** (average):

**Node Collections:**
- 5 NAME references (shared nodes, not duplicated) ≈ negligible per Thing
- 2 GEOMETRY nodes × 2KB (GeoJSON + derived fields) = 4KB
- 3 TIMESPAN nodes × 0.5KB (4-field temporal model) = 1.5KB
- 5 ATTESTATION nodes × 0.8KB (certainty, notes, metadata) = 4KB
- 3 AUTHORITY references (shared across many Things) ≈ negligible per Thing

**Edge Collection:**
- ~25 edges per Thing × 0.2KB = 5KB
  - Thing → Attestation (subject_of): 5 edges
  - Attestation → Name/Geometry/Timespan (attests_*): 10 edges
  - Attestation → Authority (typed_by, sourced_by): 8 edges
  - Attestation → Thing (relates_to for relations): 2 edges

**Total per Thing:** ~14.5KB

**For 73M Things:**
- Node data (Geometries, Timespans, Attestations): 73M × 9.5KB = **~693GB**
- Edge data: 73M × 5KB = **~365GB**
- **Subtotal per-Thing data: ~1.06TB**

**Shared Collections** (across all Things):
- NAME nodes: ~55GB (30M unique names with embeddings)
- AUTHORITY nodes: ~0.1GB (56K shared authorities)
- **Subtotal shared data: ~55GB**

**Total attestation layer: ~1.11TB**

### Vector Embeddings

**NAME nodes are shared** - the same name (e.g., "London", "Paris", "河内") appears for multiple Things:

**Estimated unique names:**
- Common place names reused extensively (e.g., "Saint Mary's Church" appears in thousands of places)
- Historical name variants often shared (e.g., "Konstantinoupolis" for multiple Byzantine cities)
- Modern names highly reused (e.g., "San José" for dozens of cities)

**Conservative estimate:**
- 73M Things with average 5 name attestations = 365M attestations
- Assuming 30-40% name reuse across Things
- **Unique NAME nodes: ~25-30M**

**Embedding storage:**
- 30M unique names × 384 dimensions × 4 bytes = **~46GB** raw embedding data
- Plus name metadata (language, script, IPA, romanized): 30M × 0.3KB = **~9GB**
- **Total NAME collection: ~55GB**

**Note:** Name reuse is a major storage optimization. Common names like "Church of Saint Mary," "Main Street," "الجامع الكبير" (Great Mosque) appear thousands of times but are stored once. This is a key advantage of the graph model over embedded document approaches.

### AUTHORITY Collection (Shared)

**Estimate:**
- 50K datasets and sources
- 500 relation types
- 5K period definitions (PeriodO)
- **Total: ~56K AUTHORITY records × 2KB = ~112MB**

(Negligible compared to attestation layer - authorities are heavily reused)

### Total Raw Data

| Component | Size |
|-----------|------|
| Source data (Things + basic attributes) | 116-156GB |
| Attestation layer (per-Thing nodes + edges) | 1.06TB |
| Shared NAME nodes (with embeddings) | 55GB |
| Shared AUTHORITY nodes | 0.1GB |
| **Total uncompressed** | **~1.25-1.3TB** |

### Database-Specific Storage Characteristics

#### ArangoDB

**Compression:**
- Document compression: 2-3x typical ratio
- Edge compression: Similar 2-3x ratio
- Vector indexes: Quantization can reduce by 4-8x
- **Estimated working set: 500-650GB**

**Index Overhead:**
- Geo indexes (S2): ~20% of geometry data = ~60GB
- Vector indexes (FAISS IVF): ~30% of NAME embeddings = ~17GB
- Full-text indexes: ~15% of text data = ~25GB
- Edge indexes (automatic): ~10% of edge data = ~35GB
- **Total indexes: ~137GB**

**Final ArangoDB estimate: 650-800GB**

#### PostgreSQL + Extensions

**Compression:**
- PostgreSQL TOAST compression: 2-3x on large fields
- Vector index overhead (HNSW): ~40-50% of embedding data = ~27GB
- PostGIS indexes (GIST): ~25% of geometry data = ~75GB
- AGE graph indexes: ~15% of graph data = ~160GB
- Full-text indexes: ~20% of text data = ~30GB
- **Total indexes: ~292GB**

**Multiple extension overhead:**
- PostGIS spatial functions loaded in memory
- pgvector HNSW index structures
- AGE graph metadata
- Potentially higher memory requirements for query planning

**Final PostgreSQL estimate: 800GB-1TB**

**Note:** PostgreSQL may require more storage than ArangoDB due to:
- Multiple extension indexes with some overlap
- AGE graph metadata duplication (stores both relational and graph views)
- Less efficient edge storage (normalized tables vs. native edge collections)

### Growth Projections

| Timeline | Dataset Size | Storage (ArangoDB) | Storage (PostgreSQL) |
|----------|--------------|-------------------|---------------------|
| **Year 1** | 73M Things baseline | 650-800GB | 800GB-1TB |
| **Year 2** | +2-3M contributed Things | 680-830GB | 830GB-1.05TB |
| **Year 3** | +5M contributed Things | 720-880GB | 880GB-1.1TB |
| **Year 5** | +10M contributed Things | 780-950GB | 950GB-1.2TB |

**Growth characteristics:**

**Dominated by initial bulk ingestion:**
- GeoNames (12M), Wikidata (10M), OSM subset (50M) = 72M Things
- This baseline represents ~98% of total dataset
- Subsequent contributions are incremental (2-3% annually)

**Modest incremental growth:**
- User-contributed places and itineraries
- Smaller specialized historical datasets (CHGIS, Pleiades expansions, etc.)
- Student/classroom contributions

**Attestation density increases over time:**
- Existing Things gain additional attestations (new sources, refined geometries)
- Meta-attestations accumulate (scholarly critique, reconciliation debates)
- **Storage grows ~5-10% per year from attestation enrichment**

**Name collection grows slowly:**
- Most common place names captured in initial ingestion
- New contributions increasingly reuse existing NAME nodes
- Unique name growth rate: ~2-3% annually after Year 1

**Why growth is limited:**
- Historical place data is finite (unlike modern event streams)
- Major gazetteers already ingested at baseline
- Crowdsourced contributions typically enrich existing Things rather than add new ones
- Most growth comes from attestation depth, not Thing breadth

### Memory Requirements

**For optimal performance, working set should fit in RAM:**

**ArangoDB:**
- Active data: 400-500GB
- Vector indexes: 17GB (frequently accessed)
- Geo indexes: 60GB
- Hot edge indexes: 35GB
- **Recommended RAM: 128-256GB** (allows OS cache + query working memory)
- **Minimum acceptable: 64GB** with aggressive caching

**PostgreSQL:**
- Shared buffers: 25-40% of RAM (32-100GB)
- Vector index cache: 27GB
- PostGIS geometry cache: 75GB
- AGE graph cache: 100GB
- OS page cache: remainder
- **Recommended RAM: 256GB** (for comfortable operation with all extensions)
- **Minimum acceptable: 128GB** with careful tuning

**Note:** ArangoDB's lower memory requirements reflect more efficient integrated indexing vs. PostgreSQL's multiple independent extension caches.

### Storage I/O Requirements

**Random reads** (most queries involve):
- Graph traversals (edge lookups)
- Vector similarity search (index navigation)
- Spatial queries (geo index traversal)

**NVMe SSD strongly recommended:**
- ~100K IOPS for concurrent queries
- <1ms latency for graph hops
- Sustained throughput for bulk operations

**Capacity:** 5-10TB to accommodate:
- Database growth (5 years)
- Backup snapshots
- WAL/journal files
- Temporary query space

## Option 1: ArangoDB

### Technical Advantages

**1. Optimal Data Model Alignment**

ArangoDB's native multi-model architecture (graph + document + geospatial) maps directly to WHG's attestation model where **Attestations are nodes** (not just edges):

```javascript
// Things as documents
{
  "_key": "constantinople",
        "_id": "things/constantinople",
        "thing_type": "location",
        "description": "Major Byzantine/Ottoman city on the Bosphorus",
        "primary_name": "Constantinople",  // denormalized
        "representative_point": [28.98, 41.01]  // denormalized
}

// Names as documents with embeddings
{
  "_key": "name-istanbul-tr",
        "_id": "names/name-istanbul-tr",
        "name": "İstanbul",
        "language": "tr",
        "script": "Latn",
        "embedding": [0.234, -0.567, ...]  // 384-dimensional
}

// Attestations as nodes (not edges)
{
  "_key": "att-001",
        "_id": "attestations/att-001",
        "certainty": 1.0,
        "certainty_note": "Official administrative name change",
        "notes": "Adopted after establishment of Turkish Republic"
}

// Edges connect the graph
{
  "_from": "things/constantinople",
        "_to": "attestations/att-001",
        "edge_type": "subject_of"
}

{
  "_from": "attestations/att-001",
        "_to": "names/name-istanbul-tr",
        "edge_type": "attests_name"
}

{
  "_from": "attestations/att-001",
        "_to": "authorities/source-turkish-gov",
        "edge_type": "sourced_by"
}
```

**Key advantage**: Attestations as nodes enables meta-attestations (attestations about attestations), rich provenance chains, and natural modeling of scholarly discourse.

**2. Unified AUTHORITY Collection**

Single table inheritance via `authority_type` discriminator replaces multiple collections:

```javascript
// Source authority
{
    "_id": "authorities/al-tabari",
    "authority_type": "source",
    "citation": "Al-Tabari, History of the Prophets and Kings",
    "source_type": "manuscript"
}

// Dataset authority
{
    "_id": "authorities/dataset-123",
    "authority_type": "dataset",
    "title": "Islamic Cities Database",
    "doi": "doi:10.83427/whg-dataset-123"
}

// Relation type authority
{
    "_id": "authorities/member-of",
    "authority_type": "relation_type",
    "label": "member_of",
    "inverse": "contains",
    "description": "Subject is part of object entity"
}

// Period authority (PeriodO integration)
{
    "_id": "authorities/abbasid",
    "authority_type": "period",
    "label": "Abbasid Caliphate",
    "uri": "periodo:p0abbasid",
    "start_earliest": "750-01-01",
    "stop_latest": "1258-12-31"
}
```

This eliminates multiple table joins and simplifies queries.

**3. Superior GeoJSON Support**

ArangoDB provides native GeoJSON storage and querying with support for Point, MultiPoint, LineString, MultiLineString, Polygon, and MultiPolygon types:

```javascript
// Store complex geometries
db.geometries.insert({
    _key: "geom-constantinople",
    geom: {
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
    },
    representative_point: [28.97, 41.03],
    precision: ["historical_approximate"]
})

// Geospatial queries
FOR geom IN geometries
  FILTER GEO_DISTANCE(geom.representative_point, @query_point) < 50000
  RETURN geom
```

**Key advantages**:
- S2-based geospatial indexing for spherical geometry
- Supports all standard GeoJSON types (Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon)
- Native handling of complex historical geometries without conversion
- No encoding or workarounds required

**Note on GeometryCollection**: ArangoDB does not support the GeometryCollection type. For WHG data containing heterogeneous geometry sets (e.g., a place represented by both a point and a polygon), we would either:
- Store multiple geometry attestations (one per geometry type) - **aligns naturally with our attestation model where each geometry is a separate claim**
- Convert to MultiPolygon by buffering points and lines into small polygons where single-geometry representation is required

**Comparison**: PostgreSQL PostGIS supports GeometryCollection natively; Neo4j spatial plugin has limited GeoJSON support; Vespa has no GeoJSON support.

**4. Unified Query Language (AQL)**

AQL integrates graph traversal, document filtering, geospatial queries, and vector similarity in a single, coherent language. With our model where Attestations are nodes:

```aql
// Complex query: Find places with similar names near Constantinople in 13th century
LET query_embedding = @query_vector
LET query_point = [28.98, 41.01]
LET query_start = DATE_TIMESTAMP("1200-01-01")
LET query_end = DATE_TIMESTAMP("1300-12-31")

FOR thing IN things
  // Spatial constraint
  FILTER GEO_DISTANCE(thing.representative_point, query_point) < 50000
  
  // Find names via graph traversal
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
          
          // Vector similarity (index-accelerated)
          LET similarity = APPROX_NEAR_COSINE(name.embedding, query_embedding)
          FILTER similarity > 0.8
          
          // Check temporal validity
          FOR e3 IN edges
            FILTER e3._from == att._id
            FILTER e3.edge_type == "attests_timespan"
            LET ts = DOCUMENT(e3._to)
            FILTER ts.start_latest <= query_end
            FILTER ts.stop_earliest >= query_start
            
            RETURN {name: name.name, similarity: similarity}
  )
  
  FILTER LENGTH(matching_names) > 0
  
  // Find network connections
  LET trade_partners = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "typed_by"
          LET rel_type = DOCUMENT(e2._to)
          FILTER rel_type.label == "connected_to"
          
          FOR e3 IN edges
            FILTER e3._from == att._id
            FILTER e3.edge_type == "relates_to"
            LET partner = DOCUMENT(e3._to)
            RETURN partner
  )
  
  LIMIT 10
  RETURN {
    thing: thing,
    names: matching_names,
    trade_partners: trade_partners
  }
```

This eliminates the need to combine multiple query languages or systems. The graph traversal naturally handles the Attestation-as-node pattern.

**5. Operational Simplicity**

**Critical for small team**: Single system handles:
- ✅ Graph queries (Attestations as nodes, multi-hop traversals)
- ✅ Document search (full-text, filtering)
- ✅ Vector similarity (name matching via embeddings)
- ✅ Geospatial (GeoJSON native)
- ✅ Temporal queries (efficient range queries)

**Impact**:
- One database to maintain and monitor
- Single backup/recovery strategy
- Unified deployment process
- No data synchronization between systems
- Reduced cognitive load for solo developer

**6. JSON-Native Architecture**

Every node is a JSON document, matching WHG's data modeling approach and facilitating:
- Flexible schema evolution (AUTHORITY discriminator pattern)
- Natural representation of complex temporal structures
- Direct mapping from [Linked Places Format (LPF)](https://github.com/LinkedPasts/linked-places-format)
- Easy integration with Django REST framework

**7. Vector Indexes for Phonetic Name Matching**

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
  FILTER similarity > 0.8
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

WHG intends to host ArangoDB on University of Pittsburgh infrastructure (Pitt CRC).

**Hardware Requirements** (based on 650-800GB working set):

**CPU:**
- **Minimum**: 16 cores
- **Recommended**: 24-32 cores
- **Purpose**: Query parallelization, vector index operations, graph traversals, concurrent user requests
- **Note**: Multi-core critical for AQL query optimization and FAISS vector search

**RAM:**
- **Minimum**: 128GB
- **Recommended**: 192-256GB
- **Breakdown**:
  - Active data in memory: ~500GB working set target
  - Vector indexes (hot): ~17GB
  - Geo indexes: ~60GB
  - Edge indexes: ~35GB
  - ArangoDB processes: ~10-15GB
  - OS and cache: ~20-30GB
- **Rationale**: Keeping frequently-accessed data in RAM is critical for sub-100ms query response
- **Acceptable minimum**: 128GB with careful tuning and acceptance of some disk I/O for queries

**Storage:**
- **Primary Database**: 2TB NVMe SSD
  - Current data: 650-800GB
  - Indexes: ~137GB
  - Growth headroom (5 years): ~300GB
  - WAL and temporary files: ~100GB
  - Total needed: ~1.2-1.4TB → **2TB allocation recommended**
- **Backup Storage**: 3-4TB (separate volume)
  - 3x full database snapshots
  - Incremental backups
  - Export archives
- **Performance Requirements**:
  - NVMe SSD strongly recommended (not SATA SSD)
  - ~50K+ random IOPS for graph traversals
  - <1ms latency for edge lookups
  - Sustained read: 2-3GB/s
  - Sustained write: 1-2GB/s

**Network:**
- **Internal**: 10Gbps minimum for single-server deployment
- **If clustered** (3+ nodes): 25Gbps low-latency interconnect
- **External**: Standard university network connection sufficient for web application traffic

**Software Requirements:**
- **OS**: Linux (Ubuntu 22.04 LTS or RHEL 9 recommended)
- **Database**: ArangoDB Enterprise Edition 3.12+
- **Monitoring**: Prometheus + Grafana (for metrics dashboards)
- **Backup**: ArangoDB's built-in tools + custom scripts
- **Optional**: Docker/Kubernetes for containerized deployment

**Operational Requirements:**
- **System administration**: Pitt CRC support for:
  - Initial server provisioning
  - OS-level maintenance and security patches
  - Network configuration
  - Storage management
- **Database administration** (can be handled by WHG developer with training):
  - Query optimization
  - Index tuning
  - Backup management
  - Monitoring and alerting configuration
- **Backup strategy**:
  - Automated nightly snapshots
  - Weekly full backups
  - Offsite replication (Pitt backup infrastructure)
  - 30-day retention policy
- **Monitoring and alerting**:
  - Query performance metrics
  - Resource utilization (CPU, RAM, disk I/O)
  - Error rates and warnings
  - Backup success/failure notifications

**Alternative: ArangoDB-Managed Hosting (ArangoGraph)**

Given practical considerations, we are **open to ArangoDB-managed hosting** as an alternative to self-hosting.

**Benefits of managed hosting:**
- Reduces operational burden on solo developer
- Professional 24/7 database administration
- Automated backups and updates
- Better resource scaling and elasticity
- Faster time to production
- No hardware procurement lead time
- Included monitoring and alerting

**Tradeoffs:**
- Potentially higher ongoing costs vs. self-hosted
- Less control over infrastructure
- Dependency on vendor availability
- Data egress costs if migrating away

**Consideration**: Managed hosting pricing should be part of licensing discussion, as it may provide better total cost of ownership than self-hosted given staffing constraints and solo developer operational burden.

**Recommendation**: Start with pricing quote for managed hosting (ArangoGraph) to compare against self-hosted TCO before making final deployment decision.

### Limitations

**1. Licensing Constraints**

**Community Edition** (v3.12+):
- 100 GiB dataset limit per cluster
- Restricted to non-commercial use under BSL 1.1
- **Insufficient for WHG** (requires 650-800GB)

**Enterprise Edition**:
- Required for WHG's dataset size
- Licensing terms require negotiation
- Academic/non-commercial pricing available but not published
- **Uncertainty** in long-term cost sustainability

**2. GeometryCollection Not Supported**

ArangoDB does not support the GeoJSON GeometryCollection type. For WHG:
- **Workaround**: Store separate geometry attestations for each geometry type - **this aligns perfectly with our attestation model where each geometry is a separate claim with its own provenance**
- **Alternative**: Convert to MultiPolygon where needed by buffering points/lines
- **Impact**: Minimal - our attestation-as-node model naturally accommodates multiple geometries per Thing, each with separate sources and temporal bounds

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
- Attestations as nodes enable rich provenance and meta-attestations
- AUTHORITY collection pattern simplifies queries
- Graph traversal naturally handles complex relationship patterns
- Excellent GeoJSON support (GeometryCollection limitation addressed by our model)
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

**5. Graph Support via Apache AGE**

Apache AGE enables property graph modeling in PostgreSQL with Cypher queries. For our Attestation-as-node model:

```sql
-- Create graph schema
SELECT create_graph('whg_graph');

-- Insert nodes (Things, Attestations, Names, Authorities)
SELECT * FROM cypher('whg_graph', $$
  CREATE (t:Thing {id: 'constantinople', type: 'location'})
  CREATE (a:Attestation {id: 'att-001', certainty: 1.0})
  CREATE (n:Name {id: 'name-istanbul', name: 'İstanbul'})
  CREATE (auth:Authority {id: 'source-123', type: 'source'})
  CREATE (t)-[:SUBJECT_OF]->(a)
  CREATE (a)-[:ATTESTS_NAME]->(n)
  CREATE (a)-[:SOURCED_BY]->(auth)
$$) AS (result agtype);

-- Query graph
SELECT * FROM cypher('whg_graph', $$
  MATCH (t:Thing)-[:SUBJECT_OF]->(a:Attestation)-[:ATTESTS_NAME]->(n:Name)
  WHERE t.id = 'constantinople'
  RETURN t, a, n
$$) AS (thing agtype, attestation agtype, name agtype);
```

**Note**: AGE is newer than other PostgreSQL extensions and less mature than Neo4j, but actively developed.

**6. Massive Ecosystem**

- Huge community (largest of any database)
- Extensive tooling (monitoring, backup, replication)
- Universal hosting provider support
- Easy to recruit developers
- Abundant learning resources
- Well-known to university IT departments

### Deployment Considerations

**Self-Hosted at University of Pittsburgh (Pitt CRC)**

**Hardware Requirements** (based on 800GB-1TB working set):

**CPU:**
- **Minimum**: 16 cores
- **Recommended**: 32 cores
- **Purpose**: Parallel query execution, multiple extension operations (PostGIS + pgvector + AGE), indexing
- **Note**: PostgreSQL benefits significantly from higher core counts when running multiple extensions simultaneously

**RAM:**
- **Minimum**: 128GB (with careful tuning)
- **Recommended**: 256GB
- **Breakdown**:
  - Shared buffers (PostgreSQL): 64-96GB (25-40% of RAM)
  - pgvector index cache: ~27GB
  - PostGIS geometry cache: ~75GB
  - AGE graph metadata: ~100GB
  - Work_mem for queries: ~20-30GB
  - OS page cache: remainder
- **Rationale**: Multiple extensions each maintain separate caches; higher RAM reduces extension coordination overhead
- **Note**: PostgreSQL + extensions typically requires more RAM than ArangoDB for equivalent dataset due to less integrated architecture

**Storage:**
- **Primary Database**: 3TB NVMe SSD
  - Current data: 800GB-1TB
  - Indexes (multiple extensions): ~292GB
  - Growth headroom (5 years): ~400GB
  - WAL files: ~100GB
  - Temporary query space: ~200GB
  - Total needed: ~1.8-2TB → **3TB allocation recommended**
- **Backup Storage**: 4-5TB (separate volume)
  - 3x full database dumps
  - Incremental WAL archives
  - Extension-specific backups
- **Performance Requirements**:
  - NVMe SSD required (SATA SSD insufficient for graph + spatial queries)
  - ~60K+ random IOPS for combined extension operations
  - <1ms latency for index operations
  - Sustained read: 3-4GB/s
  - Sustained write: 2-3GB/s

**Network:**
- **Internal**: 10Gbps minimum
- **If replicated** (primary + standby): 10Gbps+ low-latency
- **External**: Standard university network connection

**Software Requirements:**
- **OS**: Linux (Ubuntu 22.04 LTS or RHEL 9)
- **Database**: PostgreSQL 16+
- **Extensions**:
  - PostGIS 3.4+
  - pgvector 0.5+
  - Apache AGE 1.5+
  - pg_trgm (included)
- **Connection Pooler**: PgBouncer (required for AGE)
- **Monitoring**: Prometheus + Grafana + PostgreSQL-specific exporters
- **Backup**: pg_dump, WAL archiving, Barman (recommended)

**Operational Requirements:**
- **Initial setup complexity**: Higher than ArangoDB due to multiple extensions
- **Configuration tuning**: Each extension requires separate parameter tuning
- **Backup strategy**:
  - Full database dumps (pg_dump): weekly
  - WAL archiving: continuous
  - Extension metadata backups: daily
  - Point-in-time recovery: 30-day window
- **Monitoring**: Must track metrics for each extension separately
- **Maintenance**: VACUUM, ANALYZE, REINDEX schedules must account for extension overhead

**Note on Extension Coordination:**
- PostGIS, pgvector, and AGE are developed independently
- Updates to one extension may impact others
- Compatibility testing required before upgrading any component
- More complex troubleshooting when issues span multiple extensions
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

- Newer extension (2021), less mature than Neo4j or ArangoDB
- Graph traversals slower than native graph databases
- Combining SQL and Cypher requires switching contexts
- Multi-hop queries can require careful optimization
- **Attestations-as-nodes pattern adds complexity** - more node hops than if attestations were just edge properties

**2. Multi-Extension Complexity**

Three extensions to coordinate (PostGIS, pgvector, AGE), each with its own query patterns, index types, and performance characteristics.

**Impact**: More cognitive overhead than unified system, though manageable.

**3. Unified Query Complexity**

Combining all capabilities requires mixing SQL, Cypher, and spatial functions - significantly more verbose than ArangoDB's unified AQL.

Example of the same query as ArangoDB above would require:
- Cypher for graph traversal (Attestations as nodes)
- SQL for vector similarity (pgvector functions)
- PostGIS for spatial filtering
- Complex CTEs or subqueries to combine results

**4. Graph Performance Ceiling**

- Not optimized for graph traversals
- Deep graph queries (4+ hops) may require denormalization
- **Attestation-as-node pattern increases hop count** (Thing → Attestation → Name is 2 hops vs. 1 edge)
- Network analysis algorithms less efficient than native graph databases

### Assessment for WHG

PostgreSQL provides a **viable alternative** with:
- ✅ Guaranteed sustainability (free, permissive license)
- ✅ All required capabilities (including GeometryCollection)
- ✅ Proven at scale
- ✅ Familiar to university IT environments

**Trade-offs**:
- More complex query patterns (especially with Attestations as nodes)
- Requires more careful optimization
- Multiple extensions to coordinate
- Graph performance ceiling for deep traversals

---

## Option 3: Neo4j

### Advantages

**1. Best Graph Performance**
- Native graph storage and processing
- Optimized for multi-hop traversals
- **Attestations as nodes** is natural pattern

**2. Mature Graph Capabilities**
- Cypher query language well-established
- Rich graph algorithms library
- Excellent for complex relationship queries

### Limitations

**1. Weaker Spatial Support**
- Limited GeoJSON support, **no GeometryCollection support**
- Spatial plugin less mature than PostGIS
- **Would likely need secondary system for complex spatial queries**

**2. Vector Search in Enterprise Only**
- Enterprise Edition required for vector indexes (phonetic embeddings)
- Introduces licensing costs
- No vector search in Community Edition

**3. Multi-System Architecture Required**
- Would need separate database for spatial/vector operations
- **Problematic for solo developer**
- Data synchronization complexity

### Assessment for WHG

**Not recommended** given:
- Need for secondary system (spatial/vector)
- Licensing costs for Enterprise Edition
- Operational complexity for small team

---

## Option 4: Vespa

### Why Vespa Was Initially Attractive

Vespa was selected for WHG v4 when the architectural priorities emphasized:

**1. Vector Search Excellence**

Vespa offers **industry-leading vector similarity search** capabilities:
- Native approximate nearest neighbor (ANN) search with HNSW indexes
- Optimized for billions of vectors with sub-10ms query latency
- Multiple distance metrics (cosine, euclidean, angular, hamming)
- Hybrid search combining BM25 text ranking with vector similarity
- Real-time updates and indexing

**For WHG's phonetic name matching use case**, Vespa represented the gold standard:
- Cross-linguistic toponym matching via phonetic embeddings
- Matching across different scripts (Latin, Arabic, Chinese, Cyrillic, etc.)
- Handling transliteration variations
- Scale to 10M+ name variants with high recall

**2. Unified Search Platform**

Vespa positioned itself as a single system for:
- Full-text search (BM25, linguistic features)
- Vector similarity search
- Structured data queries
- Real-time indexing and updates

This "all-in-one" promise aligned with our goal of operational simplicity for a small team.

**3. Scalability and Performance**

- Battle-tested at massive scale (Yahoo, Spotify, OkCupid)
- Content distribution capabilities for global access
- Low-latency queries even with complex ranking
- Horizontal scaling for growing datasets

**4. Open Source with Strong Backing**

- Apache 2.0 license (no licensing concerns)
- Backed by Verizon Media/Yahoo
- Active development and community
- Professional support available

### Why the Data Model Redesign Changed Everything

The evolution toward an **attestation-based property graph model** fundamentally altered our requirements in ways that expose Vespa's limitations:

### Critical Limitation 1: Not a Graph Database

**The Problem:**

Vespa is a **document search engine**, not a graph database. Our attestation model requires:

- **Attestations as first-class nodes** with their own identifiers
- **Multi-hop graph traversals**: Thing → Attestation → Name → Authority → Period
- **Bidirectional relationships**: Finding all Things connected to a Source, or all Sources supporting an Attestation
- **Meta-attestations**: Attestations about other Attestations (scholarly discourse)
- **Provenance chains**: Tracing claims through multiple levels of citation

**Vespa's Approach:**

Vespa treats everything as documents with embedded relationships. To model our graph:

```json
// Vespa document - all relationships embedded
{
  "thing_id": "constantinople",
  "names": [
    {
      "name": "Constantinople",
      "attestation_id": "att-001",
      "sources": ["source-123"],
      "certainty": 0.9,
      "timespan": {...}
    },
    {
      "name": "İstanbul", 
      "attestation_id": "att-002",
      "sources": ["source-456"],
      "certainty": 1.0,
      "timespan": {...}
    }
  ],
  "geometries": [...],
  "relations": [...]
}
```

**Problems with this approach:**

1. **Attestations lose identity**: They become anonymous nested objects, not addressable entities
2. **No meta-attestations**: Cannot create attestations about attestations when attestations aren't nodes
3. **Duplication**: Same source/timespan data duplicated across many documents
4. **Query complexity**: Finding "all Things citing source X" requires scanning all documents
5. **Update complexity**: Changing a source citation requires updating potentially thousands of documents
6. **No graph algorithms**: Cannot run centrality analysis, shortest path, community detection on embedded data

**Graph Database Approach (ArangoDB/Neo4j):**

```javascript
// Attestation is a node
{
  "_id": "attestations/att-001",
  "certainty": 0.9,
  "notes": "..."
}

// Connected via edges
Thing ──[subject_of]──> Attestation ──[attests_name]──> Name
                            │
                            └──[sourced_by]──> Authority
                            │
                            └──[attests_timespan]──> Timespan
```

**Benefits:**
- Each entity addressable
- Bidirectional traversal native
- Meta-attestations natural (new edges to attestation nodes)
- Updates affect only changed nodes
- Graph algorithms work natively

### Critical Limitation 2: No GeoJSON Support

**The Problem:**

Historical places have **complex geometries**:
- Multiple disputed boundaries for the same period
- Territorial changes over time
- Points, polygons, and linestrings for the same entity
- Imprecise historical regions

**Required GeoJSON types:**
- Point (settlements, monuments)
- MultiPoint (scattered settlement patterns)
- LineString (roads, rivers, walls)
- MultiLineString (trade routes, river systems)
- Polygon (territories, regions)
- MultiPolygon (non-contiguous territories, islands)
- GeometryCollection (mixed geometry types)

**Vespa's Spatial Capabilities:**

Vespa only supports **2D positions** (latitude/longitude pairs):
- No polygon support
- No linestring support
- No multi-geometry support
- No GeometryCollection

**Workaround Required:**

To store a historical territory boundary in Vespa:

```json
{
  "location": [28.98, 41.01],  // Single representative point
  "boundary_encoded": "base64_encoded_geojson_string",  // Custom encoding
  "boundary_wkt": "POLYGON((...))"  // Alternative encoding
}
```

**Problems:**
1. **No spatial queries**: Cannot query "places within this polygon" or "territories intersecting this region"
2. **Custom decoding**: Application must decode geometries for display
3. **No spatial indexing**: Representative point only, not actual boundaries
4. **Geometry comparison**: Cannot compute overlaps, containment, distance to polygons

**Result**: Would need a **secondary spatial database** (PostGIS) anyway, defeating the "single system" goal.

### Critical Limitation 3: Document Model vs. Attestation Model

**WHG's Attestation Philosophy:**

Every claim is:
- **Explicitly sourced** (one or more sources)
- **Temporally bounded** (valid during specific timespan)
- **Uncertainty-qualified** (certainty level with explanation)
- **Independently assessable** (can be challenged, supported, superseded)

**Example**: "Constantinople was called İstanbul (1930-present)"

This is **one attestation node** connecting:
- Thing: Constantinople
- Name: İstanbul
- Authority (source): Turkish Geographic Board
- Authority (relation type): has_name
- Timespan: 1930-present
- Certainty: 1.0

**Vespa's Document Model:**

Would require embedding this information structure within a Constantinople document:

```json
{
  "thing_id": "constantinople",
  "names": [{
    "name": "İstanbul",
    "language": "tr",
    "sources": ["Turkish Geographic Board"],
    "start_year": 1930,
    "certainty": 1.0
  }]
}
```

**What's Lost:**

1. **Source reification**: "Turkish Geographic Board" is just a string, not a linked entity with its own metadata (authority type, URI, dates)
2. **Relation types as data**: "has_name" is implicit in the structure, not an entity with inverse relationships, domain/range constraints
3. **Temporal precision**: Reduced to simple year fields instead of four-field PeriodO model with earliest/latest bounds
4. **Provenance depth**: Cannot represent that "Source A cited Source B" or "Attestation X supersedes Attestation Y"
5. **Scholarly discourse**: Cannot model debates, challenges, revisions to attestations

### Critical Limitation 4: Query Pattern Mismatch

**Query Examples Our Model Requires:**

1. **"What sources support the claim that X was called Y in period Z?"**
  - Graph: Traverse Thing → Attestations → Names (filter) → Sources + Timespans
  - Vespa: Scan all documents, filter embedded names array, extract source strings

2. **"Which places cite source S and have uncertain boundaries?"**
  - Graph: Traverse Source → Attestations (filter certainty) → Things → Geometries (filter precision)
  - Vespa: Full corpus scan checking embedded source strings and geometry metadata

3. **"Show scholarly disagreement about location X's temporal bounds"**
  - Graph: Find all Timespan attestations for X, compare, identify conflicts
  - Vespa: Parse embedded temporal data from document, requires application logic

4. **"Find attestations about attestation A"** (meta-attestations)
  - Graph: Native - just query edges pointing to attestation node A
  - Vespa: Impossible - attestations aren't addressable entities

### What Vespa Does Exceptionally Well (But We Don't Need)

**1. Content Ranking and Recommendation**

Vespa excels at:
- Hybrid BM25 + vector search with sophisticated ranking models
- Learning-to-rank with ML models for relevance tuning
- Personalized recommendations
- A/B testing ranking strategies

**WHG's needs are different**: While we do need to rank candidates within reconciliation clusters (by combined similarity scores: name + spatial + temporal), this is straightforward scoring logic that can be implemented in AQL queries. Vespa's advanced learning-to-rank and personalization features (designed for search engines and recommendation systems) exceed our simpler multi-dimensional similarity requirements.

**2. Real-Time Streaming Updates**

Vespa handles:
- High-velocity data ingestion
- Immediate index updates
- Partial document updates

**WHG doesn't need this**: Historical data changes slowly; batch updates are sufficient.

**3. Content Distribution**

Vespa provides:
- Multi-region deployment
- Content replication
- Edge caching

**WHG doesn't need this**: Single-region deployment at Pitt is adequate; we're not a CDN.

### The Bottom Line

**Vespa was the right choice for a vector-search-first architecture with embedded relationships.**

**Vespa is the wrong choice for a property graph architecture with reified attestations.**

The data model redesign privileged:
- **Historiographical precision** over search ranking
- **Provenance depth** over query speed
- **Scholarly discourse modeling** over content distribution
- **Graph semantics** over document embeddings

These priorities make Vespa fundamentally unsuitable, despite its vector search excellence.

### Why Not Use Vespa for Vectors + Another DB for Graph?

**Considered Multi-System Architecture:**
- Vespa: Vector search on names
- Neo4j/ArangoDB: Graph relationships
- Sync embeddings from graph to Vespa

**Problems:**

1. **Complexity explosion**: Two databases to maintain, monitor, backup
2. **Synchronization overhead**: Keeping vector index aligned with graph
3. **Query splitting**: Every search requires querying both systems and merging results
4. **Operational burden**: Unacceptable for solo developer
5. **Data integrity**: Risk of desynchronization between systems

**ArangoDB's Answer:**

FAISS-backed vector indexes provide 80% of Vespa's vector performance with native graph support, eliminating the need for multiple systems. The 20% performance gap is acceptable given operational simplicity.

### Assessment

Vespa is **unsuitable for the attestation-based property graph model** that defines WHG v4. While its vector search capabilities are best-in-class, the fundamental mismatch between document-oriented search and graph-oriented historical knowledge representation makes it an architectural dead-end for our requirements.

The shift from Vespa to ArangoDB reflects the evolution from "gazetteer as search engine" to "gazetteer as historical knowledge graph."

---

## Detailed Comparison Matrix

| Feature | ArangoDB | PostgreSQL + Extensions | Neo4j Enterprise | Vespa |
|---------|----------|------------------------|------------------|-------|
| **Licensing Model** | BSL 1.1 CE / Commercial EE | PostgreSQL (permissive) | GPL CE / Commercial EE | Apache 2.0 |
| **Academic Viability** | Requires negotiation | ✅ Guaranteed | Requires negotiation | ✅ Guaranteed |
| **Dataset Limits** | 100GB CE / None EE | ✅ None | ✅ None | ✅ None |
| **Attestations as Nodes** | ✅✅✅ Natural | ✅ Via AGE | ✅✅✅ Natural | ❌ Manual |
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

1. **Data Model Alignment**: Native property graph with **Attestations as nodes** (not just edge metadata) directly matches our architecture (see [WHG v4 Data Model](https://docs.whgazetteer.org/content/v4/data-model.html))
2. **AUTHORITY Pattern**: Single collection with discriminator pattern simplifies queries
3. **GeoJSON Support**: Native support for 6 GeoJSON types sufficient for our needs; GeometryCollection limitation naturally addressed by our multi-attestation model where each geometry is a separate claim
4. **Query Integration**: Unified AQL for graph traversal + spatial + vector + temporal operations reduces complexity
5. **Operational Simplicity**: Single system manageable by small team
6. **Adequate Scale**: Handles anticipated 1.2TB dataset
7. **Vector Capabilities**: Suitable for phonetic name embedding search

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
- Graph capabilities via Apache AGE (with Attestations as nodes)
- All required capabilities (with greater complexity)

**Scenario**: If ArangoDB licensing proves unsustainable, PostgreSQL is a defensible alternative that meets all requirements, though with more complex query patterns for our graph model.

## Next Steps

1. **Initiate licensing discussion** with ArangoDB regarding academic use case
2. **Provide project details**: scale, funding model, technical team size, mission
3. **Explore deployment options**: self-hosted vs. managed hosting pricing
4. **Benchmark vector search**: Test `APPROX_NEAR_COSINE()` performance with realistic phonetic embeddings (10M+ vectors) early in evaluation process
5. **Validate graph queries**: Test Attestation-as-node pattern with multi-hop queries combining graph traversal, geospatial constraints, and vector filtering
6. **Decision timeline**: Required for v4 development planning (target: Q2 2025)

## Conclusion

The shift to an attestation-based property graph model with **Attestations as nodes** (not just edge metadata) necessitates reconsideration of the database backend documented in previous WHG v4 plans (Vespa). For full details on the data model, see [WHG v4 Data Model Documentation](https://docs.whgazetteer.org/content/v4/data-model.html).

**ArangoDB emerges as the optimal technical solution**, offering native support for:
- Property graphs where Attestations are first-class nodes
- Document collections for Things, Names, Geometries, Timespans, and Authorities
- Unified AUTHORITY collection pattern via discriminator
- GeoJSON geometries for complex historical boundaries
- Vector similarity search for phonetic name matching
- All capabilities integrated in a single system with unified AQL query language

The lack of GeometryCollection support is adequately addressed by our attestation model, which naturally accommodates multiple geometry attestations per Thing—each with its own provenance, temporal bounds, and certainty assessment.

**The viability of ArangoDB depends on establishing sustainable licensing** appropriate for an academic, non-commercial research infrastructure project funded primarily by University of Pittsburgh.

**PostgreSQL with extensions provides a proven alternative** that guarantees sustainability and includes full GeometryCollection support, but requires accepting greater query complexity (especially for graph traversals with Attestations as nodes) and careful performance optimization.

The database choice is a critical architectural decision that will shape WHG v4's development timeline, operational requirements, and long-term sustainability.