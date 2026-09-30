# Routes, Itineraries, Networks, Groups and Periods

This page describes how WHG models things that are made of other places: a **route** (a way through
places in order), an **itinerary** (a journey along a way, dated stop by stop) and a **network**
(places and the connections between them, in no single order). It also says where two things that
earlier drafts modelled in the same way now sit instead: a **gazetteer group**, which is a group of
Gazetteers, and a **period**, which is an Authority. Neither of those is a SpatialEntity.

% TODO(0.7.1-doi): add the 0.7.1 version DOI
The model is PLATO's, as released in [PLATO
0.7.1](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.1)
(all versions: [doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313)). A route, an itinerary or a network is a SpatialEntity, typed as such, and everything
about it (its members, their order, its connections and the figures a source gives for them) is an
attestation with its own source, date and certainty.

The excerpts on this page come from PLATO's
[worked examples of routes, journeys and networks](https://pelagios.org/place-attestation-ontology/guide/routes/):
the Antonine Itinerary (a route), King John in 1215 (an itinerary), the lower River Idle (a physical
network) and the Datini letters (a relational network).

---

## The building blocks

### Typing: routes, itineraries, networks and segments

What kind of entity a SpatialEntity is, is a Type attestation (`attests_type`). A Type node stands
for one dataset's use of a concept: its `@id`, if it has one, is the dataset's own address, never
the concept's IRI, which goes in its `identifier`; a Type may also say its vocabulary (`scheme`) and
that vocabulary's version (`schemeVersion`). PLATO declares four kinds of entity that a platform's
behaviour depends on, as concepts in the scheme `plato:EntityKindScheme`, so that any consumer can
tell these entities from places:

| Kind | What it is (PLATO's definition) |
|------|---------------------------------|
| `plato:TypeRoute` | An ordered set of places making a way: a road, a sea lane, a pilgrimage route. Its timespan, if any, is when it was in use, not when anyone travelled it. |
| `plato:TypeItinerary` | A journey made through places in order, each stop with its own timespan: a traveller's tour, a royal progress, a ship's voyage. |
| `plato:TypeNetwork` | A set of places and the connections between them, in no single order: a river system, a canal network, a correspondence network. |
| `plato:TypeSegment` | A physical link with an existence of its own: a leg of a route between two stations, a reach of a river between confluences. |

A Type attestation names one of these concepts by its IRI in the Type's `identifier`. A route may
also carry other Type attestations (an AAT term for a Roman road, say); the PLATO kind is what tells
WHG to treat it as a route.

```{note}
`plato:TypeItinerary` is not `plato:Itinerary`. The second is a **geometry role**: a line tracing a
route or journey, given on a Geometry. An itinerary SpatialEntity may have a geometry with that role,
but the role does not make anything an itinerary.
```

### Membership and sequence: `MemberOf`

Each member of a route, itinerary or network (a station, a stop, a port, a segment) has an
attestation **about the member** that `relates_to` the whole with the relation type
`plato:MemberOf` (label `member_of`, inverse `has_member`).

```
SpatialEntity(member) ←[attests_about]─ Attestation(sequence: n) ─[has_relation_type]→ RelationType(MemberOf)
                                              └─[relates_to]→ SpatialEntity(route | itinerary | network)
```

Where the source gives an order, the member's position is `plato:sequence` on **that same
attestation**:

- **The number is scoped by the `relates_to` target.** It orders the member within that one route,
  itinerary or network, so one place can hold different positions on different routes.
- **Lower numbers come first.** Gaps do not matter.
- **Equal numbers are alternatives** at that point: two branches of a road.
- **No number means the source gives no order.** It does not mean "last", and it is not an error.
- **The order is one source's.** Two sources that list a road's stations differently are recorded
  as their own attestations, each with its own sequence; where an editor judges between them, that
  judgement is a meta-attestation.

`MemberOf` is not containment: a town on a road is not within it, and a network's members need not
lie inside anything. Containment is `plato:ContainedIn`.

### Connections and direction: `ConnectedTo` and `LeadsTo`

A connection between two members is an attestation about one that `relates_to` the other:

| Relation type | Label / inverse | Direction |
|---------------|-----------------|-----------|
| `plato:ConnectedTo` | `connected_to` / `connected_to` | None. "A is connected to B" says the same as "B is connected to A". |
| `plato:LeadsTo` | `leads_to` / `reached_from` | From the subject (`attests_about`) to the target (`relates_to`). |

**Direction is carried by the relation type and nowhere else.** There is no qualifier that turns an
undirected connection into a directed one, because a consumer that ignored the qualifier would
silently misread a one-way connection as two-way.

A connection known in both directions from sources that each give one direction is better recorded
as **two `LeadsTo` attestations**, each with its own source, than as one `ConnectedTo`.

#### Project relation types: `plato:broader_relation`

A project may declare its own, narrower relation type ("flows into", "carries post to") as a
RelationType Authority with its own `relation_label` and `inverse_label`, and point it at the
starter type it narrows with `plato:broader_relation`. A narrower type keeps the direction of its
broader one, so a consumer that knows only `LeadsTo` still follows "flows into" the right way.
A project type is declared once, in the PLATO JSON document's `relationTypes` array (beside
`dataSets`), and any relation then uses its address as its `relationType`:

```json
"relationTypes": [
  {
    "@id": "https://example.org/vocab/flows-into",
    "label": "flows into",
    "inverseLabel": "receives",
    "broaderRelation": "https://w3id.org/plato#LeadsTo"
  }
]
```

(From [PLATO's JSON guide](https://pelagios.org/place-attestation-ontology/guide/json.html).) PLATO's
spreadsheet tables take only PLATO's own relation types, so a project type cannot be declared there;
from spreadsheets, a project uses `LeadsTo` itself, as the River Idle example does. See
[`plato:broader_relation`](https://w3id.org/plato#broader_relation) and
[`plato:declares_relation_type`](https://w3id.org/plato#declares_relation_type).

### Segments: `BeginsAt`, `EndsAt` and `HasEnd`

A physical link with its own existence (a leg of a road, a reach of a river) is a **segment**: a
SpatialEntity with a Type attestation naming `plato:TypeSegment`. It is a member of its route or network
(`MemberOf`, with a sequence where the source orders it), and it is joined to its end places with
relation types of its own:

| Relation type | Label / inverse | Use |
|---------------|-----------------|-----|
| `plato:BeginsAt` | `begins_at` / `beginning_of` | A directed segment begins at the target: a leg at the station it leaves, a reach at its upstream confluence. |
| `plato:EndsAt` | `ends_at` / `end_of` | A directed segment ends at the target: a leg at the station it reaches, a reach at its downstream confluence. |
| `plato:HasEnd` | `has_end` / `one_end_of` | An undirected segment has the target as one of its ends. It has two `HasEnd` attestations. |

```
Segment SpatialEntity (TypeSegment)
  ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(MemberOf)
                                └─[relates_to]→ Route or Network
  ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(BeginsAt)
                                └─[relates_to]→ Place A
  ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(EndsAt)
                                └─[relates_to]→ Place B
  ←[attests_about]─ Attestation ─[attests_property]→ PropertyValue(length, …)
```

**Segments never use `ConnectedTo` or `LeadsTo` for their ends.** Those always join one place to
another, so "the places connected to Londinium" never returns a segment, and a walk across a network
does not take two steps for every one.

A segment's geometry is optional: a leg known only by its ends needs none. Because a segment is not
a place in the everyday sense ("Road from Londinium to Durobrivae" would be a pseudo-place), WHG may leave
segments out of lists and searches of places.

### Figures on links: PropertyValues

Figures about a link (a distance, a journey time, a toll, a cargo, a count of letters) are
**PropertyValues** (`attests_property`), each on an attestation with its own source and date. Where
they go depends on what kind of link it is:

- **Physical link (a segment):** the figures are PropertyValues on attestations about the segment.
- **Relational link (two cities that exchanged letters):** the link *is* the `ConnectedTo` or
  `LeadsTo` attestation, and its figures are PropertyValues on that attestation itself.

```{note}
Earlier drafts of this model had a `connection_metadata` field, an opaque string for such figures.
It does not exist: PLATO removed it in 0.6.0, and WHG never implemented it.
```

### Computed values: `plato:computed`

Some values can be worked out again from other statements in the same data: an itinerary's span
from the timespans of its stops, a route's line from its stations, a network's hull. WHG marks such
a value `computed` (`plato:computed`, JSON `computed`) when it shows or exports it. A computed value
**is not evidence**: a consumer may show it, but must not import it as an attestation of its own. It
should compute the value again from the members, or leave it out and say so. See
[Computed extents](#computed-extents) below.

`computed` is not for every figure that someone worked out. PLATO's definition says:

> It is for a value derived from other statements in the same data, which any consumer holding them
> could derive again. A figure a project works out from its own source material and publishes as a
> finding (letters counted from a register, a median taken over them) is not computed in this sense:
> it is attested, citing the work that produced it as a Source or Dataset derived_from the material
> it was worked out from.

The letter counts in the Datini example (see
[Relational networks](#relational-networks-connections-with-figures)) are findings of that kind.

---

## Route

A **route** is a SpatialEntity typed `plato:TypeRoute`: an ordered set of places making a way. Its
timespan, if it has one, is when it was in use, not when anyone travelled it.

**Graph structure:**

```
Route SpatialEntity
  ←[attests_about]─ Attestation ─[attests_name]→ Name(…)
  ←[attests_about]─ Attestation ─[attests_type]→ Type(identifier: plato:TypeRoute)
  ←[attests_about]─ Attestation ─[attests_timespan]→ Timespan(when in use)        (optional)

  Stations, in the source's order:
  SpatialEntity(station 1) ←[attests_about]─ Attestation(sequence: 1) ─[has_relation_type]→ RelationType(MemberOf)
                                                    └─[relates_to]→ Route
  SpatialEntity(station 2) ←[attests_about]─ Attestation(sequence: 2) ─[has_relation_type]→ RelationType(MemberOf)
                                                    └─[relates_to]→ Route

  Legs, where modelled as segments:
  Segment(1→2) ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(MemberOf)
                                └─[relates_to]→ Route
               ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(BeginsAt)
                                └─[relates_to]→ station 1
               ←[attests_about]─ Attestation ─[has_relation_type]→ RelationType(EndsAt)
                                └─[relates_to]→ station 2
               ←[attests_about]─ Attestation ─[attests_property]→ PropertyValue(distance)
```

```{mermaid}
graph LR
    S1[station 1] -->|MemberOf, sequence 1| R((Route))
    S2[station 2] -->|MemberOf, sequence 2| R
    S3[station 3] -->|MemberOf, sequence 3| R
    L1[segment 1→2<br/>TypeSegment] -->|MemberOf| R
    L1 -->|BeginsAt| S1
    L1 -->|EndsAt| S2
```

Legs need not be modelled at all: a route whose source lists only stations is its stations in
order. Model a leg as a segment when the source says something about it (a distance, a stage of the
road) or when it has a geometry of its own.

In PLATO's Antonine Itinerary example, the roads between stations are segments and members of the
route like the stations, and the two share one sequence: Londinium 1, the road to Durobrivae 2,
Durobrivae 3, and so on. The first road, in PLATO JSON, with its membership of Iter III and its
length as Iter III gives it (its Type, its membership of Iter IV, its ends and its length as Iter
IV gives it are cut):

```jsonrelaxed
{
  "@id": "https://whgazetteer.org/example/antonine/place/leg-londinium-durobrivae",
  "label": "Road from Londinium to Durobrivae",
  "entityIdentifier": "leg-londinium-durobrivae",
  "attestations": [
    // …
    {
      // …
      "relations": [
        {
          "relatesTo": "https://whgazetteer.org/example/antonine/place/iter-iii",
          "relationType": "https://w3id.org/plato#MemberOf"
        }
      ],
      "sequence": 2
    },
    // …
    {
      // …
      "notes": "Written \"mpm XXVII\". As Iter III gives it.",
      "properties": [
        {
          "property": "https://www.wikidata.org/wiki/Property:P2043",
          "label": "length (Roman miles)",
          "value": 27,
          "unit": "http://www.wikidata.org/entity/Q2118176"
        }
      ]
    },
    // …
  ],
  // …
}
```

From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html).

### Routes within routes

A route may be a member of another route (one stage of a pilgrimage, one iter of a larger
itinerary), with `MemberOf` and a sequence like any other member. A route may not be a member of
itself through any chain of memberships, and plato-tools reports a cycle as an error. See
[`plato:MemberOf`](https://w3id.org/plato#MemberOf).

### Branches and alternatives

Two members with the **same sequence number** are alternatives at that point: two branches of a
road, two stations a source offers for one stage. Neither is preferred by the data; if an editor
prefers one, that is a meta-attestation. See [`plato:sequence`](https://w3id.org/plato#sequence).

### Unknown order

A member with **no sequence** is in an order the source does not give. It is still a member; it
simply has no position.

% TODO(v4): say how WHG shows unordered members (listed apart? left out of a drawn line?), once decided.

### Two sources, two orders

Each source's order stays on that source's attestations. A second source that orders the same
stations differently is a second set of `MemberOf` attestations, not a correction of the first.

---

## Itinerary

An **itinerary** is a SpatialEntity typed `plato:TypeItinerary`: a journey made through places in
order, each stop with its own timespan. The distinction from a route is WHG's: **a route is a way,
and an itinerary is a journey made along one, dated stop by stop.**

- Each stop is a member (`MemberOf`), with a `sequence` where the source orders the stops.
- **A stop's timespan is its stay**, from arrival to departure, given on the member's
  `MemberOf` attestation (`attests_timespan`).
- The order of a journey known only from its dates may be left to those timespans, with no
  `sequence`.
- A leg between stops that the source describes (a distance, a day's ride) is a segment, as for a
  route.
- Where the source states how long a stay lasted, the timespan carries `plato:duration`, an
  `xsd:duration` (`P4D` for four days; weeks are written as days, `P42D`), beside its dates or, if
  the source gives none, alone.
- The itinerary's own span is **computed** from its stops' timespans unless a source gives it
  (see [Computed extents](#computed-extents)).

**Graph structure:**

```
Itinerary SpatialEntity
  ←[attests_about]─ Attestation ─[attests_name]→ Name(…)
  ←[attests_about]─ Attestation ─[attests_type]→ Type(identifier: plato:TypeItinerary)

  Stops, each with its stay:
  SpatialEntity(stop 1) ←[attests_about]─ Attestation(sequence: 1)
                                             ├─[has_relation_type]→ RelationType(MemberOf)
                                             ├─[relates_to]→ Itinerary
                                             └─[attests_timespan]→ Timespan(arrival – departure)
  SpatialEntity(stop 2) ←[attests_about]─ Attestation(sequence: 2)
                                             ├─[has_relation_type]→ RelationType(MemberOf)
                                             ├─[relates_to]→ Itinerary
                                             └─[attests_timespan]→ Timespan(arrival – departure)

  Span shown by WHG (not stored as evidence):
  Itinerary ── Timespan(earliest arrival – latest departure, computed: true)
```

In PLATO's King John example, Marlborough is a member of the journey twice, as stop 12 and stop 17,
each with its own stay on its own `MemberOf` attestation; the first gives a length as well as dates.
Its two MemberOf attestations, in PLATO JSON:

```jsonrelaxed
[
  {
    "timespans": [
      {
        "sourceLabel": "the first four days of July",
        "startEarliest": "1215-07-01",
        "endLatest": "1215-07-04",
        "duration": "P4D"
      }
    ],
    // …
    "relations": [
      {
        "relatesTo": "https://whgazetteer.org/example/king-john/place/itinerary-1215",
        "relationType": "https://w3id.org/plato#MemberOf"
      }
    ],
    "sequence": 12
  },
  {
    "timespans": [
      {
        "sourceLabel": "the following day",
        "startEarliest": "1215-07-08",
        "endLatest": "1215-07-08"
      }
    ],
    // …
    "sequence": 17
  }
]
```

From PLATO's worked example [King John in 1215](https://pelagios.org/place-attestation-ontology/guide/routes/king-john.html).

```{note}
A journey is **not** a Linked Traces relation between a place and a traveller. PLATO is explicit:
a journey's waypoints, stops, origin and destination are members of an itinerary, with `MemberOf`,
ordered by `sequence`, their stays given by timespans. The relation types for a place's part in a
person's life (`BirthplaceOf`, `ResidenceOf` and the rest) are for other things; see
[Associations](#associations-places-in-the-histories-of-people-objects-and-events).
```

---

## Network

A **network** is a SpatialEntity typed `plato:TypeNetwork`: a set of places and the connections
between them, in no single order. Its members are `MemberOf` the network, usually with no
`sequence`. What joins them depends on whether the links are **physical** or **relational**.

| | Physical network | Relational network |
|---|---|---|
| A link is | a segment (a SpatialEntity, `TypeSegment`) | a `ConnectedTo` or `LeadsTo` attestation |
| Its ends | `BeginsAt`/`EndsAt` (directed) or `HasEnd` ×2 | the attestation's subject and target |
| Its figures | PropertyValues on attestations about the segment | PropertyValues on the connection attestation itself |
| Its geometry | optional, on the segment | none of its own |
| Examples (PLATO) | a river system, a canal network | a correspondence network |

### Physical networks: segments

A river system or a canal network is made of links that exist in their own right. Each reach or
cut is a segment: `MemberOf` the network, with `BeginsAt` and `EndsAt` its end places (or `HasEnd`
twice if it has no direction), and its length and other figures as PropertyValues.

Rivers that flow into one another are places, and are joined directly with `LeadsTo`, or with a
project type such as "flows into" whose `broader_relation` is `LeadsTo`. The reaches never are.
PLATO's comment on `LeadsTo` gives "one river flowing into another" as its first example, and says:

> It joins two places; the reaches and legs of a network are segments, whose direction is given by
> plato:BeginsAt and plato:EndsAt.

Where the source orders the reaches (downstream, say), their `MemberOf` attestations carry a
`sequence`, as for a route.

```
Network SpatialEntity (TypeNetwork)
  Segment(reach) ─MemberOf→ Network                    (sequence, where the source orders the reaches)
  Segment(reach) ─BeginsAt→ junction (upstream)
  Segment(reach) ─EndsAt→   junction (downstream)
  river (tributary) ─LeadsTo / "flows into"→ river     (optional)
```

```{mermaid}
graph LR
    T[tributary river] -->|LeadsTo<br/>or a narrower type| N((river network))
    R1[reach A–B<br/>TypeSegment] -->|BeginsAt| C1[junction A]
    R1 -->|EndsAt| C2[junction B]
    R1 -->|MemberOf| N
```

From PLATO's River Idle example, in Turtle: a tributary joined to the river with `LeadsTo`, and one
reach's membership (numbered downstream) and its upstream end. Its downstream end (`EndsAt`) and
its length, a PropertyValue as for a road's, follow in the full example.

```turtle
# Rivers are places, and LeadsTo joins places: the Ryton flows into the Idle,
# the Idle into the Trent.
whgx:river-idle\/attestation\/ryton-into-idle
    a plato:Attestation ;
    plato:attests_about whgx:river-idle\/place\/river-ryton ;
    plato:relates_to whgx:river-idle\/place\/river-idle ;
    plato:has_relation_type plato:LeadsTo ;
    plato:has_citation [ a plato:Citation ;
        plato:cites whgx:river-idle\/source\/rewt-v020 ;
        plato:locator "link 53DEF62E, to_node 69D120BE" ] .

# …

whgx:river-idle\/attestation\/reach-04-member
    a plato:Attestation ;
    plato:attests_about whgx:river-idle\/place\/reach-04 ;
    plato:relates_to whgx:river-idle\/place\/river-idle ;
    plato:has_relation_type plato:MemberOf ;
    plato:sequence 4 ;
    plato:has_citation whgx:river-idle\/citation\/reach-04 .

whgx:river-idle\/attestation\/reach-04-begins
    a plato:Attestation ;
    plato:attests_about whgx:river-idle\/place\/reach-04 ;
    plato:relates_to whgx:river-idle\/place\/node-03 ;
    plato:has_relation_type plato:BeginsAt ;
    plato:has_citation whgx:river-idle\/citation\/reach-04 .
# …
```

From PLATO's worked example [the lower River Idle](https://pelagios.org/place-attestation-ontology/guide/routes/river-idle.html).

### Relational networks: connections with figures

A correspondence network, or any network whose links are relationships rather than things, has no
segments. Each link is a `ConnectedTo` (either way) or `LeadsTo` (one way) attestation between two
places, and each figure a source gives about that link (letters sent, a delivery time) is a
PropertyValue **on that same attestation**, with the attestation's own source and date.

```
SpatialEntity(city A) ←[attests_about]─ Attestation
                                          ├─[has_relation_type]→ RelationType(LeadsTo)
                                          ├─[relates_to]→ SpatialEntity(city B)
                                          ├─[attests_property]→ PropertyValue(<figure>)
                                          ├─[attests_timespan]→ Timespan(<when>)
                                          └─[sourced_by]→ Source
```

Several figures about one link from one source may sit on one attestation; figures from different
sources, or for different dates, are different attestations. Connections appear and disappear over
time in the same way: as attestations with different timespans.

In PLATO's Datini example, the letters from Florence to Pisa are a `LeadsTo` attestation about
Florence, carrying the count as a PropertyValue; the median delivery time is a second attestation
of the same kind, and Pisa to Florence is two more. The counts were worked out from a dataset of
letters, so they cite that work as a Source of its own, `derivedFrom` the dataset: they are
attested findings, not computed values (see [Computed values](#computed-values-platocomputed)).

```jsonrelaxed
{
  "timespans": [
    {
      "sourceLabel": "1355-1402",
      "startEarliest": "1355",
      "endLatest": "1402"
    }
  ],
  "citations": [
    {
      "source": {
        "@id": "https://whgazetteer.org/example/datini/source/letters-by-pair",
        "title": "Letters and delivery times by pair of cities",
        // …
        "derivedFrom": "https://whgazetteer.org/example/datini/source/datini-metadata",
        // …
      },
      "locator": "FIRENZE to PISA",
      "citationFunction": "http://purl.org/spar/cito/citesAsDataSource"
    }
  ],
  // …
  "relations": [
    {
      "relatesTo": "https://whgazetteer.org/example/datini/place/pisa",
      "relationType": "https://w3id.org/plato#LeadsTo"
    }
  ],
  "properties": [
    {
      "property": "https://www.wikidata.org/wiki/Property:P1114",
      "label": "letters sent",
      "value": 16261
    }
  ]
}
```

From PLATO's worked example [the Datini letters](https://pelagios.org/place-attestation-ontology/guide/routes/datini.html).

---

## Gazetteer groups

A **gazetteer group** is a thematic or organisational grouping of **Gazetteers**, not of places:
PLATO's example is "EMEW — Gazetteer of Early Modern England and Wales". It is the class
`plato:GazetteerGroup`, and a Gazetteer belongs to one with `plato:member_of_group`.

```
Gazetteer ─[member_of_group]→ GazetteerGroup
Gazetteer ─[member_of_group]→ GazetteerGroup
```

- **It is not a SpatialEntity.** It has no name, type, geometry or timespan attestations, and it
  does not appear among places.
- **Membership is not `MemberOf`.** `plato:member_of_group` links a Gazetteer to its group
  directly; it is not an attestation and carries no sequence.
- Anything a group appears to "cover" in space or time is worked out from its Gazetteers' contents
  and, if shown, is computed.

% TODO(v4): say what a gazetteer group's own metadata is in WHG (title, description, curators), once decided; PLATO declares only the class and member_of_group.

---

## Periods

A **period** is an Authority (`plato:Period`), alongside Sources, Datasets, RelationTypes and
CertaintyLevels: a named historical period ("Byzantine", "Early Modern"), optionally linked to
PeriodO or defined locally.

| Property | Use |
|----------|-----|
| `plato:period_label` | The period's name. |
| `plato:has_timespan` | Its temporal extent, as a Timespan, for a locally defined period. |
| `plato:period_periodo_uri` | The PeriodO definition it aligns with. |
| `plato:spatial_coverage` | The region to which it applies, as free text or a URI. |

- **It is not a SpatialEntity**, and it has no members. Places are not `MemberOf` a period.
- An attestation's date may be given **relative to** a period: a Timespan with `plato:relative_to`
  pointing at the Period ("during the reign of Justinian").
- A Timespan may also carry a `plato:periodo_uri` of its own, where it corresponds to a PeriodO
  period.
- PeriodO periods come into WHG as Period authorities, not as SpatialEntities (this follows from
  `plato:Period` being an Authority; the import itself is not yet specified).

% TODO(v4): state how WHG shows a Period (its own page? a filter?), once decided.

---

## Computed extents

WHG works out some values from the members of a route, itinerary or network. They are useful to
show and to export, and harmful to import: read back as attestations, they would become evidence that
no source gave, and they would outlive any correction to the members they were computed from.

**Timespan of an itinerary.** Unless a source gives one, the span is computed from the members'
`MemberOf` timespans:

- `start_earliest` = the minimum of the members' `start_earliest`
- `start_latest` = the minimum of the members' `start_latest`
- `end_earliest` = the maximum of the members' `end_earliest`
- `end_latest` = the maximum of the members' `end_latest`

**Geometry of a route or network.** Unless a Geometry is attested for the entity itself, WHG may
derive one: a route's line through its stations in sequence order (skipping unordered members), or
a network's hull of its members' geometries.

**Attested beats computed.** A timespan or geometry that a source gives for the route, itinerary or
network is an ordinary attestation and is shown as such. A computed value is shown only where there
is no attested one, and is always labelled as computed.

**Worked out is not the same as computed.** Only a value that can be derived again from the other
statements in the same data is computed. A figure a project has worked out from its own source
material (the Datini letter counts) is attested, citing that work as a Source `derived_from` the
material, and is imported like any other attestation.

**On export**, a computed value carries `computed: true` (on the attestation, or on the facet in its
`qualification`). **On import**, WHG does not take in anything marked `computed` as an attestation;
it computes the value again from the members.

For King John's itinerary of 1215, WHG would compute the span from the stops' own dates (the first
arrival, 1 June, to the last departure, 17 July) and export it as one more attestation on the
itinerary, marked `computed`:

```json
{
  "timespans": [
    {
      "startEarliest": "1215-06-01",
      "endLatest": "1215-07-17"
    }
  ],
  "citations": [
    {
      "source": {
        "@id": "https://whgazetteer.org/",
        "title": "World Historical Gazetteer",
        "authorityType": "dataset"
      }
    }
  ],
  "computed": true,
  "notes": "Computed by WHG from the stops' dates: earliest arrival to latest departure."
}
```

`computed` says how the value arose; the citation says who says so (WHG itself, as a dataset). A
consumer that sees both knows to recompute the span from the stops rather than import it, since it
is not evidence. (This attestation is not part of
[PLATO's King John example](https://pelagios.org/place-attestation-ontology/guide/routes/king-john.html);
added to a copy of it, the document still passes plato-tools.)

**Several geometries:** PLATO does not accept a GeoJSON `GeometryCollection`; each geometry is its
own Geometry node. When one source gives several geometries together (a point and a polygon for the
same thing, say), they may sit in one attestation, each with a `role` where they depict different
things. A geometry from another source, or for another date, goes in its own attestation, because
provenance belongs to the attestation.

---

## On place pages

A station, a stop or a port is an ordinary place, and its page shows the routes, itineraries and
networks it belongs to:

- **Memberships:** each `MemberOf` attestation, with the whole it relates to and, where given, its
  position (`sequence`) and its neighbours in that source's order.
- **Connections:** its `ConnectedTo` and `LeadsTo` attestations, showing direction ("leads to" /
  "reached from") and any figures.
- **Segments** are not listed as places. A segment's own page, if it has one, shows its ends and
  figures.

### Associations: places in the histories of people, objects and events

Linked Traces annotated places with their part in the lives of people, the history of objects and
the course of events. In PLATO each such statement is an attestation about the place that
`relates_to` the person, object or event by its IRI, with a `plato:related_label` to name it, and one
of these relation types:

| Relation type | Label / inverse | Target |
|---------------|-----------------|--------|
| `plato:BirthplaceOf` | `birthplace_of` / `born_at` | person |
| `plato:DeathplaceOf` | `deathplace_of` / `died_at` | person |
| `plato:ResidenceOf` | `residence_of` / `resided_at` | person or group |
| `plato:FindspotOf` | `findspot_of` / `found_at` | object |
| `plato:SettingOf` | `setting_of` / `took_place_at` | event |
| `plato:WorkplaceOf` | `workplace_of` / `worked_at` | person or group |
| `plato:DepictedIn` | `depicted_in` / `depicts` | image, map or drawing |
| `plato:SubjectOf` | `subject_of` / `about` | record, document or publication |

The last two, new in PLATO 0.7.0, link a place to images and records held elsewhere: a photograph
or plan that shows it (`DepictedIn`), or an archival file, site record or publication about it
(`SubjectOf`). Each is a statement of its own, usually sourced from the catalogue that identified
it, not a citation of evidence for another statement (which is `has_citation`).

The target is usually not a SpatialEntity, and PLATO deliberately gives `relates_to` no range so
that it is not inferred to be one. PLATO's comment on `relates_to` says:

> Platforms should show relations to entities that are not spatial apart from spatial ones, and
> leave them out of containment, clustering and matching.

So WHG shows associations in their own section of a place page, labelled with `related_label`, and
does not use them in containment, clustering or matching. Thematic keywords ("coastal trade",
"politics") are not relations: they belong in notes or, where they classify, in a Type.

% TODO(v4): decide whether any example among the four carries an association; otherwise take one from the PLATO examples when they exist.
