# Components

## Infrastructure

All components run on Pitt CRC infrastructure:

| Component | Storage | Purpose |
|-----------|---------|---------|
| Elasticsearch 9.x | /ix3 (flash) | Live indices, query serving |
| Authority files | /ix1 (bulk) | Source datasets, snapshots |
| Processing scripts | /ix1 (bulk) | Ingestion, embedding generation |

## Elasticsearch Indices

### Places Index

Core gazetteer records with geometry and metadata. Each place aggregates toponyms from multiple authority sources.

```json
{
  "place_id": "gn:2643743",
  "namespace": "gn",
  "label": "London",
  "toponyms": ["London@en", "Londra@it", "Londres@fr", "Лондон@ru"],
  "ccodes": ["GB"],
  "locations": [{
    "geometry": { "type": "Point", "coordinates": [-0.1276, 51.5074] },
    "rep_point": { "lon": -0.1276, "lat": 51.5074 }
  }],
  "types": [{ "identifier": "P", "label": "geonames", "sourceLabel": "PPL" }],
  "relations": [{ "relationType": "sameAs", "relationTo": "wd:Q84", "certainty": 1.0 }]
}
```

### Toponyms Index

Individual name attestations with phonetic data. Each toponym links to its parent place and carries:

- Language-tagged name (`name@lang` format, parsed by ingest pipeline)
- IPA transcription (where available)
- BiLSTM phonetic embedding (128 dimensions)
- Temporal attestation spans

```json
{
  "place_id": "gn:2643743",
  "name": "London",
  "name_lower": "london",
  "lang": "en",
  "ipa": "ˈlʌndən",
  "embedding_bilstm": [0.23, -0.15, ...],
  "timespans": [{ "start": 1800, "end": 2025 }],
  "suggest": { "input": ["London"], "contexts": { "lang": ["en"] } }
}
```

## Processing Components

### IPA Generation (Epitran)

[Epitran](https://github.com/dmort27/epitran) provides grapheme-to-phoneme conversion for 90+ languages. IPA transcriptions are generated during toponym ingestion.

Supported language mappings are defined in the processing scripts, covering major European, Asian, and Middle Eastern languages. Unsupported languages fall back to transliteration or remain without IPA.

### Phonetic Embeddings (BiLSTM)

A character-level bidirectional LSTM generates 128-dimensional dense vectors from toponym text. The model:

- Processes character sequences directly (no IPA required)
- Learns phonetic patterns from training data
- Generalises across scripts and languages
- Enables approximate nearest neighbour search via Elasticsearch kNN

The BiLSTM approach was chosen over rule-based alternatives (e.g., PanPhon feature vectors) because it handles scripts and languages without explicit phonological rules.

### Completion Suggester

The `suggest` field provides type-ahead autocomplete functionality, with language context for filtering suggestions by user locale.