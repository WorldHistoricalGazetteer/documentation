# Summary

This architecture provides a **scalable, multilingual, phonetic-aware search system** fully integrated with the existing WHG infrastructure. It leverages:

- **Epitran + PanPhon** for linguistically grounded IPA generation.
- **Pitt CRC** for heavy compute (model training, bulk processing).
- **DigitalOcean** for responsive, real-time search.
- **Versioned embeddings** for safe, iterative improvement.
- **Multiple fallback paths** for robustness.

The design prioritises **operational stability**, **data integrity**, and **incremental deployment** while enabling cutting-edge phonetic search capabilities for historical place research.

---

# References

- [WHG Place Discussion #81](https://github.com/WorldHistoricalGazetteer/place/discussions/81) - Detailed phonetic search proposal
- [Epitran Documentation](https://github.com/dmort27/epitran) - G2P library
- [PanPhon Documentation](https://github.com/dmort27/panphon) - Phonetic feature vectors
- [Elasticsearch kNN Search](https://www.elastic.co/guide/en/elasticsearch/reference/current/knn-search.html)
- [Siamese Networks for One-Shot Learning](https://www.cs.cmu.edu/~rsalakhu/papers/oneshot1.pdf)
