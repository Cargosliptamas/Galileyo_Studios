import { asc, eq } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { studiosEpisode } from "@galileyo/db/schema";

import type { Episode, EpisodeStatus } from "./episodes";
import { EPISODES, getEpisodeBySlug } from "./episodes";

type EpisodeRow = typeof studiosEpisode.$inferSelect;

function toStatus(value: string): EpisodeStatus {
  return value === "available" ? "available" : "coming_soon";
}

function toCuePoints(value: unknown): number[] | null {
  return Array.isArray(value)
    ? value.filter((entry): entry is number => typeof entry === "number")
    : null;
}

function mapRow(row: EpisodeRow): Episode {
  return {
    slug: row.slug,
    number: row.number,
    title: row.title,
    status: toStatus(row.status),
    releaseLabel: row.releaseLabel ?? "",
    releaseDate: row.releaseDate ?? "",
    synopsis: row.synopsis ?? "",
    heroStill: row.heroStill ?? "",
    runtime: row.runtime ?? undefined,
    streamUid: row.streamUid,
    posterImageId: row.posterImageId,
    heroImageId: row.heroImageId,
    priceCents: row.priceCents,
    isFree: row.isFree === 1,
    published: row.published === 1,
    adsOnPaid: row.adsOnPaid === 1,
    adCuePoints: toCuePoints(row.adCuePoints),
  };
}

/**
 * All published episodes ordered for display. Falls back to the static array
 * when the table is empty (before the first seed) or when the read fails, so
 * the roadmap never breaks.
 */
export async function getPublishedEpisodes(): Promise<Episode[]> {
  try {
    const rows = await db
      .select()
      .from(studiosEpisode)
      .where(eq(studiosEpisode.published, 1))
      .orderBy(asc(studiosEpisode.sortOrder));
    if (rows.length === 0) return EPISODES;
    return rows.map(mapRow);
  } catch (error) {
    console.error("[studios] Failed to load episodes from DB:", error);
    return EPISODES;
  }
}

/**
 * A single episode by slug, falling back to the static array when the table
 * is empty, the slug is not yet seeded, or the read fails.
 */
export async function getEpisodeBySlugDb(
  slug: string,
): Promise<Episode | undefined> {
  try {
    const rows = await db
      .select()
      .from(studiosEpisode)
      .where(eq(studiosEpisode.slug, slug))
      .limit(1);
    const row = rows[0];
    if (!row) return getEpisodeBySlug(slug);
    return mapRow(row);
  } catch (error) {
    console.error("[studios] Failed to load episode from DB:", error);
    return getEpisodeBySlug(slug);
  }
}
