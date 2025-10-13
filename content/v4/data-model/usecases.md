# Platform Use Cases

## 1. Overview

The World Historical Gazetteer serves multiple complementary functions that distinguish it from general-purpose mapping platforms, search engines, and their LLM successors. This section outlines key use cases that the data model is designed to support.

---

## 2. Core Platform Capabilities

### 2.1 Reconciliation Service

**What it is:**
A unified authority file service that matches place references against multiple authoritative gazetteers and curated contributions.

**How the model supports it:**
- **Unified index**: All creditable public data (Pleiades, GeoNames, Wikidata, TGN) plus curated WHG contributions indexed together
- **Namespaced IDs**: External IDs preserved (e.g., `pleiades:579885`) enabling cross-reference
- **Name embeddings**: Vector similarity search enables fuzzy matching across languages and scripts
- **Temporal awareness**: Reconciliation considers when a name was used, not just spatial proximity
- **Multiple attestations**: Conflicting sources represented, allowing confidence-weighted matching

**Use cases:**
- Digital humanities projects reconciling place names in historical texts
- Archaeological databases linking sites to multiple gazetteer authorities
- Historical GIS projects requiring temporal place name resolution
- Cultural heritage projects with multilingual place references

**Example workflow:**
1. User submits: "Eboracum, 2nd century CE"
2. WHG searches Name embeddings for "Eboracum"
3. Filters candidates by Timespan attestations (overlapping with 2nd century)
4. Returns ranked matches with confidence scores and source attributions
5. User selects `pleiades:89167` with WHG providing `same_as` attestation

---

### 2.2 Temporal Gazetteering

**What it is:**
Not just "where" but "when was it called X and where was it located then."

**How the model supports it:**
- **Timespan entities**: Separate temporal bounds from place concepts
- **Temporal attestations**: Names, geometries, classifications all time-bound via attestations
- **Multiple temporal claims**: Conflicting sources about dates represented as separate attestations
- **PeriodO integration**: Standard period definitions accessible as Timespan entities
- **Inheritance**: Temporal bounds computed for periods and collections from members

**Use cases:**
- "What was Chang'an's extent during the Tang Dynasty?"
- "Show me all places in Roman Britain with their 2nd-century names"
- "When was Constantinople renamed Istanbul?"
- "Map the changing boundaries of the Abbasid Caliphate over time"

**Example workflow:**
1. User queries: "Places in Tang Dynasty period"
2. WHG resolves `periodo:p0tang` as Timespan (618-907 CE)
3. Finds all Subjects with `member_of` attestations to Tang Dynasty Subject
4. For each, retrieves Names with `has_timespan` overlapping 618-907
5. Returns contemporary toponyms, not modern names

---

### 2.3 Discovery with Historiographical Depth

**What it is:**
Search and exploration that reveals source complexity, not just "best match" results.

**How the model supports it:**
- **Multiple attestations**: Same claim from different sources stored separately
- **Source arrays**: Multiple sources supporting single attestation
- **Certainty scores**: Evidence quality explicitly recorded
- **Provenance**: Every claim traceable to historical evidence via `source` field
- **Conflicting claims**: Different geometries/dates/names from different sources all visible

**Superiority over search engines/LLMs:**
- LLMs flatten sources into single synthesis, hiding uncertainty
- Search engines prioritize recency and popularity, not historical accuracy
- WHG preserves multiple scholarly perspectives, contested claims, and source reliability
- Enables critical historical inquiry, not just answer retrieval

**Use cases:**
- Comparing different reconstructions of ancient city locations
- Evaluating reliability of place claims in medieval texts
- Understanding scholarly debates about territorial extents
- Teaching historical methods through source comparison

**Example workflow:**
1. User searches for "Troy location"
2. WHG returns multiple Geometry attestations:
   - Archaeological: Hisarlik (certainty: 0.95, source: excavations)
   - Homeric: Legendary location (certainty: 0.3, source: Iliad)
   - Medieval: Various claimed sites (certainty: 0.1, sources: pilgrimage accounts)
3. User can compare sources, timespans, and certainty assessments
4. Results enable critical evaluation, not passive consumption

---

### 2.4 Network, Route, and Itinerary Support

**What it is:**
Not just static places, but connections, movements, and relationships through time.

**How the model supports it:**
- **Route Subjects**: Sequential waypoints without temporal constraints
- **Itinerary Subjects**: Journeys with segment-level temporal data
- **Network Subjects**: Connection graphs with typed edges and metadata
- **Sequence field**: Ordered segments for routes/itineraries
- **connected_to relations**: Network edges with directionality and attributes
- **Temporal dynamics**: Networks evolving over time through multiple attestations

**Use cases:**
- Reconstructing Silk Road trade routes with waypoint sequences
- Analyzing Marco Polo's journey with dates at each location
- Mapping medieval pilgrimage networks and their evolution
- Studying postal system efficiency through connection metadata
- Visualizing trade network changes during political upheavals

**Example workflow:**
1. User explores "Mediterranean trade network, 1200-1400 CE"
2. WHG retrieves Network Subject with `connected_to` attestations
3. Filters connections by Timespan overlap with query period
4. Visualizes graph with:
   - Node sizes: trade volume (from connection_metadata)
   - Edge thickness: connection intensity
   - Color: connection type (trade, diplomatic, etc.)
   - Timeline slider: watch network evolution 1200→1400

---

### 2.5 Contribution-Friendly Infrastructure

**What it is:**
Low-barrier entry for diverse contribution formats with professional-grade outputs.

**How the model supports it:**
- **Multiple ingest formats**: LPF JSON, CSV, spreadsheets, GPX, edge lists
- **Flexible structure**: Routes, itineraries, networks, gazetteers all accommodated
- **DOI minting**: Contributors receive citable dataset DOIs (`doi:10.83427/whg-dataset-{id}`)
- **Source attribution**: Every contribution's DOI embedded in attestation sources
- **Transformation layer**: Automatic conversion to internal model with validation
- **Incremental contributions**: Add to existing datasets without full re-import

**Use cases:**
- Historian contributes Excel spreadsheet of medieval trade fairs
- Archaeologist uploads GPS tracks from field survey
- Digital project imports LPF from existing database
- Crowdsourced route reconstructions from historical accounts
- Student research project adds itinerary from travel diary

**Example workflow:**
1. Contributor uploads CSV of historical postal stations
2. WHG validates columns, prompts for missing metadata
3. Generates Subjects, Names, Geometries, Attestations
4. Mints DOI: `doi:10.83427/whg-dataset-789`
5. Indexes in Vespa with full reconciliation
6. Dataset becomes discoverable, queryable, citable

---

### 2.6 Attestation-Based Provenance

**What it is:**
Every claim is sourced; every source is transparent and traceable.

**How the model supports it:**
- **Required source field**: No attestation without evidence citation
- **Source arrays**: Multiple supporting sources explicitly listed
- **Source types**: Nature of evidence (inscription, manuscript, dataset, etc.) categorized
- **Certainty with notes**: Quantitative and qualitative confidence assessment
- **Django changelog**: Creation/modification history separate from historical sources
- **DOI integration**: Dataset-level provenance through persistent identifiers

**Use cases:**
- Evaluating trustworthiness of place data for research
- Teaching source criticism with transparent evidence chains
- Auditing data quality across contributed datasets
- Legal/heritage contexts requiring documented provenance
- Reproducing analyses with full source transparency

**Example workflow:**
1. Researcher finds claim "Angkor Wat built 1113-1150 CE"
2. Clicks on attestation to view:
   - Sources: ["Khmer inscriptions at site", "Barth 1885", "doi:10.xxxx/angkor-survey"]
   - Source types: ["inscription", "published", "archaeological"]
   - Certainty: 0.98
   - Certainty note: "Multiple corroborating inscriptions with regnal dates"
3. Can follow DOI to original dataset, view inscriptions, assess reliability
4. Cites WHG attestation with full provenance chain in publication

---

### 2.7 Cross-Cultural Representation

**What it is:**
Not Eurocentric; truly global with multilingual, multi-script support.

**How the model supports it:**
- **Unicode throughout**: Names in original scripts preserved
- **Language codes**: ISO 639 language identification for all names
- **Script codes**: ISO 15924 script identification
- **Transliteration**: Romanized forms alongside original
- **IPA phonetics**: Pronunciation guidance for cross-linguistic matching
- **Vector embeddings**: Semantic similarity across languages
- **Name type arrays**: ethnonyms, chrononyms, hagionyms capture cultural naming practices
- **Multiple name types**: Same name can be toponym + ethnonym (e.g., "Hellas")

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
   - Chinese names: 長安, 洛陽
   - English names: Chang'an, Luoyang
   - Pinyin transliterations: Cháng'ān, Luòyáng
4. User can filter by language, view all name variants
5. Phonetic search finds related names in Japanese/Korean borrowings

---

### 2.8 Historical Dynamism

**What it is:**
Places change: borders shift, cities move, territories fragment and coalesce.

**How the model supports it:**
- **Multiple geometries over time**: Different boundaries attested for different periods
- **Geometry inheritance**: Territories computed from constituent regions
- **Succession chains**: `succeeds` relation tracks place continuity/replacement
- **Coextensivity**: `coextensive_with` marks spatial equivalences
- **Network evolution**: Connections appear/disappear over time
- **Period computation**: Territory bounds derived from member places

**Use cases:**
- Animating territorial changes of empires over centuries
- Understanding city relocations (e.g., capital shifts)
- Mapping fragmentation (Roman Empire → successor kingdoms)
- Tracking port importance through network connection evolution
- Comparing claimed vs. actual territorial control

**Example workflow:**
1. User queries "Abbasid Caliphate territory over time"
2. WHG finds Subject with multiple Timespan attestations
3. For each period, computes inherited geometry from members
4. Timeline visualization shows:
   - 750 CE: Full extent (inherited from ~100 provinces)
   - 900 CE: Fragmented (many provinces now independent)
   - 1100 CE: Reduced to core (few remaining members)
5. User sees both formal claims and actual control reflected in data

---

## 3. Researcher Workflow Examples

### 3.1 Digital Humanities: Text Mining Historical Corpus

**Scenario:** Extract and map place references from medieval travel accounts.

**Workflow:**
1. Use NER/NLP to extract place names from texts
2. Submit candidate names to WHG reconciliation API with temporal context
3. WHG returns ranked matches with period-appropriate toponyms
4. Researcher reviews matches, confirms or rejects via UI
5. WHG creates `same_as` attestations linking text references to authority IDs
6. Researcher exports reconciled dataset with coordinates for mapping
7. Cites WHG in publication with DOI for reproducibility

---

### 3.2 Historical Geography: Reconstructing Trade Routes

**Scenario:** Map and analyze Hanseatic League trade routes 1300-1450.

**Workflow:**
1. Contributor uploads CSV of Hanse cities with membership dates
2. WHG creates Subjects with Timespan attestations for each city
3. Contributor adds network edges (city-to-city connections) with trade volume data
4. WHG creates Network Subject with `connected_to` attestations
5. Researcher queries network filtered by date ranges
6. Exports network data for SNA (social network analysis)
7. Publishes findings with WHG dataset DOI

---

### 3.3 Archaeology: Site Documentation and Reconciliation

**Scenario:** Archaeological project documenting Bronze Age sites in Anatolia.

**Workflow:**
1. Field team collects GPS coordinates and site descriptions
2. Uploads GPX tracks and site metadata
3. WHG creates Subjects with Geometries and classification (`has_type: "archaeological_site"`)
4. Reconciliation suggests links to existing gazetteers (Pleiades, ANE)
5. Team confirms matches, adds period Timespan attestations
6. Links sites to period Subject "Early Bronze Age Anatolia"
7. Dataset receives DOI, becomes part of WHG's indexed corpus

---

### 3.4 Migration Studies: Tracking Historical Populations

**Scenario:** Document Bantu migrations across Africa 1000 BCE - 500 CE.

**Workflow:**
1. Researcher compiles evidence from linguistics, archaeology, genetics
2. Creates Itinerary Subject representing migration path
3. Adds segments with Timespan attestations (approximate dates of occupation)
4. Includes uncertainty via certainty scores and notes
5. Links to linguistic evidence (ethnonyms) and archaeological sites
6. Visualizes route with temporal animation
7. Multiple conflicting models represented as separate itineraries with different certainty

---

## 4. What Sets WHG Apart

### 4.1 vs. Google Maps / Modern Mapping Platforms
- **Temporal depth**: Google shows present; WHG shows historical change
- **Source transparency**: WHG exposes evidence; maps are black boxes
- **Multiple perspectives**: WHG preserves scholarly debate; maps show consensus

### 4.2 vs. Wikipedia / General Encyclopedias
- **Structured data**: WHG is machine-readable; Wikipedia is prose
- **Temporal precision**: WHG time-bounds all claims; Wikipedia conflates periods
- **Reconciliation**: WHG links authorities; Wikipedia links articles

### 4.3 vs. Academic Gazetteers (Pleiades, CHGIS, etc.)
- **Cross-gazetteer**: WHG indexes multiple authorities together
- **Contribution-friendly**: Lower barrier than specialized gazetteers
- **Modern periods**: Not limited to ancient/medieval (though those are strengths)
- **Networks/routes**: Goes beyond point locations

### 4.4 vs. Search Engines
- **Precision**: Structured queries, not keyword matches
- **Historical context**: Period-specific results, not anachronistic modern names
- **Evidence-based**: Sources cited, not SEO-ranked aggregations

### 4.5 vs. LLMs (ChatGPT, etc.)
- **Accuracy**: Fact-checked structured data, not generated text
- **Provenance**: Every claim sourced; LLMs hallucinate citations
- **Temporality**: Explicit date ranges; LLMs conflate time periods
- **Critical engagement**: Multiple sources visible; LLMs synthesize into false consensus
- **Reproducibility**: Stable identifiers and DOIs; LLM outputs are ephemeral

---

## 5. Platform Value Proposition

**For Researchers:**
- Authoritative, citable place data with DOIs
- Time-aware reconciliation for historical sources
- API access for computational workflows
- Contribution pathways for new research

**For Teachers:**
- Source criticism through transparent provenance
- Historical methods via contested claims
- Visualisation of change over time
- Student contribution opportunities

**For Digital Projects:**
- Reconciliation service for place name disambiguation
- Linked Data interoperability (namespaced IDs)
- Export formats (LPF, GeoJSON, CSV)
- Stable references for citations

**For Heritage Institutions:**
- Documentation standards (DOIs, structured metadata)
- Multilingual/multi-script support
- Indigenous place name preservation
- Integration with existing authority files

**For the Public:**
- Accessible historical geography beyond textbooks
- Discovery of places in historical context
- Understanding of territorial changes and cultural connections
- Free, open platform (no paywalls)