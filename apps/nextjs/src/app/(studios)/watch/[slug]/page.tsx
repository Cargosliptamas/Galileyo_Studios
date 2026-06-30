import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import type { Episode } from "~/lib/studios/episodes";
import { StudiosWatchClient } from "~/components/studios/studios-watch-client";
import { env } from "~/env/client";
import { getViewerEmail, hasEpisodeAccess } from "~/lib/studios/access";
import { getEpisodeBySlugDb } from "~/lib/studios/episodes-db";
import { buildStudiosMetadata } from "~/lib/studios/metadata";
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
  return buildStudiosMetadata({
    title: `Watch Episode ${episode.number}: ${episode.title}`,
    description: episode.synopsis,
    path: `/watch/${episode.slug}`,
    heroImageId: episode.heroImageId,
  });
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

  // Episode 1 is gated by the free unlock cookie; paid episodes are gated by a
  // Stripe entitlement (episode unlock, bronze, or producer) resolved from the
  // viewer's email.
  const viewerEmail = await getViewerEmail();
  const hasAccess = await hasEpisodeAccess(slug, viewerEmail);
  if (!hasAccess) redirect(`/show/${slug}`);

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
            href={`/show/${episode.slug}`}
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
