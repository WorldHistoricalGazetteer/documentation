# Atlas (staff guide)

The **Atlas** is WHG's map-first way of exploring places, at `/atlas/`. This page describes how it
behaves for users first, and then the parts that only staff and operators need. The operator sections are
marked **Staff** so that the user-facing sections can be lifted into a public page later. For the
user-level description, see [Atlas: Exploring Places](../atlas.md); for the tester checklist, see
[Beta Testing Plan, checklist N](../v3-3/beta-testing.md#n-atlas--gazetteers-panel).

```{note}
The Atlas is in beta. This page describes what is live; it does not describe planned features, except
under *Known limitations*.
```

## What the Atlas is and who can see what

The Atlas searches WHG's index of place records, groups records that describe the same place as you
explore, and shows them on a map. It also has a Gazetteers panel for filtering by source and browsing one
gazetteer on its own.

Access is gated by `User.can_access_beta`, which is true for staff, superusers and users whose **Role** is
`beta_tester`.

| Visitor | What happens |
|---|---|
| Anonymous | The `/atlas/` page and map load, as do the ungated parts (such as the Gazetteers panel's registry data). Anything that needs the search service says *"This is a beta feature, request access to use it."* |
| Signed in, no beta access | The same as anonymous. The beta-only JSON endpoints answer `403`, and the interface turns that into the *request access* message, with a link that opens the contact dialog. |
| Beta tester, staff, superuser | Everything. |

### Staff: granting a tester access

Open **Django admin, then Users**, find the person, and set **Role** to **beta tester**. Nothing else is
needed. Staff and superusers already qualify. The same gate controls the other beta features, so a
tester granted access for the Atlas will also see the Workbench BETA menu.

## How it fits together (Staff)

The browser loads `/atlas/` from Django and then calls Django's `/atlas/*` JSON endpoints (search, place,
boundaries, geometry, status, registry coverage). Django, which alone is allowed through the CRC firewall,
forwards them to the gazetteer service on the Pitt CRC (the *gateway*): `/api/search` for searches,
`/api/places` for place records and `/api/geometry/<place_id>` for exact outlines. The map's vector tiles
come directly from the tileserver, not through Django. The list of gazetteers, with their licences, dates
and coverage, comes from the gazetteer registry in Django's database, which the indexing pipeline keeps
up to date and which is also published as `GET /api/sources/`. Grouping of results into clusters is done in
the browser, from the hits the gateway returns.

The technical detail of each endpoint, with status codes, is in [APIs](../technical/apis.md#atlas-json-endpoints).

## Licensing behaviour

Some sources are indexed and searchable but may not be re-served. They are marked
`redistributable = false` in the registry (today `kain_par`, `nl` and `chgis`).

- Searching and mapping them is permitted. The result card's **Source & licence** footer reads
  "details withheld (licence)".
- **Details** (`/atlas/place/`) answers `451`, and the interface shows an explanation with a link to the
  source.
- **Exact area geometry** (`/atlas/geometry/`) also answers `451`, including for a place whose geometry is
  borrowed from such a source. The Atlas then keeps the outline drawn in the map tiles.
- **Contributed datasets** (`whg:*`) are withheld from `/atlas/geometry/` and the gateway's
  `/api/geometry/` with `451` "source licence not determined". Their licence, visibility and embargo
  cannot yet be looked up per dataset, so they are withheld rather than assumed public. This is a known
  limitation ([place#319](https://github.com/WorldHistoricalGazetteer/place/issues/319)).

The check runs in Django against the registry before the gateway is asked, and again in the gateway. If
they disagree, the refusal wins.

## Failure modes and what users see

The Atlas distinguishes "we could not ask" from "there is nothing". Staff should do the same when reading
a report.

| Situation | Status | What the user sees |
|---|---|---|
| No beta access | `403` | *"This is a beta feature, request access to use it."* |
| Gateway unreachable | `503` (with `Retry-After`) | *"... is temporarily unavailable; the search service did not answer."* and a banner at the bottom of the screen |
| Gateway slow | `504` on place, boundary and geometry calls; `200` with `timeout: true` on search | *"... took too long to come back. The service is running; please try again."* No outage banner |
| Gateway answered, no such place | `404` | "could not be found" |
| Source not redistributable | `451` | the licence explanation |

A slow search must not raise the outage banner: the service is up. An empty result next to `gateway: false`
or `timeout: true` is a failure, not a finding. If testers report "no results" for a search that should
match, ask whether a message or banner appeared.

## Testing (Staff)

**Before and after every Atlas deploy**, run the headless smoke test from the `whg3` repository:

```
python3 scripts/atlas_smoke.py <base>
python3 scripts/atlas_smoke.py <base> --prove-it-fails
```

`<base>` is the site to test. It runs anonymously in its own browser (never your own Chrome, never a
visible window) and checks the page load, the beta gates, deep links, the mobile layout and the search
bar. It exits `0` when all checks pass (documented known failures excepted), `1` on a failed check and `2`
if it could not run. `--prove-it-fails` runs every check against a page that cannot pass and requires every
check to fail, so a green result is known to be able to turn red. Run it on dev before promoting, and on
production afterwards. It cannot log in, so the beta-only behaviour needs a manual check as a beta user.

**Debug flag.** Add `?debug` to the URL, or run `localStorage['whg.debug'] = '1'` in the browser console.
This exposes the map as `window.heroMapInstance`. The `localStorage` form survives the page rewriting its
own address, which `?debug` does not, so automation should use it.

**Readiness signal.** With the debug flag on, the Atlas sets `window.__whgAtlas.booted` as the last
statement of its start-up. Wait on that. Do not wait on MapLibre's `map.loaded()` or `idle` event: on a
plain `/atlas/` load the globe spins until the first interaction, so the map never reports idle on a
perfectly healthy page. (Opening a gazetteer with `?gazetteer=<namespace>` stops the spin, so the map does
settle there.)

A map that looks blank when a headless or background browser window is not frontmost is a browser
rendering artefact, not an Atlas fault.

## Beta testing process

1. Testers work through **checklist N** in the [Beta Testing Plan](../v3-3/beta-testing.md#n-atlas--gazetteers-panel).
   Its "known issues, please don't report" lists are kept current as fixes land.
2. Testers report problems with **BETA menu, then Report a snag**, or the snag link in the Atlas
   navigation. The Atlas link preselects the **Atlas** feature area and attaches the Atlas state.
3. Snags are triaged on the beta tracker (GitHub Project 12 for the Atlas items N1 to N8) and filed as
   issues on the `place` repository.
4. Testers must not put content from the `kain_par` or `vob_*` gazetteers in screenshots or public reports.

## Known limitations

- Low-zoom gaps for polygon-dominant gazetteers, and OHM square holes at low zoom: tile generation uses a
  polygon-over-point majority vote ([place#166](https://github.com/WorldHistoricalGazetteer/place/issues/166)).
- Dates: inconsistent date ingestion across authority scripts, and corrected data for `osm` and `tgn`
  needs re-tiling before it is visible ([place#246](https://github.com/WorldHistoricalGazetteer/place/issues/246)).
- Type identifiers in the index are bare codes with the vocabulary hidden in a label field
  ([place#305](https://github.com/WorldHistoricalGazetteer/place/issues/305)).
- Contributed records carry no feature class in the index, so feature-class filters drop them
  ([place#286](https://github.com/WorldHistoricalGazetteer/place/issues/286)).
- The boundary-level select may show "local" on a cold load; unconfirmed
  ([place#317](https://github.com/WorldHistoricalGazetteer/place/issues/317)).
- Exact area geometry is not served for contributed datasets until a per-dataset licence lookup exists, and
  the starting simplification tolerance is still being tuned
  ([place#319](https://github.com/WorldHistoricalGazetteer/place/issues/319)).
- Itinerary, Network and Attest are visible but marked "planned".

## Not yet documented

Editorial review of submitted gazetteers, contributor oversight ("My Gazetteers") and the retention sweep
belong to the v4.0 Atlas and are not live. They will be documented here when they ship; the design is in
the `whg3` repository's Atlas planning documents.
