# Deployment Plan

## Phase 1: Infrastructure Setup

### Staging (Slurm)
- [x] Verify local NVMe scratch availability (~870GB at $SLURM_SCRATCH)
- [x] Configure ephemeral Elasticsearch on Slurm worker using local scratch
- [ ] Configure for bulk indexing workload
- [ ] Document Slurm job submission

### Production VM
- [x] Install Elasticsearch 9.x on VM
- [ ] Provision /ix3 flash storage (750GB - 1TB)
- [ ] Configure for query-serving workload (heap, thread pools)

### Shared Infrastructure
- [x] Provision /ix1 bulk storage (1TB)
- [ ] Configure shared snapshot repository on /ix1
- [ ] Set up monitoring (cluster health, index sizes)
- [ ] Configure ingress via index.whgazetteer.org and kibana.whgazetteer.org

## Phase 2: Core Index Population

- [ ] Create index schemas with pipelines on staging
- [ ] Download authority source files to /ix1
- [ ] Ingest GeoNames places and toponyms to staging
- [ ] Validate document structure and counts
- [ ] Ingest Wikidata places and toponyms to staging
- [ ] Ingest TGN places and toponyms to staging
- [ ] Ingest remaining authority sources to staging
- [ ] Validate document counts against expectations
- [ ] Create snapshot on /ix1
- [ ] Restore snapshot to production VM
- [ ] Validate production indices

## Phase 3: Model Training

Training data preparation uses IPA/PanPhon for initial phonetic clustering, but IPA is not stored in the index.

- [ ] Set up Epitran and PanPhon environment
- [ ] Select candidate places (5+ toponyms, 2+ scripts/languages)
- [ ] Generate IPA and PanPhon vectors for candidates
- [ ] Cluster toponyms per place by phonetic similarity
- [ ] Generate training triplets (anchor, positive, negative)
- [ ] Train initial Siamese BiLSTM model on Pitt CRC GPU nodes
- [ ] Iterate: re-cluster using model embeddings, regenerate triplets, retrain
- [ ] Evaluate recall@10 on held-out test set
- [ ] Export final model (PyTorch + ONNX)

## Phase 4: Embedding Generation

- [ ] Deploy model to staging Slurm worker
- [ ] Generate embeddings for all unique toponyms on staging
- [ ] Benchmark kNN search performance on staging
- [ ] Tune HNSW parameters if needed
- [ ] Create embedding-enriched snapshot
- [ ] Deploy model to production VM (ONNX runtime)
- [ ] Restore snapshot to production

## Phase 5: Query Integration

- [ ] Implement query embedding generation on production VM
- [ ] Build hybrid search (vector + text) endpoint
- [ ] Implement completion suggester integration
- [ ] Add fallback logic for failed embeddings
- [ ] Performance test under load
- [ ] Document API endpoints

## Phase 6: Production Rollout

- [ ] Final validation of search quality
- [ ] Switch aliases to production indices
- [ ] Create production snapshot
- [ ] Enable monitoring dashboards
- [ ] Document operational runbooks (including staging procedures)
- [ ] Train team on new capabilities

## Ongoing Operations

- [ ] Weekly: Review search quality metrics
- [ ] Monthly: Evaluate embedding refresh need
- [ ] Quarterly: Retrain model with expanded data; full re-index via staging
- [ ] As needed: Add new authority sources via staging pipeline