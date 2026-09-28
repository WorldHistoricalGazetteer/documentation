# Data Formats In and Out

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): confirm which PLATO import and export paths have shipped, and the LPF version
% supported at launch (see LPF discussion #53).

WHG accepts and provides data in several formats. Which one to use depends on how rich your data is.

## Spreadsheets and lists

**Map your Data** reads CSV and TSV, Excel, JSON, GeoJSON, and Google Sheets. It can also pick
place names out of free text. It is the easiest way to start: bring a table, match it to WHG,
enrich it, and export it again. See [Map your Data](../../v3-3/map-your-data.md).

## Linked Places Format (LPF)

The **Linked Places Format** is the established GeoJSON-LD interchange format for historical place
data. It was developed with the Pelagios community and is used by many gazetteer projects.

- WHG accepts LPF contributions, and exports place data as LPF.
- LPF remains fully supported in v4. Work towards the next version of LPF is coordinated by the
  Institute for Spatial History Innovation (ISHI) at the University of Pittsburgh and the Pelagios
  Place Working Group, and is recorded in the
  [LPF repository](https://github.com/LinkedPasts/linked-places-format/discussions/53).

LPF describes each place as a single object. That suits most gazetteers well.

## PLATO

**PLATO**, the [Place Attestation Ontology](https://github.com/pelagios/place-attestation-ontology),
is the formal expression of WHG's data model. It suits richer data: where several sources make
different claims about one place, each with its own dates, certainty and citation, and where you
want to keep them apart rather than flatten them into one record.

- PLATO has a JSON form and an RDF form, and converts between them without loss.
- LPF is PLATO's single-object profile, so LPF data is valid PLATO. The two are designed to
  coexist, and neither replaces the other.
- The [PLATO tools](https://pelagios.org/plato-tools/) check and convert PLATO data in your browser.

## Linked Data

Because PLATO is defined in RDF, WHG's data can be published as Linked Data and queried with
standard tools. Individual records are already available as JSON-LD through their identifiers
(see [Identifiers and citation](./identifiers.md)).

% TODO(release): add the SPARQL endpoint here if it has shipped; otherwise keep it out of the text.

## Which should I use?

| Your data | Suggested format |
|---|---|
| A list or table of place names | Map your Data (CSV, Excel, Google Sheet) |
| A gazetteer with one description per place | LPF |
| Several sources' claims per place, kept apart with their own dates and citations | PLATO |
