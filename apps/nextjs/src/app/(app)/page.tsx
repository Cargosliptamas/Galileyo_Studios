// import { Suspense } from "react";

import { Button } from "@galileyo/ui/button";
import {
  HydrateClient,
  // prefetch,
  // trpc,
} from "~/trpc/server";

export default function HomePage() {
  // prefetch(trpc.post.all.queryOptions());

  return (
    <HydrateClient>
      <main className="container py-16">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Home
          </h1>
          {/* <AuthShowcase /> */}
          <Button>Click me</Button>
          {/* <CreatePostForm /> */}
          <div className="w-full max-w-2xl overflow-y-scroll">
            {/* <Suspense
              fallback={
                <div className="flex w-full flex-col gap-4">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              }
            >
              <PostList />
            </Suspense> */}
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
