# Phase 0 — Discovery Prompt for Claude Code

**Copy this entire prompt into Claude Code after cloning the Galileyo repo and checking out the correct branch (confirmed with Brett Miller per STUDIOS_BLUEPRINT.md §11).**

---

You are starting work on the Galileyo Studios feature. The full blueprint is in `STUDIOS_BLUEPRINT.md` at the repo root. Read it first.

Your job in this phase is **discovery only**. Do not write any feature code yet. Read the codebase carefully and report back with a discovery summary.

## Step 1 — Read these files in order

1. `STUDIOS_BLUEPRINT.md` (root) — your spec
2. `README.md` (root)
3. `package.json` (root)
4. `turbo.json` (root)
5. `apps/nextjs/package.json`
6. `apps/nextjs/next.config.js`
7. `apps/nextjs/tailwind.config.ts`
8. `apps/nextjs/src/app/globals.css`
9. `apps/nextjs/src/app/layout.tsx`
10. `apps/nextjs/src/app/(app)/layout.tsx`
11. `apps/nextjs/src/lib/fonts.ts`
12. `apps/nextjs/src/auth/server.ts`
13. `apps/nextjs/src/trpc/react.tsx`
14. `apps/nextjs/src/trpc/server.tsx`
15. `apps/nextjs/src/components/layout/authenticated-shell.tsx`
16. `apps/nextjs/src/components/site-header.tsx`
17. `apps/nextjs/src/components/site-footer.tsx`
18. `apps/nextjs/src/components/video/video-player.tsx` (just the first 100 lines for the interface)
19. `packages/api/src/root.ts`
20. `packages/api/src/router/studio.ts` (skim — confirm it's creator analytics, not films)
21. `packages/api/src/router/payment.ts` (first 100 lines)
22. `packages/api/src/router/video.ts` (first 100 lines)
23. `packages/db/src/schema/index.ts` (or wherever schema is exported)
24. `packages/ui/src/index.ts` (or main exports)

## Step 2 — Verify these facts and report back

Answer each with file path and line numbers as evidence:

1. **Routing system**: Confirm App Router (not Pages Router). Confirm route group `(app)` is the authenticated wrapper.
2. **Auth hook**: Where is the session retrieved in server components? Where is the client-side auth state hook?
3. **tRPC client setup**: How is the tRPC React client initialized? What's the import path for `api` (the tRPC proxy)?
4. **Global nav component**: Which file renders the top navigation? Where would I add a "Studios" link?
5. **Existing video player interface**: What props does `VideoPlayer` accept? Can it handle an HLS m3u8 URL directly via the `src` prop?
6. **Existing payment patterns**: How does the existing checkout flow work? Do I need to integrate with their pattern or can Stripe sit alongside as a parallel rail?
7. **shadcn primitives available**: List the UI primitives available from `@galileyo/ui` that I'll use (Button, Card, Dialog, Input, etc.).
8. **Tailwind config peculiarities**: Are there custom utilities, custom colors, or extensions I need to be aware of?
9. **Drizzle schema location and pattern**: Where do new schema files go? What's the table-naming convention (snake_case? camelCase?)?
10. **Env validation**: Where do new env vars get added (`env/server.ts`, `env/client.ts`)? What's the validation pattern?

## Step 3 — Flag any blockers

Report anything that would prevent or complicate the Phase 1 build:
- Missing dependencies that need installation
- Existing routes or components that would conflict
- Theme constraints that fight the cinematic dark Studios theme
- Anything in the existing layout that wraps children in a way that would prevent the Studios theme from applying cleanly to `/studios/*` routes

## Step 4 — Stop and wait

After producing the discovery report, **stop**. Do not start writing feature code. Wait for Brett Raio to review the report and give the green light for Phase 1.

## Output format

Produce a single discovery report markdown block with these sections:
- "Verified facts" (numbered list of answers to Step 2)
- "Blockers and concerns" (Step 3 output)
- "Recommended Phase 1 starting point" (one paragraph: where exactly will the first file be created, what will it import)
- "Open questions for Brett Raio" (anything ambiguous)

Then stop.
