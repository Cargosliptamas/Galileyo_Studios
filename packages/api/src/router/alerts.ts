import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";

import type { Alert, AlertSeverity, AlertType } from "../types/alert";
import {
  protectedProcedure,
  // publicProcedure
} from "../trpc";

interface ApiAlert {
  autoexpire: string;
  category_ID: string;
  create_Date: string;
  end_Date: string;
  hazard_ID: string;
  hazard_Name: string;
  last_Update: string;
  latitude: number;
  longitude: number;
  severity_ID: string;
  snc_url: string;
  start_Date: string;
  status: string;
  type_ID: string;
  update_Date: string;
  areabrief_url: string | null;
  description: string;
  roles: unknown[];
}

async function getApiToken() {
  const response = await fetch("https://api.disasteraware.com/authorize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: process.env.DISASTERAWARE_USERNAME,
      password: process.env.DISASTERAWARE_PASSWORD,
    }),
  });

  if (!response.ok) {
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
  }

  const data = (await response.json()) as {
    accessToken: string;
    refreshToken: string;
  };

  return data;
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

let cachedToken: {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
} | null = null;

async function getCachedApiToken() {
  const now = Date.now();
  // Set token expiration to 55 minutes (tokens may expire after 1 hour)
  if (cachedToken && cachedToken.expiresAt > now) {
    return cachedToken;
  }

  const token = await getApiToken();

  cachedToken = {
    ...token,
    expiresAt: now + 5 * 60 * 1000,
  };

  return cachedToken;
}

export const alertsRouter = {
  list: protectedProcedure.query(async () => {
    const token = await getCachedApiToken();

    console.log("TOKEN", token);

    const response = await fetch(
      "https://api.disasteraware.com/hazards/active/category/EVENT",
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token.accessToken}`,
        },
      },
    );

    const data = (await response.json()) as ApiAlert[];

    if (!response.ok) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch alerts",
      });
    }

    return data.map((alert) => ({
      id: alert.hazard_ID,
      title: alert.hazard_Name,
      description: alert.description,
      type: alert.type_ID as AlertType,
      severity: mapSeverity(alert.severity_ID),
      location: {
        latitude: alert.latitude,
        longitude: alert.longitude,
      },
      timestamp: alert.create_Date,
      source: alert.snc_url,
      isActive: alert.status === "A",
      affectedArea: {
        radius: 10,
      },
    })) as Alert[];
  }),
} satisfies TRPCRouterRecord;
