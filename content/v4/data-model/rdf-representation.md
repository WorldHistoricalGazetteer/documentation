# RDF Representation

## Overview

The World Historical Gazetteer data model can be fully expressed in RDF (Resource Description Framework), providing interoperability with semantic web technologies and linked open data initiatives. This document explains how the attestation-based model maps to RDF triples.

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
- `dcterms:type` - Classification (place, period, person, event, polity, etc.)

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
- `whg:embedding` - Vector representation for semantic similarity search

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

A statement asserting a relationship between entities, grounded in primary sources. This is the foundational unit of the WHG model, capturing not just facts but provenance, certainty, and temporal context.

**Extends:** `prov:Entity`

**Properties:**
- `whg:subject` - The thing being described (references whg:Thing)
- `whg:subjectType` - Type of subject (thing, name, geometry, attestation)
- `whg:relationType` - The relationship type (has_name, has_geometry, etc.)
- `whg:object` - The related entity (Name, Geometry, Timespan, Thing, or classification)
- `whg:objectType` - Type of object (name, geometry, timespan, thing, classification)
- `whg:sequence` - Ordering for routes and itineraries
- `whg:connectionMetadata` - JSON object for network relationships (trade goods, flow direction, etc.)
- `whg:temporalScope` - When this relationship held (references whg:Timespan)
- `whg:certainty` - Confidence value (0.0-1.0)
- `whg:certaintyNote` - Explanation of uncertainty
- `whg:notes` - Additional context or commentary
- `prov:hadPrimarySource` - Source document(s) - array of Authority references
- `whg:sourceType` - Classification of source
- `dcterms:created` - Timestamp of attestation creation
- `dcterms:modified` - Timestamp of last modification
- `dcterms:contributor` - User or system that created attestation

## The Attestation Pattern

The key innovation in WHG's RDF model is the **attestation pattern**. Rather than directly asserting relationships (e.g., "Baghdad has name X"), we create attestation resources that document:

- **What** the relationship is (subject-predicate-object)
- **Who** attests to it (source)
- **When** it applies (temporal scope)
- **How certain** we are (certainty value and notes)

This reification pattern allows WHG to:

- Track multiple, potentially conflicting sources
- Represent scholarly uncertainty
- Model change over time
- Enable historiographical analysis

### Basic Structure

```turtle
ex:attestation_001 a whg:Attestation ;
                   whg:subject ex:some_thing ;
                   whg:subjectType "thing" ;
                   whg:relationType "has_name" ;
                   whg:object ex:some_name ;
                   whg:objectType "name" ;
                   whg:temporalScope ex:some_timespan ;
                   whg:certainty 0.8 ;
                   whg:certaintyNote "Based on fragmentary inscription" ;
                   prov:hadPrimarySource ex:some_source ;
                   whg:sourceType "archaeological" .
```

## Relation Types

The WHG model supports multiple relation types:

| Relation Type | Description |
|--------------|-------------|
| `has_name` | Thing has a name |
| `has_geometry` | Thing has a spatial representation |
| `has_timespan` | Thing has a temporal extent |
| `has_type` | Thing has a classification (links to controlled vocabularies like AAT) |
| `member_of` | Thing is part of another thing (administrative hierarchy, etc.) |
| `connected_to` | Things are connected (networks, routes, itineraries) |
| `same_as` | Things represent the same entity (linking across datasets) |

Custom relations can be defined for specific domains.

## Complete Example

The following example demonstrates the attestation-based model using Medieval Baghdad. This shows how a historical place with multiple names, changing geometries, and complex relationships is represented in RDF:

`````{literalinclude} rdf-examples/baghdad.ttl
:language: turtle
:linenos: true
:caption: Complete Baghdad example in Turtle format
`````

**Key features demonstrated:**

1. **Multiple names over time** - Arabic, Latin, and ceremonial names, each with attestations
2. **Changing geometries** - City extent in 762 CE vs. 1200 CE
3. **Uncertainty modeling** - Varying certainty values with explanatory notes
4. **Complex timespans** - Fuzzy temporal bounds for historical periods
5. **Relationships** - Baghdad connected to Basra, capital of Abbasid Caliphate
6. **Meta-attestations** - Documenting contradictions between sources
7. **External links** - Connections to Wikidata, Getty TGN, GeoNames

## Temporal Scoping

Any attestation can be temporally scoped to indicate when the relationship held:

```turtle
ex:timespan_001 a whg:Timespan ;
                whg:startEarliest "1200-01-01"^^xsd:date ;
                whg:startLatest "1250-12-31"^^xsd:date ;
                whg:endEarliest "1400-01-01"^^xsd:date ;
                whg:endLatest "1450-12-31"^^xsd:date ;
                whg:label "Roughly 13th-14th centuries" ;
                whg:precision "quarter-century" .
```

The four-point timespan model accommodates historical uncertainty about when periods begin and end.

## Certainty and Provenance

Every attestation includes:

- **certainty** - Float value 0.0-1.0 indicating confidence level
- **certaintyNote** - Optional text explanation of uncertainty
- **prov:hadPrimarySource** - Link to source document/dataset
- **sourceType** - Classification of source (chronicle, map, archaeological, etc.)

Example:

```turtle
ex:attestation_002 a whg:Attestation ;
                   whg:certainty 0.6 ;
                   whg:certaintyNote "Two chronicles give different dates; split the difference" ;
                   prov:hadPrimarySource ex:chronicle_a, ex:chronicle_b ;
                   whg:sourceType "chronicle" .
```

## Meta-Attestations

Attestations can themselves be subjects of other attestations, enabling documentation of:

- Contradictions between sources
- Scholarly debates
- Corrections and updates
- Relationships between evidence

```turtle
ex:attestation_099 a whg:Attestation ;
                   whg:subject ex:attestation_001 ;
                   whg:subjectType "attestation" ;
                   whg:relationType "contradicts" ;
                   whg:object ex:attestation_002 ;
                   whg:notes "Source A claims founding in 762, Source B claims 765" .
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

## Geometry Formats: WKT and GeoJSON

WHG supports both WKT (Well-Known Text) and GeoJSON for geometry representation to ensure maximum interoperability:

### WKT Format (GeoSPARQL Standard)

For use with GeoSPARQL-enabled triplestores and spatial query engines:

```turtle
ex:baghdad a geo:Feature ;
           geo:hasGeometry [
                 a geo:Geometry ;
                 geo:asWKT "POINT(44.3661 33.3152)"^^geo:wktLiteral
             ] .
```

### GeoJSON Format (LPF Compatible)

For web applications and JSON-LD consumers:

```turtle
ex:baghdad a lpf:Place ;
           lpf:geometry [
                 a geojson:Point ;
                 geojson:coordinates "44.3661, 33.3152"
             ] .
```

### Conversion Between Formats

When exporting WHG data:

- **For GeoSPARQL triplestores**: Use WKT format with proper `geo:Feature` and `geo:Geometry` classes
- **For LPF/JSON-LD**: Use GeoJSON format with LPF patterns
- **For maximum compatibility**: Include both representations

Contributors may submit geometries in either format. WHG will convert between formats as needed for different export targets.

## Comparison with Other Models

### vs. Geoscience Australia Placenames Ontology

The GA ontology is designed for **official gazetteers** with formal naming authorities:

**GA Ontology emphasizes:**
- Current administrative status
- Gazette dates
- Official naming authorities

**WHG attestation-based model emphasizes:**
- Multiple competing sources
- Temporal change
- Uncertainty and scholarly debate
- Provenance tracking

Both are valid RDF models serving different purposes.

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
SELECT ?name ?source ?certainty WHERE {
    ?attestation whg:subject ex:baghdad ;
                whg:relationType "has_name" ;
                whg:object ?name_entity ;
                whg:certainty ?certainty ;
                prov:hadPrimarySource ?source .
    ?name_entity whg:nameString ?name .
}
```

### Find contradictions between sources

```sparql
SELECT ?att1 ?att2 ?note WHERE {
    ?meta_att whg:subject ?att1 ;
             whg:relationType "contradicts" ;
             whg:object ?att2 ;
             whg:notes ?note .
}
```

### Find things with uncertain locations

```sparql
SELECT ?thing ?geometry ?certainty ?note WHERE {
    ?attestation whg:subject ?thing ;
                whg:relationType "has_geometry" ;
                whg:object ?geometry ;
                whg:certainty ?certainty ;
                whg:certaintyNote ?note .
    FILTER (?certainty < 0.8)
}
```

### Spatial query with GeoSPARQL

```sparql
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
PREFIX geof: <http://www.opengis.net/def/function/geosparql/>

SELECT ?place ?geom WHERE {
    ?place geo:hasGeometry ?geom .
    ?geom geo:asWKT ?wkt .
    FILTER(geof:sfWithin(?wkt, "POLYGON(...)"^^geo:wktLiteral))
}
```

## Implementation Notes

### Internal Storage vs. Export

Our recommended architecture:

1. **Store data internally** in ArangoDB using JSON for performance
2. **Provide RDF export** in multiple serializations (JSON-LD, Turtle, RDF/XML)
3. **Support SPARQL endpoint** for semantic web integration

This gives you:

✓ Performance benefits of graph database  
✓ Flexibility of document model  
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
@prefix ex: <http://your-project.org/data/> .

ex:my_place a whg:Thing ;
    dcterms:identifier "your-id" ;
    dcterms:type "place" ;
    dcterms:description "Historical site in Mesopotamia" .

ex:my_place_geom a geo:Geometry ;
    geo:asWKT "POINT(44.4 33.3)"^^geo:wktLiteral .

ex:att_001 a whg:Attestation ;
    whg:subject ex:my_place ;
    whg:relationType "has_geometry" ;
    whg:object ex:my_place_geom ;
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
                     sh:path [ sh:inversePath whg:subject ] ;
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