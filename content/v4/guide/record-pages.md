# Record Pages and the Concordance

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): confirm the public URL of a record page. In beta the page is served at
% /atlas/place/<id>/ to beta testers; at release /entity/place:<id>/ renders the same page.
% TODO(release): confirm the wording of the empty state and of the provenance labels on the live page.
% Updated 2026-10-21 (place#325 release rulings): the gloss ("About this group") and the EDOPS
% environmental signature are on the page (beta now; public at release, signed-out visitors too).
% Updated 2026-10-22 (place#325 Stage 5, after SG's review on dev): two-column layout, folds with
% totals, ringed shared points, Wikipedia links in "Elsewhere", environment on demand only.

In v4 the old *place portal* page is replaced by two kinds of page, each named for what it is:

- a **record page**, for one source's account of a place, described here;
- a **locus page**, for a group of records that look alike under settings you choose (see
  [Loci](./loci.md)).

Neither is called a "Place". Whether a group of records describes one place is a judgment, and WHG
does not make it for you.

## What a record page is

Every record in WHG comes from one source: a gazetteer, a contributed dataset, or an authority such
as GeoNames or the Getty Thesaurus of Geographic Names. A **record page** shows that one source's
account: its names, types, dates, locations, links, related places, descriptions and images, with
the source's attribution and licence.

Record pages are for the records WHG holds in its own database: contributed datasets, and authority
data loaded as a dataset (the Getty TGN dataset, for example). Records found only in WHG's search index,
such as GeoNames or Wikidata records, have no record page; where the Concordance names one, its
link opens it in the [Atlas](../../atlas.md).

A record's identifier is `place:<id>`, and its permanent address is `/entity/place:<id>/` (see
[Identifiers and Citation](./identifiers.md)). A `place:` identifier names a record, not a place:
two sources describing the same city have two records and two identifiers.

During beta the record page is a **preview** for beta testers, at `/atlas/place/<id>/`, marked
*beta preview*. At the v4 release the same page is served at the record's own address,
`/entity/place:<id>/`.

## How the page is laid out

On a wide screen the page has two columns.

The **left column** is for reading. Under the record's title and dataset come three sections, in
this order:

1. **Record**: what this one source says (its identifier, other names, types, dates, country codes,
   geometry, descriptions and depictions), then **Links, as contributed** and **Related places**.
2. **About this group**: a short description of the record and its attested equivalents (see
   [About this group](#about-this-group)).
3. **Concordance**: what has been stated about which other records describe the same place (see
   [The Concordance](#the-concordance)).

The **right column** holds:

- the **Concordance map**, a square map at the top, with a one-line summary and a key under it;
- an **Elsewhere** card: Wikipedia articles, where known, and the web addresses among the record's
  own links (*Cited by this record*);
- an **Environment** card (see [Environmental context](#environmental-context)).

On a narrow screen the columns are stacked: the title, then the map, then the left column, then the
rest of the right.

Longer lists are **folded**: *Links, as contributed*, *Related places* and the Concordance's
*Outbound*, *Inbound* and *Co-cited* lists start closed, with their totals in the heading. Click a
heading to open it. A list with nothing in it is not a fold: its heading shows (0) and a sentence
says why it is empty.

Relations such as *part of* are listed under *Related places*. They are not identity, so they are
not part of the Concordance.

## The Concordance

Each record page has a **Concordance** section. It lists what has been *stated* about which other
records describe the same place as this one. It is not a separate entity and has no identifier of
its own: it is a view of statements about the record.

The Concordance looks **one step** from the record and no further. If A is linked to B, and B to C,
A's Concordance shows B but not C. Nobody said that A is the same as C, and WHG does not infer it.
(Inferring it is how the old union records went wrong.)

It has three tiers, each a list on the page.

1. **Outbound: this record's own attestations.** Links the record's source made: for example, "this
   is the same as GeoNames 2988507". These are part of the record.
2. **Inbound: other records that say they are this place.** Other contributors' statements that
   *their* record is the same as this one. Each is shown with who made it. They are about this
   record, but not part of it.
3. **Co-cited: also linked to the same identifiers.** Records that cite an outside identifier this
   record also cites. This is listed separately, in different words, because it is not a statement
   of identity: nobody said these records are the same, only that each points at the same
   identifier. Each co-cited record is listed once, with the identifiers it shares with this
   record. Co-cited records are never put on the map.

### Link types

Each link is shown with its type:

- **exactMatch** (and **sameAs**, which WHG treats as the same thing): the same place;
- **closeMatch**: close enough to be treated as the same for most purposes;
- other types, such as **related** or **seeAlso**, are listed but do not count as identity.

Only **exactMatch** and **closeMatch** links in tiers 1 and 2 are combined: they are the record's
**attested equivalents**, the records drawn on the Concordance map. Tier 3 and the other link types
are listed only.

### Where each link came from

Each link also says where it came from, for example:

- **in the contributed data**: the link came with the source's own data;
- **reviewed by the dataset owner**: the owner confirmed the match while reconciling their data;
- **2024 migration; provenance unknown**: carried over when WHG moved to its current system, with no
  record of who made it or how. Most record-to-record links are of this kind.

Each outbound link also says what became of it. A link to a record WHG holds can be opened and,
if that record has a location, mapped. A link to an identifier WHG does not hold (a library
authority, for example) is listed, but cannot be mapped. If WHG's index could not be reached, the
page says so: that is not a finding that the record does not exist.

A record's own link to its own identifier (a Getty record citing its own Getty number, say) is not
a statement about anything else, so it is not shown as a link.

Some uploads contain a link whose identifier is a placeholder rather than a real one, such as
`wd:None`, `null` or an empty value. These are listed among the record's outbound links, flagged
**placeholder, not a real identifier**, and are never combined, mapped, described or sent anywhere.

### The Concordance map

The map shows this record (in red) and its attested equivalents that have a location (in blue).
The summary under it gives the counts, for example *4 attested equivalents (exactMatch or
closeMatch, from this record or about it), 4 on the map, plus this record*. If the record itself
has no location, the summary says so.

Records that share exactly the same point would hide each other, so such a point is ringed and
carries a number saying how many records are there. Clicking a point lists every record at it.

When there is nothing to map, no map is shown.

### Signed-out visitors

A signed-out visitor sees the same Concordance, with one difference: records held only in WHG's
search index are looked up for them only when their source is openly redistributable (its registry
entry is published, licensed and marked redistributable). Links to other sources are listed as
*not looked up for signed-out visitors*; signing in looks them up.

### When the Concordance is empty

For most records, nothing has been stated about other records. In that case the Concordance says
so, and points to the **Explore similar records** button at the top of the page. That button opens
an [Atlas](../../atlas.md) search for the record's name (only the name: the record's location is
not part of the search). In the Atlas you can group similar records yourself and open a group as a
[locus](./loci.md).

An empty Concordance does not mean the place has no other records in WHG. It means nobody has
*said* which ones they are.

Where the record is in WHG's search index, a smaller link under the button, *See this record's
cluster at … settings*, opens a [locus page](./loci.md) for the group of records like this one. It
uses either the index's current calibrated settings or WHG's fixed fallback settings, and says
which.

## About this group

The **About this group** section describes the record together with its attested equivalents (its
exactMatch and closeMatch links in tiers 1 and 2; never tier 3), using only what the records
themselves say. It is shown as a set of small cards, each about one thing:

- **Sources**: how many records, and from which sources;
- **Names**, **Type**, **Countries** and **Dates**: what the records say, with agreement and
  disagreement given as counts (such as "3 of 5 records") rather than resolved;
- **Not known from these records**: what none of the records says, for example that no record is
  dated or names a place that contains it.

A card appears only when there is something to say. Nothing is inferred. *How this was written*,
under the cards, lists the limits of the description. If some equivalents could not be looked up
just then, or the record has more attestations than the page reads, the section says the group is
incomplete or partial.

## Wikipedia links

The **Elsewhere** card lists Wikipedia articles when one of the record's attested equivalents is a
Wikidata record in WHG's index. The links are the Wikipedia articles (sitelinks) that WHG's copy of
that Wikidata record holds. They show what Wikidata links to; they are not a claim that WHG makes
about the place. WHG does not build links of its own from a Wikidata number, and does not look
anything up on Wikipedia. The first few languages are shown, English first, and the rest are behind
*more languages*. Where none are known, no Wikipedia links are shown.

## Environmental context

The **Environment** card describes the environment of where the group lies, from **EDOPS**
(Environmental Dimensions of Place Service), a research service of
[Computing Place](https://computingplace.org/) (Karl Grossner), credited on the page.

Nothing is sent to EDOPS when the page opens. Click **Show environment** and WHG asks EDOPS then,
and shows the answer in a dialog. Closing and reopening the dialog does not ask again.

- For a single location, it describes the river basin the location lies in (HydroATLAS/BasinATLAS
  **level 8**).
- For several mapped records, it describes the area they cover together (their outline, aggregated
  over BasinATLAS **level 6** basins).
- For records more than 1,000 km apart, it gives nothing: one signature would describe none of
  them, and a spread that wide often means a mistaken link.

Most values describe present-day conditions; each band says so. When the records are dated (between
0 and 1998 CE), past climate, volcanic events and land use for those years can be added; the dialog
says which years were used, or why none were. If EDOPS cannot be reached, the dialog says so: that
is not a finding that there is no data.

Only what anyone may see is ever sent to EDOPS. Records from private or embargoed sources are never
sent; a beta tester who can see such a record is told that it was left out of the signature.

During beta, *About this group* and the Environment card are shown to beta testers. **At release
they are public**, for signed-out visitors too. Public visitors are shown only records anyone may
see: a record from an embargoed source is never described or counted for them. To keep the load on
EDOPS fair, both are rate-limited per visitor; if you ask for many very quickly, the page may ask
you to try again in a minute.

## Machine-readable record

Asked for JSON-LD (`Accept: application/ld+json`) or JSON, a record's address
`/entity/place:<id>/` returns a small description of the record and its Concordance, not the full
record (the full Linked Places record stays at `/entity/place:<id>/api`, for signed-in users and API
tokens). Its `@context` is WHG's minimal JSON-LD context,
`https://whgazetteer.org/ns/whg-context.jsonld`, which reuses Dublin Core, schema.org, PROV and
Linked Places terms where they exist. It is **provisional**: its terms may change until PLATO
publishes them.

## Who can see a record page

A record page is shown only for records in published datasets. Records in private or embargoed
datasets are not shown to anyone outside the dataset's team, and asking for one gives the same
"not found" answer as asking for a record that does not exist.

During beta, record pages are shown to beta testers. At release they are public.
