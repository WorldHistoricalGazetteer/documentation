# Loci: Citing a Group of Records

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): confirm the name and place of the minting control, and that minting requires sign-in.
% TODO(release): re-verify the example identifier format against a minted locus.
% Ruled 2026-10-21 (place#325): at release /places/<whg_id>/portal/ redirects to /entity/locus:<whg_id>/
% (legacy loci public); recipe loci stay beta-gated until reviewed. Re-check the wording at launch.
% Updated 2026-10-22 (place#325 Stage 5): two-column layout shared with the record page, recipe in a
% dialog, "About this cluster" cards, Wikipedia links where the index returns them, environment on demand.

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

## The locus page

The locus page has the same two-column layout as a [record page](./record-pages.md).

The **left column** starts with the locus's status and what it promises. A badge says
**unminted** or **minted**. Once minting is available, an unminted page whose recipe has already
been given an identifier says **minted as** that identifier instead, as a link to it. Under it are
the buttons: **Mint a citable locus** (or **Copy identifier** once minted), **Copy link** and
**Recipe**.

Then comes the group as it stands now, in a card: each current record, with its dates and source,
marked **in recipe** if it was in the group when the recipe was made or **new** if it has joined
since. The card says how the group was picked out of the search results and how many of the recipe's
records are still among them. **About this cluster** follows (see
[About this cluster, Wikipedia and environment](#about-this-cluster-wikipedia-and-environment)).

The **right column** holds a map of the records the search returned, zoomed to the group, with the
group's records highlighted; then an **Elsewhere** card with Wikipedia links where
they are known, and an **Environment** card.

On a narrow screen the columns are stacked, with the map straight after the heading.

### The recipe

The recipe is not shown on the page itself. The **Recipe** button opens it in a dialog: the search,
the grouping settings, and the records that were in the group when the recipe was made. Every value
there is literal: these values, not whatever WHG's defaults are today, decide the answer. The
dialog also shows the list of very common names that count for less in the grouping. That list is
not part of the recipe: it is the search index's current list, taken each time the recipe is run.

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

During beta, locus pages are available to beta testers. The minting control is shown, but cannot
be used until the v4 release: until then a locus page can be shared, but not cited.

## Each member links to its record

Every record listed on a locus page links to its record. A record from a contributed dataset links
to its own [record page](./record-pages.md), where you can see that source's full account and its
Concordance. A record found only in WHG's search index (from GeoNames or Wikidata, for example) has
no record page; its link is its identifier, `/entity/place:<namespace>:<id>/`.

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

## About this cluster, Wikipedia and environment

**About this cluster** describes the group's current records using only what they say, as the same
small cards a record page uses (Sources, Names, Type, Countries, Dates, and *Not known from these
records*). Nothing is inferred. A very large group is described from the first 200 of its records,
and the page says so.

Where the group includes Wikidata records, the **Elsewhere** card lists the Wikipedia articles
that WHG's copies of those records hold, when the search index returns them. They show what Wikidata
links to; they are not a claim that WHG makes about the place.

Environmental signatures come from **EDOPS** ([Computing Place](https://computingplace.org/), Karl
Grossner), credited on the page. Nothing is sent to EDOPS when the page opens. Click **Show
environment** on the Environment card, or the small **Environment** link in the group's card, and
WHG asks EDOPS then, and shows the answer in a dialog.

Because the records in a locus can be far apart, it gives one signature for the whole group only
when the records lie within 50 km of each other (over the area they cover, BasinATLAS **level 6**),
and otherwise a signature for each record's own river basin (BasinATLAS **level 8**), for up to
eight records. Only records anyone may see are sent to EDOPS.

These sections are shown to beta testers.
