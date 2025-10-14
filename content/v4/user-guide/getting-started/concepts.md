# Understanding WHG Concepts

A comprehensive introduction to the key concepts underlying the World Historical Gazetteer.

## Note to Documentation Team

This page needs to balance depth with accessibility. Consider:
- Use diagrams extensively - the ER diagram from the data model should be simplified
- Each concept should have: definition, purpose, example, common questions
- Cross-link heavily to related documentation
- Consider a "concept map" showing relationships between concepts
- Include "why this matters" for researchers/users
- Add comparison to traditional gazetteers to clarify distinctions
- Interactive examples would be valuable (clickable diagrams showing attestation flows)
- Consider separate "technical" vs "user-friendly" concept explanations

---

## Overview

The World Historical Gazetteer is built on a fundamentally different model than traditional gazetteers. Rather than presenting a single "authoritative" record for each place, WHG captures the rich, contested, and temporally-situated nature of historical place knowledge.

## Core Entities

### Things

**Definition**: A Thing is anything that can be described - the primary entity in WHG's knowledge graph. This includes locations, historical entities, collections, periods, routes, itineraries, and networks.

**Key Properties**:
- Unique identifier (ID)
- Thing type (location, historical_entity, collection, period, route, itinerary, network)
- Description
- No inherent names, geometries, or temporal bounds - these are all asserted through attestations

**Why "Thing"?**

The term may seem informal, but it's intentionally general:
- **Future-proof**: Can describe any type of entity WHG might need
- **Interoperable**: Matches schema.org's root vocabulary term
- **Honest**: Acknowledges that historical entities resist rigid categorization

A Thing is the "conceptual" entity - the thing that existed in the world that people described in different ways at different times. Separating the Thing from its descriptions allows WHG to capture disagreement, uncertainty, and change.

**Example**:
```
Thing: [whg:12345]
Type: location
Description: "Major Byzantine/Ottoman city on the Bosphorus"

This Thing has multiple name attestations:
- "Byzantion" (Greek, -650 to 330 CE)
- "Constantinople" (Latin/Greek, 330 to 1930 CE)
- "Istanbul" (Turkish, 1453 to present)
- "Tsargrad" (Slavic, 800 to 1453 CE)
```

### Names

**Definition**: A name is a linguistic form by which a subject is known.

**Key Properties**:
- Name string (e.g., "القسطنطينية")
- Language (e.g., Arabic)
- Script (e.g., Arabic)
- Name type (e.g., toponym, ethnonym, chrononym)
- Transliteration (e.g., "al-Qusṭanṭīnīyah")
- IPA pronunciation
- Variant type
- Semantic embedding (for similarity search)

**Why This Matters**:
Names are linguistic artifacts, not just labels. WHG preserves:
- Original scripts
- Pronunciation information
- Cultural context (through language/script)
- Variant relationships (official vs colloquial, etc.)

**Example**:
```
Name: "Lutetia Parisiorum"
Language: Latin
Script: Latin
Name Type: toponym
Period: 50 BCE - 300 CE
Associated Subject: [Paris subject ID]
```

### Geometries

**Definition**: A geometry is a spatial representation of a subject at a particular time.

**Key Properties**:
- Geometric data (point, polygon, line, multi-geometry)
- Representative point (for mapping/searching)
- Convex hull
- Bounding box
- Precision indicators (spatial uncertainty)
- Source coordinate reference system

**Why This Matters**:
Historical places may have:
- **Uncertain locations**: We know roughly where, but not exactly
- **Changing locations**: A capital city may relocate
- **Multiple simultaneous locations**: Disputed borders, overlapping claims
- **Different granularities**: Point vs polygon vs region

WHG captures all of this.

**Example**:
```
Geometry 1: Point(40.4167, 49.8671)
  Precision: ±5km
  Timespan: 500-1200 CE
  Source: Archaeological survey
  
Geometry 2: Polygon(...)
  Precision: ±1km
  Timespan: 1200-1500 CE
  Source: Historical map digitization
```

### Timespans

**Definition**: A timespan represents when something was true.

**Key Properties**:
- Start earliest/latest (uncertainty in start date)
- Stop earliest/latest (uncertainty in end date)
- Label (human-readable, e.g., "Early Bronze Age")
- Precision descriptor (e.g., "century", "reign", "exact")

**Why This Matters**:
Historical dating is often uncertain. WHG models:
- **Fuzzy boundaries**: "sometime in the 7th century"
- **Ongoing states**: "from 1200 CE to present"
- **Null time**: "from geological prehistory" or "into the indefinite future"
- **Precision metadata**: How confident are we in these dates?

**Example**:
```
Timespan for "Angkor was the capital of the Khmer Empire"
  start_earliest: 802
  start_latest: 802
  stop_earliest: 1431
  stop_latest: 1432
  precision: "year"
  label: "Angkor period"
```

## The Attestation Model

### What is an Attestation?

**Definition**: An attestation is a claim that connects a Thing to some information, backed by one or more sources.

**Structure**:
```
[THING] --[RELATION_TYPE]--> [OBJECT]
    ^
    |
 backed by [SOURCES] with [CERTAINTY] during [TIMESPAN]
```

**Why This Matters**:
Attestations are the foundation of WHG's approach to knowledge representation. They allow:
- **Provenance**: Every piece of information cites its source(s)
- **Disagreement**: Multiple attestations can make conflicting claims
- **Uncertainty**: Attestations carry certainty assessments
- **Temporality**: Attestations are bounded by time
- **Historiography**: We can see who said what when about a Thing

### Attestation Anatomy

Every attestation includes:

1. **Thing**: What is being described?
2. **Relation Type**: What kind of claim? (has_name, has_geometry, has_type, etc.)
3. **Object**: The information being asserted (a name, geometry, classification, etc.)
4. **Source(s)**: Who says so? (bibliographic references, dataset IDs, contributors)
5. **Certainty**: How confident? (numerical + qualitative assessment)
6. **Timespan**: When was this true?
7. **Notes**: Additional context

### Relation Types

The **relation type** defines what kind of claim is being made:

#### Has-Type Relations
- `has_name`: Thing is known by this name
- `has_geometry`: Thing is located at this geometry
- `has_timespan`: Thing existed during this timespan
- `has_type`: Thing is classified as this type (e.g., "city", "battle site")

#### Network Relations
- `member_of`: Thing is part of a larger entity
- `contains`: Thing contains other entities
- `connected_to`: Thing is connected to another (e.g., trade route)

#### Equivalence Relations
- `same_as`: Thing is equivalent to another Thing (linking/reconciliation)

#### Sequential Relations (for Routes/Itineraries)
- `connected_to` with `sequence` attribute: Ordering places in a route

### Attestation Examples

**Example 1: Name Attestation**
```
Thing: [thing-Constantinople]
Relation: has_name
Object: Name("İstanbul", language="Turkish", script="Latin")
Source: ["Turkish Geographic Board decision", "1930"]
Certainty: 1.0 (certain)
Timespan: 1930-present
```

**Example 2: Geometric Attestation with Uncertainty**
```
Thing: [thing-OldSarai]
Relation: has_geometry
Object: Geometry(point=(47.5, 47.1), precision=±10km)
Source: ["Medieval Travel Account (Ibn Battuta)", "c.1340"]
Certainty: 0.6 (uncertain)
Certainty Note: "Description vague; location reconstructed from travel times"
Timespan: 1300-1400
```

**Example 3: Classification Attestation**
```
Thing: [thing-Ephesus]
Relation: has_type
Object: Classification("cult center", type="religious")
Source: ["Acts of the Apostles", "60-90 CE"]
Certainty: 0.9 (probable)
Timespan: 100 BCE - 400 CE
Notes: "Famous for Temple of Artemis"
```

**Example 4: Network Relation**
```
Thing: [thing-Samarkand]
Relation: connected_to
Object: [thing-Kashgar]
Source: ["Historical Atlas of Silk Roads"]
Connection Metadata: {type: "trade_route", name: "Silk Road"}
Timespan: 100 BCE - 1500 CE
``` Attestation**
```
Subject: [place-Ephesus]
Relation: has_type
Object: Classification("cult center", type="religious")
Source: ["Acts of the Apostles", "60-90 CE"]
Certainty: 0.9 (probable)
Timespan: 100 BCE - 400 CE
Notes: "Famous for Temple of Artemis"
```

**Example 4: Network Relation**
```
Subject: [place-Samarkand]
Relation: connected_to
Object: [place-Kashgar]
Source: ["Historical Atlas of Silk Roads"]
Connection Metadata: {type: "trade_route", name: "Silk Road"}
Timespan: 100 BCE - 1500 CE
```

### Meta-Attestations

**Definition**: An attestation about an attestation - commentary on other claims.

**Use Cases**:
- Scholarly debate: "Smith (2010) disputes Jones (2005) identification"
- Corrections: "This geometric claim is superseded by new archaeological evidence"
- Synthesis: "Multiple sources agree on this name during this period"

**Example**:
```
Thing: [attestation-456]
Relation: disputes
Object: [attestation-789]
Source: ["Johnson, Reassessing Medieval Capitals, 2020"]
Notes: "Archaeological evidence contradicts claimed timespan"
```

## Special Patterns

### Routes & Itineraries

**Definition**: An ordered sequence of Things connected by a journey.

**Implementation**: 
- Each leg is a `connected_to` attestation with a `sequence` attribute
- Sequence numbers define order (1, 2, 3...)
- Connection metadata can include travel time, distance, mode

**Example: Silk Road Segment**
```
Attestation 1:
Thing: [Chang'an]
Relation: connected_to (sequence=1)
Object: [Dunhuang]

Attestation 2:
Thing: [Dunhuang]
Relation: connected_to (sequence=2)
Object: [Kashgar]

Attestation 3:
Thing: [Kashgar]
Relation: connected_to (sequence=3)
Object: [Samarkand]
```

### Networks

**Definition**: A system of interconnected Things with relationship metadata.

**Types**:
- Trade networks (nodes = markets, edges = trade relationships)
- Religious networks (nodes = monasteries, edges = institutional connections)
- Kinship networks (nodes = family seats, edges = marriage alliances)
- Administrative networks (nodes = administrative centers, edges = hierarchical control)

**Key Features**:
- Connection metadata (type, directionality, weight/importance)
- Temporal dynamics (networks change over time)
- Multiple overlapping networks

### Collections

**Definition**: A curated set of Things grouped for analysis or presentation.

**Types**:
- Thematic (e.g., "Hanseatic League Cities")
- Geographic (e.g., "Ancient Mesopotamian Sites")
- Temporal (e.g., "13th Century Trading Posts")
- Project-based (e.g., "My Dissertation Research Sites")

**Key Features**:
- Can include Things from multiple datasets
- Can be public or private
- Can have metadata and descriptions
- Can be versioned/snapshots for citation

## Uncertainty & Certainty

WHG explicitly models uncertainty at multiple levels:

### Spatial Uncertainty
- Precision indicators (±5km, ±50km, etc.)
- Confidence regions (polygons of possible locations)
- Multiple competing geometries

### Temporal Uncertainty
- Fuzzy date boundaries (start_earliest ≠ start_latest)
- Precision descriptors ("century", "decade", "year")
- Open-ended spans ("from 1200 CE onward")

### Assertional Uncertainty
- Certainty scores (0.0 to 1.0)
- Certainty qualifiers ("probable", "uncertain", "disputed")
- Certainty notes explaining reasoning

### Source Uncertainty
- Source quality indicators
- Multiple conflicting sources
- Source_type vocabulary (primary, secondary, etc.)

## Controlled Vocabularies

WHG uses controlled vocabularies to ensure consistency:

- **Subject types**: city, settlement, monastery, battlefield, etc.
- **Name types**: toponym, chrononym, ethnonym, etc.
- **Source types**: primary_source, secondary_source, dataset, etc.
- **Temporal precision**: year, decade, century, geological_period, etc.
- **Spatial precision**: exact, approximate, uncertain, etc.
- **Connection types** (for networks): trade, kinship, religious, administrative, etc.

See [Controlled Vocabularies Reference](../reference/vocabularies.md) for full listings.

## Comparison to Traditional Gazetteers

| Traditional Gazetteer | WHG v4 |
|-----------------------|--------|
| Single name per place | Multiple names with temporal/cultural context |
| One "correct" location | Multiple geometries with uncertainty |
| Static attributes | Temporally-situated attestations |
| Implicit provenance | Explicit source citations |
| Authority-based | Evidence-based with multiple viewpoints |
| Synchronic | Diachronic |
| Place-centric | Relationship-aware |

## Implications for Users

### For Searchers/Browsers
- You may find multiple conflicting pieces of information - this is expected
- Check sources and certainty assessments
- Filter by time to see how information changes
- Expect ambiguity and competing claims

### For Contributors
- Cite your sources for every claim
- Assess certainty honestly
- Provide temporal context for all assertions
- Don't merge conflicting information - let it coexist

### For Researchers
- WHG preserves historiographic complexity
- You can trace scholarly disagreement
- Uncertainty is quantified and documented
- Network analysis reveals spatial-temporal patterns

## Further Reading

- [Data Model Technical Documentation](../../v4/data-model.html)
- [Attestations & Relations Details](../../v4/data-model/attestations.html)
- [Controlled Vocabularies Reference](../reference/vocabularies.md)
- [Understanding Place Records](../places/understanding-records.md)