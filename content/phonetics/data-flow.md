# Data Flow

## Authority Ingestion Pipeline

Each authority source follows the same enrichment flow:

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
   - Generate BiLSTM embedding
   ↓
5. Index to versioned indices (places_v2, toponyms_v2)
   ↓
6. Validate counts and sample data
   ↓
7. Switch aliases atomically
   ↓
8. Create snapshot
```

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

BiLSTM embeddings are generated in batch after IPA transcription:

```python
# Scroll through toponyms without embeddings
for batch in scroll_toponyms_without_embeddings(batch_size=1000):
    # Extract names
    names = [doc['name'] for doc in batch]
    
    # Generate embeddings (batched for efficiency)
    embeddings = bilstm_model.embed_batch(names)
    
    # Bulk update
    updates = [
        {'_id': doc['_id'], 'doc': {'embedding_bilstm': emb}}
        for doc, emb in zip(batch, embeddings)
    ]
    bulk_update(updates)
```

## Incremental Updates

For new dataset ingestion after initial population:

1. Ingest new places/toponyms to versioned indices
2. Generate IPA and embeddings for new toponyms only
3. Merge with existing data or create new index version
4. Switch aliases when ready

Monthly full re-embedding ensures consistency across the corpus as models improve.