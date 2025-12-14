# Siamese BiLSTM Model Training

## Overview

The phonetic embedding model uses a Siamese architecture: two identical BiLSTM networks with shared weights, trained on pairs of toponyms to learn phonetic similarity. After training, the single encoder is deployed for both indexing and query embedding generation.

## Model Architecture

The encoder is a character-level bidirectional LSTM:

```
Input: Character sequence (variable length, max 50)
  ↓
Character Embedding Layer (vocab ~500, dim 64)
  ↓
Bidirectional LSTM (2 layers, hidden 64)
  ↓
Mean Pooling (over sequence length)
  ↓
Dense Projection (ReLU, dim 128)
  ↓
L2 Normalisation
  ↓
Output: 128-dimensional embedding vector
```

**Design choices**:

- Character-level input avoids dependency on IPA transcription at query time
- Bidirectional processing captures both prefix and suffix patterns
- Mean pooling provides fixed-size output regardless of input length
- L2 normalisation enables efficient cosine similarity via dot product
- Siamese training learns similarity directly from toponym pairs

## Training Data Construction

### Positive Pairs (phonetically similar)

1. **Cross-lingual equivalents**: Same Wikidata/GeoNames ID across languages
   - "London" (en) ↔ "Londres" (fr) ↔ "Londra" (it)
   
2. **Documented aliases**: Known variant spellings from authority data
   - "New York" ↔ "Nueva York"
   
3. **Historical variants**: Temporal spelling changes
   - "Byzantium" ↔ "Constantinople" ↔ "Istanbul"
   
4. **Transliteration pairs**: Same name across scripts
   - "Москва" ↔ "Moskva" ↔ "Moscow"

### Negative Pairs (phonetically dissimilar)

1. **Random sampling**: Easy negatives from different places
2. **Geographic negatives**: Same country, distant locations
3. **Homophone disambiguation**: Similar sound, different places
   - "Springfield, MA" vs "Springfield, IL"

### Hard Negative Mining

After initial training, identify pairs with:

- High predicted similarity
- Known to be different places

Re-train with these hard negatives to improve discrimination.

## Siamese Training Process

The Siamese architecture trains on triplets: (anchor, positive, negative).

```python
# Siamese training loop
for epoch in range(num_epochs):
    for anchor, positive, negative in triplet_loader:
        # Forward pass through shared encoder
        emb_anchor = encoder(anchor)
        emb_positive = encoder(positive)
        emb_negative = encoder(negative)
        
        # Triplet loss with margin
        # Pulls anchor/positive together, pushes anchor/negative apart
        loss = triplet_loss(emb_anchor, emb_positive, emb_negative, margin=0.2)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    
    # Validation
    recall_at_10 = evaluate(encoder, val_set)
    if recall_at_10 > best_recall:
        save_checkpoint(encoder, f'model_v{version}.pt')
```

**Infrastructure**: PyTorch on Pitt CRC GPU nodes (A100 or equivalent)

**Hyperparameters**:

- Batch size: 256 triplets
- Learning rate: 1e-3 with cosine annealing
- Margin: 0.2
- Early stopping: patience 5 epochs on validation recall@10

## Model Versioning

Each trained Siamese BiLSTM encoder is tracked with metadata:

```
/ix1/whcdh/elastic/models/phonetic/
├── v1_20250601/
│   ├── encoder.pt        # PyTorch encoder weights
│   ├── encoder.onnx      # ONNX export for inference
│   ├── config.json       # Architecture parameters
│   ├── vocab.json        # Character vocabulary
│   ├── training.json     # Training hyperparameters
│   └── metrics.json      # Training/validation metrics
├── v2_20250901/
│   └── ...
└── current -> v2_20250901  # Symlink to active version
```

## Embedding Refresh Cycle

When retraining produces an improved model:

1. **Train new Siamese BiLSTM** → `v{N+1}_{date}`
2. **Evaluate** on held-out test set (require recall@10 improvement)
3. **Deploy encoder to staging** (Slurm worker)
4. **Re-embed authority toponyms** on staging using new encoder
5. **Validate** sample queries against expected results
6. **Create snapshot** of new indices
7. **Restore to production VM**
8. **Deploy encoder to production** for query embedding
9. **Switch aliases** on production
10. **Snapshot previous version** (rollback capability)
11. **Delete old indices** after confirmation period (7 days)

**Frequency**: Quarterly, or when training data significantly expands

## Deployment Architecture

The trained Siamese BiLSTM encoder is deployed to both instances:

### Staging (Slurm Worker)

- GPU-accelerated inference where available
- Large batch sizes (10,000+ toponyms)
- Used for authority file embedding generation
- PyTorch model with CUDA support

### Production (VM)

- CPU inference (model is lightweight)
- Small batch sizes or individual toponyms
- Used for:
  - WHG-contributed dataset ingestion (small batches)
  - Query embedding generation
- ONNX runtime for optimised CPU inference

Both deployments use the same trained encoder weights, ensuring embedding consistency across the corpus.