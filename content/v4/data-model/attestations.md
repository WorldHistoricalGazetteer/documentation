# Attestations and Relations

In WHG v4 everything known about a place, apart from its identifier, is an **attestation**: a bundle
of evidence saying that a SpatialEntity had a name, a location, a type, a relation to something else
or some other attribute, at some time, according to some source, as recorded by someone. The model
is [PLATO](https://w3id.org/plato), the Place Attestation Ontology, at [PLATO
0.7.1](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.1)
([doi:10.5281/zenodo.23060220](https://doi.org/10.5281/zenodo.23060220); all versions: [doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313)). This page describes what an attestation can hold, how relations and identity are
expressed, how one attestation comments on another, and how a Gazetteer attests about places that
other Gazetteers define. The controlled values it mentions are listed in
[Vocabularies](vocabularies.md).

The examples are PLATO JSON, the form in which WHG takes data in and gives it out. Most are quoted
from [PLATO's own examples](https://pelagios.org/place-attestation-ontology/guide/json.html),
including its [worked examples of routes, journeys and networks](https://pelagios.org/place-attestation-ontology/guide/routes/);
the few written for this page are marked as such, and every one validates against PLATO's JSON
schemas. WHG stores and indexes attestations in PostgreSQL/PostGIS and Elasticsearch; this page
describes the model, not the storage.

---

(the-attestation-record)=
## What an attestation bundles

An attestation is about exactly one SpatialEntity (`plato:attests_about`). In a
[place-centric](https://w3id.org/plato/schemas/place-centric.schema.json) document it is nested
under that SpatialEntity; in an
[attestation-centric](https://w3id.org/plato/schemas/attestation-centric.schema.json) document its
`about` gives the SpatialEntity's IRI. A [meta-attestation](#meta-attestations) need not say: it
is about its target attestation. Everything else is optional, and an attestation carries as much or
as little as its source says.

| What | PLATO property | JSON key | Notes |
|------|----------------|----------|-------|
| The SpatialEntity | `attests_about` | `about` | Implicit when nested under the SpatialEntity. Not needed on a meta-attestation, which is about its target. |
| Names | `attests_name` | `names` | A `toponym`, with `language`, `script`, `romanized`, `nameType` and more. |
| Geometries | `attests_geometry` | `geometries` | GeoJSON or WKT, with `role`, `spatialPrecision` and `precisionKm`. |
| Timespans | `attests_timespan` | `timespans` | Four dates (`startEarliest`, `startLatest`, `endEarliest`, `endLatest`) with their precision. |
| Types | `attests_type` | `types` | A classification: a vocabulary concept's IRI in `identifier`, and a `label`. |
| Other attributes | `attests_property` | `properties` | PropertyValues: a population, a valuation, a market day, a distance. |
| A relation | `has_relation_type`, `relates_to` | `relations` | At most one per attestation. See [Relations](#relations). |
| Identity relations | `attests_identity` | `identities` | Several, asserted together. See [Identity](#identity). |
| Commentary on another attestation | `meta_attestation_about`, `has_meta_type` | `meta` | See [Meta-attestations](#meta-attestations). |
| Sources | `sourced_by` | `sources` | The source or dataset the evidence comes from. |
| Citations | `has_citation` | `citations` | One use of one source, with a `locator` and a `citationFunction`. |
| Who and when | `contributed_by`, `created`, `modified` | `contributor`, `created`, `modified` | See [Attribution](#attribution). |
| How sure | `certainty`, `certainty_note`, `certainty_level` | `certainty`, `certaintyNote`, `certaintyLevel` | The contributor's confidence in the bundle. |
| Denial | `negated` | `negated` | The source says it is *not* so. |
| The source's stance | `source_stance` | `sourceStance` | Reported, tentative or doubted, rather than asserted. |
| Worked out by software | `computed` | `computed` | Not evidence. See [Computed values](#computed-values). |
| Position in a route, itinerary or network | `sequence` | `sequence` | With a `MemberOf` relation. |
| Occurrence in the source | `occurrence_count`, `occurrence_context` | `occurrenceCount`, `occurrenceContext` | "3 X"; a form found only in a personal name. |
| Status of the name form | `form_status` | `formStatus` | Attested, headword, preferred, normalised, reconstructed. |
| Free text | `notes` | `notes` | Transcriptions, translations, editorial remarks. |

The parts of an attestation are independent statements that share its provenance. A timespan in an
attestation dates the whole bundle, not the name that happens to sit beside it; the source vouches
for all of it; and a denial, a stance or a certainty applies to all of it. So a contributor bundles
together only what one source says together, for the same time, and puts anything the source says
separately, or with a different date or degree of confidence, in an attestation of its own. A
denial is always one facet per attestation, so that what is denied is never in doubt.

Names, geometries, timespans, types and PropertyValues are reusable: the same Name can be attested
for several SpatialEntities, and one timespan can date many attestations. A SpatialEntity itself
holds only its identifier and some finding aids that are not evidence (a display `label`, `ccodes`,
an `entityIdentifier` and its `namespace`). Everything else about it is attested, and many
attestations from different sources, periods and contributors converge on it.

### Example: Constantinople in the Notitia Urbis

One attestation from PLATO's
[Constantinople example](https://pelagios.org/place-attestation-ontology/guide/json.html)
(`place-centric-constantinople.json`, lines 55–87), nested under its SpatialEntity: a name, a
timespan, a type and a source, all vouched for together, with the certainty and a note on how the
date was set.

```json
{
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
```

The same SpatialEntity has two more attestations in that file: Βυζάντιον, from Herodotus (dated
to the Histories, about 440 to 420 BC), and İstanbul, from GeoNames (dated to the day GeoNames was
consulted, and the only one of the three with a geometry). Each keeps its own source, dates and
certainty, and they need not agree. Each timespan is when its source witnesses the name in use.
These sources witness only their own time, so it is the source's date, not the whole span in which
the name was used: that is a conclusion drawn from many attestations.

---

## Qualifications: certainty, fuzziness and precision

PLATO keeps apart several things that are often run together:

| Question | Where | Values |
|----------|-------|--------|
| How confident is the contributor in this bundle? | `certainty` (0.0 to 1.0) and `certaintyNote` on the attestation | 1.0 is completely certain. Better evidence could raise it. |
| The same, stated in words | `certaintyLevel` | `Certain`, `LessCertain` or `Uncertain`, or a project's own. Never invent a number for a word. |
| How confident in one value? | `qualification.certainty` on a name, geometry, timespan, type or PropertyValue | May differ from the attestation's own. |
| Is the thing itself vague? | `qualification.fuzziness` (0.0 crisp to 1.0 maximally vague) and `fuzzinessNote` | A region never formally bounded is fuzzy however good the evidence. |
| How finely is a location or date given? | `spatialPrecision` and `precisionKm` on a geometry; `startPrecision`, `endPrecision` and `precisionValue` on a timespan | Resolution, not confidence. |
| How firmly does the source say it? | `sourceStance` on the attestation | Reported, tentative or doubted. See [Denial and the source's stance](#denial-and-stance). |
| Is a transcription faithful and whole? | `qualification.transcriptionAccuracy`, `qualification.transcriptionCompleteness` | Judges the reading, not the source. |

A facet can also be defined relative to something else, with `qualification.relativeTo` (the anchor
entity's IRI), `relativeBearing`, `relativeDistance` (in metres) and a `relativeQualifier` such as
`Near`, `Within` or `UpstreamOf`. The values are listed in [Vocabularies](vocabularies.md).

This geometry from PLATO's customs-accounts example (`attestation-centric-customs.json`) places
Deptford Strand near modern Deptford, and says both that its location is uncertain and that the
strand itself was never sharply bounded (the relative-position keys are elided here):

```jsonrelaxed
"geometries": [
  {
    "spatialPrecision": ["uncertain"],
    "precisionKm": [0.5],
    "qualification": {
      // … relativeTo, relativeQualifier and relativeDistance …
      "fuzziness": 0.6,
      "fuzzinessNote": "Strand location was not precisely bounded; refers to a general waterfront area."
    }
  }
]
```

---

(denial-and-stance)=
## Denial and the source's stance

A source may say that something is **not** so: that a town had no market, that a grant was refused.
That is an attestation with `negated: true`, about the real SpatialEntity, bundling the one facet
the source denies. Nothing that never existed needs to be invented. A denial is a statement, often a
certain one, so it is neither low certainty nor a meta-attestation (which needs a claim to
contradict). Any consumer must honour it: a tool that cannot express a denial must leave the
attestation out and say so, never write it as an assertion. WHG follows that rule in what it shows
and what it exports.

From PLATO's `place-centric-judgements.json`, an attestation about Littleworth:

```json
{
  "types": [
    {
      "label": "market"
    }
  ],
  "negated": true,
  "timespans": [
    {
      "startEarliest": "1886",
      "endLatest": "1886",
      "sourceLabel": "1886"
    }
  ],
  "citations": [
    {
      "source": {
        "@id": "https://whgazetteer.org/example/source/market-rights-1886",
        "title": "Return of market rights and tolls, 1886"
      },
      "locator": "vol. XIII, p. 88",
      "citationFunction": "http://purl.org/spar/cito/citesAsEvidence"
    }
  ],
  "notes": "The return answered for every district it covered, so 'no market here' is a statement, certain, not a gap. The attestation is about the real town, with the one thing denied; no market is invented."
}
```

A source may also say something without vouching for it. `sourceStance` records how firmly the
source asserts what the attestation bundles: `StanceReported` ("it is said"), `StanceTentative`
(hedged) or `StanceDoubted` (raised and left unsettled). It is omitted where the source simply
asserts. The stance is the source's, not the contributor's: an editor can be quite certain that a
source hedged, so certainty is not lowered to record it. **Doubt is not denial**: a source that
declines to settle whether there was a market is `StanceDoubted`; one that says there was none is
`negated`.

---

## Sources and citations

An attestation names its evidence in one of two ways, which may be combined:

- **`sources`** (`plato:sourced_by`) names a source or dataset directly: a URI, or an inline object
  with a `title`, a `citation`, a `uri`, a `licence` and an `authorityType` (`source`, `dataset`,
  `period`, `relationType` or `certaintyLevel`).
- **`citations`** (`plato:has_citation`) records one use of one source (`plato:Citation`), with what
  is true of this citation rather than of the source: a **`locator`** ("p. 412", "f. 12v"), an
  **`attributionStatus`** (`AttributionInferred` for an "ibidem" resolved by an editor) and a
  **`citationFunction`**, why the source is cited, as a property of
  [CiTO](http://purl.org/spar/cito), the Citation Typing Ontology, such as `citesAsEvidence` or
  `citesAsDataSource`. An attestation resting on two sources has two citations.

A source may carry its own `timespan`, the date of the document (a manuscript, an edition), which is
distinct from the attestation's timespans, which date the claim. A source may also be
`derivedFrom` the source it copies, calendars or edits. A source's `licence` is that of the copy
cited, so that a consumer can see when a cited source is licence-restricted.

From PLATO's `attestation-centric-citations.json`, one claim resting on two located sources, in the
notation of a place-name survey:

```json
{
  "about": "https://whgazetteer.org/example/entity/bunsty",
  "names": [
    { "toponym": "Bonestowe", "script": "Latn", "nameType": ["toponym"] }
  ],
  "timespans": [
    {
      "startEarliest": "1252",
      "startLatest": "1252",
      "endEarliest": "1346",
      "endLatest": "1346",
      "startPrecision": "year",
      "endPrecision": "year"
    }
  ],
  "sources": [
    { "@id": "https://whgazetteer.org/example/source/close-rolls", "title": "Cl", "citation": "Calendar of the Close Rolls" },
    { "@id": "https://whgazetteer.org/example/source/harley-charters", "title": "Harl", "citation": "British Library, Harley Charters" }
  ],
  "citations": [
    { "source": "https://whgazetteer.org/example/source/close-rolls", "locator": "1251–53, p. 214", "citationFunction": "http://purl.org/spar/cito/citesAsEvidence" },
    { "source": "https://whgazetteer.org/example/source/harley-charters", "locator": "Harl. Ch. 84 D 20" }
  ],
  "notes": "Survey notation: 1252 Cl et passim to 1346 Harl. One claim resting on two sources, each located.",
  "contributor": "https://orcid.org/0000-0002-1234-5678",
  "created": "2026-09-26T12:00:00Z"
}
```

---

## Attribution

Every attestation records who made it (`contributor`, `plato:contributed_by`: a URI, or an inline
object with a `name`, an `orcid`, an `affiliation` and a `role`) and when (`created`, and `modified`
where it has changed). PLATO leaves the ORCID optional; in v4, WHG requires one for every new
contribution, since contributors sign in to WHG with ORCID. Data contributed before v4 keeps the
attribution it already has.

The contributor is not the source. The source is the evidence (a charter, a survey, a dataset); the
contributor is the person, team or process that recorded it in a Gazetteer. The Gazetteer's own
`creator` (the people to cite as its authors) and `contributor` (its owner) are described in its
header.

Once a Gazetteer is **published** (`status: "published"`), its attestations are append-only: never
deleted or changed, only superseded or retracted by new attestations, each with its own `created`
time. The state of a Gazetteer at any moment is then the attestations created by that moment, less
those superseded or retracted by it. See [Meta-attestations](#meta-attestations).

---

## Computed values

A value that software worked out from other statements in the same data, and that any consumer
holding them could work out again (an itinerary's span from its stops' dates, a route's line from
its stations), is marked `computed: true`, on the attestation or in a facet's `qualification`. It is
not evidence: a consumer may show it, but must not take it in as an attestation; it computes the
value again or leaves it out. WHG marks such values when it shows or exports them, never stores
them as attested fact, and never imports anything marked `computed` as an attestation.

A figure a project works out from its own source material and publishes as a finding (letters
counted from a register) is not computed in this sense. It is attested, citing the work that
produced it as a Source or Dataset `derivedFrom` the material. See
[Computed extents](patterns.md#computed-extents).

---

## Relations

An attestation may assert **one** relation between its SpatialEntity and another entity. The
relation's target is `relates_to` (JSON `relatesTo`) and its kind is `has_relation_type` (JSON
`relationType`), the IRI of a RelationType. Like everything else in an attestation, a relation has
the attestation's timespan, source and certainty: containment in 1300 and in 1900 are two
attestations. Two relations need two attestations.

| JSON key | PLATO property | Use |
|----------|----------------|-----|
| `relatesTo` | `relates_to` | The target's IRI. Usually another SpatialEntity; for an association, a person, object or event described elsewhere. |
| `relationType` | `has_relation_type` | One of PLATO's relation types below, or a type the document declares. |
| `relatedLabel` | `related_label` | A name to show for the target. Give it whenever the target is not a SpatialEntity in the same dataset: a platform cannot look up every IRI. |
| `relationLabel` | `source_label` | The source's own wording of the relation ("part of Berkshire"), before it was mapped to a type. |

The attestation's `sequence` gives the SpatialEntity's position in a route, itinerary or network
that it is a `MemberOf`.

### Relation types

PLATO declares these relation types. Each reads from the attestation's SpatialEntity (the subject)
to the `relatesTo` target; the inverse label reads the other way. Their IRIs are
`https://w3id.org/plato#` followed by the name in the first column.

| Relation type | Label | Inverse label | Target | Meaning (PLATO) |
|---------------|-------|---------------|--------|-----------------|
| `ContainedIn` | `contained_in` | `contains` | SpatialEntity | The subject is contained in the target, for the attested timespan: a parish in a hundred, a hundred in a county. |
| `MemberOf` | `member_of` | `has_member` | a route, itinerary or network | The subject is a member of the target: a station on a road, a stop on a journey, a port in a trade network, a segment of a river system. Its position is `sequence`. |
| `ConnectedTo` | `connected_to` | `connected_to` | SpatialEntity | Directly connected, in no particular direction. |
| `LeadsTo` | `leads_to` | `reached_from` | SpatialEntity | A directed connection from the subject to the target: a river into another, a post road to the next town. |
| `BeginsAt` | `begins_at` | `beginning_of` | SpatialEntity | A directed segment begins at the target. |
| `EndsAt` | `ends_at` | `end_of` | SpatialEntity | A directed segment ends at the target. |
| `HasEnd` | `has_end` | `one_end_of` | SpatialEntity | An undirected segment has the target as one of its two ends. |
| `BirthplaceOf` | `birthplace_of` | `born_at` | person | The subject is where the target person was born. |
| `DeathplaceOf` | `deathplace_of` | `died_at` | person | The subject is where the target person died. |
| `ResidenceOf` | `residence_of` | `resided_at` | person or group | The target lived at the subject, for the attested timespan. |
| `WorkplaceOf` | `workplace_of` | `worked_at` | person or group | The target worked, or held office, at the subject. |
| `FindspotOf` | `findspot_of` | `found_at` | object | The target object (a coin, an inscription, a manuscript) was found at the subject. |
| `SettingOf` | `setting_of` | `took_place_at` | event | The target event (a battle, a council, a fair) took place at the subject. |
| `DepictedIn` | `depicted_in` | `depicts` | image, map or drawing | The subject is shown in the target, identified by its address in a collection. |
| `SubjectOf` | `subject_of` | `about` | record, document or publication | The target is about the subject: an archival file, a site record, a report. |

**Containment is `ContainedIn`, never `MemberOf`.** `MemberOf` is membership of a route, itinerary
or network: a town on a road is not within it, and a network's members need not lie inside
anything. Containment is a claim like any other, with a source, a date and a certainty; it is not
fixed by the model, and a place may be attested in different containers at different times or by
different sources.

What is **not** a relation type:

- **Names, geometries and timespans** are facets of the attestation (`attests_name` and the rest),
  not relations.
- **"The same place as"** is not a relation between two places but an identity relation, with its
  own mechanism: see [Identity](#identity).
- **Relations PLATO does not declare** ("capital of", "successor to") are a project's own. A PLATO
  JSON document declares them once in its `relationTypes` array, with a `label`, an `inverseLabel`
  and, where one fits, the PLATO type it narrows as `broaderRelation`; a relation then uses the
  declared type's `@id` as its `relationType`. A narrower type keeps its broader type's direction, so
  a consumer that knows only `LeadsTo` still follows a project's "flows into" the right way. PLATO's
  spreadsheet tables take only PLATO's own relation types. See
  [Routes, Itineraries, Networks, Groups and Periods](patterns.md#connections-and-direction-connectedto-and-leadsto).
- **Thematic keywords** ("coastal trade", "politics") are not relations. They belong in notes or,
  where they classify, in a Type.

### Example: containment

Written for this page (it validates against PLATO's attestation-centric schema). Bunsty Hundred,
from PLATO's survey examples, attested as contained in Buckinghamshire:

```json
{
  "$schema": "https://w3id.org/plato/schemas/attestation-centric.schema.json",
  "profile": "attestation-centric",
  "gazetteer": {
    "@id": "https://whgazetteer.org/example/gazetteer/epns-survey",
    "title": "Place-name survey attestations (illustrative)"
  },
  "attestations": [
    {
      "about": "https://whgazetteer.org/example/entity/bunsty",
      "relations": [
        {
          "relatesTo": "https://whgazetteer.org/example/entity/buckinghamshire",
          "relationType": "https://w3id.org/plato#ContainedIn"
        }
      ],
      "sources": [
        {
          "title": "PN Bk",
          "citation": "A. Mawer and F. M. Stenton, The Place-Names of Buckinghamshire (EPNS 2, 1925)"
        }
      ],
      "notes": "A hundred of Buckinghamshire, as the county survey files it.",
      "contributor": "https://orcid.org/0000-0002-1234-5678",
      "created": "2026-09-30T12:00:00Z"
    }
  ]
}
```

### Example: membership and sequence

From PLATO's King John example (`place-centric-king-john.json`), the first stop of the itinerary,
in an attestation nested under Windsor. The timespan is Windsor's stay, the citation is Hardy's page,
and `sequence` orders Windsor within this one itinerary:

```json
{
  "timespans": [
    {
      "sourceLabel": "from the 1st to the 3d of June 1215",
      "startEarliest": "1215-06-01",
      "endLatest": "1215-06-03"
    }
  ],
  "citations": [
    {
      "source": "https://whgazetteer.org/example/king-john/source/hardy-1835",
      "locator": "p. 108",
      "citationFunction": "http://purl.org/spar/cito/citesAsEvidence"
    }
  ],
  "relations": [
    {
      "relatesTo": "https://whgazetteer.org/example/king-john/place/itinerary-1215",
      "relationType": "https://w3id.org/plato#MemberOf"
    }
  ],
  "sequence": 1
}
```

Windsor has further `MemberOf` attestations with sequences 6, 8 and 9, one for each return. How
routes, itineraries, networks and their segments are built from these, and what equal or missing
sequence numbers mean, is described in
[Routes, Itineraries, Networks, Groups and Periods](patterns.md).

### Associations with people, objects and events

The association types (`BirthplaceOf` to `SubjectOf` in the table) relate a place to something that
is not spatial and is described elsewhere: a person in Wikidata, an object in a museum catalogue, an
event. The target is given by its IRI with a `relatedLabel`, and PLATO deliberately gives
`relates_to` no range, so the target is not taken to be a SpatialEntity. WHG shows associations in a
section of their own on a place page and leaves them out of containment, clustering and matching.
See [Associations](patterns.md#associations-places-in-the-histories-of-people-objects-and-events);
the example under [Attestations about other Gazetteers' places](#attestations-about-other-gazetteers-places)
is one.

---

## Identity

That two records (two SpatialEntities, often from different Gazetteers or authorities) are the same
place is not a relation type. It is an **identity relation** (`plato:IdentityRelation`):

| JSON key | PLATO property | Use |
|----------|----------------|-----|
| `subject` | `identity_subject` | The first SpatialEntity. Implicit when nested under it. |
| `object` | `identity_object` | The second, often a record in another authority (a GeoNames feature, a Wikidata item), which is itself a SpatialEntity in PLATO. |
| `identityType` | `identity_type` | `exactMatch`, `closeMatch`, `related` or `unspecified` (the source links them without saying how strongly). |
| `certainty` | `identity_certainty` | Confidence in the assertion, distinct from its type: a `closeMatch` can be certain. |
| `basis` | `identity_basis` | The evidence or reasoning. |
| `assertedBy`, `assertedAt`, `source` | `identity_asserted_by`, `identity_asserted_at`, `identity_sourced_by` | Who, when, on what authority, for one asserted on its own. |
| `promotedFrom` | `promoted_from` | The Candidate it was confirmed from, if any. |

An identity relation may be stated on its own, in a SpatialEntity's `identityRelations` (as
Constantinople's `closeMatch` to GeoNames is in PLATO's example) or a document's top-level
`identityRelations`. Identity relations asserted **together**, in one act, are bundled in one
attestation's **`identities`** (`plato:attests_identity`), so that they share its provenance (who,
when, on what evidence) and are withdrawn or amended as a unit.

The rules WHG follows, all PLATO's:

- **An identity relation is one attributed claim among many, never a canonical fact.** WHG does not
  merge records or mint identifiers from identity relations, and does not let one outweigh contrary
  evidence by fiat. It is weighed like any other evidence, and someone else may say the opposite.
- **Chaining only within one attestation, and only for `exactMatch`.** A consumer may take the
  transitive closure of the `exactMatch` relations inside one attestation. It must not chain identity
  relations across different attestations, nor chain `closeMatch`, `related` or `unspecified` at all:
  A the same as B and B the same as C, asserted by different people, is not anyone's assertion that
  A is C.
- **"Not the same" is an attestation too.** An attestation with `negated: true` bundling one
  `exactMatch` says that two records are different places, so disagreement accumulates as well as
  agreement.

From PLATO's `place-centric-judgements.json`, an editor's judgement that two Newtons are different
places:

```json
{
  "@id": "https://whgazetteer.org/example/attestation/newtons-distinct",
  "negated": true,
  "identities": [
    {
      "subject": "https://whgazetteer.org/example/entity/newton-on-the-hill",
      "object": "https://whgazetteer.org/example/entity/newton-by-the-river",
      "identityType": "exactMatch"
    }
  ],
  "citations": [
    {
      "source": {
        "@id": "https://whgazetteer.org/example/source/editor-review",
        "title": "Editor's review of the Newtons",
        "authorityType": "source"
      }
    }
  ],
  "notes": "The editor's judgement that the two Newtons are different places: an identity denied (negated, bundling one exactMatch), attributed and dated like any claim, so that disagreement is recorded as well as agreement. It is about the places; the alternative readings above are about the mention."
}
```

### Candidates, clusters and loci

- A **Candidate** (`plato:Candidate`) is a match suggested by software for a person to review, such
  as the matches WHG's Map your Data reconciliation offers. It carries a similarity score, the
  algorithm's version, optionally the settings that produced the score (`plato:match_parameters`),
  and a review status (`suggested`, `confirmed` or `rejected`). A Candidate is neither an attestation
  nor an identity relation. When a person confirms it, it becomes an identity relation that records
  where it came from in `promotedFrom`.
- A **cluster** is not in PLATO. In WHG it is the result of a query in the Atlas: records grouped by
  their similarity at the moment of asking, not a stored entity. Its citable form is a **locus**
  (WHG [place#172](https://github.com/WorldHistoricalGazetteer/place/issues/172)).
- When a person **accepts a cluster** of n records, that is one attestation bundling the n-1
  `exactMatch` relations of the matches actually made (a spanning tree, not every pair), with the
  person, the time and the cluster's definition as its provenance. It is still one claim among
  many: retracting it withdraws all its matches together, and it never becomes a canonical record.

Written for this page (it validates against PLATO's attestation-centric schema): a curator accepts a
cluster of three records for Windsor, the King John example's own, Wikidata's, and a third
Gazetteer's, as one attestation with two `exactMatch` relations:

```json
{
  "$schema": "https://w3id.org/plato/schemas/attestation-centric.schema.json",
  "profile": "attestation-centric",
  "gazetteer": {
    "@id": "https://whgazetteer.org/example/gazetteer/windsor-review",
    "title": "Windsor: accepted matches (illustrative)"
  },
  "attestations": [
    {
      "about": "https://whgazetteer.org/example/king-john/place/windsor",
      "identities": [
        {
          "subject": "https://whgazetteer.org/example/king-john/place/windsor",
          "object": "http://www.wikidata.org/entity/Q464955",
          "identityType": "exactMatch"
        },
        {
          "subject": "https://whgazetteer.org/example/king-john/place/windsor",
          "object": "https://whgazetteer.org/example/entity/windsor",
          "identityType": "exactMatch"
        }
      ],
      "sources": [
        {
          "title": "Cluster of three Windsor records, reviewed in the WHG Atlas",
          "authorityType": "source"
        }
      ],
      "certainty": 0.9,
      "notes": "Two matches make a spanning tree of the three records. The third pair is implied only within this attestation.",
      "contributor": "https://orcid.org/0000-0002-1234-5678",
      "created": "2026-09-30T12:00:00Z"
    }
  ]
}
```

---

## Meta-attestations

An attestation can comment on another attestation. A **meta-attestation** points at its target with
`plato:meta_attestation_about` and says what kind of comment it is with `plato:has_meta_type`, a
concept in PLATO's meta-type scheme or a project's own. In JSON both go in the attestation's `meta`
object, as `targetAttestation` (the target's `@id`) and `metaType` (the concept's IRI). A
meta-attestation need not say which SpatialEntity it is about (`about`, `plato:attests_about`): it
is about its target, and through it about the target's SpatialEntity. Where it does say, as when it
is nested under a place in a place-centric document, that is the target's. A meta-attestation is an
ordinary attestation otherwise: it has its own source, contributor, date,
certainty and notes, and may itself be the target of another.

| Meta type | Meaning (PLATO) |
|-----------|-----------------|
| `Contradicts` | Asserts that the target attestation is incorrect. |
| `Supports` | Provides additional evidence for the target attestation. |
| `Supersedes` | Replaces the target attestation with newer information. |
| `Refines` | Provides more precise information than the target attestation. |
| `Challenges` | Questions the validity of the target attestation. |
| `Bundles` | Groups the target with other related attestations. |
| `DerivedFrom` | This attestation's value was derived from the target's, as a normalised search form is derived from an attested spelling. |
| `Annotates` | Adds a remark about the target, with its own source, without supporting, contradicting or refining it. The remark is the meta-attestation's notes. |
| `AlternativeTo` | This attestation and the target are alternative readings of the same evidence: at most one of them is right. Each keeps its own certainty, and the set counts once as evidence. |
| `Retracts` | The target is withdrawn by whoever made it, and kept only so that earlier states can be reproduced. A tool showing the current state leaves it out. Retracting a retraction restores the target. |

Their IRIs are `https://w3id.org/plato#` followed by the name. In a published Gazetteer, a
correction is a new attestation that `Supersedes` (or `Contradicts`) the old one, and a withdrawal
is a `Retracts`; nothing is deleted. A supersession or retraction takes effect only while it holds
itself, so a chain of them resolves in order.

WHG applies these in two situations of its own:

- **A revised upload.** When a contributor uploads a new version of a published Gazetteer, WHG will
  compare it with what is there: a changed claim becomes a new attestation with a `Supersedes`
  meta-attestation, a removed claim a `Retracts`, and a new claim a new attestation (see
  [Changing a contribution](contributions.md#changing-a-contribution)).
- **A withdrawn place.** A place whose attestations have all been retracted keeps its page, marked
  "withdrawn by its contributor" with the retraction's reason. Its identifier never answers 404.

From PLATO's `place-centric-judgements.json`, a bad import and its retraction, two attestations
about Littleworth:

```jsonrelaxed
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
```

In RDF the same mechanism is two properties on the attestation. From PLATO's
`examples/survey-attestations.ttl`, a normalised search form derived from an attested spelling:

```turtle
@prefix plato: <https://w3id.org/plato#> .
@prefix whgx: <https://whgazetteer.org/example/> .

whgx:attestation\/bunsty-bunstowe-normalised
    a plato:Attestation ;
    plato:attests_about whgx:entity\/bunsty ;
    plato:attests_name whgx:name\/bunstowe ;
    plato:sourced_by whgx:dataset\/deep ;
    plato:form_status plato:Normalised ;
    plato:meta_attestation_about whgx:attestation\/bunsty-bunstowe-attested ;
    plato:has_meta_type plato:DerivedFrom .
```

### Which to use

| The situation | Use |
|---------------|-----|
| The source says it is not so. | `negated: true` on the attestation. |
| The source passes it on, hedges, or leaves it open. | `sourceStance`. |
| The contributor is unsure. | `certainty` or `certaintyLevel`. |
| A scholar or source says another attestation is wrong. | A meta-attestation, `Contradicts` (or `Challenges`). |
| Its maker takes a claim back (a bad import). | A meta-attestation, `Retracts`. |
| A corrected version replaces an earlier one. | A new attestation that `Supersedes` the old. |
| One mention could be read as either of two places. | Two attestations, the second `AlternativeTo` the first. |
| Two records are different places. | `negated: true` with one `exactMatch` in `identities`. |

---

## Attestations about other Gazetteers' places

A **Gazetteer** (`plato:Gazetteer`, a `dcat:Dataset`) is a workspace that defines its own
SpatialEntities and holds attestations. Its attestations need not be about SpatialEntities it
defines. It may attest about places that other Gazetteers define, identified by their IRIs, without
redefining them: a correction to another project's place, a link from a record to an existing place,
a curator's note on a place in a collection. Such an attestation **adds evidence**. It does not
change the place's identity or make this Gazetteer its owner; its source, contributor and status are
this Gazetteer's; and the append-only rule of a published Gazetteer applies to the attestations it
contains, not to what others say about its places.

In PLATO JSON these go in an **attestation-centric** document, where each attestation's `about`
gives the IRI of an existing place. A **place-centric** document declares every SpatialEntity it
lists as its own, so it lists only those. PLATO's customs-accounts example
(`attestation-centric-customs.json`) attests a Middle English name for Bristol with `about`
pointing at GeoNames' record, `https://www.geonames.org/2654675/`.

### Place collections

A WHG **place collection** is a curatorial act, so in the model it is a **Gazetteer**, not a
SpatialEntity. The places it gathers belong to other Gazetteers. **Selecting a place** for the
collection is attesting about it: a place is in the collection when the collection's Gazetteer
contains an attestation about that place. That attestation may carry the curator's
**annotation**, or it may be the selection alone. Either way it is attributed to the curator, with
the collection's own sources and dates. A place's own page shows a collection's annotations only if the collection declares them
public. Teaching and class groups, in which students build collections together, are features of
the WHG application, not part of PLATO.

Written for this page (it validates against PLATO's attestation-centric schema): a collection's
annotation on Lumbini, a place another Gazetteer defines, which is also an association with a
person described in Wikidata:

```json
{
  "$schema": "https://w3id.org/plato/schemas/attestation-centric.schema.json",
  "profile": "attestation-centric",
  "gazetteer": {
    "@id": "https://whgazetteer.org/example/collection/buddha-life",
    "title": "Places in the life of the Buddha (a place collection, illustrative)",
    "contributor": "https://orcid.org/0000-0002-1234-5678",
    "creator": [{ "@id": "https://orcid.org/0000-0002-1234-5678" }],
    "licence": "https://creativecommons.org/licenses/by/4.0/"
  },
  "attestations": [
    {
      "about": "https://whgazetteer.org/example/entity/lumbini",
      "relations": [
        {
          "relatesTo": "http://www.wikidata.org/entity/Q9441",
          "relatedLabel": "the Buddha",
          "relationType": "https://w3id.org/plato#BirthplaceOf"
        }
      ],
      "citations": [
        {
          "source": {
            "@id": "https://whgazetteer.org/example/source/rummindei-pillar",
            "title": "Rummindei pillar inscription of Aśoka",
            "authorityType": "source"
          },
          "citationFunction": "http://purl.org/spar/cito/citesAsEvidence"
        }
      ],
      "notes": "The curator's annotation for this collection. Lumbini is another gazetteer's place: the collection adds evidence about it and does not redefine it.",
      "contributor": "https://orcid.org/0000-0002-1234-5678",
      "created": "2026-09-30T12:00:00Z"
    }
  ]
}
```

A Gazetteer may also belong to a **gazetteer group** (`plato:member_of_group`); see
[Gazetteer groups](patterns.md#gazetteer-groups).

---

## Reading attestations

Because every claim is its own attestation, questions about a place are answered by selecting
attestations, not by reading a single record:

- **What was it called in 800?** The names in attestations about the place whose timespans can
  include 800, each shown with its source and certainty. Retracted and superseded attestations are
  left out of the current state, and denials are shown as denials, not as names.
- **What contained it?** Attestations about the place with a `ContainedIn` relation, each with its
  own dates and source; there may be several, and they may disagree.
- **Which places are connected to it?** Attestations with `ConnectedTo` or `LeadsTo` (or a project
  type whose `broaderRelation` leads to one of them) in either direction, with the direction taken
  from the relation type.

WHG answers such questions from PostgreSQL/PostGIS and its Elasticsearch indexes; how it does so is
an implementation matter and not part of the model.
