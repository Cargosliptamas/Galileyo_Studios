// import { Suspense } from "react";

// import { Button } from "@galileyo/ui/button";

import {
  HydrateClient,
  // prefetch,
  // trpc,
} from "~/trpc/server";
import HomePageComponent from "~/components/public-site/home";

export default function HomePage() {
  // prefetch(trpc.post.all.queryOptions());

  return (
    <HydrateClient>
      <main className="container">
        <HomePageComponent />
      </main>
    </HydrateClient>
  );
}
