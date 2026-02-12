import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getSession } from "~/auth/server";
import { SoundVideoFeed } from "~/components/video/sound-video-feed";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function SoundPage({
  params,
}: {
  params: Promise<{ soundId: string }>;
}) {
  const { soundId } = await params;
  const soundIdNumber = parseInt(soundId, 10);

  if (isNaN(soundIdNumber)) {
    redirect("/videos");
  }

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Prefetch sound details and videos
  prefetch(trpc.video.getSound.queryOptions({ soundId: soundIdNumber }));
  prefetch(
    trpc.video.getVideosBySound.infiniteQueryOptions({
      soundId: soundIdNumber,
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
        <SoundVideoFeed soundId={soundIdNumber} />
      </Suspense>
    </HydrateClient>
  );
}
