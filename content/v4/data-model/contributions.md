# Contributions: What Arrives and What It Becomes

% TODO(0.7.0-doi): add the 0.7.0 version DOI
This page describes how data comes into WHG v4 and what it becomes in the data model. The model is
[PLATO](https://w3id.org/plato), the Place Attestation Ontology, at [PLATO
0.7.0](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.0)
([doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313), the DOI for PLATO, all
versions). For which format to choose, see [Data formats in and out](../guide/formats.md); for a
step-by-step route entered in spreadsheets, see [Routes, itineraries and
networks](../guide/routes-and-networks.md).

In short:

- **A contribution is a Gazetteer**: the contributor's own workspace, which defines its own places
  and holds the evidence for them.
- **Every statement in it is an attestation**: a name, location, date, type or relation, each with
  its source.
- **Links to places WHG already holds are identity attestations**, never merges.
- **A published Gazetteer is append-only**: corrections and withdrawals are new attestations, so
  that every earlier state can be reproduced and cited.

---

## Formats WHG accepts

These are the formats listed in [Data formats in and out](../guide/formats.md).

% TODO(release): keep this list in step with guide/formats.md, which is the authority for what is
% accepted; confirm there which PLATO import paths have shipped.

| Format | What it is | Suits |
|---|---|---|
| **Map your Data** | CSV and TSV, Excel, JSON, GeoJSON and Google Sheets, and place names picked out of free text. The tool matches the rows to WHG in your browser and contributes the result. See [Map your Data](../../v3-3/map-your-data.md). | A list or table of place names |
| **Linked Places Format (LPF)** | The GeoJSON-LD interchange format for historical places, developed with the Pelagios community. It is PLATO's single-object profile, so LPF data is valid PLATO. | A gazetteer with one description per place |
| **PLATO** | PLATO's JSON (place-centric or attestation-centric) or its spreadsheet tables, both accepted for upload at v4.0. | Several sources' claims per place, each kept apart with its own dates, certainty and citation |

PLATO also has an RDF form, and PLATO's JSON-LD context turns one into the other. WHG v4.0 does not
accept RDF (Turtle, say) for upload directly: convert it to PLATO JSON with the
[PLATO tools](https://pelagios.org/plato-tools/) first, and contribute that.

---

## What a contribution becomes

### A Gazetteer

Every contribution becomes a **Gazetteer** (`plato:Gazetteer`, a `dcat:Dataset`). In WHG v4 this
one concept replaces v3's datasets and place collections; v3's dataset collections become
[gazetteer groups](#gazetteer-groups). The Gazetteer is titled, licensed and described in the vocabularies that data catalogues already read: its title, its
licence, the people to cite (`creator`), and a version. Its status is either `draft` or `published`.
A Gazetteer cannot be published until it states its licence.

A Gazetteer **defines its own SpatialEntities** (`plato:contains_entity`). A place in a contributed
table or file becomes a SpatialEntity of that Gazetteer, with its own identifier. Anything the source
says about the place (a name, a location, a date, a type, a relation to another place, a figure)
becomes an **attestation** about it, citing where it comes from. How attestations work is described in
[Attestations and Relations](attestations.md).

A Gazetteer **may also hold attestations about places other Gazetteers define**, referring to them by
their identifiers. Examples are a correction to another project's place, a link from a record to an
existing place, and a curator's choice of places for a collection. Such an attestation adds
evidence. It does not change the place's identity or make the new Gazetteer its owner. In PLATO JSON
these attestations go in an attestation-centric document, whose `about` gives the place's identifier.

Every place record in WHG has a persistent identifier, which resolves through w3id.org (see
[Identifiers and citation](../guide/identifiers.md)).

### What a contribution does not become

- **A merged record.** A contributed place is never folded into a place WHG already holds, and no
  new "master" identifier is minted from the two. How the two are linked is described under
  [Linking to places WHG already holds](#linking-to-places-whg-already-holds).
- **A place in its own right.** The Gazetteer is a dataset, not a SpatialEntity. Its places are not
  `MemberOf` it: membership is for routes, itineraries and networks.

---

## From each format

### Map your Data

Map your Data works on your table in your browser. When the table is ready, the tool contributes it
to WHG (today it does so by building and checking a Linked Places file). Each row becomes a
SpatialEntity of your Gazetteer, and each filled-in value becomes an attestation about it.

- **Containment columns.** If you tell the tool how columns nest (a county contains a parish, a
  parish contains a place), each row's place is `contained_in` the place named in the column above
  it (`plato:ContainedIn`).
- **Accepted matches** arrive in v4 as bundled identity attestations (`attests_identity`, JSON
  `identities`), not as LPF links. Each is attributed to the user who accepted it, and each identity
  relation records the Candidate it was confirmed from (`promoted_from`, JSON `promotedFrom`). See
  [Linking to places WHG already holds](#linking-to-places-whg-already-holds).
- **A location taken from a match** becomes a geometry attestation that cites the matched record
  (see [Geometry is always attributed](#geometry-is-always-attributed)).

### Linked Places Format

LPF describes each place as one object. Each part of that object becomes an attestation of its own:

| LPF | PLATO |
|---|---|
| The Feature's `@id` | The SpatialEntity's identifier |
| `properties.title` | The SpatialEntity's label |
| `properties.ccodes` | Its `ccodes`: modern country codes, a finding aid for search, not evidence |
| `properties.fclasses` | A Type attestation for each GeoNames feature class |
| Each of `names[]` | A name attestation, with that name's `when` and `citations` |
| `geometry` (each member of a `GeometryCollection`) | A geometry attestation for each, with its own `when`, `citations` and `certainty` |
| Each of `types[]` | A Type attestation. The identifier is the concept's full IRI, and the source's own wording is its `sourceLabel` |
| The Feature's `when` | A timespan attestation. A PeriodO period becomes the timespan's `periodoUri` |
| A relation of type `gvp:broaderPartitive` | A `ContainedIn` relation attestation. PLATO records Getty's `broaderPartitive` as the same relation, so the two align |
| Any other of `relations[]` | A relation attestation with that relation type |
| `links[]` of type `exactMatch` or `closeMatch` | Identity relations of that strength, bundled in an attestation. They are **not** a relation type |
| LPF's certainty words (`certain`, `less-certain`, `uncertain`) | PLATO's certainty levels `Certain`, `LessCertain` and `Uncertain` |

Some things cannot be said in LPF, so they cannot arrive by it:

- **Order.** LPF has no way to give a member's position on a route, so a route contributed as LPF
  arrives without its sequence. Enter routes and itineraries as PLATO instead (see
  [Routes, itineraries and networks](#routes-itineraries-and-networks)).
- **Denials.** LPF cannot say that a source denies something (PLATO's `negated`).
- **Comments on other evidence.** LPF has no meta-attestations, such as one source contradicting
  another.

The next version of LPF is coordinated by ISHI and the Pelagios Place Working Group. Working notes
towards it are recorded in
[LPF discussion #53](https://github.com/LinkedPasts/linked-places-format/discussions/53).

% TODO(release): check this table against the LPF importer as shipped. PLATO tools (0.7.0, 8a518ed) still
% writes an LPF file's `links[]` as standalone identityRelations, not bundled in an
% attestation; WHG's LPF import should bundle them as the table says.

### PLATO JSON and spreadsheet tables

PLATO data needs no mapping: it arrives in the model's own terms.

- **Place-centric JSON** describes your own places, with each place carrying its attestations.
- **Attestation-centric JSON** adds evidence about places that already exist elsewhere, referring
  to them by identifier.
- **Spreadsheet tables** (PLATO's template, with one sheet each for places, names, locations, types,
  relations, properties, connections, identities and sources) hold the same statements in rows.
  They are the easiest way to enter a route, itinerary or network.

Check PLATO data before contributing it. The [PLATO tools](https://pelagios.org/plato-tools/) check
JSON and tables in the browser or from the command line. A project's own relation types ("flows
into") can be declared only in JSON (see
[Project relation types](patterns.md#project-relation-types-platobroader_relation)). A value marked
`computed` is never taken in as evidence: WHG works it out again (see
[Computed values](patterns.md#computed-values-platocomputed)).

---

## Routes, itineraries and networks

A route, an itinerary or a network is contributed like any other place: it is a SpatialEntity of the
Gazetteer, with a Type attestation that says what kind it is (`TypeRoute`, `TypeItinerary` or
`TypeNetwork`). Each station, stop or member has a `MemberOf` attestation that relates it to the
whole, with a `sequence` where the source gives an order. An itinerary's stops carry their dates on
those same attestations. Connections between places are `ConnectedTo` (either way) or `LeadsTo`
(one way). A leg or reach with an existence of its own is a segment, joined to its ends with
`BeginsAt` and `EndsAt`.

The model is set out in full, with PLATO's four worked examples, in
[Routes, Itineraries, Networks, Groups and Periods](patterns.md): the
[Antonine Itinerary](patterns.md#route) (a route), [King John in 1215](patterns.md#itinerary) (an
itinerary), and the lower River Idle and the Datini letters (physical and relational
[networks](patterns.md#network)). How to enter one in spreadsheets is in
[Routes, itineraries and networks](../guide/routes-and-networks.md).

---

## Linking to places WHG already holds

Reconciliation finds places in WHG that may be the same as a contributed place. It has two steps,
and PLATO keeps them apart.

**1. Suggestions are Candidates.** Software suggests matches, as Map your Data does when it ranks
records by name, sound, location, type and country (see
[Sounds-alike search](../guide/sounds-alike.md)). Each suggestion is a **Candidate**
(`plato:Candidate`) for a person to review. It has a similarity score, the algorithm's version,
optionally the settings that produced the score (`match_parameters`), and a review status:
`suggested`, `confirmed` or `rejected`. A Candidate is not an attestation and not evidence.

**2. An accepted match is an identity attestation.** When a person confirms a Candidate, it becomes
an **IdentityRelation** (`plato:IdentityRelation`), which may record the Candidate it came from
(`promoted_from`). Its strength is one of `exactMatch`, `closeMatch`, `related` or `unspecified`
(where the source links the two but does not say how strongly). Identity relations accepted in one
act are bundled in **one attestation** (`attests_identity`, JSON `identities`). That attestation
carries their shared source, contributor and date, and it can be withdrawn as a unit.

Self-written example (valid against PLATO's attestation-centric schema): a contributor accepts
Pleiades' Durobrivae as the same place as their own.

```json
{
  "$schema": "https://w3id.org/plato/schemas/attestation-centric.schema.json",
  "profile": "attestation-centric",
  "gazetteer": {
    "@id": "https://example.org/kent-ports/",
    "title": "Kent ports in the Antonine Itinerary"
  },
  "attestations": [
    {
      "about": "https://example.org/kent-ports/place/durobrivae",
      "identities": [
        {
          "subject": "https://example.org/kent-ports/place/durobrivae",
          "object": "https://pleiades.stoa.org/places/79433",
          "identityType": "exactMatch",
          "basis": "Accepted in Map your Data: name, location and type agree",
          "promotedFrom": "https://example.org/kent-ports/candidate/durobrivae-pleiades-79433"
        }
      ],
      "citations": [
        {
          "source": {
            "@id": "https://example.org/kent-ports/source/reconciliation-review",
            "title": "Reconciliation review, September 2026",
            "authorityType": "source"
          }
        }
      ],
      "contributor": "https://orcid.org/0000-0002-1234-5678",
      "created": "2026-09-30T10:00:00Z"
    }
  ]
}
```

What an identity attestation is not:

- **It is not a merge.** Both places keep their own records, identifiers and evidence. PLATO forbids
  a platform to turn identity relations into merged records or new identifiers.
- **It is not canonical.** It is one attributed claim among many, weighed like any other evidence.
  Someone else may say the opposite: an attestation with `negated: true` that bundles one
  `exactMatch` says that two places are **not** the same.
- **It does not chain across claims.** If one person says A is B and another says B is C, nobody has
  said that A is C. A consumer may follow `exactMatch` links only within one attestation, and never
  follows `closeMatch`, `related` or `unspecified` links onwards.

How WHG groups records that seem to describe the same place, and why those groups are not stored,
is described in [Atlas](../../atlas.md) and under [Use cases](usecases.md).

---

## Geometry is always attributed

A place need not have a location: lost, imagined and unlocated places are all admissible. A place
has only the geometries that attestations give it, and each of those cites its source.

- **Linking a place to a match does not give it the match's geometry.** An identity attestation says
  nothing about location, and nothing is inherited through it.
- **A location taken from a match is an attestation that cites the match.** Map your Data can copy a
  matched record's location into your data. The result is a geometry attestation whose source is
  that record, so the location keeps its origin and its licence terms. In PLATO's Antonine example,
  Londinium's location comes from Pleiades in exactly this way, citing Pleiades and its licence:

```jsonrelaxed
{
  "timespans": [
    {
      "sourceLabel": "undated"
    }
  ],
  "citations": [
    {
      "source": {
        "@id": "https://whgazetteer.org/example/antonine/source/pleiades",
        "title": "Pleiades",
        // …
        "licence": "https://creativecommons.org/licenses/by/3.0/"
      },
      "locator": "places/79574",
      "citationFunction": "http://purl.org/spar/cito/citesAsDataSource"
    }
  ],
  "geometries": [
    {
      "reprPoint": [
        -0.088949,
        51.513335
      ],
      "geojson": {
        "type": "Point",
        "coordinates": [
          -0.088949,
          51.513335
        ]
      },
      "role": "https://w3id.org/plato#RepresentativePoint"
    }
  ]
}
```

From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html)
(`schemas/examples/place-centric-antonine.json`).

- **A drawn location** is an attestation that cites the contributor's own work. Its precision can
  be stated with `spatialPrecision` (`exact`, `approximate`, `uncertain` or
  `historical_approximate`) and an estimate in kilometres (`precisionKm`).
- **A route's line or a network's hull that WHG works out** from its members is marked `computed`.
  It is not an attestation (see [Computed extents](patterns.md#computed-extents)).

---

## Gazetteer groups

A **gazetteer group** (`plato:GazetteerGroup`) groups **Gazetteers**, not places: an example is
"EMEW — Gazetteer of Early Modern England and Wales". A Gazetteer joins a group with
`plato:member_of_group`. The group is not a SpatialEntity and has no attestations of its own. What
it seems to cover in space or time is worked out from its Gazetteers. See
[Gazetteer groups](patterns.md#gazetteer-groups).

% TODO(v4): say what a gazetteer group's own metadata is in WHG (title, description, curators), once decided; PLATO declares only the class and member_of_group.

---

## Place collections

A WHG **place collection** is a curatorial act: someone selects places from other Gazetteers and
says something about them. It is therefore a **Gazetteer**, not a SpatialEntity.

- The places stay in their own Gazetteers. The collection holds **attestations about them**,
  referring to them by identifier, each attributed to the curator.
- **Selecting a place is attesting about it.** A place is in the collection when the collection's
  Gazetteer contains an attestation about that place. The attestation may carry the curator's
  annotation, or it may be the selection alone, with nothing more to say.
- A collection's annotations appear alongside a place's other evidence only if the collection is
  declared public.
- A collection may also define places of its own, like any other Gazetteer.

Teaching and class groups are features of the WHG application, not part of PLATO.

---

## Changing a contribution

### Draft and published

While a Gazetteer is a **draft**, its owner may edit its attestations freely, and an edit is
recorded as that attestation's `modified` time.

Once it is **published**, its attestations are **append-only**, and PLATO makes this normative: an
attestation is never deleted or changed.

- **A correction** is a new attestation, with a meta-attestation that `Supersedes` or `Contradicts`
  the old one.
- **A withdrawal** is a meta-attestation of type `Retracts`. The retracted attestation no longer
  holds, but it is kept so that earlier states can be reproduced. Retracting a retraction restores
  its target.
- **Every attestation carries its `created` time**, so the Gazetteer's state on any date can be
  worked out from the data itself.

A place is cited by its identifier together with its Gazetteer's version (see
[Identifiers and citation](../guide/identifiers.md)).

From PLATO's example of judgements: a bad import put Littleworth at 0°, 0°, and the import's own
source withdraws it.

```jsonrelaxed
[
  {
    "@id": "https://whgazetteer.org/example/attestation/littleworth-bad-import",
    "geometries": [
      {
        "geojson": {
          "type": "Point",
          "coordinates": [
            0.0,
            0.0
          ]
        }
      }
    ],
    "sources": [
      {
        "title": "Batch import, 2026-09-01"
      }
    ],
    "created": "2026-09-01T09:00:00Z",
    "notes": "A bad import put Littleworth at 0°, 0°. In a published gazetteer it is not deleted: the next attestation retracts it."
  },
  {
    "meta": {
      "targetAttestation": "https://whgazetteer.org/example/attestation/littleworth-bad-import",
      "metaType": "https://w3id.org/plato#Retracts"
    },
    "sources": [
      {
        "title": "Batch import, 2026-09-01"
      }
    ],
    "created": "2026-09-02T10:00:00Z",
    "notes": "Withdrawn by whoever made it. The state as of 1 September still shows the point; the state from 2 September on does not."
  }
]
```

From PLATO's `schemas/examples/place-centric-judgements.json`.

### Places are not deleted or merged

- **No place is silently removed.** PLATO has no term for deleting a SpatialEntity. To withdraw a
  place, its Gazetteer retracts the attestations it made about it. The identifier stays, so that
  citations of earlier versions still resolve.
- **A withdrawn place keeps its page.** In v4, a place whose attestations have all been retracted is
  shown as "withdrawn by its contributor", with the reason the retraction gives. Its identifier
  never answers 404: the page stays as a tombstone.
- **Duplicates are linked, not merged.** Two places that turn out to be the same are linked with an
  identity attestation, as above. Each keeps its own record.

### A revised upload

A contributor may upload a revised version of a Gazetteer that is already published. WHG will not
replace the old data with the new: it compares the two, claim by claim, and records the difference
as attestations.

| In the revised upload | Becomes |
|---|---|
| A claim that has changed | A new attestation, with a meta-attestation that `Supersedes` the old one |
| A claim that has gone | A meta-attestation that `Retracts` the old one |
| A claim that is new | A new attestation |
| A claim that is unchanged | Nothing: the existing attestation stands |

The published Gazetteer therefore stays append-only, and its earlier state can still be reproduced.

### Corrections from others

Anyone signed in may suggest a correction to a record in a Gazetteer whose owners invite
suggestions. The owners review each suggestion, and an accepted correction enters the Gazetteer as
an attributed attestation. See [Suggesting corrections](../guide/corrections.md).

---

## Taking data out

A Gazetteer can be exported again, with everything added since it was contributed: identity
attestations, locations, corrections. [Data formats in and out](../guide/formats.md) lists the
formats.

- **LPF export** keeps what LPF can say. Order, denials and meta-attestations cannot be written in
  LPF. PLATO requires a tool that cannot express a denial to leave it out and report it, never to
  write it as an assertion.
- **Computed values** (a route's line, an itinerary's span) are exported marked `computed`, so that
  nobody takes them in as evidence.

### DOIs

WHG has minted a DataCite DOI for each published dataset and collection since v3, and continues to
do so for each published Gazetteer in v4. The DOI is minted when the Gazetteer is published, and is
hidden if it is unpublished. There is **one DOI per Gazetteer, not one per version**: to cite a
Gazetteer as it stood at a particular time, give its DOI together with its version (see
[Identifiers and citation](../guide/identifiers.md)).

% TODO(release): confirm which PLATO export paths have shipped.
