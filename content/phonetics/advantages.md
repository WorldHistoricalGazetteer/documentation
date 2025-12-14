# Advantages of This Architecture

## Unified Infrastructure

All components run on Pitt CRC infrastructure, eliminating synchronisation complexity:

- No network latency between processing and indexing
- Direct filesystem access for authority files and snapshots
- Simplified security model (no cross-site authentication)
- Single point of administration

## Scalable Storage Tiers

Storage is allocated based on I/O requirements:

- **Flash storage (/ix3)**: High IOPS for Elasticsearch queries and indexing
- **Bulk storage (/ix1)**: Cost-effective capacity for source files and snapshots

## Zero-Downtime Deployments

Alias-based index switching enables:

- Validation of new data before production exposure
- Instant rollback by re-pointing aliases
- No query interruption during reindexing
- Clear versioning of index generations

## Dual-Path Embedding Generation

The architecture supports both bulk and incremental ingestion:

- **Authority files**: Batch processing on compute nodes with GPU acceleration
- **WHG contributions**: On-the-fly embedding on the VM

This ensures authority files (tens of millions of toponyms) are processed efficiently, while contributed datasets get fast turnaround without compute node scheduling delays.

## Efficient Phonetic Search

The Siamese BiLSTM embedding approach provides:

- Character-level processing without IPA dependency at query time
- Cross-script matching (Latin ↔ Cyrillic ↔ Arabic ↔ etc.)
- Learned similarity from real-world toponym equivalences
- Sub-10ms embedding generation for queries

## Graceful Degradation

Multiple search strategies ensure results are always returned:

1. Vector kNN search (primary, highest quality)
2. Fuzzy text search (fallback for embedding failures)
3. Completion suggester (type-ahead autocomplete)

## Unified Search Across Sources

WHG-contributed datasets and authority files share the same indices:

- Contributed places searchable against full authority corpus
- Consistent ranking and similarity scores
- Single query covers all data sources

## Maintainability

Clear separation of concerns:

- Authority ingestion scripts per source
- Contributed dataset export and conversion
- Embedding generation as independent post-processing
- Model training isolated from production serving
- Snapshot-based backup and recovery

## Research Reproducibility

The architecture supports scholarly use:

- Versioned models with documented training parameters
- Snapshot history for temporal analysis
- Clear provenance from authority sources and contributed datasets
- Open-source processing pipeline