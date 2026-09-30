# RDF Representation

% Every plato: term on this page is defined in PLATO's ontology.ttl at tag v0.7.1 (8b37c18).
% Every Turtle excerpt is verbatim from that tag, and every SPARQL query was run with rdflib 7.6 against
% the tag's twelve examples/*.ttl files (2026-09-30).

WHG's data model is [PLATO](https://w3id.org/plato), the Place Attestation Ontology, and PLATO is
an OWL ontology. So WHG's RDF is PLATO RDF: its classes and properties are PLATO's, in the namespace
`https://w3id.org/plato#`, together with a few standard vocabularies that PLATO itself uses
(GeoSPARQL, Dublin Core, DCAT, SKOS). WHG has no RDF vocabulary of its own.

You do not need RDF to use WHG: PLATO's JSON formats and Linked Places Format serve most uses. This
page is for people who want to load WHG data into a triple store, query it with SPARQL, or link to
it from their own linked data.

The Turtle excerpts on this page are quoted from PLATO's own example files (in the
[`examples/`](https://github.com/pelagios/place-attestation-ontology/tree/main/examples) folder of
the PLATO repository), shortened with `# …` where lines are left out. Their `whgx:` IRIs are
illustrative; PLATO's examples use them in place of real WHG identifiers.

---

## What WHG serves, and how

Every place record has a persistent identifier that resolves through w3id.org (see
[Identifiers and citation](../guide/identifiers.md)):

```text
https://w3id.org/whg/id/place:<source>:<id>
```

The same address answers people and software differently, by content negotiation on the request's
`Accept` header. What it serves **today** and what it will serve **at the v4 launch** differ:

| `Accept` header | Today | At the v4 launch |
|---|---|---|
| `text/html` | the record's page on WHG | the record's page on WHG |
| `application/ld+json`, `application/json` or `*/*` | the record as JSON-LD in Linked Places Format | the record as PLATO JSON-LD |
| `text/turtle` | not served (404) | the record as PLATO Turtle |

**Today**, the JSON-LD answer is in **Linked Places Format** (LPF), with LPF's own JSON-LD context,
so it is already RDF. LPF is PLATO's single-object profile: each LPF element corresponds to one
attestation linking one entity to one name, type, geometry or related entity, so existing LPF data
remains valid PLATO. Turtle and other RDF serialisations are not served.

**At the v4 launch**, WHG will serve PLATO JSON-LD and Turtle by content negotiation, and will go on
serving LPF for existing clients.

% TODO(release): say how a client asks for LPF once PLATO JSON-LD is the default answer, and confirm
% the media types in the table against the shipped service.
% TODO(release): add the SPARQL endpoint here if it has shipped; otherwise keep it out of the text
% (same TODO as guide/formats.md).

### From PLATO JSON to RDF

PLATO JSON (the place-centric and attestation-centric formats) becomes RDF by adding PLATO's
JSON-LD context, `https://w3id.org/plato/schemas/plato.context.jsonld`, and expanding the document
with any JSON-LD 1.1 processor. The [PLATO tools](https://pelagios.org/plato-tools/) do the same
conversion to N-Triples, in the browser or from the command line.

The context maps each JSON key to its PLATO term (JSON keys are camelCase, `startEarliest`; the
ontology's properties are snake_case, `plato:start_earliest`). A context cannot do everything, and
the context file lists what a converter must add itself. The points that matter most for RDF users:

- No `rdf:type` is added to attestations, names, geometries, timespans, types or entities; the
  ontology's domains and ranges let a reasoner infer them.
- Timespan bounds stay untyped strings. Type them by shape (`xsd:gYear`, `xsd:date`,
  `xsd:dateTime`) if a store is to index and compare them.
- A geometry's `reprPoint` and `bbox` become RDF lists of numbers, not the WKT literals the ontology
  declares.
- Name strings carry no language tag.
- A key the context does not name is dropped silently.

So RDF produced from JSON by the context alone is correct PLATO, but not everything the ontology
can say; a store that relies on types or typed dates should add them.

---

## Namespaces

| Prefix | Namespace | Used for |
|---|---|---|
| `plato:` | `https://w3id.org/plato#` | every PLATO class, property and concept |
| `geo:` | `http://www.opengis.net/ont/geosparql#` | `geo:wktLiteral`; `plato:Geometry` is a `geo:Geometry` |
| `dcterms:` | `http://purl.org/dc/terms/` | a gazetteer's title and licence; a source's licence |
| `dcat:` | `http://www.w3.org/ns/dcat#` | a gazetteer's version (`dcat:version`) and other catalogue metadata |
| `skos:` | `http://www.w3.org/2004/02/skos/core#` | a Type's scheme (`skos:inScheme`); PLATO's concept schemes |
| `cito:` | `http://purl.org/spar/cito/` | why a source is cited (`plato:citation_function`) |
| `xsd:` | `http://www.w3.org/2001/XMLSchema#` | datatypes |
| `rdfs:` | `http://www.w3.org/2000/01/rdf-schema#` | labels |

PLATO aligns its classes with PROV-O: `plato:SpatialEntity` and `plato:Attestation` are
subclasses of `prov:Entity`, and `plato:Contributor` of `prov:Agent`.

---

## The classes and properties

| PLATO class | What it is | Linked from an attestation by | JSON key |
|---|---|---|---|
| `plato:SpatialEntity` | the identity that attestations are about | `plato:attests_about` | `about` (or nesting in a place-centric document) |
| `plato:Name` | a name form | `plato:attests_name` | `names` |
| `plato:Geometry` | a location or extent | `plato:attests_geometry` | `geometries` |
| `plato:Timespan` | when the attested facts held | `plato:attests_timespan` | `timespans` |
| `plato:Type` | one dataset's use of a classification | `plato:attests_type` | `types` |
| `plato:PropertyValue` | any other attribute (a population, a length) | `plato:attests_property` | `properties` |
| `plato:Source`, `plato:Dataset` | what the attestation rests on | `plato:sourced_by` | `sources` |
| `plato:Citation` | one use of one source, with a locator | `plato:has_citation` | `citations` |
| `plato:IdentityRelation` | a claim that two entities are the same | `plato:attests_identity` | `identities` |
| `plato:Contributor` | who recorded the attestation | `plato:contributed_by` | `contributor` |

A SpatialEntity is an entity whose identity is bound up with space: a settlement, a region, a
route, a river network. A person, an event or a period is not a SpatialEntity. A period is an
Authority (`plato:Period`), and a place's part in the life of a person or the history of an object
is a relation from the place to that thing's own IRI (see [Relations](#relations) below).

Everything else hangs off the attestation too: `plato:relates_to` and `plato:has_relation_type`
for relations, `plato:meta_attestation_about` and `plato:has_meta_type` for comments on other
attestations. The attestation itself carries only metadata: `plato:certainty`,
`plato:certainty_note`, `plato:notes`, `plato:sequence`, `plato:negated`, `plato:computed`,
`plato:created`.

---

## An attestation in Turtle

An attestation is a node of its own, not a reified triple: it bundles one SpatialEntity with the
names, geometries, timespans and types a source gives for it, and says who recorded that and on
what evidence. PLATO's Constantinople example has one SpatialEntity and three attestations, one
per source. The third of them, from `examples/constantinople.ttl` (lines 219–231):

```turtle
whgx:attestation\/istanbul-geonames
    a plato:Attestation ;
    plato:attests_about whgx:entity\/constantinople ;
    plato:attests_name whgx:name\/istanbul-tr ;
    plato:attests_geometry whgx:geometry\/geonames-point ;
    plato:attests_timespan whgx:timespan\/geonames-consulted ;
    plato:attests_type whgx:type\/inhabited-place ;
    plato:sourced_by whgx:source\/geonames ;
    plato:contributed_by whgx:contributor\/historian ;
    plato:certainty 1.0 ;
    plato:certainty_note "GeoNames gives İstanbul as the official Turkish name, and a single point for the city; the point stands for the whole city and marks no boundary." ;
    plato:notes "The timespan is the day GeoNames was consulted. A modern gazetteer witnesses the current name, not when the name came into use." ;
    plato:created "2026-02-15T10:00:00Z"^^xsd:dateTime .
```

The SpatialEntity itself says almost nothing: its identity is the point on which attestations
converge (lines 43–47):

```turtle
whgx:entity\/constantinople
    a plato:SpatialEntity ;
    plato:entity_identifier "constantinople" ;
    plato:namespace "whg" ;
    plato:ccodes "TR" .
```

A WHG place's IRI in RDF (its `@id` in JSON-LD) is its persistent identifier,
`https://w3id.org/whg/id/place:<source>:<id>`. The API address,
`https://whgazetteer.org/entity/place:<source>:<id>/api`, is only where the data is served; it is not
the place's identity. Use the w3id identifier when you refer to a WHG place from your own RDF.

Today's LPF answer still gives the API address as the place's `"@id"`. That will be corrected so
that it gives the w3id identifier.

### Names

A Name is a node that attestations point to, so the same form can be attested for several
entities, by several sources (lines 58–66):

```turtle
whgx:name\/byzantion-grc
    a plato:Name ;
    plato:toponym "Βυζάντιον" ;
    plato:language "grc" ;
    plato:script "Grek" ;
    plato:romanized "Byzantion" ;
    plato:transliteration_system "ISO 843" ;
    plato:name_type "toponym" ;
    plato:source_label "Βυζαντίῳ" .
```

`plato:source_label` keeps the form exactly as the source writes it, here the dative in
Herodotus's "at Byzantion"; the toponym is the normalised form. Another name property is
`plato:ipa`. Whether a form is attested, a headword or an editor's normalisation is not a property
of the Name, since one Name can be all three in different places: it is `plato:form_status` on the
attestation.

### Geometries

`plato:Geometry` is a subclass of GeoSPARQL's `geo:Geometry`, and its WKT is `plato:geo_wkt`, a
subproperty of `geo:asWKT` with the range `geo:wktLiteral`. Only GeoNames, of the example's three
sources, gives a location; from the same file (lines 92–96):

```turtle
whgx:geometry\/geonames-point
    a plato:Geometry ;
    plato:geo_wkt "POINT(28.94966 41.01384)"^^<http://www.opengis.net/ont/geosparql#wktLiteral> ;
    plato:repr_point "POINT(28.94966 41.01384)"^^<http://www.opengis.net/ont/geosparql#wktLiteral> ;
    plato:source_crs "EPSG:4326" .
```

What this means for spatial queries:

- **WKT is the RDF geometry.** Coordinates are longitude then latitude, in WGS 84 unless
  `plato:source_crs` says otherwise. `plato:geo_json` carries a GeoJSON geometry object as a
  string, for web mapping and LPF export; it is an alternative serialisation, not a second
  geometry.
- **There is no `geo:hasGeometry`.** A geometry belongs to an attestation, not to the entity:
  one source's extent and another's are different claims, each with its own date and source. To
  find an entity's geometries, go through its attestations (`plato:attests_about`, then
  `plato:attests_geometry`).
- **GeoSPARQL stores.** A store with RDFS inference sees every `plato:geo_wkt` as `geo:asWKT`;
  without inference, apply GeoSPARQL functions (such as `geof:sfWithin`) to `plato:geo_wkt`
  directly.
- **`plato:repr_point`** is a WKT point for indexing and distance queries; **`plato:hull`** and
  **`plato:bbox`** are for fast filtering.
- **How precisely, and what it depicts, are separate.** `plato:spatial_precision` (`exact`,
  `approximate`, `uncertain`, `historical_approximate`) and `plato:precision_km` say how well the
  location is known. `plato:geometry_role` says what the geometry depicts: an extent, a feature
  point, a representative point, a label anchor, an itinerary line (`plato:Extent`,
  `plato:FeaturePoint`, `plato:RepresentativePoint`, `plato:LabelAnchor`, `plato:Itinerary`).
  PLATO's `examples/geometry-roles.ttl` shows four geometries for one town, each with its role.
- **Heterogeneous geometries.** Rather than a GeometryCollection, give each geometry its own node,
  and where they differ by source or date, its own attestation, so that each keeps its provenance.

### Timespans

A Timespan has four bounds, so that uncertainty about when something began and ended can be said
exactly; a bound that is not known is left out. Herodotus's Histories are dated only to within a
couple of decades (lines 106–111):

```turtle
whgx:timespan\/herodotus-histories
    a plato:Timespan ;
    plato:start_earliest "-0440" ;
    plato:end_latest "-0420" ;
    plato:start_precision "decade" ;
    plato:end_precision "decade" .
```

Years have at least four digits, and as many as they need (`"-12000"`); a day is an ISO 8601
date. The bounds may be plain strings, as here; a producer that can should type them as
`xsd:gYear`, `xsd:date` or `xsd:dateTime`, so that a store can compare them. The precision values
are `day`, `month`, `year`, `decade`, `century`, `era` and `geological_period`. Other properties:
`plato:duration` (a length the source states, as an `xsd:duration`), `plato:open_start` and
`plato:open_end`, `plato:periodo_uri`, `plato:edtf_string`, and `plato:source_label` for the date
as the source writes it. The King John example shows that last in use (from
`examples/king-john-itinerary.ttl`, lines 87–97):

```turtle
whgx:king-john\/attestation\/windsor-1
    a plato:Attestation ;
    plato:attests_about whgx:king-john\/place\/windsor ;
    plato:relates_to whgx:king-john\/place\/itinerary-1215 ;
    plato:has_relation_type plato:MemberOf ;
    plato:sequence 1 ;
    plato:attests_timespan [ a plato:Timespan ;
        plato:source_label "from the 1st to the 3d of June 1215" ;
        plato:start_earliest "1215-06-01" ;
        plato:end_latest "1215-06-03" ] ;
    plato:has_citation whgx:king-john\/citation\/p108 .
```

A named period is not a Timespan but an Authority, `plato:Period`, with its own timespan and,
where it has one, a PeriodO identifier (see [Periods](patterns.md#periods)).

### Types

A Type node stands for **one dataset's use** of a classification, not for the vocabulary's
concept. Its IRI, if it has one, is the dataset's own; the concept's IRI goes in
`plato:type_identifier`. Were the Type node the concept itself, every dataset's label and version
would pile up on one shared node in any combined graph. In `examples/constantinople.ttl`
(lines 134–137), the Type has the dataset's IRI:

```turtle
whgx:type\/inhabited-place
    a plato:Type ;
    plato:type_identifier "http://vocab.getty.edu/aat/300008347"^^xsd:anyURI ;
    plato:type_label "inhabited place" .
```

and in `examples/antonine-routes.ttl` (lines 78–83) it is a blank node:

```turtle
whgx:antonine\/attestation\/iter-iii-type
    a plato:Attestation ;
    plato:attests_about whgx:antonine\/place\/iter-iii ;
    plato:attests_type [ a plato:Type ; plato:type_label "route" ;
                         plato:type_identifier "https://w3id.org/plato#TypeRoute"^^xsd:anyURI ] ;
    plato:has_citation whgx:antonine\/citation\/wess-473 .
```

Type identifiers are full IRIs, never bare codes such as `PPL`; an OpenStreetMap tag's IRI keeps
its key (`https://wiki.openstreetmap.org/wiki/Tag:waterway=stream`). Where a vocabulary has no
IRIs of its own, or changes what its terms mean between versions, the Type gives its scheme with
`skos:inScheme` and the version used with `plato:scheme_version` (JSON `scheme` and
`schemeVersion`).

The second excerpt is also how a route is typed. `plato:TypeRoute`, `plato:TypeItinerary`,
`plato:TypeNetwork` and `plato:TypeSegment` are concepts in PLATO's `plato:EntityKindScheme`,
named in a Type's identifier like any other concept (see
[Typing](patterns.md#typing-routes-itineraries-networks-and-segments)).

Both write the identifier as a literal typed `xsd:anyURI`, never as an IRI object: the ontology
asks for that form, and it is what PLATO's JSON-LD context and spreadsheet tables produce. The
queries below compare `STR(?identifier)`, so that they also find data that writes it as an IRI.

---

## Relations

A relation between two entities is an attestation about one of them that `plato:relates_to` the
other, with `plato:has_relation_type` naming the kind of relation. So a relation has a source, a
timespan and a certainty like any other claim. PLATO declares its relation types as individuals of
`plato:RelationType`, an Authority. Containment, from `ontology.ttl` (lines 3230–3244, comment
left out):

```turtle
plato:ContainedIn
    a plato:RelationType ;
    rdfs:isDefinedBy <https://w3id.org/plato> ;
    plato:authority_title "contained in"@en ;
    plato:relation_label "contained_in" ;
    plato:inverse_label "contains" ;
    plato:relation_domain "SpatialEntity" ;
    plato:relation_range "SpatialEntity" ;
    plato:authority_uri "http://vocab.getty.edu/ontology#broaderPartitive"^^xsd:anyURI ;
    # …
```

| Relation type | Meaning |
|---|---|
| `plato:ContainedIn` | the subject is contained in the target: a parish in a hundred (inverse label `contains`) |
| `plato:MemberOf` | the subject is a member of a route, itinerary or network, ordered by `plato:sequence` where the source orders it |
| `plato:ConnectedTo` | the subject and target are directly connected, in no direction |
| `plato:LeadsTo` | a connection running one way, from the subject to the target |
| `plato:BeginsAt`, `plato:EndsAt`, `plato:HasEnd` | the end places of a segment |
| `plato:BirthplaceOf`, `plato:DeathplaceOf`, `plato:ResidenceOf`, `plato:FindspotOf`, `plato:SettingOf`, `plato:WorkplaceOf` | the place's part in the life of a person, the history of an object or the course of an event, whose own IRI is the target, with `plato:related_label` naming it |

Membership is not containment: a town on a road is not inside the road. A member attestation from
`examples/antonine-routes.ttl` (lines 98–106):

```turtle
whgx:antonine\/attestation\/durobrivae-in-iter-iii
    a plato:Attestation ;
    plato:attests_about whgx:antonine\/place\/durobrivae ;
    plato:relates_to whgx:antonine\/place\/iter-iii ;
    plato:has_relation_type plato:MemberOf ;
    plato:sequence 3 ;
    plato:has_citation [ a plato:Citation ;
        plato:cites whgx:antonine\/source\/parthey-pinder-1848 ;
        plato:locator "p. 225, Wess. 473.3" ] .
```

A project may declare a narrower relation type of its own, with `plato:broader_relation` pointing
at the PLATO type it narrows ("flows into" narrowing `plato:LeadsTo`), so that software that knows
only PLATO's types still follows it. Routes, itineraries, networks and segments are described in
full in [Routes, Itineraries, Networks, Groups and Periods](patterns.md), and associations in
[Associations](patterns.md#associations-places-in-the-histories-of-people-objects-and-events).

---

## Denials

When a source says that something was *not* so, the attestation says what it denies and carries
`plato:negated true`. It is neither low certainty nor a meta-attestation. From
`examples/king-john-itinerary.ttl` (lines 184–197):

```turtle
whgx:king-john\/attestation\/isle-of-wight-denied
    a plato:Attestation ;
    plato:attests_about whgx:king-john\/place\/isle-of-wight ;
    plato:relates_to whgx:king-john\/place\/itinerary-1215 ;
    plato:has_relation_type plato:MemberOf ;
    plato:negated true ;
    plato:attests_timespan [ a plato:Timespan ;
        plato:source_label "then" ;
        plato:start_earliest "1215-06-15" ;
        plato:end_latest "1215-07-17" ] ;
    plato:notes "\"it is unquestionable that the King did not then visit the Isle of Wight\"" ;
    plato:has_citation [ a plato:Citation ;
        plato:cites whgx:king-john\/source\/hardy-1835 ;
        plato:locator "pp. 109-110" ] .
```

A query that ignores `plato:negated` reads a denial as an assertion, the opposite of what the
source says. Every query below that lists facts excludes negated attestations.

---

## Identity

That two records describe the same place is a claim like any other, never a settled fact. It is a
`plato:IdentityRelation`, with `plato:identity_subject`, `plato:identity_object` and a
`plato:identity_type` of `exactMatch`, `closeMatch`, `related` or `unspecified`. WHG does not merge
records or mint new identifiers because of one. `owl:sameAs`, which would make the two IRIs
interchangeable for every reasoner, is not used for it.

Identity relations asserted together, as when someone accepts a set of suggested matches, are
bundled in one attestation with `plato:attests_identity`, which gives them one source, date and
contributor and lets them be withdrawn together. Software may chain `exactMatch` relations (A is
B, B is C, so A is C) only within one such attestation, never across attestations and never for
the other identity types. The same attestation with `plato:negated`, bundling one `exactMatch`,
says that two records are *not* the same place.

PLATO's `examples/identity-judgements.ttl` shows both. An editor accepts two suggested matches in
one act, so one attestation bundles both `exactMatch` relations, each recording the candidate it
was promoted from (lines 113–133):

```turtle
whgx:attestation\/newton-cluster-1
    a plato:Attestation ;
    plato:attests_about whgx:entity\/newton-by-the-river ;
    plato:attests_identity whgx:identity\/river-mill-1 , whgx:identity\/river-upland-1 ;
    plato:sourced_by whgx:source\/review-2026-09-10 ;
    plato:contributed_by whgx:contributor\/editor ;
    plato:created "2026-09-10T11:00:00Z"^^xsd:dateTime .

whgx:identity\/river-mill-1
    a plato:IdentityRelation ;
    plato:identity_subject whgx:entity\/newton-by-the-river ;
    plato:identity_object whgx:county-survey\/newton-mill ;
    plato:identity_type "exactMatch" ;
    plato:promoted_from whgx:candidate\/c1 .

whgx:identity\/river-upland-1
    a plato:IdentityRelation ;
    plato:identity_subject whgx:entity\/newton-by-the-river ;
    plato:identity_object whgx:county-survey\/newton-upland ;
    plato:identity_type "exactMatch" ;
    plato:promoted_from whgx:candidate\/c2 .
```

Within this attestation, and only here, software may conclude that Newton Mill and Newton Upland
are the same place. The editor later withdraws this act (see [Meta-attestations](#meta-attestations)),
restates the correct matches, one attestation each, and records that the gazetteer's two Newtons
are different places (lines 206–219):

```turtle
whgx:attestation\/newtons-distinct-2026-09-12
    a plato:Attestation ;
    plato:attests_about whgx:entity\/newton-on-the-hill ;
    plato:negated true ;
    plato:attests_identity whgx:identity\/hill-river-denied ;
    plato:sourced_by whgx:source\/review-2026-09-12 ;
    plato:contributed_by whgx:contributor\/editor ;
    plato:created "2026-09-12T09:10:00Z"^^xsd:dateTime .

whgx:identity\/hill-river-denied
    a plato:IdentityRelation ;
    plato:identity_subject whgx:entity\/newton-on-the-hill ;
    plato:identity_object whgx:entity\/newton-by-the-river ;
    plato:identity_type "exactMatch" .
```

An identity relation asserted on its own, not bundled, carries its provenance itself
(`plato:identity_basis`, `plato:identity_asserted_by`, `plato:identity_sourced_by`). From
`examples/constantinople.ttl` (lines 242–247):

```turtle
whgx:identity\/constantinople-geonames
    a plato:IdentityRelation ;
    plato:identity_subject whgx:entity\/constantinople ;
    plato:identity_object <https://sws.geonames.org/745044/> ;
    plato:identity_type "closeMatch" ;
    plato:identity_basis "GeoNames describes the modern city: the same settlement, with a different extent." .
```

A **candidate** match, as suggested by an algorithm (for instance during Map your Data
reconciliation), is a `plato:Candidate`, not an identity relation. It is a suggestion awaiting
review, with its own score and `plato:match_parameters`; an identity relation made from one
records it with `plato:promoted_from`.

---

## Meta-attestations

An attestation can comment on another attestation. It points at its target with
`plato:meta_attestation_about` and says how with `plato:has_meta_type`, whose values are concepts
in PLATO's `plato:MetaTypeScheme`:

| Meta type | The meta-attestation… |
|---|---|
| `plato:Contradicts` | says the target is wrong |
| `plato:Supports` | gives further evidence for the target |
| `plato:Supersedes` | replaces the target with newer information |
| `plato:Refines` | gives more precise information than the target |
| `plato:Challenges` | questions the target |
| `plato:Bundles` | groups the target with related attestations |
| `plato:DerivedFrom` | has a value derived from the target's (a normalised form from an attested spelling) |
| `plato:Annotates` | adds a remark, in its `plato:notes`, without supporting or contradicting |
| `plato:AlternativeTo` | is another reading of the same evidence; at most one of the two is right |
| `plato:Retracts` | withdraws the target, which is kept so that earlier states can be reproduced |

From `examples/survey-attestations.ttl` (lines 233–240), a normalised search form derived from an
attested spelling:

```turtle
whgx:attestation\/bunsty-bunstowe-normalised
    a plato:Attestation ;
    plato:attests_about whgx:entity\/bunsty ;
    plato:attests_name whgx:name\/bunstowe ;
    plato:sourced_by whgx:dataset\/deep ;
    plato:form_status plato:Normalised ;
    plato:meta_attestation_about whgx:attestation\/bunsty-bunstowe-attested ;
    plato:has_meta_type plato:DerivedFrom .
```

Once a gazetteer is published its attestations are never deleted or changed. A correction is a new
attestation that supersedes or contradicts the old one; a withdrawal is one that retracts it. Each
carries `plato:created`, so the state of the data at any date can be worked out from the data
itself (query 6 below). From `examples/identity-judgements.ttl` (lines 149–156), the editor
withdraws the act above, both its matches together, after finding one of them wrong:

```turtle
whgx:attestation\/newton-cluster-1-retracted
    a plato:Attestation ;
    plato:meta_attestation_about whgx:attestation\/newton-cluster-1 ;
    plato:has_meta_type plato:Retracts ;
    plato:sourced_by whgx:source\/review-2026-09-12 ;
    plato:contributed_by whgx:contributor\/editor ;
    plato:notes "The tithe maps put Newton Upland on the hill, not by the river: the second match was wrong. The first is restated below." ;
    plato:created "2026-09-12T09:00:00Z"^^xsd:dateTime .
```

The retraction carries no `plato:attests_about`. A meta-attestation need not: it is about its
target, and through it about the target's SpatialEntity. Where one does carry it, as the
normalised form above does, it should be the target's.

---

## Provenance

Every attestation says what it rests on and who recorded it:

- **`plato:sourced_by`** points to an Authority, usually a `plato:Source` or `plato:Dataset`. It
  means what PROV-O's `prov:wasDerivedFrom` means, but is not declared as its subproperty.
- **`plato:has_citation`** points to a `plato:Citation`, where there is something to say about the
  citation itself: the page or folio (`plato:locator`), whether the attribution was stated or
  inferred, and why the source is cited (`plato:citation_function`, a CiTO property such as
  `cito:citesAsEvidence`). The ontology derives `sourced_by` from `has_citation` and `cites`;
  data meant for consumers without a reasoner should state both. The queries below follow either
  path.
- **`plato:contributed_by`** points to a `plato:Contributor`, identified by ORCID where possible,
  and **`plato:created`** says when the attestation was made.
- A source's own date is `plato:source_timespan`, and an edition or derived table points to what
  it was made from with `plato:derived_from`.

From `examples/antonine-routes.ttl` (lines 85–89), a citation shared by several attestations:

```turtle
whgx:antonine\/citation\/wess-473
    a plato:Citation ;
    plato:cites whgx:antonine\/source\/parthey-pinder-1848 ;
    plato:locator "p. 225, Wess. 473" ;
    plato:citation_function cito:citesAsEvidence .
```

A **Gazetteer** (a WHG dataset or collection) is a `plato:Gazetteer`, a subclass of
`dcat:Dataset`. It is titled with `dcterms:title`, licensed with `dcterms:license`, versioned with
`dcat:version`, and lists what it holds with `plato:contains_entity`,
`plato:contains_attestation` and `plato:contains_identity_relation`. A group of gazetteers is a
`plato:GazetteerGroup`, joined with `plato:member_of_group` (see
[Gazetteer groups](patterns.md#gazetteer-groups)). Cite a place as its IRI plus the gazetteer
version.

A value that software worked out from other data (an itinerary's span from its stops' dates) is
marked `plato:computed true`, and is not evidence (see
[Computed values](patterns.md#computed-values-platocomputed)).

---

## Querying with SPARQL

% TODO(0.7.1-doi): add the 0.7.1 version DOI
These queries use only PLATO terms. Each was run with rdflib against PLATO's twelve example Turtle
files, as released in [PLATO
0.7.1](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.1)
(all versions: [doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313)), and the results shown are what they returned. Replace the example IRIs with WHG
identifiers to use them on WHG data.

### 1. The names of a place, with their dates and sources

```sparql
PREFIX plato: <https://w3id.org/plato#>

SELECT ?name ?language ?from ?to ?source ?certainty WHERE {
  ?att plato:attests_about <https://whgazetteer.org/example/entity/constantinople> ;
       plato:attests_name ?n .
  ?n plato:toponym ?name .
  OPTIONAL { ?n plato:language ?language }
  OPTIONAL { ?att plato:attests_timespan ?ts .
             OPTIONAL { ?ts plato:start_earliest ?from }
             OPTIONAL { ?ts plato:end_latest ?to } }
  OPTIONAL { ?att plato:sourced_by|(plato:has_citation/plato:cites) ?src .
             ?src plato:authority_title ?source }
  OPTIONAL { ?att plato:certainty ?certainty }
  FILTER NOT EXISTS { ?att plato:negated true }
}
ORDER BY ?from
```

Returns Βυζάντιον (grc, -0440 to -0420, Herodotus, Histories IV.144, 1.0), Constantinopolis (la,
0425 to 0450, Notitia Urbis Constantinopolitanae, 1.0) and İstanbul (tr, 2026-09-30 to 2026-09-30,
GeoNames, 1.0). Each date is when its source witnesses the name in use. These sources witness only their own
time, so it is the source's date, not the whole span in which the name was used.

### 2. Routes, itineraries, networks and segments

```sparql
PREFIX plato: <https://w3id.org/plato#>

SELECT ?entity ?kind WHERE {
  ?att plato:attests_about ?entity ;
       plato:attests_type/plato:type_identifier ?id .
  VALUES (?kindIRI ?kind) {
    ("https://w3id.org/plato#TypeRoute"     "route")
    ("https://w3id.org/plato#TypeItinerary" "itinerary")
    ("https://w3id.org/plato#TypeNetwork"   "network")
    ("https://w3id.org/plato#TypeSegment"   "segment")
  }
  FILTER (STR(?id) = ?kindIRI)
  FILTER NOT EXISTS { ?att plato:negated true }
}
ORDER BY ?kind ?entity
```

Returns four: King John's itinerary, the River Idle (a network), Iter III (a route) and the road
from Londinium to Durobrivae (a segment). The Datini network is not among them because the
Datini Turtle excerpt includes no Type attestation for it.

### 3. The members of an itinerary, in order

```sparql
PREFIX plato: <https://w3id.org/plato#>
PREFIX rdfs:  <http://www.w3.org/2000/01/rdf-schema#>

SELECT ?seq ?member ?label ?from ?to WHERE {
  ?att plato:attests_about ?member ;
       plato:has_relation_type plato:MemberOf ;
       plato:relates_to <https://whgazetteer.org/example/king-john/place/itinerary-1215> .
  OPTIONAL { ?att plato:sequence ?seq }
  OPTIONAL { ?member rdfs:label ?label }
  OPTIONAL { ?att plato:attests_timespan ?ts .
             OPTIONAL { ?ts plato:start_earliest ?from }
             OPTIONAL { ?ts plato:end_latest ?to } }
  FILTER NOT EXISTS { ?att plato:negated true }
}
ORDER BY (!BOUND(?seq)) ?seq ?from
```

Returns Windsor (1), Runnymede (7), Windsor again (8), Marlborough (12), and Runnymede with no
sequence ("every day both at Windsor and at Runnemead", 18 to 23 June). The Isle of Wight, which
the source denies, is left out; without the `negated` filter it would be listed as a stop.

### 4. Meta-attestations: what comments on what

```sparql
PREFIX plato: <https://w3id.org/plato#>

SELECT ?meta ?metaType ?target ?note WHERE {
  ?meta plato:meta_attestation_about ?target ;
        plato:has_meta_type ?metaType .
  OPTIONAL { ?meta plato:notes ?note }
}
ORDER BY ?metaType
```

Returns three: a `DerivedFrom` (the normalised form "Bunstowe"), a `Refines` (the date at which
Karakorum ceased to be the Mongol capital) and a `Retracts` (the Newtons editor withdrawing the
matches accepted above).

### 5. Identity claims, and whether they were denied

```sparql
PREFIX plato: <https://w3id.org/plato#>

SELECT ?subject ?object ?identityType ?bundledIn ?denied WHERE {
  ?ir plato:identity_subject ?subject ;
      plato:identity_object ?object ;
      plato:identity_type ?identityType .
  OPTIONAL { ?bundledIn plato:attests_identity ?ir .
             OPTIONAL { ?bundledIn plato:negated ?negated } }
  BIND (COALESCE(?negated, false) AS ?denied)
}
```

Returns six: Constantinople `closeMatch` GeoNames 745044 (asserted on its own); the two
`exactMatch` relations bundled in the retracted act (`newton-cluster-1`); the two corrected matches,
each in an attestation of its own; and the two Newtons `exactMatch`, bundled in
`newtons-distinct-2026-09-12` and denied. This query does not leave out retracted attestations (query 6 shows how). Each row is
one contributor's claim; do not chain rows from different attestations together.

### 6. The current state: attestations not withdrawn or replaced

```sparql
PREFIX plato: <https://w3id.org/plato#>

SELECT ?att ?created WHERE {
  ?att plato:attests_about <https://whgazetteer.org/example/entity/newton-by-the-river> .
  OPTIONAL { ?att plato:created ?created }
  FILTER NOT EXISTS { ?att plato:meta_attestation_about ?any }
  FILTER NOT EXISTS {
    ?withdrawal plato:meta_attestation_about ?att ;
                plato:has_meta_type ?t .
    FILTER (?t IN (plato:Retracts, plato:Supersedes))
  }
}
```

Returns one attestation, `newton-river-mill`, the corrected match of Newton (by the river) to
Newton Mill. The act that first accepted two matches is left out because it is retracted; the
retraction is about that act, not the place, and would in any case be left out as a
meta-attestation. For the state
at a past date, also keep only attestations, and withdrawals, whose `plato:created` is on or
before that date. This simple form does not handle a retraction that is itself retracted.

---

## Checking RDF

PLATO publishes no SHACL shapes. To check PLATO RDF:

- parse it with any Turtle or N-Triples parser (rdflib, Apache Jena's `riot`);
- check it against the terms the ontology declares with the
  [PLATO tools](https://pelagios.org/plato-tools/), in the browser or with
  `npx github:pelagios/plato-tools check <file>`.

The RDF form of the ontology itself is at <https://w3id.org/plato> (Turtle, JSON-LD, RDF/XML and
N-Triples), and its reference documentation at <https://pelagios.org/place-attestation-ontology/>.

## See also

- [Data formats in and out](../guide/formats.md): which format to use
- [Identifiers and citation](../guide/identifiers.md): WHG's persistent identifiers
- [Routes, Itineraries, Networks, Groups and Periods](patterns.md) and
  [Routes and networks](../guide/routes-and-networks.md)
- [Attestations & Relations](attestations.md) and [Vocabularies](vocabularies.md)
- PLATO's [Linked data](https://pelagios.org/place-attestation-ontology/guide/linked-data.html) and
  [JSON formats](https://pelagios.org/place-attestation-ontology/guide/json.html) guides
