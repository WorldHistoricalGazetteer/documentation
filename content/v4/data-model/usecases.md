# Platform Use Cases

## Overview

The World Historical Gazetteer serves multiple complementary functions that distinguish it from general-purpose mapping platforms, search engines, and their LLM successors. This section outlines key use cases that the data model is designed to support.

---

## Core Platform Capabilities

### Reconciliation Service

**What it is:**
A unified authority file service that matches place references against multiple authoritative gazetteers and curated contributions.

**How the model supports it:**
- **Unified index**: All creditable public data (Pleiades, GeoNames, Wikidata, TGN) plus curated WHG contributions indexed together
- **Namespaced IDs**: External IDs preserved (e.g., `pleiades:579885`) enabling cross-reference
- **Name embeddings**: Vector similarity search enables fuzzy matching across languages and scripts
- **Temporal awareness**: Reconciliation considers when a name was used via Timespan attestations, not just spatial proximity
- **Multiple attestations**: Conflicting sources represented as separate Attestation nodes, allowing confidence-weighted matching
- **Graph traversal**: `same_as` relationships enable cross-gazetteer linkage via edges

**Use cases:**
- Digital humanities projects reconciling place names in historical texts
- Archaeological databases linking sites to multiple gazetteer authorities
- Historical GIS projects requiring temporal place name resolution
- Cultural heritage projects with multilingual place references

**Example workflow:**
1. User submits: "Eboracum, 2nd century CE"
2. WHG searches Name embeddings for "Eboracum"
3. Filters candidates by Timespan attestations (overlapping with 2nd century)
4. Returns ranked matches with confidence scores and source attributions from AUTHORITY documents
5. User selects `pleiades:89167`
6. WHG creates new Attestation node with `same_as` relationship via edges:
   ```
   User Thing ←[subject_of]← Attestation ─[typed_by]→ AUTHORITY(same_as)
                                        └─[relates_to]→ Pleiades Thing
   ```

---

### Temporal Gazetteering

**What it is:**
Not just "where" but "when was it called X and where was it located then."

**How the model supports it:**
- **Timespan entities**: Separate temporal bounds from place concepts as first-class nodes
- **Temporal attestations**: Names, geometries, classifications all time-bound via Attestation nodes linking to Timespans
- **Multiple temporal claims**: Conflicting sources about dates represented as separate Attestation nodes
- **PeriodO integration**: Standard period definitions accessible as Timespan entities referenced by Attestations
- **Inheritance**: Temporal bounds computed for periods and collections from members via graph traversal

**Use cases:**
- "What was Chang'an's extent during the Tang Dynasty?"
- "Show me all places in Roman Britain with their 2nd-century names"
- "When was Constantinople renamed Istanbul?"
- "Map the changing boundaries of the Abbasid Caliphate over time"

**Example workflow:**
1. User queries: "Places in Tang Dynasty period"
2. WHG resolves `periodo:p0tang` as Timespan (618-907 CE)
3. Graph traversal finds all Things with Attestations linking via `member_of` relation to Tang Dynasty Thing
4. For each member Thing, retrieves Names via Attestations with Timespan edges overlapping 618-907
5. Returns contemporary toponyms, not modern names

---

### Discovery with Historiographical Depth

**What it is:**
Search and exploration that reveals source complexity, not just "best match" results.

**How the model supports it:**
- **Multiple attestations**: Same claim from different sources stored as separate Attestation nodes
- **Source links**: Multiple AUTHORITY(source) documents linked via `sourced_by` edges
- **Certainty scores**: Evidence quality explicitly recorded in Attestation nodes
- **Provenance**: Every claim traceable to historical evidence via edges to AUTHORITY documents
- **Conflicting claims**: Different geometries/dates/names from different sources all visible as separate Attestation nodes
- **Meta-attestations**: Attestation nodes that link to other Attestations to document contradictions

**Superiority over search engines/LLMs:**
- LLMs flatten sources into single synthesis, hiding uncertainty
- Search engines prioritize recency and popularity, not historical accuracy
- WHG preserves multiple scholarly perspectives, contested claims, and source reliability via graph structure
- Enables critical historical inquiry, not just answer retrieval

**Use cases:**
- Comparing different reconstructions of ancient city locations
- Evaluating reliability of place claims in medieval texts
- Understanding scholarly debates about territorial extents
- Teaching historical methods through source comparison

**Example workflow:**
1. User searches for "Troy location"
2. WHG returns multiple Attestation nodes with different Geometry links:
   - Archaeological: Hisarlik (certainty: 0.95, sourced_by: excavation AUTHORITY)
   - Homeric: Legendary location (certainty: 0.3, sourced_by: Iliad AUTHORITY)
   - Medieval: Various claimed sites (certainty: 0.1, sourced_by: pilgrimage accounts)
3. User can traverse graph to compare sources, timespans, and certainty assessments
4. Results enable critical evaluation, not passive consumption

---

### Network, Route, and Itinerary Support

**What it is:**
Not just static places, but connections, movements, and relationships through time.

**How the model supports it:**
- **Route Things**: Sequential waypoints without temporal constraints
- **Itinerary Things**: Journeys with segment-level temporal data
- **Network Things**: Connection graphs with typed edges and metadata
- **Sequence field**: Ordered segments in Attestation nodes for routes/itineraries
- **connected_to relations**: Network edges via AUTHORITY(connected_to) with Attestation nodes containing connection_metadata
- **Temporal dynamics**: Networks evolving over time through multiple Attestation nodes with different Timespan links

**Use cases:**
- Reconstructing Silk Road trade routes with waypoint sequences
- Analyzing Marco Polo's journey with dates at each location
- Mapping medieval pilgrimage networks and their evolution
- Studying postal system efficiency through connection metadata
- Visualizing trade network changes during political upheavals

**Example workflow:**
1. User explores "Mediterranean trade network, 1200-1400 CE"
2. WHG retrieves Network Thing and traverses edges to find all Attestations with:
   - `typed_by` → AUTHORITY(connected_to)
   - Timespan overlap with query period
3. Filters connections by Timespan attestations
4. Visualizes graph with:
   - Node sizes: trade volume (from connection_metadata in Attestation nodes)
   - Edge thickness: connection intensity
   - Color: connection type (trade, diplomatic, etc.)
   - Timeline slider: watch network evolution 1200→1400 by filtering Timespan links

---

### Contribution-Friendly Infrastructure

**What it is:**
Low-barrier entry for diverse contribution formats with professional-grade outputs.

**How the model supports it:**
- **Multiple ingest formats**: LPF JSON, CSV, spreadsheets, GPX, edge lists
- **Flexible structure**: Routes, itineraries, networks, gazetteers all accommodated via Thing classifications
- **DOI minting**: Contributors receive citable dataset DOIs stored in AUTHORITY(dataset) documents
- **Source attribution**: Every contribution's DOI embedded in AUTHORITY documents linked via `sourced_by` edges
- **Transformation layer**: Automatic conversion to graph model (Things, Attestations, edges) with validation
- **Incremental contributions**: Add to existing datasets without full re-import via graph updates

**Use cases:**
- Historian contributes Excel spreadsheet of medieval trade fairs
- Archaeologist uploads GPS tracks from field survey
- Digital project imports LPF from existing database
- Crowdsourced route reconstructions from historical accounts
- Student research project adds itinerary from travel diary

**Example workflow:**
1. Contributor uploads CSV of historical postal stations
2. WHG validates columns, prompts for missing metadata
3. Generates Thing nodes, Name nodes, Geometry nodes, Attestation nodes, and connecting edges
4. Creates AUTHORITY(dataset) document with DOI: `doi:10.83427/whg-dataset-789`
5. Links all Attestations to dataset AUTHORITY via `sourced_by` edges
6. Indexes in graph with full reconciliation
7. Dataset becomes discoverable, queryable, citable

---

### Attestation-Based Provenance

**What it is:**
Every claim is sourced; every source is transparent and traceable.

**How it works:**
Every claim in WHG is represented as an attestation node (document) in the attestations collection, connected via edges to:
- The Thing being described (via `subject_of` edge)
- The attribute being claimed (Name, Geometry, Timespan via `attests_*` edges)
- Or another Thing for relationships (via `typed_by` and `relates_to` edges)
- Sources supporting the claim (via `sourced_by` edges to Authority documents)

This graph structure enables complete provenance chains: follow edges from any claim back to its sources, and from sources forward to all claims they support.

**How the model supports it:**
- **Required source links**: No Attestation without edge to AUTHORITY(source) document
- **Source edges**: Multiple supporting AUTHORITY documents via multiple `sourced_by` edges
- **Source types**: Nature of evidence categorized in AUTHORITY documents
- **Certainty with notes**: Quantitative and qualitative confidence assessment in Attestation nodes
- **Django changelog**: Creation/modification history separate from historical sources
- **DOI integration**: Dataset-level provenance through AUTHORITY documents with persistent identifiers
- **Graph traversal**: Follow edges from any claim to its sources

**Use cases:**
- Evaluating trustworthiness of place data for research
- Teaching source criticism with transparent evidence chains
- Auditing data quality across contributed datasets
- Legal/heritage contexts requiring documented provenance
- Reproducing analyses with full source transparency

**Example workflow:**
1. Researcher finds claim "Angkor Wat built 1113-1150 CE"
2. Clicks on Attestation to traverse graph and view:
   - Following `sourced_by` edges to Authority documents:
      - "Khmer inscriptions at site" (source_type: "inscription")
      - "Barth 1885" (source_type: "published")
      - "doi:10.xxxx/angkor-survey" (source_type: "archaeological")
   - Certainty: 0.98 (stored in attestation document)
   - Certainty note: "Multiple corroborating inscriptions with regnal dates"
3. Can follow DOI to original dataset Authority, view inscriptions, assess reliability
4. Cites WHG attestation with full provenance chain in publication

---

### Cross-Cultural Representation

**What it is:**
Not Eurocentric; truly global with multilingual, multi-script support.

**How the model supports it:**
- **Unicode throughout**: Names in original scripts preserved in Name documents
- **Language codes**: ISO 639 language identification for all names
- **Script codes**: ISO 15924 script identification
- **Transliteration**: Romanized forms alongside original in Name documents
- **IPA phonetics**: Pronunciation guidance for cross-linguistic matching
- **Vector embeddings**: Semantic similarity across languages in Name documents
- **Name type arrays**: ethnonyms, chrononyms, hagionyms capture cultural naming practices
- **Multiple name types**: Same name can be toponym + ethnonym (e.g., "Hellas")
- **Attestation model**: Different communities' claims about same place coexist via separate Attestations

**Use cases:**
- Chinese historical GIS with traditional characters and pinyin
- Arabic/Persian place names with proper script and transliteration
- Indigenous place names alongside colonial exonyms
- Comparing endonyms vs. exonyms across cultures
- Phonetic matching for oral tradition documentation

**Example workflow:**
1. User searches for places related to "唐朝" (Tang Dynasty)
2. WHG recognizes Chinese characters, searches Name embeddings
3. Returns results with:
   - Chinese names: 長安, 洛陽 (from Name documents)
   - English names: Chang'an, Luoyang (from separate Name documents)
   - Pinyin transliterations: Cháng'ān, Luòyáng (in Name documents)
4. User can filter by language, view all name variants linked to same Thing via Attestations
5. Phonetic search finds related names in Japanese/Korean borrowings

---

### Historical Dynamism

**What it is:**
Places change: borders shift, cities move, territories fragment and coalesce.

**How the model supports it:**
- **Multiple geometries over time**: Different boundaries attested via separate Attestation nodes with different Timespan links
- **Geometry inheritance**: Territories computed from constituent regions via graph traversal of `member_of` relationships
- **Succession chains**: `succeeds` relation via AUTHORITY tracks place continuity/replacement through Attestations
- **Coextensivity**: `coextensive_with` relation marks spatial equivalences
- **Network evolution**: Connections appear/disappear over time via Attestations with different Timespans
- **Period computation**: Territory bounds derived from member places via graph aggregation

**Use cases:**
- Animating territorial changes of empires over centuries
- Understanding city relocations (e.g., capital shifts)
- Mapping fragmentation (Roman Empire → successor kingdoms)
- Tracking port importance through network connection evolution
- Comparing claimed vs. actual territorial control

**Example workflow:**
1. User queries "Abbasid Caliphate territory over time"
2. WHG finds Thing with multiple Timespan attestations
3. For each period, traverses graph to find members via `member_of` Attestations
4. Computes inherited geometry from members
5. Timeline visualization shows:
   - 750 CE: Full extent (inherited from ~100 provinces via graph traversal)
   - 900 CE: Fragmented (many provinces now have separate Attestations)
   - 1100 CE: Reduced to core (few remaining member links)
6. User sees both formal claims and actual control reflected in Attestation structure

---

## Researcher Workflow Examples

### Digital Humanities: Text Mining Historical Corpus

**Scenario:** Extract and map place references from medieval travel accounts.

**Workflow:**
1. Use NER/NLP to extract place names from texts
2. Submit candidate names to WHG reconciliation API with temporal context
3. WHG returns ranked matches with period-appropriate toponyms via Name embedding search and Timespan filtering
4. Researcher reviews matches, confirms or rejects via UI
5. WHG creates new Attestation nodes with `same_as` relationships:
   ```
   Text Thing ←[subject_of]← Attestation ─[typed_by]→ AUTHORITY(same_as)
                                        ├─[relates_to]→ Authority Thing
                                        └─[sourced_by]→ AUTHORITY(user's dataset)
   ```
6. Researcher exports reconciled dataset with coordinates for mapping
7. Cites WHG with dataset DOI from AUTHORITY document for reproducibility

---

### Historical Geography: Reconstructing Trade Routes

**Scenario:** Map and analyze Hanseatic League trade routes 1300-1450.

**Workflow:**
1. Contributor uploads CSV of Hanse cities with membership dates
2. WHG creates Thing nodes with Attestations linking to Timespan entities for each city
3. Contributor adds network edges (city-to-city connections) with trade volume data
4. WHG creates Network Thing with Attestation nodes containing:
   - `connection_metadata` with trade volumes
   - `typed_by` → AUTHORITY(connected_to)
   - `relates_to` → target city Things
   - `attests_timespan` → temporal ranges
5. Researcher queries network filtered by date ranges via Timespan edge traversal
6. Exports network data for SNA (social network analysis)
7. Publishes findings with WHG dataset DOI from AUTHORITY document

---

### Archaeology: Site Documentation and Reconciliation

**Scenario:** Archaeological project documenting Bronze Age sites in Anatolia.

**Workflow:**
1. Field team collects GPS coordinates and site descriptions
2. Uploads GPX tracks and site metadata
3. WHG creates Thing nodes with:
   - Geometry nodes linked via Attestations
   - Classification via Attestation → AUTHORITY(archaeological_site)
4. Reconciliation suggests links to existing gazetteers (Pleiades, ANE) via same_as
5. Team confirms matches, creates same_as Attestation nodes
6. Adds period Timespan attestations linking to "Early Bronze Age Anatolia" Thing
7. Links sites to period Thing via member_of Attestations
8. Dataset receives DOI in AUTHORITY document, becomes part of WHG's indexed corpus

---

### Migration Studies: Tracking Historical Populations

**Scenario:** Document Bantu migrations across Africa 1000 BCE - 500 CE.

**Workflow:**
1. Researcher compiles evidence from linguistics, archaeology, genetics
2. Creates Itinerary Thing representing migration path
3. Adds segments as Things with Attestations containing:
   - `sequence` field for ordering
   - `typed_by` → AUTHORITY(member_of)
   - `attests_timespan` → approximate dates of occupation
   - `certainty` scores reflecting uncertainty
4. Links to linguistic evidence (ethnonyms in Name documents) and archaeological sites
5. Multiple AUTHORITY(source) documents represent different evidence types
6. Visualizes route with temporal animation by filtering Timespan edges
7. Multiple conflicting models represented as separate Itinerary Things with different Attestations and certainty values

---

## What Sets WHG Apart

### vs. Google Maps / Modern Mapping Platforms
- **Temporal depth**: Google shows present; WHG shows historical change via Timespan attestations
- **Source transparency**: WHG exposes evidence via AUTHORITY documents; maps are black boxes
- **Multiple perspectives**: WHG preserves scholarly debate via separate Attestations; maps show consensus

### vs. Wikipedia / General Encyclopedias
- **Structured data**: WHG is machine-readable graph; Wikipedia is prose
- **Temporal precision**: WHG time-bounds all claims via Attestation → Timespan edges; Wikipedia conflates periods
- **Reconciliation**: WHG links authorities via same_as Attestations; Wikipedia links articles

### vs. Academic Gazetteers (Pleiades, CHGIS, etc.)
- **Cross-gazetteer**: WHG indexes multiple authorities together via same_as graph edges
- **Contribution-friendly**: Lower barrier than specialized gazetteers
- **Modern periods**: Not limited to ancient/medieval (though those are strengths)
- **Networks/routes**: Goes beyond point locations via Network/Route Things

### vs. Search Engines
- **Precision**: Structured queries via graph traversal, not keyword matches
- **Historical context**: Period-specific results via Timespan filtering, not anachronistic modern names
- **Evidence-based**: Sources cited via AUTHORITY documents, not SEO-ranked aggregations

### vs. LLMs (ChatGPT, etc.)
- **Accuracy**: Fact-checked structured data in graph, not generated text
- **Provenance**: Every claim sourced via edges to AUTHORITY; LLMs hallucinate citations
- **Temporality**: Explicit date ranges in Timespan nodes; LLMs conflate time periods
- **Critical engagement**: Multiple sources visible via separate Attestations; LLMs synthesize into false consensus
- **Reproducibility**: Stable identifiers and DOIs in AUTHORITY; LLM outputs are ephemeral
- **Graph structure**: Explicit relationships; LLMs embed relationships in opaque weights

---

## Platform Value Proposition

**For Researchers:**
- Authoritative, citable place data with DOIs in AUTHORITY documents
- Time-aware reconciliation for historical sources via Timespan-filtered graph queries
- API access for computational workflows
- Contribution pathways for new research with automatic graph structure creation

**For Teachers:**
- Source criticism through transparent provenance via AUTHORITY edges
- Historical methods via contested claims in separate Attestations
- Visualization of change over time via Timespan-filtered queries
- Student contribution opportunities

**For Digital Projects:**
- Reconciliation service for place name disambiguation via Name embeddings + same_as graphs
- Linked Data interoperability (namespaced IDs, graph export)
- Export formats (LPF, GeoJSON, CSV, RDF)
- Stable references for citations via DOIs in AUTHORITY

**For Heritage Institutions:**
- Documentation standards (DOIs in AUTHORITY, structured metadata in graph)
- Multilingual/multi-script support in Name nodes
- Indigenous place name preservation with proper attribution via Attestations
- Integration with existing authority files via same_as relationships

**For the Public:**
- Accessible historical geography beyond textbooks
- Discovery of places in historical context via temporal queries
- Understanding of territorial changes via graph visualization
- Free, open platform (no paywalls)

---

## Technical Advantages of Graph Model

The ArangoDB graph structure provides unique capabilities:

**Graph Traversal:**
- Multi-hop queries through attestation nodes and edges (e.g., "find all places connected within 3 steps")
- Path finding following edge chains (e.g., "shortest route between two historical cities")
- Community detection using edge relationships (e.g., "identify trade clusters")

**Example of multi-hop traversal:**
```
Thing → [subject_of edge] → Attestation → [attests_name edge] → Name
↓ [sourced_by edge]
Authority
```

This enables queries like "find all names for things sourced by X" by traversing:
1. Authority → [sourced_by edges, reversed] → Attestations
2. Attestations → [attests_name edges] → Names
3. Attestations → [subject_of edges, reversed] → Things

**Flexible Relationships:**
- New relation types added via AUTHORITY documents without schema changes
- Bidirectional navigation via inverse relations
- Meta-relationships via Attestation-to-Attestation links

**Temporal Filtering:**
- Efficient queries for "active during period X" via Timespan edge filtering
- Network snapshots at different historical moments
- Temporal animation via progressive Timespan filtering

**Provenance Chains:**
- Follow sourced_by edges from any claim to original evidence
- Trace contribution history via dataset AUTHORITY documents
- Audit trails via Django changelog integration

**Scalability:**
- Efficient indexes on graph edges for fast traversal
- Parallel query execution for complex graph patterns
- Incremental updates without full reindexing