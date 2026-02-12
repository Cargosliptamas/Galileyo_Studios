import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getSession } from "~/auth/server";
import { HashtagVideoFeed } from "~/components/video/hashtag-video-feed";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function HashtagPage({
  params,
}: {
  params: Promise<{ hashtag: string }>;
}) {
  const { hashtag } = await params;
  const decodedHashtag = decodeURIComponent(hashtag);

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  // Prefetch videos for this hashtag
  prefetch(
    trpc.video.getVideosByHashtag.infiniteQueryOptions({
      hashtag: decodedHashtag,
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
        <HashtagVideoFeed hashtag={decodedHashtag} />
      </Suspense>
    </HydrateClient>
  );
}
