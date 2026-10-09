# Restarting the gateway

The WHG gateway is the indexing service on the Pitt CRC cluster that answers search, reconciliation and
place lookups for the website. Restarting it is how new gateway code goes live. This page covers a
restart that ships new code; for the re-ingestion jobs that the Gazetteer Configurator starts, see
{doc}`./gazetteer-configurator`.

## What a restart does

`gateway-restart` (run through the `gaz_run.sh` wrapper in the indexing repository) does three things in
order:

1. **Pulls** the latest `main` with `git pull --ff-only`, while the old gateway keeps serving. A pull
   does not affect a running process.
2. **Stops** the gateway.
3. **Starts** it, so the new code is loaded.

The wrapper runs the restart as the `gazetteer` service account. That account already holds a read-only
deploy key for the repository, so the pull needs no credentials from you.

```{warning}
**A failed pull does not stop the restart.** By design, if the pull fails the script prints a warning
and restarts on the code that is already checked out. That is safe (`--ff-only` leaves the clone
unchanged on failure), but a restart meant to ship new code can then succeed while serving the old
code. The warning is easy to miss in tool output.
```

## Check what is actually running

After every restart that was meant to ship code, compare the running commit with `origin/main`. Do not
rely on the restart reporting success.

1. In the gateway clone, read the checked-out commit: `git rev-parse --short HEAD`.
2. Read the remote head: `git ls-remote origin main`.
3. The two must match (compare the leading characters). If they differ, the gateway restarted on old
   code. Investigate the pull rather than restarting again.

Because the restart reloads whatever is checked out, a matching `HEAD` taken after the restart is
evidence of the code the gateway started with.

## If the pull fails

- **Test the pull as `gazetteer`, not as your own login.** `gateway_ctl.sh pull`, run as `gazetteer`, is
  exactly the step the restart runs. A pull that fails when run as another user (for example your own
  CRC account, which may have no key registered with GitHub) proves nothing about the restart, because the restart
  never runs as that user.
- Run through `gaz_run.sh gateway-restart`, the restart is already `gazetteer`'s. Use the wrapper rather
  than invoking the control script by hand.
- If `gazetteer` itself cannot pull, ask an indexing-side administrator. Do not add or move deploy
  keys yourself.

```{note}
Printing the running commit next to `origin/main` automatically, at the end of a restart, is tracked as
[place#318](https://github.com/WorldHistoricalGazetteer/place/issues/318). Until it is done, make the
check above by hand.
```

## Checking Atlas before and after a deploy

The `whg3` repository has a headless smoke test of the Atlas page. Run it before and after a deploy:

```
python3 scripts/atlas_smoke.py <base>
python3 scripts/atlas_smoke.py <base> --prove-it-fails
```

`<base>` is the site to test (for example the dev or production address). It runs anonymously in its own
browser, never your own. `--prove-it-fails` runs a deliberately broken check to show the harness can fail,
so a green result means something.
