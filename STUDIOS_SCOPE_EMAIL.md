# Scope Confirmation Email to Brett Miller

**Send this today, before starting code work.** Copy into your email client, edit subject + greeting if needed, then send.

---

**To:** brett@galileyo.com
**CC:** steph@galileyo.com (Steph, if she's on email — adjust)
**Subject:** Galileyo Studios — Phase 1 scope confirmation and a few quick questions

Brett,

Great call. The $1K invoice went through, thanks for the quick payment. I'm starting on the Studios page today with the goal of having Phase 1 deployed to next.galileyo in 2 days. I want to make sure we're aligned on a few things before I commit any code to your repo.

**What I'm delivering in this Phase 1 ($1K, 2-day to 2-week window):**

A complete Studios section deployed to next.galileyo with the following pages built and beautiful:

- Landing page with hero, countdown to next episode, Episode 1 free with email signup, the 7-episode roadmap, producer tier preview (film and game), Bronze membership upsell, sponsor strip, affiliate marketplace teaser, cast preview
- Episode detail pages for all 7 episodes (synopsis, stills, product placements, access-aware CTAs)
- Watch page wired to Episode 1 via Cloudflare Stream
- Producer tiers page with the $50 Associate, $200 Contributing, $250K Executive (7 slots), and $100+ Game tier
- Bronze membership page at $24/year
- Sponsor inquiry page with media kit download and submission form
- Affiliate marketplace page
- About / cast / crew page

The UI matches the Bolt design I sent over, adapted for a cinematic film-studio feel (dark, warm gold accent, film grain, Bebas Neue display type). The whole section will feel native to Galileyo while having its own distinct identity.

**What's out of scope for the $1K:**

The Stripe live integration, full backend tRPC routers, webhook handlers, and email automation are Phase 2 work. They depend on you setting up the Stripe account and giving me access. I'll build all the UI and have it ready to flip on the moment Stripe is wired. Phase 2 lines up naturally with the $1.5K/mo retainer plus 5% to 10% equity structure we discussed.

Mobile app work also stays out of scope — Andras and the team take that lane after web ships, as we agreed.

**Branch question:**

I'm seeing three branches in the repo (main, development, production). Which one should I open PRs against, and which one is next.galileyo deploying from right now? I want to match your team's workflow exactly, not assume.

**Quick decisions I need before I can finalize the page:**

1. **Cloudflare Stream upload:** Can you upload the rough Episode 1 cut to Cloudflare Stream and send me the HLS playback URL? Or grant me Cloudflare access and I'll handle it? Either works. Without this, the watch page is the only thing that can't be live.

2. **Stripe account:** Is there an existing Galileyo Stripe account, or do you want to set one up specifically for Studios revenue (cleaner accounting and producer-tier compliance)? I recommend Studios-specific.

3. **Next episode release date:** I need a target date for the countdown timer. Even a soft target works (I can update it later). Episode 2 in July?

4. **Cast confirmation:** I confirmed Brett Camrites from our call. Anyone else attached and approved for public listing? I'm not putting names up until you give me a written OK on each.

5. **Music in Episode 1:** I have to flag this because it sits in the chain of liability for the platform. The unlicensed commercial tracks need a path forward before the episode goes wide:
   - I can produce a replacement score (separate scope, separate quote, or roll into the retainer)
   - You license the tracks for streaming use (ACDC etc. is not cheap, get a quote)
   - We ship without those tracks and use placeholder ambient until music is sorted
   I lean toward option 1 or 3 for the launch. Putting it on the record so we both know it's an open item.

6. **Kling AI credit:** The audience is anti-AI by design (the antagonist in Episode 1 IS AI). If the credit says "Made with Kling AI," it telegraphs a contradiction. I recommend leaving Kling uncredited on the public-facing site, even if it was a production tool. Your call but worth deciding before launch.

7. **Sponsor confirmations:** BivyStick is obvious (it's in the show). Are Seekins and Moonshine signed sponsors with logo approval, or are those still in pitch stage? I don't want to put a logo up that hasn't agreed to be there.

8. **Affiliate offers:** Escape Zone 20% off and Ghost Phone $200 off — are those active affiliate codes with confirmed links, or projected?

I'll keep moving on everything that doesn't depend on these answers (which is most of the page). The Cloudflare URL and cast names are the only blockers for a fully live demo. Everything else I can mock or placeholder cleanly.

**What's next on my end:**

Today: branch verification with your team, start Phase 1 build.
By end of day tomorrow: Phase 1 deployed to next.galileyo, I'll send you a 90-second walkthrough video.
Then: your review, your team's review, any iteration, then Phase 2 (backend wiring) once Stripe and Cloudflare are sorted.

After Phase 1 ships and you've seen the work, let's lock in the retainer structure we talked about so I can keep moving on Phase 2 and beyond without a gap.

Talk soon,
Brett Raio

---

## Notes for Brett Raio (do not include in the email)

- Steph email may not exist; remove the CC if you don't have it
- The "lean toward option 1 or 3" on music gives him an out without painting him into a corner
- The Kling AI flag is professional risk-mitigation, not preachy — he'll respect it
- The retainer ask is at the very end, soft, dependent on Phase 1 being good. That's the right tempo.
- Do NOT send Stripe invoice details or any pricing renegotiation in this email. Keep it focused on Phase 1.
