export type EpisodeStatus = "available" | "coming_soon";

export interface Episode {
  slug: string;
  number: number;
  title: string;
  status: EpisodeStatus;
  releaseLabel: string;
  releaseDate: string;
  synopsis: string;
  heroStill: string;
  runtime?: number;
  // Phase 1 media + pricing fields. Present when an episode is sourced from
  // the studios_episode table; undefined for the static fallback array.
  streamUid?: string | null;
  posterImageId?: string | null;
  heroImageId?: string | null;
  priceCents?: number;
  isFree?: boolean;
  published?: boolean;
  adsOnPaid?: boolean;
  adCuePoints?: number[] | null;
}

export const EPISODES: Episode[] = [
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
  },
];

export function getEpisodeBySlug(slug: string): Episode | undefined {
  return EPISODES.find((episode) => episode.slug === slug);
}
