"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Check,
  Clock,
  Gift,
  Shield,
  Sparkles,
  Star,
  Users,
  Zap,
} from "lucide-react";
import * as motion from "motion/react-client";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import type { ProfileInfo } from "~/lib/server/profile";
import type { PricingPlan } from "~/lib/server/types";
import type { Alert } from "~/lib/types/alert";
import { setAffiliateCookie } from "~/app/actions";
import { getInfluencerImageUrl } from "~/lib/image";
import { ImageWithFallback } from "../image-with-fallback";
import { HomeAlertMap } from "./home-client";

interface InfluencerPromoPageProps {
  promoCode: {
    id: number;
    text: string;
    discount: number;
    description: string | null;
    trialPeriod: number | null;
  };
  influencerInfo: ProfileInfo;
  plan: PricingPlan;
  isLoggedIn: boolean;
  affiliateToken?: string;
  alerts: Alert[];
}

export function InfluencerPromoPage({
  promoCode,
  influencerInfo,
  plan,
  isLoggedIn,
  affiliateToken,
  alerts,
}: InfluencerPromoPageProps) {
  const router = useRouter();

  const originalPrice = plan.priceNumber;
  const discountedPrice = originalPrice * (1 - promoCode.discount / 100);
  const savings = originalPrice - discountedPrice;

  const profileImage = getInfluencerImageUrl(influencerInfo.image);
  const headerImage = getInfluencerImageUrl(influencerInfo.headerImage);

  const displayName =
    influencerInfo.title ?? influencerInfo.name ?? "Influencer";

  const handleCTAClick = useCallback(async () => {
    if (affiliateToken) {
      await setAffiliateCookie(affiliateToken);
    }

    if (isLoggedIn) {
      // Logged in users go directly to payment
      router.push(`/payment?plan=${plan.id}`);
    } else {
      // Non-logged-in users: redirect to signup
      router.push(`/sign-up?plan=${plan.id}`);
    }
  }, [router, plan.id, isLoggedIn, affiliateToken]);

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      {/* Hero Section with Header Image */}
      <section className="relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/5 to-purple-500/10" />

        {/* Header image background */}
        {headerImage && (
          <div className="absolute inset-0 opacity-20">
            <ImageWithFallback
              src={headerImage}
              fallback={
                <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600" />
              }
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50 dark:via-slate-950/80 dark:to-slate-950" />
          </div>
        )}

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Left: Influencer Info & Promo */}
            <motion.div {...fadeInUp}>
              {/* Exclusive Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-gradient-to-r from-amber-500/20 to-orange-500/20 px-4 py-2 text-amber-600 dark:text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-semibold">
                  Exclusive Partner Offer
                </span>
              </div>

              {/* Influencer Card */}
              <div className="mb-8 flex items-center gap-4">
                {profileImage ? (
                  <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white shadow-xl dark:border-slate-800">
                    <ImageWithFallback
                      src={getInfluencerImageUrl(profileImage)}
                      fallback={
                        <div className="h-20 w-20 bg-gradient-to-br from-cyan-500 to-blue-500 text-2xl font-bold text-white shadow-xl dark:border-slate-800">
                          {displayName.charAt(0)}
                        </div>
                      }
                      className="h-20 w-20 object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-cyan-500 to-blue-500 text-2xl font-bold text-white shadow-xl dark:border-slate-800">
                    {displayName.charAt(0)}
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    Recommended by
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {displayName}
                  </h2>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="mb-4 text-4xl font-bold leading-tight text-slate-900 dark:text-white lg:text-5xl">
                Get{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  {promoCode.discount}% Off
                </span>{" "}
                Galileyo {plan.name}
              </h1>

              {/* Description */}
              {promoCode.description ? (
                <p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
                  {promoCode.description}
                </p>
              ) : (
                <p className="mb-6 text-lg text-slate-600 dark:text-slate-300">
                  {displayName} has partnered with Galileyo to bring you an
                  exclusive discount on our {plan.name} plan. Stay connected,
                  stay informed, stay safe.
                </p>
              )}

              {/* Trial Period Badge */}
              {promoCode.trialPeriod && promoCode.trialPeriod > 0 && (
                <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-green-500/10 px-4 py-2 text-green-600 dark:text-green-400">
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold">
                    {promoCode.trialPeriod} day free trial included!
                  </span>
                </div>
              )}

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span>Trusted by Thousands</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <Zap className="h-4 w-4 text-amber-500" />
                  <span>Instant Access</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Pricing Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="relative rounded-2xl border border-cyan-500/30 bg-white p-8 shadow-2xl shadow-cyan-500/10 dark:bg-slate-900">
                {/* Popular Badge */}
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1.5 text-sm font-semibold text-white shadow-lg">
                    <Gift className="h-4 w-4" />
                    Limited Time Offer
                  </div>
                </div>

                {/* Plan Name */}
                <div className="mb-6 text-center">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Galileyo {plan.name}
                  </h3>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    {plan.description}
                  </p>
                </div>

                {/* Pricing */}
                <div className="mb-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl text-slate-400 line-through">
                      ${originalPrice.toFixed(2)}
                    </span>
                    <span className="text-5xl font-bold text-cyan-500">
                      ${discountedPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500 dark:text-slate-400">
                    {plan.period}
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-green-500/10 px-3 py-1 text-sm font-semibold text-green-600 dark:text-green-400">
                    <Sparkles className="h-3 w-3" />
                    You save ${savings.toFixed(2)}
                    {plan.period}
                  </div>
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    * Discount applies to yearly subscription only
                  </p>
                </div>

                {/* Features */}
                <ul className="mb-8 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-500" />
                      <span className="text-slate-600 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-lg font-semibold shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400"
                  onClick={handleCTAClick}
                >
                  {isLoggedIn ? "Subscribe Now" : "Claim Your Discount"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>

                {/* Promo Code Display */}
                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-400">
                    This discount will be applied automatically at checkout.
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    (valid for yearly subscription)
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* INSource Map Section */}
      <section className="bg-slate-50 py-16 dark:bg-slate-800/50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-2 text-cyan-600 dark:text-cyan-400">
                <Zap className="h-4 w-4" />
                <span className="font-medium">Exclusive Feature</span>
              </div>
              <h2 className="mb-4 text-4xl font-bold text-slate-900 dark:text-white">
                {displayName} on INSource Map
              </h2>
              <p className="mb-2 text-lg text-cyan-600 dark:text-cyan-400">
                Influential News Source
              </p>
              <p className="mx-auto max-w-2xl text-slate-600 dark:text-slate-300">
                See {displayName}'s real-time updates on an interactive map.
                Stay informed about critical news and events as they happen -
                directly from a source you trust.
              </p>
            </div>

            {/* Map Preview */}
            <div className="mb-16 w-full text-center">
              <div className="h-[500px] w-full">
                <HomeAlertMap alerts={alerts} />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Users className="h-6 w-6 text-cyan-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Direct Access
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Get {displayName}'s updates directly - no middleman, no
                  censorship, just the truth.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800">
                <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                  <Star className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  Real-Time Alerts
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Get instant notifications when {displayName} posts critical
                  updates in your area.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
              Why Choose Galileyo?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Real-time emergency alerts and community updates when you need
              them most
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Zap,
                title: "Real-Time Alerts",
                description:
                  "Get instant notifications about emergencies, weather events, and critical updates in your area.",
                color: "text-amber-500",
                bg: "bg-amber-500/10",
              },
              {
                icon: Users,
                title: "Community Updates",
                description:
                  "Connect with your community and trusted sources for verified, real-time information.",
                color: "text-blue-500",
                bg: "bg-blue-500/10",
              },
              {
                icon: Shield,
                title: "No Ad Algorithm",
                description:
                  "See updates chronologically, not filtered by algorithms. Get the information you need, when you need it.",
                color: "text-green-500",
                bg: "bg-green-500/10",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-800"
              >
                <div
                  className={cn(
                    "mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg",
                    feature.bg,
                  )}
                >
                  <feature.icon className={cn("h-6 w-6", feature.color)} />
                </div>
                <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-cyan-500 to-blue-500 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-3xl font-bold text-white">
            Don't Miss This Exclusive Offer
          </h2>
          <p className="mb-6 text-lg text-cyan-100">
            Get {promoCode.discount}% off Galileyo {plan.name} with{" "}
            {displayName}'s exclusive promo code. Limited time only.
          </p>
          <p className="mb-8 text-sm text-cyan-200">
            * Discount applies to yearly subscription
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="text-lg font-semibold"
            onClick={handleCTAClick}
          >
            {isLoggedIn
              ? `Subscribe Now - $${discountedPrice.toFixed(2)}${plan.period}`
              : `Claim Your ${promoCode.discount}% Discount`}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>
    </div>
  );
}
