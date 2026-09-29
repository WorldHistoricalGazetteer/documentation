# Summary & Future Directions

## Core Architecture

The WHG v4 data model achieves historical place representation through a graph-based attestation architecture:

**Entity nodes** (documents in document collections):
- **SpatialEntities** - unified entities (places, periods, routes, networks)
- **Names** - multilingual labels with phonetic embeddings
- **Geometries** - spatial representations with derived fields
- **Timespans** - temporal bounds with PeriodO integration
- **Attestations** - evidentiary nodes containing metadata about claims
- **Authorities** - sources, datasets, relation types, periods

**Relationship edges** (documents in edges collection):
- **Edges** - typed connections between all nodes (attests_about, attests_name, attests_geometry, attests_timespan, attests_type, sourced_by, has_relation_type, relates_to, meta_attestation, part_of)

**Critical distinction:** Attestations are NOT edges; they are nodes in a document collection that serve as junction points. All relationships are expressed through edges in a separate edge collection.

This separation of **entities** from **evidence** enables:
- Multiple conflicting claims to coexist with source attribution
- Temporal awareness throughout (not just date fields)
- Flexible relationship vocabulary extensible via AUTHORITY documents
- Provenance chains from any claim to original sources

---

## Key Design Principles

**Graph-first architecture**: Attestations are nodes in a document collection (not edges, not embedded records), making relationships first-class citizens traversable in both directions. Edges are stored separately in an edge collection, enabling efficient graph traversal while maintaining clean separation between entities and their relationships.

**Single table inheritance in AUTHORITY**: One collection with `authority_type` discriminator replaces separate tables for sources, datasets, relation types, and periods—simplifying queries and reducing joins.

**Temporal reification**: Timespans as separate entities (not date fields) enable PeriodO integration, inheritance, and multiple temporal perspectives on the same SpatialEntity.

**Vector embeddings as requirement**: Name embeddings power cross-linguistic reconciliation and are mandatory (not optional) for toponymic matching.

**Derived geometric fields**: Pre-computed `representative_point`, `bbox`, `hull` optimize spatial queries and enable geometry inheritance.

**Namespaced identifiers**: Compact external references (`pleiades:579885`) preserve authority IDs while Django resolves to full URIs.

---

## What This Enables

Beyond traditional gazetteers:

**Temporal gazetteering** - "What was this place called in 800 CE?" not just "Where is X?"

**Historiographical depth** - Multiple sources with varying certainty, not synthesized "facts". Each attestation node preserves the evidentiary basis through `sourced_by` edges to Authority documents, enabling scholars to evaluate claims rather than accept aggregated results.

**Network/route modeling** - Connections and movements, not just point locations

**Cross-cultural representation** - Phonetic similarity across scripts via embeddings

**Dynamic clustering** - Multi-dimensional similarity (name + space + time + type) for reconciliation

**Contribution flexibility** - LPF, CSV, GPX, edge lists all map to graph structure

**DOI integration** - Dataset-level citability with persistent identifiers

---

## Implementation

The model is logical, not tied to a store. It is formalised as [PLATO](https://github.com/pelagios/place-attestation-ontology),
the Place Attestation Ontology, which also serves as its interchange format (JSON and RDF). In WHG
the store of record is PostgreSQL/PostGIS, with Elasticsearch for search (see the [database assessment addendum](../architecture/database.md#addendum-2026-reassessment)). An earlier plan to hold it in ArangoDB was retired in 2026 after testing.

---

## Future Extensions

### Enhanced Relationship Types

**Uncertainty**: `possibly_same_as`, `probably_member_of`, `likely_connected_to`

**Causation**: `caused_by`, `influenced` for historical causation patterns

**Meta-attestations**: Attestations about other attestations for scholarly discourse modeling. Implemented through edges with `edge_type: "meta_attestation"` connecting attestation nodes, with `properties.meta_type` specifying the relationship (contradicts, supports, supersedes).

### Advanced Analytics

**Network analysis**: Centrality measures, community detection, flow analysis pre-computed as SpatialEntity attributes

**Temporal evolution**: Track network emergence/dissolution, territorial changes, migration patterns

**Machine learning**: Automated reconciliation suggestions, name variant generation, temporal inference, quality assessment

### Interoperability

**IIIF integration**: Link SpatialEntities to IIIF manifests for maps/manuscripts

**Wikidata sync**: Bidirectional linking with import/export of claims

**RDF exports**: SPARQL endpoint for semantic web integration

**Schema.org markup**: Enable search engine rich snippets

---

## Research Challenges

**Algorithmic**:
- Efficient geometry inheritance at scale (recursive unions with caching)
- Temporal reasoning with Allen's interval algebra for complex queries
- Hierarchical clustering for millions of candidates

**Modeling**:
- Contested territories (multiple claims on same space/time)
- Fuzzy boundaries (gradual transitions, borderlands)
- Uncertainty propagation through inheritance chains

**Interface**:
- Temporal visualization (time-traveling maps, animation)
- Network visualization at scale with filtering
- Source comparison views for conflicting claims

**Graph traversal optimization**:
- Efficient multi-hop queries through attestation-edge chains
- Caching strategies for frequently-accessed provenance paths
- Index optimization for complex edge type filtering

---

## Sustainability Model

**Data quality**: Editorial review workflows, community flagging, automated checks, version control

**Community**: Academic credit via DOI citations, teaching integration, comprehensive documentation

**Technical**: Open-source codebase, Pitt CRC hosting, regular updates, standards compliance

**Governance**: Conflict resolution processes, scholarly debate documentation, multiple perspectives preserved

---

## Architectural Clarity

The WHG v4 model's success depends on maintaining clear architectural boundaries:

**Attestations** (document collection):
- Store only metadata: certainty, notes, sequence, connection_metadata, timestamps
- Serve as junction points in the graph
- Enable bundling multiple claims with shared provenance

**Edges** (edge collection):
- Express all relationships: attests_about, attests_name, attests_geometry, attests_timespan, attests_type, sourced_by, has_relation_type, relates_to, meta_attestation
- Enable efficient graph traversal
- Support complex multi-hop queries

**Authorities** (document collection):
- Provide controlled vocabularies and reference data
- Unified collection with `authority_type` discriminator
- Eliminate redundancy through reference rather than duplication

This separation enables:
- Flexible relationship vocabulary without schema changes
- Efficient querying of provenance chains
- Multiple perspectives on the same entities
- Scholarly rigor through explicit source attribution

---

## Conclusion

The attestation-based graph architecture positions WHG as:

- **Not just a gazetteer** - a knowledge graph of historical geographic claims
- **Not just place lookup** - a platform for critical historical inquiry
- **Not just where** - but when, according to whom, with what certainty

This distinguishes WHG from:
- Commercial mapping platforms (no temporal depth, no source transparency)
- Search engines/LLMs (no provenance, flatten uncertainty into false consensus)
- Traditional gazetteers (point locations without networks/routes, limited temporality)

The graph model scales from simple place records to complex research questions about historical geography—from student contributions to scholarly debates—while maintaining rigorous provenance and enabling computational analysis impossible with document-oriented or relational approaches.