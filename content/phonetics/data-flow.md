# Data Flow

## Authority File Ingestion

Large-scale authority datasets are processed on Slurm workers with a dedicated staging Elasticsearch instance. This isolates indexing workload from the production VM.

### Pipeline

```
1. Download authority data to /ix1/whcdh/data/authorities/{namespace}/
   ↓
2. Parse source format (JSON, CSV, N-Triples, etc.)
   ↓
3. For each place:
   - Extract toponyms with language tags
   - Build locations array with geometry
   - Create cross-references (relations)
   - Store toponym references as name@lang identifiers
   ↓
4. Collect unique toponyms across all places:
   - Deduplicate by name@lang key
   - Each unique toponym processed once
   ↓
5. For each unique toponym:
   - Generate IPA transcription (Epitran)
   - Normalise IPA (see below)
   ↓
6. Batch embedding generation on compute nodes
   - Process unique toponyms through Siamese BiLSTM
   - Generate 128-dimensional vectors
   ↓
7. Index places and toponyms to staging Elasticsearch
   ↓
8. Validate counts and sample data on staging
   ↓
9. Create snapshot to /ix1/whcdh/elastic/snapshots/
   ↓
10. Restore snapshot to production VM
   ↓
11. Switch aliases atomically on production
   ↓
12. Validate production indices
```

### Rationale for Ephemeral Staging Instance

Authority files contain tens of millions of records. Indexing directly on the production VM would:

- Consume CPU and memory needed for query serving
- Risk making the VM unresponsive during bulk operations
- Prevent validation before production exposure

The staging instance on a Slurm worker handles the heavy lifting. It is **ephemeral**: spun up when the job starts, destroyed when the job completes. Snapshots written to /ix1 before job completion are the sole mechanism for persisting the indexed data.

## WHG-Contributed Dataset Ingestion

Scholarly datasets contributed by WHG users follow a similar staged workflow, but with on-the-fly embedding generation due to smaller volumes.

### Pipeline

```
1. Export dataset from WHG Django/PostgreSQL
   ↓
2. Convert to canonical JSON format
   - Same schema as authority ingestion
   - Preserve dataset provenance and attribution
   ↓
3. Extract unique toponyms from dataset
   - Deduplicate by name@lang key
   - Check which toponyms already exist in index
   ↓
4. For each new unique toponym:
   - Generate IPA transcription (Epitran)
   - Generate embedding via Siamese BiLSTM model
   ↓
5. Index places and new toponyms to staging or production
   ↓
6. Validate dataset integrity
   ↓
7. Create snapshot (if staging on Slurm worker)
   ↓
8. Restore to production / switch aliases
```

### Rationale for Flexible Staging

WHG-contributed datasets are much smaller (~200k places) and arrive incrementally. Depending on volume:

- **Small batches**: Can be indexed directly on the VM during low-usage periods
- **Larger contributions**: Use Slurm staging to avoid production impact

New toponyms from contributions are checked against the existing toponyms index; only genuinely new name@lang combinations require embedding generation.

## IPA Generation

IPA transcriptions are generated using Epitran with language-specific G2P models:

```python
import epitran

# Language code mapping (ISO 639-1 → Epitran code)
LANG_MAP = {
    'en': 'eng-Latn',
    'fr': 'fra-Latn',
    'de': 'deu-Latn',
    'es': 'spa-Latn',
    # ... ~30 supported languages
}

def generate_ipa(text, lang_code):
    epitran_code = LANG_MAP.get(lang_code)
    if not epitran_code:
        return None
    
    try:
        epi = epitran.Epitran(epitran_code)
        return epi.transliterate(text)
    except Exception:
        return None
```

**Fallback strategy**:

- If language unsupported: attempt transliteration via nearest-supported language
- If transliteration fails: leave `ipa` field empty, rely on text-based matching
- Log failures for future model expansion

## IPA Normalisation

Consistent normalisation prevents duplicate representations of the same pronunciation:

1. **Unicode NFC normalisation** (canonical decomposition + composition)
2. **Remove stress marks** (`ˈ` primary, `ˌ` secondary) for base matching
3. **Remove syllable boundaries** (`.` character)
4. **Canonical diacritic ordering** (nasalisation before length)
5. **Strip whitespace**
6. **Case normalisation** (IPA is case-sensitive but we normalise for consistency)

## Embedding Generation

Siamese BiLSTM embeddings are generated for unique toponyms only, prior to snapshot transfer.

### Batch Generation (Authority Files)

Run on Pitt CRC compute nodes with GPU acceleration, indexed to staging Elasticsearch:

```python
# Process unique toponyms in large batches
for batch in scroll_toponyms_without_embeddings(staging_es, batch_size=10000):
    # Extract names
    names = [doc['name'] for doc in batch]
    
    # Generate embeddings (GPU-accelerated batch inference)
    embeddings = siamese_bilstm_model.embed_batch(names)
    
    # Bulk update to staging
    updates = [
        {'_id': doc['toponym_id'], 'doc': {'embedding_bilstm': emb}}
        for doc, emb in zip(batch, embeddings)
    ]
    bulk_update(staging_es, updates)
```

### Incremental Generation (WHG Contributions)

Run during ingestion for new unique toponyms only:

```python
# Check which toponyms are genuinely new
new_toponyms = [t for t in dataset_toponyms 
                if not toponym_exists(es_client, t['toponym_id'])]

# Generate embeddings only for new toponyms
for toponym in new_toponyms:
    embedding = siamese_bilstm_model.embed(toponym['name'])
    toponym['embedding_bilstm'] = embedding
    index_toponym(es_client, toponym)
```

This deduplication means a contribution of 10,000 places might only require embedding generation for a few hundred genuinely new name@lang combinations.

The same trained Siamese BiLSTM model is deployed to both staging (Slurm worker) and production (VM), ensuring consistent embeddings across the corpus.

## Incremental Updates

For new dataset ingestion after initial population:

1. Ingest new places/toponyms to versioned indices
2. Generate IPA and embeddings for new toponyms only
3. Merge with existing data or create new index version
4. Switch aliases when ready

Monthly full re-embedding ensures consistency across the corpus as models improve.