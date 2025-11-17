# Components

## Online Components (DigitalOcean)
- **Django**: Provides application logic and API.
- **PostgreSQL/PostGIS**: Stores Places, geometry, and relational structure.
- **Elasticsearch**:  
  - `place_index` (existing)
  - `toponym_index` (new, handles many-to-many Place↔Toponym)
  - `ipa_index` (new, deduplicated IPA forms)
- **Real-time phonetic query system**:
  - Epitran-based G2P converter for query IPA generation.
  - Lightweight inference model (quantized/distilled version of trained Siamese BiLSTM) for generating query embeddings on-the-fly.
  - PanPhon for phonetic feature extraction.

## Offline Components (Pitt CRC)
- Access to full Wikidata and Geonames datasets.
- Virtually unlimited compute for:
  - Bulk G2P → IPA transcription using Epitran.
  - PanPhon feature extraction and normalisation.
  - Training and retraining of Siamese BiLSTM models.
  - Generating phonetic embeddings.
- Outbound-only HTTP access for pushing bulk updates to Elasticsearch.

## Rationale for Separate Indices
- **`toponym_index`**: New index to handle many-to-many relationships (one toponym → many places; one place → many toponyms). This is critical because "Springfield" maps to 50+ distinct places.
- **`ipa_index`**: Global deduplication layer. Stores each unique IPA form once, dramatically reducing embedding storage and computation costs.
- **`place_index`**: Core gazetteer records with geometry and metadata (existing).
