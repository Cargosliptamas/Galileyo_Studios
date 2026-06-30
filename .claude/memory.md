# Memory — Galileyo Studios

## Now
- **Standalone repo** at `galileyostudios.com` — completely separate from the main Galileyo monorepo. Moved out because it has no business dependency on the other app.
- Active branch: `main` (current working branch per git status)
- Episode 1 is LIVE ("The AI Apocalypse / The Assault", 24 min, free with email gate)
- Recent commits show nav polish, mobile layout fixes, episode roadmap grid, lead-capture hardening, and a Cloudflare/Bunny stream wiring pass
- Supabase is in use for storage (gallery images at `lynguywqqtyjrzzpjpzn.supabase.co`)

## Project
- **Name**: Galileyo Studios (standalone site, not embedded in Galileyo monorepo)
- **Domain**: galileyostudios.com
- **What it is**: Home of "Seekin Destroys" — a 7-episode AI-apocalypse thriller (sci-fi, short-form, 2026). Audience-funded, independent. Episode 1 free with email; future episodes funded via producer/subscriber tiers.
- **Mission**: "Original films from the front lines of the new resistance. Funded by the audience. Distributed without permission."
- **Related**: galileyo.com is the real-world satellite emergency comms platform that the show promotes.

## Stack (standalone site)
- Likely Next.js (App Router) based on routing structure and original monorepo origin
- **Supabase** for storage (confirmed from gallery image URLs) and likely auth/DB (not MySQL/Drizzle from monorepo)
- Stack details need verification by reading package.json / repo structure
- Tailwind, shadcn/ui suspected based on monorepo origin
- Cloudflare / Bunny Stream for video (per recent commits mentioning bunny-service)

## Site Structure (live routes)
- `/` — Homepage: hero ("Episode 1 is LIVE"), email gate for Ep1, episode grid (Ep1 available, Ep2-7 TBA Jul-Dec 2026), voice cast, gallery, game CTA, partners section, Galileyo.com promo
- `/show` — Episode guide: full 7-episode list, email gate for Ep1, discussion (0 comments), cast/crew, partner logos
- `/pricing` — Bronze All-Access + Producer tiers (see Pricing section below)
- `/enlist` — AI Enlistment / Battle Card claim
- `/community` — Community section
- `/battle-cards` — Battle Cards
- `/chat` — Chat
- `/game` — Companion game ("WASD to move, mouse to aim, click to shoot, space to dash")
- `/auth` — Sign In / Sign Up
- `/about` — Studio mission, Brett Miller bio, Galileyo.com pitch
- `/gallery` — Production stills and screenshots
- `/cast/[slug]` — Individual cast profiles (scott-levy, jennifer-marshall, cameron-bright, brett-miller, jennifer-sims)
- `/ads` — Promote / advertise
- `/contact` — Contact
- `/terms`, `/privacy` — Legal

## Pricing (live on /pricing)
**Bronze All-Access**
- Monthly: $2.99/mo | Annual: "Save 33%" (approx $2/mo billed annually)
- All 7 episodes, ad-free, behind-the-scenes director cut, weekly production drops, early access, AI character card generator

**Producer Tiers**
- Associate Producer: $10/mo or one-time — credits on one episode, digital download all 7, signed digital poster, Discord
- Contributing Producer (Most Popular): $50/mo or one-time — everything above + physical signed poster, feature-length director cut, monthly call with Brett Miller, early access
- Executive Producer (7 slots): $250K one-time — on-set visit + dinner with Brett, screen credit, revenue participation, creative input
- Game Producer: $25/mo or $100 one-time — game copy on release, producer credit, alpha access, vote on design

**Donate**: any amount, monthly or one-time

## Cast & Crew
- **Brett Miller** — Creator, Director, Writer, Executive Producer, Voiceover (Brett@Galileyo.com)
- **Jennifer Marshall** — Lead Voice Cast / Voice Director (Netflix Stranger Things)
- **Cameron Bright** — Lead Voice Cast (Twilight Saga)
- **Scott Levy** — Cast (Marine Corps Veteran, Skywalker Sound, Titanic / Jurassic Park)
- **Jennifer Sims** — Executive Producer (RPM Talent Agency)

## Partners (live on homepage)
- Satellite Phone Store — Platinum
- The Dr. Ardis Show — Gold
- Mark 37 — Gold
- Escape Zone — Gold
- Partnership inquiries: Brett@Galileyo.com

## Key Constraints / Rules
- **No em dashes** in copy or code comments
- Email gate on Episode 1 (email capture before video plays)
- Server-side auth checks for paid/gated content (client-only gating not acceptable)
- `node:crypto` for signed tokens if needed (jose not assumed installed in standalone repo)
- Footer reads: `Designed and Developed by BOLD Studios.` (with trailing period)

## Open Questions / Blockers
- What is the exact stack of the standalone repo? (Need to read package.json)
- Is auth Supabase Auth or Better Auth or something else?
- Database: is it Supabase Postgres or something else?
- What is the current state of Stripe integration?
- Is there a `.env.example` showing what env vars are expected?
- Brett Miller contact for any production/business decisions
