# Explaining the WHG Indexes

WHG maintains three high-speed indexes for use in the platform, "**Wikidata+GeoNames**", the "**WHG Union Index**", and
the "**Pub**" index.

### Wikidata+GeoNames

This index of over 13 million place records from Wikidata (3.6m) and GeoNames (10m) is used for initial intitial
reconciliation of uploaded datasets, enabling their augmentation with

* Coordinate geometry their records may be missing (a "geocoding" function")
* Additional name variants
* Identifiers from additional gazetteer resources, including several national libraries, VIAF, and Getty's Thesaurus of
  Geographic Names (TGN). This has the benefit of making user records significantly more linkable —within in WHG's union
  index, and in other linked data contexts.

### WHG Union Index

The WHG Union Index is where individual records for the same or "closely matched" places coming from different datasets
are linked. Search results privilege these linked sets or "clusters" of records, and present them in Place Portal pages
like [this one](https://whgazetteer.org/places/12346428/portal/) for Glasgow.

Records from published datasets make their way into the union index by means of a second reconciliation step, following
that for the Wikidata+Geonames index. This step is initiated by WHG editorial staff, and when complete the dataset is
considered fully accessioned. See "Accessioning to the WHG Index"
in [Individual datasets](reconciliation.md#reconciliation--accessioning) for details.

### WHG "Pub" index

When a dataset has been reconciled to the Wikidata+Geonames index and published, it is automatically added to the "Pub"
index so that its records can be discovered not only via browsing its publication page, but in search and via our
Application Programming Interface (API). If and when the dataset is reconciled to the union index, its records are
removed from "Pub," as they are now linked where possible and will appear in Place Portal pages.
