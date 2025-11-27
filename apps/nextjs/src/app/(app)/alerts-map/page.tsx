import { redirect } from "next/navigation";

import type { Session } from "@galileyo/auth";

import { getSession } from "~/auth/server";
import { AlertMapPage } from "~/components/alert-map/alert-map-page";
import { env } from "~/env";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

async function getMapAccess(session: Session) {
  const request = await fetch(`${env.NEXT_PUBLIC_API_URL}/product/list`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.session.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      full_info: true,
      page: 1,
      page_size: 100,
    }),
  });

  const result = (await request.json()) as {
    status: "success" | "error";
    data: {
      list: {
        id: number;
        current: boolean;
        settings?: Record<string, string | number>;
      }[];
    };
  };

  const currentPlan = result.data.list.find((plan) => plan.current);

  if (!currentPlan) {
    return null;
  }

  return currentPlan.settings?.map_access as
    | "local"
    | "full_regional"
    | "global_extended"
    | null;
}

export default async function AlertsMapPage() {
  const session = await getSession();
  if (!session) {
    return redirect("/login");
  }

  let mapAccess = await getMapAccess(session);
  if (!mapAccess) {
    mapAccess = "local";

    if (session.user.isInfluencer) {
      mapAccess = "global_extended";
    }
  }

  prefetch(
    trpc.alerts.list.queryOptions({
      show_influencers: true,
    }),
  );

  return (
    <HydrateClient>
      <AlertMapPage mapAccess={mapAccess} />
    </HydrateClient>
  );
}
