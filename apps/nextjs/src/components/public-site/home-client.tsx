"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AlertTriangle, Satellite } from "lucide-react";
import { motion } from "motion/react";

import { toast } from "@galileyo/ui/toast";

import type { Alert } from "~/lib/types/alert";
import { WordRotate } from "~/components/ui/word-rotate";

import "leaflet/dist/leaflet.css";

const AlertMap = dynamic(
  () => import("../map/alert-map").then((mod) => mod.AlertMap),
  { ssr: false },
);

export function HomeAlertMap({ alerts }: { alerts: Alert[] }) {
  return <AlertMap alerts={alerts} />;
}

export function Questions({
  items,
  cycleMs,
}: {
  items: string[];
  cycleMs: number;
}) {
  return <WordRotate words={items} duration={cycleMs} />;
}

export function CTAButtons() {
  const [signupEmail, setSignupEmail] = useState("");
  const router = useRouter();

  const handleSignupCTA = useCallback(() => {
    if (!signupEmail) {
      toast.error("Please enter your email");
      return;
    }

    router.push(`/sign-up?email=${signupEmail}`);
  }, [signupEmail, router]);

  return (
    <div className="mb-12 flex flex-col gap-4 sm:flex-row">
      <input
        type="email"
        placeholder="Enter your email"
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-400"
        value={signupEmail}
        onChange={(e) => setSignupEmail(e.target.value)}
      />
      <button
        className="flex items-center gap-2 rounded-lg bg-cyan-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-cyan-400"
        onClick={handleSignupCTA}
      >
        <Satellite className="h-4 w-4 text-white" />
        Get Free Alerts
      </button>
    </div>
  );
}

const currentAlertIndex = 0;
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

export function Alerts() {
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

  return (
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
  );
}

export function PricingPlanButton({
  planId,
  cta,
  highlight,
}: {
  planId: string;
  cta: string;
  highlight: boolean;
}) {
  const router = useRouter();

  const handleGetStartedCTA = useCallback(() => {
    router.push(`/sign-up?plan=${planId}`);
  }, [planId, router]);

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      className={`w-full rounded-lg px-6 py-3 font-semibold transition-all duration-200 ${
        highlight
          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:from-cyan-400 hover:to-blue-400"
          : "bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
      }`}
      onClick={handleGetStartedCTA}
    >
      {cta}
    </motion.button>
  );
}
