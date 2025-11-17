# Advantages of This Architecture

1. **Minimal infrastructure changes**: Only adds two new Elasticsearch indices (`toponym_index`, `ipa_index`) alongside existing `place_index`.
2. **Resource isolation**: Heavy compute (IPA generation, model training) offloaded to Pitt CRC.
3. **Global deduplication**: `ipa_index` eliminates redundant storage and computation.
4. **Versioned embeddings**: Safe model updates with rollback capability.
5. **Graceful degradation**: Multiple fallback paths ensure search always returns results.
6. **Scalable**: Handles millions of toponyms without DigitalOcean resource pressure.
7. **Maintainable**: Clear separation of concerns (online vs. offline processing).
8. **Real-time inference**: On-the-fly embedding generation enables immediate query response without pre-indexing all possible queries.
