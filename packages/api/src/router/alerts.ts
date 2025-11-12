import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import type { Alert, AlertSeverity, AlertType } from "../types/alert";
import {
  protectedProcedure,
  // publicProcedure
} from "../trpc";

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

export async function getAlertsFromBackend({
  token,
  limit,
  cursor,
  from_date,
  to_date,
}: {
  token: string;
  limit: number;
  cursor: number;
  from_date?: string | null;
  to_date?: string | null;
}) {
  const options: {
    page: number;
    page_size: number;
    from_date?: string | null;
    to_date?: string | null;
  } = {
    page: cursor,
    page_size: limit,
  };

  if (from_date) {
    options.from_date = from_date;
  }

  if (to_date) {
    options.to_date = to_date;
  }

  const request = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/emergency-alerts/index`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(options),
    },
  );

  const result = (await request.json()) as {
    status: "success" | "error";
    data: {
      count: number;
      page: number;
      page_size: number;
      list: {
        id: number;
        uuid: string;
        hazard_name: string;
        description: string;
        severity_id: string;
        severity: AlertSeverity;
        type_id: AlertType;
        category_id: string;
        autoexpire: boolean;
        areabrief_url: string | null;
        active: boolean;
        latitude: string;
        longitude: string;
        start_date: string;
        end_date: string;
        last_update: string;
        external_creation_date: string;
        created_at: string;
        updated_at: string | null;
      }[];
    };
  };

  return {
    data: result.data,
    status: result.status,
  };
}

export const alertsRouter = {
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().optional().default(1000),
        cursor: z.number().optional().default(1),
        from_date: z.string().optional().nullish(),
        to_date: z.string().optional().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { data, status } = await getAlertsFromBackend({
        token: ctx.session.session.token,
        limit: input.limit,
        cursor: input.cursor,
        from_date: input.from_date,
        to_date: input.to_date,
      });

      if (status !== "success") {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch alerts",
        });
      }

      const response: Alert[] = data.list.map((alert) => ({
        id: alert.id.toString(),
        title: alert.hazard_name,
        description: alert.description,
        type: alert.type_id,
        severity: mapSeverity(alert.severity_id),
        location: {
          latitude: Number(alert.latitude),
          longitude: Number(alert.longitude),
        },
        timestamp: alert.external_creation_date,
        source: "",
        isActive: alert.active,
        affectedArea: {
          radius: 0,
        },
      }));

      return response;
    }),
} satisfies TRPCRouterRecord;
