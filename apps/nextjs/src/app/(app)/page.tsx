// import { Suspense } from "react";

// import { Button } from "@galileyo/ui/button";

import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { HomePage as HomePageComponent } from "~/components/public-site/home-page";
import {
  HydrateClient,
  // prefetch,
  // trpc,
} from "~/trpc/server";

export default async function HomePage() {
  // prefetch(trpc.post.all.queryOptions());
  const session = await getSession();

  if (session) {
    return redirect("/dashboard");
  }

  return (
    <HydrateClient>
      {/* <main className="container"> */}
      <HomePageComponent />
      {/* </main> */}
    </HydrateClient>
  );
}
