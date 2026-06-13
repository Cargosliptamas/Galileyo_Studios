# STUDIOS V2 PHASE 1: Email List, Cloudflare Media Pipeline, Conversion Layer (FINAL)

Paste everything below into Claude Code from the repo root on branch `feat/studios-foundation`.

---

You are working in the Galileyo next-frontend Turborepo monorepo. Stack: Next.js 15 App Router, React 19, TypeScript strict, tRPC v11, Drizzle ORM on MySQL, Better Auth, Tailwind, pnpm, Turbo. The Galileyo Studios films vertical lives at `apps/nextjs/src/app/(app)/studios` with components in `apps/nextjs/src/components/studios` and data helpers in `apps/nextjs/src/lib/studios`.

House rules, non-negotiable:
- TypeScript strict, never use `any`, never use type assertions to dodge errors
- Tailwind utility classes only, no CSS modules, no styled components
- Functional components only
- No em dashes anywhere in user-facing copy or code comments
- All secrets through the existing validated env pattern (`apps/nextjs/src/env`), never `process.env` directly in app code
- Before finishing, run `pnpm typecheck` and `pnpm lint` from the repo root and fix everything you introduced
- Do not touch routes or components outside the Studios surface except where this prompt explicitly says to

Verified repo facts, trust these over your assumptions:
- DB schema workflow is drizzle-kit PUSH, not migrations. There is no migrations folder. After editing `packages/db/src/schema.ts`, apply with `pnpm -F @galileyo/db push`. Do not generate migration files.
- There is no seed pattern in the repo. You will create the first one.
- PostHog is already initialized globally in `apps/nextjs/instrumentation-client.ts`. In client components, `import posthog from "posthog-js"` and call `posthog.capture(name, props)` directly. Do not re-init.
- The shared `VideoPlayer` at `apps/nextjs/src/components/video/video-player.tsx` stays in use for this phase. Do not modify it. Phase 3 replaces it on the Studios watch surface with a dedicated film player.

Read these files first to absorb conventions before writing anything:
- `apps/nextjs/src/lib/studios/episodes.ts`
- `apps/nextjs/src/lib/studios/access.ts`
- `apps/nextjs/src/app/(app)/studios/api/email-gate/route.ts`
- `apps/nextjs/src/app/(app)/studios/api/sponsor-inquiry/route.ts` (note: `interest` accepts a single enum or an array of enums)
- `apps/nextjs/src/components/studios/studios-email-gate.tsx`
- `apps/nextjs/src/components/studios/studios-watch-client.tsx`
- `packages/db/src/schema.ts` (skim table patterns: mysqlTable, PK style, datetime mode, index naming like UK_ and IDX_)
- `apps/nextjs/src/env` (server and client env files)
- `.env.example`

## Section A: Persist the email list (highest priority in the entire engagement)

1. Add a `studiosLead` table to `packages/db/src/schema.ts` following the existing table conventions exactly:
   - `id` PK following the repo's PK convention
   - `email` varchar(320) not null, unique index `UK_studios_lead_email`
   - `source` varchar(40) not null (values: `email_gate`, `sponsor_inquiry`, `donation`, `checkout`)
   - `episodeSlug` varchar(80) nullable
   - `promoCode` varchar(40) nullable
   - `utmSource`, `utmMedium`, `utmCampaign` varchar(120) nullable
   - `createdAt` following the repo's datetime convention, index `IDX_studios_lead_created_at`
2. Add a `studiosSponsorInquiry` table: id PK, `interest` varchar(200) not null (the route's zod schema accepts a single enum OR an array; normalize to an array server-side and store comma-joined), `company` varchar(200) nullable, `contactName` varchar(200), `email` varchar(320), `phone` varchar(50) nullable, `budgetRange` varchar(50) nullable, `notes` text nullable, `status` varchar(20) default `new`, createdAt with index.
3. Apply schema with `pnpm -F @galileyo/db push`.
4. Update the email-gate route: after validating, upsert into `studiosLead` (on duplicate email do nothing, still set the cookie and return success so returning users are never blocked). Capture UTM params if the client sends them. Update `studios-email-gate.tsx` to read `utm_source`, `utm_medium`, `utm_campaign` from `useSearchParams` and include them in the POST body.
5. Update the sponsor-inquiry route: persist to `studiosSponsorInquiry`, also upsert the email into `studiosLead` with source `sponsor_inquiry`. Remove the console.log and the stale TODO comment.
6. Failure mode matters: if the DB write fails, log the error server-side but still set the unlock cookie and return success. Never lose a viewer because of a lead-capture hiccup.

## Section B: Cloudflare Stream playback wiring

1. Add server env vars (validated, optional with empty-string defaults so the app boots without them): `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_STREAM_API_TOKEN`, `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`, `CLOUDFLARE_STREAM_SIGNING_KEY_ID`, `CLOUDFLARE_STREAM_SIGNING_KEY_PEM`, `CLOUDFLARE_IMAGES_API_TOKEN`. Add client env var `NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH`. Add all to `.env.example` with comments.
2. Create `apps/nextjs/src/lib/studios/stream.ts`:
   - `getPublicHlsUrl(videoUid: string): string` returning `https://{customerSubdomain}/{uid}/manifest/video.m3u8`
   - `getSignedHlsUrl(videoUid: string, ttlSeconds?: number): Promise<string>` generating a Cloudflare Stream signed token: an RS256 JWT built with `node:crypto` (createPrivateKey on the PEM, sign with RSA-SHA256; jose is NOT installed, do not add it). JWT header includes `kid` = signing key ID, payload claims `sub` = videoUid and `exp` = now plus ttl (default 6 hours). Return the manifest URL with the token in place of the uid per the Cloudflare Stream signed URL format.
   - `getThumbnailUrl(videoUid: string, timeSeconds?: number): string`
3. Create `apps/nextjs/src/lib/studios/images.ts` with `getImageUrl(imageId: string, variant: "poster" | "hero" | "card" | "logo"): string` returning `https://imagedelivery.net/{accountHash}/{imageId}/{variant}`. When the account hash env is empty, return the input unchanged so existing local `/studios/...` paths keep working as fallback.
4. Add a `studiosEpisode` table mirroring the fields in `lib/studios/episodes.ts` plus `streamUid` varchar(64) nullable, `posterImageId` varchar(64) nullable, `heroImageId` varchar(64) nullable, `priceCents` int default 700, `isFree` boolean default false, `published` boolean default false, `adsOnPaid` boolean default false, `adCuePoints` json nullable (array of seconds), `sortOrder` int. Push schema. Create the repo's first seed script at `packages/db/src/seed/studios.ts` (runnable via `pnpm -F @galileyo/db with-env tsx src/seed/studios.ts`) inserting the 7 episodes from the existing TS array, Episode 1 `isFree` true and `published` true, idempotent on slug.
5. Create `apps/nextjs/src/lib/studios/episodes-db.ts` with `getPublishedEpisodes()` and `getEpisodeBySlugDb(slug)` reading from the table, falling back to the static array when the table is empty so nothing breaks before seeding. Update the studios landing, episodes, episode detail, and watch pages to use these helpers. Keep the exported `Episode` type shape stable to minimize component churn; extend it rather than rewriting it.
6. Update the watch page: if the episode has a `streamUid`, free episodes use `getPublicHlsUrl`, paid episodes use `getSignedHlsUrl`. Keep `NEXT_PUBLIC_EPISODE_1_HLS_URL` as the final fallback so the current staging setup keeps working. The existing hls.js `VideoPlayer` plays the manifest unchanged in this phase.
7. Wherever Studios components render `heroStill` or poster paths, render `getImageUrl(posterImageId or heroImageId, variant)` when the ID exists, falling back to the existing local path. Add `imagedelivery.net` and `*.cloudflarestream.com` to `images.remotePatterns` in `apps/nextjs/next.config.js`.

## Section C: Conversion layer

1. Create `apps/nextjs/src/components/studios/studios-partnership-cta.tsx`: a slim, elegant banner matching the cinematic theme, copy exactly: `For Partnership info, contact Brett@Galileyo.com` with `mailto:Brett@Galileyo.com?subject=Galileyo Studios Partnership`. Render it inside the Studios layout (`app/(app)/studios/layout.tsx`) so it appears on every Studios page, positioned above the footer. Also add a compact variant rendered in the post-credits upsell modal. Fire `studios_partnership_cta_clicked` on click.
2. Create `/studios/donate` page: cinematic, mission-forward copy about funding independent AI filmmaking, preset amount cards ($10, $25, $50, $100) plus a custom amount input, validated client-side, min $1 max $50,000. The submit button calls a stub `POST /studios/api/donate` route that for now records the email and intended amount into `studiosLead` (source `donation`) and returns `{ checkoutUrl: null }`, with a friendly "Donations open this week, leave your email and we will notify you" state. Phase 2 swaps the stub for Stripe Checkout. Add a Donate link to the Studios nav and a donate card on the landing page near the producer tiers.
3. Post-watch upsell ordering (edit `studios-post-credits-upsell.tsx`): 1) Donate, 2) Unlock Episode 2 for $7, 3) Bronze $24 per year, 4) Share buttons (X, Facebook, copy link) with prefilled copy: `I just watched Episode 1 of an AI-made series, free to stream:` plus the URL with `utm_source=share`.
4. OG and Twitter card metadata for all Studios pages via `generateMetadata`, using the poster image (Cloudflare Images hero variant when set, local fallback otherwise). The share card is the advertisement, make the title and description sell: free Episode 1, made with AI.
5. PostHog events from the relevant client components (`import posthog from "posthog-js"`, capture directly, init already exists): `studios_email_captured`, `studios_play_started`, `studios_play_completed`, `studios_donate_clicked`, `studios_share_clicked`, `studios_partnership_cta_clicked`.

## Acceptance criteria
- Submitting the email gate creates a `studios_lead` row, duplicate emails do not error
- Sponsor inquiry creates a `studios_sponsor_inquiry` row including multi-select interests
- With `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN` and a real `streamUid` set on Episode 1, the watch page streams from Cloudflare
- Partnership CTA visible on every Studios route
- `/studios/donate` renders and captures emails
- `pnpm typecheck` and `pnpm lint` pass

Finish with a summary of every file created or modified, the exact seed command, and a list of env vars the deployer must set.
