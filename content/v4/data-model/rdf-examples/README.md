# RDF Examples

WHG's RDF is PLATO RDF, so its worked examples are PLATO's own, in the
[`examples/`](https://github.com/pelagios/place-attestation-ontology/tree/main/examples) folder of
the PLATO repository:

| File | What it shows |
|---|---|
| `constantinople.ttl` | one place with three attestations, each bundling a name, a timespan and a type from one source (and, where the source gives one, a geometry), with a contributor and an identity relation |
| `identity-judgements.ttl` | identity as attributed judgement: suggested matches (candidates), an accepted cluster bundled in one attestation, its retraction, the corrected matches, and a denial that two places are the same |
| `antonine-routes.ttl` | a route (Antonine Itinerary, Iters III and IV): stations, segments, sequence and distances |
| `king-john-itinerary.ttl` | an itinerary (King John, June–July 1215): stops dated one by one, and a denial |
| `river-idle-network.ttl` | a physical network (the lower River Idle): reaches as segments, with direction |
| `datini-network.ttl` | a relational network (the Datini letters): connections with figures |

The earlier `baghdad.ttl` in this folder used a private vocabulary and illustrative claims; it has
been withdrawn and now only points here.

To check a file, parse it with any Turtle parser, and check its terms against the ontology with
the [PLATO tools](https://pelagios.org/plato-tools/):

```bash
npx github:pelagios/plato-tools check constantinople.ttl
```

See [RDF Representation](../rdf-representation.md) for how WHG's data looks in RDF, with SPARQL
queries tested against these files.
