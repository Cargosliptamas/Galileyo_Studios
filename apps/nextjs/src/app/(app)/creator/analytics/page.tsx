import { Suspense } from "react";
import { redirect } from "next/navigation";
import { Loader2 } from "lucide-react";

import { getSession } from "~/auth/server";
import { CreatorAnalytics } from "~/components/creator/creator-analytics";
import { HydrateClient } from "~/trpc/server";

export const metadata = {
  title: "Creator Analytics",
  description: "View your video performance analytics",
};

export default async function CreatorAnalyticsPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <HydrateClient>
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <CreatorAnalytics />
      </Suspense>
    </HydrateClient>
  );
}
