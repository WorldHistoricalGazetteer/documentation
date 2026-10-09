# Atlas: Discovering Linked Places

```{admonition} Beta: live now, for invited testers
:class: important
**Atlas** is the new map-first way of exploring the World Historical Gazetteer. It is live at
[whgazetteer.org/atlas/](https://whgazetteer.org/atlas/) and is open to WHG staff and signed-in beta
testers only. It is changing as testers' reports come in. This page belongs to the draft
[v4 user guide](./v4/userguide_index.md); to help test it, follow checklist N of the
[Beta Testing Plan](./v3-3/beta-testing.md#n-atlas--gazetteers-panel).
```

## The problem Atlas solves

The same real-world place is described, over and over, by many different sources.
GeoNames, Wikidata, OpenStreetMap, the Getty Thesaurus, historical gazetteers, and
data contributed by researchers all record their own version of it — each with its
own spellings, coordinates, dates, and categories.

WHG brings roughly **47 million** of these records together in one place. That is
wonderful for coverage, but it means that a single city can show up dozens of times.
Search for Istanbul and you might find separate records for *Byzantion*,
*Constantinople*, *Constantinopolis*, *Tsargrad*, *Qusṭanṭīniyya*, and *İstanbul* —
all the same place on the ground, scattered across sources and centuries.

Atlas's job is to recognise that these belong together, and to show you **one place,
many sources**, instead of a pile of look-alikes.

## What Atlas does

```{figure} images/atlas-03-index-villaris-explore.jpg
:alt: The Atlas map showing many place records across Britain
:width: 100%

Atlas is map-first: explore the index on the map — here browsing a single source
gazetteer, *Index Villaris* (1680), across Britain — then open any place to see
its sources.
```

As you explore the map, Atlas **groups records that refer to the same place** and
presents each group as a single result you can open up to see all its sources. Nothing
is decided in advance and frozen — the grouping is worked out on the spot, live, from
the records your search actually returns.

Think of it like a librarian who, faced with a stack of index cards written by
different people in different languages, quietly sorts them into piles — one pile per
real place — while you watch.

## How Atlas decides two records are the same place

```{figure} images/atlas-02-place-detail.jpg
:alt: A place record's full detail — dozens of names across scripts, dates, and links
:width: 100%

One source record opened in full: *Byzantion*, under dozens of names across scripts
and centuries (*Constantinople, Qusṭanṭīniyya, Tsargrad, İstanbul*…). Atlas compares
the **sound** of such names — not just their letters — when it weighs the evidence.
```

Atlas never relies on a single clue. Like a good detective, it weighs up **several
kinds of evidence** and asks how strongly, taken together, they suggest that two
records describe the same place:

- **Name** — do the names sound alike, even across different alphabets and languages?
  Atlas compares the *sound* of names, not just their letters, so it can tell that
  *Köln* and *Cologne*, or *القاهرة* and *Cairo*, are close relatives. (This is powered
  by WHG's [phonetic matching](./phonetics.md).)
- **Location** — are the two records in the same spot on the map?
- **Time** — do their date-ranges overlap? A record for a Roman fort and a modern town
  in the same place may be different things worth keeping apart.
- **Kind of place** — are they the same *type* of thing — a city, a river, a temple? —
  judged using the Getty Art & Architecture Thesaurus, a standard hierarchy of place
  types.
- **Stated links** — has anyone explicitly said "these two *are* the same" (or "these
  are *not* the same")? Authorities like the Library of Congress and Wikidata publish
  such links, and WHG contributors can add their own.

Each clue produces a score, and the scores are combined into a single measure of how
likely it is that two records are the same place.

## You are in control: the grouping dial

```{figure} images/atlas-01-search-results.jpg
:alt: Atlas search results with clustered places and the Merge sensitivity dial
:width: 100%

A toponym search for *Constantinople*: matching records are grouped into results
(each openable to all its sources), while the **Merge sensitivity** dial and
signal-weight controls re-group the map instantly.
```

Different questions call for different strictness. A quick overview might want places
grouped generously; careful scholarship might want only near-certain matches grouped.

So Atlas gives you a **dial** (a slider, labelled *Merge sensitivity*). Grouping is a view of
the results, not a change to the data: records are never merged, and each keeps its own sources.
Slide towards *loose* and more records are grouped together; slide towards *strict* and
only the most confident matches are grouped. You can even adjust **how much each kind of evidence counts** — for instance, leaning more
on names and less on exact location when you are working with sparsely-located
historical data. Every adjustment re-groups the map **instantly**.

## It all happens in your browser

The grouping is computed **on your own device**, in the browser, in a fraction of a
second. That is what makes the live dial feel instant — there is no round-trip to a
server each time you nudge it.

It also has an important privacy benefit. In the companion
[Collaborative Workbench](./v3-3.md), you can bring your **own** place data and see how
it lines up with WHG. Because the matching runs in your browser, your unpublished data
**never has to leave your computer** to be compared against the gazetteer.

## Confirmed links and your corrections

```{figure} images/atlas-04-index-villaris-popup.jpg
:alt: A place popup on the Atlas map showing a record's names, dates and relations
:width: 100%

Opening a place on the map shows its record — names, active dates, temporal
validity, and stated relations — the raw material behind confirmed links and
contributor corrections.
```

Some links are more than a good guess. When an authority or a WHG contributor states
outright that two records are the same place — or deliberately that they are *not* —
Atlas treats that as a firm instruction rather than a clue to be weighed. These
confirmed links always come from WHG's servers, so they reflect the community's
accumulated knowledge.

As a contributor you can add to this: assert that two records **are** the same place,
or flag that two similar-looking records are actually **distinct**. Your assertions
feed straight back into how places are grouped.

## Why not just fix the groups once and for all?

Older versions of WHG did exactly that: places were grouped a single way, in advance,
and that was that. But historical places are genuinely **contested** — experts
disagree about whether two names refer to one place or two, and the right answer often
depends on the period and the research question. A single frozen answer cannot serve
everyone.

Atlas embraces that. Instead of one fixed set of groups, it gives you a transparent,
adjustable view you can tune to your own needs — and it improves continuously as
authorities publish new links and contributors share their expertise.

## Searching

The search bar has an **Areas / Places** toggle.

- **Places** searches place names. A menu beside the box sets the match: **Exactly**, **Starts with**,
  **Contains** (the default) or **Sounds like**. *Sounds like* finds spelling variants across scripts.
  With an area selected, a Places search is limited to that area.
- **Areas** looks up a region or country by name. Choosing a suggestion selects the area: it appears as a
  chip under the bar and is outlined on the map. Several areas can be selected together. You can also
  click a region on the map.

Name search over areas works for OpenStreetMap and OpenHistoricalMap boundaries. For PeriodO,
Cliopatria, Native Land and OSM (miscellaneous) regions, the search box says *"Name search isn't
available for this source yet (planned)"* and names the source, rather than showing no results. Pick
those regions on the map instead.

A Wikidata record whose own label is missing is shown under its preferred place name, not as a bare
identifier such as "Q12345".

When a search leaves a source out unless you ask for it by name (today, GB1900, namespace `gb`), a
small note under the results reads *"Some sources are excluded by default"* and lists it.

## When something goes wrong

Atlas says which of three things happened, so you can tell a slow search from an outage from a missing
permission.

| Message | Meaning |
|---|---|
| *"... took too long to come back. The service is running; please try again."* | The search service is up but slow for this request. Try again, or narrow the search. |
| *"... is temporarily unavailable; the search service did not answer."* | The service could not be reached, and a banner at the bottom of the screen says so. This is a failure to ask, not a finding that nothing matches. |
| *"This is a beta feature; request access to use it."* | Your account does not have beta access. The link opens the contact dialog. |

"Not found" is reserved for the case where the service answered and has no such place. Failures that
used to appear only in the browser console are now shown as a brief message as well.

## Source and licence, on every result

Each cluster card ends with a **Source & licence** footer: one entry per source among its members,
each with that source's licence badge.

- Records from contributed datasets read *"licence per dataset (see Details)"*, because each
  contributed dataset has its own licence, shown on the record itself.
- Some sources are indexed and searchable, but their licence does not allow WHG to redistribute their
  records (for example China Historical GIS, Native Land and `kain_par`). Their entries read
  **"details withheld (licence)"**. The place still appears on the map and in results, but **Details**
  opens an explanation instead of the record: whose data it is, and a link to the source, where you can
  obtain it under the source's own terms. This is deliberate and is not an error.

## Controls marked "planned"

Some controls are visible but disabled and carry a **planned** tag: **Itinerary**, **Network** and
**Attest** in the Gazetteers panel. They show where Atlas is heading and do nothing yet. Comments on
how they should work are welcome.

Some gazetteers (OpenStreetMap and OpenHistoricalMap) cannot be browsed as a whole in **Explore** mode.
A link such as `?gazetteer=osm` selects such a gazetteer as a search filter instead and says so in a
notice.

## Reporting a problem

Choose **BETA menu, then Report a snag**, or use the snag link in the Atlas navigation. The Atlas link
opens the form with the feature area **Atlas** already chosen, and the report carries the Atlas state
(in the page address it records). Say which search term and gazetteer were involved. Please do not
include content from the `kain_par` or `vob_*` gazetteers in screenshots or public reports.

## On a phone or tablet

At 768 px wide or narrower, Atlas uses a mobile layout: the time slider, the signal-weight sliders, the
basemap menu and the overlay panels are laid out for touch, and panels open without permanently
covering the search box. The guided tour is not offered at this width. On a phone the share button
opens the device's share sheet.

## What's coming

- Contributor tools to confirm or reject links, shared with the
  [Collaborative Workbench](./v3-3.md).
- The controls marked **planned**: Itinerary, Network and Attest.
- Name search for the region sources that do not have it yet.
