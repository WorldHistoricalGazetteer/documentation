# Deployment Plan

## Phase 1: Infrastructure Setup (Week 1-2)

- [ ] Provision /ix3 flash storage (750GB - 1TB)
- [ ] Provision /ix1 bulk storage (1TB)
- [ ] Install Elasticsearch 9.x on /ix3
- [ ] Configure snapshot repository on /ix1
- [ ] Set up monitoring (cluster health, index sizes)
- [ ] Verify network connectivity and firewall rules

## Phase 2: Core Index Population (Week 3-6)

- [ ] Create index schemas with pipelines
- [ ] Download authority source files to /ix1
- [ ] Ingest GeoNames places and toponyms
- [ ] Ingest Wikidata places and toponyms
- [ ] Ingest TGN places and toponyms
- [ ] Ingest remaining authority sources
- [ ] Validate document counts against expectations
- [ ] Create baseline snapshot

## Phase 3: Phonetic Enrichment (Week 7-10)

- [ ] Set up Epitran environment with language models
- [ ] Generate IPA transcriptions for all toponyms
- [ ] Validate IPA coverage by language
- [ ] Log unsupported language cases for review
- [ ] Create IPA-enriched snapshot

## Phase 4: Embedding Generation (Week 11-14)

- [ ] Prepare BiLSTM training data (positive/negative pairs)
- [ ] Train initial model on Pitt CRC GPU nodes
- [ ] Evaluate recall@10 on held-out test set
- [ ] Generate embeddings for all toponyms
- [ ] Index embeddings to toponyms index
- [ ] Benchmark kNN search performance
- [ ] Tune HNSW parameters if needed

## Phase 5: Query Integration (Week 15-18)

- [ ] Implement query embedding generation
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
- [ ] Document operational runbooks
- [ ] Train team on new capabilities

## Ongoing Operations

- [ ] Weekly: Review search quality metrics
- [ ] Monthly: Evaluate embedding refresh need
- [ ] Quarterly: Retrain model with expanded data
- [ ] As needed: Add new authority sources