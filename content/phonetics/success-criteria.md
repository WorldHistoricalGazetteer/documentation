# Success Criteria

## Technical Metrics

### Search Performance

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Vector search latency (p95) | <100ms | Elasticsearch slow log analysis |
| kNN recall@10 | >85% | Evaluation on curated test set |
| Text search latency (p95) | <50ms | Elasticsearch slow log analysis |
| Completion suggest latency (p95) | <20ms | Elasticsearch slow log analysis |
| Query error rate | <0.1% | Application error logging |

### Index Quality

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| IPA coverage | >70% of toponyms | Field existence query |
| Embedding coverage | >95% of toponyms | Field existence query |
| Cross-reference coverage | >50% of places | Relations field analysis |
| Duplicate rate | <1% | Clustering analysis |

### Operational

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Index uptime | >99.9% | Cluster health monitoring |
| Snapshot success rate | 100% | Snapshot status API |
| Reindex duration | <24 hours | Job timing logs |
| Recovery time objective | <1 hour | Restore drill timing |

## User Experience Metrics

### Search Quality

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Relevant results in top 10 | >80% | User evaluation study |
| Cross-lingual match success | >70% | Curated test queries |
| Historical variant match | >60% | Curated test queries |
| Typo tolerance | >90% for 1-2 char errors | Synthetic typo test set |

### User Satisfaction

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Search success rate | >90% | "No results" rate reduction |
| Click-through rate | Improvement vs baseline | Analytics tracking |
| User feedback score | >4/5 | Survey responses |

## Research Impact

### Data Contribution

| Deliverable | Target |
|-------------|--------|
| IPA-enriched toponym dataset | Publicly available |
| Trained BiLSTM model | Open-source release |
| Processing pipeline | Documented and reproducible |
| Evaluation test set | Published for benchmarking |

### Scholarly Output

| Deliverable | Target |
|-------------|--------|
| Methodology paper | Peer-reviewed publication |
| Technical documentation | Comprehensive and maintained |
| Workshop/tutorial | Conference presentation |

## Acceptance Criteria by Phase

### Phase 2: Core Index Population

- [ ] All authority sources ingested
- [ ] Document counts match expectations (±1%)
- [ ] Sample queries return expected results
- [ ] Snapshot created and verified

### Phase 4: Embedding Generation

- [ ] BiLSTM model achieves recall@10 >80% on validation set
- [ ] All toponyms have embeddings
- [ ] kNN search returns results in <100ms (p95)
- [ ] Vector search quality exceeds text-only baseline

### Phase 6: Production Rollout

- [ ] All technical metrics meet targets
- [ ] User evaluation scores >4/5
- [ ] Documentation complete
- [ ] Runbooks tested and verified