# Overview & Core Entities

#### Overview

This data model separates **conceptual entities** (Subject, Name, Geometry, Timespan) from their **attestations**—the evidentiary claims about those entities. All historical claims—including names, locations, classifications, memberships, temporal bounds, and spatial extents—are recorded as **Attestation records** with explicit source attribution.

This model is designed for internal storage and querying in Vespa. It differs from **Linked Places Format (LPF)**, which serves as the interchange format for contributions and data export. All contribution formats (LPF JSON, CSV, TSV) are mapped to this internal model upon ingestion.

This model is engineered to support the platform's core **Dynamic Clustering Workflow**. This workflow is essential for pre-filtering and grouping records based on adjustable similarity measures across multiple dimensions—spatial, temporal, typological, and toponymic. To facilitate these advanced search and grouping operations, the model requires specific functional features: the Name entity must accommodate vector embeddings to enable fast and accurate semantic and phonetic similarity search during toponymic clustering; the Geometry entity must include derived geometric fields (such as a bounding box and an encompassing hull) to enable efficient, high-performance spatial querying and grouping; and the Attestation record must incorporate a mechanism to leverage defined relationship predicates, allowing for configurable cluster merging based on attested inter-entity relationships (e.g., "coextensive with" or "successor of").

---

## 1. Core Conceptual Entities

These four entity types represent the fundamental concepts in the model.

### 1.1 Subject

A conceptual location, historical entity, collection, period, route, itinerary, or network being modelled. Subjects can be atomic (containing no members) or compositional (containing other Subjects).

**Fields:**
- `id` (String, Required): Namespaced identifier (e.g., `whg:subject-{uuid}`, `doi:10.83427/whg-dataset-657`, `pleiades:579885`)
- `description` (Text, Optional): Free-text description

**Notes:**
- A Subject is a stable conceptual anchor; all temporal, spatial, and classificatory information is attached via Attestation records
- An atomic Subject (e.g., a settlement) is simply a Subject with no attested members
- A compositional Subject (e.g., an empire, itinerary, route, network, or period) has members attested via `member_of` or `connected_to` relationships
- Examples: Tenochtitlan, Abbasid Caliphate, Marco Polo's journey to China, Tang Dynasty period, Silk Road, Atlantic trade network, Mount Fuji, Great Zimbabwe
- **ID Strategy**: 
  - WHG-created: `whg:subject-{uuid}`
  - Contributed datasets: `doi:10.83427/whg-{type}-{id}`
  - External sources: Use namespace from LPF context (e.g., `pleiades:`, `geonames:`, `wikidata:`)
- **Provenance note**: Subject creation and modification history is tracked in the Django application database changelog, not in this core model

---

### 1.2 Name

A name or label used to refer to a Subject. Names can serve multiple semantic functions simultaneously.

**Fields:**
- `id` (String, Required): Namespaced identifier (e.g., `whg:name-{uuid}`)
- `name` (String, Required): The name/label itself
- `language` (String, Required): ISO 639 language code
- `script` (String, Optional): ISO 15924 script code
- `variant` (String, Optional): BCP 47 variant subtag for script variation
- `transliteration` (String, Optional): Romanized form if applicable
- `ipa` (String, Optional): IPA phonetic representation
- `embedding` (Vector, Required): Vector embedding for semantic similarity (required for dynamic clustering)
- `name_type` (Array[String], Required): Types of name (see Name Type Vocabulary)

**Notes:**
- Names are conceptual labels; their temporal validity and association with Subjects is established via Attestation records
- A single Name can have multiple name_types (e.g., "Hellas" is both a toponym and ethnonym)
- Vector embeddings are required to support the Dynamic Clustering Workflow's toponymic similarity search
- Examples: "Tenochtitlan" (Nahuatl toponym), "長安" Chang'an (Chinese toponym), "al-Qāhira" القاهرة (Arabic toponym), "Tang Dynasty" (chrononym), "Swahili" (ethnonym)

---

### 1.3 Geometry

A spatial representation (point, line, polygon, etc.) of a Subject.

**Fields:**
- `id` (String, Required): Namespaced identifier (e.g., `whg:geometry-{uuid}`)
- `geom` (Geometry, Required): Spatial data (GeoJSON, WKT, etc.)
- `representative_point` (Point, Required): Centroid or point-within-polygon (required for efficient spatial clustering)
- `hull` (Geometry, Optional): Union of convex hulls of constituent geometries (points and lines buffered by 1000m)
- `bbox` (Array, Required): Bounding box [minLon, minLat, maxLon, maxLat] (required for efficient spatial queries)
- `precision` (Array[String], Optional): Spatial precision qualifiers (e.g., ["approximate", "centroid"])
- `precision_km` (Array[Float], Optional): Spatial precision in kilometers from multiple sources/analyses
- `source_crs` (String, Required): Coordinate reference system (default: "EPSG:4326" / WGS84)

**Notes:**
- Geometries are spatial representations; their temporal validity and association with Subjects is established via Attestation records
- A single Subject may have multiple Geometries valid at different times (e.g., shifting borders)
- The `source_crs` defaults to WGS84 (EPSG:4326) for interoperability
- Geometry type is implicit in the `geom` field structure
- Derived fields (`representative_point`, `bbox`, `hull`) are required to support the Dynamic Clustering Workflow's spatial grouping operations

**Geometry Inheritance and Computation:**

**Geometry inheritance** can be computed for Subjects lacking explicit Geometry attestations.

**Computation Rules:**

For compositional Subjects (with members):
1. Find all Subjects that are members (via `member_of` attestations)
2. For each member:
   - If it has an explicit Geometry attestation, use that geometry
   - If it has no explicit Geometry, recursively compute its inherited geometry
3. Return the union of all geometries found

**Recursion stops** at each branch when an explicit Geometry is reached.

**Example**:
```
Abbasid Caliphate (no explicit geometry)
  ├─ Iraq (explicit geometry: polygon A)
  ├─ Syria (no explicit geometry)
  │   ├─ Damascus (explicit geometry: point B)
  │   └─ Aleppo (explicit geometry: point C)
  └─ Egypt (explicit geometry: polygon D)

Abbasid Caliphate's inherited geometry = union of (polygon A, point B, point C, polygon D)
```

**Implementation note:** For Vespa performance, inherited geometries should be pre-computed during indexing and stored as materialized fields, not computed at query time.

---

### 1.4 Timespan

A temporal span representing when something existed, occurred, or was valid. Timespans can be precise dates, approximate periods, or references to established period definitions (e.g., PeriodO).

**Fields:**
- `id` (String, Required): Namespaced identifier (e.g., `whg:timespan-{uuid}`, `periodo:p0qhb9d`)
- `start_earliest` (Date, Optional): Earliest possible start date
- `start_latest` (Date, Optional): Latest possible start date
- `stop_earliest` (Date, Optional): Earliest possible end date
- `stop_latest` (Date, Optional): Latest possible end date
- `label` (String, Optional): Human-readable label for the timespan (e.g., "Tang Dynasty", "Bronze Age")
- `precision` (String, Optional): Temporal precision: "exact", "circa", "decade", "century", "millennium", "era"
- `precision_value` (Integer, Optional): Numeric precision in years (e.g., ±50 for circa)

**Notes:**
- Timespans are conceptual temporal bounds; their association with Subjects is established via Attestation records
- PeriodO periods are imported as Timespans with external IDs (e.g., `periodo:p0qhb9d`)
- A Subject can be attested to multiple Timespans (e.g., conflicting sources about dates, or membership in multiple overlapping periods)
- The four-field structure (start_earliest, start_latest, stop_earliest, stop_latest) follows PeriodO's model and accommodates uncertainty
- For exact dates: all four fields have the same value
- For unknown start: `start_earliest` and `start_latest` are null or sentinel values (e.g., `-999999999-01-01`)
- For ongoing/present: `stop_earliest` and `stop_latest` are null or sentinel values (e.g., `9999-12-31`)
- Examples: 
  - Exact: Tang Dynasty 618-907 CE
  - Approximate: Early Bronze Age Anatolia (circa 3000-2000 BCE)
  - PeriodO reference: `periodo:p0qhb9d` (Roman Britain)

**Timespan Inheritance and Computation:**

Similar to Geometry inheritance, **Timespan inheritance** can be computed for Subjects lacking explicit Timespan attestations.

**Computation Rules:**

For compositional Subjects (with members):
1. Find all member Subjects via `member_of` attestations
2. For each member, find its Timespan attestations
3. Compute outer bounds:
   - `start_earliest` = minimum of all member `start_earliest` values
   - `start_latest` = minimum of all member `start_latest` values
   - `stop_earliest` = maximum of all member `stop_earliest` values
   - `stop_latest` = maximum of all member `stop_latest` values

For periods:
- By default, compute from members
- Explicit Timespan attestation overrides computation
- Useful for defining period boundaries that don't perfectly align with member existence

For itineraries:
- Automatically compute from segment Timespans
- Itinerary duration = earliest segment start to latest segment end
- Can be overridden for overall journey context (e.g., preparation/return time)

**Example:**
```
Tang Dynasty period Subject (no explicit Timespan)
  ├─ Member: Chang'an (Timespan: 618-904)
  ├─ Member: Luoyang (Timespan: 618-907)
  └─ Member: Canton (Timespan: 650-900)

Computed Timespan for Tang Dynasty:
  start_earliest: 618
  start_latest: 650
  stop_earliest: 900
  stop_latest: 907
```

**Override example:**
```
Tang Dynasty explicit Timespan attestation:
  start_earliest: 618
  start_latest: 618
  stop_earliest: 907
  stop_latest: 907
  
This overrides the computed bounds from members.
```

---

## 2. ID Resolution and Namespace Schema

**Namespace Strategy:**

The system uses namespaced identifiers for compactness and clarity. A namespace-to-URL mapping is maintained in the Django database and synchronized to Vespa via Django signals.

**Standard Namespaces:**

| Namespace | URL Root | Usage |
|-----------|----------|-------|
| `whg:` | `https://whgazetteer.org/api/` | WHG-generated entities |
| `doi:` | `https://doi.org/` | Contributed datasets and collections |
| `pleiades:` | `https://pleiades.stoa.org/places/` | Pleiades ancient places |
| `geonames:` | `https://www.geonames.org/` | GeoNames places |
| `wikidata:` | `http://www.wikidata.org/entity/` | Wikidata entities |
| `tgn:` | `http://vocab.getty.edu/tgn/` | Getty TGN places |
| `periodo:` | `http://n2t.net/ark:/99152/` | PeriodO periods |

Additional namespaces follow the LPF context document: https://github.com/LinkedPasts/linked-places-format/blob/main/linkedplaces-context-v1.1.jsonld

**ID Examples:**
- WHG Subject: `whg:subject-a3f2c8b1-4d5e-6789-abcd-ef1234567890`
- Contributed dataset: `doi:10.83427/whg-dataset-657`
- Pleiades place: `pleiades:579885`
- PeriodO period: `periodo:p0qhb9d`

**Resolution:**
- IDs can be used in both namespaced form (compact) and full URL form (explicit)
- Django maintains authoritative namespace mapping
- Vespa receives synchronized copy for query resolution and export
- Both forms are accepted in queries and contributions

---

## 3. Provenance and Changelog

**Provenance tracking** for all entity creation and modification is handled by the Django application database, not within the core Vespa data model.

The Django changelog records:
- Who created/modified each entity (User ID or contributor identifier)
- When changes occurred (timestamps)
- What changed (field-level diffs)
- Context (import batch, manual edit, API submission)

This separation keeps the core model clean while ensuring full audit trails. Changelog entries reference entity IDs but are not part of the Subject/Name/Geometry/Timespan/Attestation records themselves.