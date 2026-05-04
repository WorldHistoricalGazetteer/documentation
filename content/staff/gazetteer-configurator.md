# Gazetteer Configurator

The **Gazetteer Configurator** is a Django admin page where staff curate the
non-WHG gazetteers — the external sources WHG indexes (GeoNames, Wikidata,
OSM, OHM, TGN, Pleiades, Cliopatria, PeriodO, NativeLand, etc.). Curatorial
decisions made here drive what users see in the Atlas UI and what runs when
"Re-ingest" is fired.

```{note}
This page only manages **non-WHG** gazetteers. WHG-curated specialist
gazetteers (the datasets contributed by researchers, indexed under the
``whg`` namespace) are managed via the contributor workflow elsewhere;
their re-ingestion is triggered by changes in publication status or by
significant edits, not from this page.
```

## Where to find it

* Production: <https://whgazetteer.org/admin/api/gazetteerregistryentry/>
* Development: <https://dev.whgazetteer.org/admin/api/gazetteerregistryentry/>

It also appears under **API** → **Gazetteer registry entries** on the
admin index.

## What you'll see

A changelist with one row per external gazetteer. The standard authorities
(GeoNames, Wikidata, OSM, OHM, TGN, Pleiades, Trismegistos, GB1900,
IndexVillaris, D-PLACE, …) are seeded by migrations and topped up by the
indexing pipeline's inventory push. New rows appear automatically when the
pipeline pushes a new authority.

The columns are:

| Column | Meaning |
|---|---|
| **id** | Stable identifier — usually the WHG namespace (`gn`, `wd`, `osm`, `ohm`, …). |
| **name** | Display name shown in the Atlas UI. |
| **namespace** | The WHG namespace — for external authorities, the same as `id`. |
| **core** | When ticked, the gazetteer is **pre-selected** in the Atlas Gazetteers offcanvas (Filter mode) and gets a small "core" badge. Use sparingly — currently only GeoNames, Wikidata, and TGN are core. |
| **region_source** | When ticked, the gazetteer appears as a selectable Source in the Atlas **Regions** offcanvas — the panel users open from the "Regions" button on the Atlas page. The default-True set is OSM, OHM, OSM/OHM (Miscellaneous), PeriodO, Cliopatria, NativeLand. |
| **no_explore** | When ticked, the gazetteer is **disabled in Explore mode** of the Atlas Gazetteers offcanvas (Filter mode is unaffected). Use for gazetteers whose tilesets are polygon-only — the Explorer view depends on point/marker rendering, so polygon-only sources show a tooltip instead of being selectable in Explore. Independent of `region_source`. |
| **gazetteer_type** | Sketch field — `Standard`, `Itinerary`, or `Network`. Currently informational only; back-end semantics for itinerary and network gazetteers are not yet wired. |
| **status** | Read-only. `published` for live gazetteers; the other states (`draft`, `submitted`, `pending`, `rejected`) only apply to WHG-namespaced datasets and don't appear here. |
| **record_count** | Read-only. Updated by the indexing pipeline on each inventory push. |
| **reingest_status** | Read-only. `idle` / `queued` / `running` / `completed` / `failed`. See [Re-ingestion](#re-ingestion) below. |
| **reingest_finished_at** | Read-only. When the most recent re-ingest job ended. |
| **Re-ingest** | Per-row button — see [Re-ingestion](#re-ingestion). |

The four curatorial flags (`core`, `region_source`, `no_explore`,
`gazetteer_type`) are inline-editable from the changelist: tick or untick
the boxes in the rows you want to change, then click **Save** at the
bottom of the page.

```{important}
The indexing pipeline's inventory push (which periodically updates each
row's `record_count`, `h3_coverage`, `temporal_extent`, etc.) **never
overwrites** the four curatorial flags. Whatever you set here persists
across re-pushes. If you ever notice a curatorial setting reverting, that
is a bug — please report it.
```

## Common tasks

### Adding a "core" gazetteer

If a new external authority should be selected by default in the Atlas
Gazetteers offcanvas:

1. Open the row.
2. Tick **Core**.
3. Click **Save**.

Users will see it pre-checked next time they open the offcanvas. Use
sparingly — too many "core" gazetteers slows initial searches.

### Hiding a gazetteer from the Regions panel

Untick **Region source** on the row. The next page load will omit that
gazetteer from the Atlas Regions offcanvas Source list. The gazetteer
remains fully searchable elsewhere; only its Region-panel entry is hidden.

### Disabling Explore mode for a polygon-only gazetteer

Tick **No explore**. In the Atlas Gazetteers offcanvas, switching from
Filter to Explore mode will grey the entry out and show a tooltip
explaining why. Filter mode keeps the entry selectable.

## Re-ingestion

WHG ingests external authorities periodically from their upstream source
data (e.g. GeoNames quarterly dump, Wikidata daily dump). When a fresh
upstream is available — or when a fix to the ingestion script needs to be
re-applied — staff trigger re-ingestion from this page.

### Triggering a re-ingest

Two ways:

1. **Per row:** click **Re-ingest** in the rightmost column of the row.
2. **Bulk:** tick the checkboxes of one or more rows, choose
   **Re-ingest selected gazetteers** from the Action dropdown above the
   list, and click **Go**.

In both cases the request is sent immediately to the WHG indexing gateway
on the Pitt CRC cluster, which queues a Slurm job to run the re-ingestion
script with the gazetteer's namespace as a parameter. The exact work the
job does (which authority script to run, whether the boundary pass and
tileset rebuild also fire) is decided gateway-side based on the namespace.

### Status lifecycle

After a successful trigger, the row's **Re-ingest status** moves through:

```
idle  →  queued  →  running  →  completed   (on success)
                          ↘  failed       (on error)
```

The changelist auto-polls active rows every 5 seconds, so the status
column updates without a page reload. Once the status reaches a terminal
state (`completed` or `failed`) polling stops; refresh the page to start
fresh.

While a row is `queued` or `running` its Re-ingest button is greyed out.
You can still trigger re-ingest for **other** rows in the meantime.

### What "completed" actually means

`completed` means the gateway-relayed Slurm job finished successfully. It
does **not** mean every downstream artefact (the boundary tilesets, the
gateway hard-link store, etc.) has finished rebuilding — those are
separate stages with their own runtimes. Watch the indexing logs (or the
new inventory push that follows the re-ingest) to confirm the new data is
visible.

```{note}
A subsequent inventory push from the indexing pipeline will overwrite
this row's `record_count` and other inventory-derived fields with the
fresh numbers — your curatorial flags survive that push.
```

### If a re-ingest gets stuck

If a row stays `running` for much longer than expected (hours for most
authorities; for OSM/OHM possibly more):

1. Check the indexing pipeline's Slurm dashboard or the gateway logs.
2. If the underlying job has clearly died, ask an indexing-side admin to
   either retry the Slurm job manually or mark the gateway record `failed`
   so you can re-trigger from this page.

The two-tier guard (Django + gateway) means a stale `running` status
doesn't permanently block re-ingestion — re-clicking **Re-ingest** will
either adopt the in-flight job (if the gateway still tracks it) or start a
new one.

## Permissions

Reaching this page requires a Django staff account
(`is_staff=True`). Editing curatorial fields and triggering re-ingestion
do **not** require superuser privileges; any staff user with admin access
can use them. If you need staff access, contact the WHG technical lead.
