# STUDIOS V2 PHASE 5: Launch Hardening (FINAL)

Paste into Claude Code from the repo root on branch `feat/studios-foundation`, the day before the 6.15 blast, after Phases 1 through 4.

---

Same house rules: TypeScript strict with no `any`, Tailwind only, functional components, no em dashes anywhere, validated env only. This phase must also pass `pnpm build`, not just typecheck and lint.

## Section A: Share surface (the influencer blast lives or dies here)

1. Audit every Studios route's `generateMetadata`: unique title, selling description (free Episode 1, made with AI), OG image from the Cloudflare Images hero variant with local fallback, `og:image` dimensions 1200x630, Twitter `summary_large_image`.
2. JSON-LD structured data: `TVSeries` on the Studios landing, `TVEpisode` on episode detail pages.
3. Verify there is no auth or cookie dependency on any public Studios page that would break link previews for crawlers.

## Section B: Resilience

1. Every Studios API route: wrapped handlers returning clean JSON errors, zod on every body, never an unhandled throw surfacing a 500 HTML page.
2. Webhook replay safety re-verified: duplicate `checkout.session.completed` returns 200 with no duplicate rows.
3. Thank-you page race state re-verified (webhook delayed up to 10 seconds shows processing, not error).
4. Unlock and viewer cookies: confirm they work across the apex and www domains (cookie domain settings) and on Safari (SameSite Lax, Secure in production).
5. Empty states audited: stream not configured, checkout canceled, no commercials active (content plays straight through), episode locked.

## Section C: Performance

1. Landing page LCP target under 2.5s: hero image `priority` with correct `sizes`, the hero trailer video lazy-mounted on intersection and never render-blocking, no client components above the fold that could be server components.
2. Run `pnpm build` and report any new bundle warnings or unexpectedly large Studios chunks.

## Section D: Smoke script

1. `scripts/studios-smoke.ts` (tsx): hits every public Studios route on a base URL from argv, asserts 200 and a marker string per page, plus a HEAD check on the Episode 1 HLS manifest URL when env is configured. Exits nonzero on any failure. Add root script `studios:smoke`.

## Acceptance criteria
- `pnpm typecheck`, `pnpm lint`, `pnpm build` all pass
- Smoke script green against the staging deploy
- OG cards render correctly when pasted into the X card validator and Facebook sharing debugger (list the two URLs for manual verification)

Finish with a one-page launch-day runbook: deploy order, env vars to confirm in production, the live-mode Stripe test purchase procedure, and what to watch in PostHog during the blast.
