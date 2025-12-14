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
   ↓
4. For each toponym:
   - Generate IPA transcription (Epitran)
   - Normalise IPA (see below)
   ↓
5. Batch embedding generation on compute nodes
   - Process all toponyms through Siamese BiLSTM
   - Generate 128-dimensional vectors
   ↓
6. Index to staging Elasticsearch (Slurm worker)
   ↓
7. Validate counts and sample data on staging
   ↓
8. Create snapshot to /ix1/whcdh/elastic/snapshots/
   ↓
9. Restore snapshot to production VM
   ↓
10. Switch aliases atomically on production
   ↓
11. Validate production indices
```

### Rationale for Staging Instance

Authority files contain tens of millions of records. Indexing directly on the production VM would:

- Consume CPU and memory needed for query serving
- Risk making the VM unresponsive during bulk operations
- Prevent validation before production exposure

The staging instance on a Slurm worker handles the heavy lifting, with snapshots providing a clean transfer mechanism.

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
3. Index to staging Elasticsearch (Slurm worker or VM)
   ↓
4. For each toponym:
   - Generate IPA transcription (Epitran)
   - Generate embedding via Siamese BiLSTM model
   - Update toponym document
   ↓
5. Validate dataset integrity on staging
   ↓
6. Create snapshot (if staging on Slurm worker)
   ↓
7. Restore to production / switch aliases
```

### Rationale for Flexible Staging

WHG-contributed datasets are much smaller (~200k places, ~500k toponyms) and arrive incrementally. Depending on volume:

- **Small batches**: Can be indexed directly on the VM during low-usage periods
- **Larger contributions**: Use Slurm staging to avoid production impact

The Siamese BiLSTM model is kept loaded on both staging and production for embedding generation.

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

Siamese BiLSTM embeddings are generated as part of the indexing pipeline, prior to snapshot transfer.

### Batch Generation (Authority Files)

Run on Pitt CRC compute nodes with GPU acceleration, indexed to staging Elasticsearch:

```python
# Process authority toponyms in large batches
for batch in scroll_toponyms_without_embeddings(staging_es, batch_size=10000):
    # Extract names
    names = [doc['name'] for doc in batch]
    
    # Generate embeddings (GPU-accelerated batch inference)
    embeddings = siamese_bilstm_model.embed_batch(names)
    
    # Bulk update to staging
    updates = [
        {'_id': doc['_id'], 'doc': {'embedding_bilstm': emb}}
        for doc, emb in zip(batch, embeddings)
    ]
    bulk_update(staging_es, updates)
```

### Incremental Generation (WHG Contributions)

Run during ingestion, either on staging or production depending on volume:

```python
# Process contributed toponyms in smaller batches
for toponym in dataset_toponyms:
    # Generate embedding (CPU inference)
    embedding = siamese_bilstm_model.embed(toponym['name'])
    
    # Index with embedding included
    toponym['embedding_bilstm'] = embedding
    index_toponym(es_client, toponym)
```

The same trained Siamese BiLSTM model is deployed to both staging (Slurm worker) and production (VM), ensuring consistent embeddings across the corpus.

## Incremental Updates

For new dataset ingestion after initial population:

1. Ingest new places/toponyms to versioned indices
2. Generate IPA and embeddings for new toponyms only
3. Merge with existing data or create new index version
4. Switch aliases when ready

Monthly full re-embedding ensures consistency across the corpus as models improve.