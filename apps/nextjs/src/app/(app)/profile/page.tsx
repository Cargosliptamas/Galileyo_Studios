import { Suspense } from "react";
import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import Profile from "~/components/profile/Profile";
//import { Debug } from "~/components/dashboard/debug";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  prefetch(trpc.profile.getProfile.queryOptions());

  return (
    <HydrateClient>
      <Suspense fallback={<div>Loading...</div>}>
        <Profile />
        {/* <Debug /> */}
      </Suspense>
    </HydrateClient>
  );
}
