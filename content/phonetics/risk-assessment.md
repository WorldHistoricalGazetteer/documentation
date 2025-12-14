# Risk Assessment

## Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Epitran fails for rare language | High | Medium | Fallback to text-only search; log for manual review |
| BiLSTM model produces poor embeddings | Low | High | Versioned deployment; A/B evaluation; rollback capability |
| Elasticsearch memory exhaustion | Low | Critical | Monitor heap usage; tune HNSW parameters; scale vertically |
| Index corruption during reindex | Low | High | Alias-based deployment; snapshot before switch; validation checks |
| Storage exhaustion on /ix3 | Medium | Critical | Monitor disk usage; alert at 80%; archive old snapshots |
| Query latency exceeds targets | Medium | Medium | Cache frequent queries; tune HNSW; consider index sharding |

## Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Authority source unavailable | Medium | Low | Cache downloaded files; retry with backoff; multiple mirrors |
| Model training fails to converge | Low | Medium | Checkpoint frequently; early stopping; hyperparameter search |
| Snapshot restore fails | Low | High | Test restores regularly; maintain multiple snapshot generations |
| /ix3 storage system failure | Low | Critical | Snapshot to /ix1; document recovery procedure |

## Data Quality Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Duplicate places across authorities | High | Medium | Deduplication via relations; clustering algorithms |
| Incorrect IPA transcriptions | Medium | Medium | Sample validation; user feedback loop; manual corrections |
| Stale authority data | Medium | Low | Scheduled refresh; track source update dates |
| Inconsistent language tagging | High | Medium | Normalise on ingest; validate against ISO 639 |

## Mitigation Strategies

### Versioned Deployments

All index updates use versioned indices with alias switching:

1. Create `places_v{N+1}`, `toponyms_v{N+1}`
2. Populate and validate new indices
3. Switch aliases atomically
4. Retain previous version for rollback (7 days)
5. Delete old indices after confirmation

### Snapshot Strategy

| Type | Frequency | Retention | Purpose |
|------|-----------|-----------|---------|
| Daily | Automatic | 7 days | Quick recovery |
| Weekly | Automatic | 4 weeks | Medium-term rollback |
| Pre-deployment | Before alias switch | 2 versions | Deployment rollback |
| Monthly | Manual | 6 months | Archive |

### Graceful Degradation

Search always returns results through fallback chain:

1. Vector kNN search (best quality)
2. Fuzzy text search (good quality)
3. Exact text search (baseline)

### Monitoring and Alerting

- Cluster health checks every 60 seconds
- Index size and document count verification daily
- Search latency monitoring with percentile alerts
- Automated snapshot verification weekly