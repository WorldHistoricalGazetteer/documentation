### 🧭 WHG Temporal Entity–Relationship Model

This diagram shows the **core entities** in the World Historical Gazetteer data model
and how they interrelate in both **conceptual** and **temporal** terms.

- **Entities** (`Place`, `Group`, `Toponym`, `Geometry`) each have intrinsic life-spans  
  represented by `valid_start` / `valid_end`.
- **Attestation** is the evidential link type that records *temporal relationships* between entities:
  - A *name* (Toponym ↔ Place/Group)
  - A *spatial representation* (Geometry ↔ Place/Group)
  - A *membership* (Place ↔ Group or Group ↔ Group)
  - Each Attestation carries its own `temporal_start` / `temporal_end`, source, and certainty.
- This separation supports reasoning about both the **existence** of entities and the
  **historical evidence** connecting them.

```mermaid
erDiagram
    PLACE {
        string id
        string label
        long valid_start
        long valid_end
    }

    GROUP {
        string id
        string label
        long valid_start
        long valid_end
    }

    TOPONYM {
        string id
        string text
        string language
        long valid_start
        long valid_end
    }

    GEOMETRY {
        string id
        string wkt
        int srid
        long valid_start
        long valid_end
    }

    ATTESTATION {
        string id
        string subject_type
        string subject_id
        string group_id
        long temporal_start
        long temporal_end
        string source
        float certainty
        string notes
    }

    %% Temporal / evidential links
    PLACE ||--o{ ATTESTATION : "attested as name/geometry/member"
    GROUP ||--o{ ATTESTATION : "attested as extent/label/membership"
    TOPONYM ||--o{ ATTESTATION : "attested usage"
    GEOMETRY ||--o{ ATTESTATION : "attested extent"

    %% Recursive grouping
    GROUP ||--o{ GROUP : "contains (via Attestation)"

    %% Core conceptual (atemporal) relationships
    PLACE ||--|{ TOPONYM : "has label(s)"
    PLACE ||--|{ GEOMETRY : "has shape(s)"
    GROUP ||--|{ TOPONYM : "has label(s)"
    GROUP ||--|{ GEOMETRY : "has shape(s)"
    PLACE ||--o{ GROUP : "member of (via Attestation)"
```

### 🧭 WHG Core Temporal Model (Simplified)

**Concept:**  
All entities — *Places, Groups, Toponyms,* and *Geometries* — have intrinsic validity ranges.  
**Attestations** record temporal evidence of relationships between them (names, extents, memberships).

```mermaid
erDiagram
    PLACE ||--|{ TOPONYM : "has label(s)"
    PLACE ||--|{ GEOMETRY : "has shape(s)"
    GROUP ||--|{ TOPONYM : "has label(s)"
    GROUP ||--|{ GEOMETRY : "has shape(s)"

    %% Temporal associations
    PLACE ||--o{ ATTESTATION : "attested as"
    GROUP ||--o{ ATTESTATION : "attested as"
    TOPONYM ||--o{ ATTESTATION : "attested usage"
    GEOMETRY ||--o{ ATTESTATION : "attested extent"
    PLACE ||--o{ GROUP : "member of (via Attestation)"
    GROUP ||--o{ GROUP : "contains (via Attestation)"

    %% Entity nodes
    PLACE {
        valid_start
        valid_end
    }
    GROUP {
        valid_start
        valid_end
    }
    TOPONYM {
        valid_start
        valid_end
    }
    GEOMETRY {
        valid_start
        valid_end
    }
```