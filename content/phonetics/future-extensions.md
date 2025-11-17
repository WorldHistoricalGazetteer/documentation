# Future Extensions

## Near-Term (6 months)
- **Per-language phoneme weighting**: Train language-specific embedding projections.
- **Transliteration fallback**: For scripts without Epitran support (e.g., cuneiform).
- **User feedback loop**: Capture "did you mean?" corrections to improve training data.

## Medium-Term (1 year)
- **Transformer-based encoder**: Replace BiLSTM with pre-trained multilingual phonetic BERT.
- **Continuous learning**: Incremental model updates as new datasets arrive.
- **Cross-script matching**: Link Latin "Beijing" with Chinese "北京" via phonetic bridge.

## Long-Term (2+ years)
- **Diachronic phonetics**: Model sound changes over time (e.g., Latin → Romance languages).
- **Dialectal variation**: Embed regional pronunciation differences.
- **Speech-to-text integration**: Allow audio queries (spoken place names).
