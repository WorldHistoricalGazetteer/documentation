# System Architecture

WHG v4 runs on the same platform as its predecessor, extended rather than replaced.

| Component | Role |
|---|---|
| **PostgreSQL / PostGIS** | store of record: accounts, datasets, collections, the attestation model, geometry |
| **Elasticsearch** (at Pitt CRC, behind WHG's gateway) | the ~47-million-record place index, search, phonetic (sounds-alike) matching |
| **Map tiles** | pre-generated vector tiles for gazetteer coverage and boundaries |
| **Django web application** | the website, Atlas, the Collaborative Workbench and the APIs |

The decision to keep this stack, rather than move to a graph database, is recorded in the database
assessment below, together with the measurements behind it.

```{toctree}
:maxdepth: 2

./architecture/database.md
```
