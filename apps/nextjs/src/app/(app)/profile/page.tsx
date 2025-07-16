import { Suspense } from "react";
import { redirect } from "next/navigation";
import Profile from "~/components/profile/Profile";
import { getSession } from "~/auth/server";
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
      <main className="container py-16">
        <h1 className="text-2xl font-bold">Profile</h1>
        <p>
          Welcome, {session.user.firstName} {session.user.lastName}
        </p>

        <Suspense fallback={<div>Loading...</div>}>
          <Profile />
          {/* <Debug /> */}
        </Suspense>
      </main>
    </HydrateClient>
  );
}
