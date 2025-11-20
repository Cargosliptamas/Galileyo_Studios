import { redirect } from "next/navigation";

import { getSession } from "~/auth/server";
import { AlertMapPage } from "~/components/alert-map/alert-map-page";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function AlertsMapPage() {
  const session = await getSession();
  if (!session) {
    return redirect("/login");
  }

  prefetch(
    trpc.alerts.list.queryOptions({
      show_influencers: true,
    }),
  );

  return (
    <HydrateClient>
      <AlertMapPage />
    </HydrateClient>
  );
}
