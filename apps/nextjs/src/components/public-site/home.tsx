import {
  Bell,
  Check,
  Globe,
  Lock,
  Radio,
  Satellite,
  Shield,
  Signal,
  Star,
  Wifi,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Always Online, 24/7",
    description:
      "Continuous connectivity when you need it most, powered by our global satellite network.",
  },
  {
    icon: <Globe className="h-8 w-8" />,
    title: "200+ Countries Coverage",
    description:
      "Worldwide reach ensuring you stay connected no matter where you are on the planet.",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "99.9% Uptime & Military-Grade Security",
    description:
      "Redundant satellite network with enterprise-level encryption for maximum reliability.",
  },
  {
    icon: <Bell className="h-8 w-8" />,
    title: "Real-Time Emergency Alerts",
    description:
      "Instant notifications for critical situations when traditional channels fail.",
  },
  {
    icon: <Lock className="h-8 w-8" />,
    title: "Secure Private Communications",
    description:
      "Uncensored messaging and private group sharing with end-to-end encryption.",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "Free",
    period: "",
    description: "Perfect for getting started with satellite communications",
    features: [
      "Private feeds",
      "Web & mobile app access",
      "Active support",
      "Basic emergency alerts",
    ],
    cta: "Get Started",
    popular: false,
    highlight: false,
  },
  {
    name: "Free Bivy",
    price: "$59.99",
    period: "/month",
    description: "Complete satellite communication solution",
    features: [
      "All Starter features",
      "Satellite feeds via Bivy",
      "Global coverage",
      "Priority emergency alerts",
      "Advanced group sharing",
      "24/7 premium support",
    ],
    cta: "Choose Bivy",
    popular: true,
    highlight: true,
  },
  {
    name: "Starlink Mini Bundle",
    price: "$240",
    period: "/month",
    description: "Complete hardware and service package",
    features: [
      "All Free Bivy features",
      "Starlink Mini hardware included",
      "Protective carrying case",
      "Portable power bank",
      "Solar panel charger",
      "Professional power cord",
      "Hardware support & warranty",
    ],
    cta: "Get Complete Bundle",
    popular: false,
    highlight: false,
  },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <div
            className="absolute inset-0 block opacity-50 dark:hidden"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
          <div
            className="absolute inset-0 hidden opacity-50 dark:block"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23cbd5e1' fill-opacity='0.3'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          ></div>
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 lg:py-32">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="mb-8 inline-flex items-center rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-600 dark:text-cyan-400">
                <Satellite className="mr-2 h-4 w-4" />
                Worldwide SATCOM Network
              </div>

              {/* Main Headline */}
              <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 dark:text-white lg:text-6xl">
                Stay Connected —{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">
                  Even When Everything Else Fails
                </span>
              </h1>

              {/* Supporting Tagline */}
              <p className="mb-8 text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Access vital information through our worldwide SATCOM network
                when traditional communication channels are down.
              </p>

              {/* CTA Buttons */}
              <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                <button className="transform rounded-lg bg-cyan-500 px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-105 hover:bg-cyan-400">
                  Select Plan
                </button>
                <button className="rounded-lg border-2 border-slate-300 px-8 py-4 text-lg font-semibold text-slate-900 transition-all duration-200 hover:border-slate-400 hover:bg-slate-100 dark:border-slate-600 dark:text-white dark:hover:border-slate-500 dark:hover:bg-slate-800">
                  Sign In
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-400" />
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <span>200+ Countries</span>
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-400" />
                  <span>Military-Grade Encryption</span>
                </div>
              </div>
            </div>

            {/* Right Column - Satellite Illustration */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-lg">
                {/* Central Satellite */}
                <div className="relative z-10 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-8 shadow-2xl dark:border-slate-700 dark:from-slate-800 dark:to-slate-900">
                  <div className="mb-6 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500">
                      <Satellite className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                      Galileyo Network
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Global Satellite Coverage
                    </p>
                  </div>

                  {/* Status Indicators */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg bg-slate-100/50 p-3 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Network Status
                        </span>
                      </div>
                      <span className="text-sm font-medium text-green-400">
                        Online
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-100/50 p-3 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Signal className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Signal Strength
                        </span>
                      </div>
                      <span className="text-sm font-medium text-cyan-500 dark:text-cyan-400">
                        Excellent
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-slate-100/50 p-3 dark:bg-slate-800/50">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-purple-400" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          Encryption
                        </span>
                      </div>
                      <span className="text-sm font-medium text-purple-400">
                        Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating Satellites */}
                <div className="absolute -left-8 -top-8 flex h-12 w-12 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg">
                  <Radio className="h-6 w-6 text-white" />
                </div>

                <div className="absolute -right-12 -top-4 flex h-10 w-10 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg">
                  <Wifi className="h-5 w-5 text-white" />
                </div>

                <div
                  className="absolute -bottom-6 -left-12 flex h-14 w-14 animate-bounce items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
                  style={{ animationDelay: "0.5s" }}
                >
                  <Globe className="h-7 w-7 text-white" />
                </div>

                {/* Connection Lines */}
                <div className="pointer-events-none absolute inset-0">
                  {/* Animated connection lines */}
                  <div className="absolute left-1/2 top-1/2 h-px w-32 -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                  <div className="absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 -translate-y-1/2 -rotate-45 transform bg-gradient-to-r from-purple-400/50 to-transparent"></div>
                  <div className="absolute left-1/2 top-1/2 h-px w-36 -translate-x-1/2 -translate-y-1/2 rotate-12 transform bg-gradient-to-r from-green-400/50 to-transparent"></div>
                </div>

                {/* Orbital Rings */}
                <div className="pointer-events-none absolute inset-0">
                  <div
                    className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 transform animate-spin rounded-full border border-cyan-400/20"
                    style={{ animationDuration: "20s" }}
                  ></div>
                  <div
                    className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 transform animate-spin rounded-full border border-blue-400/10"
                    style={{
                      animationDuration: "15s",
                      animationDirection: "reverse",
                    }}
                  ></div>
                </div>

                {/* Background Glow */}
                <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl dark:from-cyan-500/10 dark:to-blue-500/10"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="bg-slate-50/50 py-20 dark:bg-slate-900/50 lg:py-32"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl">
              Built for When It Matters Most
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300">
              Our satellite communication platform delivers uncompromising
              reliability and security for critical communications.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group rounded-xl border border-slate-200 bg-white/50 p-8 transition-all duration-300 hover:scale-105 hover:transform hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <div className="mb-4 text-cyan-500 transition-colors group-hover:text-cyan-600 dark:text-cyan-400 dark:group-hover:text-cyan-300">
                  {feature.icon}
                </div>
                <h3 className="mb-3 text-xl font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl">
              Choose Your Connection Level
            </h2>
            <p className="mx-auto max-w-3xl text-xl text-slate-600 dark:text-slate-300">
              From basic satellite access to complete hardware solutions, we
              have the right plan for your needs.
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative rounded-2xl border p-8 transition-all duration-300 hover:scale-105 hover:transform ${
                  plan.highlight
                    ? "border-cyan-500/50 bg-gradient-to-b from-cyan-500/10 to-blue-500/10 shadow-xl shadow-cyan-500/10"
                    : "border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
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
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="ml-1 text-slate-500 dark:text-slate-400">
                        {plan.period}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="mb-8 space-y-4">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check
                        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${plan.highlight ? "text-cyan-500 dark:text-cyan-400" : "text-green-400"}`}
                      />
                      <span className="text-slate-600 dark:text-slate-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full rounded-lg px-6 py-3 font-semibold transition-all duration-200 ${
                    plan.highlight
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400"
                      : "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
