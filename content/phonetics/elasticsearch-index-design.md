# Elasticsearch Index Design

## IPA Index
```json
{
  "ipa_id": "sha256_hash",           // keyword (primary key)
  "ipa": "spɹɪŋfild",                // text + ngram analyzer
  "ipa_stressed": "ˈspɹɪŋˌfild",     // text (optional, for disambiguation)
  "language": "en",                  // keyword
  "embedding": [0.23, -0.15, ...],   // dense_vector (64-256 dim)
  "embedding_version": "v3_20251117", // keyword (critical for model updates)
  "canonical_toponyms": [             // text[] (sample representations)
    "Springfield",
    "Springfeild"  // historical variant
  ],
  "panphon_features": [...],         // dense_vector (24-dim, optional)
  "last_updated": "2025-11-17T10:30:00Z" // date
}
```

**Analyzers**:
- `ipa` field: Custom ngram analyzer (2-4 grams) for fuzzy phonetic matching.
- `canonical_toponyms`: Standard multilingual text analyzer.

## Toponym Index
```json
{
  "toponym_id": "uuid",              // keyword
  "toponym": "Springfield",          // text (multilingual analyzers)
  "language": "en",                  // keyword
  "ipa_id": "sha256_hash",           // keyword (foreign key to ipa_index)
  "place_ids": ["place_123", ...],   // keyword[] (many-to-many)
  "variants": ["Springfeild"],       // text[] (historical spellings)
  "last_updated": "2025-11-17T10:30:00Z"
}
```

## Place Index
```json
{
  "place_id": "place_123",           // keyword
  "title": "Springfield, MA",        // text
  "geometry": {...},                 // geo_shape
  // ... existing WHG fields ...
  "toponym_ids": ["uuid1", ...],     // keyword[] (foreign keys)
  "primary_ipa_id": "sha256_hash"    // keyword (optional denormalisation)
}
```

**Optional optimisation**: Denormalise `primary_ipa_id` in `place_index` for direct vector search on places (bypasses toponym join for common cases).
