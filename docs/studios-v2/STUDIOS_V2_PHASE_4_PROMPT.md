# STUDIOS V2 PHASE 4: Studios Admin Panel (FINAL)

Paste into Claude Code from the repo root on branch `feat/studios-foundation`, after Phases 1 through 3.

---

Same house rules: TypeScript strict with no `any`, Tailwind only, functional components, no em dashes anywhere, validated env only, typecheck and lint must pass. Schema changes apply with `pnpm -F @galileyo/db push`.

Read before writing anything: the Phase 1-3 tables in `packages/db/src/schema.ts` (`studiosEpisode`, `studiosLead`, `studiosSponsorInquiry`, `studiosEntitlement`, `studiosCommercial`, `studiosAdImpression`, `studiosSetting`, `studiosProducerCredit`), `lib/studios/stream.ts`, `lib/studios/images.ts`, the Better Auth session helper at `~/auth/server` (`getSession()`), and the existing RBAC tables `adminMember`, `authAssignment`, `authItem` (confirmed present in schema.ts; you are NOT using them yet, but the gating helper documents the migration path to them).

## Section A: Gating

1. Env var `STUDIOS_ADMIN_EMAILS` (comma-separated). Helper `requireStudiosAdmin()` in `lib/studios/admin.ts`: reads the session via `getSession()`, compares the email case-insensitively against the allowlist, redirects to `/studios` (pages) or throws a 403 (API routes) otherwise. Every admin page and every admin API route calls it server-side. Comment that this migrates to the existing `authAssignment` RBAC once the backend team assigns a `studiosAdmin` auth item.
2. Admin layout at `apps/nextjs/src/app/(app)/studios/admin/layout.tsx`: keeps the cinematic theme but utilitarian, left tab rail: Episodes, Media, Ads, Leads, Inquiries, Producers, Promo Codes, Settings. No link to admin from public nav.

## Section B: Episodes tab (`/studios/admin`)

1. Table of all episodes with publish toggle, price, free flag, ads-on-paid flag, stream UID presence indicator, cue points.
2. Edit drawer per episode: title, synopsis, release label, release date, runtime, price cents, isFree, published, adsOnPaid, adCuePoints (editable list of mm:ss values converted to seconds), streamUid, posterImageId, heroImageId. Pick ONE mutation pattern (server actions or admin API routes, both zod-validated) and use it consistently across every tab.
3. Add Episode button for Episodes 8 plus or the second film Brett Miller mentioned (the feature film fundraiser): same form, slug auto-generated from title, editable.
4. Preview link per episode opening the public detail page in a new tab.

## Section C: Media tab

1. Video upload: request a direct creator upload URL from the Cloudflare Stream API server-side (`POST /accounts/{accountId}/stream/direct_upload`, maxDurationSeconds 7200; the API token never reaches the client), client uploads the file straight to Cloudflare with a progress bar, then poll the video status endpoint until `readyToStream`. Show the new UID with a copy button and a one-click "assign to episode" select. Large files must never pass through Vercel.
2. Image upload: same pattern with Cloudflare Images direct upload URLs, preview the uploaded image in each variant (poster, hero, card, logo), copy ID, one-click assign to an episode poster or hero. This is how the corrected poster (the actual character) goes live with zero deploys.
3. Library views listing recent Stream videos and Images via the Cloudflare list APIs, server-fetched, paginated.

## Section D: Ads tab

1. Commercials table: name, sponsor, duration, active toggle, weight, clickthrough URL, highlight copy, stream UID (assignable from the Media tab pattern), sponsorRateCents.
2. Report panel using the Phase 3 report endpoint: impressions, completions, completion rate, clicks per commercial, date range picker, and a computed effective revenue line when `sponsorRateCents` is set (rate per thousand impressions, display only).
3. Settings rows for `ad_source` (`direct` or `vast`) and `vast_tag_url`, both writing to `studiosSetting`, with helper text that VAST activates the Stage B programmatic path.

## Section E: Leads, Inquiries, Producers tabs

1. Leads: paginated table (email, source, episode, promo code, UTM, date), search by email, source filter, and an Export CSV button streaming the full table (RFC 4180, UTF-8 BOM so Excel opens it clean). This CSV is the launch email list, make export bulletproof.
2. Inquiries: table of `studiosSponsorInquiry` with status dropdown (`new`, `contacted`, `closed`), notes in an expandable row, mailto reply button prefilled to the contact.
3. Producers: table of `studiosProducerCredit` with editable displayName (how they appear in credits), tier filter, total raised per tier as header stat cards, and a copy-all-names button for the film credits roll.

## Section F: Promo Codes and Settings tabs

1. Promo Codes: list Stripe promotion codes via the API (300DAYS, BIVVY and any added later), active toggle (archive in Stripe), redemption counts, and a create form (code, percent off, applicable product) that creates the coupon and promotion code in Stripe and mirrors a row into the existing `promocode` table (conform to its actual columns).
2. Settings: form over `studiosSetting` keys: film funding current and target, game funding current and target (these supersede the `NEXT_PUBLIC_STUDIOS_FUNDING_*` env vars; update the funding components to read settings server-side with env fallback), hero trailer stream UID, partnership CTA email (default Brett@Galileyo.com), and the donate presets. Save with optimistic UI.

## Section G: Dashboard strip

At the top of every admin tab, four stat cards server-computed: total leads, leads in the last 7 days, gross revenue (sum of entitlement amounts), ad impressions in the last 7 days. The conversion scoreboard Brett Miller checks daily.

## Acceptance criteria
- Non-allowlisted logged-in user is redirected from every admin route and blocked from every admin API
- Upload a video, see it become ready, assign to an episode, watch it play publicly
- Upload an image, assign as poster, public pages reflect it without deploy
- CSV export opens correctly in Excel with all rows
- Toggling a commercial inactive removes it from new ad schedules immediately
- Funding settings change is reflected on the public producer components
- typecheck and lint pass

Finish with the file list and a one-paragraph handoff note Brett Raio can send Brett Miller explaining what he can now do himself in the admin.
