# Linking Your Records

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% Rewritten 2026-10-30 against whg3 staging 3380f08f5 (place#334, #337, #338, #340, #341, #342, #343).
% On-screen labels quoted here were checked against the templates and scripts of that commit.
% Items marked TODO(SG) are relayed or inferred, not read in the whg3 code: check before release.
% TODO(SG): submit / publish / withdraw have no buttons yet (JSON endpoints under /datasets/<id>/lifecycle/
%   only), so "ask the WHG team" below is a placeholder until the dataset page has them.
% TODO(SG): "datasets with polygons are added too" and "fuzzy search may not find new places yet" are
%   relayed from the indexing work, not read in whg3 code.
% TODO(SG): "228 carried over" is the 2026-10-30 prod run of migrate_reviewed_links (170 public, 58 pending).
% TODO(SG): the failure line says "The WHG team has been told"; no notification was found in whg3 code.

```{important}
Linking is in **beta**. It is open to signed-in beta testers, and screens and wording may change. Words
used here are defined in the [Glossary](./glossary.md). Please report anything that does not behave as
described through the beta snag list (see the [Beta Testing Plan](../../v3-3/beta-testing.md)).
```

This guide is for beta testers who own a dataset in WHG. It explains what a **Link** is, how WHG
suggests possible Links for your records, how to work through those suggestions, and what happens to
your Links when your dataset is reviewed, published or withdrawn.

Linking is optional. Your dataset can be published and found whether or not you link anything. Links
are an enrichment: they help other people find your records beside related ones.

## What a Link is

A **Link** is a statement, made by one person, about two records:

- **Same place**: the two records describe the same place. This is the usual answer, and the default.
  Use it when the descriptions plausibly agree, even if details differ (a spelling, a position a few
  kilometres off, a different date range).
- **Not the same place**: the two records describe different places, however alike they look.
- **Same place, exactly**, offered under **Advanced**: the two records are interchangeable in every
  respect (the same place, the same extent, the same period). Use it only when you are sure.

A Link has these properties:

- **It is one step.** A Link joins exactly two records. WHG does not chain Links together: if one
  person links A with B and someone else links B with C, WHG does not conclude that A is the same place
  as C. A Record page's Concordance lists *"the records linked as the same place as this one, one step
  from it"*.
- **It is a statement by a person, not a decision by WHG.** It does not merge records and does not
  change anyone's data, yours included.
- **It is attributed and dated.** Each Link shows who made it and when (see
  [Your name on your Links](#your-name-on-your-links)), with your reason if you gave one.
- **It is published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)** once both
  records are public.
- **It is shown on the Record pages** of both records: in the **Concordance**, and in the section
  **Links made by people** (see [Record Pages and the Concordance](./record-pages.md)).
- **It can be disputed.** Anyone who can make Links (during beta, any beta tester) can choose **Dispute
  this Link** beside someone else's Link and answer the opposite way. A dispute does not delete the
  original: both statements stay visible, each with its maker.
- **It can be changed or withdrawn** by the person who made it (**Change or withdraw** beside your own
  Link, or **Withdraw** in the Link sheet). A withdrawn Link stops counting and is no longer shown, but
  WHG keeps a record of it.

Each person can make up to 200 new Links in any 24 hours. Beyond that WHG answers *"daily limit of 200
links reached"*, and you can continue the next day.

## Suggestions are not Links

WHG can look for records that may be the same places as yours. What it finds are **suggestions**. A
suggestion records nothing and is not shown to anyone outside your dataset's team; it becomes a Link
only when you choose it. WHG never makes a Link on your behalf, and there is no way to confirm many
suggestions at once (see [What is not built yet](#what-is-not-built-yet)).

### How suggestions are found

When you ask for suggestions (see [Getting started](#getting-started)), WHG works through your dataset
one record at a time, in the background:

1. It searches WHG's index for the record's name, allowing for spelling variation, and keeps up to 20
   results. If your record has dates, places whose dates may overlap them are kept, and so are places
   with no dates at all.
2. It drops results from your own dataset, and records in other datasets you are not allowed to see.
3. It compares each result with your record on name, distance, dates and type.
4. A result that looks like a feature *named after* a place, rather than the place itself (a building, a
   lake, a station), is moved down the list and carries a warning.
5. It puts the record in a tab according to how clear the best suggestion is (below).

This takes a while for a large dataset. You can start as soon as some records are ready; more appear as
the work continues. If the search service does not answer for a record, the record goes into **Not yet
checked** and is tried again later. That is not the same as nothing found.

### The tabs, and what they mean

The tabs are in this order, and the page opens on the first one that has records in it. The second
column is what the page itself says about each tab.

| Tab | What the page says |
|---|---|
| **Likely the same place** | *The suggestion and your record agree on the name and at least one other thing. Check before you confirm: a perfect name can still be a lake or a station named after the place.* |
| **Which one, if any?** | *More than one place fits, or only the name agrees. Choose one, or say none fits.* |
| **Weak suggestions** | *Optional. Looking is up to you.* |
| **Nothing found** | *Nothing usable was found. That is normal; search by hand if you know a spelling, or leave it.* |
| **Later** | *Records you set aside. They stay here until you decide.* |
| **Not yet checked** | *The search service did not answer for these records yet. They will be tried again.* |

In plain words:

- **Likely the same place**: the name matches closely, something else (location, dates or type) agrees
  as well, and no other, different place matches nearly as well. It is still only a suggestion: check
  it.
- **Which one, if any?**: the name matches closely, but either several different places match, or
  nothing besides the name agrees.
- **Weak suggestions**: no result matches the name closely.

The tabs are not probabilities, and the page shows no percentage or score.

Within **Likely the same place**, records with no location come first (a Link can give them one), then
records whose suggestion is shared by several of your records. Within **Which one, if any?**, records
whose name occurs several times in your dataset come first.

## Getting started

Open your dataset's page. If linking is open to you, it has a **Links** card marked *beta*:

- before any suggestions exist it says *"No suggestions have been prepared for this dataset yet."* and
  offers **Link your records**;
- afterwards it shows how much of the dataset you have reviewed, how many Links you have made, how many
  records had nothing found (*"normal"*) and any not yet checked, with **Continue linking**.

These counts are shown only to you and your dataset's team. The WHG editors who review your dataset do
not see them, and they play no part in that review.

On the **Link your records** page, if no suggestions have been prepared yet, choose **Prepare
suggestions**. You can do this while your dataset is still private: nothing of yours becomes visible by
doing so.

## Working through the suggestions

The left of the page lists the records in the current tab; the right shows one record at a time with its
suggestions, best first. The heading line shows how many records you have reviewed out of the total, and
how many Links you have made.

Each suggestion shows its title and identifier, its source (for example GeoNames, Wikidata, Getty TGN,
OpenStreetMap, OpenHistoricalMap, Pleiades or *WHG contribution*), its type, its distance from your
record, its dates and countries, up to three other names, and a sentence saying why it was suggested and
what disagrees, such as *"Suggested because: exact name; under 1 km away."* followed, where something
disagrees, by *"But: …"*.

### Your choices for each record

- **Same place** beside a suggestion links your record to that suggestion.
- **Same place** below the list (or **Enter**) links your record to the suggestions you have selected.
  Click a suggestion, or press its number key (**1** to **9**), to select or deselect it; you can select
  more than one. **If none is selected, the first suggestion is linked**, so look at it first.
- **Not the same place** beside a suggestion (or **x** when exactly one is selected) passes that
  suggestion over. This records nothing about the world, and the record stays in its tab. For a record in
  **Which one, if any?**, **Advanced** also has a box, *When I say "Not the same place", also record it as
  a Link others can see*: tick it to make your answer a **Not the same place** Link.
- **None of these fits** (or **n**): none of the suggestions is right. This is a note about your review,
  not a statement about the world, and only you and your dataset's team see it.
- **Not sure yet** (or **l**) moves the record to **Later**.
- **Undo** (or **u**) takes back your last decision on this page: it withdraws the Links that decision
  made from the suggestions and returns the record to its tab. A Link you made from a hand search is not
  taken back by Undo; withdraw it in the Link sheet instead.

Use **←** and **→** to move between records without deciding. Under **Advanced** you can choose **Same
place, exactly** instead of **Same place** for the Links you make from the record on screen.

You may type a note (up to 2000 characters) saying why you decided. It is kept with your decision, and
with any Link the decision makes, where it is shown.

### Searching by hand

If the suggestions miss a place you know, use the search box under the record (**s** puts the cursor
there). It searches within the same limits as the suggestions; each limit, such as the record's dates,
is shown as a chip you can switch off. Results show the same facts as suggestions and offer **Same
place**. If the search service does not answer, the page says so (*"this does not mean nothing
exists"*) rather than showing an empty list.

### The Link sheet, elsewhere in WHG

Away from this page, the same choices appear in the **Link sheet**, titled **Link two places**. It opens
from the **Link** button in an [Atlas](../../atlas.md) popup and in the Place List, from **Same place**
and **Not the same** in a Record page's Concordance, and from the member rows of a [Locus](./loci.md)
page. On the Atlas, Place List and Locus pages, choose **Link** on one place, then **Link** on the other.
The sheet asks whether the two are the same place and offers **Same place**, **Not the same place** and,
under **Advanced**, **Same place, exactly**, with an optional **Why?** box (shown with the Link). Choose
**Link** to save. If you have already linked the two places, the sheet lists your Link with
**Withdraw**.

## Private until your dataset is published

A Link that involves a record in a dataset that is **private or embargoed** is saved as **pending**. A
pending Link is shown only to you and that dataset's team (and WHG staff), marked *"Visible to you and the
dataset owners until it is published"*. It never appears in **Links made by people**, is never shown to
the public and is never sent outside WHG.

When the dataset is published, its pending Links become public, provided the record at the other end is
public too. A Link to a record in another private dataset stays pending until that dataset is published
as well.

## Review before publication

During beta, **every dataset is reviewed by the WHG team before it is published**. Review is separate from
linking: you need not start, or finish, linking for your dataset to be reviewed, and you can go on
linking while it is under review.

When you submit a dataset for review you receive an email saying when to expect an answer; reviews
usually take up to 10 working days. An editor reads WHG's automatic checks, looks at a sample of your
records on the map, and checks the licence and any sensitivity you declared. The automatic checks cover:

- records loaded, and the licence: a dataset with no records, or no licence, cannot be published;
- placeholder identifiers, possible duplicates, coordinates and dates;
- description and attribution;
- the sensitivity declaration, two questions you answer: whether the dataset includes information about
  Indigenous peoples, lands or places that their communities may wish to control, and whether it
  includes locations that could cause harm if widely known (sacred or burial sites, vulnerable
  heritage, private homes). A "yes" asks you to say briefly what is sensitive, so the editor can decide
  whether to hold it back.

The editor does not see how many of your records you have linked.

The review ends in one of three ways, each sent to you by email:

- **Accepted**: you can publish the dataset whenever you are ready.
- **Changes requested**: the email gives the editor's reasons. Make the changes, then submit the dataset
  again.
- **Declined**: the email gives the reason. The dataset stays yours, and private; you can upload a
  revised version and submit it again.

```{note}
The buttons for submitting, publishing and withdrawing a dataset, and the screen for answering the
sensitivity questions, are **not yet built** on the dataset page. During beta, ask the WHG team to take
your dataset through these steps.
```

## Publishing and withdrawing

**Publishing** an accepted dataset makes it public. Then:

- its pending Links become public, as described above;
- it is added to WHG's search index, usually within minutes. Until that is done the dataset page says
  *"Waiting to be added to the search index"*. Datasets with polygons are added too;
- if it cannot be added automatically, the dataset page says *"This dataset could not be added to the
  search index automatically."*

**Withdrawing** a published dataset makes it private again:

- its Links go back to **pending** and disappear from public Record pages at once;
- it is removed from the search index;
- you can publish it again later without a new review.

A dataset with places in WHG's older shared v3 index cannot be withdrawn this way: WHG asks you to
contact the editorial team.

## Your name on your Links

Your Profile page has a checkbox, **Show my name on Links I make**. When it is ticked, anyone reading a
record sees your name (and ORCiD iD) beside the Links you have made. When it is not ticked, people
outside the beta see *"a WHG contributor"* instead.

During beta:

- other beta testers and WHG staff **always** see your name on your Links, whether or not you tick the
  box. The box decides what everyone else will see once linking opens to all;
- you see your own Links as *"Linked by you"*.

Whatever the setting, a Link that involves a private or embargoed record is never shown in public (see
[Private until your dataset is published](#private-until-your-dataset-is-published)), and **Links made by
people** lists only Links whose two records are both public.

## Links carried over from WHG v3

In WHG v3, people reviewed suggested matches between records. **228 of those reviewed matches have been
carried over as Links**, each credited to the person who reviewed it, dated when it was made, and
labelled *"Carried over from a reviewed WHG v3 match"* in **Links made by people**. Those that involve a
dataset that is not yet public are pending, like any other Link.

The other links WHG held from v3 were **not** turned into Links. They still appear in the Concordance,
labelled with where they came from (for example *"2024 migration; provenance unknown"*), and count for
less than a Link made by a person.

## Known limits in beta

- **Newly published places may not be found by fuzzy search yet.** A published dataset becomes
  searchable soon after publication, but some parts of search are rebuilt less often, so a new place may
  not turn up in every kind of search, or as a suggestion for someone else's records, straight away.
- **Some wording elsewhere is still WHG v3's.** The progress badges on the dataset page, for example,
  still show the v3 steps. The older v3 matching tools also still work during beta; see
  [Guides & Tutorials](../../guides.md).
- **Suggestions are prepared once.** After the first run there is no button to prepare them again.
- **Linking, the Concordance and Links made by people are open only to beta testers** until WHG v4 opens
  to everyone.

### What is not built yet

- a map on the suggestions page;
- an email when suggestions are ready;
- preparing suggestions automatically once your upload has been checked (for now you choose **Prepare
  suggestions** yourself);
- refreshing suggestions as new records are published;
- a background worker reserved for preparing suggestions;
- confirming many suggestions at once. This stays off until WHG has checked, against beta testers'
  decisions, how often **Likely the same place** is right;
- the editors' review page, and the dataset-page buttons for submitting, publishing and withdrawing.
