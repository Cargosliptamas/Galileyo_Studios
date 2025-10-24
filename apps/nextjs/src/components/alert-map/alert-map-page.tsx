"use client";

import { useMemo, useRef, useState } from "react";

import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";

import type { AlertMapRef } from "~/components/map/alert-map";
import type { Alert, AlertFilters, AlertType } from "~/lib/types/alert";
import { AlertFiltersComponent } from "~/components/map/alert-filters";
import { AlertLegend } from "~/components/map/alert-legend";
import { AlertList } from "~/components/map/alert-list";
import { AlertMap } from "~/components/map/alert-map";

import "leaflet/dist/leaflet.css";

import { useSuspenseQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";

export function AlertMapPage() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.alerts.list.queryOptions());

  const alerts = data;

  const mapRef = useRef<AlertMapRef>(null);

  const [filters, setFilters] = useState<AlertFilters>({
    types: [
      "ACCIDENT",
      "ACTIVESHOOTER",
      "AVALANCHE",
      "BIOMEDICAL",
      "CIVILUNREST",
      "COMBAT",
      "CONFLICT",
      "CYBER",
      "DROUGHT",
      "EARTHQUAKE",
      "EQUIPMENT",
      "EXTREMETEMPERATURE",
      "FLOOD",
      "HIGHSURF",
      "HIGHWIND",
      "INCIDENT",
      "LANDSLIDE",
      "MANMADE",
      "MARINE",
      "OCCURRENCE",
      "POLITICALCONFLICT",
      "SEVEREWEATHER",
      "STORM",
      "TERRORISM",
      "TORNADO",
      "CYCLONE",
      "TSUNAMI",
      "UNIT",
      "VOLCANO",
      "WEAPONS",
      "WILDFIRE",
      "WINTERSTORM",
    ] as AlertType[],
    severities: ["low", "medium", "high", "critical"],
    isActive: true,
  });

  const [showFilters, setShowFilters] = useState(true);
  const [showList, setShowList] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Check if alert type is in selected types
      if (!filters.types.includes(alert.type)) return false;

      // Check if alert severity is in selected severities
      if (!filters.severities.includes(alert.severity)) return false;

      // Check if alert is active (if filter is enabled)
      if (filters.isActive && !alert.isActive) return false;

      return true;
    });
  }, [filters]);

  const handleAlertClick = (alert: Alert) => {
    // Pan the map to the alert location
    if (mapRef.current) {
      mapRef.current.panToAlert(alert);
    }
  };

  const handleFiltersChange = (newFilters: AlertFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Alerts Map</h1>
              <p className="text-sm text-muted-foreground">
                Real-time alerts and incidents across the globe
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowList(!showList)}
              >
                {showList ? "Hide List" : "Show List"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
              >
                {showLegend ? "Hide Legend" : "Show Legend"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <AlertFiltersComponent
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />
            </div>
          )}

          {/* Map and List */}
          <div
            className={`${showFilters ? "lg:col-span-3" : "lg:col-span-4"} grid grid-cols-1 gap-6 lg:grid-cols-6`}
          >
            {/* <div className="space-y-6"> */}
            {/* Map */}
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>Interactive Map</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Showing {filteredAlerts.length} alerts
                </p>
              </CardHeader>
              <CardContent>
                <AlertMap
                  ref={mapRef}
                  alerts={filteredAlerts}
                  onAlertClick={handleAlertClick}
                  showAffectedAreas={true}
                />
              </CardContent>
            </Card>

            {/* Legend Sidebar */}
            {showLegend && (
              <div className="lg:col-span-2">
                <AlertLegend />
              </div>
            )}
            {/* </div> */}
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Alert List */}
        {showList && (
          <Card>
            <CardContent className="p-4">
              <AlertList
                alerts={filteredAlerts}
                onAlertClick={handleAlertClick}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
