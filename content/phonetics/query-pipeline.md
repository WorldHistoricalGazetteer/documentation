# Query Pipeline (Online)

## Full Pipeline with Fallbacks

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

## Query-Time Optimisations

- **IPA cache**: Redis cache for frequent queries (TTL 1 hour).
- **Embedding cache**: Pre-compute embeddings for top 10k toponyms.
- **Async enrichment**: If query IPA generation fails, log for batch processing at Pitt.

## Error Handling

- **Epitran failure**: Fall back to original toponym search, log language/input for improvement.
- **Elasticsearch timeout**: Return partial results with warning.
- **Empty results**: Progressively relax constraints (language filter, geographic bounds).