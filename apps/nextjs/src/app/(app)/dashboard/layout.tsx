import { getSession } from "~/auth/server";
import { DashboardRail } from "~/components/layout/dashboard-rail";
import { HydrateClient } from "~/trpc/server";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const showMap = true;

  return (
    <HydrateClient>
      <div className="mx-auto flex w-full max-w-[1660px] flex-1 gap-6">
        <main className="min-w-0 flex-1">{children}</main>
        {session?.user ? (
          <DashboardRail user={session.user} showMap={showMap} />
        ) : null}
      </div>
    </HydrateClient>
  );
}
