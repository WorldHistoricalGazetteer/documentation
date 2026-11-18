# Linking Your Records

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% Rewritten 2026-10-30 against whg3 staging 3380f08f5 (place#334, #337, #338, #340, #341, #342, #343);
% review and publication sections updated against whg3 staging 4b58d1b0c (lifecycle panel, review
% queue, sensitivity questions required, declined datasets resubmittable, index-failure wording).
% Confirmed by the lead session 2026-10-31: 228 carried-over Links (170 public, 58 pending, prod run);
% polygon datasets are indexed (live on 1360/979); fuzzy search misses new places until an embedding
% backfill (exact and prefix work); indexing timing (~30 s job, 60 s follow-up, 15-min sweep).
% Also confirmed 2026-10-31: "up to 10 working days" and "200 new Links in any 24 hours" are the code
%   defaults; prod overrides neither (env vars unset, no settings value).
% 2026-11-18: "Match your places" sections rewritten for the redesigned feed, and "Locations for
% records that have none" added (place#350), against whg3 main 693460ee2: datasets/views_feed.py,
% datasets/location_adoption.py, datasets/candidates.py, datasets/tasks_candidates.py,
% datasets/qc.py, datasets/templates/datasets/match_feed.html and _links_progress.html,
% whg/webpack/js/matchFeed.js, matchFeedMap.js, matchFeedTour.js, places/views_record.py,
% places/templates/places/atlas_record.html, api/download_file.py, api/attestations.py,
% licensing/templates/licensing/licenses.html. On-screen wording is quoted from those files.
% NOT verified, so not stated: which of wd/gn/tgn/pl currently pass the registry-terms gate on prod
% (the registry licence fields are not exposed by /api/sources/).

*Last verified 2026-11-18 against WHG 3.2 (main 0c3c4d4fa).*

```{important}
Linking is in **beta**. It is open to signed-in beta testers, and screens and wording may change. Words
used here are defined in the [Glossary](./glossary.md). Please report anything that does not behave as
described through the beta snag list (see the [Beta Testing Plan](../../v3-3/beta-testing.md)).
```

This guide is for beta testers who own, or work on, a dataset in WHG. It explains what a **Link** is,
how WHG suggests possible Links for your records on the page called **Match your places**, how to work
through those suggestions, how the dataset's owner can give a location to a record that has none, and
what happens to your Links when your dataset is reviewed, published or withdrawn.

Linking is optional. Your dataset can be published and found whether or not you link anything. Links
are an enrichment: they help other people find your records beside related ones.

## What a Link is

A **Link** is a statement, made by one person, about two records. The Match your places page calls the
Links you make there your *matches*.

- **Same place**: the two records describe the same place. This is the usual answer, and the default.
  Use it when the descriptions plausibly agree, even if details differ (a spelling, a position a few
  kilometres off, a different date range).
- **Not the same place**: the two records describe different places, however alike they look.
- **Same place, exactly**: the two records are interchangeable in every respect (the same place, the
  same extent, the same period). Use it only when you are sure. It is offered under **Advanced** in the
  Link sheet, and under **More options** (as *Exactly the same place*) on Match your places.

A Link has these properties:

- **It is one step.** A Link joins exactly two records. WHG does not chain Links together: if one
  person links A with B and someone else links B with C, WHG does not conclude that A is the same place
  as C. A Record page's Concordance lists *"the records linked as the same place as this one, one step
  from it"*.
- **It is a statement by a person, not a decision by WHG.** It does not merge records and does not
  change anyone's data, yours included. In particular, a Link never gives your record a location: that
  is a separate, optional act (see
  [Locations for records that have none](#locations-for-records-that-have-none)).
- **It is attributed and dated.** Each Link shows who made it and when (see
  [Your name on your Links](#your-name-on-your-links)), with your reason if you gave one.
- **It is published under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)** once both
  records are public.
- **It is shown on the Record pages** of both records: in the **Concordance**, and in the section
  **Links made by people** (see [Record Pages and the Concordance](./record-pages.md)).
- **It can be disputed.** Anyone who can make Links (during beta, any beta tester) can choose **Dispute
  this Link** beside someone else's Link and answer the opposite way. A dispute does not delete the
  original: both statements stay visible, each with its maker. (While a Record page is still loading,
  **Dispute this Link** and **Change or withdraw** are greyed out and show *Loading…*.)
- **It can be changed or withdrawn** by the person who made it (**Change or withdraw** beside your own
  Link, **Withdraw** in the Link sheet, or **Undo** on Match your places). A withdrawn Link stops
  counting and is no longer shown, but WHG keeps a record of it.

Each person can make up to 200 new Links in any 24 hours. Beyond that WHG answers *"daily limit of 200
links reached"*, and you can continue the next day.

## Suggestions are not Links

WHG looks for records, in source gazetteers such as GeoNames or Wikidata and in other published
datasets, that may be the same places as yours. What it finds are **suggestions**. A suggestion records
nothing and is not shown to anyone outside your dataset's team; it becomes a Link only when someone
marks it **Same place** and saves. WHG never makes a Link on your behalf, nothing on the page starts
marked for you, and there is no way to confirm many records at once (see
[What is not built yet](#what-is-not-built-yet)).

### How suggestions are found

WHG works through your dataset one record at a time, in the background:

1. It searches WHG's index for the record's name, allowing for spelling variation, and keeps up to 20
   results. If your record has dates, places whose dates may overlap them are kept, and so are places
   with no dates at all.
2. It drops results from your own dataset, and records in other datasets you are not allowed to see.
3. It compares each result with your record on name, distance, dates and type. A record with no
   location is still compared: name, dates and type decide.
4. A result that looks like a feature *named after* a place, rather than the place itself (a building, a
   lake, a station), is moved down the list and carries a warning.
5. It puts the record in a tab according to how clear the best suggestion is (below).

This takes a while for a large dataset. You can start as soon as some records are ready; more appear as
the work continues. If the search service does not answer for a record, the record goes into **Waiting
for search** and is tried again later. That is not the same as nothing found.

### The tabs, and what they mean

The tabs are in this order, and the page opens on the first one that has records in it. The second
column is what the page itself says about each tab.

| Tab | What the page says |
|---|---|
| **Likely the same place** | *The suggestion and your record agree on the name and at least one other thing. Check before you confirm: a perfect name can still be a lake or a station named after the place.* |
| **Which one, if any?** | *More than one place fits, or only the name agrees. Mark the one that is the same place, or say None of these fits.* |
| **Weak suggestions** | *Weak suggestions: optional. Looking is up to you.* |
| **Nothing found** | *Nothing usable was found. That is normal; search by hand if you know a spelling, or leave it.* |
| **Not sure yet** | *Records you marked "Not sure yet". They stay here until you decide; nothing here expires.* |
| **Waiting for search** | *The search service has not answered for these records yet. They will be tried again; this is not "nothing found".* |

In plain words:

- **Likely the same place**: the name matches closely, something else (location, dates or type) agrees
  as well, and no other, different place matches nearly as well. It is still only a suggestion: check
  it.
- **Which one, if any?**: the name matches closely, but either several different places match, or
  nothing besides the name agrees.
- **Weak suggestions**: no result matches the name closely.

The tabs are not probabilities, and the page shows no percentage or score.

Within **Likely the same place**, records with no location come first (they gain most from a match),
then records whose suggestion is shared by several of your records. Within **Which one, if any?**,
records whose name occurs several times in your dataset come first.

### What a suggestion shows

Each suggestion is one numbered row: its name, its source (for example GeoNames, Wikidata, Getty TGN,
OpenStreetMap, OpenHistoricalMap, Pleiades or *WHG contribution*), the kind of place in plain words
where WHG can put it in words (for example *seat of a second-order division*), its countries, its
distance from your record (*"under 1 km away"*, *"12 km away"*), its dates, and *no location* if it has
none. **Details** opens up to four other names, what agrees and what does not (*"Agrees: exact name,
…"*, *"Does not agree: …"*) and the place's identifier.

A row that looks like a feature named after the place carries a warning, such as *"Probably not the
place itself: this looks like a railway station named after it."*

**Private records are never shown.** A suggestion from another contributor's dataset that you are not
allowed to see now (private, under embargo, or deleted) is left out entirely: no name, identifier or
point, and no gap in the numbering.

### Places described by more than one source

The same town may be in GeoNames and in Wikidata. When suggestions from **different** sources share a
name and lie within 2 km of each other, the page shows them together under *"Probably one place,
described by N sources"*, with a button **All same place** that marks every member of the group. This
is only how they are shown: each member keeps its own answer and, if you say Same place, its own Link.
Two entries from the same source are never grouped, however close.

## Getting started

Match your places is open to beta testers who own a dataset or work on it with the owner. There are two
ways in:

- on your **dashboard**, the link icon beside a dataset (*"Match your places to source gazetteers
  (beta)"*);
- on your **dataset's page**, a card headed **Match your places**, marked *beta*. Before any suggestions
  exist it says *"Find out which of your places are already in WHG. You decide on each suggestion;
  nothing in your dataset is changed."* and offers **Find matches**. Afterwards it shows how much of the
  dataset has been reviewed, how many matches have been made, how many records had nothing found
  (*"normal"*) and any not yet checked, with **Continue matching**.

These counts are shown only to you and your dataset's team. The WHG editors who review your dataset do
not see them, and they play no part in that review.

**Suggestions are prepared for you** when a beta tester's newly uploaded dataset passes its checks
(validation), and the dataset's owner receives an email, *"Suggested matches for your WHG dataset are
ready"*, each time a run of suggestions finishes. For a dataset where that has not happened, the page
says *"No suggestions have been prepared for this dataset yet."*: choose **Prepare suggestions**. You can do this while your dataset is still
private: nothing of yours becomes visible by doing so. Suggestions are also prepared again, at most once
a day for a few datasets at a time, when another dataset has been published since they were last
prepared; for such a refresh the owner is emailed at most once a week.

On a first visit the page shows a short note and offers a **Tour** of the page; the **Tour** button at
the top repeats it. The tour only points at things: it never marks or saves anything.

## Working through the suggestions

The left of the page lists the records in the current tab; decided records move to the end. The right
shows one record at a time: your record (its names, types, countries, dates, and *no location* if it
has none), its suggestions, best first, and a map. The heading line shows how many records have been
reviewed out of the total, and how many matches have been made.

### Your answer for each suggestion

Each suggestion row has three buttons:

- **Same place**: this suggestion describes the same place as your record.
- **Not the same**: it does not.
- **Can't tell**: you cannot judge it. Nothing is recorded for that suggestion.

**Nothing starts marked**, in any tab. Pressing the same button again takes the mark back. You may mark
as many rows as you like: marking one row **Same place** decides nothing about the others. A line above
the buttons says exactly what will be saved, listing the suggestion numbers under **Same place**, **Not
the same**, **Can't tell** and **Not marked**, and adds *"Suggestions you did not mark are left as they
are."* when some are unmarked.

Then choose **Save decision**. It is available once at least one row is marked **Same place** or **Not
the same**. When you save:

- each **Same place** becomes a Link between your record and that suggestion, attributed to you;
- each **Not the same** sets that suggestion aside. This is a note about your review, seen only by you
  and your dataset's team, not a statement about the world. To make it a **Not the same place** Link
  that others can see, tick, under **More options**, *"Also share the "Not the same" decisions I marked
  myself as statements others can see (never the ones the page filled in)"*;
- rows you did not mark, and rows marked **Can't tell**, are left as they were.

A suggestion you have set aside cannot then be marked **Same place**, nor the reverse, until you undo
the earlier answer.

**More options** also asks *"How closely do the record and the place match?"*: **Same place** (*"the
usual choice"*) or **Exactly the same place** (*"same place, same extent: use sparingly"*).

You may type a note (up to 2000 characters) saying why you decided. It is kept with your decision, and
with any Link the decision makes, where it is shown.

### Answers for the whole record

- **None of these fits**: none of the suggestions is right. Every suggestion not yet answered is set
  aside. Like **Not the same**, this is a note about your review, not a statement about the world.
- **Not sure yet**: set the whole record aside for later. It moves to the **Not sure yet** tab, which
  shows when you marked it and your note; nothing there expires.

### The map

The map shows your record (★) and every suggestion that has a location, numbered as in the list. A row
you point at, or move to, is lit on the map. **Clicking a marker only takes you to its row: it decides
nothing.** **Fit nearby** and **Fit all** zoom to the nearby suggestions or to all of them. The caption
names any suggestion that is not on the map, and why (*no location*, or *location not available to
you*). If your record has no location, the caption says so and only the suggestions are shown. If the
map cannot be shown, the rest of the page still works.

### Undo

**Undo** takes back your last decision on this page, record by record. For that record it:

- withdraws every Link you made from its suggestions, and any you made for it from a hand search on
  this page. Withdrawn Links are kept as a record, not deleted;
- returns all its suggestions to unanswered, and the record to its tab.

It also undoes **None of these fits** and **Not sure yet**. Undo covers only decisions made since you
opened the page; for older Links, use **Change or withdraw** on the Record page.

If the dataset's owner has adopted a location from one of the record's matches, Undo first asks what
to do with it (see
[Removing a location, and undoing a match](#removing-a-location-and-undoing-a-match)).

### Keyboard shortcuts

Shortcuts are **off** until you switch on **Keyboard shortcuts** under the page; the setting is
remembered on that device. Then: **1** to **9** go to a suggestion, **↑**/**↓** move between
suggestions; on a suggestion **s** Same place, **x** Not the same, **c** or **?** Can't tell;
**Enter** saves; **n** None of these fits; **l** Not sure yet; **u** Undo; **/** search; **←**/**→**
another record.

### Searching by hand

If the suggestions miss a place you know, use **Search for another name** under the record. It searches
within the same limits as the suggestions; each limit, such as the record's dates, is shown as a chip
you can switch off. Results show the same facts as suggestions, are drawn on the map as **s1**, **s2**,
…, and offer **Same place**, which makes the Link at once. If the search service does not answer, the
page says so (*"this does not mean nothing exists"*) rather than showing an empty list.

### The Link sheet, elsewhere in WHG

Away from this page, the same choices appear in the **Link sheet**, titled **Link two places**. It opens
from the **Link** button in an [Atlas](../../atlas.md) popup and in the Place List, from **Same place**
and **Not the same** in a Record page's Concordance, and from the member rows of a [Locus](./loci.md)
page. On the Atlas, Place List and Locus pages, choose **Link** on one place, then **Link** on the other.
The sheet asks whether the two are the same place and offers **Same place**, **Not the same place** and,
under **Advanced**, **Same place, exactly**, with an optional **Why?** box (shown with the Link). Choose
**Link** to save. If you have already linked the two places, the sheet lists your Link with
**Withdraw**.

## Locations for records that have none

Many historical datasets have names but no coordinates. On Match your places, the **dataset's owner**
can give such a record a location, in one of two ways. **Both are optional**, both are separate from the
match, and neither is ever done automatically or in bulk: one record, one choice, by the owner.

- **Adopt the matched place's location**: after a suggestion has been saved as **Same place**.
- **Place a location on the map** yourself: whatever the suggestions, and with or without a match.

### Who can do this, and when

Both are offered only:

- to the **dataset's owner**. Co-owners and collaborators see the matched place's location as a
  reference only (below);
- for a record that has **no location of any kind** (one loaded with the dataset, adopted, or placed);
- when the dataset is **not declared sensitive**: if either sensitivity question (see
  [Submitting](#submitting)) was answered "yes" or "not sure", no location is offered at all.

Locations are **single points** for now: no boundaries or shapes.

### Adopting the matched place's location

Once you have saved **Same place** for a suggestion, and if its location may be adopted, a box appears
under the record. It says, for example:

> **Adopt this place's location?**
>
> *This location is adopted from GeoNames under CC-BY-4.0. It is labelled as coming from GeoNames, and
> downloads of the dataset say so. You can also keep it as a reference: nothing is copied.*

(The source and its terms are filled in for the place in question.) It offers two equal choices:
**Adopt this place's location** and **Keep it as a reference**. Keeping it as a reference copies
nothing.

The location is offered for adoption only when all of these hold:

- you are the owner, the record has no location, and the dataset is not declared sensitive (above);
- the suggestion has been saved as **Same place**. A Link made from a hand search does not offer one;
- the suggestion has a location, and that location is available to you;
- the suggestion's **source** allows it (next section);
- your dataset **has a licence**. If not, the page says *"Choose a licence for your dataset before
  adopting a location."*

Otherwise, for a record with no location in a dataset not declared sensitive, the matched place is
shown as a **reference**: *"Location:"*, the place's name and *"(reference)"*, with its
identifier as a link, its source, its terms and its citation, and, where it applies, the reason, such as
*"This source's terms do not allow its location to be adopted into your dataset; it is kept as a
reference."* Nothing is copied.

**What adopting writes.** One location for your record, stored **separately** from the data you loaded
and never merged into it. It is the point WHG already holds for the matched place (never a position
sent from your browser), and it records the source gazetteer, the matched place's identifier, the
source's terms, the date, and you as the person who adopted it. Adopting never changes your match: not
the Link, its certainty, or anything else about it.

### Which sources' locations can be adopted

A source's locations can be adopted only if **all** of these are true:

- it is in WHG's group of sources whose terms are public domain or attribution only;
- WHG's registry records its terms, and those terms are not share-alike, not non-commercial and not
  no-derivatives. Terms that are not recorded count as a restriction;
- it describes places as **points**.

As of 2026-11-18 the sources that can meet all three are **Wikidata**, **GeoNames**, **Getty TGN** and
**Pleiades**, and each only while the registry's record of its terms passes the second test. This list
is set in WHG's code and registry and may change. Other sources in the same group (OpenHistoricalMap,
PeriodO, Cliopatria, UN Countries, UK Historic Counties, the Ottoman NFS Gazetteer) describe places
mostly by boundaries, so their locations are not offered yet; on the map such a suggestion is labelled
*hint only: location not adoptable (boundary source)* (or *(terms)*, below, if its recorded terms do not
pass).

**Restricted sources are hints, not sources.** A suggestion from any other source (for example one under
share-alike or non-commercial terms, such as OpenStreetMap) is still shown, and still drawn on the map,
labelled *hint only: location not adoptable (terms)*; the map caption adds *"some suggestions are hints
only: their locations cannot be adopted"*. You may look at it to help you judge; you may not copy its
position.

### Placing a location on the map

For a record with no location, the owner sees **Place a location on the map**, with *"This record has
no location: you can say where it is, whatever the suggestions."* Choosing it shows:

> *You are placing this location yourself. Restricted suggestions are shown only to help you look; do
> not copy their positions.*

Click the map where the place is (*"Click the map where the place is."*). You can click again to move
it; the page then says *"Click again to move it, or save it. It is stored only as precisely as the map's
zoom allows, and marked approximate."* Choose **Save this location**, or **Cancel**.

- **Nothing snaps.** The point is stored where you clicked. Markers cannot be dragged, and there is no
  "place at this marker" button.
- **It is rounded to the zoom**: to about one screen pixel at the zoom you clicked at. For example, a
  click at zoom 6 is stored to 2 decimal places (about a kilometre), at zoom 12 to 3, and never finer
  than 5 (about a metre).
- **It is your own data**: no source gazetteer is recorded for it, and it is marked approximate
  (certainty *less-certain*, *"placed on the map"*), with the date and you as the person who placed it.
- It does not require, change or imply a match.

### What each act writes

| | Adopted | Placed on the map |
|---|---|---|
| Whose data | the source gazetteer's, under its terms | the owner's own |
| Geometry | the matched place's point | the clicked point, rounded to the zoom |
| Labelled with | source, its terms, matched identifier, date, owner | *placed on the map*, approximate, date, owner |
| Changes the match? | no | no (needs no match) |
| Removed by | **Remove this location**, or Undo of the match (if you choose) | **Remove this location** |

Neither ever alters a location you loaded with your dataset: they are offered only to records with no
location, and removing one can only remove a location added this way.

### Removing a location, and undoing a match

Once a record has an added location, the page says *"Location adopted from GeoNames on 18 Nov 2026 by
…"* or *"Location placed on the map on 18 Nov 2026 by … (approximate)."*, and the owner sees **Remove
this location**. That removes exactly that one location and nothing else.

**Undoing a match whose location was adopted** never silently keeps the location. Undo stops and asks:

> *This record's location was adopted from the match you are undoing. Remove the location too?*

with **Undo, and remove the location**, **Undo, keep the location** and **Don't undo**. If you keep it,
it stays labelled as adopted from that source. Only the owner can answer this; for anyone else Undo
says *"The dataset owner adopted this place's location from the match; only they can undo it."*

If suggestions are prepared again later, an adopted location counts as the record's location, except
when comparing the record with the very place it was adopted from (that would be the same point
compared with itself, so no distance is shown or counted for that place).

### Where an added location is shown

- **Match your places**: on the record, as above.
- **The Record page**: under **Geometry**, *"Location from GeoNames, adopted 18 Nov 2026 by … (terms)"* or
  *"Location placed on the map 18 Nov 2026 by … (approximate)"*; the record's own geometry is counted
  separately (*"none in the contributed record"*), so an added location is never presented as the
  contributor's own.
- **The Atlas popup and portal**: the same sentence, read live from WHG's database after the usual
  visibility check, so removing the location removes the label at once. After an added location is
  adopted, placed or removed, a published dataset is added to the search index again, which can take a
  few minutes; until then the dataset page says *"Waiting to be added to the search index"*.
- **Downloads of the dataset.** In **LPF**, the geometry carries a `citation` (the matched place's
  identifier and source) and a `provenance` block (source, terms and their link, attribution, date,
  and the statement quoted above); a placed point carries `certainty` and a provenance saying it was
  placed on the map and is approximate. In **TSV**, the `geo_source` column says, for example,
  `GeoNames (CC-BY-4.0), adopted` (with the matched identifier in `geo_id`), or `placed on the map by
  the dataset owner (approximate)`.
- **Review**: the automatic checks include *Locations added after upload*, counting adopted locations
  per source and placed ones, so the editor sees them as added, not as the contributor's own. It is
  information only and never blocks publication.

### When a dataset or a match is withdrawn

- **A dataset is made private or withdrawn.** Its Links go back to **pending**. Adopted and placed
  locations stay on the records unchanged, but only the dataset's own people (the owner, collaborators
  and WHG staff) can see them: they disappear from the Record page, downloads and the API, and the
  dataset leaves the search index, exactly as the rest of the dataset does.
- **It is published again.** The Links become active and the locations reappear. Before that, WHG
  removes any adopted location whose Link no longer stands, or whose source's terms changed while the
  dataset was private.
- **A Link is withdrawn, rejected or replaced.** An adopted location *goes back with its Link*: it is
  removed from the record and kept in an archive of retracted locations, the download cache is cleared,
  and a published dataset is added to the index again. It stays while another standing *Same place*
  Link for the same suggestion remains.
- **A Link is made again.** The location is **not** brought back automatically, because adopting is a
  separate act of yours. WHG staff can restore it if the Link stands again, the source's terms still
  allow it and the record has no location of its own.
- **Undo, keep the location.** You can still choose to keep an adopted location when you undo its
  match. That is your explicit choice, so it stays, marked as kept; it is still subject to the source's
  terms, and the review check counts it.
- **A placed location** is your own data: it follows the dataset only and never depends on a Link.
- **A dataset is deleted.** Its locations go with its records; its Links are withdrawn and kept.

### Licensing

This matches the paragraph *Locations adopted from a matched place* on WHG's
[licences page](https://whgazetteer.org/licenses/#adopted-locations):

- adopting is optional and never done for you;
- it is offered only from sources whose terms are public domain or attribution only, and only as a
  point;
- an adopted location is stored separately from your own data, labelled with the gazetteer it came from
  and that gazetteer's terms, and downloads of your dataset carry that statement with it;
- locations from sources with share-alike, non-commercial or no-derivatives terms are shown as a
  reference only (a link and a citation): nothing is copied, so your dataset's chosen licence stays
  true;
- a location you place on the map yourself is your own data.

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

### The Review and publication panel

Review and publication are done from a panel on your dataset's page, headed **Review and publication**
and marked *beta*. Only the dataset's owners see it, and only when signed in with beta access. It shows
the dataset's current stage in plain words (for example *"Private draft: only you and your collaborators
can see it. When it is ready, submit it for review by the WHG team."*) and only the buttons that apply at
that stage. Buttons with consequences ask you to confirm first, and say what will happen.

**A dataset you uploaded before this review process existed** does not enter it automatically. If it is
private, the panel offers **Start the review process**. This moves it to a private draft and changes
nothing else: *"It stays private while you prepare it. When you submit it, the WHG team reviews it, and
it can be published only after that review."* A dataset that is already public cannot be started; it
would have to be made private first.

### Submitting

While the dataset can be submitted, the panel shows:

- **Before review: two questions**, which the editor reads *"when deciding whether part of the dataset
  should be held back"*: whether the dataset includes information about Indigenous peoples, lands or
  places that their communities may wish to control, and whether it includes locations that could cause
  harm if widely known (sacred or burial sites, vulnerable heritage, private homes). Answer each, then
  choose **Save answers**. A "yes" asks you to say briefly what is sensitive;
- an optional **Note for the editor**, and **Submit for review** (or **Submit again for review** after
  changes were requested, after the dataset was declined, or after it was withdrawn).

**Both questions must be answered before you can submit.** Until they are, the submit button is greyed
out and the panel says *"Answer the two questions on Indigenous and sensitive data before submitting this
dataset for review. Use "Save answers" above first."* If you answered Yes to either question without
saying what is sensitive, it says *"You answered Yes to a sensitivity question: say briefly what is
sensitive before submitting this dataset for review."* Answers you saved earlier are kept, so you need not
answer again when you submit the dataset a second time.

You receive an email saying when to expect an answer; reviews usually take up to 10 working days, and the
panel shows the expected date (*"The WHG team will usually reply by …"*). The dataset stays private
meanwhile.

The panel also has **Automatic checks**, the same checks the editor reads, each marked as passed, worth a
look, must be fixed, or not checked:

- records loaded, and the licence: a dataset with no records, or no licence, cannot be published;
- placeholder identifiers (where a private draft has some, **Remove them** deletes them in one step),
  possible duplicates, coordinates and dates;
- description and attribution;
- the sensitivity declaration (until both questions are answered it says *"the dataset cannot be
  submitted for review until they are"*);
- whether link identifiers resolve (*not checked* yet);
- locations added after upload: how many were adopted from a matched place (per source) and how many
  placed on the map (see
  [Locations for records that have none](#locations-for-records-that-have-none)).

Your copy of the checks also counts the records with links and the Links made from your records. **The
editor does not see these counts.**

### What the editor does

An editor opens the review queue, chooses **Start review** (so others know the dataset is being looked
at), reads the automatic checks and your answers, looks at your records, and decides:

- **Accept**, with an optional note: the panel then says *"Accepted. You can publish it whenever you are
  ready."*
- **Request changes**, with a note saying what needs changing. The panel shows *"The editor's note"* and
  offers **Submit again for review** once you have made the changes.
- **Decline**, with a reason. The panel says *"The editor has declined this dataset. It stays private.
  You can edit it and submit it for review again."*, shows the editor's reason, and offers **Submit
  again for review**.

Each decision is also sent to you by email, with the editor's note.

## Publishing and withdrawing

**Publish** appears on the panel once the dataset is accepted. Its confirmation says: *"It becomes
public: anyone can see and download it, its records are added to the search index, and the links you
made from its records become public too."* Then:

- its pending Links become public, as described above;
- it is added to WHG's search index, usually within minutes. Until that is done the dataset page says
  *"Waiting to be added to the search index"*. Datasets with polygons are added too;
- if it cannot be added automatically, the dataset page says *"This dataset could not be added to the
  search index automatically. Please contact the WHG team if it is still not searchable in a day or
  so."*

**Withdraw** appears once the dataset is published, with an optional reason. Its confirmation says: *"It
becomes private again: it is removed from the search index and its public page, and the links you made
from its records stop being public."* Its Links go back to **pending** at once. (What happens to
locations added to its records is described in
[When a dataset or a match is withdrawn](#when-a-dataset-or-a-match-is-withdrawn).)

**A withdrawn dataset goes back through review before it can be published again.** The panel says *"To
publish it again, submit it for review again"* and offers **Submit again for review**.

A dataset with places in WHG's older shared v3 index cannot be withdrawn this way: WHG asks you to
contact the editorial team.

A dataset that becomes public by another route (for example the older v3 dataset settings) also has its
pending Links made public, provided the record at the other end is public too.

## Your name on your Links

Your Profile page has a checkbox, **Show my name on Links I make**. Its help text says: when ticked,
*"your name (and ORCiD iD) appears beside the Links you have made between records ... to everyone"*;
when not ticked, *"only you and WHG beta testers see your name; everyone else sees 'a WHG contributor'
instead"*.

In practice, during beta, the Links sections of Record pages are visible only to beta testers, so for
now everyone who can see your Links sees your name, ticked or not. The box decides what everyone else
will see once linking opens to all. You see your own Links as *"Linked by you"*.

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

- **Fuzzy search does not find newly published places yet.** Once a dataset is in the search index,
  its places are found by exact-name searches and by searches on the start of a name. Fuzzy search,
  which allows for spelling variation, finds them only after a further processing step has been run on
  the index. Suggestions for other people's records use fuzzy search, so your newly published places are
  not suggested to them until then.
- **Some wording elsewhere is still WHG v3's.** The progress badges on the dataset page, for example,
  still show the v3 steps. The older v3 matching tools also still work during beta; see
  [Guides & Tutorials](../../guides.md).
- **There is no button to prepare suggestions again** once they have been prepared; they are renewed
  only automatically, as described in [Getting started](#getting-started).
- **A newly uploaded dataset does not enter the review process by itself.** Choose **Start the review
  process** on its page while it is private.
- **Linking, the Concordance and Links made by people are open only to beta testers** until WHG v4 opens
  to everyone.
- **Locations are points only**, and only the dataset's owner can add one.

### What is not built yet

- a background worker reserved for preparing suggestions;
- confirming many records at once. This stays off until WHG has checked, against beta testers'
  decisions, how often **Likely the same place** is right;
- adopting boundaries or shapes, or adopting names, types or dates, from a matched place;
- uploading a dataset straight into the review process (for now, **Start the review process** after
  uploading);
- a count, on WHG's dashboard, of the datasets waiting for review.
