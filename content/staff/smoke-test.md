# Site smoke test (post-deploy / post-upgrade validation)

The `whg3` repo ships a re-runnable smoke-test harness that confirms a
deployment has not broken the site. It is intended to be run **after any
dependency or framework upgrade** (for example the Django 4.2 LTS upgrade,
issue #119) and after significant deploys, on **dev before promoting to
production**.

The script lives at `server-admin/smoke_test.sh` in the `whg3` repository.

## What it checks

1. **Page sweep** — requests ~20 public pages (and, with a session cookie,
   the authenticated dashboard / profile / admin) and fails on any HTTP 5xx.
2. **API (DRF)** — confirms `/api/sources/`, `/api/attribution/`,
   `/api/place/<id>/` and `/api/area_list/` return `200` with the expected
   JSON.
3. **Container-side checks** (optional, `--deep`) — inside the running web
   container: the effective Django + upgraded-library versions, an
   Elasticsearch place-name search (returns hits), a PyJWT HS256 round-trip
   (the Workbench/Hocuspocus token path), and that the teaching-resources
   multi-file form renders.
4. **Full test suite** (optional, `--suite`) — runs `manage.py test` and
   compares the result to the documented baseline (117 tests; 6 failures /
   34 errors are all pre-existing stale-test / ES debt — anything *beyond*
   that is a regression to investigate).

The script exits `0` when everything passes and non-zero on any failure, so
it can also be wired into CI or a deploy step.

## Running it

From a checkout of `whg3` (needs `bash`, `curl`, `python3`; the deep checks
also need `ssh` access to the `whg` host):

```bash
# Public HTTP sweep only
server-admin/smoke_test.sh dev
server-admin/smoke_test.sh prod

# Include the authenticated-page sweep (log in via a browser first, then
# copy your sessionid / csrftoken cookies for the target host)
server-admin/smoke_test.sh dev --cookie "sessionid=…; csrftoken=…"

# Full validation: auth sweep + container-side checks over SSH
server-admin/smoke_test.sh dev --cookie "sessionid=…; csrftoken=…" --deep --ssh whg

# ...also run the full Django test suite (slower)
server-admin/smoke_test.sh dev --cookie "…" --deep --ssh whg --suite

# Arbitrary base URL (e.g. a local dev server)
server-admin/smoke_test.sh https://local.whgazetteer.org --cookie "…"
```

```{tip}
To get the cookie value: sign in through a browser, open the developer
tools → Application/Storage → Cookies for the target host, and copy the
`sessionid` (and `csrftoken`) values into the `--cookie` argument.
```

```{note}
The deep checks run an Elasticsearch place-name search against whichever
index the target is configured to use (`settings.ES_WHG`). The page-sweep
and API checks do not depend on the index.
```

## Dev shares the production Elasticsearch index

The **dev** environment has no populated index of its own, so it is
configured to read the **production** indexes (`ES_WHG=whg`, `ES_PUB=pub`)
— set in the dev context of `~/sites/env_template.py` on the host, so it
survives `load_env` / redeploys. This means search, Atlas, Gazetteers and
the reconciliation lookups on dev return real production data.

```{note}
Because dev points at the **live** production indexes, dev is configured to
treat Elasticsearch as **read-only**: `settings.ES_CONN` is wrapped in a guard
that lets reads (search, count, get) through but turns every *write* — indexing,
publishing, re-indexing, record-correction updates, index create/delete — into a
logged no-op. So publishing or re-indexing on dev cannot modify the production
search index (the action's database changes still happen on dev's own database;
only the ES write is skipped). The guard is keyed on `ENV_CONTEXT` +
`ES_WHG` (`whg`.settings) and is **inert on production**, which writes normally.
```

## Interpreting results

* **FAIL** — a 5xx page, a non-200/malformed API response, or a broken
  container-side check. Investigate before promoting.
* **WARN** — a non-fatal anomaly (e.g. the ES search returned zero hits
  because the target index is empty). Confirm it is expected.
* A clean run ends with `✅ smoke test passed` and exit code `0`.
