# BiLSTM Model Training

## Model Architecture

The phonetic embedding model is a character-level bidirectional LSTM:

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

## Training Process

```python
# Siamese training loop (simplified)
for epoch in range(num_epochs):
    for anchor, positive, negative in triplet_loader:
        # Forward pass
        emb_anchor = model(anchor)
        emb_positive = model(positive)
        emb_negative = model(negative)
        
        # Triplet loss with margin
        loss = triplet_loss(emb_anchor, emb_positive, emb_negative, margin=0.2)
        
        # Backward pass
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()
    
    # Validation
    recall_at_10 = evaluate(model, val_set)
    if recall_at_10 > best_recall:
        save_checkpoint(model, f'model_v{version}.pt')
```

**Infrastructure**: PyTorch on Pitt CRC GPU nodes (A100 or equivalent)

**Hyperparameters**:

- Batch size: 256 triplets
- Learning rate: 1e-3 with cosine annealing
- Margin: 0.2
- Early stopping: patience 5 epochs on validation recall@10

## Model Versioning

Each model version is tracked with metadata:

```
/ix1/whcdh/elastic/models/phonetic/
├── v1_20250601/
│   ├── model.pt          # PyTorch weights
│   ├── model.onnx        # ONNX export for inference
│   ├── config.json       # Architecture parameters
│   ├── vocab.json        # Character vocabulary
│   └── metrics.json      # Training/validation metrics
├── v2_20250901/
│   └── ...
└── current -> v2_20250901  # Symlink to active version
```

## Embedding Refresh Cycle

When retraining produces an improved model:

1. **Train new model** → `v{N+1}_{date}`
2. **Evaluate** on held-out test set (require recall@10 improvement)
3. **Re-embed all toponyms** using new model
4. **Index to new versioned indices** (`toponyms_v{N+1}`)
5. **Validate** sample queries against expected results
6. **Switch aliases** to new indices
7. **Create snapshot** of previous version (rollback capability)
8. **Delete old indices** after confirmation period (7 days)

**Frequency**: Quarterly, or when training data significantly expands