// import { Suspense } from "react";

// import { Button } from "@galileyo/ui/button";

import HomePageComponent from "~/components/public-site/home";
import {
  HydrateClient,
  // prefetch,
  // trpc,
} from "~/trpc/server";

export default function HomePage() {
  // prefetch(trpc.post.all.queryOptions());

  return (
    <HydrateClient>
      {/* <main className="container"> */}
      <HomePageComponent />
      {/* </main> */}
    </HydrateClient>
  );
}
