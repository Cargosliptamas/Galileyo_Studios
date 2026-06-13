# STUDIOS V2 PHASE 2: Stripe End to End (FINAL)

Paste into Claude Code from the repo root on branch `feat/studios-foundation`, after Phase 1 has merged.

---

Same house rules as Phase 1: TypeScript strict with no `any`, Tailwind only, functional components, no em dashes anywhere, validated env only, `pnpm typecheck` and `pnpm lint` must pass before you are done. Schema changes apply with `pnpm -F @galileyo/db push` (push workflow, no migration files).

Read before writing anything: `apps/nextjs/src/lib/studios/episodes-db.ts`, `lib/studios/access.ts`, the Phase 1 donate stub route, `packages/db/src/schema.ts` (the existing `promocode` and `invoicePromocode` tables plus the Phase 1 `studiosLead` table), the existing webhook at `apps/nextjs/src/app/api/webhooks/bunny` (your placement pattern), and `packages/api/src/router/payment.ts` to understand the existing payment landscape (Authorize.net, BitPay, Apple, credit types). Studios uses Stripe independently of those rails, do not modify them.

## Section A: Stripe foundation

1. Install `stripe` in `apps/nextjs` (server SDK only, Stripe Checkout hosted pages, do not install Stripe.js or Elements).
2. Env vars (validated, optional with empty defaults): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, client flag `NEXT_PUBLIC_STRIPE_ENABLED` (so UI shows "coming this week" states when false). Add to `.env.example`.
3. Create `apps/nextjs/src/lib/studios/stripe.ts`: a lazily-initialized Stripe client and typed helpers. Products are created by a setup script, never hardcoded price IDs in code. Write `scripts/studios-stripe-setup.ts` (runnable with tsx) that idempotently creates, keyed by `metadata.studiosKey`:
   - `episode_unlock` product with a $7.00 one-time price
   - `bronze_annual` product with a $24.00 yearly recurring price
   - `ad_free` product with a $7.99 one-time price
   - `producer_associate` $50 one-time, `producer_contributing` $200 one-time, `producer_game` $100 one-time
   - Promotion codes `300DAYS` and `BIVVY`. DEFAULT (pending Brett Miller confirmation, leave a loud comment): each attached to a 100% off coupon restricted to `episode_unlock`, one redemption per customer.
   The script prints all IDs and writes them to a new `studiosSetting` table (key varchar(80) PK, value text, updatedAt). Runtime code reads price IDs from settings, never from env or hardcode. Placeholder price IDs anywhere is a hard failure mode, do not allow it. If a price ID is missing from settings at runtime, the checkout route returns a clean 503 with "Payments are not configured yet" rather than creating a broken session.
4. Mirror `300DAYS` and `BIVVY` rows into the existing `promocode` table for reporting (read its column shape first and conform to it).

## Section B: Access model

1. New table `studiosEntitlement`: id PK, `email` varchar(320) not null indexed, `userId` varchar nullable (link when a logged-in session exists), `kind` varchar(30) (`episode`, `bronze`, `ad_free`, `producer_associate`, `producer_contributing`, `producer_game`, `donation`), `episodeSlug` varchar(80) nullable, `stripeSessionId` varchar(120) unique, `amountCents` int, `promoCode` varchar(40) nullable, `createdAt`, `expiresAt` datetime nullable (set for bronze, one year).
2. New table `studiosProducerCredit`: id PK, `email`, `displayName` varchar(200) nullable, `tier` varchar(30), `amountCents` int, `createdAt`. Feeds the future credits roll.
3. Extend `lib/studios/access.ts`: keep the Episode 1 unlock cookie flow untouched. Add `hasEpisodeAccess(slug, viewer)` returning true for free episodes with the unlock cookie, an `episode` entitlement for that slug, an unexpired `bronze` entitlement, or any producer entitlement. Add `hasAdFree(viewer)` (true for `ad_free`, `bronze`, and producer kinds). Viewer identity: the session user email when logged in, else a signed `studios_viewer` cookie containing the email, same HMAC pattern as the unlock cookie.
4. Update the watch page gating: paid episodes check `hasEpisodeAccess` instead of unconditionally redirecting.

## Section C: Checkout flows

1. `POST /studios/api/checkout` accepting a zod-validated body: `{ kind, episodeSlug?, amountCents?, email? }`. Creates a Stripe Checkout Session:
   - mode `payment` for episodes, ad_free, producers, donations; mode `subscription` for bronze
   - donations use `price_data` with the custom amount (validate 100 to 5_000_000 cents), product name `Galileyo Studios Donation`
   - `allow_promotion_codes: true`
   - `success_url` `/studios/thank-you?session_id={CHECKOUT_SESSION_ID}`, `cancel_url` back to the originating page
   - metadata: `studiosKind`, `episodeSlug`, plus UTM params if provided
   - simple in-memory rate limit per IP on this route
2. Replace the Phase 1 donate stub: the donate page now posts to checkout and redirects to Stripe. If `NEXT_PUBLIC_STRIPE_ENABLED` is false, keep the email-capture fallback state.
3. Wire every purchase CTA: episode detail unlock button, Bronze buttons on membership and landing, ad-free upsell, Associate and Contributing and Game producer buttons. Executive Producer remains the inquiry modal, never checkout.
4. `/studios/thank-you` page: server component. Retrieve the Checkout Session from Stripe, verify paid status, and THIS is where the signed `studios_viewer` cookie gets set (webhooks cannot set cookies, the thank-you page can). If the webhook has not landed yet, poll session status briefly (up to 10 seconds) then show a "payment processing, refresh in a moment" state instead of an error. Themed confirmation per kind (donation thanks them for funding independent film, episode unlock links straight to the watch page, bronze welcomes them to the season), share buttons, and the partnership CTA.

## Section D: Webhook

1. `POST /api/webhooks/stripe` (outside the `(app)` group, next to the existing `api/webhooks/bunny`), runtime nodejs, raw-body signature verification with `STRIPE_WEBHOOK_SECRET` (read the raw body with `await req.text()` before parsing).
2. On `checkout.session.completed`: idempotently insert `studiosEntitlement` (unique on `stripeSessionId`, swallow duplicate-key as success), upsert `studiosLead` with source `checkout` or `donation`, record any promo code from the session discounts into both the entitlement row and the lead row, and if the kind is a producer tier append a `studiosProducerCredit` row. Entitlements key on email; cookies are handled by the thank-you page, never here.
3. On `invoice.paid` for bronze renewals: extend `expiresAt` one year.
4. On `checkout.session.async_payment_failed`: log, no entitlement.
5. PostHog server-side capture via the existing helper at `apps/nextjs/src/posthog/server.ts` (default export returns a client only when env keys exist, null-check it): `studios_checkout_completed` with kind and amount.
6. The webhook route must never throw unhandled: wrap processing, return 200 for events you do not handle, 400 only for signature failures.

## Acceptance criteria
- Setup script run twice creates no duplicates and the settings table holds all price IDs
- Test-mode purchase of an episode grants access and the watch page plays it
- `300DAYS` and `BIVVY` apply at Stripe Checkout
- Donation with a custom amount completes and lands a lead row plus entitlement row
- Webhook is idempotent: replaying the same event creates no duplicate rows
- Bronze checkout creates a subscription with one-year expiry recorded
- Thank-you page handles the webhook-not-yet-landed race without showing an error
- typecheck and lint pass

Finish with the file list, the exact commands to run the setup script, and the webhook URL to register in the Stripe dashboard (events: checkout.session.completed, invoice.paid, checkout.session.async_payment_failed, charge.refunded).
