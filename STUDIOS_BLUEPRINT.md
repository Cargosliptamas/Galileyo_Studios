# Galileyo Studios — Master Build Blueprint (v2)

**Project:** Galileyo Studios films vertical, Phase 1 web build
**Owner:** Brett Raio (frontend lead)
**Backend Owner:** Andras / Tamas (existing tRPC + Drizzle layer, augmented not replaced)
**Target deploy:** `next.galileyo` staging environment
**Sprint:** 2 days (ahead-of-schedule push), with a 2-week ceiling
**Deliverable:** Complete Studios section in the Next.js app, deployed to staging, ready for Brett Miller review

---

## 0. Verified codebase facts (not guesses)

The blueprint below is grounded in actual inspection of the provided next-frontend repo. Anything labeled here is fact, not assumption.

**Stack confirmed:**
- Next.js 15 (App Router, route groups, server components)
- React 19, TypeScript strict
- tRPC v11 with `@tanstack/react-query`
- Drizzle ORM, MySQL (`DATABASE_URL=mysql://...`)
- Better Auth with session via `getSession()` from `~/auth/server`
- Turborepo monorepo: `apps/nextjs`, `apps/expo`, `packages/api`, `packages/db`, `packages/ui` (shadcn-based), `packages/auth`, `packages/validators`
- Tailwind config at `apps/nextjs/tailwind.config.ts`, globals at `apps/nextjs/src/app/globals.css`
- Existing HLS video player at `apps/nextjs/src/components/video/video-player.tsx` (uses `hls.js`, supports `.m3u8`)
- Existing tRPC routers in `packages/api/src/router/` — already includes `payment.ts`, `video.ts`, `auth.ts`, plus 15 others
- Video provider abstraction supports `bunny | mux | s3` (we add `cloudflare-stream` as a fourth)
- Mux is already installed via `@mux/mux-node`; Stripe is NOT yet installed
- Existing payment rails: Authorize.net (type 1), BitPay (type 2), Apple (type 6), credit system (types 3-4)
- Motion library `motion@^12.23.24` installed (use this for animations, not Framer Motion separately)
- App layout shell at `apps/nextjs/src/components/layout/authenticated-shell.tsx`
- Route group `(app)` at `apps/nextjs/src/app/(app)/` wraps the authenticated experience

**Critical naming conflict identified:**
- `packages/api/src/router/studio.ts` already exists (1007 lines) — it is the **creator analytics dashboard** (per-user video stats), NOT Galileyo Studios.
- The new Studios films vertical must use a different namespace. Decision: route at `/studios` (plural, lives under route group `(app)`), tRPC router at `packages/api/src/router/studios.ts` (plural, also). The plural-vs-singular distinction is the boundary. If Andras pushes back on the name proximity, fall back to `originals` (matches Netflix Originals branding).

**Branch verification required (do not skip):**
- The three branches provided (`main`, `development`, `production`) show inverted feature counts: `main` has 34 routes, `production` has 23, `development` has only 13. This is the opposite of the typical convention.
- Before any commit, Brett Raio must run the branch verification steps in §11 below and confirm with Brett Miller which branch is the active integration target. Do not assume `development` is correct.

---

## 1. Strategic context (what we agreed to on the call)

**Scope:** Build the Studios section into `next.galileyo` so users can:
- Land on a beautiful Studios page that establishes the brand
- See the 7-episode roadmap with countdown to next release
- Watch Episode 1 free after email signup
- Buy individual episodes ($7 each) or unlock all with Bronze membership ($24/year)
- Become an Associate Producer ($50), Contributing Producer ($200), or Executive Producer ($250K+) for film funding
- Become a Game Producer ($100+) for game funding
- See sponsors (BivyStick, Seekins, Moonshine) and affiliate offers (Escape Zone, Ghost Phone)
- Sign up to be a sponsor or affiliate themselves

**Timeline:** 2-day target for the visible, deployable Phase 1 (UI, page structure, mocked checkout, Episode 1 playable). 2-week ceiling for full backend wiring (Stripe, Cloudflare Stream, email automation, producer tier flow). The $1K covers Phase 1 only; Stripe/backend integration is scoped separately if it stretches.

**Out of scope for this engagement:**
- Mobile app (handed off to existing team after web is shipped)
- Backend rewrites
- Music licensing (flagged separately, not Brett Raio's problem to solve)
- Final film production

**Confirmed pricing (per transcript):**
- Episode 1: free with email signup
- Episodes 2-7: $7 each, OR
- Bronze annual: $24/year, save $25 vs pay-per-episode
- Ad-free upgrade: $7.99 (tier between free and Bronze)
- Producer tiers (film): $50 Associate / $200 Contributing / $250K Executive (7 exec slots, $3.5M target)
- Producer tiers (game): $100+ for credit, $1M target
- Release cadence for Episodes 2-7: every 1-2 months

---

## 2. Two-day execution plan (the realistic one)

### Day 1: Foundation, theme, landing page

**Morning (4 hours):**
- Branch verification (§11) — 30 min
- Phase 0 codebase discovery via Claude Code (§13.1 prompt) — 30 min
- Create `studios` feature flag and route group structure — 30 min
- Add Studios design tokens to `globals.css` (cinematic dark theme overlay on existing tokens) — 1 hour
- Build `StudiosShell` layout with theme, nav extension, footer — 1.5 hours

**Afternoon (4 hours):**
- Build landing page sections in this exact order:
  1. Hero with countdown timer and Episode 1 free CTA — 1 hour
  2. Email gate component (mock submit, no backend yet) — 30 min
  3. Episode roadmap grid (Episode 1 hero card + 6 coming-soon cards) — 1 hour
  4. Producer tier preview (3 film tiers + 1 game tier) — 1 hour
  5. Bronze membership upsell card — 30 min

### Day 2: Episode detail, watch player, producer flow, polish

**Morning (4 hours):**
- Episode detail page at `/studios/episodes/[slug]` — 1.5 hours
- Watch page at `/studios/watch/[slug]` with Episode 1 wired to Cloudflare Stream HLS URL — 1.5 hours
- Email gate → unlock token cookie → access check (client-side stub, signed by simple HMAC for Phase 1) — 1 hour

**Afternoon (4 hours):**
- Producer tiers page at `/studios/producers` — 1 hour
- Bronze membership page at `/studios/membership` — 30 min
- Sponsor inquiry page at `/studios/sponsors` — 30 min
- Affiliate marketplace page at `/studios/affiliates` — 30 min
- About page at `/studios/about` — 30 min
- Mobile responsive QA pass — 30 min
- Deploy to staging, smoke test, screen-record walkthrough for Brett Miller — 30 min

**What ships in 2 days:**
- Every page rendered, beautiful, mobile-responsive
- Episode 1 playable from Cloudflare Stream
- Email gate captures email (stored to a simple Drizzle table or localStorage if backend isn't ready)
- Countdown timer live
- All CTAs working (purchase/producer routes show "Coming soon" or open Stripe sandbox if creds are in by then)

**What requires Phase 2 (week 2 or separate scope):**
- Stripe live integration (depends on Brett Miller setting up Stripe account)
- Backend tRPC router (`studiosRouter`) with episode access grants
- Producer tier checkout to Stripe
- Bronze subscription billing
- Email automation (Resend or platform's existing email infra)
- Sponsor inquiry form to backend
- Admin upload UI for Episodes 2-7

---

## 3. Design system (cinematic Studios theme)

Studios is a sub-brand inside Galileyo. The main app uses cyan/blue with a teal accent (see `globals.css` HSL `--primary: 221.2 83.2% 53.3%`). Studios overlays a cinematic dark theme with a warm gold accent that evokes film prestige.

**Add these CSS variables to `apps/nextjs/src/app/globals.css`** inside a new `.studios-theme` class scope (so they only apply to Studios routes, leaving the rest of the app untouched):

```css
.studios-theme {
  /* Cinematic palette - sits ON TOP of the main app theme */
  --studios-bg: 11 11 13;              /* near-black, deep cinema */
  --studios-surface: 20 20 23;          /* card/panel */
  --studios-surface-hi: 28 28 31;       /* elevated surface */
  --studios-border: 42 42 46;
  --studios-text: 245 245 244;
  --studios-text-muted: 161 161 166;
  --studios-accent: 200 160 74;         /* warm gold */
  --studios-accent-hi: 224 189 102;     /* highlight gold */
  --studios-danger: 201 70 44;          /* used sparingly for countdown urgency */
  --studios-success: 79 157 106;
  --studios-grain: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
}

.studios-theme {
  background: rgb(var(--studios-bg));
  color: rgb(var(--studios-text));
  color-scheme: dark;
}

.studios-grain-overlay::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--studios-grain);
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: 0.4;
}
```

**Typography:**
- Display font (titles, marquee): `Bebas Neue` or `Anton` — heavy condensed sans, movie-poster typography. Load via `next/font/google` in `apps/nextjs/src/lib/fonts.ts`.
- Editorial headings: `Fraunces` (variable weight) — adds warmth for synopsis and bios.
- Body: keep the existing `Inter` (already loaded), kept tight at 15-16px.
- All caps + wide letter spacing on credits, tier labels, section markers.

**Add to `fonts.ts`:**
```ts
import { Bebas_Neue as FontDisplay, Fraunces as FontEditorial } from "next/font/google";

const fontDisplay = FontDisplay({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
});

const fontEditorial = FontEditorial({
  subsets: ["latin"],
  variable: "--font-editorial",
});

// Append to fontVariables
export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontInter.variable,
  fontDisplay.variable,
  fontEditorial.variable,
);
```

**Motion principles** (use the already-installed `motion` library, NOT a new Framer Motion install):
- Page-load: staggered fade-up on hero elements (200ms apart, 600ms duration, ease-out cubic)
- Episode cards: scale 1.02 + warm-glow shadow on hover, 300ms
- Countdown timer: digit flip with film-strip frame animation
- Trailer autoplay muted on hero, with a tasteful unmute affordance
- No bouncy/playful springs anywhere. Everything cinematic, weighted, deliberate

**Layout principles:**
- Generous vertical rhythm (96px+ between major sections on desktop, 64px on mobile)
- Wide hero with letterboxed video and grain overlay
- Asymmetric episode grid: Episode 1 hero card spans 2x, Episodes 2-7 in standard cards
- Sponsor logos: monochrome row, color reveal on hover
- All-caps small-text section markers above section titles ("EPISODE 01 — AVAILABLE NOW")

---

## 4. Information architecture

Add these routes under the existing `(app)` route group. Each is a `page.tsx` server component unless marked `"use client"`.

```
apps/nextjs/src/app/(app)/studios/
├── layout.tsx                     # Studios-specific shell, theme wrapper, nav extension
├── page.tsx                       # Landing
├── episodes/
│   ├── page.tsx                   # All episodes grid (full list)
│   └── [slug]/
│       └── page.tsx               # Episode detail / pre-watch
├── watch/
│   └── [slug]/
│       └── page.tsx               # Gated player page
├── producers/
│   └── page.tsx                   # Producer tiers (film + game) + checkout
├── membership/
│   └── page.tsx                   # Bronze annual signup
├── sponsors/
│   └── page.tsx                   # Sponsor inquiry + media kit
├── affiliates/
│   └── page.tsx                   # Affiliate marketplace
├── about/
│   └── page.tsx                   # Project / cast / crew bios
└── api/
    ├── email-gate/route.ts        # POST: capture email, return signed unlock token
    ├── tier-checkout/route.ts     # POST: create Stripe Checkout Session
    ├── episode-purchase/route.ts  # POST: create Stripe Checkout for single episode
    ├── membership-checkout/route.ts # POST: create Stripe Subscription
    ├── sponsor-inquiry/route.ts   # POST: route to brett@galileyo.com + log
    └── stripe-webhook/route.ts    # POST: handle Stripe events
```

**Global navigation integration:**
Add a "Studios" link to the existing top nav (the `site-header.tsx` or whichever component renders the authenticated nav). On `/studios/*` routes, the `studios/layout.tsx` wraps children in a div with `className="studios-theme"` to scope the cinematic dark theme without breaking the rest of the app.

---

## 5. Page specifications

### 5.1 `/studios` — Landing

**Above the fold (full viewport height):**
- Full-bleed hero video: Episode 1 trailer or first 30 seconds, muted autoplay loop, slight grain overlay
- Studios wordmark top-left, navigation top-right
- Headline: "GALILEYO STUDIOS" (Bebas Neue, oversized, gold accent)
- Subhead: "Original short-form films from the front lines of the new resistance."
- Countdown timer to Episode 1 release date OR to Episode 2 if Episode 1 already shipped (large flip-digit treatment)
- Two CTAs: "Watch Episode 1 Free" (primary, gold) and "Become a Producer" (secondary, outlined)

**Below the fold (in this order):**

1. **Email gate band** — One-field email capture: "Enter your email to unlock Episode 1 free." Submits to `/studios/api/email-gate`, returns a signed cookie that unlocks `/studios/watch/episode-1`.

2. **The Series** — Editorial intro paragraph: what the series is, why it exists, the 7-episode arc. Use Fraunces for warmth.

3. **Episode roadmap** — Asymmetric grid:
   - Episode 1: Hero card (2x size), still or trailer, "Watch Now" CTA
   - Episodes 2-7: Standard cards with "Coming Soon" badge, target release month, locked previews, "Help fund this episode" link to producers page
   - Below grid: "Each episode is funded by you. Become a producer to make it happen."

4. **Become a Producer (FILM)** — 3-tier preview:
   - Associate Producer $50 (digital perks + credit)
   - Contributing Producer $200 (signed merch + community access)
   - Executive Producer $250K (7 slots, on-set visit, equity-style upside, "Inquire" CTA)
   - Progress bar showing $X raised toward $3.5M

5. **Help Build the Game** — Game producer tier:
   - $100+ tier with producer credit on the game
   - Progress bar toward $1M

6. **Bronze Membership upsell** — "$24/year. All 7 episodes, behind-the-scenes, exclusive drops, affiliate discounts. Save $25 vs paying per episode." CTA to `/studios/membership`.

7. **Sponsors strip** — Monochrome logo row: BivyStick, Seekins, Moonshine, plus placeholder slots. "Want to sponsor? Inquire" CTA to `/studios/sponsors`.

8. **Affiliate marketplace teaser** — 3-4 featured offers (Escape Zone 20%, Ghost Phone $200 off), link to full marketplace.

9. **About / Cast strip** — Stills + names of confirmed talent. Link to `/studios/about`. **DO NOT** publish unverified cast names.

10. **Final email gate repeat + footer.**

### 5.2 `/studios/episodes/[slug]` — Episode Detail

- Hero still or trailer
- Episode number, title, runtime, release date
- Synopsis (2-3 paragraphs)
- Featured cast for this episode
- Behind-the-scenes gallery (4-6 stills)
- Product placements in this episode (BivyStick, Seekins, etc.) with affiliate purchase CTAs
- CTA block:
  - If user has access → "Watch Now"
  - If not → "Buy this Episode $7" / "Get All 7 with Bronze $24/year" / "Become a Producer"

### 5.3 `/studios/watch/[slug]` — Gated Player

- **Server-side access check** before rendering (in the server component):
  - Episode 1: check for `studios_ep1_unlock` cookie or authenticated user
  - Episodes 2-7: check for purchase record OR active Bronze OR producer status
  - If no access → redirect to `/studios/episodes/[slug]` with state preserved
- Full-screen video player wrapping existing `video-player.tsx` with cinematic dark surround
- Episode title overlay top-left, fades after 3 seconds
- Post-credits modal: triggered on `ended` event
  - Episode 1: Bronze upsell ("Continue to Episode 2 with Bronze")
  - Episodes 2-6: "Coming next: Episode N+1. Help us make it." → producers page
  - Episode 7: "You made this happen. Share with someone who needs to see it."
- Analytics events fired: `episode_play_start`, `episode_25pct`, `episode_50pct`, `episode_75pct`, `episode_complete`
- For Episode 1 specifically: video source is the Cloudflare Stream HLS URL stored in env var `NEXT_PUBLIC_EPISODE_1_HLS_URL`

### 5.4 `/studios/producers` — Producer Tiers + Checkout

- Hero: "Fund the Films. Get the Credit."
- Plain-language explanation of the Pay-It-Forward model (rewritten in Galileyo's voice, not Angel Studios' copy)
- Two parallel tier stacks side-by-side on desktop, stacked on mobile:

**Film tiers:**
- Associate Producer — $50: name in end credits of one episode, digital download of all 7 episodes, signed digital poster
- Contributing Producer — $200: above + physical signed poster, exclusive community access, behind-the-scenes feature-length cut
- Executive Producer — $250,000 (7 slots): above + on-set visit, dinner with the Bretts, screen credit as Executive Producer, equity-style upside per producer agreement. CTA is "Schedule a Call" (not direct checkout — captures phone/email and routes to brett@galileyo.com)

**Game tiers:**
- Game Producer — $100+: free game on release, producer credit in the game

- Each tier card: name, price, inclusions checklist, CTA button, progress indicator showing how many of that tier have signed up so far (creates social proof and urgency)
- Checkout flow: Stripe Checkout Session. Form captures name (for credits), email, tier selection, payment.
- Confirmation page: "You're a producer. Welcome to the team." Includes next steps, social share assets, and a CTA to claim Bronze access (which is included with any tier $200+).

### 5.5 `/studios/membership` — Bronze

- Pricing card: $24/year
- Inclusions checklist:
  - All 7 episodes
  - Behind-the-scenes content
  - Exclusive drops every week
  - Affiliate discounts (Escape Zone, Ghost Phone, etc.)
  - "Join the Bretts as they work on Part 2" backstage access
  - Ad-free playback (decision: include in Bronze by default — otherwise Bronze pitch weakens against per-episode + ad-free upgrade math)
- Comparison row: pay per episode ($7 × 7 = $49) vs Bronze ($24, save $25)
- Stripe Subscription checkout
- Post-purchase: user account flagged with `bronze_active = true` and `bronze_expires_at = timestamp`

### 5.6 `/studios/sponsors` — Sponsor Inquiry

- Hero: "Reach the people the rest of media can't."
- Audience demographics block:
  - Size (current Galileyo user count, growing)
  - Age skew (35yo male primary, expanding)
  - Geographic, psychographic notes
- CPM card: $5–$10 CPM, projected impressions per episode
- Sponsor inventory grid:
  - On-screen product placement (3 slots per episode)
  - End-card sponsor reads
  - Affiliate marketplace listing
  - Banner placements across Galileyo platform
  - Podcast read-ins if applicable
- Media kit download (PDF, hosted on platform's file storage or simple `/public/studios/galileyo-studios-media-kit.pdf`)
- Inquiry form: company, contact, sponsorship interest, budget range
- Submits to `/studios/api/sponsor-inquiry`, posts to brett@galileyo.com and logs to backend

### 5.7 `/studios/affiliates` — Affiliate Marketplace

- Grid of partner offers with logo, discount, short description, outbound affiliate link
- Launch offers (subject to confirmation by Brett Miller):
  - Escape Zone backpacks: 20% off
  - Ghost Phone: $200 off ($2K SKU)
  - Plus 4-6 additional slots as signed
- "Become an affiliate" CTA at the bottom: form for partners who want to list their offer

### 5.8 `/studios/about` — Project + Cast + Crew

- Project intro (the "why" of the series)
- Cast bios with stills (confirmed talent only, no speculation)
- Crew bios
- Optional embed of a behind-the-scenes mini-doc
- "Verified on Galileyo" badge call-out for cast members who have Galileyo accounts

---

## 6. Component inventory

Build these in `apps/nextjs/src/components/studios/`. All components use the existing `@galileyo/ui` (shadcn) primitives where possible and Tailwind utilities scoped via `.studios-theme`.

| Component | Purpose | Notes |
|---|---|---|
| `StudiosShell` | Layout wrapper for all /studios routes | Sets theme, nav, footer, applies `.studios-theme` class |
| `StudiosNav` | Top navigation extension | Adds Studios menu items, preserves Galileyo nav |
| `StudiosFooter` | Footer with Studios-specific links | Sponsor inquiry, affiliate, about, account |
| `HeroVideo` | Full-bleed muted autoplay trailer | Uses existing video-player.tsx, grain overlay, unmute affordance |
| `CountdownTimer` | Flip-digit countdown to next episode release | Configurable target date prop, uses `react-timer-hook` (already installed) |
| `EpisodeCard` | Episode preview card | Two variants: `hero` (2x size, Episode 1) and `standard` (smaller, Episodes 2-7) |
| `EpisodeGrid` | Asymmetric grid layout | CSS grid with named areas, responsive collapse |
| `EmailGate` | One-field email capture | Submits to API, sets unlock cookie, success state |
| `ProducerTierCard` | Tier display + CTA | Variants: `associate`, `contributing`, `executive`, `game` |
| `BronzeUpsellCard` | Annual membership pitch | Includes per-episode vs annual math |
| `SponsorLogoStrip` | Monochrome partner logos with hover color | Auto-marquee or static grid |
| `AffiliateOfferCard` | Partner offer with discount + outbound link | Tracks click event via PostHog (already installed) |
| `WatchPlayer` | Gated wrapper around video-player.tsx | Server-side access check before mount, post-credits modal |
| `PostCreditsUpsell` | Modal triggered on episode end | Bronze upsell or next-episode producer CTA |
| `CastBio` | Headshot + bio block | Used on About and Episode detail pages |
| `SponsorInquiryForm` | Form on /sponsors | Validates with Zod, submits to API |
| `FundingProgress` | Progress bar showing $ raised vs target | Used on producer tier cards |
| `StudiosBrand` | Reusable wordmark/lockup | SVG, scales clean |

---

## 7. Integrations

### 7.1 Cloudflare Stream (video hosting)

**Why Cloudflare Stream:**
- Galileyo already uses Cloudflare (per the gateway timeout incident — confirmed)
- HLS-native output, plugs into existing `hls.js` player with zero changes
- Simple pricing, no upload UI required for Phase 1 (Brett Miller uploads manually via Cloudflare dashboard)
- Signed URL support for paywalled episodes

**Setup steps for Brett:**
1. Ask Brett Miller for Cloudflare account access (or for him to upload Episode 1 himself and share the HLS URL)
2. Upload Episode 1 to Cloudflare Stream
3. Copy the HLS playback URL (looks like `https://customer-XXXX.cloudflarestream.com/VIDEO_UID/manifest/video.m3u8`)
4. Set `NEXT_PUBLIC_EPISODE_1_HLS_URL` env var
5. For Episodes 2-7 (paywalled): use signed URLs with short expiration, generated server-side per request after access check

**Episode 1 stays public** (no signed URL needed) since access is email-gated rather than payment-gated.

### 7.2 Stripe (payments)

**Add Stripe to the project:**

```bash
cd apps/nextjs
pnpm add stripe @stripe/stripe-js
```

**Env vars to add:**
```
STRIPE_SECRET_KEY=sk_live_or_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_or_test_xxx
```

**Stripe Products to create (in Stripe dashboard):**
- `episode_single` — $7 one-time, metadata `{ episode_slug: "episode-N" }` (one product, set price per episode in checkout)
- `bronze_annual` — $24/year recurring
- `producer_associate` — $50 one-time
- `producer_contributing` — $200 one-time
- `producer_executive` — $250,000 one-time (likely not used via Checkout, gated behind "Schedule a Call")
- `game_producer` — $100 one-time (or variable amount)

**Checkout flow:**
- Frontend POSTs to `/studios/api/tier-checkout` (or episode-purchase, membership-checkout) with the product type and any metadata (e.g., name for credits)
- Backend creates Stripe Checkout Session with `mode: payment` or `mode: subscription`, returns session URL
- Frontend redirects to Stripe Checkout
- On success, Stripe redirects to `/studios/producers/success` (or equivalent)
- Stripe webhook at `/studios/api/stripe-webhook` processes the event and grants access via Drizzle

**Note on Stripe vs existing Authorize.net:**
The platform's main subscription system uses Authorize.net for the regular Galileyo subscription. Studios uses Stripe for Studios-specific revenue. This is intentional separation — Studios revenue is tracked independently for accounting and producer-tier compliance.

### 7.3 Email capture and transactional email

- Email-gate captures go to the existing user database via tRPC (`studiosRouter.captureEmail`) — write into the existing `user` table with a flag, or a new `studios_email_signup` table
- Transactional email: use Resend if Brett Miller approves. If not, use the platform's existing email infra (the `@galileyo/emails` package with React Email templates). Add new templates:
  - `studios-welcome.tsx` — sent on email gate signup with Episode 1 link
  - `studios-purchase-receipt.tsx` — sent on episode purchase
  - `studios-bronze-welcome.tsx` — sent on Bronze subscription
  - `studios-producer-welcome.tsx` — sent on producer tier purchase, includes credit confirmation

### 7.4 Analytics

PostHog is already installed (`posthog-js`, `posthog-node`). Fire these events:

- `studios_page_view` with `{ route }`
- `studios_email_gate_submitted` with `{ email_domain }` (don't log the full email)
- `studios_episode_play_start` with `{ episode_slug }`
- `studios_episode_progress` with `{ episode_slug, percent }` at 25/50/75
- `studios_episode_complete` with `{ episode_slug }`
- `studios_producer_tier_view` with `{ tier }`
- `studios_producer_tier_checkout_start` with `{ tier }`
- `studios_producer_tier_purchased` with `{ tier, amount }`
- `studios_bronze_view`
- `studios_bronze_purchased`
- `studios_sponsor_inquiry_submitted`
- `studios_affiliate_click` with `{ partner_id }`

---

## 8. Backend (tRPC router additions)

Create `packages/api/src/router/studios.ts` (plural, to avoid collision with existing `studio.ts`):

```ts
import { TRPCRouterRecord } from "@trpc/server";
import { eq, and, gte } from "drizzle-orm";
import { z } from "zod/v4";
import { db } from "@galileyo/db/client";
import { publicProcedure, protectedProcedure } from "../trpc";

export const studiosRouter = {
  // Public: list all episodes with public metadata
  listEpisodes: publicProcedure.query(async () => {
    // Returns episodes ordered by episode_number
  }),

  // Public: get a single episode's public metadata
  getEpisode: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      // Returns episode public fields only
    }),

  // Public: capture email for Episode 1 unlock
  captureEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      // Upsert email, return signed unlock token
    }),

  // Protected: check user's access to a specific episode
  checkAccess: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      // Returns { hasAccess: boolean, reason: 'free' | 'email_gate' | 'purchase' | 'bronze' | 'producer' | 'none' }
    }),

  // Protected: get current user's Studios status (Bronze, episodes purchased, producer tier)
  getMyStatus: protectedProcedure.query(async ({ ctx }) => {
    // Returns user's Studios subscription/purchase state
  }),

  // Public: submit sponsor inquiry
  submitSponsorInquiry: publicProcedure
    .input(z.object({
      company: z.string().min(1),
      contactName: z.string().min(1),
      email: z.string().email(),
      phone: z.string().optional(),
      budgetRange: z.string().optional(),
      interest: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Insert into sponsor_inquiries table, email brett@galileyo.com
    }),
} satisfies TRPCRouterRecord;
```

Register it in `packages/api/src/root.ts`:

```ts
import { studiosRouter } from "./router/studios";

export const appRouter = createTRPCRouter({
  // ...existing routers
  studios: studiosRouter,
});
```

**Drizzle schema additions** in `packages/db/src/schema/studios.ts`:

```ts
import { mysqlTable, int, varchar, text, datetime, boolean, decimal } from "drizzle-orm/mysql-core";

export const studiosEpisode = mysqlTable("studios_episode", {
  id: int("id").primaryKey().autoincrement(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  episodeNumber: int("episode_number").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  releaseDate: datetime("release_date"),
  runtimeSeconds: int("runtime_seconds"),
  synopsis: text("synopsis"),
  heroStillUrl: varchar("hero_still_url", { length: 500 }),
  trailerHlsUrl: varchar("trailer_hls_url", { length: 500 }),
  fullHlsUrl: varchar("full_hls_url", { length: 500 }),
  status: varchar("status", { length: 32 }).default("coming_soon"), // coming_soon | released | archived
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

export const studiosEmailSignup = mysqlTable("studios_email_signup", {
  id: int("id").primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  unlockedEpisodes: text("unlocked_episodes"), // JSON array of slugs
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

export const studiosAccessGrant = mysqlTable("studios_access_grant", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").notNull(),
  episodeId: int("episode_id").notNull(),
  source: varchar("source", { length: 32 }).notNull(), // purchase | bronze | producer | email_gate
  grantedAt: datetime("granted_at").$defaultFn(() => new Date()),
  expiresAt: datetime("expires_at"),
});

export const studiosBronzeSubscription = mysqlTable("studios_bronze_subscription", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id").unique().notNull(),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 255 }),
  status: varchar("status", { length: 32 }).default("active"), // active | canceled | past_due
  startedAt: datetime("started_at").$defaultFn(() => new Date()),
  expiresAt: datetime("expires_at"),
});

export const studiosProducer = mysqlTable("studios_producer", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("user_id"),
  tier: varchar("tier", { length: 32 }).notNull(), // associate | contributing | executive | game
  nameForCredits: varchar("name_for_credits", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  stripePaymentIntentId: varchar("stripe_payment_intent_id", { length: 255 }),
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});

export const studiosSponsorInquiry = mysqlTable("studios_sponsor_inquiry", {
  id: int("id").primaryKey().autoincrement(),
  company: varchar("company", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 64 }),
  budgetRange: varchar("budget_range", { length: 64 }),
  interest: text("interest"),
  notes: text("notes"),
  status: varchar("status", { length: 32 }).default("new"), // new | contacted | closed
  createdAt: datetime("created_at").$defaultFn(() => new Date()),
});
```

Then export from `packages/db/src/schema/index.ts` and run `pnpm db:push` to apply.

---

## 9. Quality standards (non-negotiable)

- TypeScript strict mode, no `any`
- ESLint zero warnings (`pnpm lint`)
- All imports use the existing alias patterns (`~/` for app-local, `@galileyo/*` for packages)
- All UI uses existing shadcn primitives from `@galileyo/ui` where possible
- No em dashes anywhere in user-facing copy or code comments (Brett Raio standard)
- All API base URLs from environment variables, never hardcoded
- Mobile-first responsive (design for 375px width first, scale up)
- All images use Next.js `Image` component with proper sizing
- All forms: loading + success + error states
- All paid/gated routes do server-side auth checks (server components or middleware), never client-only gating
- Commit messages: conventional commits (`feat:`, `fix:`, `chore:`)
- All new components have `"use client"` only where actually needed (server components by default)
- All new env vars added to `.env.example` and the env validation in `apps/nextjs/src/env/`

---

## 10. Open questions (resolve via scope email — see §13.4)

1. **Branch confirmation**: Which branch is the active integration target? (See §11 — verify don't assume)
2. **Episode 1 final HLS URL**: When is Cloudflare upload happening, who has Cloudflare access?
3. **Stripe account**: Is Brett Miller setting up a Galileyo Stripe account or using an existing one?
4. **Cast confirmations**: Which talent is contractually attached and approved for public listing?
5. **Music licensing**: Has Brett Miller decided on the path (license, replace, or ship unlicensed)? Brett Raio offered to produce replacement music.
6. **Kling AI positioning**: Hidden, sponsor, or quietly credited?
7. **Episode release dates**: Required for countdown timer.
8. **Bronze + ad-free question**: Confirm ad-free is included with Bronze (recommended) vs being a separate $7.99 tier.
9. **Sponsor confirmations**: BivyStick, Seekins, Moonshine — which are signed sponsors (logos approved for display) vs pitched?
10. **Affiliate offers**: Escape Zone, Ghost Phone — confirmed affiliate codes and copy?
11. **Producer tier perks**: Detailed inclusions per tier — confirm or expand?
12. **Backend ownership**: Is Andras willing to take the API contract and ship the tRPC additions, or does Brett Raio write them and PR for review?

---

## 11. Branch verification (do this FIRST, before any code)

Run these commands locally after cloning the repo:

```bash
git fetch --all
git log --oneline -20 main
git log --oneline -20 development
git log --oneline -20 production

# Show last commit date on each
git for-each-ref --sort=-committerdate refs/heads/ refs/remotes/origin/ --format='%(committerdate:short) %(refname:short)'

# Show what's on staging deployment
# Visit next.galileyo and check the git SHA in the page source if exposed,
# or ask Brett Miller directly: "Which branch is next.galileyo deployed from?"
```

**Then ask Brett Miller in writing:**

> Quick branch confirmation before I start pushing: I see `main`, `development`, and `production` branches. Which one should I open PRs against for the Studios work? And which branch is `next.galileyo` currently deploying from?

Do not commit anything until both questions are answered. If the answer is `development`, branch from it. If it's `main`, branch from `main`. The branch name doesn't matter — what matters is matching the team's actual workflow.

---

## 12. Phase 0 → Phase 1 → Phase 2 sequence

### Phase 0 — Discovery (1 hour, before any code)
- Branch verification (§11)
- Read the repo via Claude Code with the prompt in §13.1
- Confirm: existing auth hook name, tRPC client setup, global nav component location, shadcn theme variables
- Report back to Brett Raio with discovery summary before Phase 1

### Phase 1 — UI shell + landing + episode detail (Day 1)
- Studios route group, layout, theme
- Landing page with all 10 sections
- Episode detail page
- Mocked email gate (stores to localStorage if backend isn't ready)
- All CTAs route to placeholder pages
- Use Claude Code prompt in §13.2

### Phase 2 — Watch player + producer/Bronze/sponsor pages (Day 2)
- Watch page wired to Cloudflare Stream (Episode 1)
- Producer tiers page
- Bronze membership page
- Sponsor inquiry page
- Affiliate marketplace
- About page
- Mobile QA pass
- Deploy to staging
- Use Claude Code prompt in §13.3

### Phase 3 — Backend wiring (Week 2, separate scope if needed)
- tRPC `studiosRouter` implementation
- Drizzle schema migrations
- Stripe Checkout integration
- Stripe webhook handler
- Email automation (Resend or existing infra)
- Admin upload UI for Episodes 2-7

---

## 13. Claude Code prompts (copy-paste ready)

See separate files:
- `STUDIOS_PHASE_0_PROMPT.md` — Discovery prompt
- `STUDIOS_PHASE_1_PROMPT.md` — Phase 1 build (Day 1)
- `STUDIOS_PHASE_2_PROMPT.md` — Phase 2 build (Day 2)
- `STUDIOS_SCOPE_EMAIL.md` — Email to Brett Miller

---

**End of blueprint.** Place this as `STUDIOS_BLUEPRINT.md` at repo root.
