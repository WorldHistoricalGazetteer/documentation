# Special SpatialEntity Patterns

## Period SpatialEntities

A **period SpatialEntity** represents a span of time, often with associated geographic extent and cultural characteristics.

**Characteristics:**
- Has Name(s) with `name_type` including "chrononym"
- Classified via attestation with `attests_type` edge to a Type "period"
- Has Timespan attestations defining its temporal bounds
- Members are SpatialEntities that existed during that period
- Member temporalities can vary; the period's Timespan represents the outer bounds
- May have explicit Geometry or inherit from members

**Graph Structure:**
```
Period SpatialEntity (e.g., "Tang Dynasty")
  ←[attests_about]─ Attestation ─[attests_name]→ Name("Tang Dynasty", chrononym)
  ←[attests_about]─ Attestation ─[attests_name]→ Name("唐朝", chrononym)
  ←[attests_about]─ Attestation ─[attests_type]→ Type("period")
  ←[attests_about]─ Attestation ─[attests_timespan]→ Timespan(618-907 CE)
  ←[attests_about]─ Attestation ─[attests_geometry]→ Geometry(Tang territory)
  
  Member SpatialEntities:
  SpatialEntity(Chang'an) ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(member_of)
                                                └─[relates_to]→ SpatialEntity(Tang Dynasty)
```

**PeriodO Integration:**
- PeriodO periods import as SpatialEntities with external IDs (e.g., `periodo:p0qhb9d`)
- PeriodO data maps directly to SpatialEntity + Name + Timespan + Geometry attestations
- WHG-created periods follow the same pattern with `whg:` namespace

**Example**: "Tang Dynasty" as a period SpatialEntity:
- ID: `things/tang-dynasty`
- Has chrononym Names via attestations: "Tang Dynasty" (English), "唐朝" (Chinese)
- Classified as "period" via a Type
- Has Timespan: 618-907 CE via attestation
- Members include Chang'an, Luoyang (each with their own Timespan attestations)
- Geometry can be explicit (official territory) or inherited (union of member cities)

---

## Route SpatialEntities

A **route SpatialEntity** represents a sequentially-ordered set of places, typically without specific temporal information about traversal.

**Characteristics:**
- Classified via attestation with `attests_type` edge to a Type "route"
- Members are SpatialEntities representing segments (waypoints or path sections)
- Segments are ordered using the `sequence` field in Attestation nodes
- Timespan attestations are optional or represent when the route existed (not traversal times)
- May include path Geometries as separate SpatialEntities with LineString geometries

**Graph Structure:**
```
Route SpatialEntity (e.g., "Silk Road")
  ←[attests_about]─ Attestation ─[attests_name]→ Name("Silk Road")
  ←[attests_about]─ Attestation ─[attests_type]→ Type("route")
  ←[attests_about]─ Attestation ─[attests_timespan]→ Timespan(route's existence)
  
  Member SpatialEntities (with sequence):
  SpatialEntity(Chang'an) ←[attests_about]─ Attestation(sequence: 1) ─[has_relation_type]→ RelationType(member_of)
                                                             └─[relates_to]→ SpatialEntity(Silk Road)
  SpatialEntity(Dunhuang) ←[attests_about]─ Attestation(sequence: 2) ─[has_relation_type]→ RelationType(member_of)
                                                             └─[relates_to]→ SpatialEntity(Silk Road)
  SpatialEntity(Samarkand) ←[attests_about]─ Attestation(sequence: 3) ─[has_relation_type]→ RelationType(member_of)
                                                              └─[relates_to]→ SpatialEntity(Silk Road)
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

## Itinerary SpatialEntities

An **itinerary SpatialEntity** represents a journey or route through space and time, with temporal information about when segments were traversed.

**Characteristics:**
- Classified via attestation with `attests_type` edge to a Type "itinerary"
- Members are SpatialEntities representing segments (waypoints, routes, or regions)
- Segments are ordered using the `sequence` field in Attestation nodes
- **Each segment attestation has its own Timespan attestation** (when that segment was traversed)
- Itinerary's overall Timespan is the outer bounds of segment Timespans (unless explicitly overridden)
- Segments can be:
    - **Destinations**: SpatialEntities representing places visited (points or regions)
    - **Routes**: SpatialEntities with LineString Geometries representing paths between destinations
    - **Mixed**: Some segments may be large regions traversed without specific routes

**Graph Structure:**
```
Itinerary SpatialEntity (e.g., "Marco Polo's Journey")
  ←[attests_about]─ Attestation ─[attests_name]→ Name("Marco Polo's Journey to China")
  ←[attests_about]─ Attestation ─[attests_type]→ Type("itinerary")
  ←[attests_about]─ Attestation ─[attests_timespan]→ Timespan(1271-1295, computed)
  
  Member SpatialEntities (with sequence and temporal data):
  SpatialEntity(Venice) ←[attests_about]─ Attestation(sequence: 1) ─[has_relation_type]→ RelationType(member_of)
                                                           ├─[relates_to]→ SpatialEntity(Marco Polo Journey)
                                                           └─[attests_timespan]→ Timespan(Jan-Jun 1271)
  
  SpatialEntity(Route-to-Constantinople) ←[attests_about]─ Attestation(sequence: 2)
                                                                ├─[has_relation_type]→ RelationType(member_of)
                                                                ├─[relates_to]→ SpatialEntity(Marco Polo Journey)
                                                                └─[attests_timespan]→ Timespan(Jun-Sep 1271)
  
  SpatialEntity(Constantinople) ←[attests_about]─ Attestation(sequence: 3)
                                                      ├─[has_relation_type]→ RelationType(member_of)
                                                      ├─[relates_to]→ SpatialEntity(Marco Polo Journey)
                                                      └─[attests_timespan]→ Timespan(Sep-Nov 1271)
```

**Examples:**
- Travel diaries and itineraries: Ibn Battuta, Marco Polo, Xuanzang
- Military campaigns: Napoleon's marches, Alexander the Great's conquests, Crusades
- Voyage data from ships' logs: 18th-19th century naval and merchant shipping
- Migration pathways: Documented historical migrations with temporal progression

**Note on terminology**: Each entry in an itinerary is called a **segment**, which encompasses both waypoints/destinations and routes between them.

---

## Network SpatialEntities

A **network SpatialEntity** represents a set of connections between places that may not follow a particular sequence.

**Characteristics:**
- Classified via attestation with `attests_type` edge to a Type "network"
- Connections between SpatialEntities are attested using `connected_to` relation type (via AUTHORITY)
- Connections may have Timespan attestations (when the connection existed)
- Multiple attestations can represent the same connection at different times or from different sources
- Networks do not store detailed route geometries by default; these can be linked via references to route SpatialEntities or Geometry records

**Graph Structure:**
```
Network SpatialEntity (e.g., "Mediterranean Trade Network")
  ←[attests_about]─ Attestation ─[attests_name]→ Name("Mediterranean Trade Network")
  ←[attests_about]─ Attestation ─[attests_type]→ Type("network")
  ←[attests_about]─ Attestation ─[attests_timespan]→ Timespan(network's operational period)
  
  Connections (via connected_to attestations):
  SpatialEntity(Constantinople) ←[attests_about]─ Attestation
                                                      ├─[has_relation_type]→ RelationType(connected_to)
                                                      ├─[relates_to]→ SpatialEntity(Venice)
                                                      └─[attests_timespan]→ Timespan(1200-1453)
  
  SpatialEntity(Venice) ←[attests_about]─ Attestation
                                             ├─[has_relation_type]→ RelationType(connected_to)
                                             ├─[relates_to]→ SpatialEntity(Alexandria)
                                             └─[attests_timespan]→ Timespan(1100-1500)
```

**Examples:**
- Communication networks: postal routes, telegraph lines
- Commercial networks: trade between ports (e.g., Sound Toll Registers)
- Administrative links: imperial governance connections
- Social networks: diplomatic exchanges, pilgrimage networks

**Temporal Dynamics:**
- Connections can appear and disappear over time
- Multiple attestations with different Timespans model changing relationships
- Network evolution queries track emergence and dissolution of connections

---

## Gazetteer Group SpatialEntities

A **gazetteer group SpatialEntity** represents a thematic collection of gazetteers sharing common characteristics.

**Characteristics:**
- Classified via attestation with `attests_type` edge to a Type "gazetteer_group"
- Members are other SpatialEntities (which are themselves gazetteers) linked via `member_of` attestations
- Can have its own Names describing the collection theme
- May have Timespan attestations representing the collection's temporal scope
- May have inherited Geometry from member gazetteers

**Graph Structure:**
```
Gazetteer Group SpatialEntity (e.g., "Ancient World Gazetteers")
  ←[attests_about]─ Attestation ─[attests_name]→ Name("Ancient World Gazetteers")
  ←[attests_about]─ Attestation ─[attests_type]→ Type("gazetteer_group")
  ←[attests_about]─ Attestation ─[attests_timespan]→ Timespan(-3000 to 500)
  
  Member SpatialEntities:
  SpatialEntity(Pleiades) ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(member_of)
                                                └─[relates_to]→ SpatialEntity(Ancient World Gazetteers)
  
  SpatialEntity(DARMC) ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(member_of)
                                             └─[relates_to]→ SpatialEntity(Ancient World Gazetteers)
  
  SpatialEntity(Barrington) ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(member_of)
                                                   └─[relates_to]→ SpatialEntity(Ancient World Gazetteers)
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

Similar to Geometry inheritance, **Timespan inheritance** can be computed for SpatialEntities lacking explicit Timespan attestations.

**Computation Rules:**

**For compositional SpatialEntities (with members):**
1. Find all member SpatialEntities via `member_of` attestations
2. For each member, find its Timespan attestations via graph traversal
3. Compute outer bounds:
    - `start_earliest` = minimum of all member `start_earliest` values
    - `start_latest` = minimum of all member `start_latest` values
    - `end_earliest` = maximum of all member `end_earliest` values
    - `end_latest` = maximum of all member `end_latest` values

**For periods:**
- By default, compute from members
- Explicit Timespan attestation overrides computation
- Useful for defining period boundaries that don't perfectly align with member existence

**For itineraries:**
- Automatically compute from segment Timespans
- Itinerary duration = earliest segment start to latest segment end
- Can be overridden for overall journey context (e.g., preparation/return time)

**Example (Tang Dynasty):**
1. Start from the Tang Dynasty SpatialEntity and find every Attestation whose `has_relation_type` is `member_of` and which `relates_to` the dynasty; the SpatialEntity each of these `attests_about` is a member.
2. For each member, collect the Timespans reached through `attests_timespan` from the Attestations about that member.
3. Take the minimum of the members' `start_earliest` and `start_latest` values and the maximum of their `end_earliest` and `end_latest` values.

**Example Result:**
```javascript
// Tang Dynasty period SpatialEntity (no explicit Timespan)
// Members:
//   - Chang'an (Timespan: 618-904)
//   - Luoyang (Timespan: 618-907)
//   - Canton (Timespan: 650-900)

// Computed Timespan for Tang Dynasty:
{
  "startEarliest": 618,
  "startLatest": 650,
  "endEarliest": 900,
  "endLatest": 907
}
```

**Override example:**
```
// Tang Dynasty with explicit Timespan attestation
SpatialEntity(Tang Dynasty) ←[attests_about]─ Attestation ─[attests_timespan]→ Timespan(618-907)

// This explicit attestation overrides the computed bounds from members
```

---

## Geometry Inheritance

**Several geometries:** where sources differ, or one source gives different geometries for different dates, record each as its own geometry attestation, so each keeps its source, dates and certainty. Where one source asserts a single heterogeneous shape, a `GeometryCollection` is fine.

SpatialEntities can inherit Geometry from their members when no explicit Geometry attestation exists:

**Computation Pattern:**
For the Silk Road route, first look for Geometries attested directly: Attestations that `attests_about` the route and `attests_geometry` a Geometry. Only if there are none, gather the Geometries attested for the route's member SpatialEntities and derive one from them (a union or convex hull). The result reports the explicit Geometries and the inherited one; at most one of the two is filled.

**Use Cases:**
- Routes inherit LineString from member waypoints
- Periods inherit Polygon from member territories
- Networks inherit point cloud from connected nodes