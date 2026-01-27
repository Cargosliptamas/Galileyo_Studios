import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Globe,
  Lock,
  MapPin,
  Satellite,
  Shield,
  Star,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import * as motion from "motion/react-client";

import type { PricingPlan } from "~/lib/server/types";
import { getSession } from "~/auth/server";
import { getEmergencyAlerts, getPricingPlans } from "~/lib/server/home";
import { PhoneMockup } from "../phone-mockup";
import PromoBanner from "../ui/promo-banner";
import { HomeBackground } from "./home-backround";
import {
  Alerts,
  CTAButtons,
  HomeAlertMap,
  PricingPlanButton,
  Questions,
} from "./home-client";

// import { AlertMap } from "../map/alert-map";

const questions = ["Real Alerts.", "Real People."];

const features = [
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Verified alerts, shared in real time",
    image: "/why1c.jpg",
    description:
      "Receive real-time alerts about emergencies, outages, and critical events — so you can act fast.",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Map view that evolves with events and recovery efforts",
    image: "/why2c.jpg",
    description:
      "Connect with neighbors, influencers, and trusted sources to share vital information during crises.",
  },
  {
    icon: <Bell className="h-8 w-8" />,
    title: "Transparent feed - chronological, not algorithmic",
    image: "/why3c.jpg",
    description:
      "Use our satellite app to stay safe in remote areas — and if you don’t have a satellite device, we’ll give you one for free!",
  },
  {
    icon: <Lock className="h-8 w-8" />,
    title: "Works even in low-connectivity areas",
    image: "/why4c.jpg",
    description:
      "Share updates, messages, and location info seamlessly, keeping everyone safe and informed.",
  },
  {
    icon: <Wallet className="h-8 w-8" />,
    title: "Community coordination tools coming soon",
    image: "/why5c.jpg",
    description:
      "Get discounts and coins just for staying engaged and helping others.",
  },
];

// const pricingPlans = [
//   {
//     name: "Galileyo FREE",
//     price: "Free",
//     period: "",
//     description: "Stay Aware",
//     subtext: "Start with core alerts and map access.",
//     features: [
//       "Real-time alerts for weather, outages, and emergencies",
//       "Community posts and verified updates",
//       "Local zone map access",
//       "Chronological feed - no algorithm bias",
//     ],
//     cta: "Start Free",
//     popular: false,
//     highlight: false,
//     id: "basic",
//   },
//   {
//     name: "Galileyo BRONZE",
//     price: "$4.99",
//     period: "/month",
//     description: "Stay Connected",
//     subtext: "Unlock full map access and deeper insights.",
//     features: [
//       "Ad-free experience",
//       "Full regional map overlays + discovery zone",
//       "Early feature access",
//       "Baseline rewards and recognition",
//     ],
//     cta: "Upgrade to Bronze",
//     popular: true,
//     highlight: true,
//     id: "bronze",
//   },
//   {
//     name: "Galileyo SILVER",
//     price: "$12.99",
//     period: "/month",
//     description: "Stay Ahead",
//     subtext: "Built for travelers, responders, and long-time users who rely on Galileyo everywhere.",
//     features: [
//       "Expanded map with global and satellite layers",
//       "Advanced dashboards (weather, infrastructure, finance)",
//       "Beta features and premium support",
//       "Offline & device-linked alerts (via satellite partners)",
//     ],
//     cta: "Go Silver",
//     popular: false,
//     highlight: false,
//     id: "silver",
//   },
// ];

export async function HomePage() {
  const session = await getSession();
  const pricingPlans = await getPricingPlans();
  const alerts = await getEmergencyAlerts();

  return (
    <>
      {/* Holiday Promo Teaser Banner */}
      {!session && <PromoBanner endDate="2025-12-31T23:59:00-07:00" />}
      <section className="relative overflow-hidden">
        <HomeBackground />

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="lg:order-1">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
                <Shield className="mr-2 h-4 w-4 text-green-400" />
                Trusted by Thousands Worldwide Since 2020.
              </div>

              <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 dark:text-white lg:text-5xl">
                {/* animated question */}
                <Questions items={questions} cycleMs={5000} />

                {/* static gradient ending */}
                <span className="block bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text pb-4 text-transparent dark:from-cyan-400 dark:to-blue-400">
                  No Ad Algorithms.
                </span>

                {/* local CSS for show→hold→hide */}
              </h1>

              {/* Supporting Tagline */}
              <p className="mb-8 text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Galileyo keeps you connected when networks fail - real alerts,
                real people, real time.
                {/* Join the Only Global Social Emergency App that works Off Grid.*/}
                {/* The social emergency app designed that keeps you and your loved ones safe. */}
              </p>

              {/* CTA Buttons */}
              <CTAButtons />

              {/* Emergency Preview Section */}
              <div className="mt-16">
                <div className="mb-6">
                  <div className="text-white-700 mb-4 inline-flex items-center gap-2 rounded-full border-2 border-[#4a85ed] px-4 py-2">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Emergency Alerts</span>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    Get Lifesaving Alerts Now!
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Instant, location-aware alerts for disasters, cyber breaches
                    and emergencies.
                  </p>
                </div>

                {/* News Bar Preview */}
                <div className="mb-6 mt-6">
                  <motion.div className="relative cursor-pointer overflow-hidden rounded-lg bg-slate-900 p-3 text-white shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-red-400">
                        <motion.div
                          className="h-2 w-2 rounded-full bg-red-400"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [1, 0.5, 1],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                        BREAKING
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="animate-marquee whitespace-nowrap text-xs">
                          <span className="mx-4">
                            🚨 EARTHQUAKE 6.2 magnitude detected 45 miles
                            offshore - Tsunami warning issued
                          </span>
                          <span className="mx-4">
                            ⚠️ POWER OUTAGE affecting 50,000 customers in
                            downtown area
                          </span>
                          <span className="mx-4">
                            🔥 WILDFIRE containment increased to 65% -
                            Evacuation orders lifted
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Right Column - Satellite Illustration */}
            <div className="relative flex justify-center self-baseline pt-0 md:pt-12 lg:order-2">
              {/* Mobile Taglines */}

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <PhoneMockup>
                  <video
                    className="max-w-full rounded-xl shadow-lg"
                    src="/galileyo-mobile-video.mp4"
                    poster="/galileyo-mobile-poster.jpg"
                    width={272}
                    height={504}
                    playsInline
                    muted
                    autoPlay
                    loop
                    controls={false}
                    preload="metadata"
                  />
                </PhoneMockup>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="absolute -left-32 top-16 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-500"></div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Emergency Alerts 24./7
                    </span>
                  </div>

                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 transform">
                    <div className="h-0 w-0 border-b-4 border-l-8 border-t-4 border-b-transparent border-l-white/95 border-t-transparent dark:border-l-slate-800/95"></div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.6 }}
                  className="absolute -right-40 top-64 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Critical Influencer Info
                    </span>
                  </div>

                  <div className="absolute -left-2 top-1/2 -translate-y-1/2 transform">
                    <div className="h-0 w-0 border-b-4 border-r-8 border-t-4 border-b-transparent border-r-white/95 border-t-transparent dark:border-r-slate-800/95"></div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 2.0 }}
                  className="absolute -left-36 bottom-32 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Earn Rewards Speaking Truth
                    </span>
                  </div>

                  <div className="absolute -right-2 top-1/2 -translate-y-1/2 transform">
                    <div className="h-0 w-0 border-b-4 border-l-8 border-t-4 border-b-transparent border-l-white/95 border-t-transparent dark:border-l-slate-800/95"></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-white py-20 dark:bg-slate-950 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 w-full text-center">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                INSource Map
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Influential News Source
              </p>
            </div>
            <div className="h-[500px] w-full">
              <HomeAlertMap alerts={alerts} />
            </div>
          </div>

          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl"
            >
              Why Join Galileyo?
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto max-w-4xl text-xl text-slate-600 dark:text-slate-300"
            >
              Stay Informed. Stay Connected. Stay Human.
              {/* Stay informed, when it matters. Galileyo unites communities to
              protect what matters most. */}
            </motion.p>
            <p className="text-l mt-8 text-center text-slate-600 opacity-70 dark:text-slate-300">
              Galileyo unites people who look out for each other. From local
              weather shifts to major outages, you’ll get timely alerts and see
              real updates from others nearby. No hidden filters, no noise -
              just what’s relevant to your world.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -10 }}
                style={{
                  ["background" as string]: `url(${feature.image})`,
                  backgroundSize: "cover",
                }}
                className={`group flex h-[300px] w-[160px] items-end rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800`}
              >
                <div className="pointer-events-none absolute inset-0 rounded-xl bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
                <div className="absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="mb-3 w-full text-center text-lg font-semibold text-white dark:text-white">
                    {feature.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup 
      <section className="lg:py-0">
        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Your safety matters.
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Join Galileyo to help protect each other.
          </p>
          <div className="max-w-mdi mx-auto flex flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
            />
            <button
              className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-400"
              onClick={handleSignupCTA}
            >
              Join Now
            </button>
          </div>
        </div>
      </section>*/}

      {/* Next-Generation Emergency Features Section */}
      <section className="py-20 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 text-orange-400">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Coming Soon</span>
            </div>
            <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl">
              Emergency Support When You Need It Most
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300">
              AI and satellite tech deliver fast, life-saving assistance - when
              every second counts.
            </p>
          </div>

          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            {/* Location-Based Emergency Alerts */}
            <div className="space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-r from-red-500 to-orange-500 p-3">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Location-Based Emergency Alerts
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Hyper-local emergency notifications
                    </p>
                  </div>
                </div>

                <Alerts />

                <div className="mt-6 rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100/70 to-slate-200/70 p-4 dark:border-slate-600 dark:from-slate-900/70 dark:to-slate-800/70">
                  <div className="mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-cyan-500" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Smart Features
                    </span>
                  </div>
                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>• AI-powered threat assessment and routing</li>
                    <li>• Real-time satellite imagery integration</li>
                    <li>• Multi-language emergency broadcasts</li>
                    <li>• Offline emergency protocol downloads</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Sample News Bar */}
            <motion.div className="group space-y-8">
              <div className="rounded-2xl border border-slate-200 bg-white/50 p-8 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-6 flex items-center gap-3">
                  <div className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 p-3">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Real-Time Emergency News Bar
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Live updates from verified sources
                    </p>
                  </div>
                </div>

                {/* Sample News Bar */}
                <motion.div className="relative mb-6 cursor-pointer overflow-hidden rounded-lg bg-black p-4 text-white">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-red-400">
                      <motion.div
                        className="h-2 w-2 rounded-full bg-red-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [1, 0.5, 1],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                      BREAKING
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="animate-marquee whitespace-nowrap text-sm">
                        <span className="mx-8">
                          🚨 EARTHQUAKE 6.2 magnitude detected 45 miles offshore
                          - Tsunami warning issued for coastal areas
                        </span>
                        <span className="mx-8">
                          ⚠️ POWER OUTAGE affecting 50,000 customers in downtown
                          area - Estimated restoration 4-6 hours
                        </span>
                        <span className="mx-8">
                          🔥 WILDFIRE containment increased to 65% - Evacuation
                          orders lifted for zones A and B
                        </span>
                        <span className="mx-8">
                          🌪️ TORNADO WARNING expired for Jefferson County - All
                          clear issued by National Weather Service
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* News Categories */}
                <div className="mb-6 grid grid-cols-2 gap-4">
                  <div className="cursor-pointer rounded-lg border border-red-500/20 bg-red-500/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div>
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      </div>
                      <span className="text-sm font-medium text-red-400">
                        Critical Alerts
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Life-threatening emergencies requiring immediate action
                    </p>
                  </div>

                  <div className="cursor-pointer rounded-lg border border-orange-500/20 bg-orange-500/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div>
                        <Zap className="h-4 w-4 text-orange-400" />
                      </div>
                      <span className="text-sm font-medium text-orange-400">
                        Infrastructure
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Power, water, transportation, and communication updates
                    </p>
                  </div>

                  <div className="cursor-pointer rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div>
                        <Users className="h-4 w-4 text-blue-400" />
                      </div>
                      <span className="text-sm font-medium text-blue-400">
                        Community
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Shelter locations, volunteer opportunities, aid
                      distribution
                    </p>
                  </div>

                  <div className="cursor-pointer rounded-lg border border-green-500/20 bg-green-500/10 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div>
                        <CheckCircle className="h-4 w-4 text-green-400" />
                      </div>
                      <span className="text-sm font-medium text-green-400">
                        Recovery
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      All-clear notifications and recovery progress updates
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100/70 to-slate-200/70 p-4 dark:border-slate-600 dark:from-slate-900/70 dark:to-slate-800/70">
                  <div className="flex items-center gap-2">
                    <div>
                      <Satellite className="h-4 w-4 text-cyan-500" />
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Advanced Capabilities
                    </span>
                  </div>

                  <ul className="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                    <li>• Multi-source verification and fact-checking</li>
                    <li>• Customizable alert priorities and filters</li>
                    <li>• Integration with local emergency services</li>
                    <li>• Historical emergency data and patterns</li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20 dark:bg-slate-950">
        <div className="mx-auto max-w-[90rem] px-4 sm:px-6 lg:px-0">
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl"
            >
              Simple Plans for Every Level of Readiness.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto max-w-5xl text-xl text-slate-600 dark:text-slate-300"
            >
              Whether you’re monitoring your neighborhood or planning off-grid,
              Galileyo keeps you connected.
            </motion.p>
          </div>

          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {pricingPlans.map((plan: PricingPlan, index: number) => (
              <div
                key={index}
                className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 hover:scale-105 hover:transform ${
                  plan.highlight
                    ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-blue-500/10 shadow-xl shadow-cyan-500/10"
                    : "border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                }`}
              >
                {plan.popular && (
                  <div
                    // initial={{ opacity: 0, y: -10 }}
                    // animate={{ opacity: 1, y: 0 }}
                    // transition={{ duration: 0.6, delay: 0.5 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 transform"
                  >
                    <div className="flex items-center gap-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-1 text-sm font-medium text-white">
                      <Star className="h-4 w-4 fill-current" />
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="mb-8 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mb-4 text-slate-600 dark:text-slate-300">
                    {plan.description}
                  </p>
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-4xl font-bold ${plan.highlight ? "text-cyan-500 dark:text-cyan-400" : "text-slate-900 dark:text-white"}`}
                    >
                      ${plan.price}
                    </span>
                    {plan.period && (
                      <span className="ml-1 text-slate-500 dark:text-slate-400">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mb-12 text-center text-slate-600 opacity-70 dark:text-slate-300">
                  {plan.subtext}
                </p>

                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${plan.highlight ? "text-cyan-500 dark:text-cyan-400" : "text-greeen-400"}`}
                      />
                      <span className="text-slate-600 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-auto">
                  <PricingPlanButton plan={plan} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-20 lg:py-20">
        <div className="mx-auto max-w-5xl rounded-2xl border p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Still on the fence?
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Get updates and tips in your inbox. Not for emergency alerts.
          </p>
          <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
            <button className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-400">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
