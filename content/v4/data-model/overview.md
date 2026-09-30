# Overview

% TODO(0.7.1-doi): add the 0.7.1 version DOI
This page is a reference to the entities of the WHG v4 data model and their properties. The model is
[PLATO](https://w3id.org/plato), the Place Attestation Ontology, as of [PLATO
0.7.1](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.1)
(all versions: [doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313)); the [Introduction](introduction.md) explains the ideas behind it. Each table gives the
**JSON key** used in PLATO JSON (the keys of PLATO's JSON Schema, `plato.schema.json`) and the **RDF
property** in PLATO's ontology, where they differ. Anything on this page that is WHG's own practice
rather than PLATO's is marked as such.

## Core entities

```{mermaid} ../../diagrams/v4_erd.mermaid
:align: center
:name: fig-data-model-overview
:alt: Entity–relationship diagram for the WHG v4 data model.
:caption: Entity–relationship diagram for the WHG v4 data model.
```

<br>

The diagram is logical: it shows the entities of the model and the PLATO properties that link them,
not how WHG stores them. Relationship labels are PLATO's RDF properties; attribute names are PLATO
JSON keys where PLATO JSON has one, and `id` is the node's IRI (`@id` in JSON). WHG holds the model in PostgreSQL/PostGIS, with Elasticsearch for search.

## At a glance

| Entity | PLATO class | Role |
|---|---|---|
| SpatialEntity | `plato:SpatialEntity` | A stable identity on which attestations converge |
| Attestation | `plato:Attestation` | A bundle of claims about one SpatialEntity, with its source, date and certainty |
| Name | `plato:Name` | A name form |
| Geometry | `plato:Geometry` | A location or extent |
| Timespan | `plato:Timespan` | When a claim applies, with uncertain bounds |
| Type | `plato:Type` | A classification, as one dataset uses it |
| PropertyValue | `plato:PropertyValue` | Any other attribute: a population, a valuation, a market day |
| IdentityRelation | `plato:IdentityRelation` | A claim that two SpatialEntities are the same, or related |
| Candidate | `plato:Candidate` | A match suggested by software, awaiting review |
| Authority | `plato:Source`, `plato:Dataset`, `plato:Period`, `plato:RelationType`, `plato:CertaintyLevel` | What attestations rest on and are qualified by |
| Citation | `plato:Citation` | One attestation's use of one source, with a locator |
| Gazetteer | `plato:Gazetteer` (a `dcat:Dataset`) | The workspace that holds contributed entities and attestations |
| GazetteerGroup | `plato:GazetteerGroup` | A group of Gazetteers |
| Contributor | `plato:Contributor` | The person, team or process that makes attestations |

---

## SpatialEntity

A **SpatialEntity** is an entity whose identity is bound up with space: the point on which
attestations from different sources, periods and contributors converge. It holds almost nothing of
its own. Its names, locations, dates, types and relations are all attested.

| JSON key | RDF property | Meaning |
|---|---|---|
| `@id` | (the node's IRI) | Its stable identifier |
| `label` | `rdfs:label` | A display label (required in JSON). A convenience: names come from attestations |
| `ccodes` | `plato:ccodes` | ISO 3166-1 alpha-2 codes of the modern countries it lies in or overlaps. A finding aid, not evidence |
| `entityIdentifier` | `plato:entity_identifier` | An identifier other than its IRI: a project's own record id, or an authority's |
| `namespace` | `plato:namespace` | Whose identifier that is (`geonames`, `wikidata`, `pleiades`, a project's short name) |
| `attestations` | (nested; each maps to `plato:attests_about` pointing back) | Its attestations, in a place-centric document |
| `identityRelations` | `plato:identity_subject` (inverse) | Identity relations with it as subject |

**WHG identifiers.** Each WHG place record has a persistent identifier that resolves through
w3id.org, of the form `https://w3id.org/whg/id/place:<source>:<id>` (see
[Identifiers and Citation](../guide/identifiers.md)).

### What kind of thing a SpatialEntity is

The class does not say. What kind of entity a SpatialEntity is (a settlement, a region, an
administrative unit, a river, a route) is established by **Type attestations** (`attests_type`),
usually naming a concept in a vocabulary such as the Getty AAT. A classification is therefore a claim,
with a source, not an axiom.

Four kinds matter to a platform's behaviour, and PLATO declares them as concepts in the scheme
`plato:EntityKindScheme`: `plato:TypeRoute`, `plato:TypeItinerary`, `plato:TypeNetwork` and
`plato:TypeSegment`. A Type attestation names one in its `identifier`, for example
`"identifier": "https://w3id.org/plato#TypeRoute"`. WHG then draws a route from its ordered members,
works out an itinerary's span, and may leave segments out of lists of places. See
[Routes, Itineraries, Networks, Groups and Periods](patterns.md).

### What is not a SpatialEntity

- A **period** is an Authority (`plato:Period`). Places are dated by Timespans, which may refer to a
  Period.
- A **Gazetteer** is a dataset (`dcat:Dataset`) holding contributed SpatialEntities and their
  attestations, and a **gazetteer group** is a group of Gazetteers (`plato:GazetteerGroup`).
- A WHG **place collection** is a curatorial act, modelled as a Gazetteer whose attestations are
  about other gazetteers' places: attributed to its curator, and shown on those places' pages only
  if the curator declares them public. A place is in the collection when the collection holds an
  attestation about it, whether that carries an annotation or is the selection alone.

---

## Attestation

An **Attestation** bundles claims about one SpatialEntity with the evidence for them. Its content is
what it links to; the attestation itself carries metadata about the claim.

**What it bundles**

| JSON key | RDF property | Target |
|---|---|---|
| `about` | `plato:attests_about` | The SpatialEntity (exactly one). Implicit when nested in a place-centric document; not needed on a meta-attestation (`meta`), which is about its target |
| `names` | `plato:attests_name` | Names |
| `geometries` | `plato:attests_geometry` | Geometries |
| `timespans` | `plato:attests_timespan` | Timespans: when the claim applies |
| `types` | `plato:attests_type` | Types |
| `properties` | `plato:attests_property` | PropertyValues |
| `relations` | `plato:relates_to`, `plato:has_relation_type` | At most one relation to another entity (below) |
| `identities` | `plato:attests_identity` | IdentityRelations asserted together |
| `meta` | `plato:meta_attestation_about`, `plato:has_meta_type` | Another attestation, if this one comments on it |

**About the claim**

| JSON key | RDF property | Meaning |
|---|---|---|
| `@id` | (the node's IRI) | Its stable identifier |
| `sources` | `plato:sourced_by` | The Authorities it rests on |
| `citations` | `plato:has_citation` | Citations of sources, each with a `locator` or `attributionStatus` |
| `certainty` | `plato:certainty` | Confidence, 0.0 to 1.0 |
| `certaintyNote` | `plato:certainty_note` | The basis for that confidence |
| `certaintyLevel` | `plato:certainty_level` | Confidence as a word: a CertaintyLevel such as `plato:LessCertain`. Used instead of inventing a number |
| `negated` | `plato:negated` | True when the source says what is bundled is *not* so |
| `sourceStance` | `plato:source_stance` | How firmly the source asserts it: `plato:StanceReported`, `plato:StanceTentative`, `plato:StanceDoubted` (default `plato:StanceAsserted`) |
| `computed` | `plato:computed` | True when software worked it out from other data. Not evidence, and never imported as an attestation |
| `sequence` | `plato:sequence` | Position among the members of a route, itinerary or network, on a `MemberOf` attestation |
| `formStatus` | `plato:form_status` | Status of the name form contributed: `plato:Headword`, `plato:Preferred`, `plato:Normalised`, `plato:Reconstructed` (default `plato:Attested`) |
| `occurrenceCount`, `occurrenceContext` | `plato:occurrence_count`, `plato:occurrence_context` | How often, and in what capacity, the form occurs in the source |
| `notes` | `plato:notes` | Free-text notes |
| `contributor` | `plato:contributed_by` | Who made it |
| `created`, `modified` | `plato:created`, `plato:modified` | When it was made and last changed |

**Relations.** An item of `relations` has `relatesTo` (the target: another SpatialEntity, or the
IRI of a person, object or event described elsewhere), `relationType` (the IRI of a RelationType),
and optionally `relatedLabel` (a display name for a target outside the dataset) and `relationLabel`
(the source's own wording, `plato:source_label`). PLATO's relation types are listed in the
[Introduction](introduction.md#relations-between-entities).

---

## Name

A **Name** is a name form. Names are nodes of their own and may be shared by several attestations.

| JSON key | RDF property | Meaning |
|---|---|---|
| `@id` | (the node's IRI) | Optional |
| `toponym` | `plato:toponym` | The name in its original script (required) |
| `language` | `plato:language` | A BCP 47 language tag: `en`, `grc`, `zh-Hant`, `ota` |
| `script` | `plato:script` | An ISO 15924 script code: `Latn`, `Arab`, `Grek` |
| `nameType` | `plato:name_type` | What the name denotes: starter values `toponym`, `chrononym`, `ethnonym`, `demonym`, `odonym`, `hydronym`; a project may add and document others |
| `romanized` | `plato:romanized` | A romanised form, for a name in another script |
| `transliterationSystem` | `plato:transliteration_system` | The system used: `ISO 843`, `Pinyin`, `BGN/PCGN` |
| `ipa` | `plato:ipa` | Pronunciation in the International Phonetic Alphabet |
| `nameEmbedding` | `plato:name_embedding` | A vector for phonetic similarity search; format implementation-specific |
| `sourceLabel` | `plato:source_label` | The name exactly as the source prints it, where `toponym` is normalised |
| `qualification` | (see [Qualifying a facet](#qualifying-a-facet)) | Certainty, fuzziness, transcription accuracy |

The status of a form (a headword, a preferred form, a reconstructed one) is not a property of the
Name: it is the attestation's `formStatus`. `nameType` classifies what the name refers to, not the
status of the form.

**WHG practice.** WHG computes a phonetic embedding for each name with its Symphonym model, as a
128-dimensional vector, for [Sounds-alike Search](../guide/sounds-alike.md). It is derived by software
from the name, not attested.

From PLATO's example `schemas/examples/place-centric-constantinople.json`:

```json
{
  "toponym": "Βυζάντιον",
  "language": "grc",
  "script": "Grek",
  "romanized": "Byzantion",
  "transliterationSystem": "ISO 843",
  "nameType": ["toponym"],
  "sourceLabel": "Βυζαντίῳ"
}
```

---

## Geometry

A **Geometry** is a location or extent. Like Names, Geometries are nodes of their own.

| JSON key | RDF property | Meaning |
|---|---|---|
| `@id` | (the node's IRI) | Optional |
| `geojson` | `plato:geo_json` | A GeoJSON geometry: `Point`, `MultiPoint`, `LineString`, `MultiLineString`, `Polygon` or `MultiPolygon` |
| `wkt` | `plato:geo_wkt` | The same as Well-Known Text (the form used in RDF, as a GeoSPARQL `wktLiteral`) |
| `reprPoint` | `plato:repr_point` | A representative point, `[longitude, latitude]` |
| `bbox` | `plato:bbox` | `[min_lon, min_lat, max_lon, max_lat]` |
| `hull` | `plato:hull` | A convex hull, as a WKT polygon |
| `role` | `plato:geometry_role` | What the geometry depicts: `plato:Extent`, `plato:FeaturePoint`, `plato:RepresentativePoint`, `plato:LabelAnchor`, or `plato:Itinerary` (a line tracing a route or journey) |
| `spatialPrecision` | `plato:spatial_precision` | One or more of `exact`, `approximate`, `uncertain`, `historical_approximate` |
| `precisionKm` | `plato:precision_km` | Uncertainty radius or radii, in kilometres |
| `sourceCrs` | `plato:source_crs` | The source's coordinate reference system, e.g. `EPSG:4326` |
| `sourceLabel` | `plato:source_label` | The coordinates as the source prints them, before parsing |
| `qualification` | (see [Qualifying a facet](#qualifying-a-facet)) | Certainty, fuzziness, relative location |

`role` says **what** a geometry locates; `spatialPrecision` says **how well** it is known. They are
independent.

**Several geometries.** PLATO JSON does not accept a GeoJSON `GeometryCollection`. Where sources
differ, or one source gives different geometries for different dates, record each as its own
geometry attestation, so that each keeps its source, dates and certainty. Where one source gives a
point and a polygon for the same thing, give both as geometries of that attestation, with their
roles.

From PLATO's example `schemas/examples/place-centric-constantinople.json`:

```json
{
  "geojson": { "type": "Point", "coordinates": [28.94966, 41.01384] },
  "reprPoint": [28.94966, 41.01384],
  "sourceCrs": "EPSG:4326"
}
```

---

## Timespan

A **Timespan** is the interval during which a claim applies. It uses a four-date model, so that
uncertain beginnings and endings can be stated without inventing precision.

| JSON key | RDF property | Meaning |
|---|---|---|
| `@id` | (the node's IRI) | Optional |
| `startEarliest`, `startLatest` | `plato:start_earliest`, `plato:start_latest` | The window in which it began |
| `endEarliest`, `endLatest` | `plato:end_earliest`, `plato:end_latest` | The window in which it ended |
| `startPrecision`, `endPrecision` | `plato:start_precision`, `plato:end_precision` | Granularity of each bound: `day`, `month`, `year`, `decade`, `century`, `era`, `geological_period` |
| `precisionValue` | `plato:precision_value` | Numeric precision, in years |
| `openStart`, `openEnd` | `plato:open_start`, `plato:open_end` | True when a bound is deliberately unspecified, not merely unknown |
| `duration` | `plato:duration` | A length the source states, as an `xsd:duration` (`P42D`) |
| `label` | `plato:timespan_label` | A human-readable name: "Byzantine period" |
| `periodoUri` | `plato:periodo_uri` | A matching PeriodO period |
| `edtfString` | `plato:edtf_string` | The same in Extended Date/Time Format |
| `sourceLabel` | `plato:source_label` | The date exactly as the source writes it: "about 1841" |
| `qualification` | (see [Qualifying a facet](#qualifying-a-facet)) | Certainty, fuzziness, or a date relative to a Period |

Dates are ISO 8601, or signed years of at least four digits: `-0500` for 500 BCE, `-12000` for
12,000 BCE. A bound that is not known is simply omitted.

From PLATO's example `schemas/examples/place-centric-constantinople.json`:

```json
{
  "startEarliest": "-0440",
  "endLatest": "-0420",
  "startPrecision": "decade",
  "endPrecision": "decade"
}
```

---

## Type

A **Type** is a classification, as one dataset uses it.

| JSON key | RDF property | Meaning |
|---|---|---|
| `identifier` | `plato:type_identifier` | The concept's full IRI in a vocabulary: an AAT, Wikidata or GeoNames concept, an OpenStreetMap tag with its key (`https://wiki.openstreetmap.org/wiki/Tag:waterway=stream`), or a PLATO kind such as `plato:TypeRoute` |
| `label` | `plato:type_label` | A human-readable label (required) |
| `sourceLabel` | `plato:source_label` | The source's own category, before mapping |
| `scheme` | `skos:inScheme` | The vocabulary, where the identifier does not name it (a project's own list) |
| `schemeVersion` | `plato:scheme_version` | The version of the vocabulary, where its terms change meaning between versions |
| `@id` | (the node's IRI) | This dataset's own address for the Type, if it wants one. Never the concept's IRI, which goes in `identifier`. Usually omitted |
| `qualification` | (see [Qualifying a facet](#qualifying-a-facet)) | Certainty, fuzziness |

A Type node stands for one dataset's use of a concept, so different datasets' labels and scheme
versions never merge onto the shared concept. A source's category that no vocabulary holds is
recorded with a `label` (and `sourceLabel`) alone, not a made-up code.

From PLATO's example `schemas/examples/place-centric-constantinople.json`:

```json
{ "identifier": "http://vocab.getty.edu/aat/300008347", "label": "inhabited place" }
```

---

## PropertyValue

A **PropertyValue** is an attribute that is not a name, geometry, timespan or type: a population, a
valuation, an elevation, a market day. Its `property` is the IRI of a property in an external
vocabulary (a Wikidata property, say), with a `value` and optionally a `datatype`, `unit`,
`valueType` for a structured value, and `sourceLabel`. A figure from a statistical table is also a
W3C Data Cube observation (`dataSet`, `dimensions`, `attributes`, `universe`). The attestation's
timespans date it. See [figures on links](patterns.md#figures-on-links-propertyvalues) for its use
on routes and networks.

---

## Qualifying a facet

A Name, Geometry, Timespan, Type or PropertyValue can be qualified on its own, in JSON inside a
`qualification` object:

| JSON key | RDF property | Meaning |
|---|---|---|
| `certainty`, `certaintyNote`, `certaintyLevel` | `plato:certainty`, `plato:certainty_note`, `plato:certainty_level` | How sure we are of this value (epistemic) |
| `fuzziness`, `fuzzinessNote` | `plato:fuzziness`, `plato:fuzziness_note` | How vague the thing itself is: 0.0 crisp, 1.0 maximally vague |
| `relativeTo`, `relativeBearing`, `relativeDistance`, `relativeQualifier` | `plato:relative_to`, `plato:relative_bearing`, `plato:relative_distance`, `plato:relative_qualifier` | A value given relative to something else: "near Lincoln", "during the reign of Justinian" |
| `transcriptionAccuracy`, `transcriptionCompleteness` | `plato:transcription_accuracy`, `plato:transcription_completeness` | How faithfully, and how completely, a transcribed value renders the source |
| `computed` | `plato:computed` | The value was worked out by software, not given by a source |

Certainty and fuzziness are different: better evidence can raise certainty, but no evidence makes a
vague frontier crisp.

---

## Authorities

**Authorities** ground and qualify attestations. `plato:Authority` is the disjoint union of five
kinds. All take `plato:authority_title`, `plato:authority_uri`, `plato:authority_version`,
`plato:bibliographic_string` and a licence (`dcterms:license`).

| Kind | Its own properties |
|---|---|
| **Source** (`plato:Source`) | `plato:partOf` (its Dataset), `plato:source_timespan` (when the document was made), `plato:derived_from` (the source it copies or edits) |
| **Dataset** (`plato:Dataset`) | `plato:publisher`; a published gazetteer or an external corpus (GeoNames, Wikidata, Pleiades) |
| **Period** (`plato:Period`) | `plato:period_label`, `plato:has_timespan`, `plato:period_periodo_uri`, `plato:spatial_coverage` |
| **RelationType** (`plato:RelationType`) | `plato:relation_label`, `plato:inverse_label`, `plato:relation_domain`, `plato:relation_range`, `plato:broader_relation` |
| **CertaintyLevel** (`plato:CertaintyLevel`) | PLATO declares `plato:Certain`, `plato:LessCertain`, `plato:Uncertain`; a project may declare others |

In PLATO JSON an Authority cited by an attestation is an item of `sources`: `@id`, `title`, `uri`,
`citation`, `licence`, and `authorityType` (`source`, `dataset`, `period`, `relationType` or
`certaintyLevel`; state it when the document will be turned into RDF). A Source may also carry
`timespan` and `derivedFrom`. A project's own relation types are declared in the document's
`relationTypes`, each with `@id`, `label`, `inverseLabel` and `broaderRelation`.

A **Citation** (`plato:Citation`; JSON `citations`) is one attestation's use of one source: `source`
(`plato:cites`), `locator` ("p. 412", "f. 12v"), `attributionStatus` (for an "ibid." resolved by an
editor) and `citationFunction` (a CiTO property, such as `cito:citesAsEvidence`).

---

## Gazetteer and GazetteerGroup

A **Gazetteer** is a versioned workspace of SpatialEntities and attestations, owned by a contributor
or team. It defines its own SpatialEntities and may hold attestations about other gazetteers'
entities. In JSON it is the document's `gazetteer` object:

| JSON key | RDF property | Meaning |
|---|---|---|
| `@id` | (the node's IRI) | Its identifier |
| `title`, `description` | `dcterms:title`, `dcterms:description` | |
| `contributor` | `plato:gazetteer_owner` | Its owner |
| `creator` | `dcterms:creator` | The people or organisations to cite as its authors |
| `licence` | `dcterms:license` | Its licence (required once published) |
| `version` | `dcat:version` | Its version; a place is cited as its IRI plus this version |
| `status` | `plato:gazetteer_status` | `draft` or `published`. Once published, its attestations are append-only |
| `isVersionOf`, `previousVersion` | `dcat:isVersionOf`, `dcat:previousVersion` | For a frozen snapshot |
| `keywords`, `spatial`, `temporal`, `landingPage`, `uriSpace` | `dcat:keyword`, `dcterms:spatial`, `dcterms:temporal`, `dcat:landingPage`, `void:uriSpace` | Discovery metadata |

In RDF a Gazetteer links to what it holds with `plato:contains_entity` (the SpatialEntities it
defines), `plato:contains_attestation`, `plato:contains_identity_relation` and
`plato:declares_relation_type`.

A **GazetteerGroup** groups Gazetteers; a Gazetteer belongs to one with `plato:member_of_group`.
PLATO JSON has no key for this; it is stated in RDF, or managed in WHG. See
[Gazetteer groups](patterns.md#gazetteer-groups).

---

## Identity

An **IdentityRelation** says that two SpatialEntities are the same, or related. It is bundled in an
attestation (`identities`), which gives it a source, a contributor and a date, and it is one
attributed claim among many: WHG does not merge records or mint identifiers from it.

| JSON key | RDF property | Meaning |
|---|---|---|
| `subject`, `object` | `plato:identity_subject`, `plato:identity_object` | The two SpatialEntities |
| `identityType` | `plato:identity_type` | `exactMatch`, `closeMatch`, `related` or `unspecified` |
| `certainty` | `plato:identity_certainty` | Confidence in the claim |
| `basis` | `plato:identity_basis` | The evidence or reasoning |
| `assertedBy`, `assertedAt`, `source` | `plato:identity_asserted_by`, `plato:identity_asserted_at`, `plato:identity_sourced_by` | For an identity relation stated on its own, outside an attestation |
| `promotedFrom` | `plato:promoted_from` | The Candidate it was confirmed from |

A consumer may chain `exactMatch` relations within one attestation only, never across attestations,
and never chains the other identity types. That two entities are **not** the same is an attestation
with `negated: true` bundling one `exactMatch`. From PLATO's example
`schemas/examples/place-centric-judgements.json` (the `notes` are elided here):

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
  ]
}
```

A **Candidate** (`plato:Candidate`) is a match suggested by software for a person to review, as in
reconciliation in Map your Data: `plato:candidate_source`, `plato:candidate_candidate`,
`plato:similarity_score`, `plato:algorithm_version`, `plato:candidate_status` (`suggested`,
`confirmed`, `rejected`), `plato:generated_at` and optionally `plato:match_parameters`. It is not a
claim until confirmed. WHG's clusters of matching records are the results of queries, not part of the
model; accepting one is a single attestation bundling the `exactMatch` relations made.

---

## Meta-attestations

A **meta-attestation** is an attestation about another attestation: `meta` in JSON, with
`targetAttestation` (`plato:meta_attestation_about`) and `metaType` (`plato:has_meta_type`), a
concept in `plato:MetaTypeScheme`:

| Meta type | The meta-attestation… |
|---|---|
| `plato:Contradicts` | asserts the target is incorrect |
| `plato:Supports` | gives further evidence for the target |
| `plato:Supersedes` | replaces the target with newer information |
| `plato:Refines` | gives more precise information than the target |
| `plato:Challenges` | questions the target's validity |
| `plato:Bundles` | groups the target with related attestations |
| `plato:DerivedFrom` | holds a value derived from the target's (a normalised form from an attested spelling) |
| `plato:Annotates` | adds a remark about the target, in its `notes` |
| `plato:AlternativeTo` | is an alternative reading of the same evidence; at most one is right |
| `plato:Retracts` | withdraws the target, which is kept only so earlier states can be reproduced |

A published gazetteer's attestations are never deleted or changed; they are superseded or retracted.
From PLATO's example `schemas/examples/place-centric-judgements.json`:

```json
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

---

## Contributors

A **Contributor** (`plato:Contributor`, a `foaf:Agent` and `prov:Agent`) is a person, team or
automated process that makes attestations: `name`, `orcid`, `email`, `affiliation` (an
`plato:Organization`, preferably identified by ROR), `role`, `url` and further `identifier`s. PLATO
recommends ORCID for persons. In v4, WHG requires an ORCID for every new contribution. Data
contributed before v4 keeps the attribution it already has, with or without an ORCID.

---

## Lifecycle

- **Creation.** A SpatialEntity is created with an identifier and a label; attestations build it
  out. Several contributors, in several gazetteers, can attest about the same entity.
- **Growth.** New attestations add information; conflicting attestations coexist, each with its
  source and certainty.
- **Correction.** While a gazetteer is a draft, its owner may edit it. Once it is published its
  attestations are append-only: a correction is a new attestation that supersedes the old one, and
  a withdrawal is a `plato:Retracts` meta-attestation. The state at any date can be reproduced.
- **Citation.** A place is cited as its identifier plus its gazetteer's version.

## Design rationale

Historical knowledge is contested, changes over time, varies in certainty, and matters only with its
provenance. A model with one value per field loses the debate, the dates, the sources and the
uncertainty. The attestation model keeps them: every claim is dated, sourced and qualified, and
claims that disagree sit side by side.

The cost is complexity. There are more structures than in a flat record, and questions such as
"what was this place called in 800 CE?" mean looking across attestations. WHG meets this in its
interfaces and search index, which present simple views over the full model, and by keeping most
properties optional.

PLATO builds on W3C PROV-O (attestations and SpatialEntities are `prov:Entity`), OWL-Time
(`time:ProperInterval`), GeoSPARQL (`geo:Geometry`), SKOS, DCAT, PeriodO and CiTO, and on the
experience of Linked Places Format, Pelagios and Pleiades.

## Next steps

- [Introduction](introduction.md): the ideas behind the model.
- [Attestations & Relations](attestations.md): attestations in detail.
- [Vocabularies](vocabularies.md): the controlled vocabularies.
- [Routes, Itineraries, Networks, Groups and Periods](patterns.md).
- [RDF Representation](rdf-representation.md): the model as Linked Data.
- [Use Cases](usecases.md).
