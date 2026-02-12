import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getSession } from "~/auth/server";
import { VideoFeed } from "~/components/video/video-feed";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function SingleVideoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const videoId = Number(id);

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  if (isNaN(videoId) || videoId <= 0) {
    redirect("/videos");
  }

  // Prefetch the specific video
  prefetch(trpc.video.getById.queryOptions({ id: videoId }));

  // Prefetch initial video list (the feed will start from this video)
  prefetch(
    trpc.video.list.infiniteQueryOptions({
      limit: 10,
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
        <VideoFeed initialVideoId={videoId} />
      </Suspense>
    </HydrateClient>
  );
}
