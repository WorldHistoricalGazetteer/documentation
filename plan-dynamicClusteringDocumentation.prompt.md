# Plan: Dynamic Clustering — Documentation Updates (documentation Project)

## Introduction

This plan specifies the documentation updates required to support the **dynamic query-time clustering** feature in the World Historical Gazetteer (WHG). It is a companion to two implementation plans:

- **`plan-dynamicClustering.prompt.md`** (in the `indexing` repository) — backend: offline similarity graph pipeline, ES schema changes, CRC gateway endpoint modifications.
- **`plan-dynamicClusteringUI.prompt.md`** (in the `whg3` repository) — front-end: UI changes, Django thin proxy, client-side clustering.

This document focuses on **user-facing and developer-facing documentation** — primarily the OpenRefine integration guide, but also API changelog and migration guidance.

---

## Context: What Changed

### Architecture change

WHG previously used a static `clusters` ES index storing fixed cluster membership assignments computed offline at a single similarity threshold. The "Group linked records" toggle in the search UI was a binary switch that either showed flat results or applied these pre-computed clusters.

The new architecture replaces this with a **precomputed similarity graph** (`place_graph` index) that stores pairwise similarity edges with per-facet signal breakdowns. Final clustering is deferred to **query time** — the server returns edges and the client (or server, for API consumers) performs Union-Find clustering at a user-controlled threshold.

### API changes summary

| Change | Old | New |
|--------|-----|-----|
| Reconciliation clustering | `group_by_cluster: true` (boolean) | `cluster_threshold: 0.85` (float, 0.0–1.0) |
| Search response | Flat hits + optional `cluster_id` per hit | Flat hits + `edges[]` array + per-hit clustering signals |
| Geometry in search response | `geom` field in ES (full GeoJSON) | `has_geom` flag; full geometry on request (`geom: "full"`) from external store |
| ES index name | `clusters` | `place_graph` |
| Membership docs | `doc_type: "membership"` | Removed (replaced by query-time clustering) |

---

## 1. OpenRefine Integration Guide

This is the primary deliverable for this plan. WHG's reconciliation endpoint (`POST /api/reconcile`) is used by OpenRefine users to match tabular data against the WHG gazetteer. These users cannot perform client-side clustering, so the server provides a fallback.

### 1a. Migration from `group_by_cluster` to `cluster_threshold`

**Removed parameter: `group_by_cluster`** (`bool`)

The previous boolean toggle that triggered server-side static clustering is removed. It no longer has any effect if sent — the server ignores it.

**New parameter: `cluster_threshold`** (`float | null`, default `null`)

When set to a value between 0.0 and 1.0, the server performs Union-Find clustering on the result subgraph and returns grouped results. When `null` or absent (default), results are returned as a flat list — **backward-compatible with existing OpenRefine workflows**.

**Migration guidance:**

| Old usage | New equivalent | Notes |
|-----------|---------------|-------|
| `group_by_cluster: true` | `cluster_threshold: 0.85` | 0.85 approximates the old fixed-threshold behaviour |
| `group_by_cluster: false` | (omit `cluster_threshold`) | Flat results, same as before |
| N/A | `cluster_threshold: 0.5` | New: looser grouping (more records merged) |
| N/A | `cluster_threshold: 0.95` | New: stricter grouping (only near-certain matches) |

Users who never used `group_by_cluster` need no changes — their workflows continue to work identically.

### 1b. Example: Reconciliation request with clustering

**Request:**
```json
POST /api/reconcile
Content-Type: application/json

{
  "query": "Paris",
  "mode": "fuzzy",
  "cluster_threshold": 0.85
}
```

**Response** (additional to the flat `hits` list):
```json
{
  "clusters": [
    {
      "cluster_id": "c_abc123",
      "representative": {
        "place_id": "gn:2988507",
        "title": "Paris",
        "score": 95.2,
        "namespace": "gn",
        "ccodes": ["FR"]
      },
      "members": [
        { "place_id": "gn:2988507", "title": "Paris", "namespace": "gn", "score": 95.2 },
        { "place_id": "wd:Q90", "title": "Paris", "namespace": "wd", "score": 93.8 },
        { "place_id": "osm:n12345", "title": "Paris", "namespace": "osm", "score": 91.1 }
      ],
      "score": 0.95
    },
    {
      "cluster_id": "c_def456",
      "representative": {
        "place_id": "gn:4717560",
        "title": "Paris",
        "score": 82.5,
        "namespace": "gn",
        "ccodes": ["US"]
      },
      "members": [
        { "place_id": "gn:4717560", "title": "Paris", "namespace": "gn", "score": 82.5 },
        { "place_id": "wd:Q830149", "title": "Paris, Texas", "namespace": "wd", "score": 80.1 }
      ],
      "score": 0.88
    }
  ],
  "hits": [
    { "place_id": "gn:2988507", "title": "Paris", ... },
    { "place_id": "wd:Q90", "title": "Paris", ... },
    { "place_id": "osm:n12345", "title": "Paris", ... },
    { "place_id": "gn:4717560", "title": "Paris", ... },
    { "place_id": "wd:Q830149", "title": "Paris, Texas", ... },
    ...
  ]
}
```

**Key points:**
- The flat `hits` list is **always** present, regardless of whether `cluster_threshold` is set. Existing workflows that consume `hits` continue to work.
- The `clusters` list is populated **only** when `cluster_threshold` is set.
- Each cluster has a `representative` (the highest-scoring member) and a `members` array with all cluster members.
- The cluster-level `score` is the average pairwise similarity within the cluster.
- Results that don't belong to any cluster (singletons) appear only in `hits`, not in `clusters`.

### 1c. Choosing a threshold value

| Threshold | Behaviour | Recommended for |
|-----------|-----------|-----------------|
| 0.90–1.00 | Very strict: only near-identical records grouped | Precision-critical matching; deduplication |
| 0.80–0.90 | Conservative: high-confidence co-referents | General reconciliation (recommended default) |
| 0.60–0.80 | Moderate: includes phonetically similar + spatially proximate | Exploratory matching; historical name variants |
| 0.30–0.60 | Loose: broad grouping | Research exploration; finding all possible candidates |
| 0.00–0.30 | Very loose: nearly everything connected gets merged | Not generally recommended |

### 1d. OpenRefine-specific notes

- When using WHG as a reconciliation service in OpenRefine, set `cluster_threshold` in the reconciliation service configuration or in per-query parameters.
- The `representative` field in each cluster can be used as the "best match" for OpenRefine's auto-match feature.
- If your workflow previously relied on `group_by_cluster: true`, replace it with `cluster_threshold: 0.85` for equivalent behaviour.

---

## 2. API Changelog

Document the following changes in the gateway API documentation:

### Breaking changes

1. **`POST /api/reconcile`**: parameter `group_by_cluster` (boolean) **removed**. Replaced by `cluster_threshold` (`float | null`). Sending `group_by_cluster` has no effect.

2. **`POST /api/search`**: response now includes:
   - `edges` array — pairwise similarity edges between result-set members, each with composite score and per-facet signal breakdown (`s.n`, `s.sp`, `s.t`, `s.ty`, `s.l`).
   - Per-hit fields: `phon_emb` (base64 Symphonym embedding), `h3` (H3 cell ID), `temporal_range` ([start, end] or null), `baseline_cluster_id` (string or null).
   - New optional parameter: `cluster_threshold` (`float | null`) — when set, server returns pre-grouped results in a `clusters` array.

3. **`POST /api/places`**: response `geometries[]` no longer includes `geom` (full GeoJSON geometry by default). Use `geom: "full"` in the request to have the server load full geometries from the external store. New geometry modes:
   - `"repr_point"` (default) — representative point only.
   - `"hull"` — convex hull from ES.
   - `"full"` — full geometry loaded from external store.

4. **ES index rename**: `clusters` → `place_graph`. This is an internal change not directly exposed to API consumers, but affects any tooling that queries the ES index directly (e.g. via Kibana or direct ES API calls).

### Non-breaking additions

- `GET /api/embed?name=<text>` — returns the Symphonym int8 embedding for a given text string (already exists; no change, but newly relevant for client-side phonetic comparison).
- All existing flat `hits` responses remain unchanged and backward-compatible.
