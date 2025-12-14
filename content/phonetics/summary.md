# Summary

This architecture provides a scalable, multilingual, phonetic-aware search system for the World Historical Gazetteer. The system is designed to handle approximately 40 million places and 80 million toponyms with sub-100ms query latency.

## Key Design Decisions

### Unified Infrastructure

All components run on Pitt CRC infrastructure, with storage allocated by I/O requirements:

- **Flash storage (/ix3)**: 750GB - 1TB for live Elasticsearch indices
- **Bulk storage (/ix1)**: 1TB for authority files and snapshots

### Two-Index Architecture

- **`places` index**: Core gazetteer records with geometry and metadata
- **`toponyms` index**: Name variants with IPA transcriptions and phonetic embeddings

### BiLSTM Embeddings

Character-level bidirectional LSTM generates 128-dimensional vectors:

- Processes text directly (no IPA required at query time)
- Generalises across scripts and languages
- Enables efficient kNN search via Elasticsearch HNSW

### Alias-Based Deployment

Zero-downtime updates through versioned indices:

1. Create new versioned indices
2. Populate and validate
3. Switch aliases atomically
4. Rollback capability via snapshots

### Graceful Degradation

Multi-stage search with fallbacks:

1. Vector kNN search (primary)
2. Fuzzy text search (fallback)
3. Completion suggester (autocomplete)

## Technology Stack

| Component | Technology |
|-----------|------------|
| Search engine | Elasticsearch 9.x |
| Vector search | HNSW via dense_vector |
| IPA generation | Epitran |
| Embedding model | PyTorch BiLSTM |
| Storage | Pitt CRC /ix1, /ix3 |

## Storage Requirements

| System | Allocation | Purpose |
|--------|------------|---------|
| /ix3 (flash) | 750GB - 1TB | Live Elasticsearch data |
| /ix1 (bulk) | 1TB | Authority files, snapshots |

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Infrastructure | 2 weeks | Storage, Elasticsearch |
| Core indexing | 4 weeks | All authority sources indexed |
| Phonetic enrichment | 4 weeks | IPA transcriptions |
| Embedding generation | 4 weeks | BiLSTM model, embeddings |
| Query integration | 4 weeks | Search endpoints |
| Production rollout | 2 weeks | Live system |

**Total**: ~20 weeks from infrastructure provisioning to production

## References

- [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81) - Original phonetic search proposal
- [Epitran](https://github.com/dmort27/epitran) - Grapheme-to-phoneme library
- [Elasticsearch kNN Search](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html) - Vector search documentation