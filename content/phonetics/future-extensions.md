# Future Extensions

## Short-Term Enhancements

### Additional Language Support

Expand Epitran language mappings to improve training data coverage:

- African languages (Swahili, Yoruba, Amharic)
- Southeast Asian languages (Thai, Vietnamese, Burmese)
- Indigenous languages (where G2P models exist)

Better language coverage in training data improves model generalisation, even for languages not directly supported by Epitran.

### Query Refinement

- Language-weighted search (boost user's preferred languages)
- Geographic context (boost places near user's focus area)
- Temporal filtering (match historical period of interest)

### User Feedback Integration

- Capture "did you mean?" corrections
- Track search refinements and click-through patterns
- Use feedback to improve training data for model updates

## Medium-Term Development

### Transliteration Fallback

For scripts without Epitran support during training:

- Implement rule-based transliteration to Latin script
- Use transliterated form for initial clustering
- Iterative refinement will improve coverage

### Multi-Model Ensemble

Combine multiple embedding approaches:

- Siamese BiLSTM character embeddings (current)
- Transformer-based embeddings (BERT variants)
- Traditional phonetic codes (Soundex, Metaphone) as features

Score fusion for improved recall and precision.

### Historical Phonology

Model sound changes over time:

- Great Vowel Shift effects on English place names
- Grimm's Law for Germanic comparisons
- Known regional pronunciation shifts

Enable "sounds like it would have in 1500" queries.

## Long-Term Vision

### Speech-to-Text Integration

Allow audio queries:

- User speaks place name
- Speech recognition generates candidates
- Phonetic matching finds best place matches
- Handles accented speech and pronunciation variations

### Crowdsourced Pronunciation Data

- Record native speaker pronunciations
- Build pronunciation corpus for model training
- Improve training data clustering accuracy
- Community-driven language coverage expansion

### Cross-Gazetteer Linking

Use phonetic similarity for:

- Automated candidate matching across authority sources
- Confidence scoring for potential duplicates
- Semi-automated deduplication workflows

### Scholarly Analysis Tools

- Phonetic distance matrices for toponymic studies
- Etymology clustering based on sound patterns
- Visualisation of phonetic variation by region/period