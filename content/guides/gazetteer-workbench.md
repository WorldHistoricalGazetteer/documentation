# Gazetteer Workbench

```{admonition} Coming soon — preview feature
:class: important

The Gazetteer Workbench is **not yet available to WHG users**. It is currently
in staff testing behind the **Map your Data** (beta) menu tab — the name it
carries in the interface — and is documented here
in advance so that the design can be reviewed and refined before release. Screens,
labels, and behaviour described below may still change. When the feature is
released this notice will be removed.
```

## What it is

The **Gazetteer Workbench** is a browser-based tool for taking a table of places
— a spreadsheet, CSV, TSV, or JSON export — all the way from a messy first draft
through to reconciled, standardised data, **without uploading anything to WHG
first**. You import your file, tidy and interpret its columns, match its place
names against WHG's gazetteers, review the matches, and export an augmented copy
— all in a single page.

It reaches WHG's servers for one thing only: to look up candidate matches for
your place names. Everything else — your file, your column choices, your review
decisions — stays on your own computer.

## Why a new tool

WHG already has a well-established reconciliation and accessioning workflow (see
[Reconciliation & Accessioning](reconciliation.md) and the
[Workbench Pathways](workbench.md) guide). That flow is built around **publishing**:
you upload a dataset into your WHG workspace, run a server-side reconciliation
task, and review the results there. It works well once your data is clean and you
intend to contribute it.

The Gazetteer Workbench addresses the stage *before* that, and some cases that sit
outside it:

- **Local-first and private.** Your data never leaves your browser except as
  anonymous name-lookups. That suits work that is unpublished, sensitive, still in
  progress, or simply not (yet) destined for WHG at all.
- **Messy real-world data.** Historical sources rarely arrive in tidy WGS84
  decimal degrees and ISO dates. The Workbench recognises a wide range of
  coordinate formats and historical/calendrical date styles and converts them for
  you, up front.
- **Instant feedback.** Because it runs in the page, you see the effect of every
  column choice, filter, and match immediately, with no task queue to wait on.
- **Small jobs as well as large.** It is designed to be pleasant for a single
  place as much as for a bulk table.

Think of it as a workbench for *preparing* a gazetteer, complementary to — not a
replacement for — the existing publication and accessioning pipeline.

## Getting started

Open the tool from the **Map your Data** tab in the main menu (marked *beta*,
staff only for now). The page is organised as a set of numbered, collapsing
panels; you work down them in order, and each one summarises its state in its
header once done.

New to it? **Take a tour** (top of the page) loads the sample dataset and walks you
through the whole flow — import, column roles and cleaning, scope, reconciliation,
review, map, place types, and export — highlighting each stage as it goes.

Your work is saved automatically in the browser as you go, so you can close the
tab and come back to it later. Two controls make this explicit:

- **Save** writes a `.whgproj` backup file — your whole project, including matches
  and review decisions — to your computer. Restore it later by dropping it back
  onto the same import area.
- **Clear my data** removes the project from the browser entirely.

```{note}
"Save" produces a local backup file; nothing is sent to or stored on WHG's
servers. Because the data lives in *this* browser, on *this* computer, clearing
your browser storage or switching machines will lose an un-saved project — take a
`.whgproj` backup for anything you care about.
```

## 1 · Import a dataset

Drag a file onto the import area, or click to choose one. CSV, TSV, and JSON are
accepted (including JSON in WHG's `{id, fields}` shape). A `.whgproj` backup
dropped here is recognised and restored in full rather than treated as new data.

To try the tool without your own data, use **Load a sample dataset** — a small demo
that exercises coordinate and date conversion and multi-column (County → Parish →
Place) reconciliation.

Once a file loads, the panel collapses to a summary and the tool moves you on to
confirming the columns.

## 2 · Confirm column roles

The Workbench shows a preview of your table and its best guess at what each column
is for. You assign each column a **role** from a dropdown:

- **Place name** — the place name to reconcile (required);
- **Coordinates / grid ref**, or **Latitude** and **Longitude** — location;
- **Date / year** — a column of dates to interpret;
- **Country / ccode** — a country hint used to narrow matches;
- **↳ Contains "…"** — marks this column as a spatial **container** of another
  column, building the containment hierarchy (see [below](#the-spatial-hierarchy));
- **Feature type**, **Identifier** — carried through and used as hints;
- **Other (ignore)** — columns carried through untouched but not processed.

Ignored columns are hidden in the preview by default; a toggle shows or hides them.

### Cleaning and reshaping your table

Each column in the roles table carries a small set of controls, so you can tidy
the data here rather than going back to a spreadsheet:

- a **drag handle** to **re-order** columns (ignored columns can be moved too);
- a **transform** button that applies a light cell operation to every value in
  the column — trim whitespace, change case (upper/lower/title), collapse
  repeated spaces, or **find & replace** (plain or regular-expression) — with a
  live preview of the effect before you commit;
- a **delete** button to drop a column you don't need.

Every edit — a transform, a reorder, a deletion, a role change — is **undoable**.
Use the **Undo** / **Redo** buttons (or <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Z</kbd>
and <kbd>Shift</kbd>+<kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Z</kbd>) to step backwards
and forwards through your changes.

### The spatial hierarchy

If your table has administrative columns (a county, parish, region, province…),
you can tell the Workbench how they **nest**, and it will use that nesting to
disambiguate place names during reconciliation. You express the hierarchy directly
in each column's role dropdown: a container column's role reads **"↳ Contains
‹child column›"**. So for a `County, Parish, Place` table you would have:

- **County** → *Contains "Parish"*
- **Parish** → *Contains "Place"*
- **Place** → *Place name*

From these links the Workbench derives the containment chain **County → Parish →
Place** — coarsest first, place name last. There is no separate ordering control:
to **re-order or re-nest** the hierarchy, just change a column's "Contains" choice
(for example, point *Parish → Contains "County"* to swap the two levels), and the
chain updates. The number of levels is unlimited — a
`Country → Region → District → Settlement` table works the same way.

The Workbench guesses a sensible default chain on import (recognising common
administrative column names and linking them coarse-to-fine down to the place-name
column); adjust any that are wrong.

### Coordinates

If you assign a coordinate role, the Workbench detects the format automatically and
converts it to standard WGS84 decimal degrees. It recognises decimal latitude/
longitude (in either order, with a swap toggle when two columns are used),
degrees-minutes-seconds, well-known text (WKT), **OS National Grid** references
(e.g. `SK690965`), **Irish Grid**, and UTM. Where the format is ambiguous you can
override the detected choice. A **Validate all rows** check reports how many values
convert cleanly and lists any that do not. **Insert WGS84 columns** adds the
converted latitude and longitude to your table as real columns, so the standardised
coordinates travel with the data through every later step and every export.

### Dates

If you assign a date role, the Workbench parses messy historical dates into ISO
start/end values. It handles, among others:

- day/month/year in UK order (`dd/mm/yyyy`) by default, with automatic detection
  when a value could only be month-first;
- month names, ordinals, centuries, and bare years;
- **BCE/CE** (including a leading minus), approximate dates (`c.`, `circa`, `?`),
  and open-ended dates (`before`, `after`, `from…`);
- ranges written in many styles;
- **English/British regnal years** (e.g. `8 Henry VI`, and Latin roll clauses);
- **feast days** (fixed and movable), and **Julian ↔ Gregorian** conversion,
  including Old-Style/New-Style dual dates such as `1641/2`;
- a range of **non-Western calendars** — Islamic (Hijri), Hebrew, Thai, Śaka,
  Persian, Coptic, Ethiopian, Japanese *nengō*, French Republican, and others —
  converted to Gregorian intervals.

The panel names the calendar or format it detected, and offers the same
validate-all check as for coordinates. As with coordinates, **Insert ISO date
columns** writes the parsed start/end dates back into your table as real columns.

```{note}
Date interpretation is a genuinely hard problem and the parser is deliberately
cautious. Always skim the validation report, and treat the converted ISO dates as
a strong first pass to be checked, not an infallible authority — especially for
regnal years, movable feasts, and calendar conversions near a year boundary.
```

## 3 · Reconcile against WHG

Reconciliation matches your **name** column against WHG's gazetteers using the
standard WHG reconciliation service. Only the place name (with a country hint where
available) is sent — never your full rows. Progress is shown, and you can stop and
resume.

```{note}
**Every row is reconciled individually — identical names are _not_ merged.** Earlier
designs de-duplicated names and fanned one result out to all rows sharing it. The
Workbench deliberately does **not** do this: you have already disambiguated your
places, so two rows both called "Newton" may be different Newtons and each deserves
its own candidate list, its own match, and its own geometry. This makes the row count
and the query count the same.
```

**Iterative, containment-chained reconciliation.** If you defined a
[spatial hierarchy](#the-spatial-hierarchy), the Workbench reconciles it **one column
at a time, parent → child**, and gates each step on your review:

1. You reconcile the **outermost** column first (e.g. *County*).
2. You **review and confirm** its matches (step 4).
3. Only then does the **next** column unlock — and it is matched *within* the
   places you just confirmed (a Parish is searched inside its County, a Place inside
   its Parish). This containment sharpens the disambiguation of same-name places far
   more than a country hint alone.

A **column switcher** — parent → child pills, shown in both the reconcile and review
panes — tracks each column's state (ready, in review, confirmed, or locked) and lets
you focus a column to review or re-run it. Because a child inherits containment from
its *confirmed* parents, changing a parent decision later resets the columns below it,
so the chain always stays consistent.

```{tip}
Containment can only *exclude* candidates that fall outside a parent when the confirmed
**parent record has a geometry** to test against. Many administrative records — especially
Wikidata- and OpenHistoricalMap-sourced counties — carry no geometry, so a parish "within"
them cannot be narrowed. To get reliable containment for an administrative column, set its
**Sources** to a gazetteer whose records *do* have geometry — for English counties, **UK
Historic Counties** — so every parent resolves to a shape the child can be matched inside.
```

### Scope — narrowing the whole dataset

Where per-column **Sources** choose *which gazetteers* a column queries, **Scope**
constrains *what counts as a candidate* across the **entire** dataset — a coarse
filter you set once, before matching. Open **Scope** (its button shows a badge when
any constraint is active) to set any combination of:

- **Where** — a place filter, given as one or more **country codes**, a **WHG
  region** chosen by name, or an **area you draw** on a modal map (a bounding
  polygon). Candidates outside it are dropped.
- **When** — a **year range**; candidates whose own dates fall wholly outside it are
  dropped.
- **What** — a Getty **AAT place type**, chosen with the type picker (see
  [Place types](#place-types-required) below). Restricts candidates to that type and
  its descendants — e.g. scoping to *inhabited places* keeps rivers and buildings out
  of the running.

Scope is optional, but on a dataset with a clear geographic, temporal, or typological
focus it removes whole classes of wrong candidate before scoring even begins.

Controls that shape the results:

- **Auto-confirm threshold.** A match at or above the score you set (or an exact
  name match) is accepted automatically — **unless it is ambiguous**: if two or more
  *different* places tie for the top score (say a "Devon" in several countries), the
  row is held back for review rather than guessed. This leaves only the genuinely
  uncertain cases for you to decide.
- **Per-column Sources.** Each column can draw on its **own** source gazetteers,
  which is often what you want: reconcile a *County* column against a historic-counties
  gazetteer, a *Parish* column against a parish gazetteer, and the place names against
  everything. Open **Sources** (its label shows which column it targets) and choose
  *all* sources, *prioritise* a chosen few (they sort to the top), or *only* those few
  (others are excluded from the query). The list of gazetteers, with record counts, comes
  from WHG's registry. A column with no explicit choice uses **all** sources; a per-column
  choice never changes another column's default.
- **Re-reconcile a column.** Realised a column needs a different gazetteer after
  confirming it? Select it in the switcher, change its **Sources**, and press
  **Re-reconcile ‹column›** to run it again; the columns below it reset so the new
  containment flows through.
- **Phonetic matching** *(on by default).** As well as text matching, the Workbench
  computes a **phonetic embedding** for each name — using WHG's *Symphonym* model
  running **entirely in your browser** — and sends it with the query, so candidates
  are ranked by how the name *sounds*, not just how it is spelled. This helps across
  spelling variants, transliterations, and scripts. A **Language** selector (auto-detected
  from your data, overridable) conditions the embedding; set it if the automatic guess
  is wrong. The first run downloads the model (~20 MB, then cached); untick the box to
  fall back to plain text matching.

## 4 · Review & confirm matches

This step walks you through the rows that need a human decision. For each one you
see the ranked candidate matches on the left and a map on the right:

- candidates are **numbered and colour-coded**, and the same numbers and colours
  mark their locations on the map; a ★ shows your own coordinate for the place if
  you supplied one;
- **hovering** a candidate in the list highlights its marker on the map (and vice
  versa); **accepted** candidates get a coloured ring;
- hovering a map marker shows the candidate's source gazetteer (by name) and its
  alternate names;
- the map uses WHG's portal basemap, with a layer switcher and terrain toggle
  (your basemap choice is remembered across page loads).

It is built for the keyboard: press **1–9** (or click) to **toggle** a candidate,
**x** to reject, **s** to skip, **n** for no-match, **u** to undo, and the arrow
keys to move between rows. If the first few candidates aren't enough, **load more
candidates** fetches a larger batch. A "review all" toggle lets you revisit even
the auto-confirmed matches. Decisions are saved as you go.

**Accepting more than one match.** Toggling lets you accept **several** candidates
for a row — each becomes a `closeMatch` (a place legitimately linked to more than one
record, e.g. the same place in both GeoNames and a WHG dataset).

**Setting the location.** A *Location* toolbar lets you fix the geometry for the
row: **Use match location** clones the selected match's geometry (point, line, or
polygon) into your data, or you can **draw** your own — Point, Line, or Polygon,
clicking on the map to add vertices and *Finish* to complete. Press a shape's button
again to add another part (→ Multi-point / -line / -polygon). *Clear* removes the
override. Whatever you set here wins on export.

### Filtering the results

On a large table you rarely want to page through every row. A **filter** panel lets
you slice the reconciled results by **status** (needs review, auto-confirmed, no
match), **match score**, a **column's values**, whether a row has coordinates or
dates, or a free-text **name search**. The filter is shared: it drives the results
table, the review queue, *and* the map together, so you can zero in on — say — just
the unmatched rows in one county and work only on those.

## 5 · Map

Every located row appears on a single map, built from the coordinates the Workbench
converted (or a geometry you drew or cloned in review). **Hover** any point to see its
details — name, administrative context, date, confirmed match, and coordinates.

The map is designed to stay fast at scale: points **cluster** as you zoom out (click a
cluster to zoom in and split it), and a **heatmap** takes over at low zoom, so a table
of thousands of places renders smoothly in the browser without a server round-trip.

## 6 · Place types, enrich & export

The final step assigns place types, produces an **augmented copy** of your table for
use elsewhere, and — when you're ready — contributes it to WHG. Everything here is
generated in your browser, with nothing uploaded until you choose to contribute.

### Place types (required)

WHG requires every place to carry a Getty **AAT place type** (a controlled term such
as *inhabited place*, *river*, or *castle*), so this is usually the one thing you add
before contributing. Assign types with the built-in **type picker** — the same
searchable widget used by Scope — which searches WHG's curated AAT index with
live suggestions and shows each term's place in the hierarchy. Two modes:

- **One type for all rows** — pick a single type that applies to the whole dataset
  (a gazetteer of parishes, say);
- **Map a column's values** — when a column already records a kind (`town`, `river`,
  `castle`…), map each distinct value to its own AAT type once, and every row inherits
  the type for its value.

### Augmented columns

Your original columns are always kept; you choose which augmented columns to add:

- **Confirmed WHG match** — the identifier, title, score, and source gazetteer of
  the candidate you accepted for each place;
- **Enrich from WHG** — richer detail for your confirmed matches (the matched
  place's coordinates, variant names, description, type, and — for Wikidata-backed
  matches — a **Wikipedia** article link), fetched from WHG.

(The standardised **WGS84 coordinates** and **ISO dates** are added earlier, in
[step 2](#coordinates), so they are already part of your table.)

Choose a format and export:

- **CSV** and **JSON** — your table plus the augmented columns, for spreadsheets or
  other software;
- **Linked Places (LPF GeoJSON)** — WHG's own upload format, and the best starting
  point if you go on to contribute the data.

```{note}
The LPF export maps a sensible subset of your data onto WHG's upload schema as a
**starting point** — you will usually want to review and complete it (titles,
sources, licences, and so on) before uploading.
```

**Validated before you contribute.** The **Contribute to WHG** button builds the
Linked Places file and checks it **in your browser** against WHG's own upload
schema before anything is sent. Until every place passes, the button stays disabled
and a summary lists what's still missing — most often a **place type** (see above),
but also a title, a name, or a location — so problems surface here rather than as a
rejection after upload.

**Contribute to WHG — one click.** Once it validates, the button submits the file
straight to WHG's [upload and publication](uploading.md) workflow for you — no
separate export/upload step. You land on WHG's validation page to review and publish;
your local copy stays in the browser. Publishing links your places with records for the same places from
other datasets — the step that generates the rich Place Portal pages. The Workbench is
the preparation bench; publication remains the way your work becomes part of WHG.

## Caveats

```{warning}
- **Preview / staff only.** The Workbench is not yet released to users; behaviour
  may change.
- **Your data is local.** It lives in this browser only. Take a `.whgproj` backup
  before clearing browser data or switching computers, and note that this local
  copy is *not* itself a contribution to WHG — publishing still goes through the
  normal [upload](uploading.md) and [reconciliation/accessioning](reconciliation.md)
  workflow.
- **Automated conversions need checking.** Coordinate and, especially, historical
  date conversions are best treated as a well-informed first pass. Use the
  validation reports and spot-check the results.
- **Reconciliation suggests, you decide.** A high match score is a prompt for a
  human judgement, not a guarantee; the meaning of a confirmed match is a
  `closeMatch` assertion, explained in
  [Reconciliation & Accessioning](reconciliation.md#what-does-closematch-mean).
```
