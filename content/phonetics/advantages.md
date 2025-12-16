# Advantages of This Architecture

## Two-Instance Isolation

Separating staging (Slurm worker) from production (VM) provides:

- **Production stability**: Query-serving VM is protected from indexing workload spikes
- **Safe validation**: New indices can be validated before production exposure
- **Resource optimisation**: Staging can use compute node resources (GPU, high memory) without impacting live queries
- **Clean rollback**: Production snapshots provide instant recovery
- **Cost efficiency**: Staging is ephemeral, consuming resources only during indexing jobs

## Unified Infrastructure

All components run on Pitt CRC infrastructure, eliminating synchronisation complexity:

- No network latency between processing and indexing
- Direct filesystem access for authority files and snapshots
- Simplified security model (no cross-site authentication)
- Single administrative domain

## Scalable Storage Tiers

Storage is allocated based on I/O requirements:

- **Flash storage (/ix3)**: High IOPS for production Elasticsearch queries
- **Local NVMe scratch**: ~870GB fast storage for staging ES indexing
- **Bulk storage (/ix1)**: Cost-effective capacity for source files and snapshots

## Zero-Downtime Deployments

Snapshot-based transfer from staging to production enables:

- Validation of new data before production exposure
- Instant rollback by restoring previous snapshot
- No query interruption during reindexing (happens on staging)
- Clear versioning of index generations
- Atomic alias switching on production after restore

## Flexible Embedding Generation

The architecture supports both bulk and incremental ingestion:

- **Authority files**: Batch processing on staging with GPU acceleration
- **WHG contributions**: Flexible routing to staging or production depending on volume

This ensures authority files (tens of millions of unique toponyms) are processed on dedicated resources, while smaller contributed datasets can be handled with minimal overhead.

## Toponym Deduplication

Storing unique name@language combinations in a separate index provides:

- **Embedding efficiency**: Each toponym embedded once, regardless of how many places share it
- **Storage optimisation**: ~80M unique toponyms vs potentially hundreds of millions of place-toponym pairs
- **Incremental updates**: New contributions only require embedding generation for genuinely new toponyms
- **Query simplicity**: Search toponyms first, then join to places

## Efficient Phonetic Search

### Advantages over Elasticsearch Built-in Phonetic Analysis

Elasticsearch's phonetic token filters (Soundex, Metaphone, Double Metaphone, Beider-Morse) are designed for English names and single-script text. They cannot handle WHG's multilingual, multi-script gazetteer data effectively.

The Siamese BiLSTM embedding approach provides:

- **Multilingual by construction**: Trained on actual cross-lingual equivalences, not English phonological rules
- **Script-agnostic**: Learns patterns across Latin, Cyrillic, Greek, CJK, Arabic — any script present in training data
- **Continuous similarity scores**: Ranked results rather than binary bucket matching
- **Domain-tuned**: Trained specifically on place name equivalences from GeoNames/Wikidata
- **Learnable**: Improves with more training data; can adapt to historical forms if present in sources

The model learns to distinguish phonetic variants (e.g., "München" ↔ "Munich" ↔ "Мюнхен") from etymologically unrelated endonyms/exonyms (e.g., "Deutschland" vs "Germany" vs "Allemagne"), enabling more accurate matching and clustering.

### Operational characteristics

- Character-level processing without IPA dependency at query time
- Sub-10ms embedding generation for queries
- Approximate nearest neighbour search via Elasticsearch HNSW

### Known limitations

The model is not perfect. It learns from training data, so novel historical forms very different from anything in GeoNames/Wikidata may not match well. Scripts and languages poorly represented in training will have weaker coverage. The goal is significant improvement over rule-based phonetic algorithms, not perfection.

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