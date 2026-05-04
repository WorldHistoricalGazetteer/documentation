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
| **daily_count** | Read-only. Number of API calls made today. Resets automatically at midnight UTC. |
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

The new limit takes effect immediately on the user's next API call.
Counters do not reset when the limit changes — if the user has already
hit today's old limit, they'll need to wait until the daily reset (UTC
midnight) before any new calls go through, even with a raised ceiling.

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
