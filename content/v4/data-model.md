# Data Model

```{mermaid} ../diagrams/v4_erd.mermaid
:align: center
:name: fig-data-model
:alt: Entity–relationship diagram for the WHG v4 data model.
:caption: Entity–relationship diagram for the WHG v4 data model.
```
```{note}
**The model, its formal expression, and its storage.** This section describes the WHG v4 data model:
SpatialEntities, the Attestations made about them, and the Names, Geometries, Timespans, Types,
relations and identity claims that attestations bundle, each resting on Authorities such as
Sources and Periods. The model is [PLATO](https://w3id.org/plato), the Place Attestation Ontology,
which also defines its JSON and RDF serialisations. The Linked Places Format (LPF) is PLATO's
single-object profile, and remains a supported input and output format.

These pages describe the model, not a storage layout. WHG holds it in PostgreSQL/PostGIS, with
Elasticsearch serving search.
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
./data-model/summary.md
```