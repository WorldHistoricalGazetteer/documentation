# Special Thing Patterns

## Period Things

A **period Thing** represents a span of time, often with associated geographic extent and cultural characteristics.

**Characteristics:**
- Has Name(s) with `name_type` including "chrononym"
- Classified via attestation with `typed_by` edge to AUTHORITY document with classification "period"
- Has Timespan attestations defining its temporal bounds
- Members are Things that existed during that period
- Member temporalities can vary; the period's Timespan represents the outer bounds
- May have explicit Geometry or inherit from members

**Graph Structure:**
```
Period Thing (e.g., "Tang Dynasty")
  ←[subject_of]← Attestation ─[attests_name]→ Name("Tang Dynasty", chrononym)
  ←[subject_of]← Attestation ─[attests_name]→ Name("唐朝", chrononym)
  ←[subject_of]← Attestation ─[typed_by]→ Authority(classification: "period")
  ←[subject_of]← Attestation ─[attests_timespan]→ Timespan(618-907 CE)
  ←[subject_of]← Attestation ─[attests_geometry]→ Geometry(Tang territory)
  
  Member Things:
  Thing(Chang'an) ←[subject_of]← Attestation ─[typed_by]→ Authority(member_of)
                                             └─[relates_to]→ Thing(Tang Dynasty)
```

**PeriodO Integration:**
- PeriodO periods import as Things with external IDs (e.g., `periodo:p0qhb9d`)
- PeriodO data maps directly to Thing + Name + Timespan + Geometry attestations
- WHG-created periods follow the same pattern with `whg:` namespace

**Example**: "Tang Dynasty" as a period Thing:
- ID: `things/tang-dynasty`
- Has chrononym Names via attestations: "Tang Dynasty" (English), "唐朝" (Chinese)
- Classified as "period" via Authority
- Has Timespan: 618-907 CE via attestation
- Members include Chang'an, Luoyang (each with their own Timespan attestations)
- Geometry can be explicit (official territory) or inherited (union of member cities)

---

## Route Things

A **route Thing** represents a sequentially-ordered set of places, typically without specific temporal information about traversal.

**Characteristics:**
- Classified via attestation with `typed_by` edge to AUTHORITY document with classification "route"
- Members are Things representing segments (waypoints or path sections)
- Segments are ordered using the `sequence` field in Attestation nodes
- Timespan attestations are optional or represent when the route existed (not traversal times)
- May include path Geometries as separate Things with LineString geometries

**Graph Structure:**
```
Route Thing (e.g., "Silk Road")
  ←[subject_of]← Attestation ─[attests_name]→ Name("Silk Road")
  ←[subject_of]← Attestation ─[typed_by]→ Authority(classification: "route")
  ←[subject_of]← Attestation ─[attests_timespan]→ Timespan(route's existence)
  
  Member Things (with sequence):
  Thing(Chang'an) ←[subject_of]← Attestation(sequence: 1) ─[typed_by]→ Authority(member_of)
                                                          └─[relates_to]→ Thing(Silk Road)
  Thing(Dunhuang) ←[subject_of]← Attestation(sequence: 2) ─[typed_by]→ Authority(member_of)
                                                          └─[relates_to]→ Thing(Silk Road)
  Thing(Samarkand) ←[subject_of]← Attestation(sequence: 3) ─[typed_by]→ Authority(member_of)
                                                           └─[relates_to]→ Thing(Silk Road)
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

## Itinerary Things

An **itinerary Thing** represents a journey or route through space and time, with temporal information about when segments were traversed.

**Characteristics:**
- Classified via attestation with `typed_by` edge to AUTHORITY document with classification "itinerary"
- Members are Things representing segments (waypoints, routes, or regions)
- Segments are ordered using the `sequence` field in Attestation nodes
- **Each segment attestation has its own Timespan attestation** (when that segment was traversed)
- Itinerary's overall Timespan is the outer bounds of segment Timespans (unless explicitly overridden)
- Segments can be:
    - **Destinations**: Things representing places visited (points or regions)
    - **Routes**: Things with LineString Geometries representing paths between destinations
    - **Mixed**: Some segments may be large regions traversed without specific routes

**Graph Structure:**
```
Itinerary Thing (e.g., "Marco Polo's Journey")
  ←[subject_of]← Attestation ─[attests_name]→ Name("Marco Polo's Journey to China")
  ←[subject_of]← Attestation ─[typed_by]→ Authority(classification: "itinerary")
  ←[subject_of]← Attestation ─[attests_timespan]→ Timespan(1271-1295, computed)
  
  Member Things (with sequence and temporal data):
  Thing(Venice) ←[subject_of]← Attestation(sequence: 1) ─[typed_by]→ Authority(member_of)
                                                        ├─[relates_to]→ Thing(Marco Polo Journey)
                                                        └─[attests_timespan]→ Timespan(Jan-Jun 1271)
  
  Thing(Route-to-Constantinople) ←[subject_of]← Attestation(sequence: 2) 
                                                             ├─[typed_by]→ Authority(member_of)
                                                             ├─[relates_to]→ Thing(Marco Polo Journey)
                                                             └─[attests_timespan]→ Timespan(Jun-Sep 1271)
  
  Thing(Constantinople) ←[subject_of]← Attestation(sequence: 3)
                                                   ├─[typed_by]→ Authority(member_of)
                                                   ├─[relates_to]→ Thing(Marco Polo Journey)
                                                   └─[attests_timespan]→ Timespan(Sep-Nov 1271)
```

**Examples:**
- Travel diaries and itineraries: Ibn Battuta, Marco Polo, Xuanzang
- Military campaigns: Napoleon's marches, Alexander the Great's conquests, Crusades
- Voyage data from ships' logs: 18th-19th century naval and merchant shipping
- Migration pathways: Documented historical migrations with temporal progression

**Note on terminology**: Each entry in an itinerary is called a **segment**, which encompasses both waypoints/destinations and routes between them.

---

## Network Things

A **network Thing** represents a set of connections between places that may not follow a particular sequence.

**Characteristics:**
- Classified via attestation with `typed_by` edge to AUTHORITY document with classification "network"
- Connections between Things are attested using `connected_to` relation type (via AUTHORITY)
- Connections may have Timespan attestations (when the connection existed)
- Connection metadata in Attestation nodes specifies type, directionality, and other attributes
- Multiple attestations can represent the same connection at different times or from different sources
- Networks do not store detailed route geometries by default; these can be linked via references to route Things or Geometry records

**Graph Structure:**
```
Network Thing (e.g., "Mediterranean Trade Network")
  ←[subject_of]← Attestation ─[attests_name]→ Name("Mediterranean Trade Network")
  ←[subject_of]← Attestation ─[typed_by]→ Authority(classification: "network")
  ←[subject_of]← Attestation ─[attests_timespan]→ Timespan(network's operational period)
  
  Connections (via connected_to attestations):
  Thing(Constantinople) ←[subject_of]← Attestation(connection_metadata: {...})
                                                   ├─[typed_by]→ Authority(connected_to)
                                                   ├─[relates_to]→ Thing(Venice)
                                                   └─[attests_timespan]→ Timespan(1200-1453)
  
  Thing(Venice) ←[subject_of]← Attestation(connection_metadata: {...})
                                          ├─[typed_by]→ Authority(connected_to)
                                          ├─[relates_to]→ Thing(Alexandria)
                                          └─[attests_timespan]→ Timespan(1100-1500)
```

**Connection Metadata Structure** (in Attestation node):
```javascript
{
  "connection_metadata": {
    "connection_type": "trade",
    "directionality": "bidirectional",
    "commodity": ["spices", "silk"],
    "intensity": 0.9,
    "frequency": "monthly"
  }
}
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

## Gazetteer Group Things

A **gazetteer group Thing** represents a thematic collection of gazetteers sharing common characteristics.

**Characteristics:**
- Classified via attestation with `typed_by` edge to AUTHORITY document with classification "gazetteer_group"
- Members are other Things (which are themselves gazetteers) linked via `member_of` attestations
- Can have its own Names describing the collection theme
- May have Timespan attestations representing the collection's temporal scope
- May have inherited Geometry from member gazetteers

**Graph Structure:**
```
Gazetteer Group Thing (e.g., "Ancient World Gazetteers")
  ←[subject_of]← Attestation ─[attests_name]→ Name("Ancient World Gazetteers")
  ←[subject_of]← Attestation ─[typed_by]→ Authority(classification: "gazetteer_group")
  ←[subject_of]← Attestation ─[attests_timespan]→ Timespan(-3000 to 500)
  
  Member Things:
  Thing(Pleiades) ←[subject_of]← Attestation ─[typed_by]→ Authority(member_of)
                                             └─[relates_to]→ Thing(Ancient World Gazetteers)
  
  Thing(DARMC) ←[subject_of]← Attestation ─[typed_by]→ Authority(member_of)
                                          └─[relates_to]→ Thing(Ancient World Gazetteers)
  
  Thing(Barrington) ←[subject_of]← Attestation ─[typed_by]→ Authority(member_of)
                                                └─[relates_to]→ Thing(Ancient World Gazetteers)
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

Similar to Geometry inheritance, **Timespan inheritance** can be computed for Things lacking explicit Timespan attestations.

**Field Naming Note:** All examples use `end_earliest` and `end_latest` (not `stop_earliest`/`stop_latest`) for consistency with W3C Time Ontology. This applies to all timespan operations including inheritance and computation.

**Computation Rules:**

**For compositional Things (with members):**
1. Find all member Things via `member_of` attestations
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

**Example Query (AQL):**
```aql
// Compute Timespan for Tang Dynasty from members
LET dynasty = DOCUMENT("things/tang-dynasty")

// Find all member Things
LET members = (
  FOR att IN attestations
    FOR e1 IN edges
      FILTER e1._to == att._id
      FILTER e1.edge_type == "subject_of"
      LET member = DOCUMENT(e1._from)
      
      // Check if this is a member_of attestation
      FOR e2 IN edges
        FILTER e2._from == att._id
        FILTER e2.edge_type == "typed_by"
        LET relType = DOCUMENT(e2._to)
        FILTER relType.label == "member_of"
        
        // Get the parent Thing
        FOR e3 IN edges
          FILTER e3._from == att._id
          FILTER e3.edge_type == "relates_to"
          FILTER e3._to == dynasty._id
          
          // Get member's Timespan
          FOR memberAtt IN attestations
            FOR e4 IN edges
              FILTER e4._from == member._id
              FILTER e4._to == memberAtt._id
              FILTER e4.edge_type == "subject_of"
              
              FOR e5 IN edges
                FILTER e5._from == memberAtt._id
                FILTER e5.edge_type == "attests_timespan"
                LET timespan = DOCUMENT(e5._to)
                
                RETURN timespan
)

// Compute bounds
RETURN {
  start_earliest: MIN(members[*].start_earliest),
  start_latest: MIN(members[*].start_latest),
  end_earliest: MAX(members[*].end_earliest),
  end_latest: MAX(members[*].end_latest)
}
```

**Example Result:**
```javascript
// Tang Dynasty period Thing (no explicit Timespan)
// Members:
//   - Chang'an (Timespan: 618-904)
//   - Luoyang (Timespan: 618-907)
//   - Canton (Timespan: 650-900)

// Computed Timespan for Tang Dynasty:
{
  "start_earliest": 618,
  "start_latest": 650,
  "end_earliest": 900,
  "end_latest": 907
}
```

**Override example:**
```
// Tang Dynasty with explicit Timespan attestation
Thing(Tang Dynasty) ←[subject_of]← Attestation ─[attests_timespan]→ Timespan(618-907)

// This explicit attestation overrides the computed bounds from members
```

---

## Geometry Inheritance

**Note on GeometryCollection:** ArangoDB does not support the GeoJSON `GeometryCollection` type. For Things with heterogeneous geometries (e.g., both point and polygon), create multiple geometry attestations—one per geometry type. This naturally aligns with the attestation model where each geometry claim is a separate evidential statement.

Things can inherit Geometry from their members when no explicit Geometry attestation exists:

**Computation Pattern:**
```aql
// Find inherited Geometry for a Route Thing
FOR thing IN things
  FILTER thing._id == "things/silk-road"
  
  // Check if explicit Geometry exists
  LET explicitGeom = (
    FOR att IN attestations
      FOR e1 IN edges
        FILTER e1._from == thing._id
        FILTER e1._to == att._id
        FILTER e1.edge_type == "subject_of"
        
        FOR e2 IN edges
          FILTER e2._from == att._id
          FILTER e2.edge_type == "attests_geometry"
          RETURN DOCUMENT(e2._to)
  )
  
  // If no explicit Geometry, compute from members
  LET inheritedGeom = LENGTH(explicitGeom) == 0 ? (
    // Find all member geometries
    FOR member IN members
      // Get member's Geometry
      // Then compute union/convex hull
  ) : null
  
  RETURN {
    explicit: explicitGeom,
    inherited: inheritedGeom
  }
```

**Use Cases:**
- Routes inherit LineString from member waypoints
- Periods inherit Polygon from member territories
- Networks inherit point cloud from connected nodes