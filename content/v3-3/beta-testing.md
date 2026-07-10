# v3.3 Beta Testing Plan

```{admonition} Who this is for
:class: note
WHG staff and invited beta testers exercising the v3.3 **Collaborative Workbench** before public
release. Anyone may read this page and watch progress; only signed-in beta testers can report snags and
use the tools. If you'd like to help test, ask the WHG team for beta access (it's granted against your
existing WHG/ORCiD account — no new account needed).
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

## Before you start

- **Get beta access** from the WHG team (granted to your WHG/ORCiD account). You'll then see the
  burnt-orange **Workbench BETA** menu.
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
```
