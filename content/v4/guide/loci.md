# Loci: Citing a Group of Records

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): confirm the name and place of the minting control, and that minting requires sign-in.
% TODO(release): re-verify the example identifier format against a minted locus.
% TODO(release): confirm how legacy whg_id addresses (/places/<whg_id>/portal/) resolve at launch.

In [Atlas](../../atlas.md) you can group records that seem to describe the same place, and tune how
strict the grouping is. A **locus** gives such a group a name you can cite, link to and come back
to.

## What a locus is

A locus is **not** a list of records. It is the **recipe** that produced the group:

- the search that fetched the candidate records (what was searched for, where, with which filters,
  and how many results);
- the grouping settings you chose: how much each kind of evidence counts, and how strict the
  grouping is;
- the records that were in the group when it was named, which say *which* group of the results
  was meant.

Each time a locus is opened, WHG **runs the recipe again**, against the data as it stands that day,
and shows what it finds now. The records it shows can change: new records can join, and records
that have been corrected, withdrawn or relicensed can drop out. That is the design. A locus always
means the same recipe; it does not promise the same records next year.

A locus makes no claim that its records are one place. It says only that these settings, today,
group these records. To say that two records *are* the same place, make that statement as a link,
attributed to you (see [Record Pages and the Concordance](./record-pages.md)).

Records that WHG may not show (for example, because their dataset is private or under embargo) are
counted and explained on the locus page, but not listed.

## Shareable, then citable

- **Before it is named**, a group has a long, shareable address that carries the whole recipe.
  Anyone can open it, and it shows the same recipe's current results. It is not a permanent
  identifier.
- **Naming it** (minting) gives it a short, permanent identifier, such as
  `https://whgazetteer.org/entity/locus:3KM9-XP2T-VR7C`. You need to be signed in to mint, and WHG
  records who minted it and when. The identifier is computed from the recipe, so the same recipe
  always gets the same identifier. The last character is a check character, so a mistyped
  identifier is reported as invalid rather than silently opening a different locus.

A locus is never edited or corrected. If a recipe is not quite what you meant, mint a better one.

## Each member links to its record

Every record listed on a locus page links to its own [record page](./record-pages.md), where you
can see that source's full account and its Concordance.

## Old WHG place addresses

Addresses of the form `/places/<number>/portal/` were handed out by earlier versions of WHG. They
will keep working. Each is treated as a **legacy locus**: unlike other loci it has no recipe, and
it shows the group of records it named when it was created, marked as such. No new legacy loci are
created.

## Environmental context

% TODO(release): EDOP placeholder, as on the record page.

The locus page will show environmental signatures from **EDOP**
([Computing Place](https://computingplace.org/), Karl Grossner), credited on the page. Because the
records in a locus can be far apart, it shows a signature per record, or one for the whole group
only when the records lie close together.
