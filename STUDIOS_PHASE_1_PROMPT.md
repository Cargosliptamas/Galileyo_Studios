# Phase 1 — Claude Code Build Prompt (Day 1)

**Use this AFTER Phase 0 discovery is complete and Brett Raio has given the green light.**

---

You have completed Phase 0 discovery on the Galileyo repo. You have read `STUDIOS_BLUEPRINT.md` and confirmed the codebase facts. Brett Raio has reviewed your discovery report and approved Phase 1.

Your job in Phase 1 is to ship a complete, beautiful, deployable Studios landing experience to the staging environment in one work session. Quality bar: production-grade, cinematic, and visibly better than the rest of the Galileyo platform (this is the showcase work).

## Non-negotiable rules

1. No em dashes anywhere. Use commas, periods, parentheses, or rewrites.
2. TypeScript strict, no `any`. ESLint zero warnings.
3. Server components by default. `"use client"` only where actually needed (forms, motion, interactivity).
4. Mobile-first responsive (375px first, scale up).
5. All hardcoded URLs go in env vars or constants files, never inline.
6. Use existing `@galileyo/ui` shadcn primitives whenever possible. Do not reinstall shadcn or duplicate components.
7. Use the already-installed `motion` library for animations. Do not install Framer Motion separately.
8. Use existing `react-timer-hook` for the countdown. Do not install a separate countdown library.
9. Match the existing import patterns (`~/` for app-local, `@galileyo/*` for packages).
10. Commit messages: conventional commits.

## Branch and commit strategy

Create a feature branch from the integration branch confirmed by Brett Miller:
```
git checkout -b feat/studios-foundation
```

Commit in logical chunks (theme tokens, layout, then each landing section), not as one giant commit. Open a draft PR early so Brett Raio can see progress.

## Step 1 — Theme tokens (commit 1)

Add to `apps/nextjs/src/app/globals.css` at the end of the file, before the keyframes section. Wrap in a `.studios-theme` scope so it does not bleed into the rest of the app:

```css
/* Galileyo Studios cinematic theme */
.studios-theme {
  --studios-bg: 11 11 13;
  --studios-surface: 20 20 23;
  --studios-surface-hi: 28 28 31;
  --studios-border: 42 42 46;
  --studios-text: 245 245 244;
  --studios-text-muted: 161 161 166;
  --studios-accent: 200 160 74;
  --studios-accent-hi: 224 189 102;
  --studios-danger: 201 70 44;
  --studios-success: 79 157 106;

  background: rgb(var(--studios-bg));
  color: rgb(var(--studios-text));
  color-scheme: dark;
  position: relative;
}

.studios-theme .studios-text-muted {
  color: rgb(var(--studios-text-muted));
}

.studios-grain::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.08'/%3E%3C/svg%3E");
  pointer-events: none;
  mix-blend-mode: overlay;
  opacity: 0.4;
  z-index: 1;
}

@keyframes studios-fade-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

.studios-fade-up {
  animation: studios-fade-up 600ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

Add to `apps/nextjs/src/lib/fonts.ts`:

```ts
import { Bebas_Neue as FontDisplay, Fraunces as FontEditorial } from "next/font/google";

const fontDisplay = FontDisplay({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-display",
  display: "swap",
});

const fontEditorial = FontEditorial({
  subsets: ["latin"],
  variable: "--font-editorial",
  display: "swap",
});

// Update fontVariables export to include these
export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontInter.variable,
  fontDisplay.variable,
  fontEditorial.variable,
);
```

Add to `apps/nextjs/tailwind.config.ts` (extend the theme):

```ts
fontFamily: {
  display: ["var(--font-display)", "ui-sans-serif", "system-ui"],
  editorial: ["var(--font-editorial)", "ui-serif", "Georgia"],
},
```

Commit: `feat(studios): add cinematic theme tokens and display fonts`

## Step 2 — Route group, layout, shell (commit 2)

Create the directory structure:

```
apps/nextjs/src/app/(app)/studios/
├── layout.tsx
├── page.tsx
├── episodes/
│   ├── page.tsx
│   └── [slug]/
│       └── page.tsx
├── watch/
│   └── [slug]/
│       └── page.tsx
├── producers/
│   └── page.tsx
├── membership/
│   └── page.tsx
├── sponsors/
│   └── page.tsx
├── affiliates/
│   └── page.tsx
└── about/
    └── page.tsx
```

`apps/nextjs/src/app/(app)/studios/layout.tsx` (server component):

```tsx
import type { Metadata } from "next";
import { StudiosNav } from "~/components/studios/studios-nav";
import { StudiosFooter } from "~/components/studios/studios-footer";

export const metadata: Metadata = {
  title: { template: "%s | Galileyo Studios", default: "Galileyo Studios" },
  description: "Original short-form films from the front lines of the new resistance.",
};

export default function StudiosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="studios-theme font-editorial min-h-screen">
      <StudiosNav />
      <main>{children}</main>
      <StudiosFooter />
    </div>
  );
}
```

Build `apps/nextjs/src/components/studios/studios-nav.tsx` and `studios-footer.tsx` as client/server components per need. The nav should preserve the user's authenticated state (read session via `getSession()` from `~/auth/server`) and show: Studios wordmark left, links (Episodes, Producers, Membership, Sponsors), and user avatar/menu on the right.

Stub the other route pages with a minimal `export default function Page() { return <div className="p-12">Coming soon</div>; }` so the routes work and navigation can be tested.

Commit: `feat(studios): scaffold route group, layout, nav, footer`

## Step 3 — Landing page sections (commits 3-7)

Build the landing page in `apps/nextjs/src/app/(app)/studios/page.tsx` by composing section components from `apps/nextjs/src/components/studios/`. Each section is its own file. Compose them in this order in `page.tsx`:

1. `<StudiosHero />` — Above-the-fold with countdown, headline, dual CTAs, autoplay trailer background
2. `<StudiosEmailGate />` — Email capture band
3. `<StudiosSeriesIntro />` — Editorial intro paragraph
4. `<StudiosEpisodeRoadmap />` — Asymmetric 7-episode grid
5. `<StudiosProducerTiersPreview />` — 3 film tiers card
6. `<StudiosGameProducerCard />` — Game tier card
7. `<StudiosBronzeUpsell />` — Annual membership pitch
8. `<StudiosSponsorStrip />` — Monochrome logo row
9. `<StudiosAffiliateTeaser />` — 3-4 featured offers
10. `<StudiosAboutStrip />` — Cast preview

### StudiosHero requirements

- Full viewport height on desktop (`min-h-screen`), 80vh on mobile
- Background: muted autoplay HTML5 video element loading Episode 1 trailer or first 30 sec
- Source: `process.env.NEXT_PUBLIC_EPISODE_1_TRAILER_URL` (env-driven, can be empty for now)
- Fallback: a dark gradient with subtle moving particles if no trailer URL
- Dark gradient overlay 70% on the video so text is readable
- Studios wordmark top-left, nav already in layout
- Centered content:
  - Small all-caps marker: "EPISODE 01 — AVAILABLE NOW" in gold accent
  - Headline: "GALILEYO STUDIOS" in Bebas Neue (font-display), `text-7xl md:text-9xl`, gold
  - Subhead: "Original short-form films from the front lines of the new resistance." in editorial font
  - Countdown timer (use `react-timer-hook`): days, hours, minutes, seconds to Episode 2 release date (env: `NEXT_PUBLIC_NEXT_EPISODE_DATE`, fallback to a 30-day future date)
  - Two CTAs: "Watch Episode 1 Free" (gold filled, large) and "Become a Producer" (gold outlined)
- Subtle film-grain overlay (use `.studios-grain` utility)
- All elements use `studios-fade-up` animation with staggered `animation-delay` (0ms, 100ms, 200ms, 300ms)

### StudiosEpisodeRoadmap requirements

CSS Grid with named template areas:
- Desktop: Episode 1 spans 2 columns + 2 rows, Episodes 2-7 fill remaining cells
- Mobile: single column stack, Episode 1 first

Each card:
- `aspect-video` poster image (or placeholder if no still)
- Episode number badge top-left (Bebas Neue, gold)
- "AVAILABLE NOW" badge (Episode 1) or "COMING [MONTH]" badge (Episodes 2-7) top-right
- Title in display font at bottom of card
- Hover: scale 1.02, gold ring shadow
- Episode 1 card has a play icon overlay
- Episodes 2-7 cards have a lock icon overlay and "Help fund this episode" link

Episodes data — create `apps/nextjs/src/lib/studios/episodes.ts`:

```ts
export const EPISODES = [
  {
    slug: "episode-1",
    number: 1,
    title: "The AI Apocalypse",
    status: "available",
    releaseLabel: "Available Now",
    releaseDate: "2026-05-19",
    runtime: 1500, // 25 min in seconds
    synopsis: "The world breaks under the weight of artificial intelligence. A former soldier finds a girl who needs saving and a fight worth having.",
    heroStill: "/studios/stills/episode-1-hero.jpg",
  },
  {
    slug: "episode-2",
    number: 2,
    title: "How It All Started",
    status: "coming_soon",
    releaseLabel: "Coming July 2026",
    releaseDate: "2026-07-04",
    synopsis: "A flashback to the days before everything fell apart.",
    heroStill: "/studios/stills/episode-2-hero.jpg",
  },
  {
    slug: "episode-3",
    number: 3,
    title: "Martial Law",
    status: "coming_soon",
    releaseLabel: "Coming August 2026",
    synopsis: "The city goes under boot. The camps fill up.",
    heroStill: "/studios/stills/episode-3-hero.jpg",
  },
  {
    slug: "episode-4",
    number: 4,
    title: "The Raid",
    status: "coming_soon",
    releaseLabel: "Coming September 2026",
    synopsis: "Friends become an army. The first organized strike.",
    heroStill: "/studios/stills/episode-4-hero.jpg",
  },
  {
    slug: "episode-5",
    number: 5,
    title: "Episode 5",
    status: "coming_soon",
    releaseLabel: "Coming October 2026",
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-5-hero.jpg",
  },
  {
    slug: "episode-6",
    number: 6,
    title: "Episode 6",
    status: "coming_soon",
    releaseLabel: "Coming November 2026",
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-6-hero.jpg",
  },
  {
    slug: "episode-7",
    number: 7,
    title: "Episode 7",
    status: "coming_soon",
    releaseLabel: "Coming December 2026",
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-7-hero.jpg",
  },
] as const;

export type Episode = (typeof EPISODES)[number];
```

### StudiosProducerTiersPreview requirements

Three tier cards side by side on desktop (`grid-cols-1 md:grid-cols-3 gap-6`), each with:
- Tier name in display font (Bebas Neue)
- Price in large gold text
- Three to five-line inclusions checklist with checkmark icons
- CTA button — Associate and Contributing route to `/studios/producers#associate` and `#contributing` (with anchor for scroll); Executive opens a modal: "Limited to 7 slots. Schedule a call." with email contact form

Below the three cards: a funding progress bar with `$0 / $3,500,000 raised — Help us reach the next milestone`.

### StudiosGameProducerCard requirements

Single horizontal card below film tiers:
- Left: Game producer offer ($100+, free game on release, producer credit)
- Right: progress toward $1M with milestone markers

### StudiosBronzeUpsell requirements

Big horizontal card with the math front and center:
- Headline: "Bronze All-Access. $24 a year."
- Three-column comparison: Pay-per-episode ($49 total), Bronze ($24), Save column ($25)
- Inclusions list: all 7 episodes, ad-free, BTS, weekly drops, affiliate discounts, "Build the next episode with the Bretts"
- CTA: "Get Bronze All-Access"

### StudiosSponsorStrip requirements

Monochrome row of partner logos: BivyStick, Seekins, Moonshine, and 2-3 placeholder gray boxes. Hover reveals color. Below: "Want to sponsor? Reach the people the rest of media can't." CTA link to `/studios/sponsors`.

### StudiosAffiliateTeaser requirements

Three cards: Escape Zone (20% off backpacks), Ghost Phone ($200 off), and one more. Each card has logo, discount line, and outbound affiliate link. Below: "See all partner deals" link to `/studios/affiliates`.

### StudiosAboutStrip requirements

Horizontal row of 4-6 cast preview cards (headshot + name + role). Below: "Meet the team behind the resistance" link to `/studios/about`.

Use placeholder photos if no cast stills are available yet. Add visible "Cast list pending confirmation" note for Brett Raio's review.

## Step 4 — Email gate API stub (commit 8)

Create `apps/nextjs/src/app/(app)/studios/api/email-gate/route.ts`:

```ts
import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { cookies } from "next/headers";
import { createHmac } from "crypto";

const Schema = z.object({ email: z.string().email() });

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const { email } = parsed.data;

  // Generate signed unlock token (Phase 1 stub — Phase 3 writes to DB)
  const secret = process.env.STUDIOS_UNLOCK_SECRET ?? "phase1-dev-secret-replace-me";
  const payload = JSON.stringify({ email, episode: "episode-1", iat: Date.now() });
  const sig = createHmac("sha256", secret).update(payload).digest("hex");
  const token = Buffer.from(payload).toString("base64url") + "." + sig;

  const cookieStore = await cookies();
  cookieStore.set("studios_unlock", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  return NextResponse.json({ success: true });
}
```

Also add a helper at `apps/nextjs/src/lib/studios/access.ts`:

```ts
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

export async function hasEpisode1Access(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("studios_unlock")?.value;
  if (!token) return false;

  const [encodedPayload, sig] = token.split(".");
  if (!encodedPayload || !sig) return false;

  const secret = process.env.STUDIOS_UNLOCK_SECRET ?? "phase1-dev-secret-replace-me";
  const payload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
  const expectedSig = createHmac("sha256", secret).update(payload).digest("hex");

  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expectedSig, "hex"))) {
      return false;
    }
    const parsed = JSON.parse(payload);
    return parsed.episode === "episode-1";
  } catch {
    return false;
  }
}
```

Add to `.env.example`:
```
STUDIOS_UNLOCK_SECRET=replace-with-random-32-char-string
NEXT_PUBLIC_EPISODE_1_HLS_URL=https://customer-XXXX.cloudflarestream.com/VIDEO_UID/manifest/video.m3u8
NEXT_PUBLIC_EPISODE_1_TRAILER_URL=
NEXT_PUBLIC_NEXT_EPISODE_DATE=2026-07-04T00:00:00Z
NEXT_PUBLIC_STUDIOS_FUNDING_FILM_CURRENT=0
NEXT_PUBLIC_STUDIOS_FUNDING_FILM_TARGET=3500000
NEXT_PUBLIC_STUDIOS_FUNDING_GAME_CURRENT=0
NEXT_PUBLIC_STUDIOS_FUNDING_GAME_TARGET=1000000
```

Add to env validation in `apps/nextjs/src/env/server.ts` and `client.ts` as appropriate.

Commit: `feat(studios): email gate API and access cookie`

## Step 5 — Episode detail page (commit 9)

Build `apps/nextjs/src/app/(app)/studios/episodes/[slug]/page.tsx` (server component).

For each episode, render:
- Hero with still image (large)
- Episode number badge, title in display font, runtime, release status
- Synopsis in editorial font
- "Featured cast" row (use placeholder if not confirmed)
- "Featured in this episode" row showing product placements with affiliate links (BivyStick, Seekins, Moonshine)
- Behind-the-scenes gallery (4-6 stills, can be placeholders for now)
- Access CTA block:
  - Episode 1 + has access: "Watch Now" → `/studios/watch/episode-1`
  - Episode 1 + no access: Email gate inline form
  - Episodes 2-7: "This episode is in production. Help fund it." → producers page

If `params.slug` doesn't match an episode in `EPISODES`, call `notFound()`.

Commit: `feat(studios): episode detail page with access-aware CTAs`

## Step 6 — Push and screen-record

After all commits:

```bash
git push origin feat/studios-foundation
```

Open a draft PR. Title: `Studios: Phase 1 foundation, landing, episode detail`. Description: link to STUDIOS_BLUEPRINT.md and list the commits in order.

Record a 60-90 second screen capture walking through the landing page on desktop and mobile. Share with Brett Raio.

## Stop point

Phase 1 ends here. The watch player and producer/Bronze/sponsor pages come in Phase 2 (next session). Do not build them in this prompt.

## Quality checklist before pushing

- [ ] `pnpm typecheck` passes with no errors
- [ ] `pnpm lint` passes with zero warnings
- [ ] `pnpm build` succeeds
- [ ] Visit `/studios` on dev server: landing renders, all sections present, theme applied
- [ ] Visit `/studios/episodes/episode-1`: detail page renders
- [ ] Navigate via the Studios nav between routes — no 404s
- [ ] Resize to 375px width: mobile layout works
- [ ] No console errors in browser devtools
- [ ] No em dashes anywhere (search the diff for `—`)
- [ ] All env vars added to `.env.example`
