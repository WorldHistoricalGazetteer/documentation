# Introduction

## The Multi-Temporal Data Challenge

One of the core challenges WHG v3 faced—and v4 explicitly solves—is representing Places that have multiple names and
geometries at different time periods, where those attributes (names especially) need to be reusable across multiple Places.

For example, Constantinople/Istanbul:

- Was called "Byzantion" (667 BCE - 330 CE) with ancient settlement boundaries
- Was called "Konstantinoupolis" (330-1453 CE) with Byzantine city walls
- Was called "Istanbul" (1453-present) with expanded Ottoman boundaries

The same name might appear for multiple places, the same geometry might represent different political entities at
different times, and the same timespan might apply to numerous historical phenomena. Traditional relational models
struggle with this many-to-many-to-many complexity while preserving provenance and managing conflicting sources.

## The Solution: Attestations as Bundle Nodes

The Attestation acts as a bundle through the **EDGE collection**, not through fields stored in the Attestation itself.

### Visual Representation

```{mermaid}
graph TD
    T[THING<br/>Constantinople]
    N[NAME<br/>Konstantinoupolis]
    G[GEOMETRY<br/>Byzantine walls]
    TS[TIMESPAN<br/>330-1453 CE]
    AUTH[AUTHORITY<br/>Byzantine Chronicle<br/>authority_type: source]
    A[ATTESTATION<br/>att-001<br/>certainty: 1.0]
    
    T -->|subject_of| A
    A -->|attests_name| N
    A -->|attests_geometry| G
    A -->|attests_timespan| TS
    A -->|sourced_by| AUTH
    
    style A fill:#75ca55,stroke:#333,stroke-width:3px,rx:10,ry:10
    style T fill:#e489b3,stroke:#333,stroke-width:2px,rx:10,ry:10
    style N fill:#eaeafd,stroke:#333,stroke-width:2px,rx:10,ry:10
    style G fill:#eaeafd,stroke:#333,stroke-width:2px,rx:10,ry:10
    style TS fill:#eaeafd,stroke:#333,stroke-width:2px,rx:10,ry:10
    style AUTH fill:#f6e16b,stroke:#333,stroke-width:2px,rx:10,ry:10
```

### The Attestation Document

An Attestation is a lightweight node (vertex) containing only metadata:

```javascript
ATTESTATION
{
    string
    _key
    PK
    string
    _id
    "attestations/xyz"
    integer
    sequence
    "for ordered sequences in routes/itineraries"
    json
    connection_metadata
    "for networks: trade goods, flow direction, etc"
    float
    certainty
    "0.0 to 1.0"
    text
    certainty_note
    "explanation of certainty assessment"
    text
    notes
    "additional context"
    timestamp
    created
    timestamp
    modified
    string
    contributor
    "user or system that created attestation"
}
```

### How Bundling Works Through Edges

An Attestation with `_id = "attestations/att-001"` becomes a bundle through edges that all share the same `_from` value:

```javascript
// Edge 1: Links this attestation to the Place
{
    _from: "attestations/att-001",
        _to
:
    "things/constantinople",
        edge_type
:
    "subject_of"
}

// Edge 2: Links this attestation to a Name
{
    _from: "attestations/att-001",
        _to
:
    "names/konstantinoupolis",
        edge_type
:
    "attests_name"
}

// Edge 3: Links this attestation to a Geometry
{
    _from: "attestations/att-001",
        _to
:
    "geometries/byzantine-walls",
        edge_type
:
    "attests_geometry"
}

// Edge 4: Links this attestation to a Timespan
{
    _from: "attestations/att-001",
        _to
:
    "timespans/330-1453",
        edge_type
:
    "attests_timespan"
}

// Edge 5: Links this attestation to its Source (from AUTHORITY collection)
{
    _from: "attestations/att-001",
        _to
:
    "authorities/byzantine-chronicle",
        edge_type
:
    "sourced_by"
}
```

## Complete Example: Constantinople Through Time

Here's how three different time periods would be modeled:

**Attestation 1** (Byzantine period):

- Links TO: Thing "Constantinople"
- Links TO: Name "Konstantinoupolis"
- Links TO: Geometry "Byzantine city walls"
- Links TO: Timespan "330-1453 CE"
- Links TO: Authority "Byzantine chronicles" (authority_type: source)

**Attestation 2** (Ottoman period):

- Links TO: Thing "Constantinople" (same place!)
- Links TO: Name "Istanbul"
- Links TO: Geometry "Expanded Ottoman boundaries"
- Links TO: Timespan "1453-1923 CE"
- Links TO: Authority "Ottoman tax records" (authority_type: source)

**Attestation 3** (Ancient Greek period):

- Links TO: Thing "Constantinople" (same place again!)
- Links TO: Name "Byzantion"
- Links TO: Geometry "Ancient settlement point"
- Links TO: Timespan "667 BCE - 330 CE"
- Links TO: Authority "Classical texts" (authority_type: source)

## Why This Works

1. **Each Attestation is independent** - it bundles one specific name-geometry-time combination
2. **Names can be reused** - "Istanbul" could also appear in attestations for other places
3. **Geometries can be reused** - the same boundary polygon could apply to multiple places or time periods
4. **Timespans can be reused** - "Byzantine period" could be attached to many different attestations
5. **No conflicts** - when you query "What was this place called in 800 CE?", you follow the edges through the
   Attestation that has a Timespan overlapping 800 CE

## Key Insight

The Attestation node itself is just an ID with metadata (certainty, notes, contributor). The **bundling happens in the
EDGE table** where all edges with `_from: "attestations/att-001"` create the bundle by connecting that single
attestation to multiple entities.

Attestations are modeled as **nodes** (vertices) rather than edges, which allows them to serve as the common point that
multiple edges radiate from. The Attestation acts as a **junction point** that says "these particular things go together
at this particular time according to this particular source."

## The Role of AUTHORITY and RELATION_TYPE

The AUTHORITY collection uses a **single table inheritance** pattern with an `authority_type` field to distinguish
between different types of reference data: `"dataset"`, `"source"`, `"relation_type"`, `"period"`, and
`"certainty_level"`.

### RELATION_TYPE (authority_type: "relation_type")

RELATION_TYPE documents provide extensibility and semantic richness for Thing-to-Thing relationships. While
system-defined edge types like "subject_of", "attests_name", and "attests_geometry" are hard-coded into the application,
the "relates_to" edge type allows for custom, user-defined relationships between Things.

For example, historians might need to model that:

- Alexandria was the "capital_of" Ptolemaic Egypt
- Rome was "successor_to" various earlier settlements
- Damascus was "connected_by_trade_route_to" Baghdad
- Jerusalem was "pilgrimage_destination_for" multiple religious traditions

Each RELATION_TYPE document (where `authority_type: "relation_type"`) defines:

- **label** and **inverse**: Bidirectional navigation (e.g., "capital_of" ↔ "has_capital")
- **domain** and **range**: Valid subject and object types (e.g., "capital_of" requires a City and a Political Entity)
- **description**: Human-readable explanation of the relationship semantics

When an edge has `edge_type: "relates_to"`, it references an AUTHORITY document with `authority_type: "relation_type"`to
specify the precise nature of the relationship. This keeps the core model stable while allowing the vocabulary of
historical relationships to grow organically as new use cases emerge.

### Other AUTHORITY Types

**Sources** (`authority_type: "source"`): Citation metadata for individual source records

- Reference parent datasets via edges with `edge_type: "part_of"`
- Eliminate redundancy by storing source metadata once

**Datasets** (`authority_type: "dataset"`): Collection-level metadata

- Title, version, publisher, license, URI
- Can reference external authorities like PeriodO

**Periods** (`authority_type: "period"`): Temporal period definitions

- Link to PeriodO or define custom periods
- Include timespan bounds for period matching

This unified approach provides operational efficiency (one collection to manage) while maintaining semantic clarity
through the `authority_type` discriminator.

## Meta-Attestations: Attesting About Attestations

Because Attestations are nodes, they can themselves be the subject or object of other attestations. This enables
meta-attestations—attestations about the veracity, relationship, or context of other attestations.

For example, you might have:

**Original Attestation** (att-001):

- Claims Constantinople was called "Konstantinoupolis" during 330-1453 CE
- Based on Byzantine chronicles
- Certainty: 0.9

**Meta-Attestation** (att-002):

- Subject: Attestation att-001
- Relation type: "contradicts" or "supports" or "supersedes"
- Object: Another attestation (att-003) making a different claim
- Source: Modern scholarly article
- Notes: "Recent archaeological evidence suggests..."

This is implemented using the same edge pattern:

```javascript
// Meta-attestation edge connecting two attestations
{
    _from: "attestations/att-002",
        _to
:
    "attestations/att-001",
        edge_type
:
    "meta_attestation",
        meta_type
:
    "contradicts"  // or "supports", "supersedes", "bundles"
}
```

This allows the system to represent scholarly discourse, conflicting sources, corrections over time, and the evolution
of historical understanding—all while maintaining full provenance chains. Every meta-attestation itself has certainty
values, sources, and timestamps, creating a complete audit trail of how interpretations have changed.