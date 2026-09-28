# Data Model

```{mermaid} ../diagrams/v4_erd.mermaid
:align: center
:name: fig-data-model
:alt: Entity–relationship diagram for the WHG v4 data model.
:caption: Entity–relationship diagram for the WHG v4 data model.
```
```{note}
**The model, its formal expression, and its storage.** This section describes the WHG v4 data model
as a graph: SpatialEntities, Attestations, and the Names, Geometries, Timespans, Types and Authorities
that attestations bundle together. The model is formalised as
[PLATO](https://github.com/pelagios/place-attestation-ontology), the Place Attestation Ontology,
which also defines its JSON and RDF serialisations. The Linked Places Format (LPF) is PLATO's
single-object-attestation profile, and remains a supported input and output format.

A graph *model* does not require a graph *database*. In WHG the attestation model is held in
PostgreSQL/PostGIS, with Elasticsearch serving search. That choice was tested against ArangoDB and
an RDF triplestore on real and production-scale data, as set out in the
[database assessment addendum](./architecture/database.md#addendum-2026-reassessment).

Where these pages speak of "collections", "edges" or "nodes", read them as describing the logical
structure, not a storage layout. **AUTHORITY** reference data (datasets, sources, relation types,
periods, certainty levels) is still unified behind one `authority_type` discriminator, and
**Attestations** remain first-class: each has its own identifier, carries certainty, notes and
provenance, and links a SpatialEntity to what it attests.
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