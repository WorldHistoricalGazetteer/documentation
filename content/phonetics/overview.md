# Overview

This document outlines the architecture for multilingual phonetic search in the World Historical Gazetteer (WHG). The system supports IPA-based matching and phonetic embeddings to enable cross-lingual place name similarity search across approximately 80 million toponyms.

The infrastructure is hosted at the University of Pittsburgh Center for Research Computing (Pitt CRC), using a two-instance Elasticsearch architecture:

- **Production instance** (VM on /ix3): Serves live queries with high availability
- **Staging instance** (Slurm worker): Handles indexing workloads without impacting production

Authority source files and snapshots are maintained on bulk storage (/ix1), with snapshots serving as the transfer mechanism between staging and production.

## Goals

- Enable phonetic similarity search for historical place names
- Support cross-lingual matching (e.g., "München" ↔ "Munich" ↔ "Мюнхен")
- Handle historical spelling variants and transcription differences
- Provide robust fallback paths when phonetic matching fails

## Architecture Summary

The phonetic search system extends the core WHG Elasticsearch deployment:

- **`places` index**: Core place records with geometry, classifications, and cross-references
- **`toponyms` index**: Unique name@language combinations with IPA transcriptions and phonetic embeddings

The system uses a two-instance architecture: a persistent production Elasticsearch on the VM, and an **ephemeral staging Elasticsearch** spun up on Slurm workers only for the duration of indexing jobs. This protects production from indexing workload while leveraging compute node resources for batch processing.

The `toponyms` index is designed for deduplication: each unique name@language string appears only once, regardless of how many places share that name. This optimises embedding generation (computed once per unique toponym) and storage (embeddings stored once, referenced by many places).

Phonetic search is implemented via dense vector similarity on Siamese BiLSTM embeddings stored in the `toponyms` index. The system supports multiple query strategies with graceful degradation.

## Data Sources

The system indexes two categories of place data:

### Authority Files

Large-scale reference gazetteers used for reconciliation and enrichment:

- GeoNames, Wikidata, Getty TGN, OpenStreetMap, Pleiades, and others
- ~39 million places
- Indexed on staging Elasticsearch (Slurm worker)
- Embeddings generated in batch on compute nodes
- Transferred to production via snapshot/restore

### WHG-Contributed Datasets

Scholarly datasets contributed by WHG users and partner projects:

- ~200,000 places (and growing)
- The core research content of WHG
- Converted to canonical JSON format for ingestion
- Embeddings generated on-the-fly by the VM during indexing

### Toponyms Index

The `toponyms` index contains **unique name@language combinations** extracted from all sources:

- Estimated ~80 million unique toponyms across all authorities and contributions
- Each toponym stored once, regardless of how many places share it
- Places reference toponyms; toponyms carry the embeddings
- This design avoids redundant embedding computation and storage

Both authority and contributed places are searchable together, with phonetic matching powered by the shared toponyms index.

**Reference**: Technical background in [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81)