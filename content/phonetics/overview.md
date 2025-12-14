# Overview
> **NOTE:** This entire document requires an update following a decision to move the entire Elasticsearch infrastructure to Pitt CRC.

This document outlines the complete integration plan for adding multilingual phonetic search to the existing WHG stack (Django + PostgreSQL/PostGIS + Elasticsearch). The goal is to support IPA-based matching, phonetic embeddings, and robust cross-lingual similarity without replacing existing infrastructure.

The system is split into two operational domains:

- **Online stack (DigitalOcean)**  
  Django, PostgreSQL/PostGIS, Elasticsearch indices, query-time IPA conversion, and real-time search.

- **Offline phonetic pipeline (Pitt CRC)**  
  Bulk IPA generation, embedding creation, Siamese model training, and ingestion of enriched data back into Elasticsearch.

**Reference**: Full technical background in [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81)
