# Brett's Cheat Sheet — Galileyo Studios Execution

**Purpose:** One-page action sheet to keep on screen while you execute. Everything you need in order.

---

## Right now (next 30 minutes)

1. **Send the scope email** — `STUDIOS_SCOPE_EMAIL.md`. Edit subject and contacts, send to Brett Miller.
2. **Confirm Stripe invoice processed** — verify the $1K landed.
3. **Clone the repo** — `git clone <galileyo-repo>` and `cd` into it.

## In the first hour

4. **Verify the branch situation.** Run:
   ```bash
   git fetch --all
   git log --oneline -10 origin/main
   git log --oneline -10 origin/development
   git log --oneline -10 origin/production
   git for-each-ref --sort=-committerdate refs/remotes/origin/ --format='%(committerdate:short) %(refname:short)'
   ```
   The most recently updated branch is your integration target. **Do not commit until Brett Miller confirms.**

5. **Drop the blueprint files into the repo** — at repo root:
   - `STUDIOS_BLUEPRINT.md`
   - `STUDIOS_PHASE_0_PROMPT.md`
   - `STUDIOS_PHASE_1_PROMPT.md`
   - `STUDIOS_PHASE_2_PROMPT.md`

   Commit them on a docs branch first if you want them in the repo before code starts, or keep them local-only and just reference them.

6. **Install local dev environment:**
   ```bash
   nvm use  # uses .nvmrc Node version
   pnpm install
   cp .env.example .env
   # Edit .env with the values Brett Miller provides (or use placeholders for Phase 1)
   pnpm dev:next
   ```
   Verify the app boots at localhost:3000.

## Hour 2 — Phase 0 discovery

7. **Open Claude Code in the repo.**
8. **Paste the Phase 0 prompt** from `STUDIOS_PHASE_0_PROMPT.md`.
9. **Read the discovery report.** Sanity-check the facts. If something doesn't match what's in the blueprint, update the blueprint or push back on Claude Code's read.
10. **Don't skip this step.** This is where Claude Code earns its keep before writing any code.

## Day 1 build — Phase 1

11. **Branch:**
    ```bash
    git checkout -b feat/studios-foundation <integration-branch>
    ```
12. **Open Claude Code and paste the Phase 1 prompt** from `STUDIOS_PHASE_1_PROMPT.md`.
13. **Let it work, but review each commit.** Don't autopilot. After each commit:
    - Open the dev server and check the changes look right
    - Run `pnpm typecheck && pnpm lint` to catch issues early
14. **Open a draft PR early.** Title: `Studios: Phase 1 foundation, landing, episode detail`. Push commits as they land.

## Day 2 build — Phase 2

15. **Continue on the same branch** (or new branch if Phase 1 is merged):
    ```bash
    git checkout -b feat/studios-watch-and-tiers
    ```
16. **Paste the Phase 2 prompt** from `STUDIOS_PHASE_2_PROMPT.md`.
17. **Get the Cloudflare Stream URL from Brett Miller** so the watch page is fully live.

## End of Day 2 — Demo

18. **Final quality checklist** (see Phase 2 prompt §"Final quality gate").
19. **Screen record a 90 to 120 second walkthrough** of the full happy path. Use Loom or QuickTime.
20. **Send to Brett Miller** with this message:
    > Studios Phase 1 is on next.galileyo at /studios. Quick walkthrough above. Episode 1 plays from Cloudflare Stream, email gate is working, all routes are live. Let me know what you want to iterate. Ready to talk Phase 2 (Stripe + backend wiring) when you've had a chance to review.

## Open items to track (don't lose these)

Create a `STUDIOS_DECISIONS.md` file in the repo and log answers as they come in:

- [ ] Active branch confirmed by Brett Miller
- [ ] Cloudflare Stream URL for Episode 1
- [ ] Stripe account setup
- [ ] Episode release dates for countdown
- [ ] Cast list with written approvals
- [ ] Music licensing path
- [ ] Kling AI positioning
- [ ] Sponsor confirmations (BivyStick, Seekins, Moonshine)
- [ ] Affiliate codes and links
- [ ] Final producer tier inclusions
- [ ] Bronze ad-free decision

## Self-protection (read this once)

The $1K is Phase 1 only. If scope creeps into Stripe integration, backend wiring, Cloudflare Account management, music production, video editing, or content writing beyond the page copy, those are separate line items. State this politely but firmly: "Happy to take that on, want to make sure we scope it cleanly — quick call to roll it into the retainer?"

Two-week window is the ceiling. Two-day target is the stretch. If something blocks you on day 2 (Cloudflare URL not yet available, etc.), ship what you have and document what's pending. Don't burn the weekend solving Brett Miller's blockers.

When Brett Miller sees the Phase 1 work, the retainer conversation gets easy. Don't rush that conversation — let the work make the case for you.

## Files in this delivery

- `STUDIOS_BLUEPRINT.md` — the master spec (drop into repo root)
- `STUDIOS_PHASE_0_PROMPT.md` — Claude Code discovery prompt (one session, before any code)
- `STUDIOS_PHASE_1_PROMPT.md` — Claude Code Day 1 build prompt
- `STUDIOS_PHASE_2_PROMPT.md` — Claude Code Day 2 build prompt
- `STUDIOS_SCOPE_EMAIL.md` — Email to Brett Miller (send today)
- `STUDIOS_CHEAT_SHEET.md` — This file
- `STUDIOS_BRANCH_NOTES.md` — Branch analysis with specifics

Go.
