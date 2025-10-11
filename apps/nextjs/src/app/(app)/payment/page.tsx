import { Suspense } from "react";
import { redirect } from "next/navigation";
// import { Payment } from "~/components/payment/payment";
import { CreditCard, History, Shield } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui";

import { getSession } from "~/auth/server";
import { Membership } from "~/components/payment/membership";
import { PaymentHistory } from "~/components/payment/payment-history";
import { PaymentMethods } from "~/components/payment/payment-methods";
import { PaymentMethodsSkeleton } from "~/components/payment/payment-methods-skeleton";
import { PlanCardSkeleton } from "~/components/payment/plan-card-skeleton";
//import { Debug } from "~/components/dashboard/debug";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

export default async function PaymentPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  prefetch(trpc.payment.getPayment.queryOptions());
  prefetch(trpc.payment.getAvailablePlans.queryOptions({}));

  return (
    <HydrateClient>
      <div className="min-h-screen">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="mb-6 flex items-center gap-4">
              <div className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 p-3">
                <CreditCard className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Payment Details
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  Edit your payment details, add a backup, or switch your
                  preferred payment method.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-5 w-5" />
                  Membership
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Suspense fallback={<PlanCardSkeleton showBadge={true} />}>
                  <Membership user={session.user} />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5" />
                  Payment method
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Suspense fallback={<PaymentMethodsSkeleton />}>
                  <PaymentMethods />
                </Suspense>
              </CardContent>
            </Card>

            <Card className="border-slate-200 bg-white/50 dark:border-slate-700 dark:bg-slate-800/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <History className="h-5 w-5" />
                  Payment history
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <PaymentHistory />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
