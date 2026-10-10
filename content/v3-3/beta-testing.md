# Beta Testing Plan

```{note}
Written for the Collaborative Workbench when it was labelled "v3.3", this plan now covers beta
testing for **WHG v4.0**. The [Draft v4 User Guide](../v4/userguide_index.md) is part of what is
under review.
```

```{admonition} Who this is for
:class: note
WHG staff and invited beta testers exercising the v3.3 **Collaborative Workbench** before public
release. Anyone may read this page and watch progress; only signed-in beta testers can report snags and
use the tools. If you'd like to help test, see **Getting access** below (sign in with ORCiD, then ask
the WHG team to switch on beta access for your account).
```

```{note}
Beta testers are also invited to try **Map your Data in PLATO tools**, which is moving out of WHG with
WHG's agreement. It has its own checklist, **O** below, and reports go through the same route as every
other snag.
```

## How testing is tracked, and how issues get resolved

We want beta testing to be **fast to report into** and **traceable to a cause**. Three things work
together:

**1. Automatic diagnostics.** While you're signed in as a tester, the Workbench quietly records a
per-session **diagnostic id** (e.g. `wb-1a2b3c4d`) and, if anything errors, the technical details go to
our error tracker (GlitchTip) tagged with that id. You don't have to do anything — a one-time notice
explains this the first time you use the Workbench. Detailed logging is limited to the beta cohort, and
we never capture the contents of your data — only the actions and errors needed to fix problems. (See
**Privacy** below.)

**2. Reporting a snag.** When something looks wrong, open the **Workbench BETA** menu → **Report a
snag**. A short form opens; it already knows the page you were on, your browser, your role, and the
diagnostic session id, so you only describe *what happened*, *what you expected*, and (if you can) the
*steps*. You don't need a GitHub account — submitting files the report to our tracker for you.

**If you do have one**, add your GitHub username to your [Profile](https://whgazetteer.org/profile/)
(under *Preferences* — the field is offered to beta testers only). Reports are then credited to
`@your-handle` instead of your name, which keeps your name off the public tracker and lets us mention
you on the issue when we need to ask a follow-up question — GitHub notifies you if your notification
settings allow it. Leave it blank and nothing changes: reports are filed under your account name.

**3. Resolution.** Each report becomes a tracked item. A developer picks it up, uses the session id to
pull the exact technical trace behind it, reproduces it (the Workbench keeps a full version history of
every working copy, so we can replay the state you saw), fixes it, deploys, and verifies — then marks
the item resolved with a note. Because the diagnostic id ties your report to the error trace and to the
saved state, most snags need no back-and-forth.

**Coverage.** The **per-feature checklists** below are the test scripts — what to try for each feature.
As areas are exercised and pass (or turn up snags), progress is tracked on the live board so everyone
can see how far testing has got. Tick things off as you go if you have tracker access; otherwise just
report snags and we'll keep the board current.

- 🐞 **Report a snag:** *Workbench BETA menu → Report a snag*
- 📋 **Live status board:** [WHG v3.3 Beta Testing project](https://github.com/orgs/WorldHistoricalGazetteer/projects/12)
  (public — anyone can watch progress)

```{admonition} Privacy
:class: tip
Detailed action/error logging applies only to signed-in beta testers, and lives in our internal error
tracker — never in public analytics. We record what you *do* and any *errors*, tied to your account and
a session id, to diagnose problems; we do **not** capture the contents of the datasets or records you
work on (those are already saved on the server, so we can reproduce issues without copying them into a
tracker). See the WHG [Privacy Policy](/privacy_policy/).
```

## Getting access

**For testers** — two steps:

1. **Sign in with ORCiD.** WHG uses ORCiD for sign-in: click *Log in* and authorise with your ORCiD iD.
   No ORCiD yet? It's free at [orcid.org/register](https://orcid.org/register) and takes a minute — then
   sign in to WHG once with it and your WHG account is created.
2. **Ask the WHG team to switch on beta access** for your account (see the staff note below). Once it's
   on, the burnt-orange **Workbench BETA** menu appears and you can use the tools and report snags.

```{admonition} For staff — granting beta access (including a whole cohort)
:class: tip
Beta access is a user's **Role** set to **"beta tester"** (WHG staff and superusers already qualify). To
grant it, open **Django admin → Users**, find the person (search by name/username), and set **Role → beta
tester**. It's gated by `User.can_access_beta` (staff, superuser, or the `beta_tester` role), so nothing
else is needed. For a class, a WHG admin/developer can set the role across a list of accounts in one go
rather than editing each by hand — hand over the students' usernames (or the ORCiD emails they signed up
with) and ask for a bulk grant.
```

## Before you start

- **Get beta access first** (see *Getting access* above) — you'll then see the burnt-orange
  **Workbench BETA** menu.
- **Test on real-ish material you don't mind touching.** Publishing from the Workbench writes to the
  live site; prefer sandbox/test collections and gazetteers you own, and avoid publishing throwaway test
  artefacts publicly. If you do, delete them or tell us.
- **One snag per report**, with a clear title. A screenshot helps for anything visual (attach it to the
  tracker item after filing, or mention that you have one).
- **Note your role** if it's relevant — staff, gazetteer owner, or plain beta tester see different
  options.

---

## Test checklists

Each box is a thing to try and the result to expect. Report a snag for anything that doesn't behave as
described (or is confusing even if "correct").

### A. Access & beta gating
- [ ] Signed out, the **Workbench BETA** menu is not visible anywhere.
- [ ] Signed in *without* beta access, the menu is still not visible, and visiting a Workbench URL
  directly gives "not found".
- [ ] Signed in *with* beta access, the **Workbench BETA** menu appears with: New…, Edit published…,
  Review suggestions, Map your Data, New Place Collection, New Itinerary, New Gazetteer Group, Beta
  testing plan, Report a snag.
- [ ] The first time you open a Workbench tool, a one-time notice explains beta logging; **Got it**
  dismisses it and it doesn't return.

### B. Map your Data (reconciliation)

*Map your Data is moving to PLATO tools. The version under test now is the PLATO tools one, in section
[O](#o-map-your-data-in-plato-tools); this checklist covers the version still inside WHG.*

- [ ] Import a CSV / spreadsheet / GeoJSON of place records; columns are detected and can be re-assigned.
- [ ] Reconcile against WHG; candidate matches appear with scores and on the map.
- [ ] Accept / reject matches; the review state persists on reload (it's saved in your browser).
- [ ] Draw or clone a geometry for a row; it sticks.
- [ ] Add places from text (NER) — see section K.
- [ ] Export / download the augmented copy; the file is correct.
- [ ] Save to your account and reopen in another tab; the project loads.

### C. Record correction editor ("Correct this record")
- [ ] On a published place page for a gazetteer **you can edit**, a **Correct this record** button
  appears; on one you *can't* edit, you instead see **Suggest a correction** (section E).
- [ ] The editor loads every field: primary name, country codes, also-known-as names, place types,
  location/geometry, dates, authority links, descriptions.
- [ ] Edit the **name** and each field type (add / edit / remove list rows); changes show "Saved to your
  account".
- [ ] **Re-reconcile this record** searches WHG + authorities and lets you attach a match as a link
  (and adopt its location if the record had none).
- [ ] **Publish correction** applies your changes; "View the record" shows them, and search reflects the
  new name.
- [ ] Open the same record in two tabs, change it in one and publish, then publish the other → you're
  warned it changed rather than silently overwriting.

### D. Geometry drawing (Location / geometry)
- [ ] For a record with no geometry, **Edit geometry on map** opens a map with Point / Line / Polygon /
  Finish / Clear tools.
- [ ] Draw a **Point**; the summary shows `Point (lng, lat)` and it's saved.
- [ ] Click **Point** again and add another → it becomes **2 points** (a multi-point). Same for Line and
  Polygon (Finish completes a line/polygon; drawing another part makes it multi-).
- [ ] **Clear all** removes the geometry.
- [ ] A record with a **single** existing geometry (incl. one carrying dates/citations) is editable, and
  reshaping it keeps that date/citation detail.
- [ ] A record with a **mix** of geometry types, or **several** geometries each with their own dates/
  citations, is shown **read-only** ("view on the map"), with a note to edit it in the dataset editor.
- [ ] Publish; the corrected geometry appears on the record and its map.

### E. Community suggestions
- [ ] On a published place page for a gazetteer you **don't** own, **Suggest a correction** opens the
  editor with a **Submit suggestion** button (not Publish).
- [ ] The same affordance appears on a **portal** page (per source box) and in a **gazetteer's places**
  detail popup.
- [ ] Make a change and **Submit suggestion**; you're thanked and told it's gone for review; the record
  is **not** changed.
- [ ] A "corrections proposed" marker appears on the record; you (as proposer) can see your own pending
  suggestion.
- [ ] As staff (or the gazetteer's owner), **Workbench → Review suggestions** lists it with a
  current→proposed diff.
- [ ] **Accept & apply** applies the change to the record and re-indexes it; **Reject** (with a note)
  leaves the record untouched.
- [ ] If the record changed since a suggestion was made, accepting reports it as superseded rather than
  clobbering the newer version.

### F. Dataset check-out ("Edit records in Workbench")
- [ ] As staff, a gazetteer's page (and the Edit-published hub) shows **Edit records in Workbench**.
- [ ] The capacity chooser offers **Edit all N records** only when the gazetteer is small enough to fit
  your browser; otherwise it steers you to a subset.
- [ ] Check out a **subset** by name and/or country, with a record cap; the record list loads.
- [ ] Expand a record → the full editor (section C/D) mounts inline; edits mark the row **changed**.
- [ ] The filter box narrows the loaded list; the **Publish N changes** button counts only changed
  records.
- [ ] **Publish** applies only the changed records and reindexes them; unchanged records are untouched.
- [ ] If a record changed elsewhere since check-out, it's reported as skipped (not clobbered) and the
  others still publish.

### G. Place Collection editor
- [ ] **New Place Collection**: set title/description; search WHG and add places with notes; reorder and
  remove members.
- [ ] Maps show the members; the assembled-collection preview looks right.
- [ ] Save to account, then **Publish**; the public collection page shows the members and metadata.
- [ ] Re-open a published collection via **Edit published…**, change it, and re-publish; changes appear;
  a concurrent change is flagged rather than clobbered.

### H. Itinerary editor
- [ ] **New Itinerary**: add stops; the order is meaningful (numbered) and reorders correctly.
- [ ] Publish; the itinerary presents in the set order.

### I. Gazetteer Group editor
- [ ] **New Gazetteer Group**: search published gazetteers and add them as members.
- [ ] Publish; the group page lists the member gazetteers.

### J. Edit published… hub
- [ ] Lists everything you own or collaborate on: place collections, gazetteer groups, and gazetteers.
- [ ] Search and the type filter narrow the list.
- [ ] **Edit in Workbench** checks out a collection/group into the right editor; gazetteers offer
  **Edit records in Workbench** (staff) or corrections via the record path.

### K. Add places from text (NER)
- [ ] Paste text (or import a Google Doc / upload a file); place names are extracted.
- [ ] Ambiguous / matched names are flagged; a document set in one region resolves to that region (not a
  same-named place elsewhere).
- [ ] **Add** / **Add all** brings located entities into the project.

### L. Collaboration & sharing
- [ ] Save a project to a **team**; invite someone by username as editor or viewer.
- [ ] A viewer can't edit; an editor can.
- [ ] Create a **read-only share link**; opening it (signed out) shows the project read-only.
- [ ] Where real-time is available, two people editing see each other's changes; a stale edit merges or
  is flagged rather than lost.

### M. Cross-cutting
- [ ] Navigation, tooltips, and each tool's **Documentation** button go where they say.
- [ ] Nothing in the beta menu is reachable by non-beta users.
- [ ] Performance is acceptable on your typical dataset sizes; note anything slow (with the record count).
- [ ] Anything confusing, mislabelled, or inconsistent — report it even if it technically "works".

### N. Atlas & Gazetteers panel

The **Atlas** is the map-first way of exploring WHG, at [whgazetteer.org/atlas/](https://whgazetteer.org/atlas/)
(beta-gated: you need the beta-tester role, see *Getting access*). Background reading: the draft guide
[Atlas: Discovering Linked Places](../atlas.md). The Atlas is live and fixes are landing in drops through
the day, so this section's known-issues lists will shrink; re-check this page if something looks different.
Start with **N1**, then take the blocks in any order. **N8** (tour and mobile) is a good last pass.

```{warning}
**Screenshots and public reports:** please do not include content from the `kain_par` or `vob_*` gazetteers
in any screenshot or any public report (including the public tracker). Describe the problem in words, or
use a different gazetteer to show it.
```

```{admonition} How to report an Atlas snag
:class: tip
Use **BETA menu → Report a snag** and choose the feature area **Atlas**. If "Atlas" isn't in the list yet,
choose **Navigation / access / other** and start the title with **"Atlas:"**. One snag per report; say which
block (N1 to N8) and step you were on, and the search or gazetteer involved.
```

#### N1. Search: Places, Areas and match modes
- [ ] The search bar has an **Areas / Places** toggle. In **Areas** mode, typing a region or country name
  gives suggestions; choosing one selects the area (it appears as a chip below the bar and is outlined on
  the map).
- [ ] Switch to **Places**. The match menu beside the box offers **Exactly**, **Starts with**, **Contains**
  (default) and **Sounds like**. Search a name (try *Constantinople*, then *Cologne*) in each mode; results
  and the count in the results panel change sensibly (Exactly narrowest; Sounds like finds spelling variants).
- [ ] With an area selected, a Places search is limited to that area. **Clear search** (the x) empties the
  box and results.
- [ ] The results panel lists matches; clicking one flies the map to it and opens its popup. A Wikidata
  hit shows a real name, not a bare Q-id such as "Q12345".
- [ ] If a search fails, note the **exact message text** in your report: errors are specific ("temporarily
  unavailable", with a gateway banner at the bottom of the screen; "taking longer than usual"; or "This is a
  beta feature — request access").

Known issues, please don't report:
- Repeated region labels on the map.

#### N2. Clusters, merge sensitivity and signal weights
- [ ] After a Places search, results are grouped into **cluster cards**: one card per real-world place, with
  its sources listed beneath. Open a card to see every source record.
- [ ] A **Merge sensitivity** (θ) slider appears. Slide towards loose: fewer, bigger clusters; towards strict:
  more, smaller ones. The map and cards re-group immediately. The small "auto" marker shows the auto-fitted
  value; dragging overrides it.
- [ ] **Adjust signal weights** opens sliders for Name, Location, Time, Type, Links and **Same-gazetteer
  split**. Moving them re-groups instantly; no records are lost or changed, only grouped differently.
- [ ] Look for wrong merges (different places lumped together) and wrong splits (obvious duplicates apart)
  and report examples with the search term and slider values.
- [ ] Each card's **Source & licence** footer states the licence. Contributed (WHG) datasets read "licence
  per dataset (see Details)". Records whose licence forbids WHG to redistribute them (e.g. China Historical
  GIS, Native Land, `kain_par`) read "details withheld (licence)", and their **Details** opens an
  explanation with a link to the source instead of the record.

Known issues, please don't report:
- Sparse dates: many records have none, so the Time signal carries little weight for them.
- `osm` and `tgn` records dated "2025" (these sources are point-stamped with the date of capture).
- "details withheld (licence)" on `chgis`, `nl` and `kain_par` records: correct behaviour.

#### N3. Place portal (full place view)
- [ ] Clicking a map point shows a popup with names, dates, type, source and **View at source**.
- [ ] The popup's button opens the **place portal** (modal): all names (with scripts), types, dates, links
  to authorities, and the source records behind a cluster. It closes cleanly with the x or Esc.
- [ ] The address bar gains a `?place=` link while a place is open; copying it into a new tab reopens the
  same place. A bad or unknown place id gives a "not found" page, not an error.
- [ ] For a record from a source whose licence forbids redistribution (`chgis`, `nl`, `kain_par`), Details
  explains this and links to the source instead of showing the record.

Known issues, please don't report:
- **"Details withheld (licence)"** (and the explanation page) for `kain_par`, `nl` and `chgis` records. This
  is correct: those licences do not permit us to show the data.

#### N4. Gazetteers panel: Filter & Explore
- [ ] Open **Gazetteers** (book icon). Two modes: **Filter** (tick several gazetteers to restrict searches
  to them) and **Explore** (pick one gazetteer to browse on its own).
- [ ] The group buttons **All / Reference / Contributed / Mine** and the **Standard** pill narrow the list;
  the name box filters by text. "Mine" lists your own gazetteers (signed in).
- [ ] **Coverage filters:** the **Area** switch is greyed out until you have selected an area (Areas mode);
  the **Date range** switch is greyed out until the date filter is on (N7). Once enabled, each hides
  gazetteers whose coverage lies outside your area or period.
- [ ] Each row has an **i** button: details (records, dates, rights holder, source link), a **Cite this
  gazetteer** citation, a **licence badge** and download buttons.
- [ ] In **Explore**, choosing a gazetteer shows its records on the map with a **Place list**: browsable and
  searchable by name ("Search places in this gazetteer"), with a back button to the Gazetteers panel.
- [ ] A downloads button is either live (file downloads) or greyed with a tooltip explaining why.

Known issues, please don't report:
- **Itinerary**, **Network** and **Attest** controls carry a "planned" tag and are disabled. Please don't
  report them as broken; comments on their intended design are welcome.
- Authority downloads point to the source rather than an export (place#312).
- Low-zoom gaps in coverage for polygon-dominant gazetteers (place#166).
- OHM shows square holes at low zoom.
- "Details withheld (licence)" on `kain_par`, `nl`, `chgis` is correct behaviour.

#### N5. Layers, region sources and area selection
- [ ] **Areas** mode, **Layers** button: the palette lists region/boundary sources. Switching a source on
  draws its boundaries on the map; off removes them. Changing the basemap keeps them.
- [ ] In **Areas** mode, name search for PeriodO, Cliopatria, Native Land and OSM misc shows an inline
  "Name search isn't available for this source yet (planned)" rather than results or an error.
- [ ] Click a region on the map: it is selected and appears as a chip; click again or use the chip's x to
  deselect. Several areas can be selected together.
- [ ] The **viewport constraint** button is available on the flat map only (greyed with a tooltip on the
  globe). When on, search is limited to what you can see.

Known issues, please don't report:
- Repeated region labels where boundaries overlap.
- Low-zoom gaps for polygon-dominant gazetteers (place#166); OHM square holes at low zoom.

#### N6. Type filter (AAT)
- [ ] **Place categories** (the tag icon) shows the Getty AAT type tree. Expand and tick types; a count badge
  shows how many are active, and **clear all** resets them.
- [ ] Selected types appear as **chips** and as type facets in the results panel; results narrow accordingly.
  Removing a chip widens them again.
- [ ] The tree can be searched by type name, and hovering a type explains it.

Known issues, please don't report:
- Some records have no type or only a generic one, so they drop out of type-filtered results.

#### N7. Date filter
- [ ] The date control has **Off / Possibly / Definitely** modes and a from-to slider. **Possibly** keeps
  anything its sources do not rule out; **Definitely** keeps only places whose attested life falls in your
  window (stricter, so fewer results). Hover each for the explanation.
- [ ] Dragging either handle updates the map; dragging the middle band moves the whole range. The padlock
  locks to a single year; the arrow keys then step through time.
- [ ] Turning the filter off restores all results.

Known issues, please don't report:
- Sparse dates: most places have none and may vanish under **Definitely**.
- `osm` and `tgn` records dated "2025" are point-stamped, not real founding dates.

#### N8. Basemaps, share link, tour and mobile
- [ ] **Basemap** menu (stack icon): WHG Enhanced, OpenStreetMap and Satellite switch the background; your
  results and layers stay put. The globe/flat projection toggle works.
- [ ] **Share:** the share button on a result or popup copies a link (on a phone it opens the share sheet).
  Open the link in a private window: it restores the place, gazetteer or zoom (note you must be signed in
  with beta access to use the Atlas). A link of the form `?gazetteer=<ns>` opens that gazetteer in
  **Explore**.
- [ ] **Tour:** the signpost button (bottom left) starts the guided tour; steps should highlight the control
  they describe, and "Don't show this again" on the welcome panel is respected on reload.
- [ ] **Mobile** (phone or a narrow window): panels open without covering the search box permanently,
  buttons are tappable, the map pans and zooms by touch, and nothing overflows horizontally. The tour is
  deliberately not offered below 768 px wide.

Known issues, please don't report:
- Itinerary, Network and Attest are "planned" and disabled; design comments welcome.
- No tour on screens under 768 px wide: by design.
- The map can look blank if the browser window is not the front window; bring it forward and reload.


### O. Map your Data in PLATO tools

**Map your Data** is moving from WHG to [PLATO tools](https://pelagios.org/plato-tools/), with WHG's
agreement, and the PLATO tools version is the one under test now. It is a guided workflow, run by PLATO
tools' workflow manager, Methodos. It takes a table of historical places and turns it into linked place
data in PLATO's format:

1. Find the regions the places lie in, level by level.
2. Match each place to WHG.
3. Adopt a WHG location, or draw one on a map.
4. Check, compare and write the result.

We want to learn three things:

- whether someone who did not build it can finish the workflow on their own data;
- where it confuses, stalls or gives wrong matches;
- how large a table it handles comfortably.

The tools are labelled *Experimental*. Expect rough edges, and report them all. You do not need to read
the [Map your data guide](https://pelagios.org/place-attestation-ontology/guide/tools.html#methodos-map-your-data)
first: follow the workflow on your own, and open the guide only when stuck. Note every place you needed it.

#### O1. Setup (about ten minutes, done once)
- [ ] **Browser.** Use a current desktop Chrome, Edge or Firefox, in a normal window. A private window keeps
  nothing between visits, so you could not resume work.
- [ ] **WHG account and beta access.** The WHG lookup step does nothing without them (see *Getting access*).
- [ ] **WHG token.** Log in to [whgazetteer.org](https://whgazetteer.org/) with ORCiD, then go to
  **Profile**, then **API Token**. The token does not expire. Treat it like a password: never paste it
  into a report or a screenshot.
- [ ] **Allow the lookup.** Give the token in the WHG lookup panel when the regions or places step asks for
  it, and allow the lookup in the **Permissions** panel, which says where the token is kept. A preview
  always shows exactly what will be sent before anything goes.
- [ ] **Set the dataset's language.** In the WHG lookup panel, set the language of your names (e.g. `en`)
  if they carry no language tags; a name's own tag is used where it has one.
- [ ] **Keep my working data between visits.** Leave this on (it is on by default, under *Your working data*
  in **Permissions**), so that a workflow survives a reload or a closed tab.

Your own files never leave your computer. Only place names, and coordinates if you choose, go to WHG
during the lookup.

#### O2. Your test data
Use a real table of your own if you have one: a spreadsheet (CSV, Excel or OpenDocument) with one place
name per row. A column for the region each place lies in (a parish, a county, a country) tests the most,
because it adds the region review. If you have no table, ask the WHG team for a 20 to 50-row example table
of parishes with their counties.

Work up in size, because nothing larger than 10 rows has been measured yet:

| Session | Rows | Purpose |
| --- | --- | --- |
| 1 | 20–50 | Learn the workflow end to end |
| 2 | 100–300 | A realistic small dataset, with resume and recovery |
| 3 | 500 or more | Find where it slows or stalls (only once session 2 goes well) |

WHG allows each account about 5,000 lookups a day, so a large table may need two days. Plan three sessions
of one to two hours each, a few days apart, so that fixes from one session are in place for the next.

#### O3. Session 1: the whole workflow (20 to 50 rows)
- [ ] **Start.** On [pelagios.org/plato-tools](https://pelagios.org/plato-tools/), press **Not sure where to
  start? Answer three questions**. Answer: a list of place names; places on a map; then the yes-or-no
  questions. If your table gives regions, give a base address (any web address you control, for example
  `https://example.org/my-places/`). Press **Follow**. *Check: did the questions make sense, and did you
  get Map your data?*
- [ ] **Match the columns** (Hermes). Choose your file in step 1, match each column to PLATO's fields, and
  press **This step is done**. *Check: were the guessed matches right? Was any column impossible to place?*
- [ ] **Check the table** (Elenchos) and **make a PLATO dataset** (Metaphrasis). *Check: was every problem
  reported in words you could act on?*
- [ ] **Identify the regions** (Krisis), if your table gives them: **Review the regions level by level**,
  widest first. *Check: were the right regions found? How many did you settle by hand?*
- [ ] **Look the places up in WHG** (Krisis). Read the preview of what will be sent, then allow it. *Check:
  how long did it take for your table? Any errors?*
- [ ] **Decide the candidates** (Krisis). Accept, reject or leave each match. *Check: record how many places
  had the right match first, somewhere in the list, or not at all.*
- [ ] **Record the decisions** with **Finish**. Export the candidates first if the review offers it.
- [ ] **Draw or trace** missing places (Chora), if you said you would. Use **Open Chora**, then **Back to the
  workflow** and **Take the dataset back from Chora**. *Check: did the hand-back work first time?*
- [ ] **Check the result**, **compare it** with the dataset made from the table (Mneme), and **download** it.
  *Check: open the downloaded file. Does it contain every place, with its matches?*

Skip publishing (Agora) in session 1.

#### O4. Session 2: resume and recover (100 to 300 rows)
Run the workflow on a 100 to 300-row table, and on purpose:
- [ ] reload the page in the middle of "Decide the candidates", and carry on;
- [ ] close the tab and come back next day;
- [ ] press **Back a step** once, and redo the step;
- [ ] choose the wrong file at a step that asks for one.

Check that nothing you did was lost, and that every refusal told you what to do.

#### O5. Session 3: size (500 rows or more)
- [ ] Run a table of 500 rows or more. Note the time each of "Check the table", "Identify the regions",
  "Look the places up in WHG" and "Decide the candidates" took, and the point where anything slowed, froze
  or failed.

#### O6. Known limitations (as of 10 October 2026)

These are known already. There is no need to report them, unless one stops you working. The list will
change as fixes land, so re-check this page if something looks different.

- **Historical regions often match a later unit of the same name.** Regions are matched only to areas, but
  WHG's areas are mostly later or modern boundaries (hundreds, wapentakes and 1680 county lines are rarely
  there). If places within a region find nothing, check the region's match, look up again with the
  constraint relaxed, or leave the region unmatched.
- **After a bulk accept, check places whose region is unmatched.** In testing, one was taken from the wrong
  one of two same-named places in a county, 47 km away. This stands until PLATO tools can skip ties on bulk
  accept (plato-tools #31).
- **In Chora's adopt search, check the country before adopting.** The search does not yet send the region,
  so the first results can be abroad.
- **A dataset already in WHG matches itself.** For example, Index Villaris 1680 is in WHG.
- **One browser only.** Work is kept in the browser you used. You cannot move it to another computer or hand
  it to a colleague yet.
- **No sharing through WHG yet**, and no *Submit to WHG*. The result is a file you download.
- **Size.** A 33-row table ran against WHG at about 2 seconds per request, with no problems. Nothing larger
  has been tried, hence the sessions above. WHG allows about 5,000 lookups per account per day.
- **WHG's scores** rank the answers to one search, not how likely a match is. The decision is always yours.
- **Firefox and Safari** ask you to choose your file again at a step that needs it. Chrome and Edge offer a
  one-click **Open again**.

#### O7. How to report a PLATO tools problem

Use the same route as any other snag: **Workbench BETA menu → Report a snag**, with the feature area
**Navigation / access / other** and a title that starts **"PLATO tools:"**. One problem per report. If
something blocks you completely, say so in the title. WHG triages and forwards PLATO tools reports to the
PLATO tools lead, and fixes are made in PLATO tools, not WHG.

The form has no fields for severity or status, so put them in the report text. Start the description with
a line such as `Severity: Wrong result`, using one of: **Blocks me**, **Wrong result**, **Confusing**,
**Suggestion**. For each problem, also give:

- the session and the workflow step;
- what you did, what you expected, and what happened;
- the exact words of any message, and a screenshot if it helps (never showing your WHG token);
- the table's size, and whether it gives regions.

The status is set by the team as it works on the report, using: **New**, **Seen**, **Fixing**, **Fixed,
please retest** (when it is ready to check again) and **Closed**. You will see it on the tracker item, or
we will tell you when a fix is ready to retest. Your first PLATO tools report starts at **New**.

Roles: beta testers try the workflow and report; the PLATO tools lead takes questions, blockers and fixes
for PLATO tools; the WHG team handles WHG accounts, tokens, beta access and the lookup service. The start
date for the sessions is to be agreed with the WHG team.
