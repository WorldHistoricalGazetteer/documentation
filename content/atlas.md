# Atlas: Discovering Linked Places

```{admonition} Forthcoming feature (beta)
:class: important
**Atlas** is the new map-first way of exploring the World Historical Gazetteer. It is
in active development and currently available to WHG staff and invited beta testers
only, behind a beta toggle. These pages describe how it works in plain language; when
Atlas ships they will move into **Guides & Tutorials**.
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

As you explore the map, Atlas **groups records that refer to the same place** and
presents each group as a single result you can open up to see all its sources. Nothing
is decided in advance and frozen — the grouping is worked out on the spot, live, from
the records your search actually returns.

Think of it like a librarian who, faced with a stack of index cards written by
different people in different languages, quietly sorts them into piles — one pile per
real place — while you watch.

## How Atlas decides two records are the same place

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

Different questions call for different strictness. A quick overview might want places
grouped generously; careful scholarship might want only near-certain matches merged.

So Atlas gives you a **dial** (a slider). Slide towards *loose* and more records merge
together; slide towards *strict* and only the most confident matches are grouped. You
can even adjust **how much each kind of evidence counts** — for instance, leaning more
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

## What's coming

- The map-first Atlas interface, with live grouping and the strictness dial.
- Contributor tools to confirm or reject links, shared with the
  [Collaborative Workbench](./v3-3.md).
- Grouping that draws on WHG's full range of evidence — name sound, location, time,
  place type, and stated links — all combined in your browser.
```
