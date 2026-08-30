# User API Profiles

The **User API Profiles** admin page tracks per-user counters for the WHG
public API and lets staff adjust individual users' daily quotas — for
example, to support a researcher running a bulk reconciliation against
several thousand records.

## Where to find it

* Production: <https://whgazetteer.org/admin/api/userapiprofile/>
* Development: <https://dev.whgazetteer.org/admin/api/userapiprofile/>

It also appears under **API** → **User API profiles** on the admin index.

## What you'll see

One row per user who has used the API at least once. (Profiles are
created lazily on first use, so users who have never called the API
won't appear.) Columns:

| Column | Meaning |
|---|---|
| **user** | The Django user the profile belongs to. Click the username to open the user's profile in the auth admin. |
| **daily_count** | Read-only. Number of API calls made today. Rolls over automatically at midnight UTC, on the user's first call of the new day. |
| **daily_limit** | Editable. Maximum API calls per day for this user. Default is 5,000. |
| **total_count** | Read-only. Lifetime API call count for this user. |

## Common tasks

### Bumping a researcher's daily quota

A researcher needs more than the default 5,000 calls/day for a bulk
reconciliation:

1. Find the user in the list (**Search** by username or email at the top).
2. Click the row to open it (or use the inline-editable `daily_limit`
   column on the changelist).
3. Set `daily_limit` to the new ceiling — pick a number that comfortably
   covers the planned work. For one-off bulk jobs, double or triple the
   default is reasonable.
4. Click **Save**.

```{important}
**Check first whether the client is batching.** `POST /reconcile` accepts
50 queries per request and the quota is charged *per request*, so a
client sending one name per request burns fifty times the allowance it
needs. A job that looks like it needs 50,000 calls a day usually needs
1,000 and a fixed client.

The reconciliation log records the full payload of every call, so you
can see the shape of a user's requests directly: on the prod web
container, look for `POST /reconcile payload:` lines in
`/app/whg/logs/reconciliation.log`. If every request carries a single
query key, point the user at
[Batching, Quotas and Retries](../technical/apis.md#batching-quotas-and-retries)
before raising anything.
```

The new limit takes effect immediately on the user's next API call, and
that includes a user who has already hit the old ceiling: the check is
`daily_count` against the *current* `daily_limit`, so raising the limit
above the count restores access straight away. Changing the limit does
not reset `daily_count` — the user gets the difference, not a fresh
allowance.

```{note}
Before 30 August 2026 an account that reached its ceiling stayed locked
out indefinitely: the daily rollover only ran on a call that passed the
limit check, so `daily_count` was never cleared and the "daily" cap
became permanent. That is fixed. If you are looking at a profile whose
`daily_reset` predates that date, the stale counter is a leftover of the
bug and can simply be cleared.
```

### Resetting a user's counter

There's no "reset" button by design — `daily_count` resets automatically
at UTC midnight. If you absolutely need to clear it earlier, ask a
superuser to run `UserAPIProfile.objects.filter(user__username='…').update(daily_count=0)`
in the Django shell. Don't do this routinely; raising `daily_limit`
is almost always the right answer.

### Investigating heavy usage

Sort the changelist by **total_count** (descending) to see who has hit
the API hardest over the lifetime of their account. The current
**daily_count** column shows today's activity. Spikes that look out of
character — say, a normally light user suddenly at 4,800 against the
default 5,000 — are worth a quick check before quotas trigger.

## Permissions

Staff access is sufficient to view and edit `daily_limit`. The other
fields are read-only for everyone.
