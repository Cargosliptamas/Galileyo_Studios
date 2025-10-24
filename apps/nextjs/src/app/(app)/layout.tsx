import { SpeedInsights } from "@vercel/speed-insights/next";

import { getSession } from "~/auth/server";
import { SiteFooter } from "~/components/site-footer";
import { SiteHeader } from "~/components/site-header";
// import { flags } from "~/flags/server";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  // const showMap = await flags["show-map"]();
  const showMap = true;

  return (
    <div className="font-inter relative z-10 flex min-h-svh flex-col bg-background dark:bg-slate-900">
      <SiteHeader user={session?.user} showMap={showMap} />
      <main className="flex flex-1 flex-col">{children}</main>
      <SiteFooter />
      <SpeedInsights />
    </div>
  );
}
