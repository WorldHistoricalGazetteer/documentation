# MCP Server (Model Context Protocol)

```{note}
Last verified 2026-11-18 against server version 0.2.3.
```

WHG runs a small, read-only [Model Context Protocol](https://modelcontextprotocol.io/) (MCP) server.
It lets an AI assistant, or any other MCP client, search WHG's public place data and fetch full place
records, with the attribution and licence terms of each source attached to what comes back.

It is meant for people who use an AI assistant and want it to look places up in WHG directly rather
than guess. It is not a replacement for the [Entity API or the Reconciliation API](apis.md): it is a
thin, deliberately limited layer over them, sized for occasional interactive lookups. For bulk work,
use those APIs with your own token.

## Status

- **Experimental.** Tool names, parameters and limits may change.
- **Read-only.** No tool can create, change or delete anything in WHG.
- **Anonymous.** No WHG account, API token or key is needed to use it, and the server never asks for
  one.
- **Live since 2026-11-18.**
- **Public data only.** It reads WHG through an ordinary, non-staff service account with no datasets or
  groups of its own, so it sees what any member of the public would see.

## Endpoint

```text
https://mcp.whgazetteer.org/
```

The server speaks MCP's **streamable HTTP** transport at the root path (`/`). It is stateless and
answers with plain JSON (`Content-Type: application/json`), not an event stream, so no session needs
to be opened or kept alive.

## Connecting a client

Any MCP client that supports remote servers over streamable HTTP can connect. No authentication
step is needed.

### Claude Code

```bash
claude mcp add --transport http whg https://mcp.whgazetteer.org/
```

`whg` is the local name for the server and can be anything. Add `--scope user` to make it available in
all your projects, or `--scope project` to record it in the project's `.mcp.json`.

### Claude Desktop and claude.ai

Remote servers are added as a custom connector rather than in a configuration file: **Settings →
Connectors → Add → Add custom connector**, then enter `https://mcp.whgazetteer.org/` as the URL.

### Other clients

Configuration formats differ between clients. Many use a JSON block of this shape; the one below is
the form Claude Code uses in `.mcp.json`. Check your client's documentation for the exact field names
(some use `streamable-http` as the `type`, or a different key for the URL).

```json
{
  "mcpServers": {
    "whg": {
      "type": "http",
      "url": "https://mcp.whgazetteer.org/"
    }
  }
}
```

### Checking the connection by hand

The server can be called directly with `curl`. Both `Accept` values are required by the transport.

```bash
curl -s https://mcp.whgazetteer.org/ \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

Calling a tool:

```bash
curl -s https://mcp.whgazetteer.org/ \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"status","arguments":{}}}'
```

The `serverInfo.version` in the `initialize` answer is the version of the MCP software library the
server is built on, not the server's own version. Use the `status` tool for that.

## Tools

There are seven tools. Each returns a JSON object, sent as the text of a single MCP `text` content
item. Parameters outside the stated ranges are rejected before anything is sent to WHG, except
`limit`, which is clamped to 1–50.

### `search_places`

Search places by name, with optional filters. This runs one query against WHG's
[Reconciliation API](apis.md#reconciliation-service-api).

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `name` | string, at most 200 characters | none | Name to match. Fuzzy, ranked matching (the Reconciliation API's default mode). |
| `name_contains` | string, at most 200 characters | none | Matches names containing this text (the API's `in` mode). Used only when `name` is not given. |
| `ccode` | string | none | ISO 3166-1 alpha-2 country codes, comma-separated, e.g. `GB,IE`. |
| `fclass` | string | none | Feature class letters, comma-separated, e.g. `P` or `A,P`. In practice this also restricts results to GeoNames: see [Filter Behaviour and Common Pitfalls](apis.md#filter-behaviour-and-common-pitfalls). |
| `aat_type` | string | none | AAT place type ids, comma-separated, e.g. `aat:300008347`. |
| `year` | integer, -10000 to 2100 | none | Keeps places whose dates do not rule out that year. Places with no dates at all are dropped. |
| `dataset` | integer | none | Restrict to one WHG dataset id. |
| `limit` | integer | 20 | 1–50. |

One of `name` or `name_contains` is required. `year` is sent as a one-year window (`start` and `end`
both set to that year) with the API's default `possibly` [temporal mode](apis.md#temporal-filtering).

Example, `{"name": "Lund", "ccode": "SE", "limit": 2}`, shortened:

```jsonrelaxed
{
  "results": [
    {
      "id": "place:osm:n7472552741",
      "name": "Lund",
      "score": 100,
      "match": true,
      "namespace": "osm",
      "alt_names": ["lund"],
      "ccodes": ["SE"],
      "repr_point": [14.598302, 59.168672],   // [lon, lat]
      "has_geom": false,
      "place_types": [{"identifier": "isolated_dwelling", "label": "osm"}],
      "confidence": 100.0
      // …
    }
    // …
  ],
  "namespaces_searched": ["osm", "whg"],
  "attribution": { "sources": { "osm": { … }, "whg": { … } }, … }
}
```

The fields of each candidate are those of a Reconciliation API result: see
[Result Format](apis.md#result-format) and [Interpreting `confidence`](apis.md#interpreting-confidence).

### `get_place`

Fetch full records, in Linked Places Format, from the [Entity API](apis.md#entity-api).

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `place_ids` | array of strings or integers, 1–10 items | required | A WHG number (`169687` or `"169687"`), or an id as `search_places` returns it (`"place:gn:745044"`, or without the `place:` prefix). |

Ids are de-duplicated and fetched one at a time, in the order given. The answer is
`{"places": [...]}`, plus `{"errors": [{"id": ..., "error": ...}]}` for any id that could not be
fetched; one failing id does not stop the others. A malformed id fails the whole call before anything
is fetched.

Each record keeps its own `attribution` object. A geometry larger than 20 kB is replaced by its type,
its bounding box (`[west, south, east, north]`) and a note saying the full geometry was omitted. The
full geometry can be fetched from the Entity API.

Example, `{"place_ids": ["place:gn:6515785"]}`, shortened:

```jsonrelaxed
{
  "places": [
    {
      "@id": "https://whgazetteer.org/entity/place:gn:6515785/api",
      "type": "Feature",
      "properties": {"title": "Grand Hotel - Lund", "ccodes": ["SE"], "source_id": "gn:6515785"},
      "names": [{"toponym": "Grand Hotel - Lund"}],
      "types": [{"identifier": "HTL", "label": "S", "sourceLabel": "S.HTL", "aat_ids": []}],
      "geometry": {"type": "Point", "coordinates": [13.18915, 55.70384]},
      "links": [], "descriptions": [], "depictions": [], "relations": [], "when": {},
      "attribution": {"id": "gn", "name": "GeoNames", "citation_text": "GeoNames geographical database, Unxos GmbH.", … }
    }
  ]
}
```

### `places_near`

Places whose representative point lies within a radius of a point, nearest first.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `lon` | number, -180 to 180 | required | Longitude of the centre. |
| `lat` | number, -90 to 90 | required | Latitude of the centre. |
| `km` | number, greater than 0, at most 100 | 25 | Radius in kilometres. |
| `limit` | integer | 20 | 1–50. |

How it works:

1. The server asks WHG for places inside the bounding box that encloses the circle. WHG returns **at
   most 50 candidates** for that box.
2. It computes the great-circle distance from the centre to each candidate's representative point
   (`repr_point`), keeps those within `km`, and sorts them nearest first. Candidates without a
   representative point are dropped.
3. It returns the first `limit` of them, each with an added `distance_km` (rounded to the metre).

Because the box holds at most 50 candidates, **in a dense area most places within the radius may not
be among them**. When WHG returns the full 50, the answer carries a `note` saying so; use a smaller
`km` to see more of what is close by. In a test on 2026-11-18, a 3 km radius in central Lund already
reached the cap.

Example, `{"lon": 13.19, "lat": 55.70, "km": 3, "limit": 3}`, shortened:

```jsonrelaxed
{
  "results": [
    {"id": "place:osm:r4055481", "name": "Södra innerstaden", "namespace": "osm",
     "repr_point": [13.184345, 55.698347], "distance_km": 0.399, … },
    {"id": "place:osm:n13018928457", "name": "Silversmeden 1927 - 1974", "distance_km": 0.404, … },
    {"id": "place:gn:6515785", "name": "Grand Hotel - Lund", "distance_km": 0.43, … }
  ],
  "namespaces_searched": ["gn", "osm", "whg"],
  "scope": {"requested": true, "applied": true, "mode": "geojson", … },
  "attribution": { … },
  "note": "WHG returned its maximum of 50 candidates for the box around this circle, so there may be more places within the radius: narrow `km` to see them."
}
```

In spatial results `score` is `0` and `match` is `false`: they are not name matches.

### `places_in_bbox`

Places whose geometry lies inside a bounding box.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `west` | number, -180 to 180 | required | |
| `south` | number, -90 to 90 | required | |
| `east` | number, -180 to 180 | required | Must not be less than `west`, so a box cannot cross the antimeridian. |
| `north` | number, -90 to 90 | required | Must not be less than `south`. |
| `limit` | integer | 20 | 1–50. |

The box may be at most 10 degrees wide and 10 degrees high. The answer has the same shape as
`search_places`.

### `list_sources`

No parameters. Returns WHG's list of source gazetteers (namespaces) as
[`GET /api/sources/`](apis.md#source-namespaces) gives it.

### `get_attribution`

Attribution and licence terms for what you are citing, from `GET /api/attribution/`.

| Parameter | Type | Default | Notes |
|---|---|---|---|
| `namespaces` | string | none | Source namespaces, comma-separated, e.g. `gn,wd`. |
| `place_ids` | array of integers, at most 50 | none | WHG numeric place ids. |

With neither parameter, only WHG's own overlay attribution is returned.

### `status`

No parameters. Returns the server's name and version, the WHG instance it reads from, and
`"read_only": true`. It makes no call to WHG.

## Attribution and licences

WHG's sources do not share one licence (see [Source Terms and Attribution](apis.md#source-terms-and-attribution)).
The server passes the terms through unchanged:

- `search_places`, `places_near` and `places_in_bbox` carry WHG's `attribution` block for the sources
  in the answer, and each result names its source in `namespace`.
- Each record from `get_place` carries its own `attribution` object.
- `get_attribution` gives the terms for any namespaces or place ids on request.

**If you reuse or quote place data obtained this way, cite its sources as their terms require.** The
server tells AI assistants this when they connect, but it cannot make them do it: check what your
assistant gives you before you publish it.

Some sources do not allow WHG to redistribute their records. A `get_place` request for such a place
comes back as an error for that id: *"This place's source does not allow WHG to redistribute it."*
This is WHG's [`451` answer](apis.md#when-a-source-does-not-permit-redistribution) and no credential
changes it. Search results show this in advance: the source's entry in the `attribution` block has
`"redistributable": false`.

## Limits

| Limit | Value |
|---|---|
| Results per search (`search_places`, `places_near`, `places_in_bbox`) | 1–50, default 20 |
| Candidates `places_near` considers per call | 50 |
| Ids per `get_place` call | 10 |
| Ids per `get_attribution` call | 50 |
| Bounding box | at most 10 × 10 degrees |
| Radius | at most 100 km |
| Name text | at most 200 characters |
| Any single answer from WHG | 1.5 MB |
| Geometry in a `get_place` record | 20 kB, then replaced by type and bounding box |
| Long text fields (names, descriptions, …) | cut at 2,000 characters, marked `…[truncated]` |
| Time allowed for each call to WHG | 30 seconds |
| Request rate, per client IP address (IPv6: per /64) | 30 per minute, with a burst of 20; at most 10 connections at once |
| Request size | 64 KB |
| Daily budget, shared by **all** callers | 2,000 calls to WHG per day, reset at 00:00 UTC |

The daily budget counts calls from the server to WHG, not calls to the server: a `get_place` request
for 10 ids uses 10, and `status` uses none.

## Errors

Errors are returned as an MCP tool result with `"isError": true` and a plain-language message. Rate
limiting and host checks happen before the server, as HTTP status codes.

| You see | Meaning | What to do |
|---|---|---|
| HTTP `429` | Your address exceeded the request rate or connection limit. | Slow down and retry. |
| *"This service's daily request allowance is used up; try again after 00:00 UTC."* | The shared daily budget is spent. | Try again after midnight UTC, or use WHG's APIs with your own token. |
| *"WHG's API quota for this service is exhausted; try again later."* | WHG's API refused the server's own account for quota. | Try again later. |
| *"WHG rejected this service's token. …"* | The server's own credentials failed upstream. Nothing you send can cause or fix this. | Report it (see [below](#reporting-problems)). |
| *"This place's source does not allow WHG to redistribute it."* | WHG's `451` for that place. | Obtain the record from the source under its own terms. |
| *"Not found."* | No such place id. | Check the id. |
| *"Not a WHG place id: …"* | The id has the wrong form. | Use a number or an id as search results give it. |
| *"Bounding box too large: …"*, *"east/north must not be less than west/south."* | `places_in_bbox` input outside the limits. | Use a smaller box. |
| *"Give at least `name` or `name_contains`."* | `search_places` was called without a name. | Add one. |
| *"WHG's answer is too large; …"* | WHG's answer exceeded 1.5 MB. | Ask for fewer results or fewer places. |
| *"WHG did not answer in time; …"*, *"Could not reach WHG."* | WHG was slow or unreachable. | Retry later. |
| `gateway_failure` and a `note` in an otherwise normal answer | WHG's gazetteer index did not answer that query. **An empty result here does not mean the place does not exist.** | Retry. |
| HTTP `421` or `403` | The request's `Host` or `Origin` header names another site. | Browser-based clients running on another website cannot call the server directly. |

## Differences from the legacy API endpoints

The server uses only `POST /reconcile`, `GET /entity/place:<id>/api`, `GET /api/sources/` and
`GET /api/attribution/`. It does not use the legacy `/api/db/`, `/api/index/`, `/api/place/`,
`/api/spatial/` or `/api/geojson/` endpoints. If you know those endpoints, note that:

- **Name search is fuzzy and ranked.** `/api/db/` matched names as case-insensitive substrings and did
  not rank them. Here, `name` is ranked fuzzy matching, and `name_contains` gives substring matching.
- **`year` keeps places whose dates do not rule out the year**, and drops places that have no dates.
- **There is no `collection` filter**, and the spatial tools have no feature-class or dataset filter.
- **`get_place` takes at most 10 ids** (the legacy endpoints allowed more), and returns Linked Places
  Format from the Entity API.
- **Results are capped at 50 per call**, against 200 for `/api/db/`.
- **Ids can be namespaced.** Results include places from source gazetteers (`place:gn:…`,
  `place:osm:…`), not only places in WHG datasets.

## Privacy and data handling

- **The server stores no user data.** It has no accounts, no sessions and no database. Each request
  is answered and forgotten.
- **What is logged.** The web server in front of it records, for each request: the client IP address,
  the time, the request line, the status code, the response size, the `User-Agent`, timings and
  whether a rate limit applied. It does not record request bodies, so tool arguments are not in that
  log. Logs are rotated in the usual way. The server's own process log records the kind of each MCP
  request and its status, not its arguments.
- **What reaches WHG.** The server calls WHG's public services with its own dedicated, non-staff
  service account, never with a caller's credentials. It does not pass on your IP address. WHG's
  own web server logs these calls like any other API request; they identify the service, not you.
- Treat what you type into a search as you would any query sent to a public web service: do not put
  personal information in it.

## Security

- **Read-only.** The server can make only four kinds of request to WHG, each checked against an exact
  list (method and path): `GET /api/sources/`, `GET /api/attribution/`, `GET /entity/place:<id>/api`
  and `POST /reconcile`, which is a search and writes nothing. Anything else is refused before it is
  sent. It follows no redirects.
- **Its credentials stay with it.** The service token is read from the server's environment, sent
  only to WHG, and never put in a log, an error message or a tool result. It is never accepted from a
  caller.
- **Untrusted text.** Place names, descriptions and links in results are contributed by third parties.
  An AI assistant should treat them as data, never as instructions, and the server tells connecting
  assistants so. If an assistant's behaviour changes after reading a result, treat that as a problem
  to report.

## Reporting problems

Report problems and feedback as a [GitHub Issue](https://github.com/WorldHistoricalGazetteer/place/issues),
as for any other part of WHG (see [Issues & Discussions](issues.md)). Please include the tool, the
arguments and the message you received, and the time (UTC).

## For developers

The source, deployment notes and tests are in the `mcp/` directory of the
[`feature/mcp-server` branch](https://github.com/WorldHistoricalGazetteer/website/tree/feature/mcp-server/mcp)
of the WHG website repository.
