# Record Pages and the Concordance

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): confirm the public URL of a record page. In beta the page is served at
% /atlas/place/<id>/ to beta testers; /entity/place:<id>/ is the identifier that leads to it.
% TODO(release): confirm the wording of the empty state and of the provenance labels on the live page.
% Updated 2026-10-21 (place#325 release rulings): the gloss ("About this group") and the EDOPS
% environmental signature are on the page (beta now; public at release, signed-out visitors too).

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

Its address is the record's identifier, `/entity/place:<id>/` (see
[Identifiers and Citation](./identifiers.md)). A `place:` identifier names a record, not a place:
two sources describing the same city have two records and two identifiers.

## The Concordance

Each record page has a **Concordance** section. It lists what has been *stated* about which other
records describe the same place as this one. It is not a separate entity and has no identifier of
its own: it is a view of statements about the record.

The Concordance looks **one step** from the record and no further. If A is linked to B, and B to C,
A's Concordance shows B but not C. Nobody said that A is the same as C, and WHG does not infer it.
(Inferring it is how the old union records went wrong.)

It has three tiers.

1. **This record's own links.** Links the record's source made: for example, "this is the same
   as GeoNames 2988507". These are part of the record.
2. **Links to this record from others.** Other contributors' statements that *their* record is
   the same as this one. Each is shown with who made it. They are about this record, but not part
   of it.
3. **Also linked to the same identifier by…** Records that cite the same outside identifier as this
   one does. This is listed separately, in different words, because it is not a statement of
   identity: nobody said these two records are the same, only that each points at the same
   identifier.

### Link types

Each link is shown with its type:

- **exactMatch** (and **sameAs**, which WHG treats as the same thing): the same place;
- **closeMatch**: close enough to be treated as the same for most purposes;
- other types, such as **related** or **seeAlso**, are listed but do not count as identity.

Only **exactMatch** and **closeMatch** links in tiers 1 and 2 are combined: they make up the set of
records drawn on the Concordance map. Tier 3 and the other link types are listed only.

### Where each link came from

Each link also says where it came from:

- **reviewed by the dataset owner**: the owner confirmed the match while reconciling their data;
- **2024 migration; provenance unknown**: carried over when WHG moved to its current system, with no
  record of who made it or how. Most record-to-record links are of this kind.

A link to a record WHG holds can be opened and mapped. A link to an identifier WHG does not hold (a
library authority, for example) is listed, but cannot be mapped.

A record's own link to its own identifier (a Getty record citing its own Getty number, say) is not
a statement about anything else, so it is not shown as a link.

Some uploads contain a link whose identifier is a placeholder rather than a real one, such as
`wd:None`, `null` or an empty value. These are listed among the record's own links, flagged
**placeholder, not a real identifier**, and are never combined, mapped, described or sent anywhere.

### Signed-out visitors

A signed-out visitor sees the same Concordance, with one difference: records held only in WHG's
search index are looked up for them only when their source is openly redistributable (its registry
entry is published, licensed and marked redistributable). Links to other sources are listed as
*not looked up for signed-out visitors*; signing in looks them up.

### When the Concordance is empty

For most records, nothing has been stated about other records. In that case the Concordance says
so, and offers **Explore similar records**: a search seeded from this record, where you can group
similar records yourself and, if you want a citable name for the group, mint a [locus](./loci.md).

An empty Concordance does not mean the place has no other records in WHG. It means nobody has
*said* which ones they are.

## About this group

The **About this group** section describes the record together with the records the Concordance
combines (its exactMatch and closeMatch links in tiers 1 and 2; never tier 3), using only what the
records themselves say: names, types, country codes, containing places and dates. Nothing is
inferred, and anything the records do not say is listed as *not known*. If some equivalents could
not be looked up just then, or the record has more attestations than the page reads, the section
says the group is incomplete or partial.

## Environmental context

The **Environmental signature** section shows the environment of where the group lies, from
**EDOPS** (Environmental Dimensions of Place Service), a service of
[Computing Place](https://computingplace.org/) (Karl Grossner), credited on the page:

- for a single location, the river basin it lies in (HydroATLAS/BasinATLAS **level 8**);
- for several mapped records, the area they cover together (their outline, aggregated over
  BasinATLAS **level 6** basins);
- for records more than 1,000 km apart, nothing: one signature would describe none of them, and a
  spread that wide often means a mistaken link.

Most values describe present-day conditions; each band says so. When the records are dated (between
0 and 1998 CE), past climate, volcanic events and land use for those years are added; the page says
which years were used, or why none were. If EDOPS cannot be reached, the page says so: that is not
a finding that there is no data.

Only what anyone may see is ever sent to EDOPS. Records from private or embargoed sources are never
sent; a beta tester who can see such a record is told that it was left out of the signature.

During beta both sections are shown to beta testers. **At release they are public**, for signed-out
visitors too. Public visitors are shown only records anyone may see: a record from an embargoed
source is never described or counted for them. To keep the load on EDOPS fair, the public sections
are rate-limited per visitor; if you open many record pages very quickly, a section may ask you to
try again in a minute.

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
