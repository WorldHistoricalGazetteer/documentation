# Elasticsearch Index Design

## Index Schemas

The phonetic search system uses two indices with a many-to-many relationship: places reference toponyms by their `name@lang` identifier, and each unique toponym is stored once.

### Places Index

See `schemas/places.json` for full schema.

Key fields for phonetic search:

```json
{
  "place_id": "keyword",
  "label": "text",
  "toponyms": "keyword[]",
  "locations": [{
    "geometry": "geo_shape",
    "rep_point": "geo_point"
  }]
}
```

The `toponyms` array contains `name@lang` identifiers (e.g., `["London@en", "Londra@it"]`) that reference documents in the toponyms index.

### Toponyms Index

See `schemas/toponyms.json` for full schema.

Each document represents a **unique name@language combination**:

```json
{
  "toponym_id": "keyword",
  "name": "text",
  "name_lower": "keyword",
  "lang": "keyword",
  "embedding_bilstm": {
    "type": "dense_vector",
    "dims": 128,
    "index": true,
    "similarity": "cosine"
  },
  "suggest": {
    "type": "completion",
    "contexts": [{ "name": "lang", "type": "category" }]
  }
}
```

The `toponym_id` is the `name@lang` string (e.g., "London@en"), serving as the document ID and the join key to places.

## Ingest Pipelines

### Toponym Pipeline

The `extract_language` pipeline parses `name@lang` format and sets the document ID:

```json
{
  "description": "Extract language from toponym@lang format",
  "processors": [
    {
      "script": {
        "lang": "painless",
        "source": "if (ctx.toponym_id != null && ctx.toponym_id.contains('@')) { String[] parts = ctx.toponym_id.splitOnToken('@'); if (parts.length == 2) { ctx.name = parts[0]; ctx.name_lower = parts[0].toLowerCase(); ctx.lang = parts[1]; } }"
      }
    }
  ]
}
```

This enables ingestion of toponyms with ID `"London@en"`, automatically populating:

- `toponym_id`: "London@en" (document ID, join key)
- `name`: "London"
- `name_lower`: "london"  
- `lang`: "en"

## HNSW Configuration

The Siamese BiLSTM embedding field uses Elasticsearch's HNSW (Hierarchical Navigable Small World) algorithm for approximate nearest neighbour search.

Default settings (can be tuned):

```json
{
  "embedding_bilstm": {
    "type": "dense_vector",
    "dims": 128,
    "index": true,
    "similarity": "cosine",
    "index_options": {
      "type": "hnsw",
      "m": 16,
      "ef_construction": 100
    }
  }
}
```

**Parameter guidance**:

- `m`: Graph connectivity (higher = better recall, more memory)
- `ef_construction`: Build-time quality (higher = better index, slower build)
- For 80M vectors at 128 dims: expect ~50GB storage for HNSW structure

## Analysers

### Name Field

Standard multilingual text analysis with edge n-grams for prefix matching:

```json
{
  "analysis": {
    "analyzer": {
      "edge_ngram_analyzer": {
        "tokenizer": "edge_ngram_tokenizer",
        "filter": ["lowercase"]
      }
    },
    "tokenizer": {
      "edge_ngram_tokenizer": {
        "type": "edge_ngram",
        "min_gram": 2,
        "max_gram": 20
      }
    }
  }
}
```