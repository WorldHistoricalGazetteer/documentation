# Record Pages and the Concordance

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): confirm the public URL of a record page. In beta the page is served at
% /atlas/place/<id>/ to beta testers; /entity/place:<id>/ is the identifier that leads to it.
% TODO(release): confirm the wording of the empty state and of the provenance labels on the live page.
% TODO(release): replace the EDOP paragraph once the environmental signature is shown on the page.

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

### When the Concordance is empty

For most records, nothing has been stated about other records. In that case the Concordance says
so, and offers **Explore similar records**: a search seeded from this record, where you can group
similar records yourself and, if you want a citable name for the group, mint a [locus](./loci.md).

An empty Concordance does not mean the place has no other records in WHG. It means nobody has
*said* which ones they are.

## Environmental context

% TODO(release): EDOP placeholder. Describe what is shown once the integration ships.

The record page will show an environmental signature for the record's location (the river basin it
lies in, its elevation and ecoregion and, for a date range, past climate and land use). It comes
from **EDOP**, the environmental service of
[Computing Place](https://computingplace.org/) (Karl Grossner), and will be credited to it on the
page. For a Concordance with several mapped records, the signature describes the area they cover
together, not just one point.

## Who can see a record page

A record page is shown only for records in published datasets. Records in private or embargoed
datasets are not shown to anyone outside the dataset's team, and asking for one gives the same
"not found" answer as asking for a record that does not exist.
