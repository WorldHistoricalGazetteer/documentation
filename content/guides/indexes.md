# Explaining the WHG Indexes

WHG maintains three high-speed indexes for use in the platform: the **"Wikidata+GeoNames"** index, the **"WHG Publication Index"**, and the **"WHG Union Index"**. These indexes reflect the three key stages of data enrichment and integration.

---

## Wikidata+GeoNames Index (Augmentation)

This index contains over **13 million place records** from Wikidata (3.6m) and GeoNames (10m).

It is used for the **initial reconciliation** of uploaded user datasets, enabling augmentation with valuable data that
the user's records may be missing:

* Coordinate geometry (a "geocoding" function)
* Additional name variants
* Identifiers from external gazetteer resources, including national libraries, VIAF, and Getty's Thesaurus of Geographic
  Names (TGN).

This process makes user records significantly more linkable—both within WHG's union index and in other linked data
contexts.

---

## WHG Publication Index (Searchable Publication)

When a dataset has successfully completed initial reconciliation to the Wikidata+GeoNames index and is **published**,
its records are automatically added to the **Publication Index**.

* The Publication Index ensures that the records are immediately discoverable via search and through the WHG Application
  Programming Interface (API), even before they are fully integrated.
* The Publication Index serves as the staging ground for published datasets awaiting or bypassing the final accessioning step.
* _Once a dataset is reconciled and clustered into the WHG Union Index (see below), its individual records are **removed** from the Publication Index._

---

## WHG Union Index (Final Integration & Clustering)

The **WHG Union Index** is the platform's central integration index where records for the same or "closely matched"
places, coming from different published datasets, are linked and formed into **clusters**.

* This index is populated by means of a **second reconciliation step** initiated by WHG editorial staff, following the
  initial Wikidata+GeoNames match.
* This final step is called **accessioning**, and once complete, the dataset is considered fully accessioned.
* Search results privilege these linked sets or **"clusters"** of records and present them in unified Place Portal
  pages, such as the one for [Glasgow](https://whgazetteer.org/places/12346428/portal/). Records that have been accessioned permanently reside here, not in the Publication index.