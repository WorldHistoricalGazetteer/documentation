# Overview

This document outlines the architecture for multilingual phonetic search in the World Historical Gazetteer (WHG). The system supports IPA-based matching and phonetic embeddings to enable cross-lingual place name similarity search across approximately 80 million toponyms.

The entire infrastructure is hosted at the University of Pittsburgh Center for Research Computing (Pitt CRC), with Elasticsearch deployed on high-performance flash storage (/ix3) and authority source files maintained on bulk storage (/ix1).

## Goals

- Enable phonetic similarity search for historical place names
- Support cross-lingual matching (e.g., "München" ↔ "Munich" ↔ "Мюнхен")
- Handle historical spelling variants and transcription differences
- Provide robust fallback paths when phonetic matching fails

## Architecture Summary

The phonetic search system extends the core WHG Elasticsearch deployment:

- **`places` index**: Core place records with geometry, classifications, and cross-references
- **`toponyms` index**: Name variants with language tags, temporal attestations, IPA transcriptions, and phonetic embeddings

Phonetic search is implemented via dense vector similarity on Siamese BiLSTM embeddings stored in the `toponyms` index. The system supports multiple query strategies with graceful degradation.

## Data Sources

The system indexes two categories of place data:

### Authority Files

Large-scale reference gazetteers used for reconciliation and enrichment:

- GeoNames, Wikidata, Getty TGN, OpenStreetMap, Pleiades, and others
- ~39 million places, ~82 million toponyms
- Processed in batch on Pitt CRC compute nodes
- Embeddings generated offline before indexing

### WHG-Contributed Datasets

Scholarly datasets contributed by WHG users and partner projects:

- ~200,000 places, ~500,000 toponyms (and growing)
- The core research content of WHG
- Converted to canonical JSON format for ingestion
- Embeddings generated on-the-fly by the VM during indexing

Both data sources follow the same index schemas and are searchable together, enabling contributed places to be matched against the full authority corpus.

**Reference**: Technical background in [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81)