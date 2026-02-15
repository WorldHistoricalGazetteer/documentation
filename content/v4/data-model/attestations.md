# Attestations & Relations

## The Attestation as Graph Node

In WHG v4, **Attestations are nodes** (vertices) in the graph, not records with embedded relationship fields. They serve as **junction points** that bundle together claims about a Thing with its attributes (Names, Geometries, Timespans) and provenance (Sources).

### Attestation Node Structure

An Attestation node contains only metadata:

```javascript
{
  "_key": "att-001",
  "_id": "attestations/att-001",
  "sequence": null,                    // For ordered sequences in routes/itineraries
  "connection_metadata": null,         // For network relationships
  "certainty": 0.95,                   // Confidence level (0.0-1.0)
  "certainty_note": "Well-documented in primary sources",
  "notes": "Additional context",
  "created": "2024-01-15T10:30:00Z",
  "modified": "2024-02-20T14:45:00Z",
  "contributor": "researcher@example.edu"
}
```

**Key Properties:**
- `_key`, `_id`: ArangoDB identifiers
- `sequence`: Integer for ordering waypoints in routes/itineraries
- `connection_metadata`: JSON for network connection details (trade goods, flow direction, etc.)
- `certainty`: Confidence value (0.0-1.0)
- `certainty_note`: Explanation of certainty assessment
- `notes`: Free-text context
- `created`, `modified`: Temporal metadata
- `contributor`: User or system that created the attestation

**What's NOT in the Attestation:**
- No `subject_id` or `object_id` fields
- No `relation_type` field
- No `source` array

These are all expressed through **edges** in the EDGE collection.

---

## Relationships Through Edges

All relationships are expressed through the unified **EDGE** collection. Each edge has:

```javascript
{
  "_key": "edge-001",
  "_id": "edges/edge-001",
  "_from": "things/constantinople",     // Source node
  "_to": "attestations/att-001",        // Target node
  "edge_type": "subject_of",           // Type of relationship
  "role": "subject",                   // Optional disambiguation
  "properties": {},                    // Optional edge-specific data
  "created": "2024-01-15T10:30:00Z"
}
```

### Core Edge Types

| Edge Type | Direction | Meaning |
|-----------|-----------|---------|
| `subject_of` | Thing → Attestation | This attestation is about this Thing |
| `attests_name` | Attestation → Name | This attestation claims this Name |
| `attests_geometry` | Attestation → Geometry | This attestation claims this Geometry |
| `attests_timespan` | Attestation → Timespan | This attestation claims this Timespan |
| `sourced_by` | Attestation → Authority | This attestation is backed by this Source |
| `relates_to` | Attestation → Thing | This attestation connects to another Thing |
| `typed_by` | Attestation → Authority | This attestation uses this Relation Type |
| `meta_attestation` | Attestation → Attestation | This attestation comments on another |
| `part_of` | Authority → Authority | This Source is part of this Dataset |

---

## Relation Types via AUTHORITY Collection

For Thing-to-Thing relationships (when `edge_type: "relates_to"`), the semantic meaning is specified through an AUTHORITY document with `authority_type: "relation_type"`.

### Core Relation Types

These align with **CIDOC-CRM** predicates where possible:

| Relation Type Label | CIDOC-CRM | Definition |
|---------------------|-----------|------------|
| `has_name` | P1_is_identified_by | Thing is identified by Name (system edge) |
| `has_geometry` | P53_has_former_or_current_location | Thing has spatial location (system edge) |
| `has_timespan` | P4_has_time-span | Thing exists during Timespan (system edge) |
| `member_of` | P46_is_composed_of (inverse) | Thing is part of another Thing |
| `contains` | P46_is_composed_of | Thing contains another Thing |
| `same_as` | P130_shows_features_of | Equivalence between Things |
| `succeeds` | P134_continued | Thing succeeded another Thing |
| `connected_to` | P122_borders_with (extended) | Thing connected to another Thing |
| `coextensive_with` | P121_overlaps_with | Thing spatially coextensive with another |

**Note:** `has_name`, `has_geometry`, and `has_timespan` are implemented as system edge types (`attests_name`, `attests_geometry`, `attests_timespan`), not via AUTHORITY lookups.

### Custom Relation Types

Users can define domain-specific relation types through AUTHORITY documents:

```javascript
{
  "_id": "authorities/capital-of",
  "authority_type": "relation_type",
  "label": "capital_of",
  "inverse": "has_capital",
  "domain": ["city", "location"],
  "range": ["political_entity", "empire", "kingdom"],
  "description": "This city served as the capital of this political entity"
}
```

---

## Complete Examples

**Understanding the Star-Schema Pattern:**

In all examples below, the **Attestation acts as the central hub** (star-schema), not a linear chain. All attributes (Names, Geometries, Timespans) and relationships (to Things, Sources, Relation Types) connect **directly and independently** to the Attestation node.

**Incorrect interpretation (Chain):**
```
Thing → Attestation → Name → Timespan → Authority
```

**Correct interpretation (Star):**
```
            Name
             ↑
        [edge_type]
             |
Thing ← Attestation → Timespan
             |
        [edge_type]
             ↓
         Authority
```

Each edge represents an independent relationship with the Attestation as the hub. The Timespan does NOT belong to the Name, and the Authority does NOT belong to the Timespan—they are all independent properties of the Attestation itself.

---

### Example 1: Thing with Name and Timespan

**Scenario:** "The city was called 'Tenochtitlan' during 1325-1521 CE"

**Graph structure (Star-Schema):**
```
                    Name(tenochtitlan)
                           ↑
                    [attests_name]
                           |
Thing(mexico-city) →[subject_of]→ Attestation(att-001) ─[attests_timespan]→ Timespan(1325-1521)
                           |
                    [sourced_by]
                           ↓
                    Authority(codex-mendoza)
```

**Important:** The Attestation is the central hub (star-schema), with Name, Timespan, and Authority as independent properties directly connected to it. They do NOT form a chain (Name→Timespan→Authority).

**Documents:**

Thing:
```javascript
{
  "_id": "things/mexico-city",
  "thing_type": "location",
  "description": "Major city in modern Mexico"
}
```

Attestation:
```javascript
{
  "_id": "attestations/att-001",
  "certainty": 0.95,
  "notes": "Aztec period name"
}
```

Name:
```javascript
{
  "_id": "names/tenochtitlan",
  "name": "Tenochtitlan",
  "language": "nah",
  "name_type": ["toponym"]
}
```

Timespan:
```javascript
{
  "_id": "timespans/aztec-tenochtitlan",
  "start_earliest": "1325-01-01",
  "start_latest": "1325-12-31",
  "end_earliest": "1521-08-13",
  "end_latest": "1521-08-13",
  "precision": "year"
}
```

Authority (Source):
```javascript
{
  "_id": "authorities/codex-mendoza",
  "authority_type": "source",
  "citation": "Codex Mendoza, 16th century",
  "uri": "https://example.org/codex-mendoza"
}
```

**Edges:**
```javascript
// Thing to Attestation
{
  "_from": "things/mexico-city",
  "_to": "attestations/att-001",
  "edge_type": "subject_of"
}

// Attestation to Name
{
  "_from": "attestations/att-001",
  "_to": "names/tenochtitlan",
  "edge_type": "attests_name"
}

// Attestation to Timespan
{
  "_from": "attestations/att-001",
  "_to": "timespans/aztec-tenochtitlan",
  "edge_type": "attests_timespan"
}

// Attestation to Source
{
  "_from": "attestations/att-001",
  "_to": "authorities/codex-mendoza",
  "edge_type": "sourced_by"
}
```

**Note on Timespan Fields:** Internally, WHG uses `stop_earliest` and `stop_latest` for temporal bounds. When exporting to RDF/W3C Time format, these are mapped to `end_earliest` and `end_latest` for standards compliance. This example shows internal field names.

---

### Example 2: Thing with Geometry and Different Timespan

**Scenario:** "The Tang Dynasty capital had these boundaries during 618-907 CE"

**Graph structure (Star-Schema):**
```
                    Geometry(tang-walls)
                           ↑
                    [attests_geometry]
                           |
Thing(changan) ←[subject_of]← Attestation(att-002) ─[attests_timespan]→ Timespan(tang-dynasty)
                           |
                    [sourced_by]
                           ↓
                    Authority(archaeological-survey)
```

**Edges:**
```javascript
{
  "_from": "things/changan",
  "_to": "attestations/att-002",
  "edge_type": "subject_of"
}

{
  "_from": "attestations/att-002",
  "_to": "geometries/tang-walls",
  "edge_type": "attests_geometry"
}

{
  "_from": "attestations/att-002",
  "_to": "timespans/tang-dynasty",
  "edge_type": "attests_timespan"
}

{
  "_from": "attestations/att-002",
  "_to": "authorities/archaeological-survey-2020",
  "edge_type": "sourced_by"
}
```

---

### Example 3: Thing-to-Thing Relationship

**Scenario:** "Alexandria was the capital of Ptolemaic Egypt"

**Graph structure (Star-Schema):**
```
                    Authority(capital-of relation)
                           ↑
                       [typed_by]
                           |
Thing(alexandria) ←[subject_of]← Attestation(att-003) ─[relates_to]→ Thing(ptolemaic-egypt)
                           |
                      [sourced_by]
                           ↓
                    Authority(source)
```

**Edges:**
```javascript
// Thing to Attestation
{
  "_from": "things/alexandria",
  "_to": "attestations/att-003",
  "edge_type": "subject_of"
}

// Attestation to Relation Type
{
  "_from": "attestations/att-003",
  "_to": "authorities/capital-of",
  "edge_type": "typed_by"
}

// Attestation to Related Thing
{
  "_from": "attestations/att-003",
  "_to": "things/ptolemaic-egypt",
  "edge_type": "relates_to"
}

// Attestation to Source
{
  "_from": "attestations/att-003",
  "_to": "authorities/historical-geography",
  "edge_type": "sourced_by"
}
```

---

### Example 4: Route Segment (Ordered Sequence)

**Scenario:** "Samarkand was the 15th waypoint on the Silk Road"

**Graph structure (Star-Schema):**
```
                    Authority(member-of relation)
                           ↑
                       [typed_by]
                           |
Thing(samarkand) ←[subject_of]← Attestation(att-005) ─[relates_to]→ Thing(silk-road)
                           |
                      [sourced_by]
                           ↓
                    Authority(historical-atlas)
```

**Attestation with sequence:**
```javascript
{
  "_id": "attestations/att-005",
  "sequence": 15,
  "certainty": 0.9
}
```

**Edges:**
```javascript
{
  "_from": "things/samarkand",
  "_to": "attestations/att-005",
  "edge_type": "subject_of"
}

{
  "_from": "attestations/att-005",
  "_to": "authorities/member-of",
  "edge_type": "typed_by"
}

{
  "_from": "attestations/att-005",
  "_to": "things/silk-road",
  "edge_type": "relates_to"
}

{
  "_from": "attestations/att-005",
  "_to": "authorities/historical-atlas",
  "edge_type": "sourced_by"
}
```

---

### Example 5: Network Connection with Metadata

**Scenario:** "Constantinople had trade connections with Venice, exchanging spices and textiles"

**Graph structure (Star-Schema):**
```
                    Authority(connected-to relation)
                           ↑
                       [typed_by]
                           |
Thing(constantinople) ←[subject_of]← Attestation(att-007) ─[relates_to]→ Thing(venice)
                           |
                    [attests_timespan]
                           ↓
                    Timespan(byzantine-venetian)
```

**Attestation with connection metadata:**
```javascript
{
  "_id": "attestations/att-007",
  "connection_metadata": {
    "connection_type": "trade",
    "directionality": "bidirectional",
    "commodity": ["spices", "textiles", "metals"],
    "intensity": 0.9
  },
  "certainty": 0.92
}
```

**Edges:**
```javascript
{
  "_from": "things/constantinople",
  "_to": "attestations/att-007",
  "edge_type": "subject_of"
}

{
  "_from": "attestations/att-007",
  "_to": "authorities/connected-to",
  "edge_type": "typed_by"
}

{
  "_from": "attestations/att-007",
  "_to": "things/venice",
  "edge_type": "relates_to"
}

{
  "_from": "attestations/att-007",
  "_to": "timespans/byzantine-venetian-trade",
  "edge_type": "attests_timespan"
}

{
  "_from": "attestations/att-007",
  "_to": "authorities/trade-networks-db",
  "edge_type": "sourced_by"
}
```

---

### Example 6: Meta-Attestation

**Scenario:** "A modern scholarly article contradicts the Byzantine chronicle's claim about Constantinople's name"

**Graph structure:**
```
Attestation(att-001) ←[meta_attestation]← Attestation(att-meta)
                                                ↓ [sourced_by]
                                             Authority(modern-article)
```

**Meta-attestation:**
```javascript
{
  "_id": "attestations/att-meta",
  "certainty": 0.85,
  "notes": "Recent archaeological evidence suggests different dating"
}
```

**Edge:**
```javascript
{
  "_from": "attestations/att-meta",
  "_to": "attestations/att-001",
  "edge_type": "meta_attestation",
  "properties": {
    "meta_type": "contradicts"  // Could also be "supports", "supersedes", "bundles"
  }
}
```

**Note on Meta-Attestation Edge Type:** The edge connecting meta-attestations uses `edge_type: "meta_attestation"` with an optional `meta_type` property in the edge's properties field to specify the nature of the relationship (contradicts, supports, supersedes, etc.). This is distinct from the `typed_by` edge pattern used for Thing-to-Thing relationships.

---

## Multiple Attestations for Same Thing

A single Thing can have multiple Attestations with different:
- Names at different times
- Geometries at different times
- Conflicting claims from different sources

**Example: Constantinople through time**

```
Thing(constantinople) ←[subject_of]← Attestation(att-ancient)
                                           ↓ [attests_name]
                                        Name(byzantion)
                                           ↓ [attests_timespan]
                                        Timespan(667-BCE-330-CE)

Thing(constantinople) ←[subject_of]← Attestation(att-byzantine)
                                           ↓ [attests_name]
                                        Name(konstantinoupolis)
                                           ↓ [attests_timespan]
                                        Timespan(330-1453-CE)

Thing(constantinople) ←[subject_of]← Attestation(att-ottoman)
                                           ↓ [attests_name]
                                        Name(istanbul)
                                           ↓ [attests_timespan]
                                        Timespan(1453-present)
```

Each attestation is independent, with its own:
- Name
- Timespan
- Source(s)
- Certainty value
- Notes

---

## Querying Patterns

### Find all names for a Thing at a specific time

```aql
// Find names for Constantinople in year 800 CE
FOR thing IN things
  FILTER thing._id == "things/constantinople"
  
  FOR att IN attestations
    FOR e1 IN edges
      FILTER e1._from == thing._id
      FILTER e1._to == att._id
      FILTER e1.edge_type == "subject_of"
      
      // Get the name
      FOR e2 IN edges
        FILTER e2._from == att._id
        FILTER e2.edge_type == "attests_name"
        LET name = DOCUMENT(e2._to)
        
        // Get the timespan
        FOR e3 IN edges
          FILTER e3._from == att._id
          FILTER e3.edge_type == "attests_timespan"
          LET timespan = DOCUMENT(e3._to)
          
          // Check if 800 CE falls within the timespan
          FILTER timespan.start_earliest <= "0800-01-01"
          FILTER timespan.end_latest >= "0800-12-31"
          
          RETURN {
            name: name.name,
            language: name.language,
            timespan: timespan.label,
            certainty: att.certainty
          }
```

**Note:** This query uses `end_latest` in the filter. Remember that internally WHG stores this as `stop_latest`, so adjust field names based on your implementation context.

### Find all Things connected via a specific relation type

```aql
// Find all capitals of empires
FOR att IN attestations
  // Get the relation type
  FOR e1 IN edges
    FILTER e1._from == att._id
    FILTER e1.edge_type == "typed_by"
    LET relationType = DOCUMENT(e1._to)
    FILTER relationType.label == "capital_of"
    
    // Get subject Thing
    FOR e2 IN edges
      FILTER e2._to == att._id
      FILTER e2.edge_type == "subject_of"
      LET subject = DOCUMENT(e2._from)
      
      // Get object Thing
      FOR e3 IN edges
        FILTER e3._from == att._id
        FILTER e3.edge_type == "relates_to"
        LET object = DOCUMENT(e3._to)
        
        RETURN {
          capital: subject.description,
          empire: object.description,
          certainty: att.certainty
        }
```

---

## Design Benefits

**Flexibility:** Each attestation is independent, allowing:
- Multiple names/geometries per Thing across time
- Conflicting claims to coexist
- Rich provenance tracking

**Reusability:** Entities are shared:
- Same Name can apply to multiple Things
- Same Geometry can represent different Things at different times
- Same Timespan can be referenced by many Attestations

**Provenance:** Every claim is traceable:
- Source attribution via edges
- Certainty values per attestation
- Meta-attestations for scholarly discourse

**Extensibility:** New relation types can be added:
- Through AUTHORITY documents
- Without schema changes
- With semantic validation (domain/range)

---

## Migration from v3

The v3 attestation model embedded relationships within attestation records. The v4 model externalizes these into edges:

**v3 Pattern:**
```json
{
  "subject_id": "place-123",
  "relation_type": "has_name",
  "object_id": "name-456",
  "source": ["source1"],
  "timespan_id": "timespan-789"
}
```

**v4 Pattern:**
```
Attestation node (metadata only)
  + Edge to Thing (subject_of)
  + Edge to Name (attests_name)
  + Edge to Timespan (attests_timespan)
  + Edge to Authority (sourced_by)
```

This transformation enables true graph traversal and eliminates the need for complex JOIN operations.