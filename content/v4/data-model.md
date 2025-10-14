# Data Model <img src="https://img.shields.io/badge/upcoming-v4.0--beta-blue">

```{mermaid} ../diagrams/v4_erd.mermaid
:align: center
:name: fig-data-model
:alt: Entity–relationship diagram for the WHG v4 data model.
:caption: Entity–relationship diagram for the WHG v4 data model.
```
```{note}
**AUTHORITY Collection (Single Table Inheritance):** Uses the `authority_type` field to distinguish between datasets, sources, relation_types, periods, and certainty_levels within a single collection. While still part of the graph structure (attestations reference authority documents), this collection has a more relational "lookup table" character, serving as reference data rather than semantic entities. This approach provides two key efficiencies:
1. **Reduced operational overhead** - Managing one collection is simpler than maintaining five separate small collections (fewer indexes, backups, permissions to manage)
2. **Eliminated redundancy** - Source metadata is stored once and referenced by attestations, rather than duplicated across millions of attestations that cite the same sources
```
<br>

```{toctree}
:maxdepth: 3

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