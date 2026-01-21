"use server";

import { format, subDays } from "date-fns";

import { and, asc, desc, eq, gt, gte, like, sql } from "@galileyo/db";
import { db } from "@galileyo/db/client";
import {
  emergencyAlerts,
  influencerPage,
  service,
  smsPool,
  subscription,
} from "@galileyo/db/schema";

import type { Alert, AlertSeverity, AlertType } from "../types/alert";
import type { PricingPlan } from "./types";

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
  103: {
    name: "BRONZE+",
    description: "Stay Informed",
    subtext: "Gain access to share your thoughts and comments on posts.",
    features: [
      "Everything in Bronze, plus:",
      "Ability to create posts and comments",
    ],
    cta: "Upgrade to Bronze+",
    popular: false,
    highlight: false,
  },
  101: {
    name: "SILVER",
    description: "Stay Connected",
    subtext: "Unlock full map access and deeper insights.",
    features: [
      "Everything in Bronze+, plus:",
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
    orderBy: [asc(service.price)],
  });

  return plans.map((plan) => ({
    id: plan.id.toString(),
    name: additionalPlanData[plan.id]?.name ?? plan.name ?? "",
    price: plan.price?.toString() ?? "",
    priceNumber: plan.price ?? 0,
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

  const emergencyAlertList: Alert[] = alerts.map((alert) => ({
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

  // Fetch influencer alerts
  try {
    const fifteenDaysAgo = format(
      subDays(new Date(), 45),
      "yyyy-MM-dd HH:mm:ss",
    );
    const ID_ORIGINAL_CONTENT = 11;
    const PURPOSE_INFLUENCER = 8;

    const influencerPosts = await db
      .select({
        id: smsPool.id,
        body: smsPool.body,
        createdAt: smsPool.createdAt,
        updatedAt: smsPool.updatedAt,
        metaData: smsPool.metaData,
        subscriptionId: subscription.id,
        subscriptionTitle: subscription.title,
        influencerPageId: influencerPage.id,
        influencerPageTitle: influencerPage.title,
        influencerPageAlias: influencerPage.alias,
        influencerPageDescription: influencerPage.description,
        influencerPageImage: influencerPage.image,
      })
      .from(smsPool)
      .leftJoin(subscription, eq(smsPool.idSubscription, subscription.id))
      .leftJoin(
        influencerPage,
        eq(subscription.id, influencerPage.idSubscription),
      )
      .where(
        and(
          eq(subscription.idSubscriptionCategory, ID_ORIGINAL_CONTENT),
          eq(subscription.isActive, 1),
          eq(smsPool.purpose, PURPOSE_INFLUENCER),
          sql`sms_pool.meta_data->>"$.location.latitude" IS NOT NULL`,
          sql`sms_pool.meta_data->>"$.location.longitude" IS NOT NULL`,
          gte(smsPool.createdAt, fifteenDaysAgo),
        ),
      )
      .orderBy(desc(smsPool.createdAt));

    // Group posts by influencer and limit to 5 per influencer
    const influencerPostsMap = new Map<number, typeof influencerPosts>();
    for (const post of influencerPosts) {
      const influencerId = post.influencerPageId ?? post.subscriptionId;
      if (!influencerId) {
        continue;
      }
      if (!influencerPostsMap.has(influencerId)) {
        influencerPostsMap.set(influencerId, []);
      }
      const posts = influencerPostsMap.get(influencerId);
      if (posts && posts.length < 5) {
        posts.push(post);
      }
    }

    // Flatten the grouped posts and add to list
    const influencerAlertList: Alert[] = [];
    for (const posts of influencerPostsMap.values()) {
      for (const sms of posts) {
        const metaData = sms.metaData as {
          location?: { latitude?: number; longitude?: number };
        } | null;
        const latitude = metaData?.location?.latitude;
        const longitude = metaData?.location?.longitude;

        if (latitude == null || longitude == null) {
          continue;
        }

        influencerAlertList.push({
          id: sms.id.toString(),
          title: sms.subscriptionTitle
            ? `${sms.subscriptionTitle} posts`
            : "Unknown",
          description: sms.body,
          type: "UNKNOWN" as AlertType,
          severity: "low" as AlertSeverity,
          location: {
            latitude: Number(latitude),
            longitude: Number(longitude),
          },
          affectedArea: {
            radius: 0,
          },
          timestamp: format(sms.createdAt, "MM/dd/yyyy hh:mm a"),
          source: "Influencer",
          isActive: true,
          is_influencer: true,
          influencer_page: sms.influencerPageId
            ? {
                id: sms.influencerPageId,
                title: sms.influencerPageTitle ?? "",
                alias: sms.influencerPageAlias ?? undefined,
                description: sms.influencerPageDescription ?? undefined,
                image: sms.influencerPageImage ?? undefined,
              }
            : undefined,
        });
      }
    }

    return [...emergencyAlertList, ...influencerAlertList];
  } catch (error) {
    console.error("Error fetching influencer alerts:", error);
    return emergencyAlertList;
  }
}
