# Data Flow

## Initial Migration (One-Time, at Pitt)

**Goal**: Enrich all existing WHG toponyms with IPA and embeddings without disrupting production.

1. **Extract** all toponyms from production PostgreSQL via read-only replica or database dump.
2. **Generate IPA** using Epitran for each `(toponym, language)` pair:
   - Apply language-specific G2P models.
   - Handle unsupported languages via multi-language fallback or transliteration.
3. **Normalise IPA** (see [IPA Normalisation Rules](#ipa-normalisation-rules)).
4. **Deduplicate** by `(normalised_ipa, language)`.
5. **Assign `ipa_id`**: SHA-256 hash of `(normalised_ipa, language)`.
6. **Generate embeddings**: Initially rule-based (PanPhon feature vectors); later replaced by Siamese BiLSTM.
7. **Build mappings**:
   - `toponym_id → ipa_id`
   - `ipa_id → [canonical_toponym_samples]` (for display)
8. **Bulk push** to Elasticsearch:
   - Populate `ipa_index` with all unique IPA forms.
   - Update `toponym_index` with `ipa_id` foreign keys.
9. **Verify** with checksum validation (see [Resilience Strategy](push-based-synchronisation-strategy.html#resilience-strategy)).

## Ongoing Ingestion (New Datasets)

**Lightweight real-time enrichment**
1. Django ingests dataset with toponyms only.
2. Async background task generates IPA using lightweight Epitran on DigitalOcean.
3. Updates `toponym_index` incrementally.
4. Periodic Pitt re-embedding job (monthly) ensures consistency.

## Linking Toponyms to IPA

For each toponym:
1. Generate IPA using Epitran (online or offline).
2. Normalise IPA.
3. Hash to get `ipa_id`.
4. Store `toponym_id → ipa_id` mapping in `toponym_index`.

## Linking IPA to Places (Implicit)

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

## IPA Generation: Epitran + PanPhon

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

## IPA Normalisation Rules

**Critical**: Consistent normalisation prevents duplicate `ipa_id` values.

1. **Unicode NFC normalisation** (canonical decomposition + composition).
2. **Remove stress marks** (`ˈ` primary, `ˌ` secondary) for base form.
   - Optionally retain in separate `ipa_stressed` field if needed for disambiguation.
3. **Remove syllable boundaries** (`.` character) unless linguistically significant.
4. **Canonical diacritic ordering** (e.g., nasalisation before length).
5. **Strip leading/trailing whitespace**.
6. **Lowercase** (IPA is case-sensitive but we normalise for consistency).

**Documentation**: Full normalisation code in `whg/phonetic/ipa_normalizer.py` with extensive unit tests.
