// import { Suspense } from "react";

// import { Button } from "@galileyo/ui/button";

import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { HomePage as HomePageComponent } from "~/components/public-site/home-page";
import { isNativeUserAgent } from "~/lib/server/headers";
import {
  HydrateClient,
  // prefetch,
  // trpc,
} from "~/trpc/server";

export default async function HomePage() {
  // prefetch(trpc.post.all.queryOptions());
  const session = await getSession();
  const isNativeUA = await isNativeUserAgent();

  if (session) {
    return redirect("/dashboard");
  }

  if (isNativeUA) {
    return redirect("/login");
  }

  return (
    <HydrateClient>
      {/* <main className="container"> */}
      <HomePageComponent />
      {/* </main> */}
    </HydrateClient>
  );
}
