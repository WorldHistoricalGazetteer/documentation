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

Phonetic search is implemented via dense vector similarity on BiLSTM embeddings stored in the `toponyms` index. The system supports multiple query strategies with graceful degradation.

**Reference**: Technical background in [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81)