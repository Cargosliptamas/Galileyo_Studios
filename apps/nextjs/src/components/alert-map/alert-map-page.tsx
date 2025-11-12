"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@galileyo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@galileyo/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@galileyo/ui/dialog";

import type { AlertMapRef } from "~/components/map/alert-map";
import type { Location } from "~/components/map/location-search";
import type { Alert, AlertFilters, AlertType } from "~/lib/types/alert";
import { AlertFiltersComponent } from "~/components/map/alert-filters";
import { AlertLegend } from "~/components/map/alert-legend";
import { AlertList } from "~/components/map/alert-list";
import { AlertMap } from "~/components/map/alert-map";
import { LocationSearch } from "~/components/map/location-search";

import "leaflet/dist/leaflet.css";

import { useSuspenseQuery } from "@tanstack/react-query";

import { ScrollArea } from "@galileyo/ui";

import { useTRPC } from "~/trpc/react";

export function AlertMapPage() {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(trpc.alerts.list.queryOptions({}));

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

  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [showLegendDialog, setShowLegendDialog] = useState(false);
  const [showList, setShowList] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );

  // Get user's location on mount
  useEffect(() => {
    const fetchUserLocation = async () => {
      if (mapRef.current) {
        const location = await mapRef.current.getUserLocation();
        if (location) {
          // Center the map on user's location
          mapRef.current.panToLocation(location.lat, location.lng, 10);
        }
      }
    };

    void fetchUserLocation();
  }, []);

  // Filter alerts based on current filters and location
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Check if alert type is in selected types
      if (!filters.types.includes(alert.type)) return false;

      // Check if alert severity is in selected severities
      if (!filters.severities.includes(alert.severity)) return false;

      // Check if alert is active (if filter is enabled)
      if (filters.isActive && !alert.isActive) return false;

      // Check if alert is within selected location bounds
      if (selectedLocation) {
        // Check bounding box first
        if (selectedLocation.boundingbox) {
          const [minLat, maxLat, minLon, maxLon] = selectedLocation.boundingbox;
          const alertLat = alert.location.latitude;
          const alertLon = alert.location.longitude;

          if (
            parseFloat(minLat) > alertLat ||
            parseFloat(maxLat) < alertLat ||
            parseFloat(minLon) > alertLon ||
            parseFloat(maxLon) < alertLon
          ) {
            return false;
          }
        }
      }

      return true;
    });
  }, [alerts, filters, selectedLocation]);

  const handleAlertClick = (alert: Alert) => {
    // Pan the map to the alert location
    if (mapRef.current) {
      mapRef.current.panToAlert(alert);
    }
  };

  const handleFiltersChange = (newFilters: AlertFilters) => {
    setFilters(newFilters);
  };

  const handleLocationSelect = (location: Location) => {
    // Save the selected location
    setSelectedLocation(location);

    // Pan the map to the selected location
    if (mapRef.current) {
      // Use the bounding box if available to determine zoom level
      const zoom = location.boundingbox ? 11 : 12;
      // Ensure lat and lon are numbers
      const lat = Number(location.lat);
      const lon = Number(location.lon);
      mapRef.current.panToLocation(lat, lon, zoom);
    }
  };

  const handleLocationClear = () => {
    setSelectedLocation(null);
  };

  return (
    <div className="min-h-screen py-4">
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
              <Dialog
                open={showFiltersDialog}
                onOpenChange={setShowFiltersDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Filters
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Filter Alerts</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[calc(80vh-100px)]">
                    <AlertFiltersComponent
                      onFiltersChange={handleFiltersChange}
                      initialFilters={filters}
                    />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Dialog
                open={showLegendDialog}
                onOpenChange={setShowLegendDialog}
              >
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Legend
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Map Legend</DialogTitle>
                  </DialogHeader>
                  <ScrollArea className="h-[calc(80vh-100px)]">
                    <AlertLegend />
                  </ScrollArea>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowList(!showList)}
              >
                {showList ? "Hide List" : "Show List"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <LocationSearch
          onLocationSelect={handleLocationSelect}
          onLocationClear={handleLocationClear}
          selectedLocation={selectedLocation}
        />
      </div>

      {/* Main Content - Full Size Map */}
      <div className="h-[calc(100vh-200px)]">
        <Card>
          <CardContent className="p-0">
            <AlertMap
              ref={mapRef}
              alerts={filteredAlerts}
              onAlertClick={handleAlertClick}
              showAffectedAreas={true}
              selectedLocation={selectedLocation}
            />
          </CardContent>
        </Card>
      </div>

      {/* Alert List */}
      {showList && (
        <div className="mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Alerts List</CardTitle>
              <p className="text-sm text-muted-foreground">
                Showing {filteredAlerts.length} alerts
                {selectedLocation && (
                  <span className="ml-2 text-xs">
                    in {selectedLocation.display_name}
                  </span>
                )}
              </p>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto">
              <AlertList
                alerts={filteredAlerts}
                onAlertClick={handleAlertClick}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
