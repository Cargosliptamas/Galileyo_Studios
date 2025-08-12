import Image from "next/image";
import Link from "next/link";
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

import { PhoneMockup } from "../phone-mockup";
import { CyclingAnimatedList } from "../ui/animated-list";
import { HomeBackground } from "./home-backround";

// import { InstallPrompt } from "../layout/install-prompt";

const features = [
  {
    icon: <Globe className="h-8 w-8" />,
    title: "Be the First to Know",
    description:
      "Receive real-time alerts about emergencies, outages, and critical events — so you can act fast.",
  },
  {
    icon: <Lock className="h-8 w-8" />,
    title: "Stay Connected",
    description:
      "Share updates, messages, and location info seamlessly, keeping everyone safe and informed.",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Join a Caring Community",
    description:
      "Connect with neighbors, influencers, and trusted sources to share vital information during crises.",
  },
  {
    icon: <Bell className="h-8 w-8" />,
    title: "Connect Anywhere",
    description:
      "Use our satellite app to stay safe in remote areas — and if you don’t have a satellite device, we’ll give you one for free!",
  },
  {
    icon: <Wallet className="h-8 w-8" />,
    title: "Earn Rewards",
    description:
      "Get discounts and coins just for staying engaged and helping others.",
  },
];

const pricingPlans = [
  {
    name: "Galileyo Starter",
    price: "Free",
    period: "",
    description: "Support Free & Uncensored Speech",
    features: [
      "Private Access to Feeds",
      "Connect With Your Friends",
      "Follow Your Favorite Influencers",
      "Access To Web and IOS/Android Apps",
      "Active support",
    ],
    cta: "Get Started with Basic",
    popular: false,
    highlight: false,
  },
  {
    name: "Galileyo PREMIUM",
    price: "$9.99",
    period: "/month",
    description: "Ad-Free Experience",
    features: [
      "Revenue Shares with Content Creators",
      "Verified Status Badge + Exclusive Profile Icons",
      "Premium-only Communities",
      "Custom Username in URL",
      "See Who Viewed Your Profile",
      "Premium Customer Support",
    ],
    cta: "Choose Standard",
    popular: true,
    highlight: true,
  },
  {
    name: "Starlink Mini Bundle",
    price: "$240.00",
    period: "/month",
    description: "Starlink Mini",
    features: [
      "Worldwide Coverage",
      "Mini Transport Case",
      "Goal Zero Sherpa 100PD Power Bank",
      "Goal Zero Nomad 5 Solar Panel",
      "Starlink USB-C to DC Power Cord",
    ],
    cta: "Upgrade to Premium",
    popular: false,
    highlight: false,
  },
];

const satelliteFeatures = [
  {
    title: "Global Coverage",
    description: "200+ countries covered",
  },
  {
    title: "Compatible Devices",
    description: "Works with top satellite devices",
  },
  {
    title: "Secure Communications",
    description: "Military-grade security",
  },
  {
    title: "Reliable Connectivity",
    description:
      "Multiple sources for uptime, including APIs, AI, and human insights",
  },
];

const mockAlerts = [
  // Wildfire Alerts - Critical
  {
    id: 1,
    type: "Wildfire Alert",
    message: "Fast-moving wildfire detected 2.3 miles NW of your location",
    location: "2.3 miles NW",
    source: "Cal Fire",
    severity: "critical",
    timestamp: "2 minutes ago",
    icon: "🔥",
  },
  {
    id: 2,
    type: "Wildfire Alert",
    message: "Evacuation order issued for Hillside Drive area",
    location: "1.8 miles E",
    source: "Cal Fire",
    severity: "critical",
    timestamp: "5 minutes ago",
    icon: "🔥",
  },
  // Wildfire Alerts - High
  {
    id: 3,
    type: "Wildfire Alert",
    message: "Red flag warning: Extreme fire danger conditions",
    location: "County-wide",
    source: "Cal Fire",
    severity: "high",
    timestamp: "15 minutes ago",
    icon: "🔥",
  },
  {
    id: 4,
    type: "Wildfire Alert",
    message: "Fire approaching residential area - prepare to evacuate",
    location: "3.1 miles N",
    source: "Cal Fire",
    severity: "high",
    timestamp: "1 hour ago",
    icon: "🔥",
  },
  // Wildfire Alerts - Medium
  {
    id: 5,
    type: "Wildfire Alert",
    message: "Containment lines established, fire 40% contained",
    location: "5.2 miles N",
    source: "Cal Fire",
    severity: "medium",
    timestamp: "2 hours ago",
    icon: "🔥",
  },
  {
    id: 6,
    type: "Wildfire Alert",
    message: "Air quality alert: Smoke advisory in effect",
    location: "Regional",
    source: "Cal Fire",
    severity: "medium",
    timestamp: "3 hours ago",
    icon: "🔥",
  },
  // Severe Weather - Critical
  {
    id: 7,
    type: "Severe Weather",
    message: "Tornado warning: Take shelter immediately",
    location: "4.2 miles SW",
    source: "National Weather Service",
    severity: "critical",
    timestamp: "1 minute ago",
    icon: "🌪️",
  },
  {
    id: 8,
    type: "Severe Weather",
    message: "Flash flood warning: Avoid low-lying areas",
    location: "1.5 miles S",
    source: "National Weather Service",
    severity: "critical",
    timestamp: "8 minutes ago",
    icon: "🌊",
  },
  // Severe Weather - High
  {
    id: 9,
    type: "Severe Weather",
    message: "Severe thunderstorm with 70mph winds approaching",
    location: "6.7 miles W",
    source: "National Weather Service",
    severity: "high",
    timestamp: "12 minutes ago",
    icon: "⛈️",
  },
  {
    id: 10,
    type: "Severe Weather",
    message: "Hail warning: Golf ball sized hail reported",
    location: "2.9 miles NE",
    source: "National Weather Service",
    severity: "high",
    timestamp: "20 minutes ago",
    icon: "🧊",
  },
  {
    id: 11,
    type: "Severe Weather",
    message: "Winter storm warning: 12+ inches snow expected",
    location: "County-wide",
    source: "National Weather Service",
    severity: "high",
    timestamp: "45 minutes ago",
    icon: "❄️",
  },
  // Severe Weather - Medium
  {
    id: 12,
    type: "Severe Weather",
    message: "Heavy rainfall expected - minor flooding possible",
    location: "Regional",
    source: "National Weather Service",
    severity: "medium",
    timestamp: "1 hour ago",
    icon: "🌧️",
  },
  {
    id: 13,
    type: "Severe Weather",
    message: "Wind advisory: 25-35mph gusts expected",
    location: "County-wide",
    source: "National Weather Service",
    severity: "medium",
    timestamp: "2 hours ago",
    icon: "💨",
  },
  // Earthquake - Critical
  {
    id: 14,
    type: "Earthquake Alert",
    message: "Magnitude 6.2 earthquake detected - aftershocks possible",
    location: "15 miles SE",
    source: "USGS",
    severity: "critical",
    timestamp: "3 minutes ago",
    icon: "🌍",
  },
  {
    id: 15,
    type: "Earthquake Alert",
    message: "Tsunami warning issued for coastal areas",
    location: "Coastal regions",
    source: "USGS",
    severity: "critical",
    timestamp: "7 minutes ago",
    icon: "🌊",
  },
  // Earthquake - High
  {
    id: 16,
    type: "Earthquake Alert",
    message: "Magnitude 5.1 earthquake - structural damage possible",
    location: "8.3 miles N",
    source: "USGS",
    severity: "high",
    timestamp: "25 minutes ago",
    icon: "🌍",
  },
  {
    id: 17,
    type: "Earthquake Alert",
    message: "Aftershock sequence continues - stay alert",
    location: "12 miles SE",
    source: "USGS",
    severity: "high",
    timestamp: "1 hour ago",
    icon: "🌍",
  },
  // Earthquake - Medium
  {
    id: 18,
    type: "Earthquake Alert",
    message: "Magnitude 4.8 earthquake - check for damage",
    location: "20 miles N",
    source: "USGS",
    severity: "medium",
    timestamp: "2 hours ago",
    icon: "🌍",
  },
  {
    id: 19,
    type: "Earthquake Alert",
    message: "Seismic activity increased - monitoring ongoing",
    location: "Regional",
    source: "USGS",
    severity: "medium",
    timestamp: "3 hours ago",
    icon: "🌍",
  },
  // Infrastructure - Critical
  {
    id: 20,
    type: "Infrastructure Alert",
    message: "Gas leak detected - area evacuated",
    location: "0.5 miles S",
    source: "Gas Company",
    severity: "critical",
    timestamp: "18 minutes ago",
    icon: "⛽",
  },
  {
    id: 21,
    type: "Infrastructure Alert",
    message: "Nuclear power plant emergency shutdown",
    location: "25 miles NE",
    source: "Nuclear Regulatory Commission",
    severity: "critical",
    timestamp: "30 minutes ago",
    icon: "☢️",
  },
  // Infrastructure - High
  {
    id: 22,
    type: "Infrastructure Alert",
    message: "Power grid failure affecting 50,000 customers",
    location: "0.8 miles E",
    source: "PG&E",
    severity: "high",
    timestamp: "10 minutes ago",
    icon: "⚡",
  },
  {
    id: 23,
    type: "Infrastructure Alert",
    message: "Water main break - boil water advisory issued",
    location: "1.2 miles N",
    source: "Water Department",
    severity: "high",
    timestamp: "30 minutes ago",
    icon: "💧",
  },
  {
    id: 24,
    type: "Infrastructure Alert",
    message: "Major highway collapse - traffic diverted",
    location: "5.5 miles W",
    source: "DOT",
    severity: "high",
    timestamp: "45 minutes ago",
    icon: "🛣️",
  },
  // Infrastructure - Medium
  {
    id: 25,
    type: "Infrastructure Alert",
    message: "Bridge closure due to structural damage",
    location: "2.5 miles W",
    source: "DOT",
    severity: "medium",
    timestamp: "1 hour ago",
    icon: "🌉",
  },
  {
    id: 26,
    type: "Infrastructure Alert",
    message: "Cell tower down - satellite backup active",
    location: "3.7 miles NW",
    source: "Galileyo Network",
    severity: "medium",
    timestamp: "2 hours ago",
    icon: "📡",
  },
  {
    id: 27,
    type: "Infrastructure Alert",
    message: "Sewer system overflow - avoid contact with water",
    location: "1.8 miles S",
    source: "Public Works",
    severity: "medium",
    timestamp: "3 hours ago",
    icon: "🚰",
  },
];

export default function HomePage() {
  // const [currentAlertIndex, setCurrentAlertIndex] = useState(0);
  const currentAlertIndex = 0;

  // Get one alert from each category
  const wildfireAlerts = mockAlerts.filter(
    (alert) => alert.type === "Wildfire Alert",
  );
  const severeWeatherAlerts = mockAlerts.filter(
    (alert) => alert.type === "Severe Weather",
  );
  const earthquakeAlerts = mockAlerts.filter(
    (alert) => alert.type === "Earthquake Alert",
  );
  const infrastructureAlerts = mockAlerts.filter(
    (alert) => alert.type === "Infrastructure Alert",
  );

  // Ensure we have at least one alert from each category
  const getAlertFromCategory = (alerts: typeof mockAlerts, index: number) => {
    if (alerts.length === 0) return null;
    return alerts[index % alerts.length];
  };

  // Define category combinations with different severity focus each cycle
  const categoryCombinations = [
    // Combination 1: Critical severity focus
    [
      getAlertFromCategory(
        wildfireAlerts.filter((a) => a.severity === "critical"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        severeWeatherAlerts.filter((a) => a.severity === "critical"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        earthquakeAlerts.filter((a) => a.severity === "critical"),
        currentAlertIndex,
      ),
    ],
    // Combination 2: High severity focus
    [
      getAlertFromCategory(
        severeWeatherAlerts.filter((a) => a.severity === "high"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        infrastructureAlerts.filter((a) => a.severity === "high"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        wildfireAlerts.filter((a) => a.severity === "high"),
        currentAlertIndex,
      ),
    ],
    // Combination 3: Medium severity focus
    [
      getAlertFromCategory(
        earthquakeAlerts.filter((a) => a.severity === "medium"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        wildfireAlerts.filter((a) => a.severity === "medium"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        infrastructureAlerts.filter((a) => a.severity === "medium"),
        currentAlertIndex,
      ),
    ],
    // Combination 4: Mixed severity - Infrastructure focus
    [
      getAlertFromCategory(
        infrastructureAlerts.filter((a) => a.severity === "critical"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        infrastructureAlerts.filter((a) => a.severity === "high"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        infrastructureAlerts.filter((a) => a.severity === "medium"),
        currentAlertIndex,
      ),
    ],
    // Combination 5: Mixed severity - Weather focus
    [
      getAlertFromCategory(
        severeWeatherAlerts.filter((a) => a.severity === "critical"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        severeWeatherAlerts.filter((a) => a.severity === "high"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        severeWeatherAlerts.filter((a) => a.severity === "medium"),
        currentAlertIndex,
      ),
    ],
    // Combination 6: Mixed severity - Natural disasters
    [
      getAlertFromCategory(
        wildfireAlerts.filter((a) => a.severity === "critical"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        earthquakeAlerts.filter((a) => a.severity === "high"),
        currentAlertIndex,
      ),
      getAlertFromCategory(
        severeWeatherAlerts.filter((a) => a.severity === "medium"),
        currentAlertIndex,
      ),
    ],
  ];

  const currentCombinationIndex =
    Math.floor(currentAlertIndex / 3) % categoryCombinations.length;
  const categoryAlerts =
    (
      categoryCombinations[currentCombinationIndex] ?? categoryCombinations[0]
    )?.filter((alert): alert is NonNullable<typeof alert> => alert !== null) ??
    [];

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-500/10 border-red-500/20";
      case "high":
        return "bg-orange-500/10 border-orange-500/20";
      case "medium":
        return "bg-yellow-500/10 border-yellow-500/20";
      case "low":
        return "bg-blue-500/10 border-blue-500/20";
      default:
        return "bg-gray-500/10 border-gray-500/20";
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-red-400";
      case "high":
        return "text-orange-400";
      case "medium":
        return "text-yellow-400";
      case "low":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentAlertIndex((prev) => prev + 1);
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  // useEffect(() => {
  //   setColor(resolvedTheme === "dark" ? "#ffffff" : "#000000");
  // }, [resolvedTheme]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        {/* <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
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
        </div> */}
        <HomeBackground />

        {/* <InstallPrompt /> */}

        <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
            {/* Left Column - Text Content */}
            <div className="lg:order-1">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm font-medium backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/90">
                <Shield className="mr-2 h-4 w-4 text-green-400" />
                Trusted by 5000+ users worldwide
              </div>

              {/* Main Headline */}
              <h1 className="mb-6 text-4xl font-bold leading-tight text-slate-900 dark:text-white lg:text-6xl">
                Who Has Your Back? —{" "}
                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">
                  We Do.
                </span>
              </h1>

              {/* Supporting Tagline */}
              <p className="mb-8 text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Stay protected with the only social emergency app designed to
                keep you and your loved ones safe when disaster strikes.
              </p>

              {/* CTA Buttons */}
              <div className="mb-12 flex flex-col gap-4 sm:flex-row">
                  <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
              />
              <button className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-400">
                <Satellite className="h-4 w-4 text-white" />
                Get Started
              </button>
            </div>

              {/* Trust Indicators */}
              {/*<p className="mb-8 text-xl leading-relaxed text-slate-600 dark:text-slate-300">
                Get instant alerts for:
              </p>
              <div className="flex flex-wrap gap-6 text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <span>Breaking news</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <span>Influencer updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-400" />
                  <span>Local emergencies</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-400" />
                  <span>Power outages</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-400" />
                  <span>Cyber hack warnings</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-green-400" />
                  <span>Private messaging</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-400" />
                  <span>Family location tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-purple-400" />
                  <span>And much more...</span>
                </div>
              </div>*/}

              {/* Emergency Preview Section */}
              <div className="mt-16">
                <div className="mb-6">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border-2 border-[#4a85ed] px-4 py-2 text-white-700">
                    <Zap className="h-4 w-4" />
                    <span className="font-medium">Emergency Alerts</span>
                  </div>
                  <h3 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                    Get Lifesaving Alerts Instantly
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300">
                    Instant, location-aware alerts for disasters, cyber breaches and emergencies.
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

                {/* News Categories */}
                {/* <div className="mb-6 grid grid-cols-2 gap-4">
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
                </div> */}

                {/*<CyclingAnimatedList delay={4000}>
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
                </CyclingAnimatedList>*/}

                {/* <div className="flex flex-col gap-2 rounded-xl border border-slate-300 bg-gradient-to-r from-slate-100/70 to-slate-200/70 p-4 dark:border-slate-600 dark:from-slate-900/70 dark:to-slate-800/70">
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
                </div> */}
              </div>
            </div>

            {/* Right Column - Satellite Illustration */}
            <div className="relative flex justify-center self-baseline pt-0 md:pt-12 lg:order-2">
              {/* Mobile Taglines */}
              {/*<div className="">
                    <div className="">
                      <p className="">
                        Connect your smartphone to any satellite device — and if you don’t have one, we’ll give you one for free!
                      </p>
                      <p className="">
                        Always stay in the know.
                      </p>
                      <p className="">
                        Earn discounts and coins just by clicking and staying engaged.
                      </p>
                    </div>
                  
                  </div> */}

              {/* <div className="relative w-full max-w-lg">
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

                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute left-1/2 top-1/2 h-px w-32 -translate-x-1/2 -translate-y-1/2 rotate-45 transform bg-gradient-to-r from-cyan-400/50 to-transparent"></div>
                  <div className="absolute left-1/2 top-1/2 h-px w-28 -translate-x-1/2 -translate-y-1/2 -rotate-45 transform bg-gradient-to-r from-purple-400/50 to-transparent"></div>
                  <div className="absolute left-1/2 top-1/2 h-px w-36 -translate-x-1/2 -translate-y-1/2 rotate-12 transform bg-gradient-to-r from-green-400/50 to-transparent"></div>
                </div>

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

                <div className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 blur-3xl dark:from-cyan-500/10 dark:to-blue-500/10"></div>
              </div> */}
              {/* <div className="relative z-50 mx-auto h-[700px] w-[350px] min-w-[350px] rounded-[42px] border-[14px] border-black bg-gray-800 shadow-xl">
                <div className="absolute left-1/2 top-0 z-50 h-[18px] w-[148px] translate-x-[-50%] rounded-b-[1rem] bg-black"></div>
                <div className="absolute left-[-105px] top-[124px] z-50 h-[46px] w-[4px] rounded-l-lg bg-black"></div>
                <div className="absolute left-[-105px] top-[178px] z-50 h-[46px] w-[4px] rounded-l-lg bg-black"></div>
                <div className="absolute right-[-105px] top-[142px] z-50 h-[64px] w-[4px] rounded-r-lg bg-black"></div>
                <div className="relative h-full w-full overflow-hidden break-words rounded-[32px] bg-gray-800"></div>
              </div> */}

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <PhoneMockup>
                  <Image
                    className="device-screen"
                    src="/nexus_phone.jpg"
                    alt="App"
                    width={300}
                    height={600}
                  />
                </PhoneMockup>
                {/* Animated Text Boxes */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                  className="absolute -left-32 top-16 max-w-xs rounded-xl border border-slate-200 bg-white/95 p-4 shadow-xl backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/95"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-cyan-500"></div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      Speak Freely & Stay Informed
                    </span>
                  </div>
                  {/* Arrow pointing to phone */}
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
                      Support Free & Uncensored Speech
                    </span>
                  </div>
                  {/* Arrow pointing to phone */}
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
                      Follow Your Favourite Influencers
                    </span>
                  </div>
                  {/* Arrow pointing to phone */}
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
              Because your safety and connection matter most. In a world where
              disasters can strike without warning, staying informed is your
              lifeline. Galileyo unites communities, empowering you to protect
              what matters and stay connected when it counts.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
                className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition-all duration-200 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 text-cyan-500 transition-colors group-hover:text-cyan-600 dark:text-cyan-400 dark:group-hover:text-cyan-300"
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-l mb-3 font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="lg:py-0">
        <div className="mx-auto mt-16 max-w-3xl rounded-2xl border p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Your safety is a story worth sharing.
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Join Galileyo and be part of a movement where everyone looks out for
            each other.
          </p>
          <div className="max-w-mdi mx-auto flex flex-col gap-4 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
            />
            <button className="rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-400">
              Join Now — Protect Your Community
            </button>
          </div>
        </div>
      </section>

      {/* Next-Generation Emergency Features Section */}
      <section className="py-20 lg:py-32">
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
              Harnessing the power of AI and satellite technology to deliver
              swift, life-saving assistance — because every second counts in a
              crisis.
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

                <div className="space-y-4">
                  {categoryAlerts.map((alert, index) => (
                    <motion.div
                      key={`${alert.id}-${currentAlertIndex}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className={`flex items-start gap-3 rounded-lg p-4 ${getSeverityBgColor(alert.severity)}`}
                    >
                      <AlertTriangle
                        className={`mt-0.5 h-5 w-5 ${getSeverityTextColor(alert.severity)} ${alert.severity === "critical" ? "animate-pulse" : ""}`}
                      />
                      <div>
                        <p
                          className={`text-sm font-medium ${getSeverityTextColor(alert.severity)}`}
                        >
                          {alert.type.toUpperCase()} - {alert.location}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {alert.message}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {alert.timestamp} • {alert.source}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>

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

      {/* Satellite Power Section */}
      <section className="bg-slate-50/50 py-20 dark:bg-slate-900/50 lg:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl"
            >
              Connect to the Global Network of Information
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="mx-auto max-w-5xl text-xl text-slate-600 dark:text-slate-300"
            >
              Galileyo collaborates with leading satellite providers to ensure
              you stay connected—whether you're in the mountains, at sea, or
              anywhere in between. Our satellite-ready app guarantees vital
              communication reaches you, even in the most remote locations.
              Beyond technology, a global network of trusted influencers,
              experts, and community voices help shape the flow of information,
              providing you with reliable, accurate updates when it matters
              most.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {satelliteFeatures.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -2 }}
                className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-center transition-all duration-200 hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600 dark:hover:bg-slate-800"
              >
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  transition={{ duration: 0.2 }}
                  className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                >
                  <Satellite className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="mb-2 text-lg font-semibold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <section id="pricing" className="bg-white dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-16 text-center">
              <motion.h2
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
                className="mb-6 text-4xl font-bold text-slate-900 dark:text-white lg:text-5xl"
              >
                Honest Pricing, No Hidden Fees
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
                className="mx-auto max-w-5xl text-xl text-slate-600 dark:text-slate-300"
              >
                Discover our honest, transparent pricing—so you can choose with
                confidence and avoid any surprises.
              </motion.p>
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
                          className={`mt-0.5 h-5 w-5 flex-shrink-0 ${plan.highlight ? "text-cyan-500 dark:text-cyan-400" : "text-greeen-400"}`}
                        />
                        <span className="text-slate-600 dark:text-slate-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`w-full rounded-lg px-6 py-3 font-semibold transition-all duration-200 ${
                      plan.highlight
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400"
                        : "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <div className="mx-auto mt-16 max-w-5xl rounded-2xl border p-8 text-center">
          <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
            Still on the fence?
          </h3>
          <p className="mb-6 text-slate-600 dark:text-slate-300">
            Subscribe to our mailing list for the latest updates, helpful tips,
            and exclusive insights—delivered straight to your inbox.
            <br />
            (Please note, this is for regular updates only and does not include
            emergency notifications.)
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
