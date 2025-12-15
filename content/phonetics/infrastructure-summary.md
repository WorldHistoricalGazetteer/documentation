# WHG Elasticsearch Infrastructure: Technical Summary

## Overview

The World Historical Gazetteer (WHG) Elasticsearch deployment is designed to index and serve place data from multiple authority sources, supporting both text-based and phonetic similarity search across approximately 40 million places and 80 million toponyms.

This document summarises the infrastructure architecture, storage requirements, and deployment strategy.

## Architecture

### Two-Instance Deployment

The system uses two Elasticsearch instances to separate indexing from query serving:

| Instance | Location | Purpose |
|----------|----------|---------|
| **Production** | VM on /ix3 (flash) | Live query serving, alias management |
| **Staging** | Slurm worker | Bulk indexing, embedding enrichment |

Both instances serve the same two primary indices:

- **`places`**: Core place records with geometry, type classifications, and cross-references
- **`toponyms`**: Name variants with language tagging, temporal attestations, and phonetic embeddings

### Rationale for Separation

Bulk indexing of tens of millions of records consumes significant CPU, memory, and I/O. Running this workload on the production VM would:

- Degrade query latency during indexing
- Risk VM unresponsiveness under heavy load
- Prevent pre-production validation

The staging instance on a Slurm worker handles the heavy lifting, with snapshots providing a clean transfer mechanism to production.

### Storage Tiers

Storage is distributed across systems optimised for different I/O patterns:

| System | Purpose | Characteristics |
|--------|---------|-----------------|
| `/ix3` (flash) | Production Elasticsearch data | High IOPS, low latency random access |
| Local NVMe scratch | Staging Elasticsearch data | ~870GB, NVMe speeds, per-job ephemeral |
| `/ix1` (bulk) | Authority files, snapshots | Sequential I/O, high capacity, shared |

Staging ES uses local NVMe scratch (`$SLURM_SCRATCH`) for fast indexing I/O, while snapshots are written to `/ix1` for transfer to production.

## Authority Data Sources

The following authority datasets are indexed:

| Authority | Namespace | Est. Places | Est. Toponyms | Source Size |
|-----------|-----------|-------------|---------------|-------------|
| GeoNames | `gn` | 12,000,000 | 20,000,000 | 600 MB |
| Wikidata | `wd` | 8,000,000 | 50,000,000 | 148 GB |
| OpenStreetMap | `osm` | 15,000,000 | 5,000,000 | 85 GB |
| Getty TGN | `tgn` | 3,000,000 | 6,000,000 | 2 GB |
| GB1900 | `gb` | 800,000 | 800,000 | 100 MB |
| Pleiades | `pl` | 37,000 | 100,000 | 104 MB |
| Native Land | `nl` | 5,000 | 5,000 | 50 MB |
| LOC | `loc` | — | — | 1.5 GB |
| D-PLACE | `dp` | 2,000 | 2,000 | 10 MB |
| Index Villaris | `iv` | 24,000 | 24,000 | 5 MB |
| ISO Countries | `un` | 250 | 500 | 15 MB |

**Authority totals**: ~39 million places, ~82 million toponyms

## WHG-Contributed Datasets

In addition to authority files, the system indexes scholarly datasets contributed by WHG users and partner projects:

| Source | Est. Places | Est. Toponyms |
|--------|-------------|---------------|
| WHG contributions | ~200,000 | ~500,000 |

These represent the core research content of WHG and are indexed alongside authority data, enabling contributed places to be matched against the full authority corpus.

**Combined totals**: ~39.2 million places, ~82.5 million toponyms

## Phonetic Search

Toponyms are enriched with phonetic embeddings to support fuzzy name matching across languages and historical spelling variants.

### Siamese BiLSTM Embeddings

- **Dimensions**: 128
- **Method**: Character-level bidirectional LSTM with Siamese training
- **Index type**: HNSW (Hierarchical Navigable Small World)
- **Similarity**: Cosine

The Siamese BiLSTM model learns phonetic similarity directly from pairs of equivalent toponyms (e.g., cross-lingual equivalents from Wikidata). This approach generalises across scripts and languages where IPA transcription models are unavailable.

### Embedding Generation

Embeddings are generated on the staging instance during indexing:

- **Authority files**: Batch processing on Slurm worker (GPU-accelerated if available)
- **WHG contributions**: Processed on staging or production depending on volume

The trained Siamese BiLSTM encoder is deployed to both instances.

### IPA Transcriptions

Where available, IPA transcriptions are stored for reference and display. These are generated via Epitran for supported languages (~30 language codes mapped).

## Index Schemas

### Places Index

```json
{
  "place_id": "keyword",
  "namespace": "keyword",
  "label": "text",
  "toponyms": "keyword[]",
  "ccodes": "keyword[]",
  "locations": [{
    "geometry": "geo_shape",
    "rep_point": "geo_point",
    "timespans": [{ "start": "integer", "end": "integer" }]
  }],
  "types": [{
    "identifier": "keyword",
    "label": "keyword",
    "sourceLabel": "keyword"
  }],
  "relations": [{
    "relationType": "keyword",
    "relationTo": "keyword",
    "certainty": "float"
  }]
}
```

### Toponyms Index

```json
{
  "place_id": "keyword",
  "name": "text",
  "name_lower": "keyword",
  "lang": "keyword",
  "ipa": "keyword",
  "embedding_bilstm": "dense_vector[128]",
  "timespans": [{ "start": "integer", "end": "integer" }],
  "suggest": "completion"
}
```

## Deployment Strategy

### Snapshot-Based Transfer

New indices are built on staging and transferred to production via snapshots:

```
1. Staging (Slurm worker):
   - Create versioned indices (places_v2, toponyms_v2)
   - Ingest and enrich data
   - Validate document counts and sample queries
   - Create snapshot to /ix1

2. Production (VM):
   - Restore snapshot from /ix1
   - Validate restored indices
   - Switch aliases atomically
   - Delete old indices after confirmation
```

### Alias-Based Zero-Downtime Switching

Production uses versioned indices with alias switching:

```
Steady state:
  places (alias) → places_v1 (index)
  toponyms (alias) → toponyms_v1 (index)

After restore and switch:
  places (alias) → places_v2 (restored from snapshot)
  toponyms (alias) → toponyms_v2 (restored from snapshot)
  places_v1, toponyms_v1 retained for rollback (7 days)
  
Switchover:
  places (alias) → places_v2 (atomic)
  places_v1 (deleted after verification)
```

This approach:

- Protects production from indexing workload
- Allows validation queries against new indices before promotion
- Provides rollback via previous snapshots
- Requires temporary 2× index storage only on production during alias transition

## Storage Requirements

### /ix3 (Flash Storage) — Production Elasticsearch Data

| Component | Size |
|-----------|------|
| Places index | 55 GB |
| Toponyms index (with BiLSTM embeddings) | 160 GB |
| Transition overhead (old + new indices) | 215 GB |
| Logs, Kibana data | 7 GB |
| **Peak (during alias transition)** | **437 GB** |
| **Steady state** | **222 GB** |

**Recommended allocation: 750 GB – 1 TB**

The additional headroom accommodates:

- Future authority source additions
- Embedding strategy expansion
- Index optimisation overhead
- Operational flexibility

### Staging Storage — Slurm Worker (Local NVMe Scratch)

| Component | Size |
|-----------|------|
| Available per job | ~870 GB |
| Places index (building) | 55 GB |
| Toponyms index (building) | 160 GB |
| Working space | 30 GB |
| **Required** | **~250 GB** |

Staging uses local NVMe scratch at `$SLURM_SCRATCH` (mapped to `/scratch/slurm-$SLURM_JOB_ID`):

- NVMe speeds for fast indexing I/O
- Automatically provisioned per Slurm job
- Automatically cleaned up when job ends
- No contention with other NFS users

Snapshots are written to the shared `/ix1` repository for transfer to production.

### /ix1 (Bulk Storage) — Authority Files & Snapshots

| Component | Size |
|-----------|------|
| Authority source files (compressed) | 240 GB |
| Working/extraction space | 20 GB |
| Snapshot repository | 500 GB |
| Scripts, logs, configuration | 5 GB |
| **Total** | **765 GB** |

**Recommended allocation: 1 TB**

## Snapshot Strategy

Snapshots are stored on `/ix1` using Elasticsearch's native snapshot mechanism. The repository uses incremental snapshots to minimise storage growth between full reindexing operations.

### Retention Policy

| Type | Schedule | Retention | Purpose |
|------|----------|-----------|---------|
| Daily | Automatic | 7 days rolling | Rapid recovery from corruption |
| Weekly | Automatic | 4 weeks rolling | Medium-term rollback |
| Monthly | Manual | 6 months | Long-term archive |
| Pre-deployment | Before alias switch | 2 per index | Deployment rollback point |

### Repository Configuration

```bash
# Primary snapshot repository
path.repo: /ix1/whcdh/es/repo

# Repository registration
PUT _snapshot/whg_backup
{
  "type": "fs",
  "settings": {
    "location": "/ix1/whcdh/es/repo/backup"
  }
}
```

## Resource Summary

| Resource | Allocation | System |
|----------|------------|--------|
| Production Elasticsearch | 750 GB – 1 TB | /ix3 (flash) |
| Staging Elasticsearch | ~250 GB (of ~870 GB available) | Local NVMe scratch |
| Authority files + snapshots | 1 TB | /ix1 (bulk) |
| **Total persistent storage** | **1.75 – 2 TB** | |

Note: Staging storage is ephemeral (per Slurm job) and does not require permanent allocation.

## Operational Commands

### Index Management

```bash
# Check cluster health
curl -X GET "localhost:9200/_cluster/health?pretty"

# Check index sizes
curl -X GET "localhost:9200/_cat/indices?v&h=index,docs.count,store.size"

# Check alias mappings
curl -X GET "localhost:9200/_cat/aliases?v"
```

### Snapshot Operations

```bash
# Create manual snapshot
curl -X PUT "localhost:9200/_snapshot/whg_backup/snapshot_$(date +%Y%m%d)?wait_for_completion=true" \
  -H 'Content-Type: application/json' -d '{
    "indices": "places,toponyms",
    "ignore_unavailable": true,
    "include_global_state": false
  }'

# List snapshots
curl -X GET "localhost:9200/_snapshot/whg_backup/_all?pretty"

# Restore snapshot
curl -X POST "localhost:9200/_snapshot/whg_backup/snapshot_name/_restore" \
  -H 'Content-Type: application/json' -d '{
    "indices": "places,toponyms",
    "ignore_unavailable": true
  }'
```

### Alias Switching

```bash
# Atomic alias switch
curl -X POST "localhost:9200/_aliases" -H 'Content-Type: application/json' -d '{
  "actions": [
    { "remove": { "index": "places_v1", "alias": "places" }},
    { "add": { "index": "places_v2", "alias": "places" }}
  ]
}'
```

## Directory Structure

```
/ix1/whcdh/
├── elastic/                    # Repository
│   ├── authorities/            # Authority ingestion scripts
│   ├── processing/             # Index management scripts
│   ├── schemas/                # Index mappings and pipelines
│   ├── scripts/                # Operational wrapper scripts
│   └── toponyms/               # Embedding generation scripts
├── data/
│   └── authorities/            # Downloaded authority files
│       ├── gn/                 # GeoNames
│       ├── wd/                 # Wikidata
│       ├── tgn/                # Getty TGN
│       └── ...
└── es/
    └── repo/                   # Snapshot repository
        └── backup/

/ix3/whcdh/
└── es/
    ├── data/                   # Elasticsearch data directory
    └── logs/                   # Elasticsearch logs
```

## References

- [Elasticsearch Documentation](https://www.elastic.co/guide/en/elasticsearch/reference/current/index.html)
- [World Historical Gazetteer](https://whgazetteer.org/)
- [GeoNames](https://www.geonames.org/)
- [Wikidata](https://www.wikidata.org/)
- [Getty TGN](https://www.getty.edu/research/tools/vocabularies/tgn/)
- [Pleiades](https://pleiades.stoa.org/)