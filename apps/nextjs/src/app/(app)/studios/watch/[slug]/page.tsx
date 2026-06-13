import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import type { Episode } from "~/lib/studios/episodes";
import { StudiosWatchClient } from "~/components/studios/studios-watch-client";
import { env } from "~/env/client";
import { hasEpisode1Access } from "~/lib/studios/access";
import { getEpisodeBySlugDb } from "~/lib/studios/episodes-db";
import { getPublicHlsUrl, getSignedHlsUrl } from "~/lib/studios/stream";

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const episode = await getEpisodeBySlugDb(slug);
  if (!episode) return { title: "Watch" };
  return {
    title: `Watch Episode ${episode.number}: ${episode.title}`,
    description: episode.synopsis,
  };
}

/**
 * Resolves the HLS source for an episode. When a Cloudflare Stream uid is set,
 * free episodes play the public manifest and paid episodes get a short-lived
 * signed manifest. The NEXT_PUBLIC_EPISODE_1_HLS_URL env var stays as the
 * final fallback so the current staging setup keeps working.
 */
function resolveStreamSrc(episode: Episode): string {
  if (episode.streamUid) {
    return episode.isFree
      ? getPublicHlsUrl(episode.streamUid)
      : getSignedHlsUrl(episode.streamUid);
  }
  return env.NEXT_PUBLIC_EPISODE_1_HLS_URL;
}

export default async function WatchPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const episode = await getEpisodeBySlugDb(slug);
  if (!episode) notFound();

  if (slug === "episode-1") {
    const hasAccess = await hasEpisode1Access();
    if (!hasAccess) redirect(`/studios/episodes/${slug}`);
  } else {
    // TODO(phase3): check Bronze subscription / producer status / single-episode purchase
    redirect(`/studios/episodes/${slug}`);
  }

  // Plays from Cloudflare Stream when a streamUid is set on the episode,
  // otherwise falls back to NEXT_PUBLIC_EPISODE_1_HLS_URL for the current
  // staging setup.
  const hlsUrl = resolveStreamSrc(episode);
  if (!hlsUrl) {
    return (
      <div className="flex min-h-[calc(100svh-4rem)] items-center justify-center bg-black px-6 text-center text-white md:min-h-[calc(100svh-5rem)]">
        <div className="max-w-lg">
          <p className="font-display text-xs uppercase tracking-[0.4em] text-[rgb(var(--studios-accent))]">
            Stream not configured
          </p>
          <h1 className="font-display mt-3 text-3xl text-white md:text-4xl">
            Episode 1 video URL not configured.
          </h1>
          <p className="font-editorial mt-4 text-sm text-white/70">
            Set NEXT_PUBLIC_EPISODE_1_HLS_URL in the environment to enable
            playback. Until then, the unlock cookie is set and the route is
            ready.
          </p>
          <Link
            href={`/studios/episodes/${episode.slug}`}
            className="font-display mt-8 inline-flex rounded-full bg-white/10 px-5 py-2 text-xs uppercase tracking-[0.28em] text-white backdrop-blur transition hover:bg-white/20"
          >
            Back to Episode {episode.number}
          </Link>
        </div>
      </div>
    );
  }

  return <StudiosWatchClient episode={episode} src={hlsUrl} />;
}
