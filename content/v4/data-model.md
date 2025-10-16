# Data Model

```{mermaid} ../diagrams/v4_erd.mermaid
:align: center
:name: fig-data-model
:alt: Entity–relationship diagram for the WHG v4 data model.
:caption: Entity–relationship diagram for the WHG v4 data model.
```
```{note}
**Single EDGE Collection:** The v4 model uses a unified edge collection with an `edge_type` field to distinguish between different relationship types ("subject_of", "attests_name", "attests_geometry", "attests_timespan", "relates_to", "meta_attestation", "typed_by", "sourced_by", "part_of"). This approach provides several key advantages:

1. **Simplified schema management** - One collection to maintain rather than separate collections for each relationship type
2. **Flexible relationship vocabulary** - New edge types can be added without schema changes
3. **Efficient graph traversal** - Graph algorithms can traverse all relationships uniformly
4. **Reduced operational overhead** - Fewer indexes, backups, and permissions to manage

**AUTHORITY Collection (Single Table Inheritance):** Reference data (datasets, sources, relation_types, periods, certainty_levels) is unified in a single AUTHORITY collection using an `authority_type` discriminator field. This provides two key efficiencies:

1. **Reduced operational overhead** - Managing one collection is simpler than maintaining five separate small collections (fewer indexes, backups, permissions to manage)
2. **Eliminated redundancy** - Source metadata is stored once and referenced by multiple attestations through edges, rather than duplicated across millions of attestations that cite the same sources

For Thing-to-Thing relationships using `edge_type: "relates_to"`, the edge references an AUTHORITY document where `authority_type: "relation_type"` to specify the semantic nature of the relationship (e.g., "capital_of", "successor_to"). This keeps the core model stable while allowing the vocabulary of historical relationships to grow organically as new use cases emerge.
```
<br>

```{toctree}
:maxdepth: 3

./data-model/introduction.md
./data-model/overview.md
./data-model/attestations.md
./data-model/vocabularies.md
./data-model/patterns.md
./data-model/contributions.md
./data-model/rdf-representation.md
./data-model/usecases.md
./data-model/implementation.md
./data-model/implementation-alternative.md
./data-model/summary.md
```