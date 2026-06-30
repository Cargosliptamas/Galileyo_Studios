import { StudiosEpisodeCard } from "~/components/studios/studios-episode-card";
import { getPublishedEpisodes } from "~/lib/show-db";

export const metadata = { title: "Episodes" };

export default async function EpisodesIndexPage() {
  const episodes = await getPublishedEpisodes();

  return (
    <div className="mx-auto max-w-7xl px-5 py-24 md:px-8">
      <h1 className="font-display text-[clamp(2.25rem,9vw,3.5rem)] leading-[1.05] text-[rgb(var(--studios-text))] md:text-6xl">
        All Episodes
      </h1>
      <p className="font-editorial mt-4 text-[rgb(var(--studios-text-muted))]">
        Watch Episode 1 free. Help fund the rest, one at a time.
      </p>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5">
        {episodes.map((episode) => (
          <StudiosEpisodeCard key={episode.slug} episode={episode} />
        ))}
      </div>
    </div>
  );
}
