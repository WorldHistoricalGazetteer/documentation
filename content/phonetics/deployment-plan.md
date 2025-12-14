# Deployment Plan

## Phase 1: Infrastructure Setup (Week 1-2)

### Production VM
- [ ] Provision /ix3 flash storage (750GB - 1TB)
- [ ] Install Elasticsearch 9.x on VM
- [ ] Configure for query-serving workload (heap, thread pools)

### Staging (Slurm)
- [ ] Provision staging storage (~250GB on /ix1 or local scratch)
- [ ] Configure Elasticsearch on Slurm worker
- [ ] Configure for bulk indexing workload

### Shared Infrastructure
- [ ] Provision /ix1 bulk storage (1TB)
- [ ] Configure shared snapshot repository on /ix1
- [ ] Set up monitoring (cluster health, index sizes)
- [ ] Verify network connectivity between staging and production
- [ ] Document Slurm job submission for staging ES

## Phase 2: Core Index Population (Week 3-6)

- [ ] Create index schemas with pipelines on staging
- [ ] Download authority source files to /ix1
- [ ] Ingest GeoNames places and toponyms to staging
- [ ] Ingest Wikidata places and toponyms to staging
- [ ] Ingest TGN places and toponyms to staging
- [ ] Ingest remaining authority sources to staging
- [ ] Validate document counts against expectations
- [ ] Create snapshot on /ix1
- [ ] Restore snapshot to production VM
- [ ] Validate production indices

## Phase 3: Phonetic Enrichment (Week 7-10)

- [ ] Set up Epitran environment with language models
- [ ] Generate IPA transcriptions for all toponyms (on staging)
- [ ] Validate IPA coverage by language
- [ ] Log unsupported language cases for review
- [ ] Create IPA-enriched snapshot
- [ ] Restore to production

## Phase 4: Embedding Generation (Week 11-14)

- [ ] Prepare Siamese BiLSTM training data (positive/negative pairs)
- [ ] Train initial model on Pitt CRC GPU nodes
- [ ] Evaluate recall@10 on held-out test set
- [ ] Deploy model to staging Slurm worker
- [ ] Generate embeddings for all toponyms on staging
- [ ] Benchmark kNN search performance on staging
- [ ] Tune HNSW parameters if needed
- [ ] Create embedding-enriched snapshot
- [ ] Deploy model to production VM (ONNX runtime)
- [ ] Restore snapshot to production

## Phase 5: Query Integration (Week 15-18)

- [ ] Implement query embedding generation on production VM
- [ ] Build hybrid search (vector + text) endpoint
- [ ] Implement completion suggester integration
- [ ] Add fallback logic for failed embeddings
- [ ] Performance test under load
- [ ] Document API endpoints

## Phase 6: Production Rollout (Week 19-20)

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