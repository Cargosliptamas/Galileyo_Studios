import { redirect } from "next/navigation";

import type { PricingPlan } from "~/lib/server/types";
import { getSession } from "~/auth/server";
import SignupPage from "~/components/public-site/signup-page";
import { getPricingPlans } from "~/lib/server/home";
import { HydrateClient } from "~/trpc/server";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  const { plan } = await searchParams;

  if (session) {
    return redirect("/dashboard");
  }

  let selectedPlan: PricingPlan | undefined;

  if (plan) {
    const pricingPlan = await getPricingPlans();
    const foundPlan = pricingPlan.find((p) => p.id === plan);

    if (foundPlan && foundPlan.priceNumber > 0) {
      selectedPlan = foundPlan;
    }
  }

  return (
    <HydrateClient>
      <SignupPage className="mb-8" selectedPlan={selectedPlan} />
    </HydrateClient>
  );
}
