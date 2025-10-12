# Part 5: Contribution Types & Data Formats

## 1. Overview

WHG accepts contributions representing different types of historical datasets. All contribution types are mapped to the internal data model upon ingestion using the Subject-Attestation-Timespan-Name-Geometry architecture.

---

## 2. Contribution Types

### 2.1 Gazetteer

A dataset of places sourced from a common historical or geographical context.

**Characteristics in the model:**
- Each place becomes a Subject
- Places may have `has_type` attestations to GeoNames feature classes or custom classifications
- Places may be grouped under a parent Subject representing the gazetteer dataset itself
- Dataset-level metadata (DOI, title, description) attached to parent Subject
- Names, Geometries, and Timespans linked via attestations

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
LPF place → Subject
  ├─ LPF properties.title → Name (has_name attestation)
  ├─ LPF names[] → Multiple Name attestations
  ├─ LPF geometry/geometries[] → Geometry attestations
  ├─ LPF types[] → Classification attestations (has_type)
  ├─ LPF when → Timespan + has_timespan attestation
  └─ LPF relations[] → member_of/same_as attestations
```

---

### 2.2 Route

A sequentially-ordered set of places, typically without specific temporal traversal information.

**Characteristics in the model:**
- Container Subject classified with `has_type` → "route"
- Member Subjects (waypoints/segments) linked via `member_of` with `sequence` field
- Timespan attestations optional or represent when route existed (not traversal)
- May include path Geometries as separate Subjects with LineString geometries

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
Route contribution → Subject (has_type: "route")
  ├─ Route name → Name attestation
  ├─ Waypoint 1 → Subject with member_of (sequence: 1)
  ├─ Waypoint 2 → Subject with member_of (sequence: 2)
  ├─ Path geometry (optional) → Geometry (LineString)
  └─ Route existence period (optional) → Timespan attestation
```

---

### 2.3 Itinerary

A route with temporal dimensions indicating when segments were traversed.

**Characteristics in the model:**
- Container Subject classified with `has_type` → "itinerary"
- Member Subjects linked via `member_of` with `sequence`
- **Each segment's `member_of` attestation has its own `has_timespan` attestation**
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
Itinerary contribution → Subject (has_type: "itinerary")
  ├─ Itinerary name → Name attestation
  ├─ Segment 1 → Subject
  │   ├─ member_of attestation (sequence: 1)
  │   └─ has_timespan → Timespan (traversal dates)
  ├─ Segment 2 → Subject
  │   ├─ member_of attestation (sequence: 2)
  │   └─ has_timespan → Timespan (traversal dates)
  └─ Overall timespan (computed or explicit)
```

---

### 2.4 Network

A dataset indicating geospatial connections between places that may not follow a sequence.

**Characteristics in the model:**
- Container Subject classified with `has_type` → "network"
- Connections between member Subjects via `connected_to` attestations
- Connection metadata specifies type, directionality, and domain-specific attributes
- Multiple instances of same connection over time represented by multiple attestations with different Timespan attestations
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
Network contribution → Subject (has_type: "network")
  ├─ Network name → Name attestation
  ├─ Connection 1:
  │   ├─ Subject A connected_to Subject B
  │   ├─ connection_metadata: {type, directionality, ...}
  │   └─ has_timespan → Timespan (when connection existed)
  ├─ Connection 2:
  │   └─ ...
  └─ Network overall timespan (optional)
```

---

### 2.5 Gazetteer Group

A thematic collection of gazetteers sharing common characteristics.

**Characteristics in the model:**
- Container Subject classified with `has_type` → "gazetteer_group"
- Member Subjects (which are themselves gazetteers) linked via `member_of`
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
Gazetteer Group → Subject (has_type: "gazetteer_group")
  ├─ Group name → Name attestation
  ├─ Member gazetteer 1 → member_of attestation
  ├─ Member gazetteer 2 → member_of attestation
  ├─ Group timespan → Timespan attestation (collection scope)
  └─ Group description → description field
```

---

## 3. Accepted Formats for All Types

### 3.1 Linked Places Format (LPF) - JSON

**Primary structured format** following the Linked Places specification.

**Best for:**
- Complex temporality (multiple time periods, uncertain dates)
- Multiple names in different languages/scripts
- Multiple geometries (changing boundaries, uncertain locations)
- Rich relationships between places
- Detailed provenance and source citations

**LPF to Model Mapping:**
- `@id` → Subject `id`
- `properties.title` → Primary Name
- `names[]` → Multiple Name attestations with Timespan linkages
- `geometry` / `geometries[]` → Geometry attestations
- `types[]` → `has_type` attestations
- `when` → Timespan entities + `has_timespan` attestations
- `relations[]` → `member_of`, `same_as`, `connected_to` attestations
- `descriptions[]` → Subject `description` field

---

### 3.2 Delimited Text (CSV/TSV)

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

### 3.3 Spreadsheets

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

### 3.4 Geographic Formats

**GPX, KML, GeoJSON** with WHG extensions.

**Best for:**
- Route geometries with waypoints
- Itineraries with GPS tracks
- Modern field-collected data

**Mapping:**
- Track/path → Route Subject with LineString Geometry
- Waypoints → Member Subjects with Point Geometries
- Timestamps → Timespan attestations (for itineraries)
- Metadata → Attestation fields and connection_metadata

---

### 3.5 URL-Referenced Datasets

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

## 4. Relationship to Linked Places Format (LPF)

### 4.1 LPF as Interchange Format

**Linked Places Format (LPF)** is a GeoJSON-based format designed for contributing and exchanging historical place data. It serves as the **interchange format** between WHG and external contributors/consumers.

**Key distinctions:**

| Aspect | LPF | Internal Data Model |
|--------|-----|---------------------|
| Purpose | Data contribution, exchange, export | Internal storage and querying |
| Structure | Document-oriented (places as standalone objects) | Graph-oriented (subjects linked via attestations) |
| Temporality | Embedded in feature properties | Separate Timespan entities |
| Optimization | Human readability, ease of contribution | Query performance, analytical capabilities |
| Format | GeoJSON-LD | Vespa document schema |

---

### 4.2 Bidirectional Transformation

**Ingestion (LPF/CSV → Internal Model):**
- LPF `properties.title` → Name records with `has_name` attestations
- LPF `names[]` array → Multiple Name records with `has_name` attestations
- LPF `geometry` or `geometries[]` → Geometry records with `has_geometry` attestations
- LPF `types[]` → Classification attestations (`has_type`)
- LPF `when` → Timespan entities + `has_timespan` attestations
- LPF `relations[]` → `member_of`, `same_as`, `connected_to` attestations
- CSV rows → Subjects with derived attestations from column values
- Network edge lists → `connected_to` attestations with metadata

**Export (Internal Model → LPF):**
- Subject + attestations → Reconstructed LPF place document
- Timespan attestations → LPF `when` timespan arrays
- Name attestations → LPF `names[]` with temporal qualification
- Classification attestations → LPF `types[]`
- Relationship attestations → LPF `relations[]`
- Network connections → LPF relations with custom properties

**Key principle**: The internal model is more granular and temporally precise than LPF, allowing for richer querying while maintaining the ability to export back to LPF for interchange.

---

### 4.3 Data Transformation Layer

The WHG application includes a **transformation layer** that:
- Validates incoming LPF/CSV/GPX against schemas
- Normalizes names, dates, and geographic coordinates
- Creates Subject, Name, Geometry, and Timespan records
- Generates appropriate Attestation records with source attribution
- Assigns DOIs to contributed datasets (format: `doi:10.83427/whg-{type}-{id}`)
- Embeds DOIs in attestation sources
- Handles updates and conflicts with existing data
- Provides audit trails in the Django changelog
- Maps contribution types to appropriate Subject classifications
- Extracts sequence information for routes/itineraries
- Parses connection metadata for networks
- Computes vector embeddings for Name entities
- Derives geometric fields (bbox, representative_point, hull) for Geometry entities

This layer is distinct from the core data model and handles the complexity of mapping between interchange formats and the internal optimized structure.

---

## 5. Editing Contributions

The WHG V4 platform provides comprehensive editing capabilities for both contributors and staff, with all changes tracked in the Django changelog.

### 5.1 Manual Attestation Creation

**Single attestation creation**:
Contributors and staff can manually create individual Attestation records for existing data through the web interface.

**Use cases:**
- Adding `same_as` attestations to reconcile contributed places with authority gazetteers
- Linking newly discovered relationships between places
- Correcting or adding temporal information
- Adding missing source attributions

**Workflow:**
1. Navigate to Subject record in web interface
2. Click "Add Attestation" button
3. Select relation type and target object
4. Fill in source, certainty, temporal data (if applicable)
5. Save - attestation immediately indexed and change-logged

**Access control:**
- Contributors can add attestations to their own contributed data
- Staff can add attestations to any data
- All additions require source citation

---

### 5.2 Contributor Self-Editing

**New in V4**: Contributors can edit their own contributions directly (not possible in V3).

**Editable elements:**
- Subject descriptions
- Name metadata (language, script, transliteration)
- Geometry precision assessments
- Source citations in attestations
- Certainty scores
- Temporal bounds (via Timespan modifications)

**Workflow:**
1. Contributor logs in and navigates to their dataset
2. Selects record to edit
3. Makes changes in web form
4. Changes validated and saved
5. Updates propagated to Vespa
6. Change-logged with contributor attribution

**Constraints:**
- Cannot delete records contributed by others
- Cannot modify attestations created by staff or other contributors
- Cannot change core identifiers (DOIs, external IDs)

---

### 5.3 Whole-Record Editing

Using the same dataset format as their original contribution, contributors can perform bulk operations:

**Replace entire dataset:**
- Upload new version with same DOI
- All records replaced (old version archived)
- Use case: Major revision or correction

**Delete records:**
- Submit CSV/JSON with record IDs to delete
- Records removed from index (archived in changelog)
- Attestations referencing deleted records flagged

**Add new records:**
- Submit file with new records (must have unique IDs)
- Processed as incremental contribution
- Added to existing dataset under same DOI

**Update existing records:**
- Submit file with modified records (matching existing IDs)
- Updated fields replace old values
- Original values archived in changelog

**Example workflow:**
1. Contributor exports current dataset from WHG
2. Makes changes in spreadsheet/text editor
3. Uploads modified file with operation type selected
4. WHG validates changes (IDs must match for updates)
5. Applies changes and re-indexes
6. Sends confirmation email with change summary

**Supported operations per format:**
- **LPF JSON**: All operations (replace, delete, add, update)
- **CSV/TSV**: Add, update, delete (structured format required)
- **Spreadsheets**: Add, update (easiest for non-technical users)

---

### 5.4 Granular Editing

Focused editing of specific aspects of place records through the web interface.

#### 5.4.1 Reconciliation

**What it is:**
Assessment and selection of potential matches to other indexed places.

**Process:**
1. WHG automatically suggests potential matches based on:
   - Feature class similarity
   - Toponym similarity (using Name embeddings)
   - Country code matches
   - Geometric proximity
2. Contributor reviews suggestions
3. Selects matches that represent the same historical entity
4. Creates `same_as` attestations with appropriate certainty
5. Can reject suggestions explicitly

**Contributor guidance:**
- Select at least one match if good candidates exist
- Do not link to places that are clearly different entities
- Consider temporal context (same place name, different periods)
- Use certainty scores to indicate confidence

**Impact:**
- Creates `same_as` attestations linking contributed Subject to matched Subjects
- Enables cross-gazetteer queries
- Improves discovery through authority linkage
- Reflected in LPF export (relations section)

**Automated trigger:**
- Records lacking links trigger reconciliation workflow on contribution
- Can be re-run later if new matches become available

---

#### 5.4.2 Geometry Editing

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
- Source for geometry (e.g., "Traced from 1850 map", "GPS survey 2023")

**Impact:**
- Creates new Geometry entity with `has_geometry` attestation
- Replaces inherited geometry with explicit geometry
- Updates reflected in LPF export
- Enables downloads of augmented datasets

---

### 5.5 Staff Editing

**Extended permissions for WHG staff:**

**All contributor capabilities plus:**
- Edit any contributor's data (with attribution in changelog)
- Merge duplicate Subjects
- Bulk operations across datasets
- Create network/route/itinerary structures from existing places
- Modify classification attestations
- Correct errors in any attestation

**Quality assurance workflows:**
- Review flagged records (community reports)
- Validate suspect geometry
- Resolve conflicting attestations
- Standardize inconsistent metadata

**Curation operations:**
- Create period Subjects from PeriodO imports
- Build gazetteer group collections
- Link major authority gazetteers
- Maintain namespace mappings

---

### 5.6 Change Logging

**All editing operations** (manual attestations, self-edits, bulk updates, granular edits, staff changes) are recorded in the Django changelog.

**Logged information:**
- Timestamp of change
- User ID (contributor or staff)
- Operation type (create, update, delete)
- Entity affected (Subject, Name, Geometry, Timespan, Attestation)
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

### 5.7 Augmented Dataset Downloads

**Key feature**: Edits made through the web interface are reflected in downloadable datasets.

**Download options:**
- **Original format**: As originally uploaded
- **Augmented LPF**: Original data + added attestations/geometry
- **Full LPF**: Complete representation with all relationships
- **CSV**: Simplified tabular format
- **GeoJSON**: Geographic features for mapping

**Augmentation includes:**
- Reconciliation links (`same_as` relations)
- Added or corrected geometry
- Manual attestations created via UI
- Temporal data added post-contribution
- Source citations added by staff

**Versioning:**
- Each download stamped with version date
- Original submission always available
- Diffs available showing augmentations

**Citation:**
- Downloads include DOI
- Augmentations attributed to contributors/staff
- Encourage citation of both original and augmented versions