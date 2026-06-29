import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Check,
  CheckCircle,
  ChevronRight,
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
import { CloudflareMobileVideo } from "./cloudflare-mobile-video";
import { HomeBackground } from "./home-backround";
import {
  Alerts,
  CTAButtons,
  HomeAlertMap,
  PricingPlanButton,
  Questions,
} from "./home-client";

const questions = ["Real Alerts.", "Real People."];

const features = [
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Verified alerts, shared in real time",
    image: "/why1c.jpg",
    description:
      "Receive real-time alerts about emergencies, outages, and critical events — so you can act fast.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Map view that evolves with events",
    image: "/why2c.jpg",
    description:
      "Connect with neighbors, influencers, and trusted sources to share vital information during crises.",
  },
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Transparent feed - no ad algorithms",
    image: "/why3c.jpg",
    description:
      "Use our satellite app to stay safe in remote areas — and if you don't have a satellite device, we'll give you one for free!",
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Works in low-connectivity areas",
    image: "/why4c.jpg",
    description:
      "Share updates, messages, and location info seamlessly, keeping everyone safe and informed.",
  },
  {
    icon: <Wallet className="h-6 w-6" />,
    title: "Community tools coming soon",
    image: "/why5c.jpg",
    description:
      "Get discounts and coins just for staying engaged and helping others.",
  },
];

const stats = [
  { value: "50K+", label: "Active Users" },
  { value: "99.9%", label: "Uptime" },
  { value: "180+", label: "Countries" },
  { value: "Real-time", label: "Updates" },
];

const severityOrder = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  information: 4,
} as const;

const alertEmoji: Record<string, string> = {
  EARTHQUAKE: "🚨",
  WILDFIRE: "🔥",
  FLOOD: "🌊",
  TORNADO: "🌪️",
  STORM: "⛈️",
  TSUNAMI: "🌊",
  VOLCANO: "🌋",
  AVALANCHE: "❄️",
  LANDSLIDE: "⛰️",
  ACCIDENT: "🚗",
  ACTIVESHOOTER: "🚨",
  TERRORISM: "🚨",
  CIVILUNREST: "⚠️",
  CYBER: "💻",
  BIOMEDICAL: "🏥",
  SEVEREWEATHER: "⛈️",
  WINTERSTORM: "❄️",
  HIGHWIND: "💨",
  HIGHSURF: "🌊",
  EXTREMETEMPERATURE: "🌡️",
  DROUGHT: "☀️",
  default: "⚠️",
};

export async function HomePageV2() {
  const session = await getSession();
  const pricingPlans = await getPricingPlans();
  const alerts = await getEmergencyAlerts();

  // Sort alerts by severity, limit each type to max 2 occurrences, and take top 5
  const tickerAlerts = [...alerts]
    .sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
    .reduce<{ alerts: typeof alerts; typeCounts: Record<string, number> }>(
      (acc, alert) => {
        const count = acc.typeCounts[alert.type] ?? 0;
        if (count < 1) {
          acc.alerts.push(alert);
          acc.typeCounts[alert.type] = count + 1;
        }
        return acc;
      },
      { alerts: [], typeCounts: {} },
    )
    .alerts.slice(0, 5);

  return (
    <>
      {/* Holiday Promo Banner */}
      {!session && <PromoBanner endDate="2025-12-31T23:59:00-07:00" />}

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <HomeBackground />

        {/* Gradient Overlays */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80 dark:to-slate-950/80" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-transparent" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid min-h-[85vh] grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:order-1"
            >
              {/* Trust Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-4 py-2 text-sm font-medium text-cyan-600 backdrop-blur-sm dark:text-cyan-400"
              >
                <Shield className="h-4 w-4" />
                <span>Trusted by Thousands Worldwide Since 2020</span>
                <ChevronRight className="h-4 w-4" />
              </motion.div>

              {/* Main Headline */}
              <h1 className="mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white lg:text-6xl xl:text-7xl">
                <Questions items={questions} cycleMs={5000} />
                <span className="relative mt-2 block">
                  <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                    No Ad Algorithms.
                  </span>
                  <motion.span
                    className="absolute -bottom-2 left-0 h-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                    initial={{ width: 0 }}
                    animate={{ width: "40%" }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  />
                </span>
              </h1>

              {/* Subheadline */}
              <p className="mb-10 text-xl leading-relaxed text-slate-600 dark:text-slate-300 lg:text-2xl">
                Galileyo keeps you connected when networks fail —{" "}
                <span className="font-medium text-slate-900 dark:text-white">
                  real alerts, real people, real time.
                </span>
              </p>

              {/* CTA Section */}
              <CTAButtons />

              {/* Social Proof */}
              <div className="mt-12 flex flex-wrap items-center gap-6">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-medium text-slate-600 dark:border-slate-800 dark:from-slate-700 dark:to-slate-800 dark:text-slate-300"
                    >
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  <span className="font-semibold text-slate-900 dark:text-white">
                    50,000+
                  </span>{" "}
                  people staying safe
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    <span className="ml-1 text-slate-500">4.9/5</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Phone Mockup with Floating Cards */}
            <div className="relative flex justify-center lg:order-2">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {/* Glow Effect */}
                <div className="absolute inset-0 -z-10 scale-110 rounded-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 blur-3xl" />

                <PhoneMockup>
                  <CloudflareMobileVideo />
                </PhoneMockup>

                {/* Floating Card - Emergency Alerts */}
                <motion.div
                  initial={{ opacity: 0, x: -40, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.0 }}
                  className="absolute -left-24 top-12 z-10 md:-left-32"
                >
                  <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-4 shadow-2xl shadow-cyan-500/10 backdrop-blur-xl transition-all duration-300 hover:shadow-cyan-500/20 dark:border-slate-700/50 dark:bg-slate-800/90">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/30">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Emergency Alerts
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          24/7 Real-time
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{
                          duration: 2,
                          delay: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    </div>
                  </div>
                </motion.div>

                {/* Floating Card - Influencer Info */}
                <motion.div
                  initial={{ opacity: 0, x: 40, y: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.3 }}
                  className="absolute -right-20 top-56 z-10 md:-right-32"
                >
                  <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-4 shadow-2xl shadow-green-500/10 backdrop-blur-xl transition-all duration-300 hover:shadow-green-500/20 dark:border-slate-700/50 dark:bg-slate-800/90">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Verified Sources
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Trusted Info
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Floating Card - Rewards */}
                <motion.div
                  initial={{ opacity: 0, x: -40, y: -20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                  className="absolute -left-20 bottom-24 z-10 md:-left-28"
                >
                  <div className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/90 p-4 shadow-2xl shadow-purple-500/10 backdrop-blur-xl transition-all duration-300 hover:shadow-purple-500/20 dark:border-slate-700/50 dark:bg-slate-800/90">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg shadow-purple-500/30">
                        <Star className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          Earn Rewards
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Share Truth
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>

          {/* Breaking News Ticker */}
          {tickerAlerts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mx-auto mt-8 max-w-4xl"
            >
              <div className="overflow-hidden rounded-2xl border border-slate-200/50 bg-slate-900 p-4 shadow-xl dark:border-slate-700/50">
                <div className="flex items-center gap-4">
                  <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-red-400">
                    <motion.div
                      className="h-2.5 w-2.5 rounded-full bg-red-500"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [1, 0.6, 1],
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    LIVE
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="animate-marquee whitespace-nowrap text-sm text-white">
                      {/* Duplicate content for seamless infinite loop */}
                      {[...tickerAlerts, ...tickerAlerts].map(
                        (alert, index) => (
                          <span key={`${alert.id}-${index}`} className="mx-6">
                            {alertEmoji[alert.type] ?? alertEmoji.default}{" "}
                            {alert.title.toUpperCase()}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 -mt-16 px-4">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="grid grid-cols-2 gap-4 rounded-3xl border border-slate-200/50 bg-white/80 p-6 shadow-xl backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80 md:grid-cols-4 md:gap-8 md:p-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Live Map Section */}
      <section
        id="features"
        className="bg-gradient-to-b from-white to-slate-50 py-24 dark:from-slate-950 dark:to-slate-900"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* INSource Map Header */}
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              INSource Map
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Influential News Source
            </p>
          </div>
          <div className="mb-12 overflow-hidden rounded-3xl border border-slate-200/50 bg-white shadow-xl dark:border-slate-700/50 dark:bg-slate-900">
            <div className="h-[500px] w-full">
              <HomeAlertMap alerts={alerts} />
            </div>
          </div>

          {/* Features Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400"
            >
              <Globe className="h-4 w-4" />
              Why Galileyo?
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl"
            >
              Stay Informed. Stay Connected.{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Stay Human.
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-400"
            >
              Galileyo unites people who look out for each other. From local
              weather shifts to major outages, get timely alerts and real
              updates from others nearby. No hidden filters, no noise.
            </motion.p>
          </div>

          {/* Feature Cards - Horizontal Scroll */}
          <div className="relative">
            <div className="scrollbar-hide flex gap-6 overflow-x-auto pb-8 pt-4 md:grid md:grid-cols-5 md:overflow-visible">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group relative min-w-[200px] flex-shrink-0 overflow-hidden rounded-2xl md:min-w-0"
                >
                  {/* Card Background Image */}
                  <div
                    className="relative h-[320px] w-full"
                    style={{
                      backgroundImage: `url(${feature.image})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  >
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-all duration-300 group-hover:from-black/95" />

                    {/* Content */}
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-sm transition-all duration-300 group-hover:bg-cyan-500/20">
                        {feature.icon}
                      </div>
                      <h3 className="text-lg font-semibold leading-tight text-white">
                        {feature.title}
                      </h3>
                    </div>

                    {/* Hover Reveal Description */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-cyan-600/95 to-blue-600/95 p-5 opacity-0 transition-all duration-300 group-hover:opacity-100">
                      <p className="text-center text-sm leading-relaxed text-white">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Features Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 text-sm font-medium text-orange-500"
            >
              <Zap className="h-4 w-4" />
              Coming Soon
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl"
            >
              Emergency Support When{" "}
              <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Every Second Counts
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-400"
            >
              AI and satellite tech deliver fast, life-saving assistance when
              you need it most.
            </motion.p>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* Location-Based Alerts Card */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 shadow-lg shadow-red-500/25">
                  <MapPin className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Location-Based Alerts
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Hyper-local emergency notifications
                  </p>
                </div>
              </div>

              <Alerts />

              {/* Smart Features */}
              <div className="mt-8 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-5 dark:from-slate-800 dark:to-slate-900">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                  <Globe className="h-4 w-4 text-cyan-500" />
                  Smart Features
                </div>
                <ul className="grid grid-cols-1 gap-2 text-sm text-slate-600 dark:text-slate-400 sm:grid-cols-2">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    AI-powered threat assessment
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Satellite imagery integration
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Multi-language broadcasts
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Offline protocol downloads
                  </li>
                </ul>
              </div>
            </motion.div>

            {/* Real-Time News Card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-slate-700 dark:bg-slate-800/50"
            >
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25">
                  <TrendingUp className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Real-Time News Bar
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400">
                    Live updates from verified sources
                  </p>
                </div>
              </div>

              {/* News Bar Preview */}
              <div className="mb-6 overflow-hidden rounded-xl bg-slate-900 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex shrink-0 items-center gap-2 text-sm font-bold text-red-400">
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
                    <div className="animate-marquee whitespace-nowrap text-sm text-white">
                      {/* Duplicate content for seamless infinite loop */}
                      <span className="mx-6">
                        🚨 EARTHQUAKE 6.2 magnitude detected offshore
                      </span>
                      <span className="mx-6">
                        ⚠️ POWER OUTAGE affecting 50,000 customers
                      </span>
                      <span className="mx-6">🔥 WILDFIRE 65% contained</span>
                      <span className="mx-6">
                        🚨 EARTHQUAKE 6.2 magnitude detected offshore
                      </span>
                      <span className="mx-6">
                        ⚠️ POWER OUTAGE affecting 50,000 customers
                      </span>
                      <span className="mx-6">🔥 WILDFIRE 65% contained</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Cards */}
              <div className="mb-6 grid grid-cols-2 gap-3">
                {[
                  {
                    icon: AlertTriangle,
                    label: "Critical Alerts",
                    color: "red",
                    desc: "Life-threatening emergencies",
                  },
                  {
                    icon: Zap,
                    label: "Infrastructure",
                    color: "orange",
                    desc: "Power & communication",
                  },
                  {
                    icon: Users,
                    label: "Community",
                    color: "blue",
                    desc: "Shelter & volunteer info",
                  },
                  {
                    icon: CheckCircle,
                    label: "Recovery",
                    color: "green",
                    desc: "All-clear notifications",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border p-4 transition-all duration-200 hover:scale-105 border-${item.color}-500/20 bg-${item.color}-500/10`}
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <item.icon className={`h-4 w-4 text-${item.color}-400`} />
                      <span
                        className={`text-sm font-medium text-${item.color}-400`}
                      >
                        {item.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Advanced Capabilities */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-5 dark:from-slate-800 dark:to-slate-900">
                <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                  <Satellite className="h-4 w-4 text-cyan-500" />
                  Advanced Capabilities
                </div>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Multi-source verification
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Customizable alert priorities
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    Emergency services integration
                  </li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="bg-gradient-to-b from-slate-50 to-white py-24 dark:from-slate-900 dark:to-slate-950"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400"
            >
              <Star className="h-4 w-4" />
              Pricing Plans
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl"
            >
              Simple Plans for{" "}
              <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Every Level of Readiness
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-400"
            >
              Whether you're monitoring your neighborhood or planning off-grid,
              Galileyo keeps you connected.
            </motion.p>
          </div>

          {/* Pricing Cards */}
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan: PricingPlan, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 ${
                  plan.highlight
                    ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 via-blue-500/5 to-transparent shadow-2xl shadow-cyan-500/10"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                }`}
              >
                {/* Popular Badge */}
                {plan.popular && (
                  <div className="absolute -right-12 top-6 rotate-45 bg-gradient-to-r from-cyan-500 to-blue-500 px-12 py-1.5 text-xs font-bold text-white shadow-lg">
                    POPULAR
                  </div>
                )}

                <div className="mb-8 text-center">
                  <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <p className="mb-6 text-slate-600 dark:text-slate-400">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span
                      className={`text-5xl font-bold ${plan.highlight ? "text-cyan-500" : "text-slate-900 dark:text-white"}`}
                    >
                      ${plan.price}
                    </span>
                    {plan.period && (
                      <span className="ml-2 text-slate-500 dark:text-slate-400">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <p className="mb-8 text-center text-sm text-slate-500 dark:text-slate-400">
                  {plan.subtext}
                </p>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.highlight ? "bg-cyan-500/20 text-cyan-500" : "bg-green-500/20 text-green-500"}`}
                      >
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-slate-600 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <PricingPlanButton plan={plan} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-10 text-center shadow-xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-900"
          >
            {/* Decorative Elements */}
            <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl" />

            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Bell className="h-4 w-4 text-cyan-500" />
                Stay Updated
              </div>

              <h3 className="mb-4 text-3xl font-bold text-slate-900 dark:text-white">
                Still on the fence?
              </h3>
              <p className="mb-8 text-lg text-slate-600 dark:text-slate-400">
                Get updates and tips in your inbox. Not for emergency alerts.
              </p>

              <div className="mx-auto flex max-w-md flex-col gap-4 sm:flex-row">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-5 py-4 text-slate-900 placeholder-slate-400 transition-all duration-200 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                />
                <button className="group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-8 py-4 font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:shadow-xl hover:shadow-cyan-500/30">
                  Subscribe
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
