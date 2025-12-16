# Overview

This document outlines the architecture for multilingual phonetic search in the World Historical Gazetteer (WHG). The system uses phonetic embeddings to enable cross-lingual place name similarity search across approximately 80 million toponyms.

The infrastructure is hosted at the University of Pittsburgh Center for Research Computing (Pitt CRC), using a two-instance Elasticsearch architecture:

- **Production instance** (VM on /ix3): Serves live queries with high availability
- **Staging instance** (Slurm worker): Handles indexing workloads without impacting production

Authority source files and snapshots are maintained on bulk storage (/ix1), with snapshots serving as the transfer mechanism between staging and production.

## Goals

- Enable phonetic similarity search for historical place names
- Support cross-lingual matching of phonetic variants (e.g., "München" ↔ "Munich" ↔ "Мюнхен")
- Distinguish phonetic variants from unrelated endonyms/exonyms (e.g., "Deutschland" vs "Germany" vs "Allemagne")
- Handle historical spelling variants and transcription differences
- Provide robust fallback paths when phonetic matching fails

## Why Not Elasticsearch's Built-in Phonetic Analysis?

Elasticsearch provides phonetic token filters (Soundex, Metaphone, Double Metaphone, Beider-Morse, etc.) but these have significant limitations for multilingual gazetteer data:

| Limitation | Impact on WHG |
|------------|---------------|
| **English-centric** | Algorithms designed for English phonology; poor results for German, Slavic, Arabic, etc. |
| **Single script** | Cannot process Cyrillic, Greek, Arabic, CJK, or other non-Latin scripts |
| **No learning** | Fixed rules cannot adapt to toponym-specific patterns or historical forms |
| **Coarse matching** | Binary bucket assignment produces many false positives and negatives |
| **No cross-lingual awareness** | Cannot learn that "München" and "Мюнхен" represent the same sounds |

The Siamese BiLSTM approach addresses these limitations:

| Advantage | How it helps |
|-----------|--------------|
| **Multilingual by construction** | Trained on cross-lingual equivalences from Wikidata/GeoNames |
| **Script-agnostic** | Characters are tokens; learns patterns across Latin, Cyrillic, Greek, CJK |
| **Domain-tuned** | Trained specifically on place name equivalences, not general vocabulary |
| **Continuous similarity** | Returns distance scores enabling ranked results, not binary matches |
| **Learnable** | Can improve with more training data; adapts to historical forms if present in sources |

The goal is not a perfect phonetic model, but a significant improvement over rule-based algorithms for the specific domain of historical and multilingual place names.

## Limitations

This approach has known limitations that should be understood:

**Training data dependency**: The model learns phonetic similarity from equivalences present in GeoNames and Wikidata. If a historical spelling variant is very different from anything in the training data, the model may not recognise it. Coverage depends on the richness of historical toponyms in the source authorities.

**No explicit phonological knowledge**: The model learns character-level patterns implicitly, not from linguistic rules. It has no understanding of historical sound changes (e.g., the Great Vowel Shift) — it can only generalise from patterns it has seen.

**Endonym/exonym clustering is imperfect**: The initial PanPhon-based clustering that bootstraps training is limited by Epitran's language coverage (~30 languages). Iterative refinement improves this, but errors in early clustering can propagate.

**Novel scripts**: Scripts not well-represented in training data (e.g., rare historical scripts, minority languages) will have weaker coverage.

**Not a replacement for expert knowledge**: For serious historical research, phonetic search is a discovery aid, not a definitive matching system. Results should be validated by domain experts.

Despite these limitations, the system should significantly outperform Elasticsearch's built-in phonetic algorithms for multilingual and cross-script matching, which is the primary goal.

## Architecture Summary

The phonetic search system extends the core WHG Elasticsearch deployment:

- **`places` index**: Core place records with geometry, classifications, and cross-references
- **`toponyms` index**: Unique name@language combinations with phonetic embeddings

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