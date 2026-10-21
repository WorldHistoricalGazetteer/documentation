# Loci: Citing a Group of Records

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): confirm the name and place of the minting control, and that minting requires sign-in.
% TODO(release): re-verify the example identifier format against a minted locus.
% Ruled 2026-10-21 (place#325): at release /places/<whg_id>/portal/ redirects to /entity/locus:<whg_id>/
% (legacy loci public); recipe loci stay beta-gated until reviewed. Re-check the wording at launch.

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
  `https://whgazetteer.org/entity/locus:3KM9-XP2T-VR7C`. You need to be signed in to mint. WHG
  records who minted it and when, but the locus page names you **only if you choose** (a checkbox
  in the minting dialog, off by default); otherwise it says *a WHG contributor*. If you chose to be
  named you can later hide your name; a hidden name stays hidden. The identifier is computed from
  the recipe, so the same recipe always gets the same identifier. The last character is a check
  character, so a mistyped identifier is reported as invalid rather than silently opening a
  different locus.

A locus is never edited or corrected. If a recipe is not quite what you meant, mint a better one.

## Withdrawn loci

A locus can be **withdrawn** by WHG staff (for example at its minter's request), with a reason.
Withdrawal is permanent and cannot be undone. The identifier keeps working and is never reused, but
its page then shows only the identifier, that it was withdrawn, why, and when: the recipe is no
longer shown or re-run, and no records or minter are shown. Staff can also **redact** a locus,
which hides its recipe and minter in the same way; the reason for a redaction is not published.

During beta, loci and the minting control are available to beta testers.

## Each member links to its record

Every record listed on a locus page links to its own [record page](./record-pages.md), where you
can see that source's full account and its Concordance.

## Old WHG place addresses

Addresses of the form `/places/<number>/portal/` were handed out by earlier versions of WHG. They
will keep working: at release each leads to `/entity/locus:<number>/`, a **legacy locus**. Unlike
other loci it has no recipe: it shows the group of records it named when it was created, marked as
such, listing only the records you may see now and counting the rest. Legacy loci are public at
release; loci minted from a recipe stay with beta testers until they have been reviewed. No new
legacy numbers are created. (Each legacy locus is recorded the first time anyone opens it; opening
a very large number of different ones in an hour from one address is refused for a while.)

## Machine-readable locus

Asked for JSON-LD (`Accept: application/ld+json`) or JSON, or at `/entity/locus:<id>/api`, a locus
returns its recipe and what it resolves to now. Its `@context` is WHG's minimal JSON-LD context,
`https://whgazetteer.org/ns/whg-context.jsonld`, which reuses Dublin Core, schema.org, PROV and
Linked Places terms where they exist. It is **provisional**: its terms may change until PLATO
publishes them.

## Environmental context

The locus page shows an **About this cluster** description and environmental signatures from
**EDOPS** ([Computing Place](https://computingplace.org/), Karl Grossner), credited on the page.
Because the records in a locus can be far apart, it shows one signature for the whole group only
when the records lie within 50 km of each other (over the area they cover, BasinATLAS **level 6**),
and otherwise a signature for each record's own river basin (BasinATLAS **level 8**), for up to
eight records. Only records anyone may see are sent to EDOPS. These sections are shown to beta
testers.
