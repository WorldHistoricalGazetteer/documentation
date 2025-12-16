# Summary

This architecture provides a scalable, multilingual, phonetic-aware search system for the World Historical Gazetteer. The system is designed to handle approximately 40 million places and 80 million unique toponyms with sub-100ms query latency.

## Key Design Decisions

### Two-Instance Architecture

Staging and production Elasticsearch instances are separated to protect query performance:

- **Production (VM, /ix3)**: Serves live queries; receives completed indices via snapshot restore
- **Staging (Slurm worker)**: Handles bulk indexing and embedding generation

### Storage Allocation

Storage is allocated by I/O requirements:

- **Flash storage (/ix3)**: 750GB - 1TB for production Elasticsearch indices
- **Bulk storage (/ix1)**: 1TB for authority files and snapshots
- **Local NVMe scratch**: ~870GB for staging ES (automatically provisioned per Slurm job)

### Two-Index Architecture

- **`places` index**: Core gazetteer records with geometry and metadata; references toponyms by `name@lang`
- **`toponyms` index**: Unique name@language combinations with IPA transcriptions and phonetic embeddings

The toponyms index stores each unique name@language combination once, regardless of how many places share it. This optimises embedding generation and storage.

### Siamese BiLSTM Embeddings

Character-level bidirectional LSTM trained with Siamese architecture generates 128-dimensional vectors:

- Learns phonetic similarity from positive/negative toponym pairs
- Processes text directly (no IPA required at query time)
- Generalises across scripts and languages
- Enables efficient kNN search via Elasticsearch HNSW

### Dual Data Sources

The system indexes both authority files and WHG-contributed datasets:

| Source | Places | Processing Location |
|--------|--------|---------------------|
| Authority files | ~39M | Staging (Slurm worker) |
| WHG contributions | ~200K | Staging or production |

**Unique toponyms**: ~80M (deduplicated across all sources)

Both sources share the same indices and are searchable together. New contributions only require embedding generation for genuinely new name@language combinations.

### Snapshot-Based Deployment

Zero-downtime updates through staged indexing:

1. Build and validate indices on staging
2. Create snapshot to shared repository (/ix1)
3. Restore snapshot to production
4. Switch aliases atomically
5. Rollback capability via previous snapshots

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
| Embedding model | PyTorch Siamese BiLSTM |
| Inference runtime | ONNX (VM), PyTorch+CUDA (compute) |
| Storage | Pitt CRC /ix1, /ix3 |

## Storage Requirements

| System | Allocation | Purpose |
|--------|------------|---------|
| /ix3 (flash) | 750GB - 1TB | Production Elasticsearch data |
| /ix1 (bulk) | 1TB | Authority files, snapshots |
| Local NVMe scratch | ~870GB available | Staging ES (per Slurm job) |

## Timeline

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Infrastructure | 2 weeks | Storage, Elasticsearch |
| Core indexing | 4 weeks | All authority sources indexed |
| Phonetic enrichment | 4 weeks | IPA transcriptions |
| Embedding generation | 4 weeks | Siamese BiLSTM model, embeddings |
| Query integration | 4 weeks | Search endpoints |
| Production rollout | 2 weeks | Live system |

**Total**: ~20 weeks from infrastructure provisioning to production

## References

- [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81) - Original phonetic search proposal
- [Epitran](https://github.com/dmort27/epitran) - Grapheme-to-phoneme library
- [Elasticsearch kNN Search](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html) - Vector search documentation
- [Siamese Networks for One-Shot Learning](https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf) - Foundational paper