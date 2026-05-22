# Phase 2 — Claude Code Build Prompt (Day 2)

**Use this AFTER Phase 1 has been merged or is in a working PR state and Brett Raio has reviewed.**

---

Phase 1 shipped the landing and episode detail pages. Phase 2 finishes the remaining routes and wires Episode 1 to the actual Cloudflare Stream URL.

## Branch strategy

Continue on the same feature branch or create `feat/studios-watch-and-tiers` if Phase 1 is already merged.

## Step 1 — Watch player (commit 1)

Build `apps/nextjs/src/app/(app)/studios/watch/[slug]/page.tsx` as a server component.

```tsx
import { notFound, redirect } from "next/navigation";
import { EPISODES } from "~/lib/studios/episodes";
import { hasEpisode1Access } from "~/lib/studios/access";
import { StudiosWatchClient } from "~/components/studios/studios-watch-client";

export default async function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const episode = EPISODES.find((e) => e.slug === slug);
  if (!episode) notFound();

  // Access check
  if (slug === "episode-1") {
    const ok = await hasEpisode1Access();
    if (!ok) redirect(`/studios/episodes/${slug}`);
  } else {
    // Phase 3 will check purchase / Bronze / producer status here
    redirect(`/studios/episodes/${slug}`);
  }

  const hlsUrl = process.env.NEXT_PUBLIC_EPISODE_1_HLS_URL;
  if (!hlsUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <p className="font-display text-3xl text-amber-400">Episode 1 video URL not configured</p>
          <p className="mt-4 text-sm opacity-70">Set NEXT_PUBLIC_EPISODE_1_HLS_URL in env vars.</p>
        </div>
      </div>
    );
  }

  return <StudiosWatchClient episode={episode} src={hlsUrl} />;
}
```

Build `apps/nextjs/src/components/studios/studios-watch-client.tsx` as a client component:

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { VideoPlayer } from "~/components/video/video-player"; // existing
import { PostCreditsUpsell } from "./post-credits-upsell";
import type { Episode } from "~/lib/studios/episodes";

export function StudiosWatchClient({ episode, src }: { episode: Episode; src: string }) {
  const [showUpsell, setShowUpsell] = useState(false);
  const router = useRouter();

  // The existing VideoPlayer accepts `src` for HLS. Wrap it in cinematic chrome.
  // Track 'ended' event to trigger post-credits upsell.

  return (
    <div className="relative min-h-screen bg-black">
      <div className="fixed left-6 top-6 z-30">
        <button
          onClick={() => router.push(`/studios/episodes/${episode.slug}`)}
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/20"
        >
          ← Back
        </button>
      </div>

      <div className="absolute left-6 top-20 z-20 max-w-md">
        <p className="font-display text-xs uppercase tracking-widest text-amber-400">
          Episode {String(episode.number).padStart(2, "0")}
        </p>
        <h1 className="font-display text-3xl text-white">{episode.title}</h1>
      </div>

      <div className="flex min-h-screen items-center justify-center">
        <div className="aspect-video w-full max-w-7xl">
          <VideoPlayer
            src={src}
            isActive={true}
            isMuted={false}
            // The existing player accepts onViewStart, and we hook 'ended' via a ref-based effect inside
          />
        </div>
      </div>

      <PostCreditsUpsell
        open={showUpsell}
        episode={episode}
        onClose={() => setShowUpsell(false)}
      />
    </div>
  );
}
```

Note: the existing `video-player.tsx` does not expose an `onEnded` callback in its props (per the discovery), so for Phase 2 hook the end-of-video event by listening to the underlying `<video>` element. Either patch the player to expose `onEnded` (preferred, clean PR to add the prop), or wrap a sibling `<video>` ref-listener that reads from the same DOM node.

Recommended: open the existing `video-player.tsx` and add an `onEnded?: () => void` prop, wire it into the `<video>` element's `onEnded` handler. Keep the change minimal and additive. This is a clean, useful PR enhancement.

`PostCreditsUpsell` is a Dialog using `@galileyo/ui`'s dialog primitive:
- Title: "You watched Episode 1. Now what?"
- Body: "Episodes 2 through 7 are coming. Help us make them faster, and get all-access with Bronze."
- Two CTAs: "Get Bronze All-Access" → `/studios/membership`, "Become a Producer" → `/studios/producers`

Commit: `feat(studios): watch player with access check and post-credits upsell`

## Step 2 — Producers page (commit 2)

Build `apps/nextjs/src/app/(app)/studios/producers/page.tsx`.

Layout (server component):
- Hero: "Fund the Films. Get the Credit."
- Editorial paragraph explaining the Pay-It-Forward model in Galileyo's voice (write it yourself, do not copy Angel's text)
- Two-column section: Film tiers (left) and Game tier (right) on desktop, stacked on mobile

**Film tier cards:**

```tsx
const FILM_TIERS = [
  {
    id: "associate",
    name: "Associate Producer",
    price: 50,
    inclusions: [
      "Your name in the end credits of one episode",
      "Digital download of all 7 episodes",
      "Signed digital poster",
      "Early access to behind-the-scenes drops",
    ],
    cta: "Become an Associate Producer",
    slots: null,
  },
  {
    id: "contributing",
    name: "Contributing Producer",
    price: 200,
    inclusions: [
      "Everything in Associate, plus:",
      "Physical signed poster mailed to you",
      "Bronze All-Access membership included",
      "Exclusive community access",
      "Full-length behind-the-scenes cut",
    ],
    cta: "Become a Contributing Producer",
    slots: null,
    featured: true,
  },
  {
    id: "executive",
    name: "Executive Producer",
    price: 250000,
    inclusions: [
      "Everything above, plus:",
      "Screen credit as Executive Producer",
      "On-set visit during production",
      "Dinner with the Bretts",
      "Equity-style upside per producer agreement",
    ],
    cta: "Schedule a Call",
    slots: 7,
    slotsTaken: 0,
  },
];
```

**Game tier card:**

```tsx
const GAME_TIER = {
  id: "game",
  name: "Game Producer",
  price: 100,
  priceLabel: "$100+",
  inclusions: [
    "Free copy of the game on release",
    "Your name credited in the game",
    "Early-access build before public launch",
  ],
  cta: "Help Build the Game",
};
```

For Phase 2, the CTA buttons:
- Associate, Contributing, Game: navigate to a placeholder Stripe checkout page or show a "Checkout coming soon" toast. Phase 3 wires real Stripe.
- Executive: open a modal with a contact form (name, email, phone, message) that submits to `/studios/api/sponsor-inquiry` (reuse the endpoint, mark `interest: "executive-producer"`).

Below the tiers: funding progress bars for both film ($0 / $3.5M) and game ($0 / $1M). Pull current values from env vars so Brett Raio can update without a code deploy.

Commit: `feat(studios): producer tiers page with film and game funding paths`

## Step 3 — Bronze membership page (commit 3)

Build `apps/nextjs/src/app/(app)/studios/membership/page.tsx`.

Layout:
- Hero: "Bronze All-Access. $24 a year."
- Comparison table:
  - Column 1: Pay per episode ($7 × 7 = $49)
  - Column 2: Bronze All-Access ($24, save $25)
  - Column 3 (small): Free with email (Episode 1 only)
- Inclusions checklist (big, prominent)
- CTA: "Get Bronze All-Access" — Phase 2 stub, Phase 3 wires Stripe Subscription

Commit: `feat(studios): bronze membership page`

## Step 4 — Sponsors page (commit 4)

Build `apps/nextjs/src/app/(app)/studios/sponsors/page.tsx` and the inquiry form component.

Layout:
- Hero: "Reach the people the rest of media can't."
- Audience demographics card with stat tiles
- Sponsor inventory grid (4-6 inventory types)
- Media kit download button (links to `/studios/galileyo-studios-media-kit.pdf` — placeholder file for now)
- Inquiry form at the bottom

Form fields: company, contactName, email, phone, budgetRange (select: $5K-$25K, $25K-$100K, $100K-$500K, $500K+), interest (multi-select: product placement, end-card, affiliate, banner, podcast), notes (textarea).

Submit to `/studios/api/sponsor-inquiry` (new route). Implementation:

```ts
// apps/nextjs/src/app/(app)/studios/api/sponsor-inquiry/route.ts
import { NextResponse } from "next/server";
import { z } from "zod/v4";

const Schema = z.object({
  company: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  budgetRange: z.string().optional(),
  interest: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
  }

  // Phase 3: persist via tRPC studiosRouter.submitSponsorInquiry
  // Phase 2 stub: log to console and send email if EMAIL_* env vars set
  console.log("[studios] Sponsor inquiry:", parsed.data);

  return NextResponse.json({ success: true });
}
```

Commit: `feat(studios): sponsors page and inquiry form`

## Step 5 — Affiliates page (commit 5)

Build `apps/nextjs/src/app/(app)/studios/affiliates/page.tsx`.

Layout:
- Hero: "Exclusive deals from the brands we trust."
- Grid of affiliate offers, each card: brand logo, brand name, offer (e.g., "20% off"), short description, "Get the Deal" outbound link

Affiliate data (create `apps/nextjs/src/lib/studios/affiliates.ts`):

```ts
export const AFFILIATES = [
  {
    id: "escape-zone",
    name: "Escape Zone",
    offer: "20% off backpacks",
    description: "Go-bags built for serious preparedness.",
    logoUrl: "/studios/affiliates/escape-zone.png",
    affiliateUrl: process.env.NEXT_PUBLIC_AFFILIATE_ESCAPE_ZONE ?? "#",
    featured: true,
  },
  {
    id: "ghost-phone",
    name: "Ghost Phone",
    offer: "$200 off",
    description: "Privacy-first communications device.",
    logoUrl: "/studios/affiliates/ghost-phone.png",
    affiliateUrl: process.env.NEXT_PUBLIC_AFFILIATE_GHOST_PHONE ?? "#",
    featured: true,
  },
  // Add placeholders for additional partners as they sign
];
```

At the bottom of the page: "Want your brand featured? Become an affiliate" — links to a simple email form that submits to the same sponsor-inquiry endpoint with `interest: "affiliate"`.

Commit: `feat(studios): affiliate marketplace page`

## Step 6 — About page (commit 6)

Build `apps/nextjs/src/app/(app)/studios/about/page.tsx`.

Layout:
- Hero: "The People Behind the Resistance."
- Project intro section: a 3-4 paragraph editorial piece on why this series exists, what it's saying, where it goes
- Cast section: only confirmed cast (Brett Camrites confirmed per transcript; do not list unverified actors)
- Crew section: list directors, producers, music, etc. (only confirmed names)
- "Verified on Galileyo" callouts for any cast member with a Galileyo profile
- Behind-the-scenes mini-doc embed (optional, placeholder if no asset)

Cast data (create `apps/nextjs/src/lib/studios/cast.ts`):

```ts
export const CAST = [
  {
    name: "Brett Camrites",
    role: "Lead",
    bio: "Marine veteran and actor. Bio TBD.",
    photoUrl: "/studios/cast/brett-camrites.jpg",
    galileyoVerified: false,
  },
  // Additional cast pending confirmation
];
```

Add a visible note for Brett Raio: "Cast list pending confirmation. Update before launch."

Commit: `feat(studios): about page with cast and crew`

## Step 7 — Mobile QA pass (commit 7)

Walk through every page at 375px width. Fix any layout issues. Common ones to watch:
- Hero text wrapping awkwardly at small widths
- Episode grid not collapsing to single column
- Tier card columns not stacking
- Forms with fixed widths overflowing
- Nav menu items overflowing horizontally — convert to hamburger on mobile

Use the existing `useMediaQuery` hook (in `apps/nextjs/src/hooks/use-media-query.tsx`) where needed.

Commit: `fix(studios): mobile responsive polish across all pages`

## Step 8 — Deploy and demo

```bash
git push
```

If staging deploys auto on PR merge or branch push, verify the deploy went green.

Visit `next.galileyo/studios` and walk through:
1. Landing → email gate → unlocks Episode 1
2. Watch Episode 1 from Cloudflare Stream URL
3. Post-credits upsell → Bronze membership
4. Browse producer tiers → click each
5. Sponsor inquiry form → submit (verify console log or DB write)

Record a 90-120 second screen capture of the full happy path. Share with Brett Raio for review before Brett Miller demo.

## Final quality gate

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` zero warnings
- [ ] `pnpm build` succeeds
- [ ] All 9 routes render without errors: `/studios`, `/studios/episodes`, `/studios/episodes/episode-1`, `/studios/watch/episode-1` (with cookie), `/studios/producers`, `/studios/membership`, `/studios/sponsors`, `/studios/affiliates`, `/studios/about`
- [ ] Episode 1 plays from Cloudflare Stream (assumes URL is set)
- [ ] Email gate sets cookie and unlocks watch route
- [ ] Mobile responsive verified at 375px and 768px
- [ ] No em dashes anywhere
- [ ] No console errors
- [ ] All copy reviewed for tone (cinematic, deliberate, no AI tells)
