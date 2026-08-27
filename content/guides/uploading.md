# Uploading data to World Historical Gazetteer

## Choosing an upload data format: LPF or LP-TSV?

World Historical Gazetteer supports uploads of both Linked Places format (
LPF; [v1.2.2 specification](https://github.com/LinkedPasts/linked-places)) and its delimited
file derivative, LP‑TSV, which is more useful for relatively simple
data ([v0.5 specification](https://github.com/LinkedPasts/linked-places/blob/master/tsv_0.5.md)). In both cases, some
level of transformation has to happen between your source data and the chosen format. Both formats require that there be
one
record per place. The main distinctions can be summarized this way:

* LPF is JSON-based and supports both temporal scoping and citations for individual place names, geometries, types, and
  relations within a single place record;
* LP-TSV is a delimited file format — either a spreadsheet or a text file in CSV or TSV format. Although it can handle
  multiple name variants and place types in a single column, it can have only one geometry per place, and citation is
  possible only for the principal name ('title').

Choose LPF if:

* You have multiple names, types, geometries, or relations for a single place that are temporally scoped; i.e. any of
  these attributes are associated in your data with a given year, timespan, or period—and you want that represented in
  your WHG representation;
* You wish to include citations per name, type, geometry, or timespan.

Choose LP-TSV if:

* You have a single year or timespan that applies to the entire record (start/end or attestation year).
* Your name variants and place types can be listed in a single column, e.g. this way: "name1;name2"

## Preparing data for upload


### The simple case

If you have a list of distinct places with a name or names and basic attributes of the place, like coordinates, and
place type in a spreadsheet, database table, etc., the task of preparing an upload file for WHG is straightforward. In
almost all cases your format choice will be LP-TSV, and you can copy/paste columns from your file into WHG's [LP-TSV
spreadsheet template](https://github.com/LinkedPasts/linked-places-format/raw/main/LP-TSV_template.xlsx), as explained
in the file itself. See also, "Quick Start" on the "[Upload dataset](https://whgazetteer.org/datasets/validate/)" page.

**NOTE: Please do not use Notepad to edit TSV files, because it will not handle the tab characters correctly. Use a
dedicated spreadsheet program like Excel, Google Sheets, or LibreOffice Calc.**

### The not so simple case: extracting places

However, the data for most spatial historical projects is not only about places or locations, but principally about
events or artifacts for which location is an important dimension.

Both LPF and LP-TSV require that there be one record per place. But for many projects, a single place can have multiple
rows in a spreadsheet, or multiple features in a shapefile—each recording for example a change in some attribute at a
given time. For this reason, data often takes the form of one row per event, or artifact, or observation of some kind,
with a column for place name, and/or for latitude and longitude. In this case location information is often repeated on
each row that is about that event, or artifact, etc. **The task is to extract the distinct places, into a separate
places-only table or worksheet.**

Conflating multiple place references to a single place record often requires disambiguation or normalization, with
several kinds of decisions only the data creator can make, e.g.:

* Do two different names actually refer to the same place?
* Are an archaeological site and a modern city with the same name the same place?
* If there are multiple name variants, which should be the primary "title" of the record?
* If some references are at the scale of settlement and others at the scale of county, should they be normalized to
  county for purposes of analysis?

### Linked Places format (LPF), a GeoJSON extension

Apart from conflating multiple place references to a single place record, converting data from a delimited format like a
spreadsheet or shapefile attribute table to the JSON-base LPF will almost certainly require a script—using e.g. Python
or SQL if a database is involved. A how-to for this is beyond the scope of this document, but
this [CSV > JSON](https://csvjson.com/csv2json) tool
demonstrates how this will look, and a web search will locate other tools that may help.

## Getting the LP-TSV columns right

Most LP-TSV columns are self-explanatory, and the [spreadsheet
template](https://github.com/LinkedPasts/linked-places-format/raw/main/LP-TSV_template.xlsx) explains each
one. Three groups repay a closer look, because getting them wrong is easy and the consequences are not
always obvious in the finished dataset.

### Coordinates: `lon` and `lat`

Coordinates are decimal degrees in WGS84 (EPSG:4326) — `lon` between -180 and 180, `lat` between -90 and
90. A place may have no coordinates at all; what it may not have is one of the pair without the other.

```{warning}
**Check your spreadsheet's locale before you export.** If your system uses a decimal comma, Excel may
write `-8,518098`, and on a round-trip it can reinterpret those commas as thousands separators and hand
you `-8,518,098`. Neither is a coordinate. Set the export to use a decimal point, or check the exported
file in a text editor before uploading.
```

Validation reads the pair together and tells you what it did with it:

* an unambiguous locale artefact is **repaired and listed as a fix** — `-8,518,098` has exactly one
  reading that is a coordinate at all, so it is read as `-8.518098`. Where more than one reading is
  possible, the row is rejected rather than guessed at;
* a value that cannot be read as a number, a value outside the valid range, and a row with only one of
  the pair are all **rejected as errors**, naming the column and the offending value;
* **transposed `lon` and `lat` are detected and swapped.** A latitude outside ±90 that is a valid
  longitude can only be the columns the wrong way round. Where both values are valid latitudes the swap
  is ambiguous, and the row's `ccodes` decide it: if the point as given falls outside that country and
  the swapped point falls inside it, the columns are swapped and the repair is reported.

The validation report also shows how many rows will end up with **no location** — worth reading even
when there are no errors, because a place with no geometry is easy to miss on the map preview.

```{note}
A `geowkt` value supersedes `lon`/`lat` entirely. If you supply both, the WKT geometry wins and problems
with the coordinate columns are ignored.
```

### Place types: `types` and `aat_types`

`types` holds your own type labels and `aat_types` holds [Getty AAT](https://www.getty.edu/research/tools/vocabularies/aat/)
concept IDs. Both are semicolon-separated, and the two columns are paired **positionally**: the first
`aat_types` value belongs to the first `types` value, and so on.

You may supply fewer `aat_types` than `types`, or none at all — a label with no AAT concept behind it is
perfectly valid, it simply contributes nothing to the derived feature classes below. Any AAT place-type
concept is accepted; WHG no longer restricts uploads to a small curated subset of terms.

### Feature classes: `fclasses`

Feature classes are the single-letter GeoNames classes used throughout WHG for filtering and search:

| Code | Meaning |
|---|---|
| `A` | Administrative divisions |
| `H` | Hydrographic features |
| `L` | Landscape, regions |
| `P` | Populated places (settlements) |
| `R` | Roads, routes, transportation |
| `S` | Sites (buildings, farms, small features) |
| `T` | Topographic features (terrain, elevation) |
| `U` | Undersea features |
| `V` | Vegetation, land cover |

WHG derives feature classes from your `aat_types`, and **merges** anything in your own `fclasses` column
with what it derived — the column adds to the result, it never replaces it. Supply `fclasses` when you
want to be sure of a particular class, and leave it empty when you are content with what the AAT concepts
imply.

```{note}
A single AAT concept can carry more than one feature class. *Cities* and *quilombos* each carry both `A`
and `P`, so a place typed with either is both an administrative division and a populated place, and will
be found by a filter on either. Around 600 of the AAT place-type concepts behave this way.
```

Feature classes are worth getting right because they drive filtering in search and reconciliation: a
settlement that carries no `P` will not be found by anyone filtering for populated places.

### Updating a dataset

All of the above applies equally when you re-upload a corrected file to update an existing dataset: the
coordinate columns are re-checked and the type columns are re-read, so a correction to any of them takes
effect. Re-check your feature classes after an update all the same — an update rebuilds a place's types
from the file, so a column you dropped from the new file is a column you have removed from the dataset.
