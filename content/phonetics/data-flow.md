# Data Flow

## Authority File Ingestion

Large-scale authority datasets are processed in batch on Pitt CRC compute nodes.

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
6. Index to versioned indices (places_v2, toponyms_v2)
   ↓
7. Validate counts and sample data
   ↓
8. Switch aliases atomically
   ↓
9. Create snapshot
```

### Rationale for Batch Processing

Authority files contain tens of millions of toponyms. Generating embeddings on-the-fly would be impractical:

- GeoNames: ~20 million toponyms
- Wikidata: ~50 million toponyms
- Full corpus: ~82 million toponyms

Batch processing on compute nodes with GPU acceleration completes in hours rather than weeks.

## WHG-Contributed Dataset Ingestion

Scholarly datasets contributed by WHG users follow a lighter-weight pipeline with on-the-fly embedding generation.

### Pipeline

```
1. Export dataset from WHG Django/PostgreSQL
   ↓
2. Convert to canonical JSON format
   - Same schema as authority ingestion
   - Preserve dataset provenance and attribution
   ↓
3. Index to staging Elasticsearch
   ↓
4. For each toponym (on VM):
   - Generate IPA transcription (Epitran)
   - Generate embedding via Siamese BiLSTM model
   - Update toponym document
   ↓
5. Validate dataset integrity
   ↓
6. Switch aliases to production
   ↓
7. Create snapshot
```

### Rationale for On-the-Fly Processing

WHG-contributed datasets are much smaller (~200k places, ~500k toponyms) and arrive incrementally. On-the-fly embedding generation on the VM:

- Avoids compute node scheduling delays
- Enables faster turnaround for new contributions
- Keeps the Siamese BiLSTM model loaded and warm for query-time inference

The VM maintains a loaded instance of the trained Siamese BiLSTM encoder for both ingestion and query embedding generation.

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

Siamese BiLSTM embeddings are generated differently depending on data source:

### Batch Generation (Authority Files)

Run on Pitt CRC compute nodes with GPU acceleration:

```python
# Process authority toponyms in large batches
for batch in scroll_toponyms_without_embeddings(batch_size=10000):
    # Extract names
    names = [doc['name'] for doc in batch]
    
    # Generate embeddings (GPU-accelerated batch inference)
    embeddings = siamese_bilstm_model.embed_batch(names)
    
    # Bulk update
    updates = [
        {'_id': doc['_id'], 'doc': {'embedding_bilstm': emb}}
        for doc, emb in zip(batch, embeddings)
    ]
    bulk_update(updates)
```

### On-the-Fly Generation (WHG Contributions)

Run on the VM during ingestion:

```python
# Process contributed toponyms individually or in small batches
for toponym in dataset_toponyms:
    # Generate embedding (CPU inference, model kept in memory)
    embedding = siamese_bilstm_model.embed(toponym['name'])
    
    # Index with embedding included
    toponym['embedding_bilstm'] = embedding
    index_toponym(toponym)
```

The same trained Siamese BiLSTM model is used for both pathways, ensuring consistent embeddings across the corpus.

## Incremental Updates

For new dataset ingestion after initial population:

1. Ingest new places/toponyms to versioned indices
2. Generate IPA and embeddings for new toponyms only
3. Merge with existing data or create new index version
4. Switch aliases when ready

Monthly full re-embedding ensures consistency across the corpus as models improve.