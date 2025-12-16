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

The staging instance is **ephemeral**, spun up only for the duration of indexing jobs. It runs on local NVMe scratch storage (`$SLURM_SCRATCH`, ~870GB available), providing fast I/O for indexing operations. When the Slurm job completes, the staging instance and its local data are automatically cleaned up. Snapshots written to the shared /ix1 filesystem persist the completed indices for transfer to production.

## Elasticsearch Indices

### Places Index

Core gazetteer records with geometry and metadata. Each place references toponyms by their `name@lang` identifiers.

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

Unique name@language combinations with phonetic data. Each toponym appears **once** in this index, regardless of how many places share it:

- Unique `name@lang` identifier (e.g., "London@en")
- Siamese BiLSTM phonetic embedding (128 dimensions)
- Completion suggester for type-ahead

```json
{
  "toponym_id": "London@en",
  "name": "London",
  "name_lower": "london",
  "lang": "en",
  "embedding_bilstm": [0.23, -0.15, ...],
  "suggest": { "input": ["London"], "contexts": { "lang": ["en"] } }
}
```

This design ensures:

- **Embedding efficiency**: Each unique toponym is embedded once, not once per place
- **Storage optimisation**: ~80M unique toponyms vs potentially hundreds of millions of place-toponym pairs
- **Query simplicity**: Search the toponyms index, then join to places

## Processing Components

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