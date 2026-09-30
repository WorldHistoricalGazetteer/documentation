# Use Cases

This page describes what WHG v4 is for, one use case at a time. Each case gives the problem, how the
data model handles it, and where to read more. The model is [PLATO](https://w3id.org/plato), the
Place Attestation Ontology, at [PLATO
0.7.0](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.0)
([doi:10.5281/zenodo.23056873](https://doi.org/10.5281/zenodo.23056873); all
versions: [doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313)). The examples come from PLATO's four [worked
examples](https://pelagios.org/place-attestation-ontology/guide/routes/) and its other example
files:

- **the Antonine Itinerary**: Iters III and IV, two Roman roads from London to the Kent ports;
- **King John in 1215**: the King's movements in June and July 1215, as T. D. Hardy traced them;
- **the lower River Idle**: a river network of reaches and junctions;
- **the Datini letters**: a correspondence network between merchant cities.

One principle runs through all of them. WHG does not flatten sources into a single record. Every
statement is an **attestation**: a claim about a place, with its own source, dates and certainty.
Places are compared, grouped and shown by weighing those claims, not by overwriting them.

---

## Finding a place as it was named at the time

**The problem.** A historian needs to know what a place was called in a given period, and by
whom, and not just its modern name.

**How the model handles it.** A name is attested, not fixed. Each name attestation carries its
source and, where the source gives one, a timespan. A place can therefore hold many names, each
dated and cited. The Antonine Itinerary's Londinium, for instance, carries the Latin form the
Itinerary uses (*Londinio*, in the ablative), attributed to the 1848 edition that prints it. Dates
can be exact, ranges with earliest and latest bounds, or stated with a precision (`year`,
`century` and so on). A source's own wording of a date is kept in `sourceLabel`.

**Read more.** [Attestations and Relations](attestations.md).

---

## Dating by period

**The problem.** Sources often date by period ("in the Byzantine period", "during the reign of
Justinian") rather than by year.

**How the model handles it.** A **period** is an Authority (`plato:Period`), not a place. It may
align with a PeriodO definition (`plato:period_periodo_uri`) or be defined locally with its own
Timespan (`plato:has_timespan`). An attestation's Timespan can refer to a Period
(`plato:relative_to`), or carry a PeriodO URI of its own (`plato:periodo_uri`). A search for places
in a period can then find attestations dated by that period as well as those dated by years that
fall within it.

**Read more.** [Periods](patterns.md#periods).

---

## Weighing sources that disagree

**The problem.** Sources disagree about where a place was, when it existed, what it was called, or
whether something happened there at all. A gazetteer that keeps only one answer hides the
disagreement.

**How the model handles it.** Each source's claim is its own attestation, so disagreements sit
side by side instead of being resolved by deletion. PLATO keeps apart several things that are
easily confused:

| What is being said | How PLATO records it |
|---|---|
| How confident the contributor is | `certainty` (0 to 1), or a `certaintyLevel` |
| How firmly the source itself asserts it (hedged, hearsay, doubted) | `sourceStance` |
| That the place has no sharp boundary | `fuzziness` |
| How finely a location is given | `spatialPrecision` and `precisionKm` |
| That the source **denies** it | `negated: true` |
| That one claim contradicts, supports, supersedes or refines another | a meta-attestation (`meta`) |

A denial is evidence too. In the King John example, Hardy rejects the older story that the King
went to the Isle of Wight straight after Magna Carta. That is recorded as a denied stop on the
itinerary, not left out:

```jsonrelaxed
{
  "timespans": [
    {
      "sourceLabel": "then",
      "startEarliest": "1215-06-15",
      "endLatest": "1215-07-17"
    }
  ],
  "citations": [
    {
      "source": "https://whgazetteer.org/example/king-john/source/hardy-1835",
      "locator": "pp. 109-110",
      "citationFunction": "http://purl.org/spar/cito/citesAsEvidence"
    }
  ],
  "negated": true,
  "notes": "\"The statement of historians that John went to the Isle of Wight immediately after signing Magna Carta is thus clearly shown to be erroneous, as it is unquestionable that the King did not then visit the Isle of Wight\".",
  "relations": [
    {
      "relatesTo": "https://whgazetteer.org/example/king-john/place/itinerary-1215",
      "relationType": "https://w3id.org/plato#MemberOf"
    }
  ]
}
```

From PLATO's worked example [King John in 1215](https://pelagios.org/place-attestation-ontology/guide/routes/king-john.html)
(`schemas/examples/place-centric-king-john.json`).

**Read more.** [Attestations and Relations](attestations.md);
[Vocabularies](vocabularies.md).

---

## Containment: what lay within what, and when

**The problem.** A parish lay in a hundred and a hundred in a county, and a province lay in an
empire. These arrangements changed over time, and different sources describe them differently.

**How the model handles it.** Containment is a relation attestation of type `ContainedIn`
(`contained_in`, inverse `contains`). The attestation is about the smaller place, `relates_to` the
larger, and carries its own source and timespan. It is a claim like any other and is not fixed by
the class model. In PLATO's survey example, Domesday puts Bunsty Hundred in Buckinghamshire in 1086:

```text
place_id,relation_type,related_place_id,related_uri,related_label,sequence,date,from,to,duration,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
bunsty,ContainedIn,buckinghamshire,,,,1086,1086,,,domesday,,,,,,,,Domesday lists the hundred under Buckinghamshire; no end date is asserted.
```

From PLATO's `schemas/tables/examples/survey/relations.csv`.

The provinces of a polity work the same way. Each province has a `ContainedIn` attestation for
each period its source gives. A province that changed hands has several such attestations, each
dated and each cited. What the polity contained at a given date is then a question about those
attestations: which containment claims hold at that date, and on whose authority.

A polity's extent drawn from its provinces is **worked out**, not stored as a fact about the
polity. Where WHG shows such an extent, it is marked `computed`, and a territory that a source
itself describes is shown as that source's attestation instead.

`ContainedIn` is not `MemberOf`. A town on a road is not within the road, and a route's stations are
its members, not its contents.

**Read more.** [Computed extents](patterns.md#computed-extents);
[Attestations and Relations](attestations.md).

---

## Reconciling a list of place names

**The problem.** A project has a table of place names from its sources and needs to know which
places they are.

**How the model handles it.** Map your Data suggests matches from WHG's index, ranked by name,
sound, location, type and country. Each suggestion is a **Candidate** (`plato:Candidate`), with a
similarity score, the algorithm's version and, optionally, the settings that produced the score
(`match_parameters`). A Candidate is not evidence. When a person accepts it, the match becomes an
**identity attestation**: one or more `IdentityRelation`s (`exactMatch`, `closeMatch`, `related` or
`unspecified`) bundled in an attestation that records who accepted them, when, and on what basis.
The project's places and the matched records each keep their own identity. Nothing is merged, and no
new identifier is minted.

Names spelled differently, or written in other scripts, are found through **sounds-alike search**,
which compares how names are pronounced (see [Sounds-alike search](../guide/sounds-alike.md)). A
name attestation can carry the name's language, script, romanised form and IPA.

**Read more.** [Linking to places WHG already holds](contributions.md#linking-to-places-whg-already-holds);
[Map your Data](../../v3-3/map-your-data.md).

---

## One place in many gazetteers: clusters and loci

**The problem.** The same place appears in Pleiades, GeoNames, Wikidata and several contributed
gazetteers. A user wants to see these records together, without anyone deciding once and for all
which records are "really" one place.

**How the model handles it.**

- **A cluster is a query result, not stored data.** In [Atlas](../../atlas.md), records that seem to
  describe the same place are grouped as you explore, from the evidence (name, sound, location,
  time, type) and from stated identity links. How cautious the grouping is, is up to you. PLATO
  has no cluster class.
- **A locus is the citable form of a cluster.** It gives a grouping an identifier that can be cited
  and reproduced ([place#172](https://github.com/WorldHistoricalGazetteer/place/issues/172)).
- **Accepting a cluster is one attestation.** A person who accepts a cluster of *n* records asserts
  the *n*−1 `exactMatch` relations of the matches actually made (a spanning tree), bundled in one
  attestation, with the cluster's definition as its source. It is one person's attributed claim,
  never a canonical record.
- **Disagreement is recorded too.** "These two are not the same" is an attestation with
  `negated: true` around one `exactMatch`.
- **Identity does not chain across claims.** `exactMatch` may be followed within one attestation
  only. A is B (said by one person) and B is C (said by another) does not mean that anyone said A is
  C.

**Wikidata** is one of the gazetteers WHG reads. Links to Wikidata items are identity attestations
in WHG, like any other. WHG does not write its attestations back to Wikidata as claims: an
attributed, possibly contested attestation is a different kind of thing from a Wikidata statement
([place#170](https://github.com/WorldHistoricalGazetteer/place/issues/170)).

**Read more.** [Atlas](../../atlas.md);
[Identifiers and citation](../guide/identifiers.md).

---

## Routes, journeys and networks

**The problem.** Historical movement and connection are not captured by a list of points: the
stations of a road in order, a traveller's stops with dates, a river system, a web of
correspondence.

**How the model handles it.** A route, an itinerary or a network is a SpatialEntity with a Type
attestation that says which it is. Its members relate to it with `MemberOf`, ordered by `sequence`
where the source orders them. Each of PLATO's four worked examples shows one pattern:

| Example | Pattern | What it shows |
|---|---|---|
| Antonine Itinerary, Iters III–IV | [Route](patterns.md#route) | Stations and roads (segments) in one sequence, with distances as the Itinerary gives them |
| King John in 1215 | [Itinerary](patterns.md#itinerary) | Stops dated stay by stay; a place visited twice; a stop the source denies |
| The lower River Idle | [Physical network](patterns.md#physical-networks-segments) | Reaches as segments with `BeginsAt`/`EndsAt`; rivers joined with `LeadsTo` |
| The Datini letters | [Relational network](patterns.md#relational-networks-connections-with-figures) | `LeadsTo` links between cities, with letter counts as attested figures |

An itinerary's overall span and a route's drawn line are **computed** from the members. They are
shown and exported marked `computed`, and never taken in as evidence.

**Read more.** [Routes, Itineraries, Networks, Groups and Periods](patterns.md);
[Routes, itineraries and networks](../guide/routes-and-networks.md), a step-by-step guide to
entering one in spreadsheets.

---

## Places in the histories of people, objects and events

**The problem.** A project records where people were born or lived, where objects were found, or
where events took place, and wants those places linked to WHG.

**How the model handles it.** Each such statement is an attestation about the place that
`relates_to` the person, object or event by its IRI, named with `relatedLabel`, using one of
PLATO's association types: `BirthplaceOf`, `DeathplaceOf`, `ResidenceOf`, `FindspotOf`, `SettingOf`
or `WorkplaceOf`. WHG shows these apart from a place's spatial relations and leaves them out of
containment, clustering and matching.

**Read more.** [Associations](patterns.md#associations-places-in-the-histories-of-people-objects-and-events).

---

## Contributing and curating

**The problem.** A researcher wants to publish a gazetteer, or to curate a selection of existing
places, and to have the work credited and cited.

**How the model handles it.** A contribution is a **Gazetteer**: a dataset that defines its own
places and holds attestations about them, with its creators, licence and version. It may also hold
attestations about places defined in other Gazetteers. A **place collection** is a Gazetteer of that
kind, a curatorial act: its selections and annotations are attestations by the curator about other
gazetteers' places, not a new place. A **gazetteer group** groups Gazetteers.

**Read more.** [Contributions](contributions.md); [Gazetteer groups](patterns.md#gazetteer-groups).

---

## Citing a place in a gazetteer that changes

**The problem.** Gazetteers grow and are corrected, but a citation must still point to what the
author saw.

**How the model handles it.** Every place has a persistent identifier that resolves through
w3id.org. Once a Gazetteer is published, its attestations are append-only. A correction supersedes
or contradicts an earlier attestation, and a withdrawal retracts it; neither deletes it. Every
attestation carries its creation time. A place is cited by its identifier together with its
Gazetteer's version, and the state at any date can be reconstructed from the data.

**Read more.** [Identifiers and citation](../guide/identifiers.md);
[Changing a contribution](contributions.md#changing-a-contribution).

---

## How this differs from other resources

| Compared with | WHG |
|---|---|
| Modern web maps | Keeps historical names, locations and boundaries with their dates and sources, not only the present |
| Encyclopedias | Structured, machine-readable claims, each dated and cited |
| Single-source gazetteers (Pleiades, CHGIS and others) | Reads many gazetteers together and links them by attributed identity claims, not by merging |
| Search engines and language models | Every statement traceable to its source; disagreements kept visible rather than synthesised into one answer |
