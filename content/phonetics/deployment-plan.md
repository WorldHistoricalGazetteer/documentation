# Deployment Checklist

## Phase 1: Development (Week 1-4)
- [ ] Set up Epitran + PanPhon in Pitt environment.
- [ ] Implement IPA normalisation library with tests.
- [ ] Design and create `toponym_index` schema in Elasticsearch.
- [ ] Create `ipa_index` template.
- [ ] Build proof-of-concept with 10k toponyms (single language).
- [ ] Benchmark query latency and accuracy.
- [ ] Test ONNX model export and Django integration.

## Phase 2: Initial Migration (Week 5-8)
- [ ] Extract all WHG toponyms from `place_index` to Pitt.
- [ ] Create `toponym_index` and populate from existing place data.
- [ ] Generate IPA for all toponyms (batch processing).
- [ ] Create initial rule-based embeddings (PanPhon).
- [ ] Bulk push to Elasticsearch staging environment.
- [ ] Validate data integrity (checksums, counts).
- [ ] Test query pipeline with production-scale data.

## Phase 3: Model Training (Week 9-12)
- [ ] Construct training dataset (positive/negative pairs).
- [ ] Train Siamese BiLSTM (baseline 64-dim).
- [ ] Evaluate on held-out test set.
- [ ] Select optimal embedding dimension.
- [ ] Export model to ONNX format.
- [ ] Test inference model performance in Django.
- [ ] Re-embed all IPA entries with trained model.
- [ ] Deploy to staging with version v1.

## Phase 4: Production Rollout (Week 13-16)
- [ ] Deploy inference model to production Django servers.
- [ ] Deploy updated indices to production Elasticsearch.
- [ ] Enable query pipeline with feature flag (10% traffic).
- [ ] Monitor for errors and performance issues.
- [ ] Gradually increase traffic (50%, 100%).
- [ ] Document operational runbooks.
- [ ] Train support team on new search capabilities.

## Phase 5: Continuous Improvement (Ongoing)
- [ ] Monthly embedding refresh cycle.
- [ ] Quarterly model retraining with new data.
- [ ] User feedback analysis and training data enrichment.
- [ ] Performance optimisation (cache tuning, index settings).
- [ ] Model distillation for faster inference if needed.
