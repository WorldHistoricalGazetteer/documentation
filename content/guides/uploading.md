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
