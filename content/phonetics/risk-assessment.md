# Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Epitran fails for rare language | High | Medium | Fallback to transliteration, log for manual review |
| Bulk push network failure | Medium | High | Retry queue with exponential backoff, alerting |
| Model produces poor embeddings | Low | High | Versioned deployment, A/B testing, rollback capability |
| ONNX model inference too slow | Medium | Medium | Model quantization, distillation, or upgrade server resources |
| Model deployment breaks Django | Low | Critical | Graceful fallback to previous version, comprehensive testing |
| Elasticsearch memory exhaustion | Low | Critical | Dimension benchmarking, index lifecycle management |
| Pitt CRC downtime | Medium | Low | Async architecture, Django continues with cached data |
| User confusion with phonetic results | Medium | Medium | Clear UI labeling, confidence scores, educational tooltips |
| toponym_index out of sync with place_index | Medium | High | Automated sync jobs, integrity checks, monitoring alerts |
