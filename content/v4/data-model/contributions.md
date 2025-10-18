# Contribution Types & Data Formats

## Overview

WHG accepts contributions representing different types of historical datasets. All contribution types are mapped to the internal graph data model upon ingestion using the Thing-Attestation-Timespan-Name-Geometry architecture with edges connecting these entities.

---

## Contribution Types

### Gazetteer

A dataset of places sourced from a common historical or geographical context.

**Characteristics in the model:**
- Each place becomes a Thing
- Places may have classification via `typed_by` edges to AUTHORITY documents with GeoNames feature classes or custom classifications
- Places may be grouped under a parent Thing representing the gazetteer dataset itself via `member_of` relationships
- Dataset-level metadata (DOI, title, description) stored in AUTHORITY documents with `authority_type: "dataset"`
- Names, Geometries, and Timespans linked via Attestation nodes and edges

**Examples:**
- **Saxton County Maps**: Places from 16th-century English/Welsh maps
- **Pleiades**: Authoritative ancient Mediterranean places
- **GeoNames**: Global contemporary place names
- **Wikidata**: Structured place entities
- **Getty TGN**: Historical and contemporary curated places
- **DARMC**: Digital Atlas of Roman and Medieval Civilizations
- **CHGIS**: China Historical GIS

**Contribution formats accepted:** LPF JSON, CSV/TSV, spreadsheets

**Mapping to model:**
```
LPF place → Thing
  ├─ properties.title → Name (via Attestation + attests_name edge)
  ├─ names[] → Multiple Name entities (via separate Attestations)
  ├─ geometry/geometries[] → Geometry entities (via Attestations + attests_geometry edges)
  ├─ types[] → Classification (via Attestation + typed_by edge to AUTHORITY)
  ├─ when → Timespan entity (via Attestation + attests_timespan edge)
  └─ relations[] → member_of/same_as (via Attestation + typed_by + relates_to edges)
```

---

### Route

A sequentially-ordered set of places, typically without specific temporal traversal information.

**Characteristics in the model:**
- Container Thing classified via `typed_by` edge to AUTHORITY(classification: "route")
- Member Things (waypoints/segments) linked via Attestations with `sequence` field and `member_of` relation type
- Timespan attestations optional or represent when route existed (not traversal)
- May include path Geometries as separate Things with LineString geometries

**Examples:**
- **Silk Road Dataset**: Ancient trade route locations across Central Asia
- **Roman Roads (ORBIS)**: Roman road network segments with distances
- **Maritime Route Databases**: Historical sea lanes and shipping routes
- **Hajj Route Maps**: Documented pilgrimage paths to Mecca
- **Camino de Santiago**: Medieval pilgrimage route network
- **Via Francigena**: Historic route from Canterbury to Rome

**Contribution formats accepted:**
- LPF JSON (with sequence in relations)
- CSV/TSV with sequence column
- GPX/KML for geometric routes

**Mapping to model:**
```
Route contribution → Thing (typed_by AUTHORITY[classification: "route"])
  ├─ Route name → Name (via Attestation + edges)
  ├─ Waypoint 1 → Thing with Attestation(sequence: 1) + typed_by(member_of) + relates_to(Route)
  ├─ Waypoint 2 → Thing with Attestation(sequence: 2) + typed_by(member_of) + relates_to(Route)
  ├─ Path geometry (optional) → Geometry (LineString via Attestation)
  └─ Route existence period (optional) → Timespan (via Attestation)
```

---

### Itinerary

A route with temporal dimensions indicating when segments were traversed.

**Characteristics in the model:**
- Container Thing classified via `typed_by` edge to AUTHORITY(classification: "itinerary")
- Member Things linked via Attestations with `sequence` field and `member_of` relation type
- **Each segment Attestation has its own Timespan attestation** (via attests_timespan edge)
- Overall itinerary Timespan computed from segment bounds (or explicitly overridden)

**Examples:**
- **Travel Diaries**: Ibn Battuta's Rihla, Marco Polo's travels, Xuanzang's journey to India
- **Military Campaigns**: Napoleon's marches, Alexander the Great's conquests, Crusader routes
- **Voyage Data**: Ships' logs from 18th-19th century (Royal Navy, merchant vessels)
- **Migration Pathways**: Great Atlantic Migration, Bantu migrations, Polynesian expansion
- **Diplomatic Missions**: Embassy journeys, tribute missions, papal legations
- **Scientific Expeditions**: Darwin's Beagle voyage, Humboldt's Americas journey

**Contribution formats accepted:**
- LPF JSON (with when in relations)
- CSV/TSV with date columns for each segment
- Annotated GPX with timestamps

**Mapping to model:**
```
Itinerary contribution → Thing (typed_by AUTHORITY[classification: "itinerary"])
├─ Itinerary name → Name (via Attestation + edges)
├─ Segment 1 → Thing
│   ├─ Attestation document (sequence: 1, certainty: ...) in attestations collection
│   ├─ Edge: things/segment-1 → attestations/att-seg-1 (subject_of)
│   ├─ Edge: attestations/att-seg-1 → authorities/member-of (typed_by)
│   ├─ Edge: attestations/att-seg-1 → things/itinerary (relates_to)
│   └─ Edge: attestations/att-seg-1 → timespans/seg-1-dates (attests_timespan)
├─ Segment 2 → Thing (similar structure with sequence: 2)
└─ Overall timespan (computed or explicit via Attestation + edges)
```

---

### Network

A dataset indicating geospatial connections between places that may not follow a sequence.

**Characteristics in the model:**
- Container Thing classified via `typed_by` edge to AUTHORITY(classification: "network")
- Connections between member Things via Attestations with `connection_metadata` field and `connected_to` relation type
- Connection metadata specifies type, directionality, and domain-specific attributes
- Multiple instances of same connection over time represented by multiple Attestations with different Timespan attestations
- Can reference route Geometries if available, but not required

**Examples:**
- **Communication Networks**: Postal routes, telegraph lines, Pony Express stations
- **Commercial Links**: Sound Toll Registers (Baltic trade), Hanseatic League, Indian Ocean trade
- **Administrative Networks**: Imperial courier systems, colonial governance structures
- **Social/Political Networks**: Treaty networks, dynastic marriage alliances, embassy exchanges
- **Religious Networks**: Monastery networks, diocese connections, pilgrimage site relationships
- **Scholarly Networks**: Medieval universities, Islamic House of Wisdom connections, Republic of Letters

**Contribution formats accepted:**
- LPF JSON with custom relations for connections
- CSV/TSV with source-target pairs and metadata columns
- Edge list formats (from, to, attributes)
- Graph ML/GML formats

**Mapping to model:**
```
Network contribution → Thing (typed_by AUTHORITY[classification: "network"])
  ├─ Network name → Name (via Attestation)
  ├─ Connection 1:
  │   ├─ Thing A ←[subject_of]← Attestation(connection_metadata: {...})
  │   │                                   ├─[typed_by]→ AUTHORITY(connected_to)
  │   │                                   └─[relates_to]→ Thing B
  │   └─ Timespan via attests_timespan edge (when connection existed)
  ├─ Connection 2:
  │   └─ ...
  └─ Network overall timespan (optional via Attestation)
```

---

### Gazetteer Group

A thematic collection of gazetteers sharing common characteristics.

**Characteristics in the model:**
- Container Thing classified via `typed_by` edge to AUTHORITY(classification: "gazetteer_group")
- Member Things (which are themselves gazetteers) linked via Attestations with `member_of` relation type
- Group-level Names and descriptions
- May have Timespan attestations representing the collection's temporal scope

**Examples:**
- **Ancient World Gazetteers**: Pleiades + DARMC + Barrington Atlas + ANE Placemarks
- **Colonial Gazetteers**: British India + French Indochina + Dutch East Indies gazetteers
- **Environmental History Gazetteers**: Historical landscapes, deforestation records, climate-related migrations
- **Religious Networks**: Pilgrimage sites, monasteries, churches, sacred mountains
- **Historical Urban Gazetteers**: Medieval cities + Renaissance cities + Industrial revolution urban centers
- **Maritime Gazetteers**: Ports, lighthouses, naval bases, shipwreck locations

**Contribution formats accepted:**
- Metadata file referencing existing gazetteer IDs
- JSON descriptor with member list
- CSV with gazetteer identifiers and metadata

**Mapping to model:**
```
Gazetteer Group → Thing (typed_by AUTHORITY[classification: "gazetteer_group"])
  ├─ Group name → Name (via Attestation)
  ├─ Member gazetteer 1 → via Attestation + typed_by(member_of) + relates_to(Group)
  ├─ Member gazetteer 2 → via Attestation + typed_by(member_of) + relates_to(Group)
  ├─ Group timespan → Timespan (via Attestation for collection scope)
  └─ Group description → description field in Thing
```

---

## Accepted Formats for All Types

### Linked Places Format (LPF) - JSON

**Primary structured format** following the Linked Places specification.

**Best for:**
- Complex temporality (multiple time periods, uncertain dates)
- Multiple names in different languages/scripts
- Multiple geometries (changing boundaries, uncertain locations)
- Rich relationships between places
- Detailed provenance and source citations

**LPF to Model Mapping:**
- `@id` → Thing `_id`
- `properties.title` → Primary Name entity + Attestation
- `names[]` → Multiple Name entities + Attestations with Timespan linkages
- `geometry` / `geometries[]` → Geometry entities + Attestations
- `types[]` → Classifications via typed_by edges to AUTHORITY
- `when` → Timespan entities + attests_timespan edges
- `relations[]` → Attestations with typed_by + relates_to edges
- `descriptions[]` → Thing `description` field

---

### Delimited Text (CSV/TSV)

**Tabular format** with predefined column mappings.

**Best for:**
- Simple gazetteers with single names/locations
- Bulk imports of straightforward place data
- Spreadsheet-based data entry

**Required columns:**
- `id` or auto-generated
- `name` or `title`
- `latitude`, `longitude` or `geometry` (WKT)

**Optional columns:**
- `name_language`, `name_script`, `name_type[]`
- `start_date`, `end_date`, `temporal_precision`
- `type` or `feature_class`
- `source`, `source_type`, `certainty`
- For routes: `sequence`
- For networks: `target_id`, `connection_type`, `directionality`

---

### Spreadsheets

**Excel/Google Sheets** with template structures.

**Best for:**
- Collaborative data entry
- Projects with non-technical contributors
- Iterative dataset development

**Template types:**
- Gazetteer template: one row per place
- Route template: one row per waypoint with sequence
- Itinerary template: includes date columns
- Network template: edge list with source/target columns

---

### RDF/Turtle Format

For contributors working with semantic web technologies or existing RDF datasets,
WHG may in future accept contributions in Turtle (`.ttl`) format. See the complete
[RDF Representation guide](rdf-representation.md) for details, examples, and validation requirements.

### Geographic Formats

**GPX, KML, GeoJSON** with WHG extensions.

**Best for:**
- Route geometries with waypoints
- Itineraries with GPS tracks
- Modern field-collected data

**Mapping:**
- Track/path → Route Thing with LineString Geometry
- Waypoints → Member Things with Point Geometries
- Timestamps → Timespan attestations (for itineraries)
- Metadata → Attestation fields and connection_metadata

---

### URL-Referenced Datasets

**Remote dataset URLs** pointing to publicly accessible files.

**Best for:**
- Large datasets hosted in institutional repositories
- Cloud storage contributions (Google Drive, Dropbox with public links, S3 buckets)
- Datasets that update periodically at source
- Integration with existing research infrastructure

**Supported URL targets:**
- Direct file links (CSV, JSON, GeoJSON files)
- Repository URLs (Zenodo, Figshare, institutional repos)
- GitHub raw file URLs
- Cloud storage public links

**Process:**
1. Contributor submits URL with format specification
2. WHG fetches file from URL
3. Validates format and content
4. Processes as standard contribution
5. Optionally monitors URL for updates (contributor can enable periodic re-fetch)

**Example URLs:**
- `https://zenodo.org/record/1234567/files/places.csv`
- `https://raw.githubusercontent.com/org/repo/main/data/gazetteer.json`
- `https://drive.google.com/uc?export=download&id=FILEID`

**Requirements:**
- URL must be publicly accessible (no authentication)
- File format must match declared type
- Recommended: versioned URLs for reproducibility
- Contributor receives DOI for WHG-indexed version

---

## Relationship to Linked Places Format (LPF)

### LPF as Interchange Format

**Linked Places Format (LPF)** is a GeoJSON-based format designed for contributing and exchanging historical place data. It serves as the **interchange format** between WHG and external contributors/consumers.

**Key distinctions:**

| Aspect | LPF | Internal Data Model |
|--------|-----|---------------------|
| Purpose | Data contribution, exchange, export | Internal storage and querying |
| Structure | Document-oriented (places as standalone objects) | Graph-oriented (Things linked via Attestations and edges) |
| Temporality | Embedded in feature properties | Separate Timespan entities connected via edges |
| Optimization | Human readability, ease of contribution | Query performance, analytical capabilities |
| Format | GeoJSON-LD | ArangoDB graph structure |

---

### Bidirectional Transformation

**Ingestion (LPF/CSV → Internal Model):**
- LPF `properties.title` → Name entity + Attestation document + edges (subject_of from Thing to Attestation, attests_name from Attestation to Name)
- LPF `names[]` array → Multiple Name entities + Attestation documents + edges for each name
- LPF `geometry` or `geometries[]` → Geometry entities + Attestations with attests_geometry edges
- LPF `types[]` → Attestations with typed_by edges to AUTHORITY documents
- LPF `when` → Timespan entities + Attestations with attests_timespan edges
- LPF `relations[]` → Attestations with typed_by + relates_to edges (member_of, same_as, connected_to)
- CSV rows → Things with derived Attestations from column values
- Network edge lists → Attestations with connection_metadata and connected_to relation

**Export (Internal Model → LPF):**
- Thing + Attestations + edges → Reconstructed LPF place document
- Timespan Attestations → LPF `when` timespan arrays
- Name Attestations → LPF `names[]` with temporal qualification
- Classification Attestations → LPF `types[]`
- Relationship Attestations → LPF `relations[]`
- Network connections → LPF relations with custom properties

**Key principle**: The internal model is more granular and temporally precise than LPF, allowing for richer querying while maintaining the ability to export back to LPF for interchange.

---

### Data Transformation Layer

The WHG application includes a **transformation layer** that:
- Validates incoming LPF/CSV/GPX against schemas
- Normalizes names, dates, and geographic coordinates
- Creates Thing, Name, Geometry, and Timespan documents
- Generates Attestation nodes and Edge documents connecting them
- Creates AUTHORITY documents for sources and datasets
- Assigns DOIs to contributed datasets (format: `doi:10.83427/whg-{type}-{id}`)
- Stores DOIs in AUTHORITY documents referenced by attestations
- Handles updates and conflicts with existing data
- Provides audit trails in the Django changelog
- Maps contribution types to appropriate Thing classifications via AUTHORITY
- Extracts sequence information for routes/itineraries into Attestation nodes
- Parses connection metadata for networks into Attestation nodes
- Computes vector embeddings for Name entities
- Derives geometric fields (bbox, representative_point, hull) for Geometry entities

This layer is distinct from the core data model and handles the complexity of mapping between interchange formats and the internal optimized graph structure.

**Transformation Architecture:**

The transformation from contribution formats to internal graph structure creates three types of documents:

1. **Entity documents** (in entity collections):
   - Things, Names, Geometries, Timespans, Authorities

2. **Attestation documents** (in attestations collection):
   - Contain only metadata: certainty, notes, sequence, connection_metadata, timestamps
   - No embedded relationships or references to other entities

3. **Edge documents** (in edges collection):
   - Connect attestations to entities with `edge_type` field
   - Enable graph traversal and relationship queries

**Example transformation:**
```javascript
// LPF input
{
  "type": "Feature",
  "properties": {
    "title": "Constantinople"
  },
  "geometry": {...},
  "when": {...}
}

// Creates in graph database:

// 1. Thing document
{ "_id": "things/constantinople", "thing_type": "location" }

// 2. Name document
{ "_id": "names/constantinople-en", "name": "Constantinople" }

// 3. Geometry document
{ "_id": "geometries/const-geom", "geom": {...} }

// 4. Timespan document
{ "_id": "timespans/byzantine", "start_earliest": ..., "end_latest": ... }

// 5. Attestation document (junction node)
{ "_id": "attestations/att-001", "certainty": 0.95 }

// 6. Edge documents (relationships)
{ "_from": "things/constantinople", "_to": "attestations/att-001", "edge_type": "subject_of" }
{ "_from": "attestations/att-001", "_to": "names/constantinople-en", "edge_type": "attests_name" }
{ "_from": "attestations/att-001", "_to": "geometries/const-geom", "edge_type": "attests_geometry" }
{ "_from": "attestations/att-001", "_to": "timespans/byzantine", "edge_type": "attests_timespan" }
```

---

## Editing Contributions

The WHG V4 platform provides comprehensive editing capabilities for both contributors and staff, with all changes tracked in the Django changelog.

### Manual Attestation Creation

**Single attestation creation**:
Contributors and staff can manually create individual Attestation nodes and their connecting edges for existing data through the web interface.

**Use cases:**
- Adding `same_as` attestations to reconcile contributed places with authority gazetteers
- Linking newly discovered relationships between places
- Correcting or adding temporal information
- Adding missing source attributions

**Workflow:**
1. Navigate to Thing record in web interface
2. Click "Add Attestation" button
3. Select relation type from AUTHORITY(relation_type) vocabulary
4. Select or create target entity (Name, Geometry, Timespan, or Thing)
5. Fill in source, certainty, notes
6. Save - creates:
   - Attestation document in attestations collection
   - Edge document from Thing to Attestation (subject_of)
   - Edge document from Attestation to target entity (attests_name/geometry/timespan or relates_to)
   - Edge document from Attestation to relation type Authority (typed_by, if Thing-to-Thing relationship)
   - Edge document from Attestation to Source Authority (sourced_by)
7. All documents immediately indexed for querying

**Graph operations created:**
```javascript
// Documents created:

// 1. Attestation document (in attestations collection)
{
  "_id": "attestations/att-new-001",
  "certainty": 0.9,
  "notes": "User-added attestation",
  "created": "2025-01-15T10:30:00Z",
  "contributor": "user@example.com"
}

// 2. Edge documents (in edges collection)
{
  "_from": "things/some-thing",
  "_to": "attestations/att-new-001",
  "edge_type": "subject_of"
}

{
  "_from": "attestations/att-new-001",
  "_to": "authorities/relation-member-of",
  "edge_type": "typed_by"
}

{
  "_from": "attestations/att-new-001",
  "_to": "things/target-thing",
  "edge_type": "relates_to"
}

{
  "_from": "attestations/att-new-001",
  "_to": "authorities/source-xyz",
  "edge_type": "sourced_by"
}

**Access control:**
- Contributors can add attestations to their own contributed data
- Staff can add attestations to any data
- All additions require source citation (AUTHORITY reference)

---

### Contributor Self-Editing

**New in V4**: Contributors can edit their own contributions directly (not possible in V3).

**Editable elements:**
- Thing descriptions
- Name metadata (language, script, transliteration) in Name documents
- Geometry precision assessments in Geometry documents
- Source citations via AUTHORITY references in attestations
- Certainty scores in Attestation nodes
- Temporal bounds (via Timespan document modifications)

**Workflow:**
1. Contributor logs in and navigates to their dataset
2. Selects record to edit
3. Makes changes in web form
4. Changes validated and saved to appropriate graph documents
5. Updates propagated through the graph
6. Change-logged with contributor attribution

**Constraints:**
- Cannot delete documents created by others
- Cannot modify Attestations created by staff or other contributors
- Cannot change core identifiers (DOIs in AUTHORITY, external IDs)

---

### Whole-Record Editing

Using the same dataset format as their original contribution, contributors can perform bulk operations:

**Replace entire dataset:**
- Upload new version with same DOI
- All records replaced (old version archived)
- Use case: Major revision or correction

**Delete records:**
- Submit CSV/JSON with record IDs to delete
- Thing documents removed (archived in changelog)
- Attestations and edges referencing deleted Things handled appropriately

**Add new records:**
- Submit file with new records (must have unique IDs)
- Processed as incremental contribution
- Added to existing dataset under same DOI in AUTHORITY

**Update existing records:**
- Submit file with modified records (matching existing IDs)
- Updated fields replace old values in appropriate graph documents
- Original values archived in changelog

**Example workflow:**
1. Contributor exports current dataset from WHG
2. Makes changes in spreadsheet/text editor
3. Uploads modified file with operation type selected
4. WHG validates changes (IDs must match for updates)
5. Applies changes to graph documents and re-indexes
6. Sends confirmation email with change summary

**Supported operations per format:**
- **LPF JSON**: All operations (replace, delete, add, update)
- **CSV/TSV**: Add, update, delete (structured format required)
- **Spreadsheets**: Add, update (easiest for non-technical users)

---

### Granular Editing

Focused editing of specific aspects of place records through the web interface.

#### Reconciliation

**What it is:**
Assessment and selection of potential matches to other indexed places.

**Process:**
1. WHG automatically suggests potential matches based on:
    - Feature class similarity (via typed_by edges)
    - Toponym similarity (using Name embeddings)
    - Country code matches
    - Geometric proximity
2. Contributor reviews suggestions
3. Selects matches that represent the same historical entity
4. Creates `same_as` attestations (via AUTHORITY[same_as relation])
5. Can reject suggestions explicitly

**Graph operations created:**
```
Thing A ←[subject_of]← Attestation ─[typed_by]→ AUTHORITY(same_as)
                                   ├─[relates_to]→ Thing B
                                   └─[sourced_by]→ AUTHORITY(reconciliation_source)
```

**Contributor guidance:**
- Select at least one match if good candidates exist
- Do not link to places that are clearly different entities
- Consider temporal context (same place name, different periods)
- Use certainty scores in Attestation to indicate confidence

**Impact:**
- Creates Attestations with same_as relationships
- Enables cross-gazetteer queries via graph traversal
- Improves discovery through authority linkage
- Reflected in LPF export (relations section)

**Automated trigger:**
- Records lacking links trigger reconciliation workflow on contribution
- Can be re-run later if new matches become available

---

#### Geometry Editing

**Default behavior:**
If geometry not provided in original contribution, place inherits geometry from first linked place (via reconciliation).

**Contributor options:**

**Select from reconciled places:**
- Choose geometry from any single linked place
- Use combined geometries of all linked places (union)
- Use automatically-generated representative point (centroid of union)

**Manual drawing:**
Contributor can draw custom geometry using map interface:
- **Points**: Mark specific locations
- **Lines**: Draw routes, boundaries, features
- **Polygons**: Delineate territories, regions, extents
- **Mixed**: Combine point, line, polygon features

**Map interface features:**
- Selectable basemaps:
    - Modern (OpenStreetMap, satellite imagery)
    - Historical (georeferenced historical maps where available)
    - Topographic, political, blank canvases
- Drawing tools: point, line, polygon, circle, rectangle
- Snapping to existing features
- Coordinate display and manual entry
- Measurement tools (distance, area)
- Layer management (show/hide reference data)

**Precision documentation:**
When drawing manually, contributor prompted to specify:
- `precision`: "exact", "approximate", "representative"
- `precision_km`: Estimated uncertainty in kilometers
- Source for geometry (stored in AUTHORITY, referenced via sourced_by edge)

**Graph operations:**
- Creates new Geometry document
- Creates new Attestation node
- Creates edges: subject_of, attests_geometry, sourced_by
- Replaces inherited geometry with explicit geometry

**Impact:**
- Updates reflected in LPF export
- Enables downloads of augmented datasets

---

### Staff Editing

**Extended permissions for WHG staff:**

**All contributor capabilities plus:**
- Edit any contributor's data (with attribution in changelog)
- Merge duplicate Things (combining Attestations)
- Bulk operations across datasets
- Create network/route/itinerary structures from existing places
- Modify classification attestations (typed_by edges)
- Correct errors in any attestation or edge

**Quality assurance workflows:**
- Review flagged records (community reports)
- Validate suspect geometry
- Resolve conflicting attestations via meta-attestations
- Standardize inconsistent metadata

**Curation operations:**
- Create period Things from PeriodO imports
- Build gazetteer group collections
- Link major authority gazetteers
- Maintain namespace mappings in AUTHORITY

---

### Change Logging

**All editing operations** (manual attestations, self-edits, bulk updates, granular edits, staff changes) are recorded in the Django changelog.

**Logged information:**
- Timestamp of change
- User ID (contributor or staff)
- Operation type (create, update, delete)
- Entity affected (Thing, Name, Geometry, Timespan, Attestation, Edge, Authority)
- Collection affected (things, names, geometries, timespans, attestations, edges, authorities)
- Old values (for updates/deletes)
- New values (for creates/updates)
- Rationale (optional free-text note)

**Changelog uses:**
- Audit trail for accountability
- Revert capability for error correction
- Contributor attribution for citations
- Quality metrics (edit frequency, types)
- Research on data evolution

**Access:**
- Contributors can view their own changelog
- Staff can view all changes
- Public changelog available for transparency (user IDs anonymized)

---

### Augmented Dataset Downloads

**Key feature**: Edits made through the web interface are reflected in downloadable datasets.

**Download options:**
- **Original format**: As originally uploaded
- **Augmented LPF**: Original data + added attestations/geometry
- **Full LPF**: Complete representation with all relationships
- **CSV**: Simplified tabular format
- **GeoJSON**: Geographic features for mapping

**Augmentation includes:**
- Reconciliation links (same_as relations via Attestations)
- Added or corrected geometry
- Manual attestations created via UI
- Temporal data added post-contribution
- Source citations added by staff (AUTHORITY references)

**Versioning:**
- Each download stamped with version date
- Original submission always available
- Diffs available showing augmentations

**Citation:**
- Downloads include DOI from AUTHORITY(dataset)
- Augmentations attributed to contributors/staff
- Encourage citation of both original and augmented versions