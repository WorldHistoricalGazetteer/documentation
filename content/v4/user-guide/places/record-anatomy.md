# Place Record Anatomy

Understanding the structure and components of a WHG place record.

## Note to Documentation Team

This page needs extensive visual aids:
- Annotated screenshots of actual place records with callouts
- Interactive demo record where users can click different sections
- Side-by-side comparison of simple vs complex records
- Flowchart showing how attestations build up a record
- Before/after examples showing how records evolve with contributions
- Video walkthrough of exploring a complex record
- Consider a "record dissection" showing data model underneath
- Examples from diverse geographic/temporal contexts
- Show how uncertainty appears in the interface
- Cross-reference to Data Model documentation for technical users
- Include accessibility considerations for navigating records

---

## Overview

A WHG place record is a rich, multi-faceted representation of a historical place. Unlike traditional gazetteers with fixed fields, WHG records are built from **attestations** - individual claims from sources that together form a comprehensive picture of a **Thing**.

## Record Sections

Every place record contains several sections:

1. **Header** - Summary and primary identity
2. **Names Tab** - All known names and variants
3. **Locations Tab** - Geometries and spatial information
4. **Temporal Tab** - When-related information
5. **Types & Classifications Tab** - What kind of Thing
6. **Relations Tab** - Connections to other Things
7. **Attestations Tab** - Source-level detail
8. **Provenance Tab** - Contribution and curation history

Let's explore each in detail.

## 1. Header Section

[Annotated screenshot of header]

The header provides at-a-glance information:

### Primary Name

**Display**: Largest text at top of record

**Logic**:
- Most recent name with highest certainty
- OR most commonly attested name
- OR editor-designated primary name

**Example**: For thing-Constantinople, primary name might be "Istanbul" (current) or "Constantinople" (historical dominance)

### Thing ID

**Display**: Small text below primary name (e.g., `whg:12345`)

**Purpose**: Unique permanent identifier for this Thing

**Use**: For citations, API queries, cross-referencing

### Quick Facts

**Display**: Icon-based summary below primary name

- **📍 Location**: Representative point or region
- **📅 Time Range**: Earliest to latest attestation
- **🏛️ Type**: Primary classification
- **📚 Sources**: Count of distinct sources
- **🔗 Relations**: Count of connections
- **✓ Quality**: Completeness/certainty indicator

### Action Buttons

- **Edit**: Open editing interface (if you have permission)
- **Add to Collection**: Save to your collections
- **Share**: Get permalink or share to social media
- **Export**: Download this record
- **Cite**: Get citation information
- **Flag**: Report an issue

## 2. Names Tab

[Screenshot of Names tab]

The Names tab shows all attested names for this place.

### Name List

Each name entry shows:

**Name String**: The name itself, in original script
- Example: `القسطنطينية` (Arabic script)

**Transliteration**: Romanized form (if non-Latin)
- Example: `al-Qusṭanṭīnīyah`

**Language & Script**:
- Example: `Arabic / Arabic script`

**Name Type**: Classification
- Example: `toponym` (also: chrononym, ethnonym, etc.)

**Timespan**: When this name was used
- Example: `800 CE - 1453 CE`

**Certainty**: Confidence in this attestation
- Visual: Color-coded bar or icon
- Example: ✓✓✓ (high), ✓✓ (medium), ✓ (low)

**Sources**: Citations for this name
- Expandable list
- Linked to source details

### Name Filtering & Sorting

**Filter by**:
- Language
- Script
- Name type
- Time period
- Certainty level

**Sort by**:
- Chronological (oldest/newest first)
- Alphabetical
- Certainty
- Source count

### Name Relationships

Some names show relationships:
- **Variant of**: Links to related name forms
- **Translation of**: Cross-language equivalents
- **Evolved from**: Diachronic change
- **Colloquial for**: Formal vs informal names

### Name Timeline View

Toggle to timeline visualization:

[Mockup of timeline showing name usage over time]

Shows:
- Horizontal bars for each name's timespan
- Overlapping periods where multiple names coexisted
- Transitions and name changes
- Gaps where no names are attested

## 3. Locations Tab

[Screenshot of Locations tab]

The Locations tab shows spatial information.

### Map View

**Display**: Interactive map showing:
- All attested geometries (points, polygons, regions)
- Color-coded by time period
- Uncertainty visualized (dotted lines, shaded areas)
- Representative point (primary marker)

**Interactions**:
- Zoom/pan map
- Click geometries for details
- Toggle layers (time periods, certainty levels)
- Measure distances

### Geometry List

Below map, list of all geometries:

**For each geometry**:

**Type**: Point, Polygon, LineString, etc.
- Icon indicates type

**Coordinates/Data**:
- Points: Latitude, Longitude
- Polygons: Vertex count, area
- Regions: Bounding box

**Precision**: Spatial uncertainty
- Example: `± 5 km` or `approximate` or `uncertain`
- Visual indicator (icon, color)

**Timespan**: When this location was valid
- Example: `1200 - 1500 CE`

**Source**: Who claims this location
- Example: `Historical Atlas of Medieval Europe (2015)`

**Certainty**: Confidence level
- Example: `0.85 (high confidence)`

**Notes**: Contextual information
- Example: "Location based on archaeological survey; exact position uncertain"

### Spatial Change Over Time

**Temporal Animation Controls**:
- Play/pause button
- Speed slider
- Year indicator

**Shows**: How the place's location changed (or didn't) over time

**Use Cases**:
- Migrations of settlements
- Border changes
- Expansion/contraction of territorial entities

### Coordinate Systems

**Display**: Original CRS noted for each geometry
- Most common: WGS84 (lat/lon)
- Historical: May include historical coordinate systems

**Transformation**: WHG converts all to WGS84 for display, but preserves original

## 4. Temporal Tab

[Screenshot of Temporal tab]

The Temporal tab focuses on when-related information.

### Time Range Summary

**Display**: Large visual timeline showing:
- Earliest attestation: Start point
- Latest attestation: End point
- Uncertain boundaries: Shaded regions
- Continuous vs discontinuous occupation

### Detailed Timespans

**List view** of all temporal attestations:

**Each timespan shows**:

**Start**:
- Earliest possible: -280
- Latest possible: -275
- Display: "circa 280 BCE"

**Stop**:
- Earliest possible: 1453
- Latest possible: 1454
- Display: "1453/1454 CE"

**Precision**: How certain are the dates?
- Example: `year` level precision vs `century`

**Label**: Human-readable period name
- Example: "Byzantine period"

**What it attests**: What was true during this time?
- Example: "Was the capital of the Byzantine Empire"

**Source**: Citation

### Temporal Patterns

**Identified patterns**:
- **Foundation date**: First attestation of place
- **Peak period**: Most densely attested
- **Abandonment**: Last attestations
- **Gaps**: Periods with no attestations (doesn't mean didn't exist!)
- **Continuous**: Ongoing from earliest to present

### Temporal Uncertainty Visualization

**Visual indicators**:
- Solid line: Certain date
- Dotted line: Uncertain boundary
- Shaded region: Range of possibilities
- Question mark icon: Highly speculative

### Dating Systems

**Display**: Original dating systems noted
- CE/BCE (Common Era)
- AH (Islamic calendar)
- Dynastic periods
- Archaeological periods

**Conversion**: WHG normalizes to CE/BCE but shows original

## 5. Types & Classifications Tab

[Screenshot of Types tab]

Shows what kind of place this is.

### Primary Type

**Display**: Largest, most prominent classification
- Example: `City / Urban Settlement`

**How determined**:
- Most frequently attested type
- OR editor-designated primary
- OR most recent classification

### All Type Attestations

**List of all classifications**:

**Each entry shows**:

**Classification**:
- Example: `Port City`

**Vocabulary**: Which classification system?
- Example: `Pleiades Place Types` or `Getty AAT`

**Timespan**: When this classification applied
- Example: `600 BCE - 1200 CE`

**Source**: Who classified it this way

**Certainty**: Confidence in classification

### Type Timeline

**Visualization**: Shows how place type changed over time

**Example for Constantinople**:
```
-600 to 330 CE:  Greek colony / trading post
330 to 1453 CE:  Imperial capital / city
1453 to present: Imperial capital / metropolis
```

### Hierarchical Classifications

Some types show hierarchy:
```
Settlement
  └─ Urban Settlement
      └─ City
          └─ Capital City
              └─ Imperial Capital
```

### Functional Classifications

Multiple simultaneous types possible:
- Religious center (Temple of Artemis)
- Port city (maritime trade)
- Administrative center (provincial capital)
- Military garrison (fortified)

## 6. Relations Tab

[Screenshot of Relations tab]

Shows how this place connects to others.

### Relation Types

Relations are grouped by type:

#### Hierarchical Relations
- **Part of**: This place is contained within another
  - Example: "Constantinople" part of "Byzantine Empire"
- **Contains**: This place contains others
  - Example: "Byzantine Empire" contains "Constantinople", "Thessalonica", etc.

#### Equivalence Relations
- **Same as**: This place is identical to a place in another dataset
  - Example: WHG place links to Pleiades, GeoNames, Wikidata
- **Succeeded by**: This place was replaced/renamed
  - Example: "Constantinople" succeeded by "Istanbul"
- **Preceded by**: This place replaced another
  - Example: "Istanbul" preceded by "Constantinople"

#### Network Relations
- **Connected to**: Generic connection (trade, communication, etc.)
- **Trade partner with**: Commercial relationship
- **Allied with**: Political/military alliance
- **Religious connection to**: Institutional religious ties
- **Administrative connection to**: Bureaucratic hierarchy

#### Spatial Relations
- **Near**: Geographic proximity
- **On route from/to**: Part of a journey or trade route
- **Accessible from**: Travel/communication links

### Relation Detail View

**Each relation shows**:

**Relation Type**: Category (as above)

**Related Place**: Link to other place record
- Preview card on hover
- Click to navigate

**Connection Metadata**: Additional information
- For trade: Types of goods, volume, frequency
- For routes: Distance, travel time, mode
- For hierarchy: Nature of relationship

**Directionality**:
- Symmetric: Relation goes both ways
- Asymmetric: One-directional (e.g., part-of)

**Timespan**: When this relation held
- Example: "800 CE - 1200 CE"

**Source**: Citation for this relation

**Certainty**: Confidence level

### Network Visualization

**Graph View Toggle**: Switch to network diagram

[Mockup of network graph]

Shows:
- This place as central node
- Related places as connected nodes
- Edge thickness = strength/frequency
- Color coding by relation type
- Interactive: drag nodes, zoom, filter

### Routes & Itineraries

Special visualization for sequential connections:

**List View**:
```
Silk Road Segment (westbound):
1. Chang'an
2. Dunhuang  
3. Kashgar
4. → This place (Samarkand)
5. Merv
6. Baghdad
```

**Map View**: Shows route traced on map with sequence numbers

## 7. Attestations Tab

[Screenshot of Attestations tab]

The attestations tab shows the underlying evidence structure - every claim about this place.

### What Are Attestations?

Reminder: An attestation is a source-backed claim. This tab shows the raw data.

### Attestation List

**Grouped by type**:
- Name attestations
- Geometry attestations
- Timespan attestations
- Type attestations
- Relation attestations

**Each attestation card shows**:

**Subject → Relation → Object** structure
- Example: `[Constantinople] --has_name--> [Name: "Κωνσταντινούπολις"]`

**Source(s)**:
- Full bibliographic citation(s)
- Multiple sources may support same claim
- Links to external source if available

**Certainty**:
- Numerical: 0.0 - 1.0
- Qualitative: certain, probable, uncertain, speculative
- Certainty note: Explanation of assessment

**Timespan**: When this claim applies

**Notes**: Additional context, methodology, etc.

**Metadata**:
- Contributor
- Date added
- Last modified
- Version history link

### Filtering Attestations

**Filter by**:
- Attestation type (name, geometry, etc.)
- Source
- Date range
- Certainty level
- Contributor

**Sort by**:
- Chronological
- Certainty
- Recency of addition
- Source

### Conflicting Attestations

**Highlighted in interface**:
- Icon indicates conflict
- Expandable detail showing disagreement
- Example: Two sources give different coordinates for the same time period

**User can**:
- Compare conflicting claims
- See rationale for each
- Understand uncertainty

### Attestation Provenance Chain

**For each attestation, trace**:
1. Original source (primary document, dataset, etc.)
2. Intermediate sources (if applicable)
3. How it entered WHG
4. Who contributed it
5. Any editorial review/changes

**Example chain**:
```
Primary Source: Ibn Battuta, Rihla, c. 1355
  ↓
Secondary Source: Gibb translation, 1929
  ↓
Dataset: Medieval Islamic Travel Routes, 2018
  ↓
Contributor: Dr. Smith, University X
  ↓
WHG Ingestion: 2023-04-15
  ↓
Editorial Review: 2023-04-22 (approved)
```

## 8. Provenance Tab

[Screenshot of Provenance tab]

Tracks the history of this record within WHG.

### Contribution History

**Timeline view** of record development:

**Initial Contribution**:
- Date: 2020-03-15
- Contributor: Pleiades Project
- Dataset: Pleiades Places
- Initial fields: 1 name, 1 geometry, basic timespan

**Subsequent Enhancements**:
- 2021-06-10: Dr. Jones added 3 name variants (Arabic, Persian, Turkish)
- 2021-11-22: City Atlas Project added detailed polygon geometry
- 2022-04-05: Prof. Smith refined temporal bounds
- 2023-01-18: Network Project added trade route connections
- 2024-02-09: Community member corrected coordinate precision

### Contributors

**List of all contributors** to this record:
- Name/username
- Affiliation
- Number of attestations contributed
- Types of contributions
- Links to their profiles

### Datasets

**Source datasets** that include this place:
- Dataset name
- Link to dataset page
- Which attestations came from this dataset
- Dataset DOI/citation

### Editorial Actions

**Administrative history**:
- Review decisions
- Merge operations (if this record was merged with others)
- Split operations (if this record was split)
- Deprecations or redirects
- Quality flags raised/resolved

### Version History

**All changes to this record**:
- Date/time
- User
- Type of change (add, edit, delete)
- Specific fields changed
- Previous values (for edits)
- Change rationale/notes

**Rollback capability**: Administrators can revert to previous versions if needed

### External Links

**Links to same place in other systems**:
- Pleiades ID
- GeoNames ID
- Wikidata QID
- Getty TGN ID
- VIAF
- Library of Congress
- Other gazetteers

## Reading a Record: Worked Example

Let's walk through a complete record: **Samarkand**

### Header
```
Primary Name: Samarkand
WHG ID: whg:45678
📍 39.6542°N, 66.9597°E
📅 500 BCE - Present
🏛️ City / Trading Hub
📚 47 sources
🔗 23 relations
✓✓✓ High quality
```

### Names Tab (excerpt)
```
1. سمرقند (Samarqand)
   Arabic / Arabic script
   Toponym, 650 - present
   ✓✓✓ Certain
   Sources: [3] including Ibn Khaldun, Al-Biruni
   
2. Marakanda
   Greek / Latin script  
   Toponym, -500 - 300 CE
   ✓✓ Probable
   Sources: [2] Arrian, Strabo
   
3. 撒馬爾罕 (Sāmǎ'ěrhǎn)
   Chinese / Han script
   Toponym, 100 - present
   ✓✓✓ Certain
   Sources: [5] including Tang dynasty records
   
[12 more names...]
```

### Locations Tab
```
Current Location:
• Point: 39.6542°N, 66.9597°E
  ± 1 km precision
  1500 - present
  Source: Modern cartography
  ✓✓✓ Certain

Historical Location:
• Point: 39.65°N, 66.96°E  
  ± 5 km precision
  -500 - 1500 CE
  Source: Archaeological surveys
  ✓✓ Probable
  Note: Ancient city center slightly north of modern center
  
[2 more geometries showing uncertainty regions...]
```

### Temporal Tab
```
Overall Range: 500 BCE - Present

Key Periods:
• Foundation: c. 500 BCE (± 50 years)
  Source: Archaeological evidence
  ✓ Uncertain
  
• Achaemenid Period: 500 - 330 BCE
  Type: Regional center
  ✓✓ Probable
  
• Hellenistic Period: 330 - 150 BCE  
  Type: Satrapal capital (as Marakanda)
  ✓✓✓ Certain
  
• Sogdian Period: 150 BCE - 750 CE
  Type: Major trading hub
  ✓✓✓ Certain
  
• Islamic Period: 750 - present
  Type: Provincial capital / trading city
  ✓✓✓ Certain
```

### Types Tab
```
Primary: Trading Hub / City

All Attestations:
• City (500 BCE - present) - 15 sources
• Trading Hub (150 BCE - present) - 12 sources  
• Provincial Capital (330 BCE - 1868 CE) - 8 sources
• Cultural Center (750 - 1500 CE) - 6 sources
• UNESCO World Heritage Site (2001 - present) - 1 source
```

### Relations Tab (excerpt)
```
Hierarchical:
• Part of: Sogdiana (-500 to 750 CE)
• Part of: Abbasid Caliphate (750 to 850 CE)
• Part of: Timurid Empire (1370 to 1507 CE)
• Part of: Uzbekistan (1924 to present)

Networks:
• Connected to: Chang'an (trade route, 100 BCE - 1400 CE)
• Connected to: Baghdad (trade route, 750 - 1500 CE)
• Connected to: Bukhara (trade route, 500 BCE - present)
[18 more connections...]

Routes:
• On Silk Road: Sequence #7 of 23
  Between: Kashgar (#6) → Samarkand (#7) → Merv (#8)
```

### Attestations Tab (showing 3 of 89)
```
Attestation #1:
[Samarkand] --has_name--> [Name: "Marakanda", Greek]
Sources: Arrian, Anabasis Alexandri, 2nd century CE
Timespan: 330 - 150 BCE  
Certainty: 0.85 (high)
Note: "Name used by Greeks during and after Alexander's conquest"
Added by: Pleiades Project, 2020-03-15

Attestation #42:
[Samarkand] --connected_to--> [Kashgar]
Sources: Historical Atlas of Silk Roads, 2015
Timespan: 100 BCE - 1400 CE
Certainty: 0.95 (very high)  
Connection: {type: "trade_route", name: "Silk Road"}
Added by: Silk Road Network Project, 2022-08-03

Attestation #67:
[Samarkand] --has_geometry--> [Polygon(...)]
Sources: Soviet Archaeological Survey, 1975
Timespan: 500 - 1500 CE
Certainty: 0.70 (probable)
Note: "Approximate extent of medieval walled city based on excavations"
Added by: Dr. Petrov, 2023-02-11
```

## Understanding Record Quality

### Quality Indicators

**High Quality Record Has**:
- Multiple sources confirming core facts
- Detailed temporal information
- Precise geometries with uncertainty quantified
- Multiple name forms in original scripts
- Rich network relationships
- Clear certainty assessments
- Recent contributions/updates

**Lower Quality Record Has**:
- Single source
- Vague temporal bounds ("sometime in Middle Ages")
- Imprecise location ("somewhere in France")
- Only modern name
- No relationships
- Missing certainty assessments
- Stale data

**Visual Indicators in Interface**:
- Star rating or badge
- Completeness percentage
- Last updated date
- "Needs improvement" flag
- Community trust score

### How to Improve Record Quality

If you notice gaps:
1. Click "Edit" button
2. Add missing information
3. Provide sources
4. Assess certainty
5. Submit for review

See [Editing Interface](../editing/interface.md)

## Navigating Complex Records

### For Places with Many Attestations

**Use Filters**:
- Filter by time period
- Filter by certainty
- Filter by source
- Filter by attestation type

**Use Summary Views**:
- Collapse detailed attestations
- Show only primary name/geometry/etc.
- Timeline visualizations

### For Places with Conflicts

**Look for**:
- Conflict indicators (⚠️ icon)
- Certainty differences
- Temporal resolution (may apply to different periods)
- Source quality differences

**Don't Assume**:
- One source is "right" - evaluate evidence
- Conflicts are errors - often legitimate disagreement
- More sources = more certain - depends on source independence

## Mobile vs Desktop View

### Desktop View
- Full detail visible
- Side-by-side comparisons
- Interactive visualizations
- Advanced filtering

### Mobile View (Responsive)
- Simplified card layout
- Collapsible sections
- Swipeable tabs
- Touch-optimized maps

## Accessibility Features

### For Screen Readers
- Proper ARIA labels on all elements
- Semantic HTML structure
- Text alternatives for visualizations
- Logical reading order

### For Keyboard Navigation
- Tab through all interactive elements
- Keyboard shortcuts for common actions
- Skip links to main sections
- Focus indicators

### For Visual Impairments
- High contrast mode
- Adjustable text size
- Color-blind friendly palettes
- Zoom support

## Next Steps

**Explore Related Documentation**:
- [Understanding Place Records](understanding-records.md) - Conceptual overview
- [Attestations & Provenance](attestations.md) - Deep dive into attestation model
- [Comparing Place Records](comparing.md) - Side-by-side analysis
- [Editing Interface](../editing/interface.md) - How to modify records

**Try It Yourself**:
- Search for a place you're interested in
- Explore its full record
- Try filtering attestations
- Follow relation links to related places
- Export the record to examine data structure