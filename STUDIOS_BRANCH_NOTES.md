# Branch Analysis — Galileyo next-frontend

Based on inspecting the three zip files you uploaded (main, development, production), here's what I found and what you need to verify before pushing anything.

## Route count by branch

| Branch | Routes under `(app)` | Feature completeness |
|---|---|---|
| **main** | 34 | Most complete — includes analytics, chat, creator dashboards, dashboards, friends, holiday-promo, home2, influencer, members, my-feeds, partners, payment, search, videos, etc. |
| **production** | 23 | Mid-tier — missing some recent features |
| **development** | 13 | Least complete — only basics (alerts-map, blog, contact, dashboard, faq, home, login, page, privacy-policy, profile, sign-up, terms-of-service) |

## Why this matters

This is the **opposite** of the typical convention. Normally `development` is ahead of `main`, and `main` is ahead of `production`. Here, `main` has the most features.

**Possible explanations:**

1. The `development` branch is stale and hasn't been updated in a long time (the team forgot about it or stopped using it).
2. The `development` branch is intentionally a stripped-down "vanilla" branch where new isolated work happens, then gets selectively merged into `main`.
3. The branches are named confusingly and what you assumed (development = active work) is wrong.
4. The zips you uploaded are not representative of the current remote state and you have stale local copies.

## What to do (in order)

### Step 1 — Get on the actual remote and check dates

```bash
git fetch --all
git for-each-ref --sort=-committerdate refs/remotes/origin/ --format='%(committerdate:short) %(refname:short)'
```

This shows the last-update date of each branch. The branch with the most recent commits is almost certainly the active integration branch.

### Step 2 — Check the deployment configuration

```bash
# Look for CI/CD config
cat .github/workflows/*.yml | grep -A 5 "branches:"

# Look for Vercel/deployment hints
cat vercel.json 2>/dev/null
ls -la .github/workflows/
```

The deployment workflow files will tell you which branch deploys where. `next.galileyo` should map to whichever branch deploys to staging.

### Step 3 — Just ask Brett Miller

The fastest, cleanest path is asking him directly. The scope email already includes this question:

> I'm seeing three branches in the repo (main, development, production). Which one should I open PRs against, and which one is next.galileyo deploying from right now? I want to match your team's workflow exactly, not assume.

His answer trumps any analysis. Wait for it before pushing.

## My best guess (verify, don't trust)

Based on:
- `main` having the most features and most recent-looking code
- `production` being a strict subset of main
- `development` being significantly smaller

My best guess is the workflow is:
- **main** = the active integration branch where most PRs land
- **production** = what's currently deployed to the live galileyo.com
- **development** = a stale branch nobody uses anymore, possibly forgotten

If that guess is right, **you'd PR into `main`** and deploy your branch separately to `next.galileyo` for staging.

But this is a guess. Verify before committing.

## What changes if the branch answer changes

The Phase 1 and Phase 2 prompts I gave you don't depend on which branch you're on. The route paths, code, and structure are the same. What changes:

- **The base branch you fork from** (whatever Brett Miller confirms)
- **Where you open the PR** (same answer)
- **The `next.galileyo` deploy mechanism** (might be auto-deploy on push to a specific branch, might be manual)

All of that is metadata, not code. You can start the build work even before the branch question is answered — just branch off `main` for now, write the code, and rebase later if needed. Code is the same; routing is the same.

## Final note

Don't start with `development` just because Brett told you "development is where to work." The codebase evidence contradicts that. Verify with Brett Miller, then proceed with confidence.
