# Attestations & Relations

## The Attestation Record

**Attestation records** are the core mechanism for recording evidentiary claims about all entities. They link Subjects to Names, Geometries, Timespans, and other Subjects, with explicit source attribution.

**Fields:**
- `id` (String, Required): Namespaced identifier (e.g., `whg:attestation-{uuid}`)
- `subject_type` (String, Required): Entity type: "subject", "name", "geometry", "timespan"
- `subject_id` (String, Required): ID of the entity being attested
- `relation_type` (String, Required): Type of relationship being attested (see Relation Types below)
- `object_type` (String, Optional): Type of related entity (if applicable)
- `object_id` (String, Optional): ID of related entity (if applicable)
- `sequence` (Integer, Optional): Sequential ordering for route/itinerary segments
- `connection_metadata` (JSON, Optional): Additional metadata for network connections
- `source` (Array[String], Required): Citations, dataset identifiers (including DOIs), or other references for the historical evidence
- `source_type` (Array[String], Required): Types corresponding to each source: "inscription", "manuscript", "map", "archaeological", "dataset", "oral_tradition"
- `certainty` (Float, Optional): Confidence level (0.0–1.0)
- `certainty_note` (Text, Optional): Qualitative explanation of certainty assessment
- `notes` (Text, Optional): Free-text explanatory note

**Notes:**
- The `source` field identifies the historical/scholarly evidence for the claim
- Multiple sources can support a single attestation (hence array)
- For contributed datasets, sources include DOIs (e.g., `["doi:10.83427/whg-dataset-657", "Codex Mendoza"]`)
- **Temporal information**: Handled via relationships to Timespan entities (not embedded in Attestation)
- Attestation creation/modification history tracked in Django changelog

---

## Relation Types

The `relation_type` field specifies what is being attested. Where possible, relation types align with **CIDOC-CRM** predicates for interoperability with cultural heritage standards.

### Core Relations

| Relation Type | CIDOC-CRM Alignment | Definition | Object Type |
|---------------|---------------------|------------|-------------|
| `has_name` | P1_is_identified_by | Subject was known by this name | name |
| `has_geometry` | P53_has_former_or_current_location | Subject had this spatial extent/location | geometry |
| `has_timespan` | P4_has_time-span | Subject existed/was valid during this timespan | timespan |
| `has_type` | P2_has_type | Subject was classified as this type | classification |
| `existence` | E77_Persistent_Item | Subject existed | null |
| `same_as` | P130_shows_features_of | Equivalence claim between subjects | subject |

**Notes:**
- `has_name`, `has_geometry`, and `has_timespan` can link to either Subjects or other Attestations (meta-attestations)
- `has_type` object is a classification string (e.g., "gazetteer", "period", "P.PPLA")
- `same_as` enables reconciliation and cross-gazetteer linkage

---

### Hierarchical/Membership Relations

| Relation Type | CIDOC-CRM Alignment | Definition | Object Type |
|---------------|---------------------|------------|-------------|
| `member_of` | P46_is_composed_of (inverse) | Subject was part of another subject | subject |
| `contains` | P46_is_composed_of | Subject contained another subject | subject |
| `succeeds` | P134_continued (approximate) | Subject succeeded/replaced another | subject |
| `coextensive_with` | P121_overlaps_with | Subject spatially coextensive with another | subject |

**Notes:**
- Use `sequence` field with `member_of` for route/itinerary segments
- `succeeds` enables temporal succession chains (e.g., Constantinople → Istanbul)
- `coextensive_with` supports dynamic clustering merge logic (same place, different sources)

---

### Network Relations

| Relation Type | CIDOC-CRM Alignment | Definition | Object Type |
|---------------|---------------------|------------|-------------|
| `connected_to` | P122_borders_with (extended) | Subject had connection/relationship to another | subject |

**Connection Metadata Structure:**
```json
{
  "connection_type": "trade|diplomatic|postal|telecommunication|administrative|social|religious",
  "directionality": "bidirectional|from_subject_to_object|from_object_to_subject",
  "intensity": 0.5,
  "frequency": "daily|weekly|monthly|seasonal|annual|irregular",
  "commodity": ["spices", "textiles"],
  "notes": "Free text"
}
```

**Notes:**
- Networks use `connected_to` rather than `member_of` to represent non-sequential relationships
- Multiple attestations with same `connected_to` but different Timespan associations represent changing connections over time
- Connection metadata allows rich domain-specific annotation

---

## Relationship Examples

### Subject and Name

**Attestation:** "The city in modern Mexico was known as Tenochtitlan during the Aztec period"

```json
{
  "id": "whg:attestation-001",
  "subject_type": "subject",
  "subject_id": "whg:subject-mexico-city",
  "relation_type": "has_name",
  "object_type": "name",
  "object_id": "whg:name-tenochtitlan",
  "source": ["doi:10.83427/whg-dataset-123", "Codex Mendoza"],
  "source_type": ["dataset", "manuscript"],
  "certainty": 0.95
}
```

**Temporal attestation (separate):**
```json
{
  "id": "whg:attestation-001a",
  "subject_type": "attestation",
  "subject_id": "whg:attestation-001",
  "relation_type": "has_timespan",
  "object_type": "timespan",
  "object_id": "whg:timespan-aztec-tenochtitlan",
  "source": ["Codex Mendoza"],
  "source_type": ["manuscript"]
}
```

Where `whg:timespan-aztec-tenochtitlan` has:
```json
{
  "start_earliest": "1325-01-01",
  "start_latest": "1325-12-31",
  "stop_earliest": "1521-08-13",
  "stop_latest": "1521-08-13",
  "precision": "circa"
}
```

---

### Subject and Geometry

**Attestation:** "The capital of the Tang Dynasty was located at these coordinates"

```json
{
  "id": "whg:attestation-002",
  "subject_type": "subject",
  "subject_id": "whg:subject-changan",
  "relation_type": "has_geometry",
  "object_type": "geometry",
  "object_id": "whg:geometry-changan-tang",
  "source": ["Tang Dynasty Archaeological Survey 2020"],
  "source_type": ["archaeological"],
  "certainty": 0.98
}
```

**Temporal attestation:**
```json
{
  "id": "whg:attestation-002a",
  "subject_type": "attestation",
  "subject_id": "whg:attestation-002",
  "relation_type": "has_timespan",
  "object_type": "timespan",
  "object_id": "periodo:p0tang",
  "source": ["Historical Atlas of China"],
  "source_type": ["map"]
}
```

---

### Subject Classification

**Attestation:** "The Abbasid Caliphate was classified as an empire"

```json
{
  "id": "whg:attestation-003",
  "subject_type": "subject",
  "subject_id": "whg:subject-abbasid-caliphate",
  "relation_type": "has_type",
  "object_type": "classification",
  "object_id": "empire",
  "source": ["Historical Geography of the Islamic World"],
  "source_type": ["dataset"],
  "certainty": 1.0
}
```

**With temporal attestation:**
```json
{
  "id": "whg:attestation-003a",
  "subject_type": "attestation",
  "subject_id": "whg:attestation-003",
  "relation_type": "has_timespan",
  "object_type": "timespan",
  "object_id": "whg:timespan-abbasid",
  "source": ["Historical Geography of the Islamic World"],
  "source_type": ["dataset"]
}
```

---

### Subject Membership (Period)

**Attestation:** "Chang'an was part of the Tang Dynasty period"

```json
{
  "id": "whg:attestation-004",
  "subject_type": "subject",
  "subject_id": "whg:subject-changan",
  "relation_type": "member_of",
  "object_type": "subject",
  "object_id": "whg:subject-tang-dynasty",
  "source": ["Ming Shilu"],
  "source_type": ["manuscript"],
  "certainty": 0.99
}
```

**With temporal attestation:**
```json
{
  "id": "whg:attestation-004a",
  "subject_type": "attestation",
  "subject_id": "whg:attestation-004",
  "relation_type": "has_timespan",
  "object_type": "timespan",
  "object_id": "periodo:p0tang",
  "source": ["Ming Shilu"],
  "source_type": ["manuscript"]
}
```

---

### Route Segment (no temporal data)

**Attestation:** "The Silk Road included Samarkand as a waypoint"

```json
{
  "id": "whg:attestation-005",
  "subject_type": "subject",
  "subject_id": "whg:subject-samarkand",
  "relation_type": "member_of",
  "object_type": "subject",
  "object_id": "whg:subject-silk-road",
  "sequence": 15,
  "source": ["Historical Atlas of Central Asia"],
  "source_type": ["map"]
}
```

**Note:** No Timespan attestation - this is a route, not an itinerary. The sequence indicates ordering, but no specific traversal dates.

---

### Itinerary Segment (with temporal data)

**Attestation:** "Marco Polo's journey included Venice as the first segment"

```json
{
  "id": "whg:attestation-006",
  "subject_type": "subject",
  "subject_id": "whg:subject-venice",
  "relation_type": "member_of",
  "object_type": "subject",
  "object_id": "whg:subject-marco-polo-journey",
  "sequence": 1,
  "source": ["The Travels of Marco Polo"],
  "source_type": ["manuscript"],
  "certainty": 0.85
}
```

**Temporal attestation:**
```json
{
  "id": "whg:attestation-006a",
  "subject_type": "attestation",
  "subject_id": "whg:attestation-006",
  "relation_type": "has_timespan",
  "object_type": "timespan",
  "object_id": "whg:timespan-polo-venice",
  "source": ["The Travels of Marco Polo"],
  "source_type": ["manuscript"]
}
```

Where `whg:timespan-polo-venice` has:
```json
{
  "start_earliest": "1271-01-01",
  "start_latest": "1271-03-01",
  "stop_earliest": "1271-05-01",
  "stop_latest": "1271-06-30",
  "precision": "circa",
  "precision_value": 30
}
```

---

### Network Connection

**Attestation:** "Constantinople had trade connections with Venice"

```json
{
  "id": "whg:attestation-007",
  "subject_type": "subject",
  "subject_id": "pleiades:520998",
  "relation_type": "connected_to",
  "object_type": "subject",
  "object_id": "pleiades:393473",
  "connection_metadata": {
    "connection_type": "trade",
    "directionality": "bidirectional",
    "commodity": ["spices", "textiles", "metals"],
    "intensity": 0.9
  },
  "source": ["Mediterranean Trade Networks Database", "doi:10.83427/whg-network-042"],
  "source_type": ["dataset", "dataset"],
  "certainty": 0.92
}
```

**Temporal attestation:**
```json
{
  "id": "whg:attestation-007a",
  "subject_type": "attestation",
  "subject_id": "whg:attestation-007",
  "relation_type": "has_timespan",
  "object_type": "timespan",
  "object_id": "whg:timespan-byzantine-venetian-trade",
  "source": ["Mediterranean Trade Networks Database"],
  "source_type": ["dataset"]
}
```

---

### Contributed Dataset Attribution

**Attestation:** "This place record is from a contributed dataset with DOI"

```json
{
  "id": "whg:attestation-008",
  "subject_type": "subject",
  "subject_id": "whg:subject-place-xyz",
  "relation_type": "existence",
  "source": ["doi:10.83427/whg-dataset-657"],
  "source_type": ["dataset"],
  "notes": "From 'Historical Places of West Africa' collection"
}
```

**With temporal attestation:**
```json
{
  "id": "whg:attestation-008a",
  "subject_type": "attestation",
  "subject_id": "whg:attestation-008",
  "relation_type": "has_timespan",
  "object_type": "timespan",
  "object_id": "whg:timespan-west-africa-medieval",
  "source": ["doi:10.83427/whg-dataset-657"],
  "source_type": ["dataset"]
}
```

---

## Attestation Patterns for Timespans

Timespans are first-class entities, and attestations can link to them in multiple ways:

### Direct Timespan Attestation

Subject directly attested to a Timespan (e.g., "Chang'an existed during the Tang Dynasty"):

```json
{
  "subject_id": "whg:subject-changan",
  "relation_type": "has_timespan",
  "object_id": "periodo:p0tang",
  "source": ["Historical Atlas of China"],
  "source_type": ["map"]
}
```

---

### Meta-Attestation Timespan

An attestation itself has a Timespan (e.g., "The name 'Eboracum' was used 71-400 CE"):

```json
{
  "subject_type": "attestation",
  "subject_id": "whg:attestation-eboracum-name",
  "relation_type": "has_timespan",
  "object_id": "whg:timespan-eboracum-roman",
  "source": ["Roman Inscriptions of Britain"],
  "source_type": ["inscription"]
}
```

---

### Multiple Conflicting Timespans

Same Subject, multiple Timespan attestations from different sources:

**Legendary/literary dates:**
```json
{
  "subject_id": "whg:subject-troy",
  "relation_type": "has_timespan",
  "object_id": "whg:timespan-troy-homer",
  "source": ["Iliad"],
  "source_type": ["manuscript"],
  "certainty": 0.3,
  "certainty_note": "Legendary dates from literary source"
}
```

**Archaeological dates:**
```json
{
  "subject_id": "whg:subject-troy",
  "relation_type": "has_timespan",
  "object_id": "whg:timespan-troy-archaeological",
  "source": ["doi:10.xxxx/troy-excavation"],
  "source_type": ["archaeological"],
  "certainty": 0.95,
  "certainty_note": "Carbon-14 dated archaeological layers"
}
```
