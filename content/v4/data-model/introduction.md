# Introduction

This page introduces the idea on which the WHG v4 data model rests: that what we know about a place
is a set of **attestations**, each a claim made by a particular source, rather than a record with
one value per field. The model is [PLATO](https://w3id.org/plato), the Place Attestation Ontology,
and the terms on this page are PLATO's, as of [PLATO
0.7.1](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.1)
([doi:10.5281/zenodo.23060220](https://doi.org/10.5281/zenodo.23060220); all versions: [doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313)). The [Overview](overview.md) lists the entities and their properties in full.

## Many names, many shapes, many dates, many sources

Take the city on the Bosphorus. Herodotus calls it Byzantion; Byzantine writers call it
Konstantinoupolis; sixteenth-century Ottoman tax registers call it İstanbul. Its extent in each
period differs, and so do the dates at which each source can speak for it. Sources disagree, some
are more reliable than others, and new evidence keeps arriving.

A record with a single `name`, a single `geometry` and a single pair of dates cannot hold this
without choosing one answer and discarding the rest, along with who said what and when. Adding
more fields (`name2`, `name_date_from`, `name_source`) only moves the problem. And the pieces are
shared in awkward ways: the same name belongs to many places ("Alexandria"), and one place has many
names.

## SpatialEntity: where attestations converge

In PLATO, the thing a gazetteer entry is about is a **SpatialEntity**: an entity whose identity is
bound up with space. It has a stable identifier, and very little else of its own. It is the point
on which attestations from different sources, periods and contributors converge.

- A SpatialEntity carries a display `label`, and may carry `ccodes` (the modern countries it lies
  in) and an `entityIdentifier` with its `namespace` (a project's or an authority's own record id).
  These are **finding aids**, not evidence, and need no source.
- Its names, locations, dates, types and relations to other entities are all **attested**: each
  comes from an Attestation, with its own source, date and certainty.
- What kind of thing it is (a settlement, a region, a route, a river) is also attested, by Type
  attestations. PLATO defines no Place class and gives "place" no prescribed meaning: many
  SpatialEntities are places in the everyday sense, and some are not.

A SpatialEntity need not have an attested geometry at all: lost, imagined and unlocated places are
admissible.

## The Attestation: a bundle of claims with its evidence

An **Attestation** says: *according to this source, this SpatialEntity had this name (or location,
type, relation…) during this time, with this degree of certainty.* It bundles together:

| The Attestation bundles | PLATO property | JSON key |
|---|---|---|
| The SpatialEntity it is about (exactly one) | `attests_about` | `about` (or implicit, when nested under the entity) |
| Names | `attests_name` | `names` |
| Geometries | `attests_geometry` | `geometries` |
| Timespans (when the claim applies) | `attests_timespan` | `timespans` |
| Types (what kind of entity) | `attests_type` | `types` |
| Other attributes: populations, valuations, market days | `attests_property` | `properties` |
| A relation to another entity (at most one) | `relates_to` + `has_relation_type` | `relations` |
| Identity relations with other SpatialEntities | `attests_identity` | `identities` |

and carries what is true of the claim as a whole:

| About the claim | PLATO property | JSON key |
|---|---|---|
| The source(s) it rests on | `sourced_by`, or `has_citation` for a Citation with a locator | `sources`, `citations` |
| Confidence, as a number or a word | `certainty`, `certainty_note`, `certainty_level` | `certainty`, `certaintyNote`, `certaintyLevel` |
| Whether the source denies rather than asserts it | `negated` | `negated` |
| How firmly the source itself asserts it | `source_stance` | `sourceStance` |
| Whether software worked it out rather than a source giving it | `computed` | `computed` |
| Who made it, and when | `contributed_by`, `created`, `modified` | `contributor`, `created`, `modified` |
| Position in a route, itinerary or network | `sequence` | `sequence` |

The Attestation itself holds only this metadata. Its content lies in what it links together, which
is why the picture is a star:

```{mermaid}
graph TD
    SE[SpatialEntity<br/>Constantinople]
    N[Name<br/>Βυζάντιον]
    TS[Timespan<br/>440–420 BC]
    TY[Type<br/>inhabited place, AAT]
    S[Source<br/>Herodotus, Histories IV.144]
    A[Attestation<br/>certainty 1.0]

    A -->|attests_about| SE
    A -->|attests_name| N
    A -->|attests_timespan| TS
    A -->|attests_type| TY
    A -->|sourced_by| S

    style A fill:#75ca55,stroke:#333,stroke-width:3px,rx:10,ry:10
    style SE fill:#e489b3,stroke:#333,stroke-width:2px,rx:10,ry:10
    style N fill:#eaeafd,stroke:#333,stroke-width:2px,rx:10,ry:10
    style TS fill:#eaeafd,stroke:#333,stroke-width:2px,rx:10,ry:10
    style TY fill:#eaeafd,stroke:#333,stroke-width:2px,rx:10,ry:10
    style S fill:#f6e16b,stroke:#333,stroke-width:2px,rx:10,ry:10
```

The Timespan dates the **claim**: when, according to the source, the name was in use. Herodotus
witnesses the name only in his own day, so here that is the date of the Histories; it is not the
whole span in which the name was used, which is a conclusion drawn from many attestations. Nor is
it when the attestation was recorded (`created`). Where the claim and the witness differ (an annal
for 921 in a manuscript of about 925), the Source carries its own date, `plato:source_timespan`.

## Why attestations rather than fields

- **Disagreement coexists.** Two sources giving two locations are two attestations. Neither
  overwrites the other, and each keeps its source and certainty.
- **Everything is dated by its evidence.** A name is not simply "the name"; it is a name used at a
  time, according to someone.
- **Provenance is never lost.** Every claim can be traced to a source and a contributor.
- **Uncertainty is explicit, and of two kinds.** *Certainty* is how sure we are of a claim, which
  better evidence could change. *Fuzziness* is vagueness in the thing itself: a frontier zone, "the
  Midlands". PLATO records them separately.
- **Corrections add rather than erase.** Once a gazetteer is published, its attestations are never
  changed or deleted. A correction is a new attestation that supersedes the old one, so any earlier
  state can be reproduced (see [Meta-attestations](#meta-attestations) below).
- **The pieces are reusable.** A Name, a Geometry or a Timespan is a node of its own, which several
  attestations may share.

## Two attestations in PLATO JSON

PLATO has two JSON forms. A **place-centric** document lists SpatialEntities with their attestations
nested under each; it is the successor to Linked Places Format for contributing a gazetteer. An
**attestation-centric** document lists attestations, each naming the SpatialEntity it is `about`;
it is for adding evidence about entities that already exist, including other gazetteers' entities.
See [Formats](../guide/formats.md) and PLATO's guide to its
[JSON](https://pelagios.org/place-attestation-ontology/guide/json.html).

The document below makes two attestations about one SpatialEntity, each with its own name, date and
source. They are the first two attestations of PLATO's Constantinople example
(`place-centric-constantinople.json`, lines 20–87), given here in attestation-centric form: each
names the SpatialEntity it is `about`, and has the `@id` it has in PLATO's `examples/constantinople.ttl`.
The values are PLATO's own.

```json
{
  "$schema": "https://w3id.org/plato/schemas/attestation-centric.schema.json",
  "profile": "attestation-centric",
  "gazetteer": {
    "@id": "https://whgazetteer.org/example/gazetteer/byzantine-cities",
    "title": "Byzantine Cities Gazetteer"
  },
  "attestations": [
    {
      "@id": "https://whgazetteer.org/example/attestation/byzantion-herodotus",
      "about": "https://whgazetteer.org/example/entity/constantinople",
      "names": [
        {
          "toponym": "Βυζάντιον",
          "language": "grc",
          "script": "Grek",
          "romanized": "Byzantion",
          "transliterationSystem": "ISO 843",
          "nameType": ["toponym"],
          "sourceLabel": "Βυζαντίῳ"
        }
      ],
      "timespans": [
        {
          "startEarliest": "-0440",
          "endLatest": "-0420",
          "startPrecision": "decade",
          "endPrecision": "decade"
        }
      ],
      "types": [
        { "identifier": "http://vocab.getty.edu/aat/300008347", "label": "inhabited place" }
      ],
      "sources": [
        {
          "title": "Herodotus, Histories IV.144",
          "citation": "Hdt. 4.144.2",
          "uri": "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0125:book=4:chapter=144"
        }
      ],
      "certainty": 1.0,
      "certaintyNote": "The source names the city: Megabazus was 'at Byzantion' (ἐν Βυζαντίῳ). It gives no location, so no geometry is attested.",
      "notes": "The timespan is when this source witnesses the name Byzantion in use. A source witnesses only its own time, so that is the source's date, not the whole span in which the name was used. The Histories are usually dated about 440 BC; nothing in them can be dated with certainty after 430 BC, and Herodotus is thought to have died about 425 BC. The bounds are set wide enough to cover both.",
      "created": "2026-02-15T10:00:00Z"
    },
    {
      "@id": "https://whgazetteer.org/example/attestation/constantinopolis-notitia",
      "about": "https://whgazetteer.org/example/entity/constantinople",
      "names": [
        {
          "toponym": "Constantinopolis",
          "language": "la",
          "script": "Latn",
          "nameType": ["toponym"],
          "sourceLabel": "urbis Constantinopolitanae"
        }
      ],
      "timespans": [
        {
          "startEarliest": "0425",
          "endLatest": "0450",
          "startPrecision": "decade",
          "endPrecision": "year"
        }
      ],
      "types": [
        { "identifier": "http://vocab.getty.edu/aat/300008347", "label": "inhabited place" }
      ],
      "sources": [
        {
          "title": "Notitia Urbis Constantinopolitanae",
          "citation": "Notitia Urbis Constantinopolitanae, praefatio, ed. O. Seeck, Notitia Dignitatum (1876), p. 229",
          "uri": "https://www.livius.org/sources/content/notitia-urbis-constantinopolitanae/"
        }
      ],
      "certainty": 1.0,
      "certaintyNote": "The preface names the city 'urbis Constantinopolitanae'. The source describes the city's fourteen regions but gives no coordinates, so no geometry is attested.",
      "notes": "The timespan is when this source witnesses the name Constantinopolis in use. A source witnesses only its own time, so that is the source's date, not the whole span in which the name was used. The Notitia was written under Theodosius II, who died in 450, and whom its preface praises; proposed dates run from about 425 to 447-450.",
      "created": "2026-02-15T10:00:00Z"
    }
  ]
}
```

Points to notice:

- Neither attestation carries a geometry: these sources name the city but do not locate it. A
  location comes from another attestation, with its own source.
- The Type names the AAT concept in `identifier`. The Type node stands for this dataset's use of
  that concept, so it never takes the concept's IRI as its own `@id`.
- Each timespan is when its source witnesses the name in use (the `notes` say how it was set).
  These sources witness only their own time, so it is the source's date, not the whole span in
  which the name was used. "The Byzantine period, 330–1453" would be a further attestation, sourced
  from the scholarly work that says so.
- A third source that disagrees, or a fourth name, is simply another attestation. Nothing is
  overwritten.

The same model in RDF is shown in [RDF Representation](rdf-representation.md).

## Relations between entities

An attestation may also relate its SpatialEntity to another entity: containment (a parish in a
hundred), membership of a route or network, a connection, or a place's part in the life of a
person or the course of an event. The target is given by `relates_to` and the kind of relation by
`has_relation_type`, pointing at a **RelationType**. Because the relation is an attestation, it has
a source, a date and a certainty like any other claim. An attestation carries at most one relation.

PLATO declares the relation types every gazetteer needs:

| Purpose | PLATO relation types |
|---|---|
| Containment | `plato:ContainedIn` (`contained_in` / `contains`) |
| Routes, itineraries and networks | `plato:MemberOf` (with `sequence`), `plato:ConnectedTo`, `plato:LeadsTo`, and for segments `plato:BeginsAt`, `plato:EndsAt`, `plato:HasEnd` |
| Places in the histories of people, objects and events | `plato:BirthplaceOf`, `plato:DeathplaceOf`, `plato:ResidenceOf`, `plato:FindspotOf`, `plato:SettingOf`, `plato:WorkplaceOf` |
| Images and records about a place | `plato:DepictedIn`, `plato:SubjectOf` |

For an association with a person, object or event, the target is that entity's own IRI (a Wikidata
item, say), with a `relatedLabel` to name it. A project may declare its own relation types in a
JSON document's `relationTypes`, each narrowing one of PLATO's with `broaderRelation`. Routes,
itineraries and networks are described in
[Routes, Itineraries, Networks, Groups and Periods](patterns.md).

## Identity between entities

That two SpatialEntities, perhaps in different gazetteers, are the same place is also a claim. PLATO
records it as an **IdentityRelation** (`exactMatch`, `closeMatch`, `related` or `unspecified`),
bundled in an attestation with `attests_identity` (JSON `identities`) so that it has a source,
a contributor and a date. It is one attributed claim among many, never a canonical fact: WHG does
not merge records or mint new identifiers because of it, and someone else may say the opposite (an
attestation with `negated: true` around one `exactMatch`). Accepting a set of matches is one
attestation bundling the `exactMatch` relations made, and exactMatch relations may be chained only
within one such attestation.

Match suggestions made by software, such as those offered for review when reconciling data in
Map your Data, are **Candidates** (`plato:Candidate`): not claims at all until a person confirms
them.

## Authorities: what attestations rest on

The reference entities that ground and qualify attestations are **Authorities**. `plato:Authority`
is the disjoint union of five kinds:

| Authority | What it is |
|---|---|
| **Source** (`plato:Source`) | A citable document: a manuscript, chronicle, register, map or article. May be part of a Dataset (`plato:partOf`), dated as a document (`plato:source_timespan`), and derived from another source (`plato:derived_from`). |
| **Dataset** (`plato:Dataset`) | A collection-level authority: a published gazetteer or an external corpus such as GeoNames, Wikidata or Pleiades. |
| **Period** (`plato:Period`) | A named historical period, optionally aligned with PeriodO, with its own timespan and the region it applies to. |
| **RelationType** (`plato:RelationType`) | A kind of entity-to-entity relation, with a label, an inverse label and, for a project's own, a `broader_relation`. |
| **CertaintyLevel** (`plato:CertaintyLevel`) | Certainty as a word: `plato:Certain`, `plato:LessCertain`, `plato:Uncertain` (those of Linked Places Format), or a project's own. |

A period is therefore not a SpatialEntity: places are dated by Timespans, which may refer to a
Period. Where an attestation needs to say where in a source its evidence lies (a page, a folio, a
table cell), it cites the source through a **Citation** with a `locator`.

## Gazetteers and gazetteer groups

A **Gazetteer** (`plato:Gazetteer`, a `dcat:Dataset`) is the container for contributed data: a
versioned workspace of SpatialEntities and attestations, owned by a contributor or team, with a
title, creators, a licence and a version.

- A Gazetteer **defines** its own SpatialEntities (`plato:contains_entity`), and may also hold
  attestations **about other gazetteers' entities**, identified by their IRIs, without redefining
  them: a correction, a link, a curator's selection. Such an attestation adds evidence; it does not
  change who defined the entity.
- Once its status is `published`, its attestations are append-only.
- A WHG **place collection** is a curatorial act, and so a Gazetteer, not a SpatialEntity: its
  annotations are attestations by its curator about other gazetteers' places, shown on those
  places' pages only if the curator declares them public.

A **gazetteer group** (`plato:GazetteerGroup`) groups Gazetteers, not places; a Gazetteer joins
one with `plato:member_of_group`. See [Gazetteer groups](patterns.md#gazetteer-groups).

## Meta-attestations

Because an attestation has an identity of its own, another attestation can be **about** it. A
meta-attestation points at its target with `meta_attestation_about` and says how it relates with
`has_meta_type` (in JSON, `meta` with `targetAttestation` and `metaType`). PLATO's starter meta types
are `plato:Contradicts`, `plato:Supports`, `plato:Supersedes`, `plato:Refines`, `plato:Challenges`,
`plato:Bundles`, `plato:DerivedFrom`, `plato:Annotates`, `plato:AlternativeTo` and `plato:Retracts`.

This is how scholarly discussion and correction are recorded without losing anything: a new reading
supersedes an old one, a later study contradicts an earlier claim, and a contributor withdraws their
own claim with `plato:Retracts`. The state of a published gazetteer at any date is the attestations
created by then, less those superseded or retracted by then.

## Where next

- [Overview](overview.md): each entity and its properties.
- [Attestations & Relations](attestations.md): attestations in detail, with worked examples.
- [Routes, Itineraries, Networks, Groups and Periods](patterns.md): things made of other places.
- [RDF Representation](rdf-representation.md): the model as Linked Data.
- WHG holds this model in PostgreSQL/PostGIS, with Elasticsearch for search. These pages describe
  the model, not a storage layout.
