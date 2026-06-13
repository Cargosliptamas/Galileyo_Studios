# Galileyo Studios V2: Monetization, Media Pipeline, Ads, and Admin (FINAL)

**Project:** Galileyo Studios upgrade round 2
**Owner:** Brett Raio (BOLD Studios)
**Client:** Brett Miller (Galileyo)
**Repo:** next-frontend, branch `feat/studios-foundation`
**Hard deadline:** Launch blast week of 6.15
**Film delivery:** Final cut Sunday/Monday per Brett Miller. Tulsa event next weekend, Saturday speaking slot is the live launch moment.

---

## 0. Verified current state (audited line by line against the actual branch, 6.12)

What already exists and works:
- Full `/studios` section: landing, episodes, episode detail, watch, producers, membership, sponsors, affiliates, about
- Cinematic theme scoped in `globals.css`
- Email gate at `apps/nextjs/src/app/(app)/studios/api/email-gate/route.ts` sets an HMAC-signed `studios_unlock` cookie. The email is NOT saved anywhere.
- Watch page reads `NEXT_PUBLIC_EPISODE_1_HLS_URL` and plays via the existing hls.js `VideoPlayer`
- Episode data hardcoded in `apps/nextjs/src/lib/studios/episodes.ts`
- Sponsor inquiry route validates with zod then only does `console.log`. Note: its `interest` field accepts a single enum OR an array of enums (7 values: sponsor, executive-producer, affiliate, product-placement, end-card, banner, podcast). The new table must store the joined array, not a single value.

Verified reusable infrastructure (all confirmed present in `packages/db/src/schema.ts`):
- `adminMember`, `authAssignment`, `authItem`: existing RBAC, future home for admin gating
- `promocode`, `invoicePromocode`: existing promo code tables for reporting mirrors
- `emailPool`, `emailTemplate`: existing outbound email infrastructure

Verified tooling facts (these override anything any earlier draft said):
- **Migrations:** there is NO migrations folder and no generate/migrate flow in use. The repo uses the drizzle-kit push workflow. Schema changes go into `packages/db/src/schema.ts`, then run `pnpm -F @galileyo/db push`. Do not generate migration files.
- **Seeds:** no seed pattern exists. Create `packages/db/src/seed/studios.ts`, runnable with `pnpm -F @galileyo/db with-env tsx src/seed/studios.ts`.
- **PostHog:** installed and initialized. Client: global init in `apps/nextjs/instrumentation-client.ts`, so components just `import posthog from "posthog-js"` and call `posthog.capture(...)` (init is env-guarded; capture is a safe no-op when keys are absent). Server: default-export helper at `apps/nextjs/src/posthog/server.ts` that returns a client only when env keys exist, so null-check it.
- **Webhooks:** `apps/nextjs/src/app/api/webhooks/bunny` exists. The Stripe webhook goes next to it at `api/webhooks/stripe`.
- **jose is NOT installed.** Cloudflare Stream signed tokens must be built with `node:crypto` (RS256 JWT via createPrivateKey and sign). No new dependencies for this.
- **The shared `VideoPlayer` cannot host the ad engine.** It is an 851-line vertical-feed component with duet/stitch logic, and it exposes no onTimeUpdate, no imperative handle, and no start-at-time prop. Phase 3 builds a small dedicated `StudiosFilmPlayer` on hls.js (already a dependency) and leaves the feed player completely untouched. Lower risk to the core product, correct UX for long-form film.
- Funding numbers currently come from `NEXT_PUBLIC_STUDIOS_FUNDING_*` env vars (confirmed in `env/client.ts`). Phase 4 moves them to settings with env fallback.

The five gaps this round closes:
1. **Emails are not captured.** The single highest-priority fix. The entire funnel is the email list.
2. **No payments.** Stripe is not installed anywhere in the monorepo (verified). Existing rails are Authorize.net, BitPay, Apple, credits in `packages/api/src/router/payment.ts`. Studios uses Stripe independently; those rails are never touched.
3. **No media pipeline.** No Cloudflare Stream or Images wiring. Everything is local placeholders.
4. **No ads.** No mid-roll infrastructure of any kind.
5. **No admin.** Brett Miller cannot operate anything without a developer.

---

## 1. The conversion funnel (what every decision serves)

Brett Miller's own words: it is all about conversion. The funnel:

```
Influencer share (25-30 seeds) or Tulsa stage moment
  -> Land on /studios (free, no friction)
  -> Watch Episode 1 free, email required        <- EMAIL LIST (asset #1)
  -> Mid-roll commercials play (sponsor revenue now, CPM later)
  -> Post-credits upsell: donate / unlock Episode 2 / Bronze $24 / ad-free
  -> Partnership CTA on every page: Brett@Galileyo.com
  -> Galileyo Pro members get Studios included (platform cross-sell, parked)
```

Every page gets the persistent CTA: **"For Partnership info, contact Brett@Galileyo.com"**.

Promo codes at launch: `300DAYS` and `BIVVY`.

---

## 2. Architecture decisions

### Video: Cloudflare Stream
- Upload episodes and commercials to Cloudflare Stream (dashboard upload to start, direct creator upload from the admin in Phase 4)
- Playback via Stream HLS manifests
- Signed URLs (RS256 signed tokens via node:crypto) for paid episodes, public unsigned playback for Episode 1, trailers, and commercials
- Env vars: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_STREAM_API_TOKEN`, `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`, `CLOUDFLARE_STREAM_SIGNING_KEY_ID`, `CLOUDFLARE_STREAM_SIGNING_KEY_PEM`

### Images: Cloudflare Images
- Posters, banners, stills, sponsor logos. Variants: `poster` (2:3), `hero` (16:9 large), `card` (16:9 medium), `logo`
- The corrected poster (the actual character, not Scott) swaps through the admin with zero deploys
- Env vars: `CLOUDFLARE_IMAGES_API_TOKEN`, `NEXT_PUBLIC_CLOUDFLARE_IMAGES_ACCOUNT_HASH`

### Payments: Stripe
- Stripe Checkout (hosted) only. No Elements, no custom card forms. Fastest safe path to 6.15.
- Products: Episode unlock $7, Bronze annual $24, Ad-Free $7.99 one-time, Associate Producer $50, Contributing Producer $200, Game Producer $100, Donations preset $10/$25/$50/$100 plus custom ($1 to $50,000)
- Price IDs created by an idempotent setup script and stored in a `studiosSetting` table. Placeholder price IDs in code are a banned failure mode.
- Promo codes `300DAYS` and `BIVVY` as Stripe promotion codes, mirrored into the existing `promocode` table for reporting
- **OPEN DECISION for Brett Miller before Phase 2 ships live:** what the codes discount. Default in the script: 100% off one episode unlock, one redemption per customer. Confirm or change.
- Webhook grants entitlement rows on `checkout.session.completed`. Webhooks cannot set cookies: the thank-you page verifies the session server-side and sets the signed `studios_viewer` cookie there.
- Executive Producer ($250K) stays an inquiry flow, never a checkout button.

### Ads: two-stage strategy (the honest one)
**Stage A, launch week: direct-sold sponsor commercials.** Seekins, Bass Pro, Bivvy, Budweiser, Kling AI spots hosted on Cloudflare Stream, played at cue points (mid-rolls at 540s and 1080s in a 27-28 minute episode, optional pre-roll). You control fill, keep 100% of sponsor money, no network approval, works day one.

**Stage B, after traffic proves out: programmatic CPM.** A brand-new site does not get into Google Ad Exchange directly. Build the player VAST-ready now (Phase 3 leaves the seam), then apply to a Google MCM partner (diDNA, Publift, or similar) once there are 50K+ monthly video views. Realistic engaged long-form US instream CPMs run roughly $10-$30, so 1M ad impressions is roughly $10K-$30K gross before rev share. Do not touch pop-under or interstitial networks (PropellerAds class); they poison the brand for this audience. The `studiosAdImpression` table is the traffic proof for the MCM application.

### Email list
- New `studiosLead` table: email, source, episode, promo code, UTM params. Gate writes to it, sponsor inquiries write to it, the Stripe webhook writes purchaser emails to it. Admin exports CSV. ESP sync (Resend broadcast, ConvertKit, Mailchimp) comes later; this table is the source of truth either way.

### Admin: `/studios/admin`
- Gated by Better Auth session plus `STUDIOS_ADMIN_EMAILS` allowlist to start; migrate to `authAssignment` RBAC when the backend team blesses a `studiosAdmin` auth item
- Tabs: Episodes, Media, Ads, Leads, Inquiries, Producers, Promo Codes, Settings

### Episodes move from hardcoded array to DB
- New `studiosEpisode` table becomes source of truth, current TS array becomes the seed, static array remains the empty-table fallback so nothing breaks before seeding

---

## 3. Phase plan and what blocks on whom

| Phase | Scope | Time | External blocker |
|---|---|---|---|
| 1 | Email persistence, Cloudflare Stream + Images wiring, episode DB table, conversion CTAs, donate page (stub) | Today | Cloudflare creds (BOLD account as staging fallback), final video file |
| 2 | Stripe end to end: setup script, checkout, webhook, entitlements, promo codes, ad-free | 1 day | Brett Miller's Stripe keys + promo discount decision |
| 3 | StudiosFilmPlayer + mid-roll commercial engine, impression tracking, VAST seam | 1 day | Commercial video files |
| 4 | Admin panel, all tabs, CSV export | 1-1.5 days | None |
| 5 | Launch hardening: OG cards verified, error states, smoke script, perf pass | Half day | None |

Phases 1 and 3 are not blocked by Brett Miller at all if you stage on a BOLD-controlled Cloudflare account. Swap creds later.

**The "ready in the next hour" version:** run Phase 1 Sections A and B only (email persistence plus Stream playback wiring). Genuinely about an hour of Claude Code work, and it makes the funnel real: emails captured, video streaming from Cloudflare. Everything else layers on without rework.

---

## 4. Launch checklist for the 6.15 blast

Code:
- [ ] Email gate persists every email to `studiosLead`
- [ ] Episode 1 streams from Cloudflare Stream on desktop AND mobile Safari
- [ ] New poster (actual character) live via Cloudflare Images
- [ ] Partnership CTA banner on every Studios page
- [ ] Donations live with Stripe (or email-capture fallback if keys are late)
- [ ] At least one mid-roll commercial playing in Episode 1
- [ ] Promo codes 300DAYS and BIVVY working at checkout
- [ ] OG/Twitter share cards with the new poster, verified in the X and Facebook debuggers (the card IS the ad when influencers share)
- [ ] PostHog events flowing: email_captured, play_started, midroll_started, midroll_completed, checkout_started, checkout_completed, donation_completed
- [ ] One real live-mode $7 purchase plus refund tested

Content (Brett Miller):
- [ ] Final 27-28 min cut uploaded
- [ ] Teaser trailer for the hero background
- [ ] New poster art and banner crops in the shared Drive
- [ ] Sponsor commercial files (per spot: video file, clickthrough URL, one highlight line)
- [ ] Stripe account created, keys handed over, promo discount decision made

Distribution:
- [ ] 25-30 influencer seed list with personal asks ("made with AI, partnered with us, please share")
- [ ] Tulsa Saturday: 5 minute segment, QR code slide to /studios, "free tonight at home"
- [ ] Round 2 prep parked: clipping pipeline (BOLD Clipping fits here), Netflix/Amazon/Apple/Angel aggregator research, sponsor highlight reels

---

## 5. Execution order for Claude Code

Run the five phase prompts in order, each in a fresh Claude Code session from the repo root on `feat/studios-foundation`:

1. `STUDIOS_V2_PHASE_1_PROMPT.md` (launch critical, run now)
2. `STUDIOS_V2_PHASE_2_PROMPT.md` (Stripe)
3. `STUDIOS_V2_PHASE_3_PROMPT.md` (film player + ads engine)
4. `STUDIOS_V2_PHASE_4_PROMPT.md` (admin)
5. `STUDIOS_V2_PHASE_5_PROMPT.md` (hardening, day before blast)

House rules baked into every prompt: TypeScript strict with no `any`, Tailwind only, functional components, no em dashes in any copy, every secret through the validated env layer, schema changes pushed with `pnpm -F @galileyo/db push`, nothing finished without `pnpm typecheck` and `pnpm lint` passing.
