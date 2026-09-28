# Identifiers and Citation

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): re-verify every example URL on this page, and whether contributed-record
% identifiers resolve for anonymous users at launch (in 2026 only source-gazetteer records did).

## Every place record has a persistent identifier

In WHG's data model a place, or any entity whose identity is bound up with space, is a
**SpatialEntity** (see the [Data Model](../data-model.md)). Each place record in WHG has an
identifier you can cite and link to. The identifier resolves through **w3id.org**, a
community-run permanent-identifier service, so it does not depend on WHG's own web address staying
the same.

Identifiers take the form

```text
https://w3id.org/whg/id/place:<source>:<id>
```

where `<source>` is the short name of the gazetteer the record comes from. For example, a GeoNames
record:

```text
https://w3id.org/whg/id/place:gn:2988507
```

## One address, two answers

The same identifier gives people and software what each needs:

- **In a web browser**, it takes you to the record's page on WHG.
- **For software** asking for JSON or JSON-LD, it returns the record as data.

A small number of source gazetteers are held under terms that do not allow WHG to redistribute
their records. For those, the identifier still resolves, but the data request is refused with an
explanation of the terms, rather than a misleading "not found".

## Citing WHG

- **Cite a place** by its identifier, together with the source gazetteer it came from. Each
  gazetteer's page in Atlas says how its creators ask to be cited.
- **Cite a dataset or collection** by the citation on its page.
- **Cite the WHG platform itself** by its software DOI (see the site footer).
