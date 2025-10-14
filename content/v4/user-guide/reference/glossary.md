# Glossary

Definitions of key terms used in the World Historical Gazetteer.

## Note to Documentation Team

This glossary should be:
- Alphabetically organized with jump links
- Cross-referenced heavily (link related terms)
- Include examples for complex terms
- Indicate whether term is WHG-specific or general
- Include pronunciation guides for unusual terms
- Link to detailed documentation pages
- Consider visual aids for abstract concepts
- Include "see also" sections
- Make it searchable/filterable
- Keep definitions concise (2-3 sentences max)
- Add "technical" vs "user-friendly" definitions where appropriate
- Include common synonyms and related terms
- Mark deprecated or v3-specific terms clearly

---

## A

### Attestation
A source-backed claim that connects a Thing to information (name, geometry, type, etc.). Attestations are the fundamental unit of knowledge in WHG, capturing provenance, temporality, and uncertainty. *Example*: "The historical atlas states this Thing was called 'Lutetia' from 50 BCE to 300 CE" is an attestation.

See: [Understanding Attestations](../places/attestations.md), [Data Model: Attestations](../../v4/data-model/attestations.html)

### Authority File
An external reference system that provides authoritative identifiers for places (e.g., GeoNames, Pleiades, Library of Congress, Wikidata). WHG links to authority files to enable interoperability.

See: [External Authority Files](../reconciliation/authorities.md)

## B

### Bounding Box
A rectangular geographic area defined by minimum and maximum latitude/longitude coordinates, used to constrain spatial searches or describe the extent of a geometry. Format: [min_lon, min_lat, max_lon, max_lat].

See: [Spatial Search](../search/spatial-search.md)

## C

### Certainty
A quantitative (0.0-1.0) and qualitative (certain, probable, uncertain, speculative) assessment of confidence in an attestation. WHG explicitly models uncertainty rather than asserting false precision.

See: [Working with Uncertainty](../search/uncertainty.md), [Certainty Assessment](../../v4/data-model/vocabularies.html#certainty-assessment)

### Chrononym
A name derived from or referring to a time period (e.g., "Edo period Japan"). One type in the Name Type vocabulary.

See: [Name Type Vocabulary](../../v4/data-model/vocabularies.html#name-type-vocabulary)

### Classification
A categorical assignment of a place to a type or category (e.g., "city", "monastery", "battlefield"). WHG uses controlled vocabularies for consistency.

See: [Classifications & Types](../places/classifications.md), [Subject Classification Vocabulary](../../v4/data-model/vocabularies.html#subject-classification-vocabulary)

### Collection
A curated set of place records grouped for research, teaching, or thematic purposes. Collections can be public or private and contain places from multiple datasets.

See: [Working with Collections](../collections/overview.md)

### Contribution
Data submitted to WHG by a user or project, including new place records, edits to existing records, or curated collections.

See: [Contributing Data Overview](../contributing/overview.md)

### Controlled Vocabulary
A standardized set of terms used consistently across WHG to ensure data interoperability. Examples include place types, name types, temporal precision levels.

See: [Controlled Vocabularies Reference](vocabularies.md), [Data Model: Vocabularies](../../v4/data-model/vocabularies.html)

### Coordinate Reference System (CRS)
A framework for defining how coordinates relate to positions on Earth (e.g., WGS84, historical coordinate systems). WHG preserves original CRS but converts to WGS84 for display.

## D

### Dataset
A collection of place records contributed as a unit, typically from a single project, publication, or institution. Datasets maintain integrity and attribution as a group.

See: [Browsing Public Datasets](../collections/public-datasets.md)

### Diachronic
Concerned with changes over time; the opposite of synchronic. WHG is fundamentally diachronic, tracking how places change across history.

### Disambiguation
The process of distinguishing between places with the same or similar names (e.g., multiple "Alexandrias"). Reconciliation and context (temporal/spatial) enable disambiguation.

See: [Reconciliation Overview](../reconciliation/overview.md)

### DOI (Digital Object Identifier)
A persistent identifier assigned to datasets contributed to WHG, enabling formal citation in scholarly publications.

See: [Citation & Attribution](../export/citation.md)

## E

### Embedding
A numerical vector representation of a name or text that captures semantic meaning, enabling similarity search across languages and scripts. WHG uses embeddings to find similar place names.

See: [Embedding & Name Similarity](../advanced/embeddings.md)

### Equivalence Relation
An attestation asserting that two subjects are the same place (e.g., linking WHG record to external gazetteer record). Enables reconciliation and knowledge graph integration.

See: [Reconciliation Overview](../reconciliation/overview.md)

### Ethnonym
A name referring to a people or ethnic group (e.g., "Aztec", "Byzantine"). One type in the Name Type vocabulary.

See: [Name Type Vocabulary](../../v4/data-model/vocabularies.html#name-type-vocabulary)

## F

### False Negative
In reconciliation, incorrectly rejecting a match between two records that do represent the same place. Less problematic than false positives but creates duplicate records.

See: [Reconciliation Overview](../reconciliation/overview.md)

### False Positive
In reconciliation, incorrectly accepting a match between two records that represent different places. Creates erroneous data linkages.

See: [Reconciliation Overview](../reconciliation/overview.md)

### Fuzzy Matching
Matching algorithm that tolerates minor differences in spelling, allowing for typos, transliteration variations, and OCR errors.

## G

### Gazetteer
A geographic reference work or database providing information about places, typically including names, coordinates, and classifications. WHG is a temporal historical gazetteer.

### GeoJSON
A standard format for encoding geographic data structures using JSON, widely supported by mapping applications. WHG can import and export GeoJSON.

See: [Export Formats](../export/formats.md), [Data Formats](../contributing/formats.md)

### Geometry
A spatial representation of a place (point, polygon, line, multi-geometry). WHG allows multiple geometries per place to capture uncertainty and temporal change.

See: [Geometries & Locations](../places/geometries.md), [Data Model: Core Entities](../../v4/data-model/overview.html)

## H

### Has-Relation
Attestation type connecting a subject to its attributes (has_name, has_geometry, has_timespan, has_type). The most common attestation types in WHG.

See: [Relation Types](../../v4/data-model/attestations.html#relation-types)

### Hierarchical Relation
Attestation expressing containment or part-whole relationships (part_of, contains). Used for administrative hierarchies and geographic containment.

See: [Relations & Networks](../places/relations.md)

### Historiography
The study of how history has been written and interpreted. WHG captures historiographic complexity by preserving multiple scholarly perspectives as distinct attestations.

## I

### IPA (International Phonetic Alphabet)
A standardized system for representing pronunciation. WHG can store IPA representations of place names to aid pronunciation and scholarly analysis.

### Itinerary
An ordered sequence of places representing a journey or route. WHG models itineraries using sequential connection relations.

See: [Routes & Itineraries](../maps/routes.md), [Working with Routes & Itineraries](../contributing/routes.md)

## K

### Knowledge Graph
An interconnected network of entities (places) and relationships. WHG's attestation model creates a temporal, provenance-rich knowledge graph.

## L

### Linked Data
A method of publishing structured data on the web so it can be interconnected. WHG follows linked data principles through URIs, standard formats, and external linking.

### Linked Places Format (LPF)
A JSON-LD format for historical place data developed by WHG and Pelagios Network. WHG's primary data exchange format.

See: [Linked Places Format](../export/lpf.md), [LPF Specification](../../v4/data-model/contributions.html#relationship-to-linked-places-format-lpf)

### Locale
A specific language and region combination affecting how dates, numbers, and text are displayed (e.g., en-US, fr-FR).

## M

### Meta-Attestation
An attestation about another attestation, expressing scholarly debate, corrections, or commentary on claims. A future extension in the WHG data model.

See: [Meta-Attestations](../../v4/data-model/summary.html#meta-attestations)

### Multi-Geometry
A geometry composed of multiple separate parts (e.g., an archipelago represented as multiple polygons, a discontinuous empire).

## N

### Name Variant
An alternate form of a place name (historical, transliterated, translated, colloquial). WHG captures rich name variation with temporal and linguistic context.

See: [Names & Variants](../places/names.md)

### Network
A system of interconnected places with typed relationships. WHG supports trade networks, religious networks, administrative hierarchies, and custom network types.

See: [Network Visualization](../maps/networks.md), [Working with Networks](../contributing/networks.md)

## O

### Object (in attestation)
The information being asserted about a subject (a name, geometry, classification, or another subject). Part of the Subject-Relation-Object attestation structure.

See: [The Attestation Record](../../v4/data-model/attestations.html#the-attestation-record)

### OpenRefine
An open-source tool for data cleaning and transformation. WHG provides OpenRefine-compatible reconciliation service.

See: [Reconciliation API Usage](../reconciliation/api.md)

## P

### Pleiades
A community-built gazetteer of ancient places. WHG integrates Pleiades data and provides linking to Pleiades IDs.

### Precision (Spatial)
Indicator of geographic certainty (exact, approximate, uncertain). WHG captures spatial precision explicitly rather than implying false accuracy.

See: [Spatial Precision Vocabulary](../../v4/data-model/vocabularies.html#spatial-precision-vocabulary)

### Precision (Temporal)
Indicator of date certainty (year, decade, century, era, geological period). Acknowledges that historical dating is often imprecise.

See: [Temporal Precision Vocabulary](../../v4/data-model/vocabularies.html#temporal-precision-vocabulary)

### Primary Source
Original historical documents, texts, inscriptions, or archaeological evidence. Distinguished from secondary sources in WHG's source type vocabulary.

See: [Source Type Vocabulary](../../v4/data-model/vocabularies.html#source-type-vocabulary)

### Provenance
The origin and history of data, including who contributed it, when, from what sources, and how it has been modified. WHG maintains comprehensive provenance for all attestations.

See: [Attestations & Provenance](../places/attestations.md), [Provenance Tab](../places/record-anatomy.md#8-provenance-tab)

## R

### Reconciliation
The process of identifying whether a place in your dataset corresponds to an existing WHG record, and linking them if so. Central to WHG's knowledge graph approach.

See: [Reconciliation Overview](../reconciliation/overview.md)

### Relation Type
The kind of relationship expressed by an attestation (has_name, connected_to, part_of, same_as, etc.). WHG defines a controlled vocabulary of relation types.

See: [Relation Types](../../v4/data-model/attestations.html#relation-types)

### Representative Point
A single geographic point representing a place's location for mapping and search, even when the full geometry is a polygon or region. Typically the centroid.

### Route
An ordered path through multiple places, often representing travel, trade, or pilgrimage. WHG captures routes using sequential attestations.

See: [Routes & Itineraries](../maps/routes.md)

## S

### Same-As Relation
An equivalence attestation asserting two subjects represent the same place. Used for linking to external gazetteers and deduplication.

See: [Equivalence Relations](../places/relations.md)

### Script
The writing system used for a name (Latin, Arabic, Han, Cyrillic, etc.). WHG preserves names in original scripts and provides transliterations.

See: [Working with Scripts & Languages](../advanced/languages.md)

### Sequence
An ordering attribute used in route/itinerary attestations to specify the order of places along a path (1, 2, 3...).

See: [Routes & Itineraries](../maps/routes.md)

### Source Type
A classification of evidence (primary_source, secondary_source, dataset, map, etc.). Part of WHG's controlled vocabularies.

See: [Source Type Vocabulary](../../v4/data-model/vocabularies.html#source-type-vocabulary)

### Spatial Filter
A geographic constraint on search results, typically a bounding box or drawn region on a map.

See: [Spatial Search](../search/spatial-search.md)

### Subject
The entity being described in an attestation, typically a place. The "S" in WHG's Subject-Relation-Object attestation model.

See: [Core Entities](../../v4/data-model/overview.html), [Understanding WHG Concepts](../getting-started/concepts.md)

### Synchronic
Concerned with a single point in time; the opposite of diachronic. Traditional gazetteers are typically synchronic (modern), while WHG is diachronic.

## T

### Temporal Range
The time period during which something was true, defined by start and stop dates (which may be uncertain). Every attestation in WHG has a temporal range.

See: [Temporal Information](../places/temporal.md)

### Temporal Null
A special value representing unbounded time (from geological prehistory or into indefinite future). WHG handles temporal nulls in its data model.

See: [Handling Temporal Nulls](../../v4/data-model/implementation.html#handling-temporal-nulls-and-geological-time)

### Timespan
A WHG entity representing a temporal range with uncertainty indicators (start_earliest, start_latest, stop_earliest, stop_latest).

See: [Data Model: Core Entities](../../v4/data-model/overview.html)

### Toponym
A place name, as opposed to other name types (chrononym, ethnonym). The most common name type in WHG.

See: [Name Type Vocabulary](../../v4/data-model/vocabularies.html#name-type-vocabulary)

### Transliteration
A representation of text from one script in the characters of another script (e.g., Arabic names in Latin characters). WHG stores both original scripts and transliterations.

See: [Working with Scripts & Languages](../advanced/languages.md)

## U

### Uncertainty
The degree of doubt or imprecision in data. WHG explicitly models uncertainty in dates, coordinates, and assertions rather than implying false precision.

See: [Working with Uncertainty](../search/uncertainty.md), [Certainty & Uncertainty](../editing/certainty.md)

### URI (Uniform Resource Identifier)
A unique identifier for a resource, typically a URL. WHG assigns URIs to all place records (e.g., `https://whgazetteer.org/places/12345`).

## V

### Validation
The process of checking data for errors, completeness, and consistency before publication. WHG performs automated validation on all contributions.

See: [Validation & Quality Checks](../contributing/validation.md)

### Vespa
The search and storage engine underlying WHG v4, enabling complex temporal-spatial queries and vector similarity search.

See: [Implementation in Vespa](../../v4/data-model/implementation.html)

### Vocabulary
See **Controlled Vocabulary**

## W

### WGS84 (World Geodetic System 1984)
The standard coordinate reference system used by GPS and modern mapping. WHG converts all coordinates to WGS84 for display and querying.

### Wikidata
A free knowledge base providing structured data, including place information. WHG links to Wikidata QIDs when available.

## Related Terminology

### Geographic vs Geographic Information Science Terms
- **Gazetteer**: Geographic reference work
- **Geocoding**: Converting place names to coordinates (WHG does not do this automatically)
- **Georeferencing**: Assigning coordinates to spatial data
- **Spatial join**: Combining datasets based on location
- **Topology**: Spatial relationships between geometries

### Historical Research Terms
- **Prosopography**: Study of historical persons (often includes place data)
- **Paleography**: Study of historical handwriting
- **Epigraphy**: Study of inscriptions
- **Numismatics**: Study of coins (often includes place information)

### Data Science Terms
- **Entity resolution**: Identifying duplicate records (similar to reconciliation)
- **Record linkage**: Connecting records across datasets
- **Data cleaning**: Improving data quality
- **ETL (Extract, Transform, Load)**: Data pipeline process

### Linked Data Terms
- **RDF (Resource Description Framework)**: Data model for linked data
- **JSON-LD**: JSON format for linked data (used by LPF)
- **SPARQL**: Query language for RDF data
- **Triple**: Subject-predicate-object structure (similar to WHG attestation)

## Abbreviations

- **API**: Application Programming Interface
- **CRS**: Coordinate Reference System
- **CSV**: Comma-Separated Values
- **DOI**: Digital Object Identifier
- **GIS**: Geographic Information System
- **IPA**: International Phonetic Alphabet
- **JSON**: JavaScript Object Notation
- **LPF**: Linked Places Format
- **URI**: Uniform Resource Identifier
- **URL**: Uniform Resource Locator
- **WHG**: World Historical Gazetteer

## See Also

- [Understanding WHG Concepts](../getting-started/concepts.md) - Conceptual introduction
- [Data Model Documentation](../../v4/data-model.html) - Technical specification
- [Controlled Vocabularies Reference](vocabularies.md) - Complete vocabulary listings
- [FAQ](../troubleshooting/faq.md) - Common questions

---

**Can't find a term?** Search this documentation or ask on the [community forum].