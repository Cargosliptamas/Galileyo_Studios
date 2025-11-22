"use client";

import type { LngLatLike } from "maplibre-gl";
import { useMemo } from "react";
import { LngLatBounds } from "maplibre-gl";

import { ScrollArea } from "@galileyo/ui";

import type { Alert } from "~/lib/types/alert";
import { AlertCard } from "./alert-card";

interface AlertListProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  bounds?: LngLatLike | null;
}

export function AlertList({
  alerts,
  onAlertClick,
  bounds: boundsArray,
}: AlertListProps) {
  const sortedAlerts = useMemo(
    () =>
      [...alerts]
        .filter((alert) => {
          if (!boundsArray) {
            return true;
          }

          const bounds = new LngLatBounds(boundsArray);
          return bounds.contains({
            lng: alert.location.longitude,
            lat: alert.location.latitude,
          });
        })
        .sort((a, b) => {
          // const severityOrder = {
          //   critical: 4,
          //   high: 3,
          //   medium: 2,
          //   low: 1,
          //   information: 0,
          // };
          // return severityOrder[b.severity] - severityOrder[a.severity];
          // sort by date descending
          return (
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }),
    [alerts, boundsArray],
  );

  return (
    <div className="space-y-3 p-2">
      <h1 className="text-xl font-bold">{sortedAlerts.length} alerts</h1>

      <ScrollArea className="h-[calc(100vh-15rem)]">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {sortedAlerts.length === 0 ? (
            <div className="col-span-full py-8 text-center text-muted-foreground">
              <p>No alerts match your current filters.</p>
            </div>
          ) : (
            sortedAlerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAlertClick={onAlertClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
