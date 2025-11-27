import Link from "next/link";
import {
  // Clock,
  AlertCircle,
  Calendar,
  Check,
  Gift,
  GiftIcon,
  Star,
  Users,
} from "lucide-react";
import * as motion from "motion/react-client";

import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";

import { CountdownTimer } from "~/components/holiday-promo/countdown-timer";
import { getPricingPlans } from "~/lib/server/home";
import { HydrateClient } from "~/trpc/server";

export default async function HolidayPromoPage() {
  const pricingPlans = await getPricingPlans();
  // Find Bronze and Silver plans by name (case-insensitive)
  const bronzePlan = pricingPlans.find((p) => p.id === "101");
  const silverPlan = pricingPlans.find((p) => p.id === "102");

  const promoStartDate = "November 29, 2024"; // Black Friday
  const promoEndDate = "December 31, 2025";
  const promoEndTime = "11:59 PM Mountain Time";

  // Create end date: December 31, 2025 at 11:59 PM MST (UTC-7)
  // Note: December is in MST (no daylight saving), so UTC-7
  const promoEndDateTime = "2025-12-31T23:59:00-07:00";

  return (
    <HydrateClient>
      <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-r from-green-500/20 to-emerald-500/20 blur-3xl"
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8 flex justify-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-3 text-cyan-400 backdrop-blur-sm">
                <GiftIcon className="h-5 w-5" />
                <span className="font-semibold">
                  Limited Time Holiday Offer
                </span>
              </div>
            </motion.div>

            {/* Main Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <h1 className="mb-6 text-center text-5xl font-bold leading-tight text-white lg:text-7xl">
                <span className="block bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500 bg-clip-text text-transparent">
                  Holiday Promotion
                </span>
                <span className="mt-4 block text-4xl lg:text-6xl">
                  Membership Deal
                </span>
              </h1>

              <p className="mx-auto mb-8 max-w-3xl text-xl text-slate-300 lg:text-2xl">
                {bronzePlan && silverPlan ? (
                  <>
                    Sign up for {bronzePlan.name} or {silverPlan.name} and get a
                    second account free at the same tier.
                  </>
                ) : (
                  "Sign up for a membership and get a second account free at the same tier."
                )}
              </p>

              {/* Countdown Timer */}
              {/* <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mb-12 inline-flex items-center gap-3 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-4 backdrop-blur-sm"
              >
                <Clock className="h-5 w-5 text-cyan-400" />
                <div className="text-left">
                  <div className="text-sm text-cyan-400">Offer Ends</div>
                  <div className="font-bold text-white">
                    {promoEndDate} at {promoEndTime}
                  </div>
                </div>
              </motion.div> */}

              <div className="mb-12 flex justify-center">
                <CountdownTimer endDate={promoEndDateTime} />
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              {bronzePlan && (
                <Link href={`/sign-up?plan=${bronzePlan.id}&promo=holiday`}>
                  <Button
                    size="lg"
                    className="group relative overflow-hidden bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-6 text-lg font-bold text-white shadow-2xl shadow-cyan-500/50 transition-all hover:from-cyan-400 hover:to-blue-400 hover:shadow-cyan-500/70"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Gift className="h-5 w-5" />
                      Get {bronzePlan.name}
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-400/20"
                      animate={{
                        x: ["-100%", "100%"],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                    />
                  </Button>
                </Link>
              )}

              {silverPlan && (
                <Link href={`/sign-up?plan=${silverPlan.id}&promo=holiday`}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="group relative overflow-hidden border-2 border-slate-400 bg-slate-800/50 px-8 py-6 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-slate-700/50"
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      <Star className="h-5 w-5" />
                      Get {silverPlan.name}
                    </span>
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="relative bg-slate-900/50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
                How It Works
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-300">
                Simple, straightforward, and designed to help you share Galileyo
                with someone special.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  step: "1",
                  title: "Sign Up",
                  description:
                    bronzePlan && silverPlan
                      ? `Create a new ${bronzePlan.name} or ${silverPlan.name} membership account during the promo period.`
                      : "Create a new membership account during the promo period.",
                  icon: <Users className="h-8 w-8" />,
                },
                {
                  step: "2",
                  title: "Get Your Free Account",
                  description:
                    "Receive a second account at the same tier, completely free for as long as both accounts remain active.",
                  icon: <Gift className="h-8 w-8" />,
                },
                {
                  step: "3",
                  title: "Stay Connected",
                  description:
                    "Both accounts stay active and free as long as the paid account remains active.",
                  icon: <Check className="h-8 w-8" />,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="h-full border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-2xl font-bold text-white">
                          {item.step}
                        </div>
                        <div className="text-cyan-400">{item.icon}</div>
                      </div>
                      <CardTitle className="text-2xl text-white">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Cards Section */}
        <section className="py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
                Choose Your Tier
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-300">
                {bronzePlan && silverPlan
                  ? `Both ${bronzePlan.name} and ${silverPlan.name} tiers are eligible for this holiday offer.`
                  : "Both tiers are eligible for this holiday offer."}
              </p>
            </motion.div>

            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
              {[bronzePlan, silverPlan].filter(Boolean).map((plan, index) => (
                <motion.div
                  key={plan?.id ?? index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="relative h-full border-2 border-slate-700 bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:shadow-2xl hover:shadow-cyan-500/20">
                    {/* Promo Badge */}
                    <div className="absolute -right-4 -top-4 z-10">
                      <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-bold text-white shadow-lg">
                        <Gift className="h-4 w-4" />
                        PROMO
                      </div>
                    </div>

                    <CardHeader>
                      <CardTitle className="mb-2 text-3xl text-white">
                        {plan?.name}
                      </CardTitle>
                      <p className="text-slate-300">{plan?.description}</p>
                      <div className="mt-4 flex items-baseline">
                        <span className="text-5xl font-bold text-white">
                          ${plan?.price}
                        </span>
                        {plan?.period && (
                          <span className="ml-2 text-slate-400">
                            {plan.period}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-slate-400">
                        {plan?.subtext}
                      </p>
                    </CardHeader>

                    <CardContent>
                      <ul className="mb-8 space-y-3">
                        {plan?.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-start gap-3"
                          >
                            <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-400" />
                            <span className="text-slate-300">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      <Link
                        href={`/sign-up?plan=${plan?.id}&promo=holiday`}
                        className="block"
                      >
                        <Button
                          size="lg"
                          className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 font-bold text-white transition-all hover:from-cyan-400 hover:to-blue-400"
                        >
                          <Gift className="mr-2 h-5 w-5" />
                          Get {plan?.name}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Important Details Section */}
        <section className="bg-slate-900/50 py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mb-16 text-center"
            >
              <h2 className="mb-4 text-4xl font-bold text-white lg:text-5xl">
                Important Details
              </h2>
              <p className="mx-auto max-w-2xl text-xl text-slate-300">
                Everything you need to know about this holiday promotion.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: "Promo Period",
                  description: (
                    <>
                      Starts: <strong>{promoStartDate}</strong> (Black Friday)
                      <br />
                      Ends:{" "}
                      <strong>
                        {promoEndDate} at {promoEndTime}
                      </strong>
                    </>
                  ),
                  icon: <Calendar className="h-8 w-8" />,
                  iconColor: "text-cyan-400",
                  badgeColor: "from-cyan-500 to-blue-500",
                },
                {
                  title: "Free Account Stays Free",
                  description:
                    "The free account remains free as long as both accounts remain active. No additional charges.",
                  icon: <Check className="h-8 w-8" />,
                  iconColor: "text-green-400",
                  badgeColor: "from-green-500 to-emerald-500",
                },
                {
                  title: "If Free Account is Canceled",
                  description:
                    "The paid user's price stays the same. No replacement free account will be issued.",
                  icon: <Users className="h-8 w-8" />,
                  iconColor: "text-blue-400",
                  badgeColor: "from-blue-500 to-cyan-500",
                },
                {
                  title: "One-Time Offer",
                  description:
                    "This is a one-and-done offer. No stacking or recurring freebies. One free account per paid membership.",
                  icon: <Star className="h-8 w-8" />,
                  iconColor: "text-purple-400",
                  badgeColor: "from-purple-500 to-pink-500",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <Card className="h-full border-slate-700 bg-slate-800/50 backdrop-blur-sm">
                    <CardHeader>
                      <div className="mb-4 flex items-center justify-between">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${item.badgeColor} text-2xl font-bold text-white`}
                        >
                          <AlertCircle className="h-6 w-6" />
                        </div>
                        <div className={item.iconColor}>{item.icon}</div>
                      </div>
                      <CardTitle className="text-2xl text-white">
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-300">{item.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-20">
          <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-6 text-4xl font-bold text-white lg:text-5xl">
                Don't Miss Out!
              </h2>
              <p className="mb-8 text-xl text-slate-300">
                This exclusive holiday offer ends{" "}
                <strong className="text-cyan-400">
                  {promoEndDate} at {promoEndTime}
                </strong>
                . Sign up now to secure your membership.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                {bronzePlan && (
                  <Link href={`/sign-up?plan=${bronzePlan.id}&promo=holiday`}>
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-6 text-lg font-bold text-white shadow-2xl shadow-cyan-500/50 transition-all hover:from-cyan-400 hover:to-blue-400"
                    >
                      <Gift className="mr-2 h-5 w-5" />
                      Get Started with {bronzePlan.name}
                    </Button>
                  </Link>
                )}

                {silverPlan && (
                  <Link href={`/sign-up?plan=${silverPlan.id}&promo=holiday`}>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-2 border-slate-400 bg-slate-800/50 px-8 py-6 text-lg font-bold text-white backdrop-blur-sm transition-all hover:border-slate-300 hover:bg-slate-700/50"
                    >
                      <Star className="mr-2 h-5 w-5" />
                      Get Started with {silverPlan.name}
                    </Button>
                  </Link>
                )}
              </div>

              <p className="mt-8 text-sm text-slate-400">
                Questions?{" "}
                <Link
                  href="/contact"
                  className="text-cyan-400 underline hover:text-cyan-300"
                >
                  Contact our support team
                </Link>
              </p>
            </motion.div>
          </div>
        </section>
      </div>
    </HydrateClient>
  );
}
