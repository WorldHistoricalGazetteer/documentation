# Collaborative Collections

```{admonition} Coming soon — preview feature
:class: important

The **Collaborative Workbench** doc-types described here are **not yet generally
available**. They are in beta behind the **beta** menu tab, open to WHG staff and
invited **beta testers**, and are documented in advance so the design can be
reviewed and refined before release. Screens, labels, and behaviour may still
change. When the feature is released this notice will be removed.
```

## What it is

The Workbench you already met in [Map your Data](./map-your-data.md) is not only for
reconciling a spreadsheet of places. It is **one tool with many document types**, sharing
the same local-first, collaborative editor — the same page shell, the same "nothing leaves
your browser until you choose to publish", and the same team sharing. Reconciling a table of
places (*Map your Data*) is simply the first doc-type; the others let you build and publish:

- **Place Collection** — a curated set of places with notes, relations, and a narrative, for
  teaching, storytelling, or thematic research.
- **Itinerary** — a Place Collection where the *order* matters: an ordered journey through
  places, with per-leg annotations and a route-line preview.
- **Gazetteer Group** — an aggregation of published gazetteers, grouped for comparison or
  analysis. *("Gazetteer" is the new name for what was called a "Dataset"; a "Gazetteer Group"
  was a "Dataset Collection" — see [A note on names](#a-note-on-names).)*

Two further doc-types — **Routes** and **Networks** — are signposted in the tool as *"Coming
with v4"*. They are first-class historical entities in their own right (a route or a network is
more than a list of places), and arrive with WHG's next-generation data model.

## Starting a new document

Open the Workbench and choose **New…**. You are offered a tile for each doc-type:

| Tile | What you get |
|---|---|
| **Place Collection** | Curate a set of WHG places with notes and relations |
| **Itinerary** | An ordered Place Collection (a journey) |
| **Gazetteer Group** | Group published gazetteers together |
| **Map your Data** | The reconciliation workflow for a table of places |
| **Route** / **Network** *(disabled)* | *Coming with v4* |

Published items you have permission to edit also carry an **Edit in Workbench** button on their own
page (see [Editing something already published](#editing-something-already-published)).

## Finding your material — "Edit published…"

The Workbench menu also has an **Edit published…** entry: one page listing **everything you own or
collaborate on** — place collections, gazetteer groups, and gazetteers — with a search box and a type
filter. Each collection or group has an **Edit in Workbench** button that checks it out and opens the
right editor; gazetteers link to their page, where you can correct individual records (whole-gazetteer
editing arrives later). It's the quickest way back into anything you've published.

## The editor at a glance

Every editor is a single page of **numbered steps** — a sole-open accordion, so you focus on one at
a time. For a Place Collection or Itinerary the steps are:

1. **About** — title, description, keywords.
2. **Places** (or **Stops** for an Itinerary) — find and arrange the members.
3. **Map** — a preview of the whole assembled collection.
4. **Collaborate & share** — save to a team, invite people, get a read-only link.
5. **Save & publish**.

A status badge shows whether your work is *saved in your browser*, *saved to your account*, or
*syncing*. Nothing reaches WHG until you choose **Save to my account** or **Publish**.

## Building a Place Collection

A Place Collection is a **curation of places that exist in WHG**. Every member resolves to an
indexed WHG place — that is what keeps a collection a layer of interpretation (your notes and
narrative) *over* the shared gazetteer, rather than a private fork of it.

Two ways to add places, both in the **Places** step:

- **Search as you type.** Start typing a place name and matches appear instantly. Once you've added
  a place or two, later suggestions are **ranked by nearness** to what you already have (a
  collection's places tend to cluster), and a small **map with numbered pins** — matching the
  numbered result list — shows the candidates so you can pick the right one by location. Candidates
  that aren't WHG-indexed are flagged; a Place Collection only accepts indexed places.
- **Add places from a block of text.** Paste a paragraph, upload a file, or import a Google Doc, and
  WHG's place-name extractor finds the toponyms and locates them against the gazetteer — you then add
  the located ones with one click. (This is the one step where text is sent to WHG's server; the tool
  says so.)

Each member can carry a **note**, and you can reorder members with the ↑ ↓ buttons. When you
**Publish**, the collection is written into WHG's existing Place Collection model and appears on the
normal public collection pages (`/collections/…`) with its citation and carousel — nothing about the
public experience changes.

```{admonition} Adding a place WHG doesn't have yet
:class: note
If a name has no gazetteer match, the intended path is to **contribute it as a gazetteer record first,
then add it** (via Map your Data → contribute). Building that bridge smoothly is a follow-up; in the
current beta, collection members must resolve to an existing WHG place.
```

## Building an Itinerary

An Itinerary **is** a Place Collection — same members, same notes — with one difference: **order is
meaningful**. Stops are numbered, you set the sequence with the ↑ ↓ buttons, and the sequence is
carried through to the published collection so it can drive an ordered presentation. (A route-line
preview and "generate an itinerary from a reconciled Map-your-Data project" are planned refinements.)

## Building a Gazetteer Group

A Gazetteer Group aggregates **published gazetteers** (datasets) so they can be browsed and compared
together. Search for gazetteers as you type — suggestions are ranked by nearness to those you've
already added — pick the ones you want, order them, and publish into WHG's existing Dataset-Collection
model and browse pages.

## Editing something already published

The Workbench can also edit items that are **already published** — not only new drafts. On a published
**Place Collection** or **Gazetteer Group**, if you have edit rights (you're its owner, a collaborator,
or WHG staff) an **Edit in Workbench** button appears. It *checks the item out*: a team-owned working
copy is created in your browser and opens in the editor, where you edit it exactly like any draft.
When you **Publish**, your changes are written **back into the original** — guarded by a check that the
published copy hasn't changed underneath you. If someone else edited it meanwhile, you're told so and
asked to reload the latest rather than overwrite their work. The published record stays the single
source of truth; your working copy is explicit and versioned.

### Correcting a single record

You don't have to move a whole gazetteer to fix one thing. On a **published place page**, if you have
edit rights on its gazetteer, a **Correct this record** button checks out just **that one record** into
a focused editor. It exposes the record's common Linked Places fields — **primary name**, **country
codes**, **also-known-as names**, **place types**, **location/geometry**, **dates**, **authority
links**, and **descriptions** — each as an add/edit/remove list. You can also **re-reconcile the
record** in place: one click searches WHG and the linked authorities again and lets you attach a fresh
match (adopting its location if the record has none). Publish, and the changes are written back to that
record alone — its sub-records are rebuilt and, if the record is in WHG search, **only that record's
search entry is re-indexed**; the rest of the gazetteer is untouched. As with any check-out, it's
guarded against overwriting a change someone else made meanwhile.

**Location / geometry** is drawn on a map, the same way you draw geometry in *Map your Data*: pick
**Point**, **Line**, or **Polygon** and click the map, and click a shape button again to add another
part (making a multi-point, multi-line, or multi-polygon geometry). If the record's geometry carries
date or citation detail, that detail is kept attached when you reshape it. A place whose geometry can't
be edited unambiguously — a *mix* of geometry types, or *several* geometries that each carry their own
dates or citations — is shown read-only (view-only on the map) so nothing is lost; edit those in the
dataset editor. Other fields not yet surfaced (depictions, relations, named periods, and any authority
citations) are likewise preserved untouched through a correction.

### Suggesting a correction to someone else's record

You don't have to own a gazetteer to help fix it. On any published record — its **place page**, each
source box on a **portal page**, and the detail popup in a **gazetteer's places view** — a **Suggest a
correction** button opens the same field editor described above. Make your changes (and, optionally, a
short note explaining why), then **Submit suggestion**. Nothing changes on the record: your suggestion
goes to the gazetteer's owner and WHG staff for review.

Reviewers see pending suggestions in **Workbench → Review suggestions**: a side-by-side "current →
proposed" diff for each, with one-click **Accept** (applies the change to the record and re-indexes it)
or **Reject** (with an optional note back to you). If the record changed in the meantime, the suggestion
is safely set aside rather than overwriting the newer version. A small "corrections proposed" note also
appears on the record itself so everyone can see it is under discussion.

This is intentionally scoped to **fixing genuine errors** — a wrong coordinate, a mis-spelled name, a
missing Wikidata link. Recording *competing* claims from different sources (where two gazetteers
legitimately disagree) is a richer idea that belongs to the forthcoming graph data model; every
suggestion is preserved as a provenance record so it can feed that later work.

*While in beta, suggesting and reviewing corrections is limited to WHG beta testers and staff.*

### Correcting records across a gazetteer

Fixing records one page at a time is fine for the odd correction, but when you need to work through
many records of a **whole gazetteer** there is a shell for that. On a gazetteer's own page (and in the
**Edit published…** hub) an **Edit records in Workbench** button checks out a set of its records into a
list; expand any record to edit every field with the same editor described above, and the ones you
change are marked and published together.

Because a large gazetteer can hold far more records than a browser can comfortably hold, check-out is
**capacity-aware**. When you start, the tool measures how much room your browser has and offers:

- **the whole gazetteer**, when it comfortably fits, or
- **a subset** — filter by name and/or country, and cap how many records to pull in — which is the
  right choice for large gazetteers and for "fix these dozen records" work.

You then edit records locally (saved to your account as you go), and **Publish changes** writes back
only the records you actually changed — each one re-indexed in WHG search, the rest of the gazetteer
untouched. Every record is guarded individually: if someone else changed a record since you checked it
out, that one is skipped and reported (never silently overwritten) while your other corrections go
through. You can re-reconcile any record in place, exactly as in the single-record editor.

*While in beta this whole-/subset-gazetteer editing is limited to WHG staff; it opens to gazetteer
owners and their team members when v3.3 is released. Very large gazetteers are edited a filtered subset
at a time; fully streamed check-out of enormous gazetteers is a later enhancement.*

## Collaborating

Every doc-type is a document your **team** can co-own and co-edit. In the **Collaborate & share** step
you can save the project to a team, **invite people** by username (as editor or viewer), and create a
**read-only share link**. Where the real-time service is available, team-mates can even co-edit
together live. This is the same collaboration substrate as Map your Data — there is nothing extra to
learn.

## A note on names

WHG is standardising its vocabulary:

| You may have seen | It is now called |
|---|---|
| Dataset | **Gazetteer** |
| Dataset Collection | **Gazetteer Group** |
| Place Collection | **Place Collection** *(unchanged)* |

For now this is a **display change only** — the underlying URLs, downloads, and API are unchanged,
so nothing you have linked to or built against breaks. "Place Collection" keeps its name.

## How this relates to the older builders

These doc-types replace the older, multi-step **builder forms** (the Place Collection Builder and
Dataset Collection Builder) with a single local-first editor, while keeping the *same outcomes* —
published collections on the same public pages. The older builders remain available until the new
editors reach parity; when they're retired, their links will redirect into the equivalent **New…**
flow, and this guide will move from the roadmap into **Guides & Tutorials** alongside the rest.
