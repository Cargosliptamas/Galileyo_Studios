# Homepage Phone-Mockup Video Script

## Purpose
Production-ready shot list for the looping phone video embedded on the homepage mockup.

## Delivery Spec
- Duration: `13s` target
- Allowed range: `12-15s`
- Format: muted autoplay loop
- Aspect ratio: `9:16`
- Viewport fit: readable inside the current `272x504` phone frame
- Caption rule: one caption at a time, `2-4` words max
- Tone: urgent, controlled, informative

## Script
| Time | Screen action | On-screen caption | Editor notes |
| --- | --- | --- | --- |
| `0.0-1.8s` | Open on the main feed with a visible breaking-alert style card or alert-heavy feed state. Show one subtle upward feed drift so the screen feels live, not static. | `Real-time alerts` | Keep the first frame clean and high contrast so the loop restart reads instantly. Avoid dense text blocks. |
| `1.8-3.4s` | Tap into the alerts map. Show nearby markers and a quick zoom/pan toward an active incident cluster. | `See it near you` | One map move only. Prioritize visible pins and geography over tiny labels. |
| `3.4-5.2s` | Hard transition into the Videos feed. First video should feel like an on-the-ground update tied to the emergency context. | `Updates from the ground` | This is the hero reveal. Let the first video breathe before any swipe. |
| `5.2-6.8s` | Perform one clean vertical swipe to the next video in the feed. | `Live video reports` | Swipe should be deliberate and fully legible in the phone viewport. |
| `6.8-8.8s` | Move from video into a live chat thread coordinating field response. | `Direct response chat` | Keep message bubbles large and legible. Do not overfill the thread. |
| `8.8-10.8s` | Jump to `My Feeds` on the `Private Feeds` tab. Show one feed card plus a clear invite or manage-members affordance. | `Share with your people` | Keep this concise. The point is trusted coordination, not full feature explanation. |
| `10.8-13.0s` | Show notification center with incoming activity and unread updates that can loop back into the opening feed. | `Instant notifications` | Design the final frame so the transition back to the opening alert feed feels like the same live system. |

## Caption Set
Use these exact captions unless editorial constraints require minor shortening:

1. `Real-time alerts`
2. `See it near you`
3. `Updates from the ground`
4. `Live video reports`
5. `Direct response chat`
6. `Share with your people`
7. `Instant notifications`

## Edit Direction
- Keep all motion bold and legible at small size.
- Favor taps, one map zoom, and one vertical swipe.
- Keep video as the dominant surface by total screen time.
- Do not rely on audio cues, narration, or subtitles outside the listed captions.
- Avoid showing unfinished or secondary surfaces like payments, analytics, or profile editing in this cut.
- Avoid scripting roadmap concepts or marketing-only claims that are not represented in the current product surfaces.

## Feature Validation
| Script beat | Product surface |
| --- | --- |
| Main feed / alerts opening | `dashboard`, `discover`, and feature surfaces in `apps/nextjs/src/components/layout/command-search-surfaces.ts` and `apps/nextjs/src/components/feed/feed-type-switcher.tsx` |
| Alerts map | `apps/nextjs/src/components/alert-map/alert-map-page.tsx` |
| Videos feed | `apps/nextjs/src/components/video/video-feed.tsx` |
| Chat thread | `apps/nextjs/src/components/chat/chat-message-page.tsx` and `apps/nextjs/src/components/chat/chat-provider.tsx` |
| Private feeds | `apps/nextjs/src/components/my-feed/my-private-feeds.tsx` |
| Notification center | `apps/nextjs/src/components/layout/notification-center.tsx` |
| Homepage embed context | `apps/nextjs/src/components/public-site/home-page.tsx` |

## Acceptance Checklist
- Works fully muted.
- Conveys alerts + map + video within the first `6-7s`.
- Keeps the Videos feed as the primary feature.
- Uses only validated product surfaces.
- Keeps captions readable inside the phone mockup.
- Ends on a frame that loops cleanly back to the opening shot.
