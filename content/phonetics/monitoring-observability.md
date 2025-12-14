# Monitoring & Observability

## Key Metrics

### Elasticsearch Cluster

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Cluster status | green | yellow (warn), red (critical) |
| Heap usage | <75% | >85% |
| Disk usage | <80% | >90% |
| Search latency (p95) | <100ms | >500ms |
| Indexing rate | stable | >50% deviation |

### Index Health

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Document count | expected ±1% | >5% deviation |
| Index size | expected ±10% | >25% deviation |
| Segment count | <50 per shard | >100 |
| kNN search recall@10 | >85% | <75% |

### Query Performance

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Vector search latency (p95) | <50ms | >200ms |
| Text search latency (p95) | <30ms | >100ms |
| Completion suggest latency (p95) | <10ms | >50ms |
| Query error rate | <0.1% | >1% |

### Embedding Generation

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Batch processing rate | >10k/min | <1k/min |
| IPA generation success rate | >90% | <80% |
| Model inference latency | <10ms | >50ms |

## Health Check Endpoints

### Cluster Health

```bash
curl -X GET "localhost:9200/_cluster/health?pretty"
```

### Index Statistics

```bash
curl -X GET "localhost:9200/_cat/indices?v&h=index,health,docs.count,store.size"
```

### Search Performance

```bash
curl -X GET "localhost:9200/_nodes/stats/indices/search?pretty"
```

## Log Locations

| Component | Location |
|-----------|----------|
| Elasticsearch | /ix3/whcdh/es/logs/ |
| Kibana | /ix1/whcdh/kibana/logs/ |
| Ingestion scripts | stdout/stderr (capture to file) |
| Embedding generation | /ix1/whcdh/elastic/logs/ |

## Dashboards

### Recommended Kibana Visualisations

1. **Cluster Overview**: Node status, heap, disk, CPU
2. **Index Metrics**: Document counts, sizes, growth over time
3. **Search Performance**: Latency histograms, throughput, error rates
4. **Ingestion Progress**: Documents indexed per authority source

### Sample Kibana Index Pattern

```json
{
  "title": "places-*",
  "timeFieldName": "indexed_at"
}
```

## Alerting

### Critical Alerts (immediate response)

- Cluster status red
- Disk usage >95%
- Search error rate >5%
- All nodes unreachable

### Warning Alerts (investigate within hours)

- Cluster status yellow
- Heap usage >85%
- Search latency p95 >500ms
- Document count deviation >5%

### Info Alerts (review daily)

- New index version deployed
- Snapshot completed
- Embedding generation finished
- Model training completed

## Runbook: Common Issues

### High Search Latency

1. Check cluster health and node status
2. Review heap usage (may need GC tuning)
3. Check segment counts (may need force merge)
4. Review slow query log for problematic patterns

### Index Size Growth

1. Verify expected from new ingestion
2. Check for duplicate documents
3. Review field mappings for unexpected data
4. Consider adjusting refresh interval during bulk indexing

### kNN Search Quality Degradation

1. Verify embedding_bilstm field populated
2. Check model version consistency
3. Review HNSW parameters
4. Consider re-indexing with optimised settings