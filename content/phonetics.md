# Phonetic Support Architecture for WHG

## Overview
This document outlines the complete integration plan for adding multilingual phonetic search to the existing WHG stack (Django + PostgreSQL/PostGIS + Elasticsearch). The goal is to support IPA-based matching, phonetic embeddings, and robust cross-lingual similarity without replacing existing infrastructure.

The system is split into two operational domains:

- **Online stack (DigitalOcean)**  
  Django, PostgreSQL/PostGIS, Elasticsearch indices, query-time IPA conversion, and real-time search.

- **Offline phonetic pipeline (Pitt CRC)**  
  Bulk IPA generation, embedding creation, Siamese model training, and ingestion of enriched data back into Elasticsearch.

**Reference**: Full technical background in [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81)

---

## Components

### Online Components (DigitalOcean)
- **Django**: Provides application logic and API.
- **PostgreSQL/PostGIS**: Stores Places, geometry, and relational structure.
- **Elasticsearch**:  
  - `place_index` (existing)
  - `toponym_index` (new, handles many-to-many Place↔Toponym)
  - `ipa_index` (new, deduplicated IPA forms)
- **Real-time phonetic query system**:
  - Epitran-based G2P converter for query IPA generation.
  - Lightweight inference model (quantized/distilled version of trained Siamese BiLSTM) for generating query embeddings on-the-fly.
  - PanPhon for phonetic feature extraction.

### Offline Components (Pitt CRC)
- Access to full Wikidata and Geonames datasets.
- Unlimited compute for:
  - Bulk G2P → IPA transcription using Epitran.
  - PanPhon feature extraction and normalisation.
  - Training and retraining of Siamese BiLSTM models.
  - Generating phonetic embeddings.
- Outbound-only HTTP access for pushing bulk updates to Elasticsearch.

### Rationale for Separate Indices
- **`toponym_index`**: New index to handle many-to-many relationships (one toponym → many places; one place → many toponyms). This is critical because "Springfield" maps to 50+ distinct places.
- **`ipa_index`**: Global deduplication layer. Stores each unique IPA form once, dramatically reducing embedding storage and computation costs.
- **`place_index`**: Core gazetteer records with geometry and metadata (existing).

---

## Data Flow

### Initial Migration (One-Time, at Pitt)

**Goal**: Enrich all existing WHG toponyms with IPA and embeddings without disrupting production.

1. **Extract** all toponyms from production PostgreSQL via read-only replica or database dump.
2. **Generate IPA** using Epitran for each `(toponym, language)` pair:
   - Apply language-specific G2P models.
   - Handle unsupported languages via multi-language fallback or transliteration.
3. **Normalise IPA** (see Section 3.6 for rules).
4. **Deduplicate** by `(normalised_ipa, language)`.
5. **Assign `ipa_id`**: SHA-256 hash of `(normalised_ipa, language)`.
6. **Generate embeddings**: Initially rule-based (PanPhon feature vectors); later replaced by Siamese BiLSTM.
7. **Build mappings**:
   - `toponym_id → ipa_id`
   - `ipa_id → [canonical_toponym_samples]` (for display)
8. **Bulk push** to Elasticsearch:
   - Populate `ipa_index` with all unique IPA forms.
   - Update `toponym_index` with `ipa_id` foreign keys.
9. **Verify** with checksum validation (see Section 7.4).

### Ongoing Ingestion (New Datasets)

**Option A: Pre-process at Pitt (preferred)**
1. New dataset arrives (e.g., Pleiades, local gazetteer).
2. Pitt generates IPA + embeddings before ingestion.
3. Bulk push to Elasticsearch.
4. Django imports dataset with `ipa_id` already populated.

**Option B: Lightweight real-time enrichment**
1. Django ingests dataset with toponyms only.
2. Async background task generates IPA using lightweight Epitran on DigitalOcean.
3. Updates `toponym_index` incrementally.
4. Periodic Pitt re-embedding job (monthly) ensures consistency.

### Linking Toponyms to IPA

For each toponym:
1. Generate IPA using Epitran (online or offline).
2. Normalise IPA.
3. Hash to get `ipa_id`.
4. Store `toponym_id → ipa_id` mapping in `toponym_index`.

### Linking IPA to Places (Implicit)

**Design decision**: Do NOT maintain `place_ids[]` arrays in `ipa_index`.

**Rationale**:
- Common toponyms like "Springfield" would create massive arrays.
- Array updates create write bottlenecks and reindexing overhead.

**Instead**: Join at query time via `toponym_index`:
```
ipa_index (vector search) 
  → ipa_id 
  → toponym_index (filter by ipa_id) 
  → toponym_id 
  → place_index
```

### IPA Generation: Epitran + PanPhon

**Epitran**:
- Supports 90+ language G2P mappings.
- Produces IPA transcriptions directly from orthographic input.
- Handles language-specific phonological rules.

**PanPhon**:
- Provides phonetic feature vectors (24-dimensional) for each IPA segment.
- Used for:
  - Initial rule-based embeddings (averaged feature vectors).
  - Augmenting Siamese model inputs with articulatory features.

**Fallback Strategy**:
- If Epitran lacks a language: attempt transliteration → IPA via nearest-supported language.
- Log unsupported language requests for future model expansion.

### IPA Normalisation Rules

**Critical**: Consistent normalisation prevents duplicate `ipa_id` values.

1. **Unicode NFC normalisation** (canonical decomposition + composition).
2. **Remove stress marks** (`ˈ` primary, `ˌ` secondary) for base form.
   - Optionally retain in separate `ipa_stressed` field if needed for disambiguation.
3. **Remove syllable boundaries** (`.` character) unless linguistically significant.
4. **Canonical diacritic ordering** (e.g., nasalisation before length).
5. **Strip leading/trailing whitespace**.
6. **Lowercase** (IPA is case-sensitive but we normalise for consistency).

**Documentation**: Full normalisation code in `whg/phonetic/ipa_normalizer.py` with extensive unit tests.

---

## Elasticsearch Index Design

### IPA Index
```json
{
  "ipa_id": "sha256_hash",           // keyword (primary key)
  "ipa": "spɹɪŋfild",                // text + ngram analyzer
  "ipa_stressed": "ˈspɹɪŋˌfild",     // text (optional, for disambiguation)
  "language": "en",                  // keyword
  "embedding": [0.23, -0.15, ...],   // dense_vector (64-256 dim)
  "embedding_version": "v3_20251117", // keyword (critical for model updates)
  "canonical_toponyms": [             // text[] (sample representations)
    "Springfield",
    "Springfeild"  // historical variant
  ],
  "panphon_features": [...],         // dense_vector (24-dim, optional)
  "last_updated": "2025-11-17T10:30:00Z" // date
}
```

**Analyzers**:
- `ipa` field: Custom ngram analyzer (2-4 grams) for fuzzy phonetic matching.
- `canonical_toponyms`: Standard multilingual text analyzer.

### Toponym Index
```json
{
  "toponym_id": "uuid",              // keyword
  "toponym": "Springfield",          // text (multilingual analyzers)
  "language": "en",                  // keyword
  "ipa_id": "sha256_hash",           // keyword (foreign key to ipa_index)
  "place_ids": ["place_123", ...],   // keyword[] (many-to-many)
  "variants": ["Springfeild"],       // text[] (historical spellings)
  "last_updated": "2025-11-17T10:30:00Z"
}
```

### Place Index
```json
{
  "place_id": "place_123",           // keyword
  "title": "Springfield, MA",        // text
  "geometry": {...},                 // geo_shape
  // ... existing WHG fields ...
  "toponym_ids": ["uuid1", ...],     // keyword[] (foreign keys)
  "primary_ipa_id": "sha256_hash"    // keyword (optional denormalisation)
}
```

**Optional optimisation**: Denormalise `primary_ipa_id` in `place_index` for direct vector search on places (bypasses toponym join for common cases).

---

## Training the Siamese BiLSTM (Pitt)

### Training Data Construction

**Positive pairs** (phonetically similar, same referent):
1. Same Wikidata ID across languages.
2. Same Geonames ID + language variants.
3. Documented aliases (e.g., "New York" ↔ "Nueva York").
4. Identical normalised IPA (automatic positive).
5. Edit distance ≤2 on IPA + geographic proximity <50km.

**Negative pairs** (phonetically dissimilar or different referents):
1. Random sampling (easy negatives).
2. High IPA edit distance (>5) + same language.
3. Geographic distance >500km + same country (ambiguous names).
4. Same IPA, different language, distant locations (homophone disambiguation).

**Hard negative mining**: After initial training, mine pairs with high predicted similarity but known to be incorrect.

**Data augmentation**:
- Wikidata/Geonames skew toward Western languages. Balance with:
  - Minority language gazetteers (African, Asian, Indigenous).
  - Historical attestations from WHG partner projects.

### Model Architecture

**Input**:
- IPA string tokenised at phone level (individual IPA characters).
- Optional: Concatenate PanPhon 24-dim feature vectors per phone.

**Encoder**:
```
Input: IPA sequence (variable length)
  ↓
Embedding Layer (phone vocab ~200 symbols)
  ↓
Bidirectional LSTM (2 layers, 128 hidden units)
  ↓
Mean pooling over time steps
  ↓
Dense projection (ReLU)
  ↓
L2 normalisation → embedding (dimension D)
```

**Loss**: Contrastive loss or triplet loss with margin 0.2.

**Dimension selection**:
1. Start with **D=64** (baseline).
2. Evaluate **D=128, 256** on held-out test set.
3. Metrics: accuracy@k (k=1,5,10), memory usage, inference time.
4. **Document decision** in `models/phonetic/VERSION_NOTES.md`.

**Training infrastructure**:
- PyTorch on Pitt CRC GPU nodes.
- Checkpoint every 5 epochs.
- Early stopping on validation set.

### Embedding Refresh Cycle

**Problem**: When retraining the model, old embeddings become invalid.

**Solution**: Versioned embeddings with blue-green deployment.

1. **Train new model** → `v4_20251201`.
2. **Re-embed all IPA entries** at Pitt.
3. **Push to Elasticsearch** with `embedding_version: "v4_20251201"`.
4. **Deploy inference model to DigitalOcean**:
   - Export trained Siamese encoder to ONNX format.
   - Quantize to INT8 for faster inference (optional).
   - Deploy to Django application server.
   - Update model version in Django settings.
5. **Django switches** query filter from `v3` to `v4` (config flag).
6. **Gradual rollout**: 
   - Week 1: 10% of traffic on v4.
   - Week 2: 50%.
   - Week 3: 100%, delete v3 embeddings.

**Monitoring**: Compare search quality metrics (click-through rate, user feedback) across versions.

### Real-Time Inference Model

**Requirements**:
- Model must be small enough to load in Django process memory (<100MB).
- Inference latency <10ms per query on DigitalOcean servers.
- Compatible with CPU-only deployment (no GPU required).

**Implementation**:
```python
# Django query handler
from onnxruntime import InferenceSession
import numpy as np

class PhoneticQueryEncoder:
    def __init__(self, model_path, version):
        self.session = InferenceSession(model_path)
        self.version = version
    
    def encode(self, ipa_string):
        """Generate embedding for query IPA string."""
        # Tokenize IPA at phone level
        tokens = self.tokenize_ipa(ipa_string)
        # Run inference
        embedding = self.session.run(
            ['embedding'], 
            {'input': np.array([tokens])}
        )[0]
        return embedding.flatten()
```

**Model optimization**:
- Prune rare phone tokens (reduce embedding table size).
- Distill BiLSTM to smaller student model if needed.
- Cache embeddings for common queries (Redis).

**Deployment strategy**:
- Store model files in `/opt/whg/models/phonetic/v{version}/`.
- Django loads model on startup.
- Graceful fallback to previous version if new model fails to load.
- Hot-reload capability for model updates without Django restart.

---

## Query Pipeline (Online)

### Full Pipeline with Fallbacks

```
1. User input: "Springfeld" (typo)
   ↓
2. Language detection:
   - Attempt automatic detection (langdetect library)
   - Fallback: Use UI hint or default to multi-language Epitran
   ↓
3. Generate IPA: "spɹɪŋfɛld" (Epitran)
   - On failure: log error, proceed to fallback (step 6b)
   ↓
4. Generate query embedding using deployed inference model
   - Load ONNX model in Django process
   - Inference latency target: <10ms
   - Use cached embeddings for common queries (Redis)
   ↓
5. Elasticsearch multi-stage search:
   
   5a. PRIMARY: Vector kNN search
       - Query: ipa_index with embedding
       - Filter: embedding_version = "v4_20251201"
       - k = 100 candidates
       
   5b. FALLBACK 1: IPA n-gram text search
       - Query: ipa_index with "spɹɪŋfɛld" (ngram analyzer)
       - Useful when embedding fails or for rare forms
       
   5c. FALLBACK 2: Original toponym search
       - Query: toponym_index with "Springfeld" (fuzzy match)
       - Existing WHG logic (Levenshtein, phonetic codes)
       
   ↓
6. Merge results:
   - Deduplicate by ipa_id
   - Score combination: 0.6×vector_score + 0.3×ngram_score + 0.1×fuzzy_score
   - Filter by embedding_version to ensure consistency
   ↓
7. Join to places:
   - ipa_id → toponym_index (get toponym_ids)
   - toponym_id → place_index
   ↓
8. Apply WHG-PLACE ranking logic:
   - Boost by dataset authority
   - Geographic relevance (if user location available)
   - Historical period match
   ↓
9. Return results with confidence scores
```

### Query-Time Optimisations

- **IPA cache**: Redis cache for frequent queries (TTL 1 hour).
- **Embedding cache**: Pre-compute embeddings for top 10k toponyms.
- **Async enrichment**: If query IPA generation fails, log for batch processing at Pitt.

### Error Handling

- **Epitran failure**: Fall back to original toponym search, log language/input for improvement.
- **Elasticsearch timeout**: Return partial results with warning.
- **Empty results**: Progressively relax constraints (language filter, geographic bounds).

---

## Push-Based Synchronisation Strategy

### Rationale
Pitt CRC cannot accept inbound connections. All updates must be **initiated from Pitt** via outbound HTTPS.

### Bulk Update Workflow

```
1. Pitt generates IPA + embeddings (batch of 100k records)
   ↓
2. Prepare Elasticsearch _bulk API payload:
   - NDJSON format
   - Include document version numbers
   - Split into chunks (5k docs per request)
   ↓
3. HTTP POST to DigitalOcean Elasticsearch:
   - Endpoint: https://whg-es.example.com/_bulk
   - Authentication: API key in header
   - Timeout: 60s per request
   ↓
4. Handle responses (see Section 7.4)
   ↓
5. Verify (see Section 7.5)
```

### Authentication & Security

- **API Key**: Dedicated Elasticsearch API key with restricted permissions:
  - Write access to `ipa_index`, `toponym_index` only.
  - No delete permissions.
  - Rate limit: 100 req/min.
- **Network**: Whitelist Pitt CRC outbound IP range on Elasticsearch firewall.
- **Audit log**: All _bulk operations logged in Elasticsearch audit trail.

### Resilience Strategy

**Problem**: Network failures, rate limits, or partial updates corrupt the index.

**Solution**: Robust error handling with retries and checksums.

```python
# Pseudocode for Pitt bulk push script

def push_bulk_update(docs, max_retries=3):
    batch_id = uuid4()
    checksum = sha256(json.dumps(docs, sort_keys=True))
    
    for attempt in range(max_retries):
        try:
            response = requests.post(
                f"{ES_URL}/_bulk",
                headers={"Authorization": f"ApiKey {API_KEY}"},
                data=ndjson_format(docs),
                timeout=60
            )
            
            if response.status_code == 429:  # Rate limit
                time.sleep(2 ** attempt)  # Exponential backoff
                continue
                
            result = response.json()
            
            # Check for partial failures
            failed_docs = [item for item in result['items'] 
                           if item['index']['status'] >= 400]
            
            if failed_docs:
                log_failures(batch_id, failed_docs)
                # Add to retry queue with exponential backoff
                enqueue_retry(failed_docs, delay=2**attempt * 60)
            else:
                log_success(batch_id, checksum, len(docs))
                return True
                
        except requests.exceptions.Timeout:
            log_error(f"Timeout on attempt {attempt}")
            time.sleep(2 ** attempt)
            
    # All retries failed
    alert_admin(batch_id, docs)
    return False
```

**Retry queue**: Separate persistent queue (SQLite or Redis) for failed documents.

**Monitoring**: Grafana dashboard tracking:
- Successful/failed bulk operations per hour.
- Average latency per batch size.
- Retry queue depth.

### Verification Strategy

After each bulk push:

1. **Count verification**:
   ```bash
   curl "$ES_URL/ipa_index/_count?q=embedding_version:v4_20251201"
   ```
   Compare with expected count from Pitt.

2. **Sample verification**:
   - Randomly sample 100 `ipa_id` values.
   - Retrieve from Elasticsearch.
   - Compare checksums with Pitt source data.

3. **Timestamp check**:
   - Query for documents with `last_updated < expected_date`.
   - Alert if any found (indicates missed updates).

4. **Store metadata**:
   ```json
   // Pitt maintains sync state
   {
     "batch_id": "uuid",
     "timestamp": "2025-11-17T10:30:00Z",
     "embedding_version": "v4_20251201",
     "doc_count": 1234567,
     "checksum": "sha256_hash",
     "status": "verified"
   }
   ```

---

## Advantages of This Architecture

1. **Minimal infrastructure changes**: Only adds two new Elasticsearch indices (`toponym_index`, `ipa_index`) alongside existing `place_index`.
2. **Resource isolation**: Heavy compute (IPA generation, model training) offloaded to Pitt CRC.
3. **Global deduplication**: `ipa_index` eliminates redundant storage and computation.
4. **Versioned embeddings**: Safe model updates with rollback capability.
5. **Graceful degradation**: Multiple fallback paths ensure search always returns results.
6. **Scalable**: Handles millions of toponyms without DigitalOcean resource pressure.
7. **Maintainable**: Clear separation of concerns (online vs. offline processing).
8. **Real-time inference**: On-the-fly embedding generation enables immediate query response without pre-indexing all possible queries.

---

## Monitoring & Observability

### Key Metrics

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

### Dashboards

**Grafana** (DigitalOcean):
- Real-time search performance.
- Elasticsearch cluster health.
- IPA cache efficiency.

**Local monitoring** (Pitt):
- Bulk operation logs.
- Model training metrics (TensorBoard).
- Data pipeline status.

### Alerting

- **Critical**: Elasticsearch cluster red, bulk push failure rate >1%.
- **Warning**: Retry queue >500, IPA conversion failures >5%.
- **Info**: New embedding version deployed, dataset ingestion started.

---

## Future Extensions

### Near-Term (6 months)
- **Per-language phoneme weighting**: Train language-specific embedding projections.
- **Transliteration fallback**: For scripts without Epitran support (e.g., cuneiform).
- **User feedback loop**: Capture "did you mean?" corrections to improve training data.

### Medium-Term (1 year)
- **Transformer-based encoder**: Replace BiLSTM with pre-trained multilingual phonetic BERT.
- **Continuous learning**: Incremental model updates as new datasets arrive.
- **Cross-script matching**: Link Latin "Beijing" with Chinese "北京" via phonetic bridge.

### Long-Term (2+ years)
- **Diachronic phonetics**: Model sound changes over time (e.g., Latin → Romance languages).
- **Dialectal variation**: Embed regional pronunciation differences.
- **Speech-to-text integration**: Allow audio queries (spoken place names).

---

## Deployment Checklist

### Phase 1: Development (Week 1-4)
- [ ] Set up Epitran + PanPhon in Pitt environment.
- [ ] Implement IPA normalisation library with tests.
- [ ] Design and create `toponym_index` schema in Elasticsearch.
- [ ] Create `ipa_index` template.
- [ ] Build proof-of-concept with 10k toponyms (single language).
- [ ] Benchmark query latency and accuracy.
- [ ] Test ONNX model export and Django integration.

### Phase 2: Initial Migration (Week 5-8)
- [ ] Extract all WHG toponyms from `place_index` to Pitt.
- [ ] Create `toponym_index` and populate from existing place data.
- [ ] Generate IPA for all toponyms (batch processing).
- [ ] Create initial rule-based embeddings (PanPhon).
- [ ] Bulk push to Elasticsearch staging environment.
- [ ] Validate data integrity (checksums, counts).
- [ ] Test query pipeline with production-scale data.

### Phase 3: Model Training (Week 9-12)
- [ ] Construct training dataset (positive/negative pairs).
- [ ] Train Siamese BiLSTM (baseline 64-dim).
- [ ] Evaluate on held-out test set.
- [ ] Select optimal embedding dimension.
- [ ] Export model to ONNX format.
- [ ] Test inference model performance in Django.
- [ ] Re-embed all IPA entries with trained model.
- [ ] Deploy to staging with version v1.

### Phase 4: Production Rollout (Week 13-16)
- [ ] Deploy inference model to production Django servers.
- [ ] Deploy updated indices to production Elasticsearch.
- [ ] Enable query pipeline with feature flag (10% traffic).
- [ ] Monitor for errors and performance issues.
- [ ] Gradually increase traffic (50%, 100%).
- [ ] Document operational runbooks.
- [ ] Train support team on new search capabilities.

### Phase 5: Continuous Improvement (Ongoing)
- [ ] Monthly embedding refresh cycle.
- [ ] Quarterly model retraining with new data.
- [ ] User feedback analysis and training data enrichment.
- [ ] Performance optimisation (cache tuning, index settings).
- [ ] Model distillation for faster inference if needed.

---

## Risk Assessment

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

---

## Success Criteria

### Technical Metrics
- Query latency <100ms (p95) for vector search.
- kNN recall@10 >85% on evaluation set.
- Bulk push success rate >99.9%.
- Index size <10GB for 1M unique IPA forms.

### User Experience Metrics
- Increased search success rate (fewer "no results" queries).
- Reduced typo-related search failures.
- Positive user feedback on multilingual search.
- Click-through rate improvement on search results.

### Research Impact
- Published dataset of IPA-enriched historical toponyms.
- Reproducible methodology for phonetic gazetteer construction.
- Open-source Epitran/PanPhon integration library for WHG.

---

## Summary

This architecture provides a **scalable, multilingual, phonetic-aware search system** fully integrated with the existing WHG infrastructure. It leverages:

- **Epitran + PanPhon** for linguistically grounded IPA generation.
- **Pitt CRC** for heavy compute (model training, bulk processing).
- **DigitalOcean** for responsive, real-time search.
- **Versioned embeddings** for safe, iterative improvement.
- **Multiple fallback paths** for robustness.

The design prioritises **operational stability**, **data integrity**, and **incremental deployment** while enabling cutting-edge phonetic search capabilities for historical place research.

---

## References

- [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81) - Detailed phonetic search proposal
- [Epitran Documentation](https://github.com/dmort27/epitran) - G2P library
- [PanPhon Documentation](https://github.com/dmort27/panphon) - Phonetic feature vectors
- [Elasticsearch kNN Search](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html)
- [Siamese Networks for One-Shot Learning](https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf)

---

**Document Version**: 2.0  
**Last Updated**: 2025-11-17  
**Authors**: WHG Technical Team  
**Status**: Ready for Review