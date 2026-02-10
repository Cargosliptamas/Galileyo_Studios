import type { Metadata } from "next";
import { notFound } from "next/navigation";

import type { PricingPlan } from "~/lib/server/types";
import { getSession } from "~/auth/server";
import { InfluencerPromoPage } from "~/components/public-site/influencer-promo-page";
import { getInfluencerAlerts } from "~/lib/server/home";
import { getInfluencerPromoCode } from "~/lib/server/promo-code";

// Additional plan data for display
const additionalPlanData: Record<
  number,
  {
    name?: string;
    description?: string;
    subtext?: string;
    features: string[];
    cta: string;
    popular: boolean;
    highlight: boolean;
  }
> = {
  100: {
    name: "Free",
    description: "Stay Aware",
    subtext: "Start with core alerts and map access.",
    features: [
      "Real-time alerts for weather, outages, and emergencies",
      "Community posts and verified updates",
      "Local zone map access",
      "Chronological feed - no algorithm bias",
    ],
    cta: "Start Free",
    popular: false,
    highlight: false,
  },
  101: {
    name: "Silver",
    description: "Stay Connected",
    subtext: "Unlock full map access and deeper insights.",
    features: [
      "Everything in Bronze, plus:",
      "Ad-free experience",
      "Full regional map overlays + discovery zone",
      "Early feature access",
      "Baseline rewards and recognition",
    ],
    cta: "Upgrade to Silver",
    popular: true,
    highlight: true,
  },
  102: {
    name: "GOLD",
    description: "Stay Ahead",
    subtext:
      "Built for travelers, responders, and long-time users who rely on Galileyo everywhere.",
    features: [
      "Everything in Silver, plus:",
      "Expanded map with global and satellite layers",
      "Advanced dashboards (weather, infrastructure, finance)",
      "Beta features and premium support",
      "Offline & device-linked alerts (via satellite partners)",
    ],
    cta: "Upgrade to Gold",
    popular: false,
    highlight: false,
  },
  103: {
    name: "Bronze",
    description: "Stay Informed",
    subtext: "Gain access to share your thoughts and comments on posts.",
    features: [
      "Everything in Free, plus:",
      "Ability to create posts and comments",
    ],
    cta: "Upgrade to Bronze",
    popular: false,
    highlight: false,
  },
};

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InfluencerAffiliatePage({
  params,
}: {
  params: Promise<{ "influencer-affiliate": string }>;
}) {
  const { "influencer-affiliate": influencerAffiliate } = await params;

  if (!influencerAffiliate) {
    return notFound();
  }

  const promoCodeData = await getInfluencerPromoCode(influencerAffiliate);

  if (!promoCodeData) {
    return notFound();
  }

  const { promoCode, influencer, service, influencerInfo } = promoCodeData;

  // Check if user is logged in
  const session = await getSession();

  // Convert service to PricingPlan format
  const plan: PricingPlan = {
    id: service?.id.toString() ?? "0",
    name: additionalPlanData[service?.id ?? 0]?.name ?? service?.name ?? "",
    price: service?.price?.toString() ?? "0",
    priceNumber: service?.price ?? 0,
    period: "/month",
    description: additionalPlanData[service?.id ?? 0]?.description ?? "",
    subtext:
      additionalPlanData[service?.id ?? 0]?.subtext ??
      service?.description ??
      "",
    features: additionalPlanData[service?.id ?? 0]?.features ?? [],
    cta: additionalPlanData[service?.id ?? 0]?.cta ?? "",
    popular: additionalPlanData[service?.id ?? 0]?.popular ?? false,
    highlight: additionalPlanData[service?.id ?? 0]?.highlight ?? false,
  };

  // Format promo code data for the component
  const promoCodeFormatted = {
    id: promoCode.id,
    text: promoCode.text,
    discount: promoCode.discount,
    description: promoCode.description,
    trialPeriod: promoCode.trialPeriod,
  };

  const alerts = await getInfluencerAlerts({
    subscriptionIds: promoCodeData.subscriptions.map(
      (subscription) => subscription.id,
    ),
    limit: 1000,
  });

  return (
    <InfluencerPromoPage
      promoCode={promoCodeFormatted}
      influencerInfo={influencerInfo}
      plan={plan}
      isLoggedIn={!!session}
      affiliateToken={influencer.affiliateToken ?? undefined}
      alerts={alerts}
    />
  );
}
