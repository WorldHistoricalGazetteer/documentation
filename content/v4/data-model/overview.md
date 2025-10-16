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

## Timespan Entity

A **Timespan** represents a temporal interval with explicit uncertainty modeling.

### Structure

```json
{
  "id": "time:33445",
  "start_earliest": "0802-01-01",
  "start_latest": "0802-12-31",
  "stop_earliest": "1431-01-01",
  "stop_latest": "1432-12-31",
  "label": "Angkor period",
  "precision": "year",
  "precision_value": 1
}
```

**Key Properties**:

- `start_earliest`, `start_latest`: Range of possible start dates
- `stop_earliest`, `stop_latest`: Range of possible end dates (note: internal schema uses "stop", RDF export uses "end"
  for W3C Time compatibility)
- `label`: Human-readable period name
- `precision`: Temporal granularity (year, decade, century, era, geological_period)
- `precision_value`: Numeric precision indicator

### Modeling Temporal Uncertainty

The four-date model captures uncertainty:

- **Certain dates**: All four values identical
- **Uncertain start**: `start_earliest` ≠ `start_latest`
- **Uncertain end**: `stop_earliest` ≠ `stop_latest`
- **Fuzzy boundaries**: Wide ranges (e.g., "sometime in 7th century")

**Special values**:

- `null`: Unknown or inapplicable
- `-infinity`: From geological prehistory
- `+infinity`: Into indefinite future
- `present`: Current day (dynamic)

See [Implementation in Vespa](implementation.md#handling-temporal-nulls-and-geological-time) for details on null
handling.

## Attestation Entity

An **Attestation** is a source-backed claim connecting a Thing to an attribute (Name, Geometry, Timespan) or to another
Thing (relationship).

### Structure

```json
{
  "id": "att:55667",
  "thing_id": "whg:12345",
  "relation_type": "has_name",
  "object_type": "name",
  "object_id": "name:67890",
  "sequence": null,
  "connection_metadata": null,
  "sources": [
    "source:abc123"
  ],
  "certainty": 0.95,
  "certainty_note": "Well-documented in primary chronicles",
  "notes": "Name used during Byzantine period",
  "created": "2023-01-15T10:30:00Z",
  "modified": "2024-02-20T14:45:00Z",
  "contributor": "researcher@example.edu"
}
```

**Key Properties**:

- `thing_id`: References the Thing being described
- `relation_type`: Type of relationship (has_name, has_geometry, connected_to, etc.)
- `object_type`: Type of object (name, geometry, timespan, thing, classification)
- `object_id`: References the related entity
- `sequence`: Ordering for routes and itineraries
- `connection_metadata`: JSON object for network relationships (e.g., trade goods, flow direction)
- `sources`: Array of source Authority IDs
- `certainty`: Confidence value (0.0-1.0)
- `certainty_note`: Explanation of uncertainty assessment
- `notes`: Additional context
- `created`, `modified`: Temporal metadata
- `contributor`: User or system that created the attestation

### Attestation Types

Attestations connect Things to:

1. **Names**: `has_name` relation
2. **Geometries**: `has_geometry` relation
3. **Timespans**: `has_timespan` relation
4. **Classifications**: `has_type` relation (linking to controlled vocabularies)
5. **Other Things**: Various relationship types (member_of, connected_to, same_as, etc.)

### Special Attestation Features

**For Routes and Itineraries**:

- `sequence`: Integer indicating order of waypoints along a route

**For Networks**:

- `connection_metadata`: JSON storing relationship details (trade goods, volume, direction, etc.)

**For All Attestations**:

- Can reference a Timespan to indicate temporal scope
- Support meta-attestations (attestations about other attestations)

## Entity Relationships

Entities relate through **Attestations** (see [Attestations & Relations](attestations.md)):

```
Thing --[attestation]--> Name
Thing --[attestation]--> Geometry
Thing --[attestation]--> Timespan
Thing --[attestation]--> Thing (relationships)
Attestation --[attestation]--> Attestation (meta-attestations)
```

Every connection includes:

- Source citation(s)
- Certainty assessment
- Optional temporal bounds
- Relation type

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

**Query complexity**: Joining across attestations

- **Mitigation**: Use graph database, provide query helpers

**Data entry burden**: More fields to complete

- **Mitigation**: Make many fields optional, provide good defaults

**Benefits outweigh costs**: Richer, more honest, more scholarly.

## Next Steps

- **Attestations**: See [Attestations & Relations](attestations.md)
- **Vocabularies**: See [Controlled Vocabularies](vocabularies.md)
- **Use Cases**: See [Platform Use Cases](usecases.md)
- **Implementation**: See [Implementation in Vespa](implementation.md)
- **RDF Representation**: See [RDF Representation](rdf-representation.md)