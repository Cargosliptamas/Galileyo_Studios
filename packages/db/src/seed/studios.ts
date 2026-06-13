import { sql } from "drizzle-orm";

import { db } from "../client";
import { studiosEpisode } from "../schema";

/**
 * Seed for the studios_episode table.
 *
 * Run with: pnpm -F @galileyo/db with-env tsx src/seed/studios.ts
 *
 * Mirrors the static array in
 * apps/nextjs/src/lib/studios/episodes.ts. All seven episodes are seeded as
 * published so the existing roadmap renders the full slate; only Episode 1 is
 * free and watchable. Idempotent on slug: re-running updates content fields
 * without creating duplicates and without clobbering operator-managed media
 * fields (stream_uid, poster_image_id, hero_image_id) once they are set.
 */

interface SeedEpisode {
  slug: string;
  number: number;
  title: string;
  status: string;
  releaseLabel: string;
  releaseDate: string;
  runtime: number | null;
  synopsis: string;
  heroStill: string;
  isFree: number;
}

const EPISODES: SeedEpisode[] = [
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
    isFree: 1,
  },
  {
    slug: "episode-2",
    number: 2,
    title: "How It All Started",
    status: "coming_soon",
    releaseLabel: "Coming July 2026",
    releaseDate: "2026-07-04",
    runtime: null,
    synopsis: "A flashback to the days before everything fell apart.",
    heroStill: "/studios/stills/episode-2-hero.jpg",
    isFree: 0,
  },
  {
    slug: "episode-3",
    number: 3,
    title: "Martial Law",
    status: "coming_soon",
    releaseLabel: "Coming August 2026",
    releaseDate: "2026-08-15",
    runtime: null,
    synopsis: "The city goes under boot. The camps fill up.",
    heroStill: "/studios/stills/episode-3-hero.jpg",
    isFree: 0,
  },
  {
    slug: "episode-4",
    number: 4,
    title: "The Raid",
    status: "coming_soon",
    releaseLabel: "Coming September 2026",
    releaseDate: "2026-09-20",
    runtime: null,
    synopsis: "Friends become an army. The first organized strike.",
    heroStill: "/studios/stills/episode-4-hero.jpg",
    isFree: 0,
  },
  {
    slug: "episode-5",
    number: 5,
    title: "Episode 5",
    status: "coming_soon",
    releaseLabel: "Coming October 2026",
    releaseDate: "2026-10-18",
    runtime: null,
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-5-hero.jpg",
    isFree: 0,
  },
  {
    slug: "episode-6",
    number: 6,
    title: "Episode 6",
    status: "coming_soon",
    releaseLabel: "Coming November 2026",
    releaseDate: "2026-11-15",
    runtime: null,
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-6-hero.jpg",
    isFree: 0,
  },
  {
    slug: "episode-7",
    number: 7,
    title: "Episode 7",
    status: "coming_soon",
    releaseLabel: "Coming December 2026",
    releaseDate: "2026-12-13",
    runtime: null,
    synopsis: "Title and synopsis to be released.",
    heroStill: "/studios/stills/episode-7-hero.jpg",
    isFree: 0,
  },
];

async function seed(): Promise<void> {
  for (const episode of EPISODES) {
    await db
      .insert(studiosEpisode)
      .values({
        slug: episode.slug,
        number: episode.number,
        title: episode.title,
        status: episode.status,
        releaseLabel: episode.releaseLabel,
        releaseDate: episode.releaseDate,
        runtime: episode.runtime,
        synopsis: episode.synopsis,
        heroStill: episode.heroStill,
        priceCents: 700,
        isFree: episode.isFree,
        published: 1,
        sortOrder: episode.number,
      })
      .onDuplicateKeyUpdate({
        set: {
          number: sql`values(number)`,
          title: sql`values(title)`,
          status: sql`values(status)`,
          releaseLabel: sql`values(release_label)`,
          releaseDate: sql`values(release_date)`,
          runtime: sql`values(runtime)`,
          synopsis: sql`values(synopsis)`,
          heroStill: sql`values(hero_still)`,
          isFree: sql`values(is_free)`,
          published: sql`values(published)`,
          sortOrder: sql`values(sort_order)`,
        },
      });
    console.log(`[seed] upserted ${episode.slug}`);
  }
  console.log(`[seed] done: ${EPISODES.length} studios episodes`);
}

seed()
  .then(() => process.exit(0))
  .catch((error: unknown) => {
    console.error("[seed] failed:", error);
    process.exit(1);
  });
