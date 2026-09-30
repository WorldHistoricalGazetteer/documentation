# Summary

% TODO(0.7.0-doi): add the 0.7.0 version DOI
This page summarises the WHG v4 data model on one page, and says where each part is described in
full. The model is [PLATO](https://w3id.org/plato), the Place Attestation Ontology, at [PLATO
0.7.0](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.0)
([doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313), the DOI for PLATO, all
versions); the terms below are PLATO's unless they are marked as WHG's own practice.

---

## The idea in one paragraph

What is known about a place is not a record with one value per field but a set of **attestations**:
claims, each made by a particular source, with its own dates and certainty, and recorded by a
particular contributor. Sources that disagree sit side by side; nothing is overwritten, and every
claim can be traced to its evidence. See the [Introduction](introduction.md).

## Key entities

| Entity | In brief | Read more |
|---|---|---|
| **SpatialEntity** | A stable identity on which attestations converge. It carries a display `label` and finding aids (`ccodes`, `entityIdentifier`), and nothing else of its own. PLATO has no Place class: what kind of thing an entity is, is attested. | [Overview](overview.md#spatialentity) |
| **Attestation** | A bundle of claims about exactly one SpatialEntity (`attests_about`), with its sources, certainty, contributor and dates. | [Attestations and Relations](attestations.md) |
| **Name**, **Geometry**, **Timespan**, **Type**, **PropertyValue** | The facets an attestation bundles (`attests_name`, `attests_geometry`, `attests_timespan`, `attests_type`, `attests_property`). Each is a node of its own and may be qualified on its own. | [Overview](overview.md#name) |
| **Authority** | What attestations rest on: a Source, Dataset, Period, RelationType or CertaintyLevel. A **Citation** is one attestation's use of one source, with a `locator`. | [Overview](overview.md#authorities) |
| **IdentityRelation** | A claim that two SpatialEntities are the same (`exactMatch`), nearly so (`closeMatch`), `related`, or of `unspecified` kind. | [Identity](#identity) below |
| **Candidate** | A match suggested by software, awaiting review. Not a claim. | [Candidates, clusters and loci](attestations.md#candidates-clusters-and-loci) |
| **Gazetteer**, **GazetteerGroup** | The workspace that holds contributed data, and a group of such workspaces. | [Gazetteers, collections, groups and periods](#gazetteers-collections-groups-and-periods) below |
| **Contributor** | The person, team or process that makes attestations. WHG requires an ORCID for new contributions; earlier data keeps its existing attribution. | [Overview](overview.md#contributors) |

The [entity–relationship diagram](overview.md#core-entities) shows how they link.

## Attestation

An attestation says: *according to this source, this SpatialEntity had this name (or location, date
range, type, relation or other attribute) during this time, with this degree of certainty.* Besides
what it bundles, it carries what is true of the claim as a whole:

- its **sources** (`sources`), or **citations** with a locator (`citations`);
- **certainty**, as a number (`certainty`) or a word (`certaintyLevel`), with a `certaintyNote`;
- whether the source **denies** what is bundled (`negated`), and how firmly it asserts it
  (`sourceStance`);
- whether software **computed** it rather than a source giving it (`computed`);
- who made it and when (`contributor`, `created`, `modified`), and, for a member of a route,
  itinerary or network, its position (`sequence`).

**Certainty is not fuzziness.** Certainty is how sure we are of a claim, which better evidence can
change; fuzziness is vagueness in the thing itself, such as a frontier zone. PLATO records them
separately, in a facet's `qualification`. Precision uses the schema's own values: `startPrecision`
and `endPrecision` (`day`, `month`, `year`, `decade`, `century`, `era`, `geological_period`) on a
Timespan, and `spatialPrecision` (`exact`, `approximate`, `uncertain`, `historical_approximate`) on a
Geometry. See [Qualifications](attestations.md#qualifications-certainty-fuzziness-and-precision) and
[Denial and the source's stance](attestations.md#denial-and-the-sources-stance).

Geometries from different sources, or for different dates, are separate geometry attestations;
several geometries that one source gives together may share an attestation, each with a `role`.
PLATO does not accept a GeoJSON `GeometryCollection`.

## Relations

An attestation may relate its SpatialEntity to one other entity: `relates_to` gives the target and
`has_relation_type` the kind, a RelationType. The relation therefore has a source, dates and a
certainty like any other claim. PLATO's relation types are:

| Purpose | Relation types |
|---|---|
| Containment | `ContainedIn` (`contained_in` / `contains`) |
| Routes, itineraries and networks | `MemberOf` (with `sequence`), `ConnectedTo`, `LeadsTo`; for segments `BeginsAt`, `EndsAt`, `HasEnd` |
| Places in the histories of people, objects and events | `BirthplaceOf`, `DeathplaceOf`, `ResidenceOf`, `WorkplaceOf`, `FindspotOf`, `SettingOf` |
| Images and records about a place | `DepictedIn`, `SubjectOf` |

**Containment is not membership.** A parish in a hundred is `ContainedIn` it, for the attested
timespan and according to the attested source, and a place may be attested in different containers
at different times. `MemberOf` is membership of a route, itinerary or network: a town on a road is
not within the road. Direction is carried by the relation type alone (`LeadsTo` is directed,
`ConnectedTo` is not). For people, objects, events, images and records, the target is that thing's
own IRI, named with a `relatedLabel`. A project may declare its own relation types in a PLATO JSON
document's `relationTypes`, each narrowing one of PLATO's with `broaderRelation`; PLATO's spreadsheet
tables take only PLATO's own. See [Relation types](attestations.md#relation-types) and
[Routes, Itineraries, Networks, Groups and Periods](patterns.md).

## Identity

That two SpatialEntities are the same place is also a claim. An **IdentityRelation** is bundled in
an attestation (`attests_identity`, JSON `identities`), so it has a source, a contributor and a date.

- It is **one attributed claim among many, never a canonical fact.** WHG does not merge records or
  mint new identifiers because of it.
- `exactMatch` may be chained **only within one attestation**, and the other identity types are
  never chained. That A is B (said by one person) and B is C (said by another) does not mean anyone
  said A is C.
- "These are **not** the same" is an attestation with `negated: true` around one `exactMatch`.
- A **Candidate** (`plato:Candidate`) is a suggestion made by software, such as the matches Map your
  Data offers for review. It is not a claim until a person confirms it.
- A **cluster** is not in PLATO: in WHG it is the result of a query in the Atlas, and a **locus** is
  its citable form (WHG place#172). Accepting a cluster of *n* records is one attestation bundling
  the *n*−1 `exactMatch` relations actually made.

See [Identity](attestations.md#identity).

## Meta-attestations

Because an attestation has an identity of its own, another attestation can comment on it
(`meta_attestation_about`, with its kind given by `has_meta_type`; JSON `meta`). PLATO's meta types
are `Contradicts`, `Supports`, `Supersedes`, `Refines`, `Challenges`, `Bundles`, `DerivedFrom`,
`Annotates`, `AlternativeTo` and `Retracts`.

Once a Gazetteer is published its attestations are **append-only**: a correction is a new
attestation that supersedes the old, and a withdrawal is a `Retracts` meta-attestation. The state at
any date is the attestations created by then, less those superseded or retracted by then, so any
earlier state can be reproduced and cited. See
[Meta-attestations](attestations.md#meta-attestations).

## Gazetteers, collections, groups and periods

- A **Gazetteer** (`plato:Gazetteer`, a `dcat:Dataset`) is a versioned workspace, owned by a
  contributor or team, with a title, creators, a licence, a version and a status (`draft` or
  `published`). It **defines** its own SpatialEntities, and may also hold attestations **about other
  Gazetteers' entities** without redefining them. Every contribution becomes a Gazetteer. See
  [Contributions](contributions.md) and
  [Attestations about other Gazetteers' places](attestations.md#attestations-about-other-gazetteers-places).
- A WHG **place collection** is a curatorial act, and so a Gazetteer, not a SpatialEntity. Its
  annotations are attestations by its curator about other Gazetteers' places, shown on those places'
  pages only if the collection declares them public. Teaching and class groups are features of the
  WHG application, not of PLATO. See [Place collections](attestations.md#place-collections).
- A **gazetteer group** (`plato:GazetteerGroup`) groups Gazetteers, not places; a Gazetteer joins
  one with `plato:member_of_group`. See [Gazetteer groups](patterns.md#gazetteer-groups).
- A **period** is an Authority (`plato:Period`), optionally aligned with PeriodO, not a
  SpatialEntity. Places are dated by Timespans, which may refer to a period. See
  [Periods](patterns.md#periods).
- A **route**, **itinerary**, **network** or **segment** is a SpatialEntity with a Type attestation
  naming one of PLATO's kinds, concepts in `plato:EntityKindScheme`: `plato:TypeRoute`,
  `plato:TypeItinerary`, `plato:TypeNetwork` and `plato:TypeSegment`. See
  [Routes, Itineraries, Networks, Groups and Periods](patterns.md).

## Computed values

A value that software works out from other statements in the same data, and that any consumer
holding them could work out again (an itinerary's span from its stops' dates, a route's line from
its stations), is marked `computed: true`. It is not evidence: WHG marks it as computed when it shows
or exports it, and never takes in anything marked `computed` as an attestation. A figure that a
project works out from its own source material and publishes as a finding is attested, not
computed. See [Computed values](attestations.md#computed-values) and
[Computed extents](patterns.md#computed-extents).

## Vocabularies

Controlled values come in three kinds: **schema enumerations**, written as plain strings and closed
(temporal and spatial precision, identity type, citation function, authority type, gazetteer
status); **concept schemes**, written as full IRIs and open to a project's own concepts (meta types,
source stance, geometry role, form status, kinds of spatial entity); and **open
string lists** (name types, with the starter values `toponym`, `chrononym`, `ethnonym`, `demonym`,
`odonym` and `hydronym`). A Type names its concept by full IRI in `identifier`. A Type node stands
for one dataset's use of a concept, so its own `@id`, if it has one, is never the concept's IRI; it
may also give the vocabulary (`scheme`) and its version (`schemeVersion`). See
[Vocabularies](vocabularies.md).

## Formats and RDF

- **Contributions:** Map your Data, Linked Places Format (PLATO's single-object profile, so LPF data is
  valid PLATO), PLATO JSON (place-centric or attestation-centric) and PLATO spreadsheet tables. RDF
  is not accepted for upload directly at v4.0: convert it to PLATO JSON first. See
  [Contributions](contributions.md) and [Data formats in and out](../guide/formats.md).
- **RDF:** PLATO is defined in RDF, and PLATO JSON becomes RDF through PLATO's JSON-LD context. Each
  WHG place record has a persistent identifier that resolves through w3id.org, and that identifier
  is the place's IRI. Today it answers software with JSON-LD in Linked Places Format, and Turtle is
  not served; at the v4 launch it will answer with PLATO JSON-LD or Turtle, with LPF still offered
  for existing clients. See
  [RDF Representation](rdf-representation.md) and [Identifiers and citation](../guide/identifiers.md).

## Storage

WHG holds the model in PostgreSQL/PostGIS, with Elasticsearch for search. These pages describe the
model, not a storage layout.

## What it is for

Finding a place as it was named at the time, dating by period, weighing sources that disagree,
tracing what lay within what, reconciling a list of names, seeing one place across many gazetteers,
modelling routes, journeys and networks, and citing a place in a gazetteer that changes: each is set
out, with the part of the model it uses, in [Use Cases](usecases.md).
