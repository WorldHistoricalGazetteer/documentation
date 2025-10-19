# RDF Representation

## Overview

The World Historical Gazetteer data model can be fully expressed in RDF (Resource Description Framework), providing interoperability with semantic web technologies and linked open data initiatives. This document explains how the graph-based attestation model maps to RDF triples.

### Why RDF?

RDF enables:

- **Interoperability** with other gazetteers and linked data resources
- **Semantic queries** using SPARQL across distributed datasets
- **Formal semantics** for reasoning and inference
- **Standard vocabularies** (GeoSPARQL, Time, PROV) for spatial/temporal data
- **Linked Open Data** publication and consumption

You can use WHG data without knowing RDF (JSON/LPF works fine), but RDF export provides powerful integration options.

## Core Ontology Classes

### whg:Thing

Any entity that can be attested in historical sources. This includes places, periods, people, events, polities, and any other entities of historical interest.

**Extends:** `owl:Thing`

**Properties:**
- `dcterms:identifier` - Unique identifier
- `dcterms:description` - Textual description
- `whg:thingType` - Classification (location, historical_entity, collection, period, route, itinerary, network)

### whg:Name

A name variant for a thing (toponym, chrononym, personal name, etc.). Names can be in different languages, scripts, and may have temporal scope.

**Properties:**
- `whg:nameString` - The actual name text with language tag
- `whg:language` - ISO 639-3 language code
- `whg:script` - ISO 15924 script code
- `whg:variant` - Relationship to other forms (official, colloquial, historical, etc.)
- `whg:transliteration` - Romanization or transliteration
- `whg:ipa` - International Phonetic Alphabet representation
- `whg:nameType` - Array of classifications (toponym, chrononym, ethnonym, etc.)
- `whg:embedding` - Vector representation for phonetic similarity search

### whg:Geometry

A spatial representation of a thing. Extends GeoSPARQL geometry to support temporal scoping and uncertainty.

**Extends:** `geo:Geometry`

**Properties:**
- `geo:asWKT` - Well-Known Text representation
- `geo:asGeoJSON` - GeoJSON representation (alternative to WKT)
- `whg:representativePoint` - Centroid or representative point for mapping/search
- `whg:hull` - Convex hull of the geometry
- `whg:bbox` - Bounding box array [min_lon, min_lat, max_lon, max_lat]
- `whg:precision` - Spatial precision descriptor (exact, approximate, uncertain)
- `whg:precisionKm` - Precision uncertainty radius in kilometers
- `whg:sourceCRS` - Source coordinate reference system (EPSG code or historical CRS)

### whg:Timespan

A temporal extent with support for uncertainty bounds. Based on the W3C Time Ontology but extended to handle historical imprecision.

**Extends:** `time:ProperInterval`

**Properties:**
- `whg:startEarliest` - Earliest possible start date
- `whg:startLatest` - Latest possible start date
- `whg:endEarliest` - Earliest possible end date
- `whg:endLatest` - Latest possible end date
- `whg:label` - Human-readable period name
- `whg:precision` - Temporal precision (year, decade, century, era, geological_period)
- `whg:precisionValue` - Numeric precision indicator

### whg:Attestation

### whg:Attestation

A node that bundles together claims about a Thing, linking it to Names, Geometries, Timespans, and other Things, all grounded in primary sources. This is the foundational unit of the WHG model, capturing not just facts but provenance, certainty, and temporal context.

**Extends:** `prov:Entity`

**Critical Clarification:** In the RDF representation, attestations are nodes (resources) that connect to other entities through predicates. This mirrors the internal graph database structure where attestations are documents in a document collection, with edges in a separate edge collection connecting them to other entities.

**Properties:**
- `whg:sequence` - Ordering for routes and itineraries
- `whg:connectionMetadata` - JSON object for network relationships (trade goods, flow direction, etc.)
- `whg:certainty` - Confidence value (0.0-1.0)
- `whg:certaintyNote` - Explanation of uncertainty
- `whg:notes` - Additional context or commentary
- `dcterms:created` - Timestamp of attestation creation
- `dcterms:modified` - Timestamp of last modification
- `dcterms:contributor` - User or system that created attestation

**Outgoing relationships** (expressed as predicates):
- `whg:attests` - Links to the Thing being attested (subject_of in graph)
- `whg:attestsName` - Links to Name entity (attests_name in graph)
- `whg:attestsGeometry` - Links to Geometry entity (attests_geometry in graph)
- `whg:attestsTimespan` - Links to Timespan entity (attests_timespan in graph)
- `whg:relatesTo` - Links to another Thing via custom relation (relates_to in graph)
- `whg:typedBy` - Links to Authority defining relation type (typed_by in graph)
- `prov:hadPrimarySource` - Links to Source Authority (sourced_by in graph)

### whg:Authority

Reference data for sources, datasets, relation types, periods, and certainty levels. Uses single table inheritance pattern via `whg:authorityType`.

**Properties:**
- `whg:authorityType` - Discriminator: "dataset", "source", "relation_type", "period", "certainty_level"
- `dcterms:title` - For datasets
- `dcterms:bibliographicCitation` - For sources
- `whg:recordId` - Source's ID in original dataset
- `rdfs:label` - For relation_types, periods, certainty_levels
- `owl:inverseOf` - For relation_types (bidirectional navigation)
- `rdfs:domain` - For relation_types: valid subject types
- `rdfs:range` - For relation_types: valid object types
- `dcterms:hasVersion` - For datasets
- `dcterms:publisher` - For datasets
- `dcterms:license` - For datasets
- `dcterms:identifier` - External URI (PeriodO, source URL, etc.)
- Timespan properties for periods (startEarliest, startLatest, endEarliest, endLatest)
- `whg:level` - For certainty_levels (0.0-1.0)
- `dcterms:description` - General description

## The Attestation Pattern in RDF

The key innovation in WHG's RDF model is representing **Attestations as nodes** rather than as reified statements. This aligns with the internal graph database structure where Attestations are vertices connected via edges.

**Architecture Note:** In the internal ArangoDB implementation, attestations are stored as documents in a standard document collection (not an edge collection), and all relationships are stored as edges in a separate edge collection. The RDF representation preserves this architecture by representing attestations as first-class resources (nodes) connected via RDF predicates (equivalent to edges).

### Graph-Based RDF Structure

In the WHG model, an Attestation is not just metadata about a triple—it's a first-class entity that acts as a hub connecting multiple resources:

```turtle
# The Attestation as a node (document in attestations collection)
ex:attestation_001 a whg:Attestation ;
    whg:certainty 0.95 ;
    whg:certaintyNote "Well-documented in multiple sources" ;
    dcterms:created "2024-01-15T10:30:00Z"^^xsd:dateTime ;
    dcterms:contributor "researcher@example.edu" .

# Edges connecting attestation to other entities
# (In RDF, these are predicates; in ArangoDB, these are edge documents)

# Thing to Attestation
ex:baghdad whg:attestedBy ex:attestation_001 .
# Or reverse direction:
ex:attestation_001 whg:attests ex:baghdad .

# Attestation to Name (via predicate/edge)
ex:attestation_001 whg:attestsName ex:name_baghdad .

# Attestation to Geometry (via predicate/edge)
ex:attestation_001 whg:attestsGeometry ex:geometry_762ce .

# Attestation to Timespan (via predicate/edge)
ex:attestation_001 whg:attestsTimespan ex:timespan_abbasid .

# Attestation to Source (via predicate/edge)
ex:attestation_001 prov:hadPrimarySource ex:source_al_tabari .
```

This pattern allows WHG to:

- Bundle multiple claims together (Name + Geometry + Timespan)
- Track multiple, potentially conflicting sources
- Represent scholarly uncertainty
- Model change over time
- Enable historiographical analysis

### Relation Types via Authority

For Thing-to-Thing relationships, the semantic meaning is expressed through Authority entities:

```turtle
# Member-of relationship via Authority
ex:attestation_005 a whg:Attestation ;
    whg:attests ex:changan ;
    whg:typedBy ex:authority_member_of ;
    whg:relatesTo ex:tang_dynasty .

ex:authority_member_of a whg:Authority ;
    whg:authorityType "relation_type" ;
    rdfs:label "member_of" ;
    owl:inverseOf ex:authority_contains ;
    rdfs:domain whg:Thing ;
    rdfs:range whg:Thing .
```

## Relation Type Vocabulary

Standard relation types (system-defined edges in the graph):

| RDF Predicate | Graph Edge Type | Description |
|--------------|----------------|-------------|
| `whg:attestsName` | `attests_name` | Attestation claims this Name |
| `whg:attestsGeometry` | `attests_geometry` | Attestation claims this Geometry |
| `whg:attestsTimespan` | `attests_timespan` | Attestation claims this Timespan |

Custom relation types (via Authority with `authorityType: "relation_type"`):

| Authority Label | CIDOC-CRM | Description |
|----------------|-----------|-------------|
| `member_of` | P46_is_composed_of (inverse) | Thing is part of another Thing |
| `contains` | P46_is_composed_of | Thing contains another Thing |
| `same_as` | P130_shows_features_of | Equivalence between Things |
| `succeeds` | P134_continued | Thing succeeded another Thing |
| `connected_to` | P122_borders_with (extended) | Thing connected to another Thing |
| `coextensive_with` | P121_overlaps_with | Thing spatially coextensive with another |

## Complete Example

The following example demonstrates the graph-based attestation model using Medieval Baghdad:

```turtle
@prefix whg: <http://whgazetteer.org/ontology/> .
@prefix geo: <http://www.opengis.net/ont/geosparql#> .
@prefix time: <http://www.w3.org/2006/time#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .
@prefix owl: <http://www.w3.org/2002/07/owl#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix ex: <http://whgazetteer.org/place/> .
@prefix exa: <http://whgazetteer.org/attestation/> .
@prefix exn: <http://whgazetteer.org/name/> .
@prefix exg: <http://whgazetteer.org/geometry/> .
@prefix ext: <http://whgazetteer.org/timespan/> .
@prefix exauth: <http://whgazetteer.org/authority/> .

# Thing: Baghdad
ex:baghdad a whg:Thing ;
    dcterms:identifier "whg:baghdad" ;
    whg:thingType "location" ;
    dcterms:description "Historical city, capital of Abbasid Caliphate" .

# Names
exn:baghdad_arabic a whg:Name ;
    whg:nameString "بغداد"@ar ;
    whg:language "ara" ;
    whg:script "Arab" ;
    whg:nameType "toponym" .

exn:baghdad_latin a whg:Name ;
    whg:nameString "Bagdad"@la ;
    whg:language "lat" ;
    whg:script "Latn" ;
    whg:nameType "toponym" .

exn:baghdad_madinat a whg:Name ;
    whg:nameString "Madinat al-Salam"@ar ;
    whg:language "ara" ;
    whg:script "Arab" ;
    whg:nameType "toponym" ;
    whg:variant "ceremonial" .

# Geometries
exg:baghdad_762 a geo:Geometry ;
    geo:asWKT "POINT(44.4 33.3)"^^geo:wktLiteral ;
    whg:precision "approximate" ;
    whg:precisionKm 5 .

exg:baghdad_1200 a geo:Geometry ;
    geo:asWKT "POLYGON((44.35 33.25, 44.45 33.25, 44.45 33.35, 44.35 33.35, 44.35 33.25))"^^geo:wktLiteral ;
    whg:precision "approximate" ;
    whg:precisionKm 2 .

# Timespans
ext:founding a whg:Timespan ;
    whg:startEarliest "0762-01-01"^^xsd:date ;
    whg:startLatest "0762-12-31"^^xsd:date ;
    whg:endEarliest "0762-01-01"^^xsd:date ;
    whg:endLatest "0762-12-31"^^xsd:date ;
    whg:label "Founding of Baghdad" ;
    whg:precision "year" .

ext:abbasid a whg:Timespan ;
    whg:startEarliest "0750-01-01"^^xsd:date ;
    whg:startLatest "0750-12-31"^^xsd:date ;
    whg:endEarliest "1258-01-01"^^xsd:date ;
    whg:endLatest "1258-12-31"^^xsd:date ;
    whg:label "Abbasid Caliphate period" ;
    whg:precision "year" .

# Sources (Authorities)
exauth:al_tabari a whg:Authority ;
    whg:authorityType "source" ;
    dcterms:bibliographicCitation "Al-Tabari, History of the Prophets and Kings" ;
    whg:recordId "tabari-vol-27" .

exauth:yaqut a whg:Authority ;
    whg:authorityType "source" ;
    dcterms:bibliographicCitation "Yaqut al-Hamawi, Mu'jam al-Buldan" ;
    whg:recordId "yaqut-baghdad" .

exauth:dataset_islamic a whg:Authority ;
    whg:authorityType "dataset" ;
    dcterms:title "Islamic Cities Database" ;
    dcterms:hasVersion "1.0" ;
    dcterms:identifier "doi:10.83427/whg-dataset-123" .

# Attestation 1: Arabic name with founding timespan
exa:att_001 a whg:Attestation ;
    whg:attests ex:baghdad ;
    whg:attestsName exn:baghdad_arabic ;
    whg:attestsTimespan ext:founding ;
    whg:certainty 0.95 ;
    whg:certaintyNote "Well-documented in multiple chronicles" ;
    prov:hadPrimarySource exauth:al_tabari ;
    dcterms:created "2024-01-15T10:30:00Z"^^xsd:dateTime ;
    dcterms:contributor "researcher@whg.org" .

# Attestation 2: Ceremonial name during Abbasid period
exa:att_002 a whg:Attestation ;
    whg:attests ex:baghdad ;
    whg:attestsName exn:baghdad_madinat ;
    whg:attestsTimespan ext:abbasid ;
    whg:certainty 0.9 ;
    whg:certaintyNote "Ceremonial name used in official documents" ;
    prov:hadPrimarySource exauth:yaqut ;
    dcterms:created "2024-01-15T10:35:00Z"^^xsd:dateTime .

# Attestation 3: Geometry at founding (762 CE)
exa:att_003 a whg:Attestation ;
    whg:attests ex:baghdad ;
    whg:attestsGeometry exg:baghdad_762 ;
    whg:attestsTimespan ext:founding ;
    whg:certainty 0.7 ;
    whg:certaintyNote "Location known, exact boundaries uncertain" ;
    prov:hadPrimarySource exauth:al_tabari ;
    dcterms:created "2024-01-15T10:40:00Z"^^xsd:dateTime .

# Attestation 4: Expanded geometry (1200 CE)
exa:att_004 a whg:Attestation ;
    whg:attests ex:baghdad ;
    whg:attestsGeometry exg:baghdad_1200 ;
    whg:certainty 0.6 ;
    whg:certaintyNote "City expanded, boundaries approximate" ;
    prov:hadPrimarySource exauth:yaqut ;
    dcterms:created "2024-01-15T10:45:00Z"^^xsd:dateTime .

# Thing-to-Thing relationship: Baghdad connected to Basra
ex:basra a whg:Thing ;
    dcterms:identifier "whg:basra" ;
    whg:thingType "location" .

exauth:connected_to a whg:Authority ;
    whg:authorityType "relation_type" ;
    rdfs:label "connected_to" ;
    rdfs:domain whg:Thing ;
    rdfs:range whg:Thing ;
    dcterms:description "Places connected by trade or communication" .

exa:att_005 a whg:Attestation ;
    whg:attests ex:baghdad ;
    whg:typedBy exauth:connected_to ;
    whg:relatesTo ex:basra ;
    whg:connectionMetadata """{
        "connection_type": "trade",
        "directionality": "bidirectional",
        "commodity": ["dates", "textiles"]
    }"""^^xsd:string ;
    whg:certainty 0.85 ;
    prov:hadPrimarySource exauth:yaqut .

# Meta-attestation: One attestation contradicts another
exa:att_meta_001 a whg:Attestation ;
    whg:attests exa:att_001 ;
    whg:typedBy exauth:contradicts ;
    whg:relatesTo exa:att_002 ;
    whg:notes "Sources disagree on which name was used officially in 762 CE" ;
    prov:hadPrimarySource exauth:modern_scholarship .

# Meta-attestation connecting two attestations
exauth:contradicts a whg:Authority ;
    whg:authorityType "relation_type" ;
    rdfs:label "contradicts" .

exa:att_meta_001 a whg:Attestation ;
    whg:attests exa:att_001 ;
    whg:typedBy exauth:contradicts ;
    whg:relatesTo exa:att_002 ;
    whg:notes "Sources disagree on which name was used officially in 762 CE" ;
    prov:hadPrimarySource exauth:modern_scholarship .  

exauth:modern_scholarship a whg:Authority ;
    whg:authorityType "source" ;
    dcterms:bibliographicCitation "Kennedy, Hugh. Baghdad: City of Peace, City of Blood" .

# External links
ex:baghdad owl:sameAs <http://www.wikidata.org/entity/Q1530> ,
                      <http://vocab.getty.edu/tgn/7001896> ,
                      <http://sws.geonames.org/98182/> .
```

**Note:** Meta-attestations in RDF use the same pattern as other attestations. The `whg:typedBy` predicate links to an authority that defines the meta-relationship type (contradicts, supports, supersedes, etc.). In the internal graph database, this is represented as an edge with `edge_type: "meta_attestation"` and a `properties.meta_type` field.

**Key features demonstrated:**

1. **Attestations as nodes** - Not reified statements, but first-class entities
2. **Multiple names over time** - Each with separate attestations
3. **Changing geometries** - City extent in 762 CE vs. 1200 CE
4. **Uncertainty modeling** - Varying certainty values with explanatory notes
5. **Complex timespans** - Separate timespan entities
6. **Thing-to-Thing relationships** - Via Authority-based relation types
7. **Meta-attestations** - Documenting contradictions between sources
8. **External links** - Connections to Wikidata, Getty TGN, GeoNames

## Temporal Scoping

Attestations link to Timespan entities to indicate when relationships held:

```turtle
ext:timespan_001 a whg:Timespan ;
    whg:startEarliest "1200-01-01"^^xsd:date ;
    whg:startLatest "1250-12-31"^^xsd:date ;
    whg:endEarliest "1400-01-01"^^xsd:date ;
    whg:endLatest "1450-12-31"^^xsd:date ;
    whg:label "Roughly 13th-14th centuries" ;
    whg:precision "quarter-century" .

exa:att_temporal a whg:Attestation ;
    whg:attests ex:some_thing ;
    whg:attestsName ex:some_name ;
    whg:attestsTimespan ext:timespan_001 .
```

The four-point timespan model accommodates historical uncertainty about when periods begin and end.

## Certainty and Provenance

Every attestation includes:

- **certainty** - Float value 0.0-1.0 indicating confidence level
- **certaintyNote** - Optional text explanation of uncertainty
- **prov:hadPrimarySource** - Link to Source Authority
- Authority's `authorityType` indicates source classification

Example:

```turtle
exa:att_002 a whg:Attestation ;
    whg:certainty 0.6 ;
    whg:certaintyNote "Two chronicles give different dates; split the difference" ;
    prov:hadPrimarySource exauth:chronicle_a, exauth:chronicle_b .

exauth:chronicle_a a whg:Authority ;
    whg:authorityType "source" ;
    dcterms:bibliographicCitation "Chronicle A, 12th century manuscript" .
```

## Meta-Attestations

Attestations can themselves be subjects of other attestations, enabling documentation of:

- Contradictions between sources
- Scholarly debates
- Corrections and updates
- Relationships between evidence

```turtle
exauth:contradicts a whg:Authority ;
    whg:authorityType "relation_type" ;
    rdfs:label "contradicts" .

exa:att_099 a whg:Attestation ;
    whg:attests exa:att_001 ;
    whg:typedBy exauth:contradicts ;
    whg:relatesTo exa:att_002 ;
    whg:notes "Source A claims founding in 762, Source B claims 765" ;
    prov:hadPrimarySource exauth:modern_analysis .
```

## Integration with Existing Ontologies

The WHG RDF model builds on standard semantic web vocabularies:

| Ontology | Purpose |
|----------|---------|
| **GeoSPARQL** | Spatial representations and geometric relationships |
| **W3C Time** | Temporal modeling with intervals and instants |
| **W3C PROV** | Provenance and attribution |
| **Dublin Core** | Basic metadata (title, creator, date, etc.) |
| **SKOS** | Concept schemes and controlled vocabularies |
| **OWL** | Ontology structure and logical relationships |

This ensures interoperability with existing linked data systems.

## Geometry Representation

WHG supports both WKT (Well-Known Text) and GeoJSON for geometry representation to ensure maximum interoperability with different tools and systems.

**GeometryCollection Limitation:** ArangoDB (the internal storage system) does not support the GeoJSON `GeometryCollection` type. For entities with heterogeneous geometries, create multiple geometry attestations—one per geometry type. This limitation does not affect RDF exports, which can represent GeometryCollections if needed, but contributors should structure their data using separate geometry attestations to ensure compatibility with the internal graph database.

### Standard Prefixes and Context

**Turtle prefixes:**

```turtle
@prefix geo: <http://www.opengis.net/ont/geosparql#> .
@prefix geojson: <https://purl.org/geojson/vocab#> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix lpf: <http://linkedpasts.org/vocab#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
```

**JSON-LD context:**

```json
{
  "@context": {
    "@version": 1.1,
    "type": "@type",
    "id": "@id",
    "geojson": "https://purl.org/geojson/vocab#",
    "Feature": "geojson:Feature",
    "FeatureCollection": "geojson:FeatureCollection",
    "geometry": {
      "@id": "geojson:geometry",
      "@type": "@json"
    },
    "properties": "geojson:properties",
    "geo": "http://www.opengis.net/ont/geosparql#",
    "hasGeometry": {
      "@id": "geo:hasGeometry",
      "@type": "@id"
    },
    "asWKT": {
      "@id": "geo:asWKT",
      "@type": "geo:wktLiteral"
    },
    "asGeoJSON": {
      "@id": "geo:asGeoJSON",
      "@type": "geo:geoJSONLiteral"
    },
    "dcterms": "http://purl.org/dc/terms/",
    "lpf": "http://linkedpasts.org/vocab#"
  }
}
```

### Dual Geometry Representation

To support both web mapping tools (which expect GeoJSON) and GeoSPARQL spatial queries (which expect WKT), WHG uses parallel geometry representations:

**JSON-LD format:**

```json
{
  "@context": "http://whgazetteer.org/contexts/lpf-geosparql.jsonld",
  "@id": "http://whgazetteer.org/place/12345",
  "type": "Feature",
  "properties": {
    "title": "Baghdad"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [44.4, 33.3]
  },
  "hasGeometry": {
    "@id": "http://whgazetteer.org/geom/12345",
    "@type": "geo:Geometry",
    "asWKT": "POINT(44.4 33.3)",
    "asGeoJSON": "{\"type\":\"Point\",\"coordinates\":[44.4,33.3]}"
  }
}
```

**Equivalent Turtle format:**

```turtle
ex:12345 a geojson:Feature ;
    dcterms:title "Baghdad" ;
    geojson:geometry "{\"type\":\"Point\",\"coordinates\":[44.4,33.3]}" ;
    geo:hasGeometry exg:12345 .

exg:12345 a geo:Geometry ;
    geo:asWKT "POINT(44.4 33.3)"^^geo:wktLiteral ;
    geo:asGeoJSON "{\"type\":\"Point\",\"coordinates\":[44.4,33.3]}"^^geo:geoJSONLiteral .
```

**Benefits of this approach:**

- ✅ **GeoJSON tools** see valid GeoJSON in the `geometry` property
- ✅ **GeoSPARQL engines** find proper `geo:hasGeometry` with WKT literals
- ✅ **No transformation needed** - both representations coexist
- ✅ **Standards compliant** - doesn't violate GeoJSON or GeoSPARQL specifications
- ⚠️ **Minor redundancy** - geometry stored twice, but storage cost is minimal

Contributors may submit data using either format (or both). WHG will ensure both representations are maintained for maximum interoperability.

## Comparison with Other Models

### vs. Linked Places Format (LPF)

LPF is already RDF! It uses JSON-LD syntax, which means it's both:

- Valid JSON (easy for developers)
- Valid RDF (semantic web compatible)

**WHG's approach:**

- **Accept LPF contributions** - JSON-LD with GeoJSON geometries
- **Accept Turtle contributions** - Native RDF with WKT or GeoJSON geometries
- **Export in multiple formats** - JSON-LD (LPF), Turtle, RDF/XML, N-Triples
- **GeoSPARQL-compliant export** - Proper `geo:Feature` patterns with WKT for triplestore compatibility

The attestation pattern can be expressed in any RDF serialization, and geometries can use either WKT or GeoJSON depending on the target system's needs.

## Querying with SPARQL

The RDF representation enables powerful SPARQL queries:

### Find all names for Baghdad across all sources

```sparql
PREFIX whg: <http://whgazetteer.org/ontology/>
PREFIX prov: <http://www.w3.org/ns/prov#>

SELECT ?name ?source ?certainty WHERE {
    ?attestation whg:attests <http://whgazetteer.org/place/baghdad> ;
                whg:attestsName ?name_entity ;
                whg:certainty ?certainty ;
                prov:hadPrimarySource ?source .
    ?name_entity whg:nameString ?name .
}
```

### Find contradictions between sources

```sparql
PREFIX whg: <http://whgazetteer.org/ontology/>

SELECT ?att1 ?att2 ?note WHERE {
    ?source_auth whg:authorityType "source" ;
                rdfs:label "contradicts" .
    ?meta_att whg:attests ?att1 ;
             whg:typedBy ?source_auth ;
             whg:relatesTo ?att2 ;
             whg:notes ?note .
}
```

### Find things with uncertain locations

```sparql
PREFIX whg: <http://whgazetteer.org/ontology/>

SELECT ?thing ?geometry ?certainty ?note WHERE {
    ?attestation whg:attests ?thing ;
                whg:attestsGeometry ?geometry ;
                whg:certainty ?certainty ;
                whg:certaintyNote ?note .
    FILTER (?certainty < 0.8)
}
```

### Spatial query with GeoSPARQL

```sparql
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>
PREFIX whg: <http://whgazetteer.org/ontology/>

SELECT ?place ?geom WHERE {
    ?attestation whg:attests ?place ;
                whg:attestsGeometry ?geom .
    ?geom geo:asWKT ?wkt .
    FILTER(geof:sfWithin(?wkt, "POLYGON(...)"^^geo:wktLiteral))
}
```

### Find all members of a period

```sparql
PREFIX whg: <http://whgazetteer.org/ontology/>

SELECT ?member ?period WHERE {
    ?member_auth whg:authorityType "relation_type" ;
                rdfs:label "member_of" .
    ?attestation whg:attests ?member ;
                whg:typedBy ?member_auth ;
                whg:relatesTo ?period .
}
```

## Implementation Notes

### Internal Storage vs. Export

Our recommended architecture:

1. **Store data internally** in ArangoDB using graph structure
2. **Provide RDF export** in multiple serializations (JSON-LD, Turtle, RDF/XML)
3. **Support SPARQL endpoint** for semantic web integration

This gives you:

✓ Performance benefits of native graph database  
✓ Flexibility of property graph model  
✓ Interoperability through RDF export

### Accepting Contributions

WHG accepts contributions in multiple formats:

**JSON-LD (LPF):**
- Standard Linked Places Format with GeoJSON geometries
- Best for most contributors
- Familiar to digital humanities researchers

**Turtle (.ttl):**
- Native RDF with WKT or GeoJSON geometries
- Best for semantic web researchers
- Enables direct reuse of existing RDF datasets
- Natural for complex ontological requirements

**Submission guidelines:**

1. Validate syntax using standard parsers (e.g., `rapper`, Apache Jena)
2. Ensure compliance with WHG ontology (see validation section)
3. Include proper provenance and source citations
4. Provide at least one attestation per Thing

**Example Turtle submission:**

```turtle
@prefix whg: <http://whgazetteer.org/ontology/> .
@prefix geo: <http://www.opengis.net/ont/geosparql#> .
@prefix prov: <http://www.w3.org/ns/prov#> .
@prefix ex: <http://your-project.org/data/> .

ex:my_place a whg:Thing ;
    dcterms:identifier "your-id" ;
    whg:thingType "location" ;
    dcterms:description "Historical site in Mesopotamia" .

ex:my_place_geom a geo:Geometry ;
    geo:asWKT "POINT(44.4 33.3)"^^geo:wktLiteral .

ex:my_source a whg:Authority ;
    whg:authorityType "source" ;
    dcterms:bibliographicCitation "Your source citation" .

ex:att_001 a whg:Attestation ;
    whg:attests ex:my_place ;
    whg:attestsGeometry ex:my_place_geom ;
    whg:certainty 0.9 ;
    prov:hadPrimarySource ex:my_source .
```

### Validation

Contributors should validate their submissions against:

1. **RDF syntax** - Standard Turtle parser (e.g., `rapper`, Apache Jena)
2. **WHG ontology** - SHACL shapes defining required patterns
3. **Domain rules** - Business logic (e.g., at least one attestation per thing)

Example SHACL constraint:

```turtle
whg:ThingShape a sh:NodeShape ;
               sh:targetClass whg:Thing ;
               sh:property [
                     sh:path [ sh:inversePath whg:attests ] ;
                     sh:minCount 1 ;
                     sh:message "Every Thing must have at least one Attestation" ;
                 ] .
```

### Tools

Recommended tools for working with WHG RDF data:

- **Apache Jena** - Java toolkit for RDF processing
- **RDFLib** - Python library for RDF
- **Protégé** - Ontology editor with visualization
- **YASGUI** - SPARQL query interface

## See Also

- [Data Model Overview](overview.md) - Overview of the WHG data model
- [Attestations](attestations.md) - Attestation patterns in detail
- [Contributions](contributions.md) - How to contribute data
- [Vocabularies](vocabularies.md) - Controlled vocabularies and type systems

## External Resources

- [W3C RDF Primer](https://www.w3.org/TR/rdf11-primer/)
- [GeoSPARQL Specification](http://www.opengis.net/doc/IS/geosparql/1.0)
- [W3C Time Ontology](https://www.w3.org/TR/owl-time/)
- [W3C PROV-O](https://www.w3.org/TR/prov-o/)
- [Linked Places Format Repository](https://github.com/LinkedPasts/linked-places-format)