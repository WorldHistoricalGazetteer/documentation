# Overview

This overview introduces how the WHG v4 data model uses Attestations as the cornerstone of its design. The sections that
follow detail the core entities (Things, Names, Geometries, Timespans) and how they interact through the attestation
pattern to create a rich, provenance-tracked knowledge graph capable of representing the full complexity of historical
geographic information.

## Core Entities

```{mermaid} ../../diagrams/v4_erd.mermaid
:align: center
:name: fig-data-model
:alt: Entity–relationship diagram for the WHG v4 data model.
:caption: Entity–relationship diagram for the WHG v4 data model.
```

<br>

## Core Design Philosophy

The WHG data model is built around a **property graph** structure where information is represented as:

- **Things**: Primary entities (locations, historical entities, collections, periods, routes, itineraries, networks)
- **Attributes**: Descriptions of Things (Names, Geometries, Timespans)
- **Attestations**: Source-backed claims connecting Things to attributes or other Things

This approach enables WHG to:

- Capture multiple scholarly perspectives
- Model uncertainty explicitly
- Preserve complete provenance
- Track temporal change
- Represent complex networks of relationships

## The Thing Entity

### What is a Thing?

A **Thing** is the primary entity in WHG - any object of scholarly interest that can be described and related to other
entities. The term "Thing" is borrowed from schema.org's root type, chosen for its generality and future-extensibility.

**Types of Things in WHG**:

- **Locations**: Geographic places (cities, regions, landmarks, etc.)
- **Historical entities**: Political entities, empires, states
- **Collections**: Curated sets of related Things
- **Periods**: Temporal spans with cultural/historical significance
- **Routes**: Ordered sequences of locations representing journeys
- **Itineraries**: Specific instances of travel along routes
- **Networks**: Systems of interconnected Things

### Why "Thing"?

The term may seem informal, but it offers crucial advantages:

**Generality**: Accommodates any type of entity without forcing artificial classifications. A medieval monastery might
be simultaneously a location, a religious institution, and a network node - "Thing" encompasses all these facets.

**Extensibility**: As WHG could eventually evolve to include new place-linked entity types (people, events, documents), "Thing" remains applicable
without terminology shifts.

**Interoperability**: Aligns with schema.org's vocabulary, facilitating linked data integration and semantic web
compatibility.

**Philosophical honesty**: Acknowledges that historical entities resist rigid categorization. What we call "Byzantium"
refers to a complex, evolving reality that was simultaneously a place, an empire, an idea, and a cultural sphere.

### Thing Structure

A Thing in WHG consists of:

```json
{
  "id": "whg:12345",
  "thing_type": "location",
  "description": "Major Byzantine/Ottoman city on the Bosphorus",
  "created": "2023-01-15T10:30:00Z",
  "modified": "2024-02-20T14:45:00Z"
}
```

**Key Properties**:

- `id`: Unique persistent identifier (URI)
- `thing_type`: Classification (location, historical_entity, collection, period, route, itinerary, network)
- `description`: Human-readable summary
- `created`, `modified`: Temporal metadata for curation

**Notably absent**: Names, coordinates, dates, types, relations. These are all **asserted through Attestations**, not
intrinsic to the Thing itself.

### The Separation Principle

WHG separates **the Thing itself** from **descriptions of the Thing**. This distinction is crucial:

**The Thing**: The abstract entity that existed/exists in reality
**Descriptions**: Claims about that Thing from various sources at various times

This enables WHG to:

- Accommodate disagreement (two sources, two different coordinate claims)
- Track change (names evolve, boundaries shift)
- Preserve provenance (who said what, when)
- Model uncertainty (tentative vs. confident claims)

**Example**:

- Thing ID `whg:12345` represents the conceptual city
- One attestation claims it was called "Byzantion" (-650 to 330 CE)
- Another attestation claims it was called "Constantinople" (330 to 1453 CE)
- Another attestation claims it was called "Istanbul" (1453 to present)
- All coexist; none overwrites the others

## Name Entity

A **Name** represents a linguistic form by which a Thing is known.

### Structure

```json
{
  "id": "name:67890",
  "name": "القسطنطينية",
  "language": "ara",
  "script": "Arab",
  "variant": "standard",
  "transliteration": "al-Qusṭanṭīnīyah",
  "ipa": "ʔalqustˤɑntˤiːnijːɐ",
  "name_type": [
    "toponym"
  ],
  "embedding": [
    0.123,
    -0.456,
    ...
  ]
}
```

**Key Properties**:

- `name`: The actual text in original script
- `language`: ISO 639-3 language code
- `script`: ISO 15924 script code
- `variant`: Relationship to other forms (official, colloquial, historical, etc.)
- `transliteration`: Romanization for searchability
- `ipa`: International Phonetic Alphabet representation
- `name_type`: Array of classifications (toponym, chrononym, ethnonym, etc.)
- `embedding`: Vector representation for semantic similarity search

### Name Types

WHG distinguishes several name types:

- **Toponym**: Geographic place name
- **Chrononym**: Period or era name
- **Ethnonym**: Name for a people or ethnic group
- **Demonym**: Name for inhabitants of a place

See [Vocabularies](vocabularies.md) for complete name type taxonomy.

## Geometry Entity

A **Geometry** represents a spatial location or extent of a Thing at a particular time.

### Structure

```json
{
  "id": "geom:11223",
  "geom": {
    "type": "Point",
    "coordinates": [
      28.9784,
      41.0082
    ]
  },
  "representative_point": {
    "type": "Point",
    "coordinates": [
      28.9784,
      41.0082
    ]
  },
  "hull": {
    "type": "Polygon",
    "coordinates": [
      [
        ...
      ]
    ]
  },
  "bbox": [
    28.9,
    41.0,
    29.0,
    41.1
  ],
  "precision": "approximate",
  "precision_km": 5,
  "source_crs": "EPSG:4326"
}
```

**Key Properties**:

- `geom`: GeoJSON geometry (Point, Polygon, LineString, Multi*)
- `representative_point`: Single point for mapping/search
- `hull`: Convex hull of the geometry
- `bbox`: Bounding box [min_lon, min_lat, max_lon, max_lat]
- `precision`: Spatial certainty indicator (exact, approximate, uncertain)
- `precision_km`: Uncertainty radius in kilometers
- `source_crs`: Original coordinate reference system (EPSG code or historical CRS)

### Geometry Formats

WHG supports both **GeoJSON** (for internal storage and LPF export) and **WKT** (Well-Known Text, for GeoSPARQL
compliance):

**GeoJSON format** (internal):

```json
{
  "type": "Point",
  "coordinates": [
    28.9784,
    41.0082
  ]
}
```

**WKT format** (RDF export):

```turtle

"POINT(28.9784 41.0082)"^^
geo:wktLiteral
        
```

This dual format support ensures:

- Web application compatibility (GeoJSON)
- Triplestore compatibility (WKT for GeoSPARQL queries)
- Seamless conversion between formats on export

### Why Multiple Geometries?

A single Thing may have multiple Geometries because:

- **Temporal change**: Borders expand, cities relocate
- **Uncertainty**: Multiple proposed locations
- **Source disagreement**: Conflicting geographic claims
- **Representation levels**: Point for searching, polygon for extent

Each Geometry is connected via an Attestation with temporal bounds and source citation.

**Important Note on GeometryCollection:** ArangoDB does not support the GeoJSON `GeometryCollection` type. For places with heterogeneous geometry sets (e.g., both point and polygon), store multiple geometry attestations—one per geometry type. This aligns naturally with the attestation model where each geometry claim is a separate evidential statement.

## Timespan Entity

A **Timespan** represents a temporal interval with explicit uncertainty modeling.

### Structure

```json
{
  "id": "time:33445",
  "start_earliest": "0802-01-01",
  "start_latest": "0802-12-31",
  "end_earliest": "1431-01-01",
  "end_latest": "1432-12-31",
  "label": "Angkor period",
  "precision": "year",
  "precision_value": 1
}
```

**Key Properties**:

- `start_earliest`, `start_latest`: Range of possible start dates
- `end_earliest`, `end_latest`: Range of possible end dates
- `label`: Human-readable period name
- `precision`: Temporal granularity (year, decade, century, era, geological_period)
- `precision_value`: Numeric precision indicator

**Field Naming Convention:** Internally, WHG uses `end_earliest` and `end_latest` for consistency with W3C Time Ontology and RDF representations. Some legacy documentation may reference `stop_earliest` and `stop_latest`, which are equivalent fields. Going forward, all documentation and implementations should use the "end" terminology for consistency.

### Modeling Temporal Uncertainty

The four-date model captures uncertainty:

- **Certain dates**: All four values identical
- **Uncertain start**: `start_earliest` ≠ `start_latest`
- **Uncertain end**: `end_earliest` ≠ `end_latest`
- **Fuzzy boundaries**: Wide ranges (e.g., "sometime in 7th century")

**Special values**:

- `null`: Unknown or inapplicable
- `-infinity`: From geological prehistory
- `+infinity`: Into indefinite future
- `present`: Current day (dynamic)

See [Implementation in Database](implementation.md#handling-temporal-nulls-and-geological-time) for details on null
handling.

## Attestation Entity

An **Attestation** is a source-backed claim connecting a Thing to an attribute (Name, Geometry, Timespan) or to another
Thing (relationship).

### Critical Clarification: Attestations as Document Collection

**Attestations are NODES (documents in a document collection), NOT edges.** This is a crucial architectural distinction:

- **Attestations collection**: A standard document collection containing attestation metadata
- **Edges collection**: A separate edge collection containing all graph relationships

The attestation model works through edges that connect attestation nodes to other entities. An attestation does not contain relationship fields—instead, it is connected to other entities through edges in the EDGE collection.

### Structure

```json
{
  "id": "att:55667",
  "sequence": null,
  "connection_metadata": null,
  "certainty": 0.95,
  "certainty_note": "Well-documented in primary chronicles",
  "notes": "Name used during Byzantine period",
  "created": "2023-01-15T10:30:00Z",
  "modified": "2024-02-20T14:45:00Z",
  "contributor": "researcher@example.edu"
}
```

**Key Properties**:

- `sequence`: Ordering for routes and itineraries
- `connection_metadata`: JSON object for network relationships (e.g., trade goods, flow direction)
- `certainty`: Confidence value (0.0-1.0)
- `certainty_note`: Explanation of uncertainty assessment
- `notes`: Additional context
- `created`, `modified`: Temporal metadata
- `contributor`: User or system that created the attestation

**What's NOT in the Attestation document:**
- No `thing_id` field
- No `relation_type` field  
- No `object_type` or `object_id` fields
- No `sources` array

These relationships are all expressed through **edges** in the EDGE collection:

```javascript
// Example edges connecting an attestation
{
  "_from": "things/constantinople",
  "_to": "attestations/att-001",
  "edge_type": "subject_of"
}

{
  "_from": "attestations/att-001",
  "_to": "names/konstantinoupolis",
  "edge_type": "attests_name"
}

{
  "_from": "attestations/att-001",
  "_to": "timespans/byzantine-period",
  "edge_type": "attests_timespan"
}

{
  "_from": "attestations/att-001",
  "_to": "authorities/source-chronicle",
  "edge_type": "sourced_by"
}
```

### Attestation Types via Edge Patterns

Attestations connect Things to different entity types through different edge patterns:

1. **Names**: Thing → Attestation (subject_of), Attestation → Name (attests_name)
2. **Geometries**: Thing → Attestation (subject_of), Attestation → Geometry (attests_geometry)
3. **Timespans**: Thing → Attestation (subject_of), Attestation → Timespan (attests_timespan)
4. **Classifications**: Thing → Attestation (subject_of), Attestation → Authority (typed_by with classification)
5. **Other Things**: Thing → Attestation (subject_of), Attestation → Authority (typed_by with relation_type), Attestation → Thing (relates_to)

### Special Attestation Features

**For Routes and Itineraries**:

- `sequence`: Integer indicating order of waypoints along a route

**For Networks**:

- `connection_metadata`: JSON storing relationship details (trade goods, volume, direction, etc.)

**For All Attestations**:

- Can reference a Timespan via edges to indicate temporal scope
- Support meta-attestations (attestations about other attestations) through edges

## Entity Relationships

Entities relate through **Attestations** and **Edges** (see [Attestations & Relations](attestations.md)):

```
Thing --[edge: subject_of]--> Attestation
Attestation --[edge: attests_name]--> Name
Attestation --[edge: attests_geometry]--> Geometry
Attestation --[edge: attests_timespan]--> Timespan
Attestation --[edge: relates_to]--> Thing (relationships)
Attestation --[edge: meta_attestation]--> Attestation (meta-attestations)
Attestation --[edge: sourced_by]--> Authority
```

Every connection includes:

- Edge type classification
- Optional edge properties
- Timestamp metadata

This creates a rich, provenance-tracked knowledge graph.

## Entity Lifecycle

### Creation

- Thing created with minimal information (ID, type, description)
- Attestations added to build out the entity
- Multiple contributors can add Attestations

### Evolution

- New Attestations add information
- Conflicting Attestations coexist
- Temporal Attestations track change
- Meta-Attestations comment on other Attestations

### Persistence

- Things are never deleted (only deprecated with explanation)
- Attestations are versioned
- Full provenance maintained
- Changes auditable

## Design Rationale

### Why This Model?

**Historical knowledge is complex**:

- Sources disagree
- Information changes over time
- Certainty varies
- Provenance matters

**Traditional models fail**:

- Single "truth" per field → loses scholarly debate
- No temporal context → obscures change
- No provenance → can't evaluate claims
- No uncertainty modeling → false precision

**The Attestation model succeeds**:

- ✅ Multiple perspectives coexist
- ✅ Everything is temporally situated
- ✅ Sources always cited
- ✅ Uncertainty explicitly captured
- ✅ Enables scholarly rigor

### Influences

This model draws from:

- **Linked Data / RDF**: Subject-predicate-object triples
- **Property Graphs**: Nodes and edges with properties
- **Temporal Databases**: Bitemporal modeling
- **Provenance Standards**: W3C PROV
- **Domain models**: Nomisma, Pelagios, Pleiades

### Trade-offs

**Complexity**: More complex than flat records

- **Mitigation**: Hide complexity in interfaces, provide simple views

**Query complexity**: Joining across attestations and edges

- **Mitigation**: Use graph database, provide query helpers

**Data entry burden**: More structures to create

- **Mitigation**: Make many fields optional, provide good defaults

**Benefits outweigh costs**: Richer, more honest, more scholarly.

## Next Steps

- **Attestations**: See [Attestations & Relations](attestations.md)
- **Vocabularies**: See [Controlled Vocabularies](vocabularies.md)
- **Use Cases**: See [Platform Use Cases](usecases.md)
- **Implementation**: See [Implementation in Database](implementation.md)
- **RDF Representation**: See [RDF Representation](rdf-representation.md)