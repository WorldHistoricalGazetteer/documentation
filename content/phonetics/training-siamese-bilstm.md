# Training the Siamese BiLSTM (Pitt)

## Training Data Construction

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

## Model Architecture

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

## Embedding Refresh Cycle

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

## Real-Time Inference Model

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