# Gazetteer Workbench

```{admonition} Coming soon — preview feature
:class: important

The Gazetteer Workbench is **not yet available to WHG users**. It is currently
in staff testing behind a "Reconciliation beta" menu tab and is documented here
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

Open the tool from the **Reconciliation beta** tab in the main menu (staff only,
for now). The page is organised as a set of numbered, collapsing panels; you work
down them in order, and each one summarises its state in its header once done.

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

Once a file loads, the panel collapses to a summary and the tool moves you on to
confirming the columns.

## 2 · Confirm column roles

The Workbench shows a preview of your table and its best guess at what each column
is for. You assign each column a **role**:

- **name** — the place name to reconcile (required);
- **coordinate(s)** — a single coordinate column, or separate latitude and
  longitude columns;
- **date** — a column of dates to interpret;
- **admin parent** — an administrative parent (county, region, country…), used to
  disambiguate names;
- **ignore** — columns you want carried through untouched but not processed.

Ignored columns are hidden in the preview by default; a toggle shows or hides them.

### Coordinates

If you assign a coordinate role, the Workbench detects the format automatically and
converts it to standard WGS84 decimal degrees. It recognises decimal latitude/
longitude (in either order, with a swap toggle when two columns are used),
degrees-minutes-seconds, well-known text (WKT), **OS National Grid** references
(e.g. `SK690965`), **Irish Grid**, and UTM. Where the format is ambiguous you can
override the detected choice. A **Validate all rows** check reports how many values
convert cleanly and lists any that do not.

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
validate-all check as for coordinates.

```{note}
Date interpretation is a genuinely hard problem and the parser is deliberately
cautious. Always skim the validation report, and treat the converted ISO dates as
a strong first pass to be checked, not an infallible authority — especially for
regnal years, movable feasts, and calendar conversions near a year boundary.
```

## 3 · Reconcile against WHG

Reconciliation matches your **name** column against WHG's gazetteers using the
standard WHG reconciliation service. Only your distinct place names (with any
admin-parent context) are sent — duplicates are collapsed — and matches are fanned
back out to every row that shares a name. Progress is shown, and you can stop and
resume.

Two controls shape the results:

- **Auto-confirm threshold.** Matches at or above the score you set (or an exact
  name match) are accepted automatically, leaving only the genuinely ambiguous
  cases for you to review.
- **Sources.** A picker lets you set which source gazetteers to use: *all*,
  *prioritise* a chosen few (they sort to the top), or *only* those few (others are
  excluded from the query). Your choice is remembered across page loads.

## 4 · Review & confirm matches

This step walks you through the names that need a human decision, highest-impact
first (those affecting the most rows). For each name you see the ranked candidate
matches on the left and a map on the right:

- candidates are **numbered and colour-coded**, and the same numbers and colours
  mark their locations on the map; a ★ shows your own coordinate for the place if
  you supplied one;
- hovering a map marker shows the candidate's source gazetteer (by name) and its
  alternate names;
- the map uses WHG's portal basemap, with a layer switcher and terrain toggle.

It is built for the keyboard: press **1–9** (or click) to accept a candidate,
**x** to reject, **s** to skip, **n** for no-match, **u** to undo, and the arrow
keys to move between names. If the first few candidates aren't enough, **load more
candidates** fetches a larger batch. A "review all" toggle lets you revisit even
the auto-confirmed matches. Your decisions are saved as you go and apply to every
row sharing that name.

## 5 · Enrich & export

```{admonition} Under construction
:class: warning

This final step is still being built. When complete it will let you **export an
augmented copy** of your table — your original columns plus added WGS84 latitude/
longitude and ISO start/end date columns wherever the Workbench converted them, and
identifiers for your confirmed matches — in CSV, JSON, and WHG's Linked Places
formats, ready either for use in other software or for contribution to WHG through
the existing [upload and publication](uploading.md) workflow.
```

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
