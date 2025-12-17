# Elasticsearch Management Guide

This guide covers the complete lifecycle of the WHG Elasticsearch deployment at University of Pittsburgh CRC, from installation through daily operations.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Storage Architecture](#storage-architecture)
5. [Production Instance (VM)](#production-instance-vm)
6. [Staging Instance (Slurm)](#staging-instance-slurm)
7. [Authority Data Ingestion](#authority-data-ingestion)
8. [Index Management](#index-management)
9. [Snapshot Management](#snapshot-management)
10. [Production Deployment](#production-deployment)
11. [Health Monitoring](#health-monitoring)
12. [Troubleshooting](#troubleshooting)
13. [Quick Reference](#quick-reference)

## Architecture Overview

The WHG Elasticsearch deployment uses a two-instance architecture to separate indexing from query serving:

| Component | Location | Purpose | Lifecycle |
|-----------|----------|---------|-----------|
| **Production ES** | VM (port 9200) | Live queries, persistent | Always running |
| **Staging ES** | Slurm compute node (port 9201) | Indexing operations, ephemeral | Per-job only |
| **Kibana** | VM (port 5601) | Dashboard and monitoring | Always running |

### Key Design Principles

**Isolation**: Staging instance runs on Slurm workers to protect production VM from indexing workload spikes.

**Ephemeral Staging**: The staging instance exists only for the duration of indexing jobs. Data lives on fast local NVMe storage and is destroyed when the job ends. Snapshots provide the persistence mechanism.

**Snapshot-Based Transfer**: Completed indices are transferred from staging to production via snapshot/restore, enabling validation before production exposure and clean rollback capability.

### Storage Tiers

| Mount | Type | Use | Characteristics |
|-------|------|-----|-----------------|
| `/ix1/ishi` | Standard | Code, binaries, configs, snapshots, source data | Sequential I/O, high capacity |
| `/ix3/ishi` | Flash | Production ES data | High IOPS, low latency |
| `$SLURM_SCRATCH` | NVMe | Staging ES data | ~870GB, ephemeral, per-job |

## Installation

### Prerequisites

Access to Pitt CRC infrastructure:
- SSH access to `<user>@htc.crc.pitt.edu`
- Write permissions to `/ix1/ishi` and `/ix3/ishi`

### First-Time Setup

```bash
# SSH to CRC
ssh <user>@htc.crc.pitt.edu

# Clone repository (only needed once)
mkdir -p /ix1/ishi
cd /ix1/ishi
git clone git@github.com:WorldHistoricalGazetteer/elastic.git

# Run installation
./elastic/scripts/es.sh -install
```

The installation script:
1. Creates directory structure on `/ix1` and `/ix3`
2. Downloads and installs Elasticsearch 9.0.0
3. Downloads and installs Kibana 9.0.0
4. Sets up JDK 21.0.1
5. Makes wrapper script executable
6. Adds `es` alias to `.bashrc`

### Activate the Environment

```bash
# Activate the alias in current shell
source ~/.bashrc

# Verify installation
es -health
```

### Updating

Pull latest code from the repository:

```bash
es -update
```

## Configuration

All configuration is centralized in `.env` at the repository root:

```bash
# View current configuration
cat /ix1/ishi/elastic/.env
```

### Key Variables

| Variable | Purpose | Default |
|----------|---------|---------|
| `IX1_BASE` | Base path for persistent storage | `/ix1/ishi` |
| `IX3_BASE` | Base path for flash storage | `/ix3/ishi` |
| `ES_HOME` | Elasticsearch installation directory | `${IX1_BASE}/es-bin` |
| `KIBANA_HOME` | Kibana installation directory | `${IX1_BASE}/kibana-bin` |
| `JAVA_HOME` | Java installation directory | `${IX1_BASE}/jdk-21.0.1` |
| `PROD_ES_URL` | Production ES endpoint | `http://localhost:9200` |
| `STAGING_ES_PORT` | Staging ES port | `9201` |
| `DATA_DIR` | Authority source files | `${IX1_BASE}/data` |
| `SNAPSHOT_DIR` | Snapshot repository location | `${IX1_BASE}/es/snapshots` |
| `BATCH_SIZE` | Bulk indexing batch size | `5000` |

### VM Resource Allocation

The VM has 32GB RAM allocated as follows:

| Resource | Allocation | Purpose |
|----------|------------|---------|
| ES heap | 15g | JVM heap (`-Xms15g -Xmx15g`) |
| Filesystem cache | ~15g | OS uses free RAM for caching index files |
| System/services | ~2g | OS, SSH, monitoring |

The 50/50 split between heap and filesystem cache follows standard ES guidance for optimal query performance.

## Storage Architecture

### Directory Structure

```
/ix1/ishi/
├── es-bin/                      # Elasticsearch installation
├── kibana-bin/                  # Kibana installation
├── jdk-21.0.1/                  # Java installation
├── elastic/                     # Git repository
│   ├── .env                     # Environment configuration
│   ├── scripts/
│   │   └── es.sh                # Management wrapper
│   ├── processing/
│   │   ├── es_staging.sbatch    # Staging Slurm script
│   │   ├── settings.py          # Python settings
│   │   ├── create_indices.py
│   │   ├── deploy_to_production.py
│   │   ├── fetch_authorities.py
│   │   └── ingest_all_authorities.py
│   ├── authorities/             # Authority ingestion scripts
│   ├── schemas/                 # Index mappings and pipelines
│   └── toponyms/                # Embedding generation scripts
├── data/
│   └── authorities/             # Source data files
│       ├── gn/                  # GeoNames
│       ├── wd/                  # Wikidata
│       ├── tgn/                 # Getty TGN
│       ├── pl/                  # Pleiades
│       ├── gb/                  # GB1900
│       ├── un/                  # UN Countries
│       ├── osm/                 # OpenStreetMap (optional)
│       ├── nl/                  # Native Land
│       ├── dp/                  # D-PLACE
│       ├── iv/                  # Index Villaris
│       └── loc/                 # Library of Congress
├── es/
│   ├── logs/                    # Production ES logs
│   ├── es.pid                   # Production ES PID
│   ├── config/                  # Production ES config
│   ├── staging-logs/            # Staging Slurm logs
│   └── snapshots/
│       ├── staging/             # Snapshots from staging
│       └── backup/              # Production backups
├── kibana/
│   ├── data/
│   ├── logs/
│   └── kb.pid
└── esinfo/
    └── es-staging.env           # Staging instance connection info

/ix3/ishi/
└── es/
    └── data/                    # Production ES data (flash)

$SLURM_SCRATCH/                  # Per-job ephemeral
└── es-staging/
    ├── data/                    # Staging ES data
    ├── logs/
    └── config/
```

### Storage Requirements

#### Production (/ix3 Flash Storage)

| Component | Size |
|-----------|------|
| Places index | ~55 GB |
| Toponyms index | ~160 GB |
| Working space | ~7 GB |
| **Steady state** | **~222 GB** |
| **Peak (during deployment)** | **~437 GB** |

**Recommended allocation: 750 GB – 1 TB**

Peak usage occurs during zero-downtime deployments when both old and new index versions coexist temporarily.

#### Staging (Local NVMe Scratch)

| Component | Size |
|-----------|------|
| Available per job | ~870 GB |
| Places index (building) | ~55 GB |
| Toponyms index (building) | ~160 GB |
| Working space | ~30 GB |
| **Required** | **~250 GB** |

Staging uses local NVMe at `$SLURM_SCRATCH`, automatically provisioned when Slurm jobs start and destroyed when they end.

#### Shared Storage (/ix1)

| Component | Size |
|-----------|------|
| Authority source files | ~240 GB |
| Snapshot repository | ~500 GB |
| Scripts, logs, config | ~5 GB |
| **Total** | **~765 GB** |

**Recommended allocation: 1 TB**

## Production Instance (VM)

The production Elasticsearch instance runs persistently on the VM at `localhost:9200`.

### Starting Services

Start both Elasticsearch and Kibana:

```bash
es -start
```

Or start individually:

```bash
es es-start        # Elasticsearch only
es kibana-start    # Kibana only
```

### Stopping Services

Stop both services:

```bash
es -stop
```

Or stop individually:

```bash
es es-stop         # Elasticsearch only
es kibana-stop     # Kibana only
```

### Restarting Services

```bash
es -restart        # Both services
es es-restart      # Elasticsearch only
es kibana-restart  # Kibana only
```

### Service Status

Check if services are running:

```bash
# Check if processes are running
ps aux | grep elasticsearch
ps aux | grep kibana

# Or check PID files
cat /ix1/ishi/es/es.pid
cat /ix1/ishi/kibana/kb.pid

# Check cluster health
curl "http://localhost:9200/_cluster/health?pretty"
```

### Access URLs

| Service | URL | Notes |
|---------|-----|-------|
| Elasticsearch | http://localhost:9200 | VM only |
| Kibana | http://localhost:5601 | VM only |

For remote Kibana access, use SSH tunnel:

```bash
ssh -L 5602:localhost:5601 pitt
# Then access: http://localhost:5602
```

### Production Logs

| Component | Location |
|-----------|----------|
| Elasticsearch logs | `/ix1/ishi/es/logs/` |
| Kibana logs | `/ix1/ishi/kibana/logs/` |

View recent logs:

```bash
tail -f /ix1/ishi/es/logs/whg-production.log
tail -f /ix1/ishi/kibana/logs/kibana.log
```

## Staging Instance (Slurm)

The staging Elasticsearch instance is **ephemeral** — it runs on a Slurm compute node for indexing operations only.

### Key Characteristics

| Aspect | Detail |
|--------|--------|
| Instance count | One at a time (all jobs share it) |
| Port | 9201 (fixed) |
| Data storage | `$SLURM_SCRATCH` (ephemeral NVMe, ~870GB) |
| Snapshot storage | `/ix1/ishi/es/snapshots/staging` (persistent) |
| Max runtime | 48 hours |
| Lifecycle | Spun up at job start, destroyed at job end |

### Starting Staging Instance

**Important**: Use `source` to export environment variables to your shell.

```bash
# SSH to CRC login node
ssh <user>@htc.crc.pitt.edu

# Start staging instance
source /ix1/ishi/elastic/scripts/es.sh -staging-start
```

This will:
1. Submit a Slurm job to a compute node
2. Start Elasticsearch with data on local NVMe
3. Register the staging snapshot repository
4. Restore the latest snapshot (if one exists containing both indices), OR
5. Create empty indices using `create_indices.py`
6. Export environment variables to your shell

### Using Staging Instance

#### In the Current Shell

After starting, environment variables are automatically exported:

```bash
# Check connection
echo "ES available at: http://$ES_NODE:$ES_PORT"

# Query cluster health
curl -s "http://$ES_NODE:$ES_PORT/_cluster/health?pretty"

# Check indices
curl -s "http://$ES_NODE:$ES_PORT/_cat/indices?v"
```

#### In Other Shells or Scripts

Source the environment file:

```bash
source /ix1/ishi/esinfo/es-staging.env

# Now ES_NODE and ES_PORT are available
curl -s "http://$ES_NODE:$ES_PORT/_cluster/health?pretty"
```

#### In Slurm Batch Jobs

Jobs that index against staging should check that staging is running:

```bash
#!/bin/bash
#SBATCH --job-name=my-indexing-job
#SBATCH --time=4:00:00
#SBATCH --mem=16G

STAGING_ENV="/ix1/ishi/esinfo/es-staging.env"

if [ ! -f "$STAGING_ENV" ]; then
    echo "ERROR: No staging ES instance running"
    echo "Start one with: source /ix1/ishi/elastic/scripts/es.sh -staging-start"
    exit 1
fi

source "$STAGING_ENV"
echo "Using staging ES at http://$ES_NODE:$ES_PORT"

# Your indexing commands here...
```

### Checking Staging Status

```bash
# Full status report
source /ix1/ishi/elastic/scripts/es.sh -staging-status

# Health check only
source /ix1/ishi/elastic/scripts/es.sh -staging-health

# View recent logs
source /ix1/ishi/elastic/scripts/es.sh -staging-logs
```

### Creating Snapshots

**Critical**: Snapshots must be created **explicitly** after completing work. They are **not** created automatically on shutdown.

#### Create a Checkpoint Snapshot

```bash
# Load staging connection info
source /ix1/ishi/esinfo/es-staging.env

# Create snapshot with timestamp
SNAPSHOT_NAME="checkpoint_$(date +%Y%m%d_%H%M%S)"
curl -X PUT "http://$ES_NODE:$ES_PORT/_snapshot/staging_repo/$SNAPSHOT_NAME?wait_for_completion=true" \
    -H 'Content-Type: application/json' -d '{
    "indices": "places,toponyms",
    "ignore_unavailable": true,
    "include_global_state": false
}'
```

#### List Existing Snapshots

```bash
source /ix1/ishi/esinfo/es-staging.env
curl -s "http://$ES_NODE:$ES_PORT/_snapshot/staging_repo/_all?pretty"
```

#### Delete Old Snapshots

```bash
source /ix1/ishi/esinfo/es-staging.env
curl -X DELETE "http://$ES_NODE:$ES_PORT/_snapshot/staging_repo/old_snapshot_name"
```

### Stopping Staging Instance

**Warning**: This destroys all data on local NVMe. Create snapshots first!

```bash
source /ix1/ishi/elastic/scripts/es.sh -staging-stop
```

This will:
1. Prompt for confirmation (data will be lost)
2. Cancel the Slurm job
3. Clean up the ephemeral data directory
4. Remove the environment file

### Handling Job Timeouts

The staging instance has a 48-hour time limit. If your work might exceed this:

1. **Break work into phases** that complete within the time limit
2. **Create explicit snapshots** after each phase completes
3. **Start a new staging instance** — snapshots restore automatically

If the job times out mid-operation:
- Uncommitted work on the local NVMe is lost
- The last explicit snapshot is preserved
- Start a new instance to continue from the last checkpoint

### Staging Logs

Slurm job logs are stored persistently:

```bash
# List recent logs
ls -lt /ix1/ishi/es/staging-logs/*.out | head -5

# View specific job log
tail -100 /ix1/ishi/es/staging-logs/slurm-JOBID.out
```

## Authority Data Ingestion

Authority files are large-scale reference gazetteers (GeoNames, Wikidata, etc.) that form the core of the WHG index.

### Available Authorities

| Authority | Namespace | Est. Places | Source Size |
|-----------|-----------|-------------|-------------|
| GeoNames | `gn` | 12,000,000 | 600 MB |
| Wikidata | `wd` | 8,000,000 | 148 GB |
| Getty TGN | `tgn` | 3,000,000 | 2 GB |
| GB1900 | `gb` | 800,000 | 100 MB |
| Pleiades | `pl` | 37,000 | 104 MB |
| UN Countries | `un` | 250 | 15 MB |
| OpenStreetMap | `osm` | 15,000,000 | 85 GB (optional) |
| Native Land | `nl` | 5,000 | 50 MB |
| D-PLACE | `dp` | 2,000 | 10 MB |
| Index Villaris | `iv` | 24,000 | 5 MB |
| Library of Congress | `loc` | — | 1.5 GB (relations only) |

### Downloading Authority Files

Update authority files from their source URLs:

```bash
# SSH to CRC
ssh <user>@htc.crc.pitt.edu

cd /ix1/ishi/elastic

# Download all authorities (uses .env config)
python -m processing.fetch_authorities

# Download specific authorities only
python -m processing.fetch_authorities -n gn,wd,pl

# Force refresh (ignore file age)
python -m processing.fetch_authorities --age 0

# Check what needs updating (no downloads)
python -m processing.fetch_authorities --age 365
```

Files are downloaded to `/ix1/ishi/data/authorities/{namespace}/`.

### Orchestrated Ingestion Workflow

The `es.sh` script orchestrates the complete ingestion workflow, from checking existence of downloaded files through deployment to production.

#### Prerequisites

1. **Start staging instance** (if not already running):

```bash
source /ix1/ishi/elastic/scripts/es.sh -staging-start
```

2. **Verify staging is healthy**:

```bash
source /ix1/ishi/elastic/scripts/es.sh -staging-health
```

#### Basic Ingestion

Ingest all available authorities:

```bash
es -ingest
```

This submits a Slurm job that:
1. Checks staging ES is running
2. Creates indices if they don't exist
3. Ingests all authority files with available data
4. Creates checkpoint snapshots after each authority
5. Generates embeddings (if models are available)

#### Selective Ingestion

Ingest specific authorities only:

```bash
# Just GeoNames and Wikidata
es -ingest -n gn,wd

# Skip authorities already indexed
es -ingest --skip-existing

# Check data availability without ingesting
es -ingest --check-only
```

#### Monitoring Progress

```bash
# Check Slurm job status
squeue -u $USER

# Tail the ingestion log
tail -f /ix1/ishi/es/staging-logs/ingest-JOBID.out

# Check the error log
cat /ix1/ishi/es/staging-logs/ingest-JOBID.err

# Check document counts
source /ix1/ishi/esinfo/es-staging.env
curl -s "http://$ES_NODE:$ES_PORT/_cat/indices?v"
```

### Expected Timelines

| Step | Script | Runtime | Documents (approx) |
|------|--------|---------|-------------------|
| Create indices | `create_indices` | < 1 min | - |
| GeoNames places | `geonames_places` | 2-3 hrs | ~12 million |
| GeoNames toponyms | `geonames_toponyms` | 4-6 hrs | ~17 million |
| Wikidata places | `wikidata_places` | 8-12 hrs | ~10-15 million |
| Pleiades | `pleiades_places` | 30-60 min | ~37,000 |
| TGN | `tgn_places` | 2-4 hrs | ~2.5 million |
| GB1900 | `gb1900_places` | 30-60 min | ~1.5 million |
| UN Countries | `un_countries` | 5 min | ~200 |
| Wikidata geoshapes | `wikidata_geoshapes` | 4-8 hrs | ~130,000 updates |

**Total**: ~20-30 hours of compute time across multiple staging sessions.

### Final Document Counts

After complete ingestion:

```bash
# Expected totals
curl -s "http://$ES_NODE:$ES_PORT/places/_count?pretty"
# Expected: ~25-30 million

curl -s "http://$ES_NODE:$ES_PORT/toponyms/_count?pretty"
# Expected: ~80 million unique
```

## Index Management

### Index Schemas

The WHG system uses two primary indices:

#### Places Index

Core gazetteer records with geometry, types, and relations:

```json
{
  "place_id": "keyword",           // e.g., "gn:2643743"
  "namespace": "keyword",          // e.g., "gn", "wd", "pl"
  "label": "text",                 // Primary display name
  "toponyms": "keyword[]",         // References to toponyms index
  "ccodes": "keyword[]",           // ISO country codes
  "locations": [{
    "geometry": "geo_shape",       // GeoJSON geometry
    "rep_point": "geo_point",      // Representative point
    "timespans": [{
      "start": "integer",          // Temporal validity
      "end": "integer"
    }]
  }],
  "types": [{
    "identifier": "keyword",
    "label": "keyword",
    "sourceLabel": "keyword"
  }],
  "relations": [{
    "relationType": "keyword",     // e.g., "sameAs", "partOf"
    "relationTo": "keyword",       // Target place_id
    "certainty": "float",
    "method": "keyword"
  }]
}
```

#### Toponyms Index

Unique name@language combinations with phonetic embeddings:

```json
{
  "place_id": "keyword",           // Parent place reference
  "name": "text",                  // The toponym
  "name_lower": "keyword",         // Lowercase for exact match
  "lang": "keyword",               // ISO 639 language code
  "embedding_bilstm": "dense_vector[128]",  // Phonetic embedding
  "suggest": "completion"          // Autocomplete
}
```

### Index Settings: Staging vs Production

Indices are created with settings optimized for their use case:

| Setting | Staging (Indexing) | Production (Queries) |
|---------|-------------------|---------------------|
| `refresh_interval` | `"-1"` (disabled) | `"1s"` |
| `translog.durability` | `"async"` | `"request"` |
| `translog.flush_threshold_size` | `"1gb"` | `"512mb"` |
| `number_of_replicas` | `0` | `0` |
| `number_of_shards` | `4` | `4` |

### Ingest Pipelines

#### Places Pipeline (`extract_namespace`)

Extracts namespace from `place_id` and sets `indexed_at`:

```json
{
  "processors": [
    {
      "script": {
        "source": "if (ctx.place_id != null && ctx.place_id.contains(':')) { ctx.namespace = ctx.place_id.splitOnToken(':')[0]; }"
      }
    },
    {
      "set": {
        "field": "indexed_at",
        "value": "{{_ingest.timestamp}}"
      }
    }
  ]
}
```

#### Toponyms Pipeline (`extract_language`)

Parses `toponym@lang` format into separate fields:

```json
{
  "processors": [
    {
      "script": {
        "source": "if (ctx.name != null && ctx.name.contains('@')) { String[] parts = ctx.name.splitOnToken('@'); ctx.name = parts[0]; ctx.name_lower = parts[0].toLowerCase(); ctx.lang = parts[1]; }"
      }
    }
  ]
}
```

### Viewing Index Information

```bash
# List all indices
curl "http://localhost:9200/_cat/indices?v"

# Get index mapping
curl "http://localhost:9200/places/_mapping?pretty"
curl "http://localhost:9200/toponyms/_mapping?pretty"

# Get index settings
curl "http://localhost:9200/places/_settings?pretty"

# Check document count by namespace
for ns in gn wd pl tgn gb un; do
    count=$(curl -s "http://localhost:9200/places/_count" \
        -H 'Content-Type: application/json' \
        -d "{\"query\": {\"prefix\": {\"place_id\": \"$ns:\"}}}" | jq .count)
    echo "$ns: $count"
done
```

## Snapshot Management

Snapshots are the primary mechanism for:
- Transferring indices from staging to production
- Backup and disaster recovery
- Index versioning and rollback

### Snapshot Repository

Snapshots are stored on `/ix1/ishi/es/snapshots/`:

```bash
# Repository structure
/ix1/ishi/es/snapshots/
├── staging/          # Staging snapshots (transfer to production)
└── backup/           # Production backups
```

### Creating Snapshots

#### From Staging

```bash
source /ix1/ishi/esinfo/es-staging.env

# Create snapshot
SNAPSHOT_NAME="complete_$(date +%Y%m%d)"
curl -X PUT "http://$ES_NODE:$ES_PORT/_snapshot/staging_repo/$SNAPSHOT_NAME?wait_for_completion=true" \
    -H 'Content-Type: application/json' -d '{
    "indices": "places,toponyms",
    "ignore_unavailable": true,
    "include_global_state": false
}'
```

#### From Production

```bash
# Create backup snapshot
SNAPSHOT_NAME="backup_$(date +%Y%m%d)"
curl -X PUT "http://localhost:9200/_snapshot/backup_repo/$SNAPSHOT_NAME?wait_for_completion=true" \
    -H 'Content-Type: application/json' -d '{
    "indices": "places,toponyms",
    "ignore_unavailable": true,
    "include_global_state": false
}'
```

### Listing Snapshots

```bash
# List all snapshots in staging repository
curl -s "http://localhost:9200/_snapshot/staging_repo/_all?pretty"

# List all snapshots in backup repository
curl -s "http://localhost:9200/_snapshot/backup_repo/_all?pretty"

# Get details of specific snapshot
curl -s "http://localhost:9200/_snapshot/staging_repo/complete_20241216?pretty"
```

### Deleting Snapshots

```bash
# Delete specific snapshot
curl -X DELETE "http://localhost:9200/_snapshot/staging_repo/old_snapshot_name"

# Delete snapshots older than 30 days (script this)
# List snapshots, parse dates, delete old ones
```

### Retention Policy

| Type | Schedule | Retention | Purpose |
|------|----------|-----------|---------|
| Checkpoint | After each authority | 7 days rolling | Progress preservation |
| Daily | Automatic | 7 days rolling | Rapid recovery |
| Weekly | Automatic | 4 weeks rolling | Medium-term rollback |
| Pre-deployment | Before alias switch | 2 per index | Deployment rollback |
| Monthly | Manual | 6 months | Long-term archive |

## Production Deployment

After completing all indexing and creating a final snapshot on staging, deploy to production.

### Deployment Process

**Important**: Run this on the VM, not the CRC login node.

#### 1. Stop Staging Instance

```bash
source /ix1/ishi/elastic/scripts/es.sh -staging-stop
```

#### 2. Deploy to Production

```bash
cd /ix1/ishi/elastic
python -m processing.deploy_to_production
```

This script will:

1. Find the latest staging snapshot
2. Restore to new timestamped indices (e.g., `places_20241216`, `toponyms_20241216`)
3. Reconfigure index settings for production queries:
   - `refresh_interval`: `-1` → `1s` (enable near real-time search)
   - `translog.durability`: `async` → `request` (data safety)
   - `translog.flush_threshold_size`: `1gb` → `512mb` (bounded recovery)
4. Run force merge to 1 segment per shard (~30-60 minutes for query optimization)
5. Atomically switch aliases (`places`, `toponyms`) to new indices
6. Optionally clean up old indices

#### 3. Verify Production

```bash
# Check indices
curl -s "http://localhost:9200/_cat/indices?v"

# Verify document counts
curl -s "http://localhost:9200/places/_count?pretty"
curl -s "http://localhost:9200/toponyms/_count?pretty"

# Check aliases
curl -s "http://localhost:9200/_cat/aliases?v"

# Test a sample query
curl -s "http://localhost:9200/places/_search?q=label:London&size=5&pretty"
```

### Zero-Downtime Deployment

The deployment uses versioned indices with alias switching:

```
Steady state:
  places (alias) → places_20241201 (index)
  toponyms (alias) → toponyms_20241201 (index)

During restore:
  places (alias) → places_20241201 (still serving queries)
  toponyms (alias) → toponyms_20241201
  [places_20241216, toponyms_20241216 being restored]

After validation and alias switch:
  places (alias) → places_20241216 (atomic switch)
  toponyms (alias) → toponyms_20241216
  [places_20241201, toponyms_20241201 retained for rollback]

After verification:
  places_20241201, toponyms_20241201 deleted
```

### Manual Deployment Steps

If you need more control than the automated script provides:

#### 1. List Available Snapshots

```bash
curl -s "http://localhost:9200/_snapshot/staging_repo/_all?pretty" | \
    python3 -c "import sys,json; [print(s['snapshot'], s['state'], s['start_time']) for s in json.load(sys.stdin)['snapshots']]"
```

#### 2. Restore Snapshot

```bash
SNAPSHOT_NAME="complete_20241216"
TIMESTAMP=$(date +%Y%m%d)

curl -X POST "http://localhost:9200/_snapshot/staging_repo/$SNAPSHOT_NAME/_restore?wait_for_completion=true" \
    -H 'Content-Type: application/json' -d "{
    \"indices\": \"places,toponyms\",
    \"rename_pattern\": \"(.+)\",
    \"rename_replacement\": \"\$1_${TIMESTAMP}\",
    \"ignore_unavailable\": true,
    \"include_global_state\": false
}"
```

#### 3. Configure for Production

```bash
# Update settings for query workload
curl -X PUT "http://localhost:9200/places_${TIMESTAMP}/_settings" \
    -H 'Content-Type: application/json' -d '{
    "index": {
        "refresh_interval": "1s",
        "translog": {
            "durability": "request",
            "flush_threshold_size": "512mb"
        }
    }
}'

curl -X PUT "http://localhost:9200/toponyms_${TIMESTAMP}/_settings" \
    -H 'Content-Type: application/json' -d '{
    "index": {
        "refresh_interval": "1s",
        "translog": {
            "durability": "request",
            "flush_threshold_size": "512mb"
        }
    }
}'
```

#### 4. Force Merge (Optional but Recommended)

```bash
# Optimize for queries (takes 30-60 minutes)
curl -X POST "http://localhost:9200/places_${TIMESTAMP}/_forcemerge?max_num_segments=1"
curl -X POST "http://localhost:9200/toponyms_${TIMESTAMP}/_forcemerge?max_num_segments=1"
```

#### 5. Validate Restored Indices

```bash
# Check document counts
curl -s "http://localhost:9200/places_${TIMESTAMP}/_count?pretty"
curl -s "http://localhost:9200/toponyms_${TIMESTAMP}/_count?pretty"

# Run test queries
curl -s "http://localhost:9200/places_${TIMESTAMP}/_search?q=label:London&size=5&pretty"
```

#### 6. Switch Aliases

```bash
# Atomic alias switch
curl -X POST "http://localhost:9200/_aliases" -H 'Content-Type: application/json' -d "{
    \"actions\": [
        {\"remove\": {\"index\": \"places_*\", \"alias\": \"places\"}},
        {\"add\": {\"index\": \"places_${TIMESTAMP}\", \"alias\": \"places\"}},
        {\"remove\": {\"index\": \"toponyms_*\", \"alias\": \"toponyms\"}},
        {\"add\": {\"index\": \"toponyms_${TIMESTAMP}\", \"alias\": \"toponyms\"}}
    ]
}"
```

#### 7. Verify Production

```bash
# Queries now use new indices via aliases
curl -s "http://localhost:9200/places/_count?pretty"
curl -s "http://localhost:9200/_cat/aliases?v"
```

#### 8. Clean Up Old Indices (After Confirmation)

```bash
# List indices to confirm which to delete
curl "http://localhost:9200/_cat/indices?v"

# Delete old indices (wait 7 days for rollback safety)
curl -X DELETE "http://localhost:9200/places_20241201"
curl -X DELETE "http://localhost:9200/toponyms_20241201"
```

### Rollback Procedure

If deployment fails or issues are discovered:

```bash
# Switch aliases back to previous indices
PREVIOUS_DATE="20241201"
curl -X POST "http://localhost:9200/_aliases" -H 'Content-Type: application/json' -d "{
    \"actions\": [
        {\"remove\": {\"index\": \"places_*\", \"alias\": \"places\"}},
        {\"add\": {\"index\": \"places_${PREVIOUS_DATE}\", \"alias\": \"places\"}},
        {\"remove\": {\"index\": \"toponyms_*\", \"alias\": \"toponyms\"}},
        {\"add\": {\"index\": \"toponyms_${PREVIOUS_DATE}\", \"alias\": \"toponyms\"}}
    ]
}"

# Verify rollback
curl "http://localhost:9200/_cat/aliases?v"
curl -s "http://localhost:9200/places/_count?pretty"
```

## Health Monitoring

### Cluster Health Checks

#### Production Health

```bash
es -health
```

This shows:
- Elasticsearch and Kibana running status
- Cluster health (green/yellow/red)
- Index summary with document counts
- Disk usage (production data and snapshots)
- Memory usage

#### Staging Health

```bash
es -staging-health
```

This shows:
- Staging instance status
- Slurm job status
- Cluster health
- Index summary
- Snapshot count

### Manual Health Checks

```bash
# Cluster health
curl "http://localhost:9200/_cluster/health?pretty"

# Detailed cluster state
curl "http://localhost:9200/_cluster/state?pretty"

# Node information
curl "http://localhost:9200/_nodes?pretty"

# Index health
curl "http://localhost:9200/_cat/indices?v&h=index,health,status,docs.count,store.size"

# Disk usage
curl "http://localhost:9200/_cat/allocation?v"
df -h /ix3/ishi/es/data/
du -sh /ix1/ishi/es/snapshots/
```

### Key Metrics to Monitor

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Cluster status | green | yellow (warn), red (critical) |
| Heap usage | <75% | >85% |
| Disk usage (/ix3) | <80% | >90% |
| Search latency (p95) | <100ms | >500ms |
| Document counts | expected ±1% | >5% deviation |

### Log Monitoring

```bash
# Production logs
tail -f /ix1/ishi/es/logs/whg-production.log

# Staging logs (while job running)
source /ix1/ishi/esinfo/es-staging.env
tail -f /ix1/ishi/es/staging-logs/slurm-${SLURM_JOB_ID}.out

# Search for errors
grep ERROR /ix1/ishi/es/logs/whg-production.log | tail -20
```

## Troubleshooting

### Staging Won't Start

**Symptoms**: Slurm job submitted but no environment file created

**Check**:
1. Slurm job status: `squeue -u $USER`
2. Recent log files: `ls -lt /ix1/ishi/es/staging-logs/*.out | head -5`
3. View log: `tail -100 /ix1/ishi/es/staging-logs/slurm-JOBID.out`

**Common causes**:
- Insufficient resources available in Slurm queue
- Local NVMe scratch not available
- Elasticsearch binary not found
- Java not found in PATH

**Solutions**:
```bash
# Check environment file exists
cat /ix1/ishi/elastic/.env | head -20

# Verify binaries
ls -la /ix1/ishi/es-bin/bin/elasticsearch
ls -la /ix1/ishi/jdk-21.0.1/bin/java

# Check Slurm queue
squeue -p htc

# Cancel and restart
scancel JOBID
source /ix1/ishi/elastic/scripts/es.sh -staging-start
```

### Stale Staging Environment File

**Symptoms**: Environment file exists but job is not running

**Solution**:
```bash
# Remove stale file
rm /ix1/ishi/esinfo/es-staging.env

# Start fresh
source /ix1/ishi/elastic/scripts/es.sh -staging-start
```

### Staging Out of Space

**Symptoms**: Indexing job crashes with disk full errors

**Check**:
```bash
source /ix1/ishi/esinfo/es-staging.env
ssh $ES_NODE "df -h $SLURM_SCRATCH"
```

**Solutions**:
1. Create snapshot of current state
2. Stop staging
3. Request more scratch space (if available)
4. Or split work into smaller batches

### Connection Refused to Staging

**Symptoms**: Cannot connect to `http://$ES_NODE:$ES_PORT`

**Check**:
```bash
# Verify job still running
source /ix1/ishi/esinfo/es-staging.env
squeue -j $SLURM_JOB_ID

# Check if ES is listening
ssh $ES_NODE "netstat -tuln | grep $ES_PORT"

# Check ES logs
ssh $ES_NODE "tail -100 $SLURM_SCRATCH/es-staging/logs/elasticsearch.log"
```

**Solutions**:
- Wait longer (ES can take 1-2 minutes to start)
- Check for port conflicts
- Review Slurm job logs for startup errors
- Restart staging instance

### Production Out of Memory

**Symptoms**: Queries are slow, heap usage >85%

**Check**:
```bash
curl "http://localhost:9200/_nodes/stats/jvm?pretty"
curl "http://localhost:9200/_cat/thread_pool?v"
```

**Solutions**:
1. Check for long-running queries: `curl "http://localhost:9200/_tasks?detailed"`
2. Clear field data cache: `curl -X POST "http://localhost:9200/_cache/clear?fielddata=true"`
3. Review query patterns for optimization opportunities
4. Consider increasing heap size in `.env` (requires restart)

### Snapshot Restore Fails

**Symptoms**: Restore operation fails or produces incomplete indices

**Check**:
```bash
# Get restore status
curl "http://localhost:9200/_snapshot/staging_repo/snapshot_name/_status?pretty"

# Check snapshot integrity
curl "http://localhost:9200/_snapshot/staging_repo/snapshot_name?pretty"
```

**Solutions**:
1. Verify snapshot completed successfully
2. Check disk space on production
3. Ensure repository is accessible: `ls -la /ix1/ishi/es/snapshots/staging/`
4. Try restoring specific indices one at a time
5. Check for index.blocks settings

### Ingestion Scripts Crash

**Symptoms**: Python scripts fail during indexing

**All ingestion scripts**:
- Process line-by-line from source files
- Can be safely restarted
- Elasticsearch handles duplicate IDs (updates existing documents)
- No need to delete indices and start over

**Solutions**:
1. Check available memory: `free -h`
2. Review script logs for specific errors
3. Reduce batch size in `processing/settings.py`
4. Restart script — it will resume where it left off

### Force Merge Takes Too Long

**Symptoms**: Force merge runs for hours

**This is normal**:
- Force merge consolidates segments for optimal query performance
- For ~200GB of data, expect 30-60 minutes per index
- Progress is not logged incrementally

**Check if it's actually running**:
```bash
# Check running tasks
curl "http://localhost:9200/_cat/tasks?v"

# Check merge stats
curl "http://localhost:9200/_cat/indices?v&h=index,merges.current"
```

**If stuck**:
- It's probably not stuck, just slow
- Let it finish naturally
- If you must cancel: restart ES (merge will resume on next startup)

### Disk Space Issues

#### Production (/ix3)

```bash
# Check usage
df -h /ix3/ishi/es/data/

# Check index sizes
curl "http://localhost:9200/_cat/indices?v&h=index,store.size"

# Delete old indices (if safe)
curl -X DELETE "http://localhost:9200/old_index_name"
```

#### Snapshots (/ix1)

```bash
# Check usage
du -sh /ix1/ishi/es/snapshots/*

# List snapshots
curl -s "http://localhost:9200/_snapshot/staging_repo/_all?pretty"

# Delete old snapshots
curl -X DELETE "http://localhost:9200/_snapshot/staging_repo/old_snapshot"
```

## Quick Reference

### Essential Commands

```bash
# Production (run on VM)
es -start              # Start Elasticsearch + Kibana
es -stop               # Stop both services
es -restart            # Restart both services
es -health             # Full health check

# Staging (run on CRC login node, use 'source')
source es.sh -staging-start    # Launch staging instance
source es.sh -staging-stop     # Stop staging instance
source es.sh -staging-health   # Health check
source es.sh -staging-status   # Status and document counts
source es.sh -staging-logs     # View recent logs

# Ingestion
es -ingest                     # Ingest all authorities
es -ingest -n gn,wd            # Specific authorities only
es -ingest --skip-existing     # Skip already indexed
es -ingest --check-only        # Check data availability

# Update authority files
python -m processing.fetch_authorities
python -m processing.fetch_authorities -n gn,wd --age 0
```

### Common Queries

```bash
# Load staging connection (if needed)
source /ix1/ishi/esinfo/es-staging.env

# Cluster health
curl "http://localhost:9200/_cluster/health?pretty"

# List indices
curl "http://localhost:9200/_cat/indices?v"

# Document counts
curl "http://localhost:9200/places/_count?pretty"
curl "http://localhost:9200/toponyms/_count?pretty"

# Count by namespace
for ns in gn wd pl tgn gb un; do
    count=$(curl -s "http://localhost:9200/places/_count" \
        -H 'Content-Type: application/json' \
        -d "{\"query\": {\"prefix\": {\"place_id\": \"$ns:\"}}}" | jq .count)
    echo "$ns: $count"
done

# Check aliases
curl "http://localhost:9200/_cat/aliases?v"

# Sample search
curl -s "http://localhost:9200/places/_search?q=label:London&size=5&pretty"
```

### Snapshot Operations

```bash
# Create staging snapshot
source /ix1/ishi/esinfo/es-staging.env
curl -X PUT "http://$ES_NODE:$ES_PORT/_snapshot/staging_repo/checkpoint_$(date +%Y%m%d)?wait_for_completion=true" \
    -H 'Content-Type: application/json' -d '{"indices": "places,toponyms"}'

# List snapshots
curl -s "http://localhost:9200/_snapshot/staging_repo/_all?pretty"

# Delete snapshot
curl -X DELETE "http://localhost:9200/_snapshot/staging_repo/snapshot_name"
```

### Deployment

```bash
# Stop staging
source es.sh -staging-stop

# Deploy to production (run on VM)
cd /ix1/ishi/elastic
python -m processing.deploy_to_production

# Verify
curl -s "http://localhost:9200/_cat/indices?v"
curl -s "http://localhost:9200/places/_count?pretty"
curl -s "http://localhost:9200/_cat/aliases?v"
```

### File Locations

| Item | Location |
|------|----------|
| ES wrapper script | `/ix1/ishi/elastic/scripts/es.sh` |
| Environment config | `/ix1/ishi/elastic/.env` |
| Production data | `/ix3/ishi/es/data/` |
| Production logs | `/ix1/ishi/es/logs/` |
| Staging logs | `/ix1/ishi/es/staging-logs/` |
| Snapshots | `/ix1/ishi/es/snapshots/` |
| Authority files | `/ix1/ishi/data/authorities/` |
| Staging connection info | `/ix1/ishi/esinfo/es-staging.env` |

### Expected Results

After complete ingestion:

- **Places**: ~25-30 million documents
- **Toponyms**: ~80 million unique documents
- **Production storage**: 180-270 GB
- **Snapshot storage**: ~100 GB

### URLs

| Service | URL | Access |
|---------|-----|--------|
| Production ES | http://localhost:9200 | VM only |
| Staging ES | http://$ES_NODE:9201 | Compute node only |
| Kibana | http://localhost:5601 | VM only (tunnel via SSH) |

### Support

For issues or questions:
- Review logs: `/ix1/ishi/es/logs/` or `/ix1/ishi/es/staging-logs/`
- Check GitHub issues: https://github.com/WorldHistoricalGazetteer/elastic
- Contact: Karl Grossner (WHG Project)

---

**Last Updated**: December 2024  
**Elasticsearch Version**: 9.0.0  
**Infrastructure**: University of Pittsburgh CRC