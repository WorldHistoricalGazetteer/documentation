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

Training data is prepared offline, separate from Elasticsearch. The process uses iterative refinement: an initial phonetic clustering bootstraps the first model, which then improves subsequent clustering.

### The Endonym/Exonym Challenge

A place may have multiple names that are phonetically unrelated:

- **Endonyms**: Names used by local inhabitants (e.g., "Deutschland", "日本", "Ελλάδα")
- **Exonyms**: Names used by outsiders in other languages (e.g., "Germany", "Japan", "Greece")

These often derive from completely different etymological roots. For example:

| Place | Endonym | Exonyms |
|-------|---------|---------|
| Germany | Deutschland (de) | Allemagne (fr), Germany (en), Германия (ru), ドイツ (ja) |
| Japan | 日本 / Nihon (ja) | Japan (en), Japon (fr), Япония (ru) |
| Greece | Ελλάδα / Elláda (el) | Greece (en), Grèce (fr), Yunanistan (tr) |
| Finland | Suomi (fi) | Finland (en), Финляндия (ru) |
| China | 中国 / Zhōngguó (zh) | China (en), Китай (ru) |

Training pairs must distinguish between:

- **Phonetic variants**: "Deutschland" ↔ "Deutchland" ↔ "Doitschland" (similar sounds, same name)
- **Distinct names**: "Deutschland" ↔ "Germany" ↔ "Allemagne" (different sounds, same place)

The clustering phase groups a place's toponyms by phonetic similarity, so that positive training pairs are drawn from within clusters (variants of the same name) and negative pairs from across clusters (different names for the same place).

### Phase 1: Candidate Selection

Select places with rich toponym sets for training:

1. Ingest GeoNames and Wikidata to working storage
2. Filter to places with 5+ toponyms across 2+ scripts/languages
3. Extract toponyms with place IDs to `candidate_toponyms.tsv`

These are the interesting cases likely to have both phonetic variants and distinct endonym/exonym pairs.

### Phase 2: Initial Phonetic Clustering

Bootstrap clustering using rule-based phonetic features:

1. Generate IPA transcriptions via Epitran (where language is supported)
2. Convert IPA to PanPhon feature vectors
3. Cache vectors in Parquet format, grouped by place:

```
# toponym_vectors.parquet
place_id    | toponym_id          | panphon_vector
------------|---------------------|------------------
wd:Q183     | Deutschland@de      | [0.2, -0.1, ...]
wd:Q183     | Germany@en          | [0.7, 0.3, ...]
wd:Q183     | Allemagne@fr        | [0.5, 0.1, ...]
wd:Q183     | Германия@ru         | [0.7, 0.3, ...]
wd:Q17      | 日本@ja              | [0.4, -0.2, ...]
wd:Q17      | Japan@en            | [0.6, 0.2, ...]
```

4. Cluster each place's toponyms by PanPhon feature distance
5. Write cluster assignments to `toponym_clusters.tsv`

PanPhon provides phonological feature vectors for IPA segments, giving weighted distances based on articulatory similarity (/p/→/b/ is closer than /p/→/ʃ/).

### Phase 3: Training Pair Generation

Generate triplets from clustered toponyms:

- **Positive pairs**: Within-cluster (phonetic variants of same name)
- **Negative pairs**: Cross-cluster within same place (distinct endonyms/exonyms)

```
# training_triplets.tsv (anchor, positive, negative)
Deutschland@de    Doitschland@de    Germany@en
Germany@en        Германия@ru       Deutschland@de
日本@ja            Nihon@ja-Latn     Japan@en
Ελλάδα@el         Ellada@el-Latn    Yunanistan@tr
```

Additional negative sampling:
- Random toponyms from different places (easy negatives)
- Same-country different places (geographic negatives)

### Phase 4: Iterative Refinement

After training an initial model:

1. Generate embeddings for all candidate toponyms using trained model
2. Re-cluster using embedding cosine distance (replacing PanPhon)
3. Regenerate training triplets from new clusters
4. Retrain model
5. Repeat 2-3 times until clusters stabilise

This escapes the limitations of Epitran's language coverage and PanPhon's rule-based approach. The model learns phonetic similarity patterns that generalise beyond the initial bootstrap.

### Storage During Training

All intermediate data lives on /ix1, not in Elasticsearch:

```
/ix1/whcdh/elastic/training/
├── candidate_toponyms.tsv      # Extracted candidates
├── toponym_vectors.parquet     # PanPhon vectors (iteration 0)
├── toponym_clusters_v0.tsv     # Initial clustering
├── toponym_clusters_v1.tsv     # Model-based clustering
├── training_triplets_v0.tsv    # Initial triplets
├── training_triplets_v1.tsv    # Refined triplets
└── ...
```

IPA and PanPhon vectors are intermediate artifacts for training data preparation only — they are not stored in the index.

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