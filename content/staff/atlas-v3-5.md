# Atlas v3.5 (forthcoming)

```{warning}
**This page is a placeholder.** The v3.5 Atlas UI is in active
development. Once it ships, this page will need significant augmentation
covering the staff-facing affordances listed below. Treat the content
here as a forward-looking outline, not authoritative documentation.
```

The v3.5 release reframes the WHG platform around an **Atlas** UI as the
default site interface, with the v3.2 distinctions between Authorities,
Datasets, and Collections collapsed into a unified concept of
**Gazetteers**. Several pieces of that release introduce new staff
workflows that will live alongside the {doc}`./gazetteer-configurator`
and {doc}`./api-profiles` pages already documented in this section.

For the full design specification, see the master plan in the `whg3`
repository: `developer/plan-Atlas-DynamicClustering.prompt.md`.

## Sections to be added

### Editorial review of submitted gazetteers

Contributors will be able to submit a private gazetteer for editorial
review. Editors will need a dedicated interface to:

* See the queue of submitted datasets.
* Open one in **Preview-as-published** mode (the dataset rendered as if
  already merged into the public corpus) or **Working** mode (with
  pending hard-link assertions visible).
* Read the assertion history and any prior editor notes.
* **Accept** (publishes the dataset and flips its assertions from
  `pending` to `active`) or **Reject** (records mandatory editor notes
  and returns the dataset to the contributor with the reason).
* Hand off review with notes to a colleague.

This page will document where to find the queue, the conventions for
editor notes, and the practical sequence for the most common review
scenarios.

### Contributor oversight ("My Gazetteers")

Staff need visibility into:

* Which contributors have datasets in `pending` (draft / submitted /
  rejected) state and how long each has been there.
* The retention countdown — pending datasets unmodified for 11 months
  trigger a contributor notification, and at 12 months the dataset is
  deleted unless flagged `private_permanent` or moved to `submitted`.
* The list of `private_permanent` datasets per contributor, against the
  per-contributor storage cap (operational policy, adjustable on
  request).

### Working / Preview-as-published toggle

Both editors and contributors can switch between viewing the corpus with
their pending content treated as drafts (Working) or as if already
published (Preview-as-published). The toggle has subtle semantics around
which scope tokens get applied to discovery queries; the staff
documentation will cover how this affects what staff see when reviewing
contributor work.

### Volunteering, API, and Admin Dashboard relocations

The v3.2 site navigation's "Data" entry will be removed in v3.5. Some of
its sub-functions move to the Atlas UI itself; others move to the admin
or to dropdowns. This page will list where to find:

* **Volunteering dashboard** — currently linked from the Data menu;
  destination TBD.
* **API documentation** — see also the existing
  {doc}`./api-profiles` page for quota management.
* **Admin Dashboard** — moved into the rightmost (user) navbar dropdown,
  gated on `is_whg_admin`.

### Retention sweep monitoring

A scheduled Celery job (Batch 14a in the indexing rebuild plan) runs the
retention sweep daily, sending notifications to contributors at the
11-month boundary and confirming deletion at 12 months. Staff will need
a way to:

* Inspect the sweep's recent runs (where it logged what).
* Override the timer for a specific dataset (e.g. when a contributor has
  been in touch but hasn't yet acted in the UI).
* See the audit trail of deletions.

### Gazetteers offcanvas — staff perspective

The Atlas Gazetteers offcanvas exposes a **My Gazetteers** toggle that
groups a user's gazetteers into Published / Private / Pending. For staff,
the same interface needs to render every contributor's gazetteers — not
just the staff member's own — so reviewers can pick any pending dataset
to enter its working scope. This page will document the staff-only
affordance and the keyboard shortcuts (if any) that surface it.

## Cross-references

When the v3.5 documentation is filled in, expect cross-links to:

* The {doc}`./gazetteer-configurator` page (re-ingestion, curatorial
  flags) — the Atlas Gazetteers offcanvas reads the same registry rows
  curated there.
* The {doc}`../guides` section — many user-facing v3.2 guides
  (Workbench, Reconciliation, Publishing) will be superseded or
  rewritten for v3.5.
* The Master Plan document in the `whg3` repo at
  `developer/plan-Atlas-DynamicClustering.prompt.md`.
