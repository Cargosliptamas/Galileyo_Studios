# STUDIOS V2 PHASE 3: Studios Film Player + Mid-Roll Commercial Engine (FINAL)

Paste into Claude Code from the repo root on branch `feat/studios-foundation`, after Phases 1 and 2.

---

Same house rules: TypeScript strict with no `any`, Tailwind only, functional components, no em dashes anywhere, validated env only, typecheck and lint must pass. Schema changes apply with `pnpm -F @galileyo/db push`.

CRITICAL ARCHITECTURE FACT (verified against the codebase, do not fight it): the shared `apps/nextjs/src/components/video/video-player.tsx` is an 851-line vertical-feed player with duet/stitch logic. It exposes NO onTimeUpdate callback, NO imperative ref handle, and NO start-at-time prop. It cannot host an ad engine from the outside, and modifying it risks the core social feed. Therefore this phase builds a dedicated `StudiosFilmPlayer` for the Studios watch surface and leaves the feed player completely untouched. hls.js is already a dependency; add nothing new.

Read before writing anything: `apps/nextjs/src/components/studios/studios-watch-client.tsx`, `apps/nextjs/src/components/video/video-player.tsx` (for hls.js attach patterns only, you are not modifying it), `lib/studios/stream.ts`, `lib/studios/access.ts` (`hasAdFree` from Phase 2), and the `studiosEpisode.adCuePoints` and `adsOnPaid` columns from Phase 1.

## Strategy you are implementing

Stage A ships now: direct-sold sponsor commercials (Seekins, Bass Pro, Bivvy, Budweiser, Kling AI) hosted on Cloudflare Stream, played at cue points inside the 27-28 minute episodes. Default cue points: optional pre-roll, mid-rolls at 540s and 1080s. Stage B is programmatic VAST through a Google MCM partner later, so the architecture exposes a clean seam where a VAST tag plugs in without rewriting the player. Build for Stage A, leave the seam for Stage B.

## Section A: Data model

1. New table `studiosCommercial`: id PK, `name` varchar(200), `sponsor` varchar(120), `streamUid` varchar(64) not null, `durationSeconds` int, `clickthroughUrl` varchar(500) nullable, `highlightCopy` varchar(300) nullable (for example `Featuring equipment from Bass Pro Shops`), `active` boolean default true, `weight` int default 1, `skippableAfterSeconds` int nullable (leave null at launch, no skip), `sponsorRateCents` int nullable (manual rate per thousand impressions for admin reporting), `createdAt`.
2. New table `studiosAdImpression`: id PK, `commercialId` FK to studiosCommercial, `episodeSlug` varchar(80), `slot` varchar(20) (`preroll`, `midroll_1`, `midroll_2`), `completed` boolean default false, `clicked` boolean default false, `viewerHash` varchar(64) (HMAC of email or anon cookie id, never raw email), `createdAt` with index. This table is the CPM proof for sponsor reporting and the future MCM application.
3. Extend the Phase 1 seed script with the five sponsors as inactive placeholder rows (no streamUid yet), so the Phase 4 admin just edits them.

## Section B: The StudiosFilmPlayer

1. Create `apps/nextjs/src/components/studios/studios-film-player.tsx`, a focused client component (target under 300 lines) purpose-built for long-form 16:9 playback:
   - hls.js attach for `.m3u8` with native HLS fallback for Safari (`video.canPlayType("application/vnd.apple.mpegurl")`); study the attach/destroy pattern in the existing feed player and replicate the cleanup discipline
   - Props: `src`, `poster`, `startAt?`, `onTimeUpdate?`, `onEnded?`, `onPlayStart?`, `seekDisabled?`, `autoPlay?`
   - Controls: play/pause, mute, volume, fullscreen, buffered-aware seek bar with time labels, keyboard shortcuts (space, arrows, f, m), auto-hiding control chrome
   - Mobile Safari is the risky surface: test the source-swap and resume pattern there mentally and code defensively (loadedmetadata before setting currentTime, play() promise rejection handling)
2. This player is used ONLY on the Studios watch surface. The feed `VideoPlayer` and every non-Studios route remain untouched.

## Section C: Ad scheduling

1. `apps/nextjs/src/lib/studios/ads.ts`:
   - `getAdSchedule(episode, viewer): Promise<AdSchedule>` where `AdSchedule = { breaks: { slot, timeSeconds, commercials: CommercialPlayback[] }[] }` and `CommercialPlayback = { id, hlsUrl, durationSeconds, sponsor, clickthroughUrl, highlightCopy }`
   - Empty schedule when `hasAdFree(viewer)` is true
   - Individually purchased episodes: no ads unless the episode's `adsOnPaid` flag is true (defaults false; Brett Miller's call per episode)
   - Weighted random selection among active commercials, never the same sponsor twice in one episode when more than one is available
   - Cue points from `episode.adCuePoints`, falling back to `[540, 1080]` for episodes over 20 minutes, one mid-roll at the midpoint for 8-20 minutes, none under 8
2. `GET /studios/api/ads/[slug]` returns the schedule as JSON, server-resolving public HLS URLs for the commercials (commercials are always public, never signed).
3. `POST /studios/api/ads/impression` records start, completion, and click events into `studiosAdImpression`, fire-and-forget from the client with `navigator.sendBeacon` where available, fetch keepalive fallback.

## Section D: Ad orchestration

1. Create `apps/nextjs/src/components/studios/studios-ad-orchestrator.tsx`, a client component that owns playback state (`content` or `ad`) and renders one `StudiosFilmPlayer`:
   - Watches content time via `onTimeUpdate`; when crossing an unplayed cue point: save the content timestamp, swap src to the commercial HLS, set `seekDisabled`, show ad chrome overlay (sponsor name, `Ad 1 of 1`, countdown timer, the highlight copy line, clickable sponsor link opening a new tab and firing `studios_ad_clicked`)
   - Pre-roll plays before content when scheduled
   - On ad end OR ANY ad error (errors must never trap the viewer; on failure skip back to content within 2 seconds), restore the content src with `startAt` = saved timestamp and resume
   - Mark cue points consumed: seeking back never replays a break; seeking forward past an unplayed break triggers it once
   - Bronze and ad-free viewers bypass the orchestrator entirely (no schedule fetch at all)
2. Update `studios-watch-client.tsx` to render the orchestrator instead of the feed `VideoPlayer`, preserving the existing back link, title overlay, and post-credits upsell behavior (`onEnded` still opens the upsell).
3. The VAST seam: `interface AdSource { getSchedule(episode, viewer): Promise<AdSchedule> }` with the current implementation as `DirectSoldAdSource`. Add a stub `VastAdSource` class with a documented TODO: it will fetch a VAST tag URL from `studiosSetting`, parse with a VAST client, and map to `AdSchedule`. Selection by `studiosSetting` key `ad_source` defaulting `direct`.
4. PostHog events (client, `import posthog from "posthog-js"`): `studios_ad_started`, `studios_ad_completed`, `studios_ad_clicked`, `studios_ad_errored`, all with sponsor and slot properties.

## Section E: Sponsor reporting surface (minimal)

1. `GET /studios/api/ads/report?from=&to=` (admin-gated with the allowlist pattern from the master blueprint, env `STUDIOS_ADMIN_EMAILS`): JSON totals per commercial: impressions, completions, completion rate, clicks. Phase 4 gives it a UI; ship the endpoint now so numbers accumulate from day one.

## Acceptance criteria
- Episode 1 with two seeded active commercials plays mid-rolls at the cue points, content resumes at the exact timestamp
- Ad failure skips cleanly back to content within 2 seconds
- Ad-free entitlement results in zero ad schedule requests
- Impressions, completions, and clicks land in the table
- Seeking past a cue point triggers the break once, rewatching does not retrigger
- Plays correctly on mobile Safari (native HLS path) and Chrome desktop (hls.js path)
- The feed `VideoPlayer` file has zero diff
- typecheck and lint pass

Finish with the file list and a short note on exactly what Brett Miller must deliver per commercial: video file, clickthrough URL, one highlight line.
