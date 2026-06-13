# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Galileyo — a satellite-delivered information distribution platform. This is a **Turborepo + pnpm workspaces** monorepo derived from the T3 stack. Requires Node `>=22.14.0` and pnpm `10.22.0` (pinned via `packageManager`).

## Commands

All commands run from the repo root and fan out across workspaces via Turbo.

```bash
pnpm dev              # Watch-run all apps (turbo watch dev --continue)
pnpm dev:next         # Run only the Next.js app (+ its deps)
pnpm dev:emails       # React Email preview studio

pnpm build            # Build everything
pnpm lint             # ESLint (cached); lint:fix to autofix
pnpm typecheck        # tsc --noEmit across packages
pnpm format           # Prettier check; format:fix to write
pnpm lint:ws          # sherif — validate workspace/dependency consistency
```

### Scoping to one package

Use `turbo -F <pkg>` or `pnpm -F <pkg>` with the package name from its `package.json` (e.g. `@galileyo/nextjs`, `@galileyo/db`, `@galileyo/api`). Example: `pnpm -F @galileyo/nextjs typecheck`.

### Database (Drizzle + MySQL)

**This repo uses the drizzle-kit `push` workflow — there is NO migrations folder and no generate/migrate flow.** Edit `packages/db/src/schema.ts`, then push:

```bash
pnpm db:push          # Push schema changes to the DB
pnpm db:pull          # Introspect DB into schema
pnpm db:studio        # Drizzle Studio
pnpm db:genm          # Generate migrations (not part of the normal flow)
```

To run an ad-hoc script against the DB (e.g. a seed): `pnpm -F @galileyo/db with-env tsx src/<path>.ts`.

### UI components

`pnpm ui-add` runs the interactive shadcn/ui CLI, adding components into `packages/ui`.

### Environment

There is a single root `.env` (see `.env.example`). Every app/package wraps its scripts in a `with-env` helper (`dotenv -e ../../.env --`), so commands inherit root env automatically. Env vars are validated with `@t3-oss/env` (`apps/nextjs/src/env/`); validation is skipped during `lint` and in CI. **When adding a new env var, also register it in the `globalEnv` array in `turbo.json`** or Turbo will not pass it through.

## Architecture

### Apps (`apps/*`)

- **nextjs** — the primary web app (Next.js 15, React 19, App Router with turbopack). Also the production backend that Expo and other clients talk to.
- **expo** — React Native mobile app (Expo SDK 53, NativeWind). `pnpm ios` / `pnpm android`.
- **cron** — standalone worker (`tsx src/index.ts`) running scheduled jobs (`src/jobs/`), backed by `@galileyo/queue`.
- **preview** — Hono server (`@galileyo/metascraper` + OpenAI) for link/content preview generation.

### Packages (`packages/*`)

- **api** — tRPC v11 routers. `src/root.ts` composes the `appRouter`; individual routers live in `src/router/`. `src/trpc.ts` defines context and procedures.
- **db** — Drizzle ORM schema (`schema.ts`), client (`client.ts`), and relations. MySQL.
- **auth** — Better Auth config and plugins.
- **emails** — React Email templates.
- **ui** — shared shadcn/ui component library.
- **validators** — shared Zod schemas.
- **utils**, **queue**, **metascraper** — shared helpers, job queue (ioredis), and scraping.

### Tooling (`tooling/*`)

Shared `eslint`, `prettier`, `tailwind`, and `typescript` configs consumed by every workspace.

### tRPC conventions

- `publicProcedure` and `protectedProcedure` are the two base procedures (`packages/api/src/trpc.ts`). `protectedProcedure` throws `UNAUTHORIZED` unless `ctx.session.user` exists and narrows the session type.
- A `timingMiddleware` logs execution time and **injects a random 100–500ms artificial delay in dev** to surface request waterfalls — expect this latency locally.
- superjson is the transformer; Zod v4 (`zod/v4`) is used for validation and error formatting.
- Next.js tRPC clients live in `apps/nextjs/src/trpc/` (`react.tsx` for client components, `server.tsx` for RSC).

### Real-time / WebSockets

The WebSocket tRPC server is a **separate process** from Next.js: `apps/nextjs/src/server/trpc-ws.ts`, run with `pnpm -F @galileyo/nextjs dev:ws` (or `start:ws` in prod). Redis (`REDIS_URL`) backs pub/sub and caching.

### Production process model

`ecosystem.config.js` (PM2) runs four processes: `frontend` (next start), `websocket` (start:ws), `cron`, and `preview`. The Next.js app must be deployed for clients to reach the backend.

## Galileyo Studios

The current active work is the **Studios** feature (branch `feat/studios-foundation`). The `/studios` section lives at `apps/nextjs/src/app/(app)/studios/` and a corresponding `studio` tRPC router exists in `packages/api/src/router/studio.ts`.

**Read `docs/studios-v2/GALILEYO_STUDIOS_V2_MASTER_BLUEPRINT.md` and the phase prompts before working on Studios** — it documents the audited current state, what already exists, and the planned phases (email capture, Stripe payments, Cloudflare Stream media pipeline, mid-roll ads, admin). Key constraints from the blueprint: Studios uses Stripe independently from the existing payment rails (Authorize.net/BitPay/Apple in `payment.ts`), builds a dedicated `StudiosFilmPlayer` on hls.js rather than touching the shared 851-line `VideoPlayer`, and uses `node:crypto` for signed tokens (jose is not installed).

## Code conventions

- **No em dashes** anywhere in copy or comments. Use commas, parentheses, or separate sentences instead.
- **TypeScript strict, no `any`.** Type everything; reach for `unknown` plus narrowing or proper generics rather than `any`.
- **Tailwind only** for styling. No CSS modules, styled-components, or inline style objects.
- **Functional components only.** No class components.
- The footer reads exactly `Designed and Developed by BOLD Studios.` (with the trailing period).
