"use client";

import type { LngLatLike } from "maplibre-gl";
import { useCallback, useMemo, useState } from "react";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { parseAsBoolean, parseAsFloat, useQueryState } from "nuqs";

import type { FeedItem } from "@galileyo/validators";
import { ScrollArea } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@galileyo/ui/dialog";

import type { Location } from "~/components/map/location-search";
import type { Alert, AlertFilters, AlertType } from "~/lib/types/alert";
import { AlertFiltersComponent } from "~/components/map/alert-filters";
import { AlertLegend } from "~/components/map/alert-legend";
import { LocationSearch } from "~/components/map/location-search";
import { MapProvider, useMap } from "~/components/ui/map/map";
import { CommentsModalContext } from "~/hooks/use-comments-modal";
import { useTRPC } from "~/trpc/react";
import CommentsModal from "../feed/comments-modal";
import FeedCard from "../feed/feed-card";
import FeedCardSkeleton from "../feed/feed-card-skeleton";
import ReportModal from "../feed/report-modal";
import { AlertCard } from "./alert-card";
import { AlertList } from "./alert-list";
import { AlertMap } from "./alert-map";

export function AlertMapPageContent() {
  const { alertMap: map } = useMap();
  const trpc = useTRPC();

  const [showInfluencers] = useQueryState(
    "showInfluencers",
    parseAsBoolean.withDefault(false),
  );
  const [latitude] = useQueryState("latitude", parseAsFloat);
  const [longitude] = useQueryState("longitude", parseAsFloat);

  const [bounds, setBounds] = useState<LngLatLike | null>(null);
  const [showFiltersDialog, setShowFiltersDialog] = useState(false);
  const [showLegendDialog, setShowLegendDialog] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null,
  );
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [post, setPost] = useState<FeedItem | null>(null);

  const { data } = useSuspenseQuery(
    trpc.alerts.list.queryOptions({
      show_influencers: true,
    }),
  );

  const { data: news, isLoading: isLoadingNews } = useQuery({
    ...trpc.feed.getNewsById.queryOptions({
      id: selectedAlert?.id ? Number(selectedAlert.id) : 0,
    }),
    enabled: Boolean(selectedAlert?.id) && selectedAlert?.is_influencer,
  });

  const alerts = data;

  const [filters, setFilters] = useState<AlertFilters>({
    types: [
      "UNKNOWN",
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
    severities: ["information", "low", "medium", "high", "critical"],
    isActive: true,
    showInfluencers,
  });

  // Get user's location on mount
  // useEffect(() => {
  //   const fetchUserLocation = async () => {
  //     if (mapRef.current) {
  //       const location = await mapRef.current.getUserLocation();
  //       if (location) {
  //         // Center the map on user's location
  //         mapRef.current.panToLocation(location.lat, location.lng, 10);
  //       }
  //     }
  //   };

  //   void fetchUserLocation();
  // }, []);

  // Filter alerts based on current filters, location, and map view bounds
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // Check if alert type is in selected types
      if (!filters.types.includes(alert.type)) return false;

      // Check if alert severity is in selected severities
      if (!filters.severities.includes(alert.severity)) return false;

      // Check if alert is active (if filter is enabled)
      if (filters.isActive && !alert.isActive) return false;

      if (!filters.showInfluencers && alert.is_influencer) return false;

      const alertLat = alert.location.latitude;
      const alertLon = alert.location.longitude;

      // Check if alert is within selected location bounds (takes priority)
      if (selectedLocation) {
        // Check bounding box first
        if (selectedLocation.boundingbox) {
          const [minLat, maxLat, minLon, maxLon] = selectedLocation.boundingbox;

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

  const center = useMemo(() => {
    if (latitude && longitude) {
      return {
        latitude: Number(latitude),
        longitude: Number(longitude),
      };
    }

    return undefined;
  }, [latitude, longitude]);

  const zoom = useMemo(() => {
    if (latitude && longitude) {
      return 14;
    }

    return undefined;
  }, [latitude, longitude]);

  const handleAlertClick = useCallback((alert: Alert) => {
    // Pan the map to the alert location
    // if (mapRef.current) {
    //   mapRef.current.panToAlert(alert);
    // }
    setSelectedAlert(alert);
  }, []);

  const handleFiltersChange = (newFilters: AlertFilters) => {
    setFilters(newFilters);
  };

  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);

    if (map) {
      map.flyTo({
        center: {
          lon: Number(location.lon),
          lat: Number(location.lat),
        },
        zoom: location.boundingbox ? 11 : 12,
      });
    }
  };

  const handleLocationClear = () => {
    setSelectedLocation(null);
  };

  const handleOpenCommentsModal = (post: FeedItem) => {
    setPost(post);
    setIsOpen(true);
  };

  const handleMoveEnd = () => {
    if (map) {
      const bounds = map.getBounds();
      setBounds(bounds.toArray() as unknown as LngLatLike);
    }
  };

  return (
    <CommentsModalContext.Provider value={{ handleOpenCommentsModal }}>
      <div className="min-h-screen">
        {/* Header */}
        <div className="border-b shadow-sm">
          <div className="mx-auto px-4">
            <div className="flex items-center justify-between gap-4 py-4">
              <div>
                <h1 className="text-2xl font-bold">Alerts Map</h1>
              </div>
              <div className="flex-1">
                <LocationSearch
                  onLocationSelect={handleLocationSelect}
                  onLocationClear={handleLocationClear}
                  selectedLocation={selectedLocation}
                />
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
                {/* <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowList(!showList)}
                >
                  {showList ? "Hide List" : "Show List"}
                </Button> */}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content - Full Size Map */}
        <div className="grid h-[calc(100vh-10rem)] w-full grid-cols-1 gap-0 p-0 xl:grid-cols-12">
          <div className="col-span-1 md:col-span-7 xl:max-h-[calc(100vh-10rem)]">
            <AlertMap
              alerts={filteredAlerts}
              center={center}
              zoom={zoom}
              showAffectedAreas={false}
              selectedLocation={selectedLocation}
              onAlertClick={handleAlertClick}
              onMoveEnd={handleMoveEnd}
            />
          </div>
          <div className="col-span-1 hidden md:col-span-5 md:block xl:max-h-[calc(100vh-10rem)]">
            <AlertList
              alerts={filteredAlerts}
              onAlertClick={handleAlertClick}
              bounds={bounds}
            />
          </div>
        </div>

        <Dialog
          open={!!selectedAlert}
          onOpenChange={() => setSelectedAlert(null)}
        >
          <DialogHeader>
            <DialogTitle></DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          <DialogContent className="flex max-h-[90vh] max-w-4xl flex-col overflow-hidden border-none bg-transparent p-0 shadow-none">
            <div className="flex-1 overflow-y-auto">
              <div className="flex w-full items-center space-x-2 p-6">
                {selectedAlert?.is_influencer &&
                  (isLoadingNews || !news ? (
                    <div className="w-full rounded-xl bg-background">
                      <FeedCardSkeleton className="mx-auto w-full" />
                    </div>
                  ) : (
                    <div className="w-full rounded-xl bg-background">
                      <FeedCard
                        className="w-full"
                        item={news}
                        getQueryKeys={() =>
                          trpc.feed.getNewsById.queryKey({
                            id: Number(selectedAlert.id),
                          })
                        }
                        getQueryKeysOnError={() =>
                          trpc.feed.getNewsById.queryKey({
                            id: Number(selectedAlert.id),
                          })
                        }
                        isOnAlertMap={true}
                      />
                    </div>
                  ))}

                {selectedAlert && !selectedAlert.is_influencer && (
                  <div className="w-full rounded-xl bg-background">
                    <AlertCard alert={selectedAlert} />
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {post && (
        <CommentsModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          post={post}
        />
      )}

      <ReportModal />
    </CommentsModalContext.Provider>
  );
}

export function AlertMapPage() {
  return (
    <MapProvider>
      <AlertMapPageContent />
    </MapProvider>
  );
}
