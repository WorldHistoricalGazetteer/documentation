# Vocabularies

Some parts of a WHG attestation take a value from a fixed list rather than free text. This page
lists the lists WHG uses. They are [PLATO](https://w3id.org/plato)'s, at [PLATO
0.7.0](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.0)
([doi:10.5281/zenodo.23056873](https://doi.org/10.5281/zenodo.23056873); all
versions: [doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313)): the enumerations in its JSON schema and the SKOS concept schemes in its ontology, with
the same values and the same identifiers. PLATO's own
[Vocabularies](https://pelagios.org/place-attestation-ontology/guide/vocabularies.html) page is
generated from the ontology and is the authority where this page and it ever differ. How the values
are used in attestations is described in [Attestations and Relations](attestations.md).

The lists come in three kinds, and a value is written differently in each:

| Kind | Written as | Open? | Examples on this page |
|------|-----------|-------|-----------------------|
| **Schema enumeration** | A plain string, exactly as listed | Closed: other values fail validation | Temporal precision, spatial precision, identity type, citation function, authority type, gazetteer status |
| **Concept scheme** | The concept's full IRI, `https://w3id.org/plato#` followed by its name | Open: a project may declare its own concepts | Meta types, source stance, geometry role, form status, kinds of spatial entity |
| **Open string list** | A plain string | Open, provided a project documents what it adds | Name types |

Relation types are written in the same way (a full IRI, and open to a project's own), but they are
RelationType Authorities, not concepts in a scheme; a project declares its own in `relationTypes`.

In PLATO's spreadsheet tables a concept is written by its short name (`Retracts`), and the tables
supply the prefix; in JSON and RDF it is always the full IRI.

---

(name-type-vocabulary)=
## Name types

A Name's `nameType` (`plato:name_type`) says **what the name denotes**. It is an array, since one
name can serve more than one purpose (a name that is both a toponym and an ethnonym). PLATO's starter
values:

| `nameType` | The name of |
|------------|-------------|
| `toponym` | a place |
| `chrononym` | a period or era |
| `ethnonym` | a people or ethnic group |
| `demonym` | the inhabitants of a place |
| `odonym` | a street or road |
| `hydronym` | a body of water |

The list is open: a project may add others (PLATO mentions `oronym` and `hagionym`) provided it
documents them in its Gazetteer's metadata. What kind of place a name belongs to (a river, a
mountain, a shrine) is otherwise a matter for the place's [types](#place-types), not the name's.
WHG uses PLATO's six name types and adds none of its own.

A name type classifies the referent, not the **status of the form**. Whether a string is a reading
from the source, an editor's headword or a search form is the attestation's `formStatus`
(`plato:form_status`), because the same string can have a different status in different attestations:

| `formStatus` | Meaning (PLATO) |
|--------------|-----------------|
| `Attested` | A form read in the cited source. The default, usually omitted. |
| `Headword` | The editorial or preferred form under which the cited authority files the entry. A scholarly decision rather than a reading. |
| `Preferred` | The form the contributing project prefers for display and search: a project decision, so the cited source may show a different form. |
| `Normalised` | A form derived from an attested one for matching or search, attested by no source and carrying no independent evidential value. |
| `Reconstructed` | A form inferred but not attested; the philologists' asterisked form. |

Words such as "exonym", "endonym", "variant", "historical" or "colloquial" are not name types in
PLATO. Who used a name is given by its `language` and its sources, and when it was used by the
attestation's timespans.

---

(place-types)=
## Place types

What kind of place a SpatialEntity is, is a **Type** attestation (`attests_type`, JSON `types`). A
Type stands for one dataset's use of a concept:

| JSON key | PLATO property | Use |
|----------|----------------|-----|
| `identifier` | `type_identifier` | The concept's **full IRI** in a published vocabulary. Strongly encouraged, not required. |
| `label` | `type_label` | A human-readable label. Required. |
| `sourceLabel` | `source_label` | The category as the source gives it, before it was mapped. |
| `scheme` | `skos:inScheme` | The vocabulary's IRI, where the identifier does not already name it. |
| `schemeVersion` | `scheme_version` | The version of the vocabulary used, where its terms change meaning between versions. |
| `@id` | | The dataset's own IRI for this usage, if it wants to refer to it again. Usually omitted. |

Two rules matter:

- **A Type's `@id` is never the concept's IRI.** The concept's IRI goes in `identifier`. Were it the
  `@id`, every dataset's labels, source wording and scheme versions would pile up on the one shared
  concept in any combined graph. A Type's `@id` is the dataset's own, or it is left out.
- **Identifiers are full IRIs, never bare codes.** `PPL`, `Q515` or `stream` means something only to
  someone who already knows the vocabulary. A source's own category that no vocabulary holds is
  recorded as a `label` and `sourceLabel` with no identifier, not as a code made up for it.

| Vocabulary | Form of the identifier | Example |
|------------|------------------------|---------|
| Getty AAT (WHG's main type vocabulary) | `http://vocab.getty.edu/aat/<id>` | `http://vocab.getty.edu/aat/300008347` (inhabited place) |
| Wikidata | `http://www.wikidata.org/entity/<Q-id>` | `http://www.wikidata.org/entity/Q515` (city) |
| GeoNames feature code | `https://www.geonames.org/ontology#<class>.<code>` | `https://www.geonames.org/ontology#P.PPL` (populated place) |
| OpenStreetMap tag | `https://wiki.openstreetmap.org/wiki/Tag:<key>=<value>`, **keeping the key** | `https://wiki.openstreetmap.org/wiki/Tag:waterway=stream` |

An OpenStreetMap tag's IRI keeps its key because the value alone is ambiguous. `scheme` and
`schemeVersion` are for vocabularies whose identifiers do not name them (Köppen climate codes,
ecoregion codes, a project's own list), or whose terms change meaning from one version to the next;
an AAT, Wikidata, GeoNames or OpenStreetMap IRI already names its vocabulary.

```{note}
WHG is migrating to full IRIs. Its current index stores many type identifiers as bare codes (a
GeoNames feature code, an OpenStreetMap value without its key); see WHG
[place#305](https://github.com/WorldHistoricalGazetteer/place/issues/305). Contributions to WHG v4
should give full IRIs.
```

From PLATO's customs-accounts example (`attestation-centric-customs.json`), two AAT types on one
attestation about Bristol:

```jsonrelaxed
"types": [
  { "identifier": "http://vocab.getty.edu/aat/300008347", "label": "inhabited place" },
  { "identifier": "http://vocab.getty.edu/aat/300000745", "label": "port" }
]
```

### GeoNames feature classes

GeoNames records come into WHG with a feature class and a feature code. As type identifiers they are
IRIs in the GeoNames ontology: the class alone (`https://www.geonames.org/ontology#P`) or the class
and code (`https://www.geonames.org/ontology#P.PPL`), as GeoNames' own RDF gives them. The full list
of codes is at [geonames.org](https://www.geonames.org/export/codes.html).

| Class | IRI | Covers |
|-------|-----|--------|
| `A` | `https://www.geonames.org/ontology#A` | Countries, states, regions and other administrative divisions |
| `H` | `https://www.geonames.org/ontology#H` | Streams, lakes and other water features |
| `L` | `https://www.geonames.org/ontology#L` | Parks, areas and regions |
| `P` | `https://www.geonames.org/ontology#P` | Cities, towns, villages and other populated places |
| `R` | `https://www.geonames.org/ontology#R` | Roads and railways |
| `S` | `https://www.geonames.org/ontology#S` | Spots, buildings and sites |
| `T` | `https://www.geonames.org/ontology#T` | Mountains, hills, rocks and other relief features |
| `U` | `https://www.geonames.org/ontology#U` | Undersea features |
| `V` | `https://www.geonames.org/ontology#V` | Forests, heaths and other vegetation |

### Kinds of spatial entity

Four kinds of SpatialEntity change how a platform treats them: WHG draws a route from its ordered
members, works out an itinerary's span, and may leave segments out of lists of places. PLATO declares
them as concepts in `plato:EntityKindScheme`. They are not Types themselves: a Type attestation names
one in its `identifier`, like any other vocabulary concept.

| Concept | IRI | Definition (PLATO) |
|---------|-----|--------------------|
| route | `https://w3id.org/plato#TypeRoute` | An ordered set of places making a way: a road, a sea lane, a pilgrimage route. Its timespan, if any, is when it was in use, not when anyone travelled it. |
| itinerary | `https://w3id.org/plato#TypeItinerary` | A journey made through places in order, each stop with its own timespan: a traveller's tour, a royal progress, a ship's voyage. Not `plato:Itinerary`, which is a geometry role (a line tracing a route or journey). |
| network | `https://w3id.org/plato#TypeNetwork` | A set of places and the connections between them, in no single order: a river system, a canal network, a correspondence network. |
| segment | `https://w3id.org/plato#TypeSegment` | A physical link with an existence of its own: a leg of a route between two stations, a reach of a river between confluences. Platforms may leave segments out of lists and searches of places. |

From PLATO's King John example (`place-centric-king-john.json`), the Type on the itinerary itself:

```jsonrelaxed
"types": [
  {
    "identifier": "https://w3id.org/plato#TypeItinerary",
    "label": "itinerary"
  }
]
```

Gazetteers, gazetteer groups and periods are not SpatialEntities, and are not typed this way. A
Gazetteer is a `dcat:Dataset`, a gazetteer group is a `plato:GazetteerGroup`, and a period is an
Authority (`plato:Period`). See [Routes, Itineraries, Networks, Groups and Periods](patterns.md).

---

(temporal-precision-vocabulary)=
## Temporal precision

A Timespan gives its bounds as four dates (`startEarliest`, `startLatest`, `endEarliest`,
`endLatest`), each an ISO 8601 date or a signed year of at least four digits (`-0500` for 500 BCE).
How finely each end is known is `startPrecision` and `endPrecision`, from this schema enumeration:

| Value | The bound is given to the |
|-------|---------------------------|
| `day` | day |
| `month` | month |
| `year` | year |
| `decade` | decade |
| `century` | century |
| `era` | era |
| `geological_period` | geological period |

Precision is resolution, not confidence: how sure anyone is of the date is certainty. Related keys:

- `precisionValue`: a numeric precision, in years.
- `openStart`, `openEnd`: the start or end is deliberately left open, not merely unknown.
- `sourceLabel`: the date exactly as the source writes it ("about 1841", "a. 1300").
- `label`: a named period ("Byzantine period"); `periodoUri`: the PeriodO period it corresponds to.
- `edtfString`: the date in Extended Date/Time Format; `duration`: a length the source states, as an
  `xsd:duration` (`P42D`).

There is no "circa" or "exact" value. An approximate date is expressed by the distance between its
earliest and latest bounds; an exact one has equal bounds.

---

(spatial-precision-vocabulary)=
## Spatial precision and geometry roles

A Geometry's `spatialPrecision` is an **array** (a heterogeneous geometry may need more than one
value), from this schema enumeration:

| Value | Meaning (PLATO) |
|-------|-----------------|
| `exact` | Surveyed or GPS. |
| `approximate` | Estimated from maps or descriptions. |
| `uncertain` | Multiple possible locations. |
| `historical_approximate` | Based on historical sources with inherent imprecision. |

`precisionKm`, also an array, is an uncertainty radius in kilometres.

What a geometry **depicts** is a separate question, answered by its `role` (`plato:geometry_role`),
a concept in PLATO's geometry-role scheme:

| Role | IRI | Meaning (PLATO) |
|------|-----|-----------------|
| extent | `https://w3id.org/plato#Extent` | The built or bounded extent of the SpatialEntity. |
| feature point | `https://w3id.org/plato#FeaturePoint` | The location of a specific central feature, such as a market place or a church. |
| representative point | `https://w3id.org/plato#RepresentativePoint` | A proxy point standing in for the whole SpatialEntity, for indexing and display; it need not depict any feature of it. |
| label anchor | `https://w3id.org/plato#LabelAnchor` | The anchor point of a map label. |
| itinerary | `https://w3id.org/plato#Itinerary` | A line tracing a route or journey. |

A point that stands for a region is a `RepresentativePoint`, not a precision. A geometry that
software worked out from others (a route's line, a network's hull) is marked `computed`, not given a
precision.

### Relative position

A name, geometry, timespan or type may be given relative to an anchor (`qualification.relativeTo`),
with a bearing, a distance in metres, or a `relativeQualifier` from PLATO's scheme:

| Qualifier | IRI | Meaning (PLATO) |
|-----------|-----|-----------------|
| near | `https://w3id.org/plato#Near` | Close to the anchor, without a stated bearing or distance. |
| within | `https://w3id.org/plato#Within` | Inside the anchor. |
| beyond | `https://w3id.org/plato#Beyond` | On the far side of the anchor from the point of view of the source. |
| upstream of | `https://w3id.org/plato#UpstreamOf` | Upstream of the anchor along a watercourse. |
| between | `https://w3id.org/plato#BetweenXAndY` | Between the anchor and a second anchor. |
| during reign of | `https://w3id.org/plato#DuringReignOf` | A timespan defined by the reign or tenure of the anchor. |
| variant of | `https://w3id.org/plato#VariantOf` | A name defined as a variant of the anchor name. |

---

(certainty-assessment)=
## Certainty, fuzziness and the source's stance

**Certainty** is the contributor's confidence, from 0.0 (completely uncertain) to 1.0 (completely
certain): `certainty` and `certaintyNote` on an attestation, and `qualification.certainty` on a single
name, geometry, timespan, type or PropertyValue. Better evidence could raise it. PLATO sets no bands
on the scale; a `certaintyNote` says what the number rests on. Nor does WHG: it uses PLATO's
`certainty` and `certaintyLevel` as they are, with no numeric bands or certainty levels of its own.

Where certainty is stated in words, it is a **certainty level** (`certaintyLevel`), never an invented
number. PLATO declares the three levels of Linked Places Format; a project may declare its own.

| Level | IRI | Meaning (PLATO) |
|-------|-----|-----------------|
| certain | `https://w3id.org/plato#Certain` | The source, or the contributor, has no doubt of it. |
| less certain | `https://w3id.org/plato#LessCertain` | Probable but not certain. |
| uncertain | `https://w3id.org/plato#Uncertain` | Doubtful: possible, but not established. |

**Fuzziness** (`qualification.fuzziness`, 0.0 crisp to 1.0 maximally vague, with a `fuzzinessNote`)
is a property of the thing, not of anyone's knowledge of it: a region never formally bounded is
fuzzy however good the evidence.

**Source stance** (`sourceStance`) is how firmly the source itself asserts what an attestation
records. It is the source's, not the contributor's.

| Stance | IRI | Meaning (PLATO) |
|--------|-----|-----------------|
| asserted | `https://w3id.org/plato#StanceAsserted` | The source states it as so, on its own account. The default, usually omitted. |
| reported | `https://w3id.org/plato#StanceReported` | The source passes it on without vouching for it: "it is said". |
| tentative | `https://w3id.org/plato#StanceTentative` | The source states it, but with a hedge: "as it seems". |
| doubted | `https://w3id.org/plato#StanceDoubted` | The source raises it and declines to settle it. Not a denial, which is `negated`. |

### Reading the source

| Key | Values (IRIs `https://w3id.org/plato#…`) | Use |
|-----|------------------------------------------|-----|
| `qualification.transcriptionAccuracy` | `TranscriptionAccurate`, `TranscriptionInaccurate`, `TranscriptionFalse` (a ghost form not in the source) | How faithfully a transcription renders the source. |
| `qualification.transcriptionCompleteness` | `TranscriptionComplete`, `TranscriptionReconstructable`, `TranscriptionNonReconstructable` | Whether a transcribed value is whole, and if not, whether the lost part can be supplied. |
| `occurrenceContext` | `Direct` (the default, usually omitted), `InPersonalName`, `InFieldName` | The capacity in which a form occurs in its source. |
| citation `attributionStatus` | `AttributionStated` (the default, usually omitted), `AttributionInferred` | Whether the source is named where the form occurs, or was resolved by an editor from "ibidem". |

---

(source-type-vocabulary)=
## Kinds of authority

A source object's `authorityType` says which kind of Authority it is. It is a schema enumeration,
and defaults to `source` for JSON readers (a document meant for RDF should state it):

| `authorityType` | PLATO class | What it is |
|-----------------|-------------|------------|
| `source` | `plato:Source` | A citable document: a charter, a map, a survey, an edition. |
| `dataset` | `plato:Dataset` | A dataset cited as a whole, such as another gazetteer. |
| `period` | `plato:Period` | A named historical period. |
| `relationType` | `plato:RelationType` | A kind of relation. |
| `certaintyLevel` | `plato:CertaintyLevel` | A level of certainty stated in words. |

PLATO has no list of source genres (inscription, manuscript, map). What a source is, is said by its
`title`, `citation` and `uri`, and its date by its own `timespan`.

---

## Citation functions

A citation's `citationFunction` says why the source is cited. It is a property of
[CiTO](http://purl.org/spar/cito), the Citation Typing Ontology (version 2.9.0), written as its full
IRI, `http://purl.org/spar/cito/` followed by the name. Only these are accepted; a vocabulary's own
terms are mapped to CiTO, and the key is omitted when the function is not stated. The ones most used
in gazetteer data are `citesAsEvidence` (the source is the evidence for the claim),
`citesAsDataSource` (the claim is taken from a dataset) and `citesAsRelated`.

The complete list: `agreesWith`, `cites`, `citesAsAuthority`, `citesAsDataSource`,
`citesAsEvidence`, `citesAsMetadataDocument`, `citesAsPotentialSolution`,
`citesAsRecommendedReading`, `citesAsRelated`, `citesAsSourceDocument`, `citesForInformation`,
`compiles`, `confirms`, `containsAssertionFrom`, `corrects`, `credits`, `critiques`, `derides`,
`describes`, `disagreesWith`, `discusses`, `disputes`, `documents`, `extends`,
`includesExcerptFrom`, `includesQuotationFrom`, `linksTo`, `obtainsBackgroundFrom`,
`obtainsSupportFrom`, `parodies`, `plagiarizes`, `qualifies`, `refutes`, `repliesTo`, `retracts`,
`reviews`, `ridicules`, `speculatesOn`, `supports`, `updates`, `usesConclusionsFrom`,
`usesDataFrom`, `usesMethodIn`.

These describe a citation of a source. They are not meta types: that one attestation retracts or
supports another is a [meta-attestation](#meta-attestation-types).

---

## Meta-attestation types

A meta-attestation's `meta.metaType` (`plato:has_meta_type`) is a concept in PLATO's meta-type scheme,
or one a project declares. Their meanings, and how meta-attestations work, are in
[Meta-attestations](attestations.md#meta-attestations).

| Meta type | IRI | In short |
|-----------|-----|----------|
| contradicts | `https://w3id.org/plato#Contradicts` | The target is incorrect. |
| supports | `https://w3id.org/plato#Supports` | More evidence for the target. |
| supersedes | `https://w3id.org/plato#Supersedes` | Replaces the target with newer information. |
| refines | `https://w3id.org/plato#Refines` | More precise than the target. |
| challenges | `https://w3id.org/plato#Challenges` | Questions the target's validity. |
| bundles | `https://w3id.org/plato#Bundles` | Groups the target with related attestations. |
| derived from | `https://w3id.org/plato#DerivedFrom` | This value was derived from the target's. |
| annotates | `https://w3id.org/plato#Annotates` | A remark on the target, in the notes. |
| alternative to | `https://w3id.org/plato#AlternativeTo` | An alternative reading of the same evidence. |
| retracts | `https://w3id.org/plato#Retracts` | The target is withdrawn by whoever made it. |

---

## Relation types

A relation's `relationType` is one of PLATO's RelationTypes (`https://w3id.org/plato#ContainedIn`,
`#MemberOf`, `#ConnectedTo`, `#LeadsTo`, `#BeginsAt`, `#EndsAt`, `#HasEnd`, `#BirthplaceOf`,
`#DeathplaceOf`, `#ResidenceOf`, `#WorkplaceOf`, `#FindspotOf`, `#SettingOf`, `#DepictedIn`,
`#SubjectOf`) or one the document declares in its `relationTypes`. Containment is always
`ContainedIn`. Their labels, inverses and meanings are in
[Relation types](attestations.md#relation-types).

---

## Identity and matching

| Key | Values | Use |
|-----|--------|-----|
| identity relation `identityType` | `exactMatch`, `closeMatch`, `related`, `unspecified` | How strongly two records are said to be the same place. See [Identity](attestations.md#identity). |
| Candidate status (`plato:candidate_status`, RDF only) | `suggested`, `confirmed`, `rejected` | The review state of a match suggested by software. |

---

## Gazetteers and contributors

| Key | Values | Use |
|-----|--------|-----|
| Gazetteer `status` | `draft`, `published` | Once `published`, a Gazetteer's attestations are append-only and its `licence` is required. |
| contributor `role` | `principal_investigator`, `data_curator`, `student_researcher`, `automated_process`, `external_contributor` | A contributor's role in the project or Gazetteer. |
