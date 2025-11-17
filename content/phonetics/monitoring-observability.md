# Monitoring & Observability

## Key Metrics

**Elasticsearch (DigitalOcean)**:
- Query latency by stage (vector search, n-gram search, join operations).
- Cache hit rate for IPA queries.
- Index size and growth rate (GB/month).
- kNN search recall@k (requires manual evaluation dataset).

**Django**:
- Epitran conversion success rate per language.
- ONNX model inference latency (p50, p95, p99).
- Model memory footprint per Django worker.
- Query fallback frequency (vector → n-gram → fuzzy).
- User search satisfaction (requires click-through tracking).

**Pitt Pipeline**:
- Bulk push success rate (target: >99.9%).
- Retry queue depth (alert if >1000).
- Embedding generation throughput (docs/hour).
- Model training convergence (validation loss).

## Dashboards

**Grafana** (DigitalOcean):
- Real-time search performance.
- Elasticsearch cluster health.
- IPA cache efficiency.

**Local monitoring** (Pitt):
- Bulk operation logs.
- Model training metrics (TensorBoard).
- Data pipeline status.

## Alerting

- **Critical**: Elasticsearch cluster red, bulk push failure rate >1%.
- **Warning**: Retry queue >500, IPA conversion failures >5%.
- **Info**: New embedding version deployed, dataset ingestion started.
