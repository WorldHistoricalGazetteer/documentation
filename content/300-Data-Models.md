### 🧭 WHG Core Temporal Model (Simplified)

**Concept:**
All entities — *Places, Groups, Toponyms,* and *Geometries* — have intrinsic validity ranges.  
**Attestations** record temporal evidence of relationships between them (names, extents, memberships).

```{mermaid}
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