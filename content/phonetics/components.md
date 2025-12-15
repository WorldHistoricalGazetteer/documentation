# Components

## Infrastructure

The system uses a two-instance Elasticsearch architecture on Pitt CRC infrastructure:

| Component | Location | Purpose |
|-----------|----------|---------|
| Production Elasticsearch | VM, /ix3 (flash) | Live indices, query serving |
| Staging Elasticsearch | Slurm worker, local NVMe scratch | Index building, embedding enrichment |
| Authority files | /ix1 (bulk) | Source datasets |
| Snapshots | /ix1 (bulk) | Transfer mechanism, backup |
| Processing scripts | /ix1 (bulk) | Ingestion, embedding generation |

The staging instance runs on local NVMe scratch storage (`$SLURM_SCRATCH`, ~870GB available), providing fast I/O for indexing operations while protecting the production VM from workload spikes. Snapshots transfer completed indices from staging to production via the shared /ix1 filesystem.

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

### Phonetic Embeddings (Siamese BiLSTM)

A character-level bidirectional LSTM, trained using a Siamese architecture, generates 128-dimensional dense vectors from toponym text. The Siamese training approach uses pairs (or triplets) of toponyms with shared weights to learn phonetic similarity directly.

The model:

- Processes character sequences directly (no IPA required)
- Learns phonetic similarity from positive/negative pairs
- Generalises across scripts and languages
- Enables approximate nearest neighbour search via Elasticsearch kNN

The Siamese BiLSTM approach was chosen over rule-based alternatives (e.g., PanPhon feature vectors) because it handles scripts and languages without explicit phonological rules, and learns what "sounds similar" from real-world toponym equivalences.

### Completion Suggester

The `suggest` field provides type-ahead autocomplete functionality, with language context for filtering suggestions by user locale.