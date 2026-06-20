import { db } from "./client";
import { studiosEpisode } from "./schema";

/**
 * Dev seed for the studios_episode table.
 *
 * Mirrors apps/nextjs/src/lib/studios/episodes.ts so the database matches the
 * static fallback, plus wires Episode 1's Cloudflare Stream UID so the watch
 * player has a real manifest to play. Idempotent: upserts by the unique slug,
 * so re-running refreshes rather than duplicating.
 *
 * Run against the DEV database (never prod) with an inline DATABASE_URL
 * override, since the dotenv .env points at prod and dotenv does not override
 * an already-set variable:
 *
 *   DATABASE_URL='mysql://root@localhost:3306/galileyo_dev' \
 *     pnpm -F @galileyo/db with-env tsx src/seed-studios.ts
 */

const EPISODE_1_STREAM_UID = "68fabb39b2787a45e0c2ad47e83add94";

type EpisodeSeed = typeof studiosEpisode.$inferInsert;

const EPISODES: EpisodeSeed[] = [
  {
    slug: "episode-1",
    number: 1,
    title: "The AI Apocalypse",
    status: "available",
    releaseLabel: "Available Now",
    releaseDate: "2026-05-19",
    runtime: 1500,
    synopsis:
      "The world breaks under the weight of artificial intelligence. A former soldier finds a girl who needs saving and a fight worth having.",
    heroStill: "/studios/stills/episode-1-hero.jpg",
    streamUid: EPISODE_1_STREAM_UID,
    priceCents: 0,
    isFree: 1,
    published: 1,
    adsOnPaid: 0,
    sortOrder: 1,
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
    priceCents: 700,
    isFree: 0,
    published: 1,
    adsOnPaid: 0,
    sortOrder: 2,
  },
  {
    slug: "episode-3",
    number: 3,
    title: "Martial Law",
    status: "coming_soon",
    releaseLabel: "Coming August 2026",
    releaseDate: "2026-08-15",
    synopsis: "The city goes under boot. The camps fill up.",
    heroStill: "/studios/stills/episode-3-hero.jpg",
    priceCents: 700,
    isFree: 0,
    published: 1,
    adsOnPaid: 0,
    sortOrder: 3,
  },
  {
    slug: "episode-4",
    number: 4,
    title: "The Raid",
    status: "coming_soon",
    releaseLabel: "Coming September 2026",
    releaseDate: "2026-09-20",
    synopsis: "Friends become an army. The first organized strike.",
    heroStill: "/studios/stills/episode-4-hero.jpg",
    priceCents: 700,
    isFree: 0,
    published: 1,
    adsOnPaid: 0,
    sortOrder: 4,
  },
  {
    slug: "episode-5",
    number: 5,
    title: "Episode 5",
    status: "coming_soon",
    releaseLabel: "Coming October 2026",
    releaseDate: "2026-10-18",
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-5-hero.jpg",
    priceCents: 700,
    isFree: 0,
    published: 1,
    adsOnPaid: 0,
    sortOrder: 5,
  },
  {
    slug: "episode-6",
    number: 6,
    title: "Episode 6",
    status: "coming_soon",
    releaseLabel: "Coming November 2026",
    releaseDate: "2026-11-15",
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-6-hero.jpg",
    priceCents: 700,
    isFree: 0,
    published: 1,
    adsOnPaid: 0,
    sortOrder: 6,
  },
  {
    slug: "episode-7",
    number: 7,
    title: "Episode 7",
    status: "coming_soon",
    releaseLabel: "Coming December 2026",
    releaseDate: "2026-12-13",
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-7-hero.jpg",
    priceCents: 700,
    isFree: 0,
    published: 1,
    adsOnPaid: 0,
    sortOrder: 7,
  },
];

async function seed(): Promise<void> {
  const target = process.env.DATABASE_URL ?? "";
  if (/prod/i.test(target)) {
    throw new Error(
      "Refusing to seed: DATABASE_URL looks like production. Point it at the dev database first.",
    );
  }

  for (const episode of EPISODES) {
    await db
      .insert(studiosEpisode)
      .values(episode)
      .onDuplicateKeyUpdate({
        set: {
          number: episode.number,
          title: episode.title,
          status: episode.status,
          releaseLabel: episode.releaseLabel,
          releaseDate: episode.releaseDate,
          runtime: episode.runtime,
          synopsis: episode.synopsis,
          heroStill: episode.heroStill,
          streamUid: episode.streamUid,
          priceCents: episode.priceCents,
          isFree: episode.isFree,
          published: episode.published,
          adsOnPaid: episode.adsOnPaid,
          sortOrder: episode.sortOrder,
        },
      });
    console.log(`Seeded ${episode.slug} (${episode.title})`);
  }

  console.log(`Done. Upserted ${EPISODES.length} episodes.`);
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("[studios] Seed failed:", error);
    process.exit(1);
  });
