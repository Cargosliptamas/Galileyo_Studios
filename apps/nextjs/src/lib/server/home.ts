"use server";

import { format } from "date-fns";

import { and, eq, gt, like, sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import { emergencyAlerts, service } from "@galileyo/db/schema";

import type { Alert, AlertSeverity, AlertType } from "../types/alert";

interface PricingPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  subtext: string;
  features: string[];
  cta: string;
  popular: boolean;
  highlight: boolean;
}

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
    name: "BRONZE",
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
    name: "SILVER",
    description: "Stay Connected",
    subtext: "Unlock full map access and deeper insights.",
    features: [
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
      "Expanded map with global and satellite layers",
      "Advanced dashboards (weather, infrastructure, finance)",
      "Beta features and premium support",
      "Offline & device-linked alerts (via satellite partners)",
    ],
    cta: "Upgrade to Gold",
    popular: false,
    highlight: false,
  },
};

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const plans = await db.query.service.findMany({
    where: and(
      eq(service.type, 1),
      eq(service.isActive, 1),
      eq(service.isNewPlan, 1),
      // or(
      //   eq(service.id, 100),
      //   eq(service.id, 101),
      //   eq(service.id, 102),
      // ),
    ),
  });

  return plans.map((plan) => ({
    id: plan.id.toString(),
    name: additionalPlanData[plan.id]?.name ?? plan.name ?? "",
    price: plan.price?.toString() ?? "",
    period: "/month",
    description: additionalPlanData[plan.id]?.description ?? "",
    subtext: additionalPlanData[plan.id]?.subtext ?? plan.description ?? "",
    features: additionalPlanData[plan.id]?.features ?? [],
    cta: additionalPlanData[plan.id]?.cta ?? "",
    popular: additionalPlanData[plan.id]?.popular ?? false,
    highlight: additionalPlanData[plan.id]?.highlight ?? false,
  }));
}

function mapSeverity(severity_ID: string): AlertSeverity {
  switch (severity_ID) {
    case "ADVISORY":
      return "medium";
    case "WATCH":
      return "high";
    case "WARNING":
      return "critical";
    case "TERMINATION":
    case "INFORMATION":
    default:
      return "low";
  }
}

export async function getEmergencyAlerts(): Promise<Alert[]> {
  const alerts = await db.query.emergencyAlerts.findMany({
    where: and(
      eq(emergencyAlerts.active, 1),
      eq(emergencyAlerts.autoexpire, 1),
      gt(emergencyAlerts.endDate, sql`NOW()`),
      like(emergencyAlerts.hazardName, "%United States%"),
    ),
  });

  return alerts.map((alert) => ({
    id: alert.id.toString(),
    title: alert.hazardName,
    description: alert.hazardName,
    type: alert.typeId as AlertType,
    severity: mapSeverity(alert.severityId),
    location: {
      latitude: Number(alert.latitude),
      longitude: Number(alert.longitude),
    },
    affectedArea: {
      radius: 0,
    },
    timestamp: format(
      alert.externalCreationDate ?? alert.createdAt,
      "MM/dd/yyyy hh:mm a",
    ),
    source: "Emergency Alerts",
    isActive: alert.active === 1,
  }));
}
