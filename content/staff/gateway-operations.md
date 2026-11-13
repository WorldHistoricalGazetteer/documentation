# Gateway performance and operations

How the gateway's request path behaves under load, what was changed to make it faster, how to see where
a request's time goes, and which settings roll each change back. Written after the work of
12–13 November 2026; for deploying and restarting see {doc}`./gateway-restart`.

## The shape of a reconcile request

One fuzzy `/api/reconcile` query runs **five Elasticsearch searches in three stages**:

| Stage | Searches | Notes |
|---|---|---|
| Discovery | KNN (phonetic), near-miss lexical, exact lexical, run in parallel on `toponyms` | Dominates the request time |
| Places | one fetch of the top candidate places | |
| Enrichment | one fetch of those places' names | |

The gateway and Elasticsearch run on **one 8-core virtual machine** and compete for the same cores.

## What changed, and what it bought

Measured on the live gateway from a New York server with closed-loop clients, **unique synthetic place
names** (half country-scoped), zero errors in every run. These are **relative** improvements on one
synthetic workload, single runs, not a capacity promise: other users and real data will differ.

| Change | Sustained throughput (queries/s) |
|---|---|
| Start of the evening (two gateway workers, defaults) | about 3.4 |
| Cap OpenMP/MKL threads at 1 | about 11 |
| Enrich only the results that will be returned | about 13.8 |
| Drop fuzzy expansion over the n-gram field in the near-miss search | about 22 |

At 16 concurrent clients the 95th-percentile latency went from about 7.1 s to about 1.1 s.

1. **Thread cap.** Each gateway worker's math libraries defaulted to one thread per core, so the two
   workers and Elasticsearch fought over the cores and the workers burned CPU on contention (about
   390% of a core against about 50% afterwards). `python -m gateway` now sets `OMP_NUM_THREADS` and
   `MKL_NUM_THREADS` to 1 before anything loads them. It is deliberately **not** in the package
   `__init__`: batch jobs such as the embedding backfill import `gateway.*` and want every core.
2. **Trim before enrichment.** The names of up to 200 candidates were fetched although at most `size` are
   returned. Only the survivors of the same ranking are fetched now. The output is identical, and tests
   compare it against the untrimmed behaviour.
3. **Near-miss clause.** The near-miss search ran fuzzy expansion over `name.prefix`, an edge-n-gram
   field in which every prefix of every name is a term. That was the dominant cost of the search (median
   75 ms of Elasticsearch time against 11 ms without it). Truncated forms such as `Broxbourn` still reach
   `Broxbourne`, through an un-fuzzed match on that field. On 242 real toponyms corrupted with one or two
   transcription errors, unscoped hit@10 and MRR were unchanged and country-scoped hit@10 moved from
   0.572 to 0.568 (one query in 236).
4. **Result cache.** See {ref}`gateway-ops-settings`. A hit costs microseconds. Its benefit depends
   entirely on how often real data repeats, which is **not yet measured**.

```{note}
Tighter near-miss variants (fixed `AUTO:4,8` fuzziness, size 100, fewer expansions) saved a few more
milliseconds and cost 0.4–1.3 points of recall, so they were not adopted.
```

(gateway-ops-settings)=
## Settings

Per-host settings go in `.env.local` in the gateway clone, which is **untracked** and read on every start
(including a reboot). Never edit the tracked `.env`: a local edit there blocks the deploy's `git pull`.

| Variable | Default | Effect |
|---|---|---|
| `GATEWAY_WORKERS` | `2` | Uvicorn worker processes. Raising it did not help once Elasticsearch became the ceiling. |
| `OMP_NUM_THREADS`, `MKL_NUM_THREADS` | `1` (set by `python -m gateway`) | An explicit value in the environment wins. |
| `GATEWAY_RESULT_CACHE_SIZE` | `2048` | Result-cache entries per worker. `0` disables the cache. |
| `GATEWAY_RESULT_CACHE_TTL` | `120` | Seconds an entry lives. Lower it to shorten the staleness window. |
| `GATEWAY_NEAR_MISS_FUZZY_NGRAM` | `0` | `1` restores the old near-miss clause (rollback). |
| `GATEWAY_STAGE_TIMING_SAMPLE` | `0` (off) | Log one timing line for every Nth reconcile request. |
| `GATEWAY_STAGE_TIMING_UNTIL` | unset | `YYYY-MM-DD` (UTC): sampling switches itself off at that date. An unparseable value means *off*. |

**Cache behaviour to know about.** The key is the whole request. An identical repeat within the TTL is
byte-identical to the first answer, so a dataset published and then reconciled against inside the window
can see the earlier answer. A degraded answer (an enrichment failure, a name that could not be embedded,
a scope that could not be applied) is **never stored**. Embedding and clustering-fuel requests bypass the
cache. Each worker has its own cache.

## Reading the stage timing

With sampling on, each sampled request writes one line to `gateway.log`:

```bash
grep reconcile_timing /vast/ishi/elastic/logs/gateway.log | tail -5
```

Each line is JSON: `total_ms`; `stages_ms` (`prep`, `region`, `embed_build`, `es_discovery`,
`discovery_score`, `es_places`, `containment`, `es_enrich`, `enrich_loop`, `format`, `hardlinks`);
`es_took_ms` (Elasticsearch's own server-side time, including `discovery_knn`, `discovery_near` and
`discovery_exact`); `n` (places found, survivors, names fetched, `cache_hit`); and the request's `mode`,
`size`, `scoped`. The gap between a stage's wall time and its `es_took_ms` is gateway and network overhead.

The log is rotated only when the gateway restarts, so keep the sample rate low on a long run: 1 in 50
is about 7 MB a day. Sampling is **on at 1 in 50 until 27 November 2026** and then stops by itself.

## Deploying from the Pitt clone

The gateway clone on the Pitt host is checked out on a **feature branch**, not on `main`. `gateway-restart`
pulls `origin/main` with `--ff-only`, which cannot fast-forward a branch that has diverged, so the pull
warns and the gateway restarts on the code already there. To ship a change, merge `origin/main` into
the clone's branch first (as the `gazetteer` user, which holds the pull key), then restart. The restart's
"STALE CODE" banner compares `HEAD` with `origin/main`; after such a merge `HEAD` is a merge commit, so the
banner fires although the running code contains `origin/main`.

## What the host looks like (read-only survey, 13 November 2026)

| | `toponyms` | `places` |
|---|---|---|
| Documents | 73.5 M | 366 M |
| Size | 57.8 GB | 25.3 GB |
| Primary shards, replicas | 4, none | 4, none |
| Segments per shard | 17–21 | 19–25 |
| Deleted documents | 4.7% | 9.4% |

Each shard holds about 97–99% of its data in two large segments with 15 or more small ones beside them.
The shards are about 14 GB and 6 GB, comfortably inside the usual 10–50 GB guidance, so they should
**not** be split; if anything fewer, larger shards would lower the per-query KNN work.

The node has 62 GB of RAM and about 91 GB of index data on an NFS mount, so the page cache cannot hold
everything. On 13 November 2026 the host showed 15–24% I/O wait under load with only about 62% user CPU,
and its 8 GB of swap was full (7.6 GB of it Elasticsearch's own). The old-generation heap had never
peaked above 10 GB, so the serving heap was cut from 28 GB to 20 GB (`ES_HEAP_SIZE` in `.env.local`) and
`index.store.preload` was set to `["vec","vex"]` on the toponyms index, the only one with vectors.
Afterwards swap use was under 1 GB, I/O wait about 13% and throughput at 16 clients rose from 20.4 to
23.2 queries/s (single runs; the cache was still warming). **Raise the heap back to 28 GB before any
index rebuild:** it was set that high because HNSW merges have run out of memory before, and merging
segments on the live index remains risky. More RAM is not available.

### Switching between the serving and rebuild heap

The production node normally runs the **serving** heap (20 GB). Anything that rewrites the live index in
bulk needs the **rebuild** heap (28 GB). Full index rebuilds use a separate staging Elasticsearch with
its own heap and are unaffected; the in-place scripts below are what this applies to.

1. `es -heap status` shows the running heap and the value in `.env.local`.
2. `es -heap rebuild`, then `es es-restart` (a short search and reconcile outage, cold cache).
3. Run the rewrite. `processing/recompute_h3_index.py apply`, `fix_point_derived_fields.py apply`,
   `fix_dangling_has_geom.py apply`, `osm_way_area_geometry.py` (apply) and
   `scripts/batch_apply_geom_patch.sh` all **refuse to start** below 26 GB
   (`ES_REBUILD_HEAP_MIN_GB`; `ES_ALLOW_SMALL_HEAP=1` overrides, knowingly).
4. `es -heap serving`, then `es es-restart` again. The preload setting on the toponyms index survives
   restarts; check the benchmark afterwards.

`es -heap` only edits `ES_HEAP_SIZE` in `.env.local` (a dated backup is kept); nothing changes until the
restart. The 20 GB and 28 GB values are `ES_SERVING_HEAP` and `ES_REBUILD_HEAP`.

## Capacity is a resourcing decision

Throughput is now limited by Elasticsearch's CPU on the shared virtual machine. More capacity means more
cores, a replica or a second machine: a cost decision for WHG, not something more tuning will supply.

## Near-miss tuning and its evaluation set

Misspelt names are found by the *near-miss* search, then scored. `evaluation/nearmiss/` in the indexing
repository holds a frozen set of 1,497 mis-spelt place names with known answers (real GeoNames places,
realistic errors, plus nonsense strings), a runner that sends them through the real reconcile pipeline,
and stratified metrics with confidence intervals. It is a tuning aid, not the labelled genealogy set.
Tune against the `dev` split, confirm once on `test`; its README has the protocol and the baseline.

What it found, and what was changed on 13 November 2026:

* A place found only by the near-miss search could score at most 0.75 times its resemblance, while the
  best phonetic neighbour of any query scores about 1.0, so a junk neighbour beat a near-exact spelling.
  `GATEWAY_LEXICAL_FUZZY_BOOST` is now 1.15 (scoring only; no cost). Unscoped hit@10 on `dev` rose from
  0.661 to 0.746, OCR-style and keyboard-slip errors from about 0.25 to about 0.6, and correctly spelt
  queries did not change.
* A first-letter slip (*Seddam* for *Zeddam*) cannot be found while the first two letters must match.
  `GATEWAY_NEAR_MISS_PREFIX_LENGTH` set to 1 raised unscoped hit@10 to 0.822 on `dev` and 0.811 on the
  held-out `test` split (scoped 0.903, from 0.767). **It costs capacity: about 11% of throughput in the
  benchmark** (19.3 against 21.6 to 22.0 queries per second at 16 clients), so the live setting is 2 in
  `.env.local` until that trade-off is decided; 0 would add about 3 points more at roughly 38% more
  latency and is not recommended.

Both settings can be changed without a deploy: edit `.env.local` and restart the gateway.

