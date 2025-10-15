# Special Subject Patterns

## Period Subjects *TODO: REQUIRES UPDATE: "Period Things"

A **period Subject** represents a span of time, often with associated geographic extent and cultural characteristics.

**Characteristics:**
- Has Name(s) with `name_type` including "chrononym"
- Classified via attestation with `has_type` → "period"
- Has Timespan attestations defining its temporal bounds
- Members are Subjects that existed during that period
- Member temporalities can vary; the period's Timespan represents the outer bounds
- May have explicit Geometry or inherit from members

**Structure:**
```
Period Subject (e.g., "Tang Dynasty")
  ├─ has_name → "Tang Dynasty" (chrononym)
  ├─ has_name → "唐朝" (chrononym)
  ├─ has_type → "period"
  ├─ has_timespan → Timespan (618-907 CE)
  ├─ has_geometry → Polygon of Tang territory (optional)
  └─ contains → Member Subjects (Chang'an, Luoyang, etc.)
       └─ Each member has its own Timespan attestations
```

**PeriodO Integration:**
- PeriodO periods import as Subjects with external IDs (e.g., `periodo:p0qhb9d`)
- PeriodO data maps directly to Subject + Name + Timespan + Geometry attestations
- WHG-created periods follow the same pattern with `whg:` namespace

**Example**: "Tang Dynasty" as a period Subject:
- ID: `periodo:p0tang` or `whg:subject-tang-dynasty`
- Has chrononym Names: "Tang Dynasty" (English), "唐朝" (Chinese)
- Classified as "period"
- Has Timespan: 618-907 CE
- Members include Chang'an, Luoyang (each with their own Timespan attestations)
- Geometry can be explicit (official territory) or inherited (union of member cities)

---

## Route Subjects

A **route Subject** represents a sequentially-ordered set of places, typically without specific temporal information about traversal.

**Characteristics:**
- Classified via attestation with `has_type` → "route"
- Members are Subjects representing segments (waypoints or path sections)
- Segments are ordered using the `sequence` field in `member_of` attestations
- Timespan attestations are optional or represent when the route existed (not traversal times)
- May include path Geometries as separate Subjects with LineString geometries

**Structure:**
```
Route Subject (e.g., "Silk Road")
  ├─ has_name → "Silk Road"
  ├─ has_type → "route"
  ├─ has_timespan → Timespan (route's existence period, optional)
  └─ contains (with sequence):
       ├─ Waypoint 1: Chang'an (sequence: 1)
       ├─ Waypoint 2: Dunhuang (sequence: 2)
       ├─ Waypoint 3: Samarkand (sequence: 3)
       └─ ...
```

**Examples:**
- Silk Road: waypoints across Central Asia
- Roman Roads (ORBIS): network of road segments
- Maritime routes: documented sea lanes
- Hajj routes: established pilgrimage paths

**Distinction from Itinerary:**
- Routes may have no temporal data on traversal
- If temporal data exists, it represents the route's period of use, not a specific journey
- Routes are conceptual pathways; itineraries are actual journeys

---

## Itinerary Subjects

An **itinerary Subject** represents a journey or route through space and time, with temporal information about when segments were traversed.

**Characteristics:**
- Classified via attestation with `has_type` → "itinerary"
- Members are Subjects representing segments (waypoints, routes, or regions)
- Segments are ordered using the `sequence` field in `member_of` attestations
- **Each segment attestation has its own Timespan attestation** (when that segment was traversed)
- Itinerary's overall Timespan is the outer bounds of segment Timespans (unless explicitly overridden)
- Segments can be:
  - **Destinations**: Subjects representing places visited (points or regions)
  - **Routes**: Subjects with LineString Geometries representing paths between destinations
  - **Mixed**: Some segments may be large regions traversed without specific routes

**Structure:**
```
Itinerary Subject (e.g., "Marco Polo's Journey")
  ├─ has_name → "Marco Polo's Journey to China"
  ├─ has_type → "itinerary"
  ├─ has_timespan → Timespan (1271-1295, computed from segments)
  └─ contains (with sequence and temporal data):
       ├─ Segment 1: Venice (sequence: 1)
       │   └─ Timespan: Jan-Jun 1271
       ├─ Segment 2: Route to Constantinople (sequence: 2)
       │   └─ Timespan: Jun-Sep 1271
       ├─ Segment 3: Constantinople (sequence: 3)
       │   └─ Timespan: Sep-Nov 1271
       └─ ...
```

**Examples:**
- Travel diaries and itineraries: Ibn Battuta, Marco Polo, Xuanzang
- Military campaigns: Napoleon's marches, Alexander the Great's conquests, Crusades
- Voyage data from ships' logs: 18th-19th century naval and merchant shipping
- Migration pathways: Documented historical migrations with temporal progression

**Note on terminology**: Each entry in an itinerary is called a **segment**, which encompasses both waypoints/destinations and routes between them.

---

## Network Subjects

A **network Subject** represents a set of connections between places that may not follow a particular sequence.

**Characteristics:**
- Classified via attestation with `has_type` → "network"
- Connections between Subjects are attested using `connected_to` relation type
- Connections may have Timespan attestations (when the connection existed)
- Connection metadata specifies type, directionality, and other attributes
- Multiple attestations can represent the same connection at different times or from different sources
- Networks do not store detailed route geometries by default; these can be linked via references to route Subjects or Geometry records

**Structure:**
```
Network Subject (e.g., "Mediterranean Trade Network")
  ├─ has_name → "Mediterranean Trade Network"
  ├─ has_type → "network"
  ├─ has_timespan → Timespan (network's operational period)
  └─ Connections (via connected_to attestations):
       ├─ Constantinople ←→ Venice
       │   ├─ connection_type: trade
       │   ├─ Timespan: 1200-1453
       │   └─ metadata: {commodity: ["spices", "silk"]}
       ├─ Venice ←→ Alexandria
       │   ├─ connection_type: trade
       │   ├─ Timespan: 1100-1500
       │   └─ metadata: {intensity: 0.9}
       └─ ...
```

**Examples:**
- Communication networks: postal routes, telegraph lines
- Commercial networks: trade between ports (e.g., Sound Toll Registers)
- Administrative links: imperial governance connections
- Social networks: diplomatic exchanges, pilgrimage networks

**Network Connection Metadata:**
- `connection_type`: Type of relationship (trade, diplomatic, postal, etc.)
- `directionality`: Flow direction (bidirectional, from_subject_to_object, etc.)
- `intensity`, `frequency`, `volume`: Quantitative measures
- Domain-specific fields: commodity types, message counts, vessel tonnage, etc.

**Temporal Dynamics:**
- Connections can appear and disappear over time
- Multiple attestations with different Timespans model changing relationships
- Network evolution queries track emergence and dissolution of connections

---

## Gazetteer Group Subjects

A **gazetteer group Subject** represents a thematic collection of gazetteers sharing common characteristics.

**Characteristics:**
- Classified via attestation with `has_type` → "gazetteer_group"
- Members are other Subjects (which are themselves gazetteers) linked via `member_of` attestations
- Can have its own Names describing the collection theme
- May have Timespan attestations representing the collection's temporal scope
- May have inherited Geometry from member gazetteers

**Structure:**
```
Gazetteer Group Subject (e.g., "Ancient World Gazetteers")
  ├─ has_name → "Ancient World Gazetteers"
  ├─ has_type → "gazetteer_group"
  ├─ has_timespan → Timespan (-3000 to 500, collection scope)
  └─ contains:
       ├─ Pleiades (gazetteer)
       ├─ DARMC (gazetteer)
       ├─ Barrington Atlas (gazetteer)
       └─ ...
```

**Examples:**
- Ancient World Gazetteers: combining Pleiades, DARMC, Barrington Atlas
- Colonial Gazetteers: British, French, Spanish colonial archives
- Environmental History Gazetteers: climate/landscape datasets
- Religious Networks: pilgrimage sites and sacred places
- Historical Urban Gazetteers: city-focused collections

**Use Cases:**
- Thematic browsing and discovery
- Cross-gazetteer queries within a domain
- Collection-level metadata and DOI assignment
- Curated research datasets

---

## Timespan Inheritance and Computation

Similar to Geometry inheritance, **Timespan inheritance** can be computed for Subjects lacking explicit Timespan attestations.

**Computation Rules:**

**For compositional Subjects (with members):**
1. Find all member Subjects via `member_of` attestations
2. For each member, find its Timespan attestations
3. Compute outer bounds:
   - `start_earliest` = minimum of all member `start_earliest` values
   - `start_latest` = minimum of all member `start_latest` values
   - `stop_earliest` = maximum of all member `stop_earliest` values
   - `stop_latest` = maximum of all member `stop_latest` values

**For periods:**
- By default, compute from members
- Explicit Timespan attestation overrides computation
- Useful for defining period boundaries that don't perfectly align with member existence

**For itineraries:**
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
