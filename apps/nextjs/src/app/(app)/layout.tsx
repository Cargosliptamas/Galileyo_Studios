// import { SpeedInsights } from "@vercel/speed-insights/next";

import { getSession } from "~/auth/server";
import { SiteFooter } from "~/components/site-footer";
import { SiteHeader } from "~/components/site-header";
import { UnfinishedPaymentBanner } from "~/components/ui/unfinished-payment-banner";
import { PaymentProvider } from "~/hooks/use-payment";
import { SignupProvider } from "~/hooks/use-signup";

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
      <a
        href="#main-content"
        className="sr-only z-[60] ml-4 mt-2 inline-flex w-fit rounded-md bg-cyan-600 px-4 py-2 text-sm font-semibold text-white focus:not-sr-only focus:absolute focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
      >
        Skip to content
      </a>
      <SiteHeader user={session?.user} showMap={showMap} />
      <main id="main-content" className="flex flex-1 flex-col">
        {session ? (
          <PaymentProvider>
            <UnfinishedPaymentBanner />
            {children}
          </PaymentProvider>
        ) : (
          <SignupProvider>{children}</SignupProvider>
        )}
      </main>
      <SiteFooter />
      {/* <SpeedInsights /> */}
    </div>
  );
}
