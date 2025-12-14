# Risk Assessment

## Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Epitran fails for rare language | High | Medium | Fallback to text-only search; log for manual review |
| Siamese BiLSTM produces poor embeddings | Low | High | Versioned deployment; A/B evaluation; rollback capability |
| Production ES memory exhaustion | Low | Critical | Monitor heap usage; tune HNSW parameters; scale vertically |
| Staging ES runs out of space | Medium | Medium | Monitor during indexing; use local scratch if available |
| Index corruption during reindex | Low | High | Staging isolation; snapshot before restore; validation checks |
| Storage exhaustion on /ix3 | Medium | Critical | Monitor disk usage; alert at 80%; archive old snapshots |
| Query latency exceeds targets | Medium | Medium | Cache frequent queries; tune HNSW; staging allows tuning without production impact |
| Snapshot transfer too slow | Low | Medium | Schedule during off-peak; consider incremental snapshots |

## Operational Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Authority source unavailable | Medium | Low | Cache downloaded files; retry with backoff; multiple mirrors |
| Siamese model training fails to converge | Low | Medium | Checkpoint frequently; early stopping; hyperparameter search |
| Snapshot restore fails | Low | High | Test restores regularly; maintain multiple snapshot generations |
| /ix3 storage system failure | Low | Critical | Snapshot to /ix1; document recovery procedure |
| Slurm staging unavailable | Medium | Medium | Queue jobs during available windows; document job specifications |
| Staging/production version mismatch | Low | Medium | Document ES versions; test compatibility; version indices |

## Data Quality Risks

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Duplicate places across authorities | High | Medium | Deduplication via relations; clustering algorithms |
| Incorrect IPA transcriptions | Medium | Medium | Sample validation; user feedback loop; manual corrections |
| Stale authority data | Medium | Low | Scheduled refresh; track source update dates |
| Inconsistent language tagging | High | Medium | Normalise on ingest; validate against ISO 639 |
| WHG contribution data quality issues | Medium | Medium | Validation on export; schema enforcement; review workflow |

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