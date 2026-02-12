import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getSession } from "~/auth/server";
import { VideoFeed } from "~/components/video/video-feed";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function VideosPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v: videoId } = await searchParams;

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Prefetch initial videos
  prefetch(
    trpc.video.list.infiniteQueryOptions({
      limit: 1,
    }),
  );

  return (
    <HydrateClient>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center bg-black">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        }
      >
        <VideoFeed initialVideoId={videoId ? Number(videoId) : undefined} />
      </Suspense>
    </HydrateClient>
  );
}
