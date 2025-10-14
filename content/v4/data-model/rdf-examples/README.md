# RDF Examples

This directory contains example RDF/Turtle files demonstrating the WHG data model.

## Examples

- [`baghdad.ttl`](baghdad.ttl) - Medieval Baghdad with multiple names, geometries, and relationships

## Using These Examples

To validate:
```bash
rapper -i turtle -o ntriples baghdad.ttl > /dev/null
```

To convert to JSON-LD:
```bash
riot --output=jsonld baghdad.ttl > baghdad.jsonld
```

## Contributing Your Own

See the [RDF Representation guide](../rdf-representation.md) for submission guidelines.