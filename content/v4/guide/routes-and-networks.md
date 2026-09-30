# Routes, Itineraries and Networks

```{note}
Part of the [Draft v4 User Guide](../userguide_index.md): under review during beta testing.
```

% TODO(release): confirm the upload steps (Step 8) against the shipped WHG v4 interface.

This tutorial walks through entering a historical **route** in a spreadsheet, in the shape WHG v4
reads: PLATO's spreadsheet template, whose sheets each become attestations. It uses one example
throughout, Iters III and IV of the Antonine Itinerary (two Roman roads from London to the Kent ports),
and ends with how the same sheets hold an itinerary (King John in 1215) and a network (the lower River
Idle; the Datini letters). The excerpts come from PLATO's
[worked examples of routes, journeys and networks](https://pelagios.org/place-attestation-ontology/guide/routes/),
where each can be downloaded in full.

For the model behind the sheets, see
[Routes, Itineraries, Networks, Groups and Periods](../data-model/patterns.md).

---

## What you will build

- A **route**: one row that stands for the road as a whole, typed as a route.
- Its **stations**, each a place of its own, with its position on the route.
- Optionally, its **legs** (segments) between stations, with the distances the source gives.
- Every row tied to a **source**, with a date and, where you have one, a certainty.

**You will need:** the PLATO spreadsheet template (a workbook, or one CSV file per sheet), your
source, and a spreadsheet program.

% TODO(release): link the template download (workbook and CSV zip) at its published address.

---

## Step 1: Decide what you are entering

The same sheets hold three kinds of thing. Decide which yours is before you start:

| If your source gives… | it is a… | PLATO kind to name in its Type |
|---|---|---|
| a way through places in order, with no dates of travel | **route** | `https://w3id.org/plato#TypeRoute` |
| a journey through places, dated stop by stop | **itinerary** | `https://w3id.org/plato#TypeItinerary` |
| places and the connections between them, in no single order | **network** | `https://w3id.org/plato#TypeNetwork` |

A route's dates, if it has any, are when it was in use, not when anyone travelled it. If your
source says when someone was at each place, you have an itinerary: see
[Variation: an itinerary](#variation-an-itinerary).

---

## Step 2: The sources sheet

Add one row for each source you cite. Every other row points at one of these by `source_id`.

```csv
source_id,title,citation,uri,date,from,to,derived_from,licence
itinerarium,Itinerarium Antonini Augusti,"Itinerarium provinciarum Antonini Augusti, the Roman road itinerary compiled probably in the third century",,probably 3rd century,0200,0300,,
parthey-pinder-1848,Itinerarium Antonini Augusti et Hierosolymitanum,"G. Parthey and M. Pinder (eds), Itinerarium Antonini Augusti et Hierosolymitanum ex libris manuscriptis (Berlin: F. Nicolai, 1848)",https://archive.org/details/iternerariumanto00itin,1848,1848,1848,itinerarium,https://creativecommons.org/publicdomain/mark/1.0/
…
```

The Itinerary and the edition of it that was read are two sources: the edition is `derived_from` the
Itinerary, and every row except the locations cites the edition, with its page in `locator`; the
locations cite a third source, Pleiades.
From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html).

---

## Step 3: The places sheet

The places sheet has one row for **everything** that gets its own identity: the route itself, each
station and, if you model them, each leg.

- **The route** is a row like any other, with its own `place_id`.
- **Each station** is a row.
- **Each leg** you want to say something about (a distance, a geometry) is a row too. Legs you have
  nothing to say about can be left out: a route whose source lists only stations is its stations in
  order.

```csv
place_id,label,country_codes
iter-iii,Iter III of the Antonine Itinerary: London to Dover,GB
iter-iv,Iter IV of the Antonine Itinerary: London to Lympne,GB
londinium,Londinium (London),GB
durobrivae,Durobrivae (Rochester),GB
…
leg-londinium-durobrivae,Road from Londinium to Durobrivae,GB
…
```

Two routes (Iters III and IV, which share their first two legs), the stations, and the roads between
them, all in one sheet.
From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html).

---

## Step 4: The types sheet

Type the route as a route, and each leg as a segment, by putting the IRI of PLATO's kind (a concept
in `plato:EntityKindScheme`) in `type_uri`. Each row of the types sheet is one Type as your dataset
uses it: the concept's IRI goes in `type_uri`, which becomes the Type's `identifier`, never its own
address; a vocabulary and its version may be given in `type_scheme` and `type_scheme_version`.

| Row for | `type_label` | `type_uri` |
|---|---|---|
| the route | route | `https://w3id.org/plato#TypeRoute` |
| each leg | segment | `https://w3id.org/plato#TypeSegment` |

Stations get whatever Types your source gives them (a town, a fort), as usual. The route may also
have a Type of its own from a vocabulary such as the AAT; the PLATO kind is what tells WHG to treat
it as a route.

Legs are typed as segments so that WHG can leave them out of lists and searches of places, where
"one station to the next" would read as a pseudo-place.

```csv
place_id,type_label,type_uri,type_scheme,type_scheme_version,date,from,to,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
iter-iii,route,https://w3id.org/plato#TypeRoute,,,undated,,,parthey-pinder-1848,"p. 225, Wess. 473",,citesAsEvidence,,,,,
iter-iv,route,https://w3id.org/plato#TypeRoute,,,undated,,,parthey-pinder-1848,"p. 225, Wess. 473",,citesAsEvidence,,,,,
leg-londinium-durobrivae,segment,https://w3id.org/plato#TypeSegment,,,undated,,,parthey-pinder-1848,"p. 225, Wess. 473",,citesAsEvidence,,,,,
…
```

The stations have no row here, because the Itinerary does not say what they are.
From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html).

---

## Step 5: Names and locations

Enter names in the names sheet and locations in the locations sheet, as for any place. The route
can have names of its own. A leg's location is **optional**: a leg known only by its two ends needs
none.

Do not enter a line for the route that you have drawn through its stations. WHG draws that line
itself from the stations, and marks it as computed, because anyone holding the stations can draw it
again; a line entered as a location would become evidence that no source gave. Enter a route
geometry only if a source gives one.

```csv
place_id,name,language,script,romanized,name_type,form_status,occurrence_context,occurrence_count,transcription_accuracy,transcription_completeness,date,from,to,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
londinium,Londinio,la,Latn,,,Attested,,,,,undated,,,parthey-pinder-1848,"p. 225, Wess. 473.1",,citesAsEvidence,,,,,"Ablative, in the heading of Iters III and IV: ""Item a Londinio""."
durobrivae,Durobrivis,la,Latn,,,Attested,,,,,undated,,,parthey-pinder-1848,"p. 225, Wess. 473.3",,citesAsEvidence,,,,,"Ablative, as the Itinerary lists its stations."
…
```

```csv
place_id,latitude,longitude,wkt,geometry_role,precision_km,date,from,to,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
londinium,51.513335,-0.088949,,RepresentativePoint,,undated,,,pleiades,places/79574,,citesAsDataSource,,,,,
durobrivae,51.389649,0.502597,,RepresentativePoint,,undated,,,pleiades,places/79433,,citesAsDataSource,,,,,
…
```

The names are the forms the source writes, marked `Attested`; the locations are sourced to Pleiades,
not to the Itinerary.
From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html).

---

## Step 6: The relations sheet: stations in order

Each station gets one row in the relations sheet saying it is a member of the route, and where:

| Column | What to put |
|---|---|
| `place_id` | the **station** (not the route) |
| `relation_type` | `MemberOf` |
| `related_place_id` | the **route** |
| `related_uri`, `related_label` | leave empty |
| `sequence` | the station's position, as your source orders it (1, 2, 3 …) |
| `date`, `source_id` | required on every row |

The sequence goes on the station's row because it is the station's position **on that route**:
the same place can hold a different position on another route, in another row.

Fill in **one** of `related_place_id` and `related_uri`, never both. `related_place_id` is for a
place in your places sheet; `related_uri` is for something described elsewhere (see
[Places in other histories](#places-in-other-histories)).

```csv
place_id,relation_type,related_place_id,related_uri,related_label,sequence,date,from,to,duration,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
londinium,MemberOf,iter-iii,,,1,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.1",,citesAsEvidence,,,,,"The starting point, named in the heading."
leg-londinium-durobrivae,MemberOf,iter-iii,,,2,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.3",,citesAsEvidence,,,,,
durobrivae,MemberOf,iter-iii,,,3,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.3",,citesAsEvidence,,,,,
leg-durobrivae-durovernum,MemberOf,iter-iii,,,4,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.4",,citesAsEvidence,,,,,
durovernum,MemberOf,iter-iii,,,5,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.4",,citesAsEvidence,,,,,
leg-durovernum-dubris,MemberOf,iter-iii,,,6,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.5",,citesAsEvidence,,,,,
dubris,MemberOf,iter-iii,,,7,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.5",,citesAsEvidence,,,,,
londinium,MemberOf,iter-iv,,,1,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.6",,citesAsEvidence,,,,,"The starting point, named in the heading."
leg-londinium-durobrivae,MemberOf,iter-iv,,,2,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.8",,citesAsEvidence,,,,,
…
```

Here the roads between stations are members too (see [Legs: segment ends](#legs-segment-ends)), so
stations and roads share one sequence: London 1, the road 2, Rochester 3, and so on to the port at 7.
The first road is a member of both iters, in a row for each, at position 2 in each.
From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html).

### Gaps, alternatives and unknown order

- **Gaps are fine.** Only the order matters: 1, 2, 5, 8 is as good as 1, 2, 3, 4.
- **Equal numbers are alternatives.** If the source gives two stations for one stage (two branches
  of the road), give both the same number.
- **No number means no order.** If the source names a station but not its place in the sequence,
  leave `sequence` empty. Do not guess.
- **Another source, another order.** If a second source orders the stations differently, add its
  own rows with its own `source_id` and numbers. Do not correct the first source's rows.

### A route within a route

A route can be a member of a larger one: give the smaller route a `MemberOf` row pointing at the
larger, with its sequence. Each iter is one of the Antonine Itinerary's routes, so a dataset of the
whole Itinerary would give each iter a `MemberOf` row pointing at it. A route must never end up a
member of itself; the checker reports that as an error.

### Legs: segment ends

If you have legs, each leg needs:

1. a `MemberOf` row pointing at the route, with its sequence, like a station; and
2. rows joining it to its two ends:
   - if the leg has a direction (it leaves one station and reaches the next): one `BeginsAt` row
     and one `EndsAt` row;
   - if it has none (a stretch of road walked either way): two `HasEnd` rows.

`place_id` is the **leg** on all of these rows; `related_place_id` is the station.

Never join a leg to its ends with `ConnectedTo` or `LeadsTo`. Those join two places directly; a
leg joined to its ends that way would put every station two steps from its neighbours.

```csv
place_id,relation_type,related_place_id,related_uri,related_label,sequence,date,from,to,duration,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
…
leg-londinium-durobrivae,MemberOf,iter-iii,,,2,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.3",,citesAsEvidence,,,,,
…
leg-londinium-durobrivae,BeginsAt,londinium,,,,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.3",,citesAsEvidence,,,,,In the direction the Itinerary runs.
leg-londinium-durobrivae,EndsAt,durobrivae,,,,undated,,,,parthey-pinder-1848,"p. 225, Wess. 473.3",,citesAsEvidence,,,,,In the direction the Itinerary runs.
…
```

The road could be travelled either way; `BeginsAt` and `EndsAt` record the direction the Itinerary
runs, and the notes say so.
From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html).

---

## Step 7: Figures: the properties sheet and the connections sheet

Where your source gives a figure about a link (a distance, a journey time, a toll, a number of
letters), where it goes depends on what the link is:

| The link is… | Enter the figure in | One row is |
|---|---|---|
| a **leg** you entered as a place (a segment) | the **properties** sheet, with the leg's `place_id` | one figure about the leg |
| a **connection** between two places, with no existence of its own | the **connections** sheet | one link and one figure |

For this route, the leg distances go in the **properties** sheet, on the legs.

```csv
place_id,property_uri,property_label,value,unit_uri,date,from,to,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
leg-londinium-durobrivae,https://www.wikidata.org/wiki/Property:P2043,length (Roman miles),27,http://www.wikidata.org/entity/Q2118176,undated,,,parthey-pinder-1848,"p. 225, Wess. 473.3",,citesAsEvidence,,,,,"Written ""mpm XXVII"". As Iter III gives it."
leg-durobrivae-durovernum,https://www.wikidata.org/wiki/Property:P2043,length (Roman miles),25,http://www.wikidata.org/entity/Q2118176,undated,,,parthey-pinder-1848,"p. 225, Wess. 473.4",,citesAsEvidence,,,,,"Written ""mpm XXV"". As Iter III gives it."
leg-durovernum-dubris,https://www.wikidata.org/wiki/Property:P2043,length (Roman miles),14,http://www.wikidata.org/entity/Q2118176,undated,,,parthey-pinder-1848,"p. 225, Wess. 473.5",,citesAsEvidence,,,,,"Written ""mpm XIIII"". As Iter III gives it."
…
iter-iii,https://www.wikidata.org/wiki/Property:P2043,length (Roman miles),66,http://www.wikidata.org/entity/Q2118176,undated,,,parthey-pinder-1848,"p. 225, Wess. 473.2",,citesAsEvidence,,,,,"Written ""mpm LXVI sic"". The stated total of the route; its three legs add up to it."
…
```

The value is a number and the unit is Wikidata's Roman mile, so software can convert it; the notes
keep the numeral as printed. Each road's length is entered once for each iter that states it. The
iter's stated total is entered too, on the route, as the edition prints it (*sic*), not corrected
and not replaced by the sum of the legs.
From PLATO's worked example [the Antonine Itinerary](https://pelagios.org/place-attestation-ontology/guide/routes/antonine.html).

### The connections sheet

Use the connections sheet when two places are connected by something that is only a relationship,
such as letters sent from one city to another, and your source gives a figure for it. Each row:

- joins `place_id` to `related_place_id` (both places from your places sheet; this sheet has no
  `related_uri`);
- says how, in `relation_type`: `ConnectedTo` (either way) or `LeadsTo` (one way, **from**
  `place_id` **to** `related_place_id`);
- gives **one** figure: `property_uri`, optionally `property_label`, `value` and `unit_uri`.

Several figures about one connection are several rows. A connection with no figure at all goes in
the relations sheet instead, as a `ConnectedTo` or `LeadsTo` row.

If your sources each give one direction of a two-way connection, enter two `LeadsTo` rows, each
with its own source, rather than one `ConnectedTo`.

```csv
place_id,relation_type,related_place_id,property_uri,property_label,value,unit_uri,date,from,to,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
florence,LeadsTo,pisa,https://www.wikidata.org/wiki/Property:P1114,letters sent,16261,,1355-1402,1355,1402,letters-by-pair,FIRENZE to PISA,,citesAsDataSource,,,,,Every letter the dataset records from FIRENZE to PISA. The dates are the years of sending as the dataset gives them.
florence,LeadsTo,pisa,https://www.wikidata.org/wiki/Property:P2047,median delivery time (days),2,http://www.wikidata.org/entity/Q573,1355-1402,1355,1402,letters-by-pair,FIRENZE to PISA,,citesAsDataSource,,,,,"The median of arrival date minus sending date, over the 13555 letters with both dates and a delay of 0 to 365 days. The mean is not given: impossible delays in the records move it too far."
pisa,LeadsTo,florence,https://www.wikidata.org/wiki/Property:P1114,letters sent,6414,,1379-1413,1379,1413,letters-by-pair,PISA to FIRENZE,,citesAsDataSource,,,,,Every letter the dataset records from PISA to FIRENZE. The dates are the years of sending as the dataset gives them.
pisa,LeadsTo,florence,https://www.wikidata.org/wiki/Property:P2047,median delivery time (days),2,http://www.wikidata.org/entity/Q573,1379-1413,1379,1413,letters-by-pair,PISA to FIRENZE,,citesAsDataSource,,,,,"The median of arrival date minus sending date, over the 4933 letters with both dates and a delay of 0 to 365 days. The mean is not given: impossible delays in the records move it too far."
…
```

Letters went both ways between Florence and Pisa, but not equally, so each direction is its own
`LeadsTo` with its own figures, and each figure is its own row.

These counts and medians were worked out from a dataset of letters, not read from a source. They are
still entered as attested figures, not as computed ones: the work that produced them is a source of
its own, `derived_from` the dataset, and every connections row cites it.

```csv
source_id,title,citation,uri,date,from,to,derived_from,licence
…
letters-by-pair,Letters and delivery times by pair of cities,"Counts of letters, and median delivery times, for pairs of cities, worked out for this example on 29 September 2026 from the Datini Correspondence Metadata",,2026,2026,2026,datini-metadata,https://creativecommons.org/licenses/by/4.0/
```

From PLATO's worked example [the Datini letters](https://pelagios.org/place-attestation-ontology/guide/routes/datini.html).

---

## Step 8: Check and load your tables

Check your tables before you load them. The PLATO tools check a folder of CSV files, a zip of them,
or the workbook, and report every missing value, unknown identifier and value that is not allowed,
with its row and column:

```bash
npx github:pelagios/plato-tools check my-tables/
```

The [PLATO tools](https://pelagios.org/plato-tools/) also run in the browser. The table definitions
are published as CSV on the Web, so any CSVW validator can check the tables too.

% TODO(release): describe how the checked tables are loaded into WHG v4 (upload page, reconciliation of stations
% against existing places), with screenshots.

---

## What WHG shows

% TODO(release): screenshots of the route page and of a station's page, once built.

- **The route** is drawn through its stations in sequence order. The line, and the route's overall
  extent, are **computed** by WHG: worked out from the other rows, so that anyone holding them could
  work them out again. They are shown, and exported marked `computed`, but they are not evidence and
  are not taken back in on import. (A figure you work out from your own source material, such as a
  count of letters, is different: enter it as attested, citing your working as a source; see
  [the connections sheet](#the-connections-sheet).)
- **Each station's page** lists the routes it is on, with its position and neighbours in each.
- **Legs** do not appear in lists of places.

---

## Variation: an itinerary

An itinerary uses the same sheets, with two differences:

- its Type names the kind `https://w3id.org/plato#TypeItinerary`;
- each stop's `MemberOf` row carries the **stay**, from arrival to departure, in `from` and `to`
  (with the source's wording in `date`), and its length in `duration` where the source states one.

If the source gives only dates and no order, you may leave `sequence` empty and let the dates order
the stops. Do not enter an overall span for the journey that you have worked out from the stays: WHG
computes it from them. Enter one only if a source gives it.

A journey is always an itinerary with members. It is not entered with the relation types for
people's lives (`ResidenceOf` and the like).

```csv
place_id,relation_type,related_place_id,related_uri,related_label,sequence,date,from,to,duration,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
windsor,MemberOf,itinerary-1215,,,1,from the 1st to the 3d of June 1215,1215-06-01,1215-06-03,,hardy-1835,p. 108,,citesAsEvidence,,,,,
…
windsor,MemberOf,itinerary-1215,,,6,until the 15th,1215-06-09,1215-06-15,,hardy-1835,p. 108,,citesAsEvidence,,,,,"""whence he returned to Windsor, and continued there until the 15th""."
runnymede,MemberOf,itinerary-1215,,,7,the 15th,1215-06-15,1215-06-15,,hardy-1835,p. 108,,citesAsEvidence,,,,,"""on that day he met the barons at Runnemead by appointment, and there sealed the great charter""."
windsor,MemberOf,itinerary-1215,,,8,until the 18th of June,1215-06-15,1215-06-18,,hardy-1835,p. 108,,citesAsEvidence,,,,,"""The King then returned to Windsor, and remained there until the 18th of June""."
windsor,MemberOf,itinerary-1215,,,9,did not finally leave Windsor and its vicinity before the 26th,1215-06-18,1215-06-26,,hardy-1835,p. 108,,citesAsEvidence,,,,,"From the 18th to the 23rd he was ""every day both at Windsor and at Runnemead""; see the Runnymede row without a sequence."
runnymede,MemberOf,itinerary-1215,,,,from which time until the 23d,1215-06-18,1215-06-23,,hardy-1835,p. 108,,citesAsEvidence,,,,,"""every day both at Windsor and at Runnemead"": no sequence, because the source puts neither before the other; the timespans say when."
…
marlborough,MemberOf,itinerary-1215,,,12,the first four days of July,1215-07-01,1215-07-04,P4D,hardy-1835,p. 109,,citesAsEvidence,,,,,"""The first four days of July he passed at Marlborough"": a length the source states, with its dates."
…
oxford,MemberOf,itinerary-1215,,,25,the 17th of that month,1215-07-17,,,hardy-1835,p. 109,,citesAsEvidence,,,,,"""and thence to Oxford, where he arrived on the 17th of that month"". Only his arrival is given, so to is left empty."
isle-of-wight,MemberOf,itinerary-1215,,,,then,1215-06-15,1215-07-17,,hardy-1835,pp. 109-110,,citesAsEvidence,,,yes,,"""The statement of historians that John went to the Isle of Wight immediately after signing Magna Carta is thus clearly shown to be erroneous, as it is unquestionable that the King did not then visit the Isle of Wight""."
```

- **The source's wording** goes in `date` ("until the 18th of June"), the days in `from` and `to`.
- **A place visited more than once is a member more than once.** Windsor is stop 1, 6, 8 and 9, each
  with its own stay.
- **No sequence where the source gives no order.** From the 18th to the 23rd the King was "every day
  both at Windsor and at Runnemead", so that Runnymede row has no `sequence`; its dates say when.
- **A length of stay** goes in `duration`: Marlborough, "the first four days of July", has `from`,
  `to` and `P4D`. Use it where the source says how long, which is what marks an extended stay
  rather than a stop in passing; a length given with no dates ("where I stayed six weeks", `P42D`,
  weeks written as days) can stand alone.
- **An arrival with no departure** has `from` and no `to`, as for Oxford, the last stop.
- **A stop the source denies** is a row with `denied` set to `yes`: Hardy says the King did not then
  visit the Isle of Wight.

Where Hardy gives no date for a stop the King passed through, the example puts `undated` in `date`
and the dates of the stops either side in `from` and `to`, and says so in `notes`. That is not a
guess: `from` and `to` are the earliest and latest dates a row can refer to, and the source's own
order puts the stop between its neighbours, which is what licenses those bounds. A stop can also be
a member with no location at all, as Merton is: Hardy does not say which Merton.
From PLATO's worked example [King John in 1215](https://pelagios.org/place-attestation-ontology/guide/routes/king-john.html).

---

## Variation: a network

A network's members are `MemberOf` the network, usually with no `sequence` (where the source does
order them, as a river's reaches run downstream, give it). Then:

- for a **physical** network (a river system, a canal network), enter each reach or cut as a place
  typed `TypeSegment`, with its ends (`BeginsAt`/`EndsAt`, or two `HasEnd`) in the relations sheet
  and its figures in the properties sheet, exactly as the legs above;
- for a **relational** network (a correspondence network), enter each link in the connections sheet
  (with figures) or the relations sheet (without).

The relations and connections sheets take only PLATO's own relation types. A project's own kind of
connection ("flows into") is declared in PLATO JSON, in the document's `relationTypes`, with `LeadsTo`
as its `broaderRelation`; in the sheets, use `LeadsTo` itself, as the River Idle example does.

The River Idle example records the lower Idle, from REWT (Rivers of England and Wales, Temporally), as
a network of ten reaches, numbered downstream. One reach and the two junctions at its ends:

```csv
place_id,label,country_codes
…
node-03,River Idle: junction with the River Ryton,GB
node-04,River Idle: junction with an unnamed channel,GB
…
reach-04,"River Idle, reach 4 of 10",GB
…
```

```csv
place_id,type_label,type_uri,type_scheme,type_scheme_version,date,from,to,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
…
reach-04,segment,https://w3id.org/plato#TypeSegment,,,undated,,,rewt-v020,os:link/69644DBA-6A53-4C18-8F60-4BB916A36F57,,citesAsDataSource,,,,,
…
```

```csv
place_id,relation_type,related_place_id,related_uri,related_label,sequence,date,from,to,duration,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
…
reach-04,MemberOf,river-idle,,,4,undated,,,,rewt-v020,os:link/69644DBA-6A53-4C18-8F60-4BB916A36F57,,citesAsDataSource,,,,,
reach-04,BeginsAt,node-03,,,,undated,,,,rewt-v020,os:link/69644DBA-6A53-4C18-8F60-4BB916A36F57 from_node,,citesAsDataSource,,,,,
reach-04,EndsAt,node-04,,,,undated,,,,rewt-v020,os:link/69644DBA-6A53-4C18-8F60-4BB916A36F57 to_node,,citesAsDataSource,,,,,
…
river-ryton,LeadsTo,river-idle,,,,undated,,,,rewt-v020,"link 53DEF62E, to_node 69D120BE",,citesAsDataSource,,,,,"The River Ryton flows into the Idle at node-03. Rivers are places, joined by LeadsTo; reaches are segments, joined to their ends by BeginsAt and EndsAt."
river-idle,LeadsTo,river-trent,,,,undated,,,,rewt-v020,node C7DF9A14,,citesAsDataSource,,,,,"Through Bycarrs Dyke, into the tidal Trent at node-10."
```

```csv
place_id,property_uri,property_label,value,unit_uri,date,from,to,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
…
reach-04,https://www.wikidata.org/wiki/Property:P2043,length (metres),518.2,http://www.wikidata.org/entity/Q11573,undated,,,rewt-v020,os:link/69644DBA-6A53-4C18-8F60-4BB916A36F57 length_m,,citesAsDataSource,,,,,
…
```

The reach `BeginsAt` the junction it leaves and `EndsAt` the one it reaches, in the direction the
water flows. The last two relations rows join rivers to rivers with `LeadsTo`: rivers are places, so
they are joined directly, while the reaches are segments and never take `LeadsTo`.
From PLATO's worked example [the lower River Idle](https://pelagios.org/place-attestation-ontology/guide/routes/river-idle.html).

The Datini example is a relational network: eight cities, each `MemberOf` the network with no
`sequence`, and eleven directed connections between them in the connections sheet.

```csv
place_id,relation_type,related_place_id,related_uri,related_label,sequence,date,from,to,duration,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
florence,MemberOf,datini-network,,,,undated,,,,datini-metadata,,,citesAsDataSource,,,,,"Nothing in the letters puts the cities in an order, so no sequence."
pisa,MemberOf,datini-network,,,,undated,,,,datini-metadata,,,citesAsDataSource,,,,,"Nothing in the letters puts the cities in an order, so no sequence."
…
```

```csv
place_id,relation_type,related_place_id,property_uri,property_label,value,unit_uri,date,from,to,source_id,locator,attribution,citation_function,certainty,certainty_level,denied,stance,notes
…
barcelona,LeadsTo,valencia,https://www.wikidata.org/wiki/Property:P1114,letters sent,3551,,1386-1419,1386,1419,letters-by-pair,BARCELLONA to VALENZA,,citesAsDataSource,,,,,Every letter the dataset records from BARCELLONA to VALENZA. The dates are the years of sending as the dataset gives them.
barcelona,LeadsTo,valencia,https://www.wikidata.org/wiki/Property:P2047,median delivery time (days),7,http://www.wikidata.org/entity/Q573,1386-1419,1386,1419,letters-by-pair,BARCELLONA to VALENZA,,citesAsDataSource,,,,,"The median of arrival date minus sending date, over the 2882 letters with both dates and a delay of 0 to 365 days. The mean is not given: impossible delays in the records move it too far."
valencia,LeadsTo,barcelona,https://www.wikidata.org/wiki/Property:P1114,letters sent,2841,,1382-1411,1382,1411,letters-by-pair,VALENZA to BARCELLONA,,citesAsDataSource,,,,,Every letter the dataset records from VALENZA to BARCELLONA. The dates are the years of sending as the dataset gives them.
valencia,LeadsTo,barcelona,https://www.wikidata.org/wiki/Property:P2047,median delivery time (days),7,http://www.wikidata.org/entity/Q573,1382-1411,1382,1411,letters-by-pair,VALENZA to BARCELLONA,,citesAsDataSource,,,,,"The median of arrival date minus sending date, over the 2211 letters with both dates and a delay of 0 to 365 days. The mean is not given: impossible delays in the records move it too far."
barcelona,LeadsTo,palma,https://www.wikidata.org/wiki/Property:P1114,letters sent,3193,,1394-1411,1394,1411,letters-by-pair,BARCELLONA to MAIORCA,,citesAsDataSource,,,,,Every letter the dataset records from BARCELLONA to MAIORCA. The dates are the years of sending as the dataset gives them.
barcelona,LeadsTo,palma,https://www.wikidata.org/wiki/Property:P2047,median delivery time (days),5,http://www.wikidata.org/entity/Q573,1394-1411,1394,1411,letters-by-pair,BARCELLONA to MAIORCA,,citesAsDataSource,,,,,"The median of arrival date minus sending date, over the 2947 letters with both dates and a delay of 0 to 365 days. The mean is not given: impossible delays in the records move it too far."
…
```

From PLATO's worked example [the Datini letters](https://pelagios.org/place-attestation-ontology/guide/routes/datini.html).

---

## Places in other histories

The relations sheet can also say that a place was where a person was born, an object was found or
an event took place. Such a row puts the person, object or event's web address in `related_uri`,
leaves `related_place_id` empty, and names it in `related_label`, with one of `BirthplaceOf`,
`DeathplaceOf`, `ResidenceOf`, `FindspotOf`, `SettingOf` or `WorkplaceOf`. In the same way, a
photograph, map or drawing that shows the place takes `DepictedIn`, and an archival file, report or
publication about it takes `SubjectOf` (both new in PLATO 0.7.0). WHG shows these apart
from a place's spatial relations. They are not how a route or journey is entered.

---

## Common mistakes

| Mistake | Instead |
|---|---|
| Putting `sequence` on the route's own row | Put it on each station's `MemberOf` row |
| Filling in both `related_place_id` and `related_uri` | Fill in exactly one |
| Joining a leg to its ends with `ConnectedTo` | Use `BeginsAt`/`EndsAt`, or two `HasEnd` |
| Two figures in one connections row | One figure per row |
| A figure for a leg in the connections sheet | If the leg is a place (a segment), use the properties sheet |
| Guessing a sequence number the source does not give | Leave it empty |
| Entering a route line, or an itinerary's span, that you worked out from your own rows | Leave it out: WHG computes it |
| Writing the direction in `notes` | Use `LeadsTo` (one way) or `ConnectedTo` (either way) between places, and `BeginsAt`/`EndsAt` (or two `HasEnd`) for a leg; `notes` may explain, but never carries, the direction |

---

## Next steps

% TODO(0.7.0-doi): add the 0.7.0 version DOI

- [Routes, Itineraries, Networks, Groups and Periods](../data-model/patterns.md): the model in
  full, with diagrams.
- [PLATO 0.7.0](https://github.com/pelagios/place-attestation-ontology/releases/tag/v0.7.0)
  ([doi:10.5281/zenodo.21688313](https://doi.org/10.5281/zenodo.21688313), the DOI for PLATO, all
  versions): the ontology, the spreadsheet
  table definitions and the examples.
