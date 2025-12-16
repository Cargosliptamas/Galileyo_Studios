"use client";

import type { LucideIcon } from "lucide-react";
import type { LngLatLike } from "maplibre-gl";
import { useCallback, useMemo } from "react";
import {
  Check,
  Cloud,
  CloudRain,
  Gauge,
  Thermometer,
  Wind,
} from "lucide-react";
import { LngLatBounds } from "maplibre-gl";

import { cn, ScrollArea } from "@galileyo/ui";
import { Card, CardContent } from "@galileyo/ui/card";

import type { WeatherLayerIds } from "../ui/map/layers/weather-layer";
import type { Alert } from "~/lib/types/alert";
import {
  useWeatherLayers,
  WeatherLayerIdsString,
} from "../ui/map/layers/weather-layer";
import { AlertCard } from "./alert-card";

const weatherLayerIconComponents: Record<
  (typeof WeatherLayerIdsString)[number],
  LucideIcon
> = {
  weather_clouds: Cloud,
  weather_pressure: Gauge,
  weather_temperature: Thermometer,
  weather_wind: Wind,
  weather_precipitation: CloudRain,
};

interface AlertListProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  bounds?: LngLatLike | null;
}

function WeatherLayerIcon({
  layerId,
}: {
  layerId: (typeof WeatherLayerIdsString)[number];
}) {
  const IconComponent = weatherLayerIconComponents[layerId];
  return <IconComponent className="h-5 w-5" />;
}

export function AlertList({
  alerts,
  onAlertClick,
  bounds: boundsArray,
}: AlertListProps) {
  const { weatherLayers, toggleLayer } = useWeatherLayers();

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
        })
        .sort((a, b) => {
          if (b.is_influencer && !a.is_influencer) {
            return 1;
          }

          if (a.is_influencer && !b.is_influencer) {
            return -1;
          }

          return 0;
        }),
    [alerts, boundsArray],
  );

  const handleWeatherLayerClick = useCallback(
    (layerId: WeatherLayerIds) => {
      toggleLayer(layerId);
    },
    [toggleLayer],
  );

  return (
    <div className="space-y-3 p-2">
      <ScrollArea className="h-[calc(100vh-15rem)]">
        <h1 className="mb-2 text-lg font-bold">Weather Layers</h1>
        <div className="mb-2 grid grid-cols-2 gap-2 xl:grid-cols-3">
          {WeatherLayerIdsString.map((layerId) => {
            const isEnabled = weatherLayers[layerId];
            return (
              <Card
                className={cn(
                  "transform cursor-pointer border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600",
                  isEnabled &&
                    "border-blue-500 bg-blue-50/50 dark:border-blue-400 dark:bg-blue-900/20",
                )}
                onClick={() => handleWeatherLayerClick(layerId)}
                key={layerId}
              >
                <CardContent className="p-2">
                  <div className="flex items-center gap-1.5">
                    <WeatherLayerIcon layerId={layerId} />
                    <h4 className="truncate text-xs font-semibold capitalize">
                      {layerId.replace("weather_", "").replace(/_/g, " ")}
                    </h4>
                    {isEnabled && (
                      <Check className="ml-auto h-3 w-3 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <h1 className="mb-2 text-lg font-bold">{sortedAlerts.length} alerts</h1>
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-2 2xl:grid-cols-3">
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
                compact
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
