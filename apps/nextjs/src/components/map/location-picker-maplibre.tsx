"use client";

import type { MapRef, ViewState } from "react-map-gl/maplibre";
import { useCallback, useEffect, useRef, useState } from "react";
import { Map as MapLibre, Marker } from "react-map-gl/maplibre";

import { toast } from "@galileyo/ui/toast";

import type { Location } from "./location-search";

import "maplibre-gl/dist/maplibre-gl.css";

export function LocationPickerMap({
  selectedLocation,
  onLocationSelect,
}: {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
}) {
  const [isClient, setIsClient] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState<Partial<ViewState>>({
    longitude: selectedLocation?.lon ?? -74.006,
    latitude: selectedLocation?.lat ?? 40.7128,
    zoom: selectedLocation ? 15 : 10,
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Pan to selected location when it changes
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedLocation.lon, selectedLocation.lat],
        zoom: 15,
        duration: 500,
      });
    }
  }, [selectedLocation]);

  const handleMapClick = useCallback(
    async (event: { lngLat: { lat: number; lng: number } }) => {
      const { lat, lng } = event.lngLat;
      setIsReverseGeocoding(true);
      try {
        // Reverse geocode using Nominatim API
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              "User-Agent": "Galileyo Location Picker",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to reverse geocode");
        }

        const data = (await response.json()) as {
          display_name: string;
          lat: string;
          lon: string;
          type?: string;
          osm_id?: number;
          place_id?: number;
          boundingbox?: [string, string, string, string];
        };

        const location: Location = {
          lat: parseFloat(data.lat),
          lon: parseFloat(data.lon),
          display_name: data.display_name,
          type: data.type ?? "unknown",
          osm_id: data.osm_id,
          place_id: data.place_id,
          boundingbox: data.boundingbox,
        };

        onLocationSelect(location);
      } catch (error) {
        console.error("Reverse geocoding error:", error);
        toast.error("Failed to get location details");
      } finally {
        setIsReverseGeocoding(false);
      }
    },
    [onLocationSelect],
  );

  if (!isClient) {
    return (
      <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted" />
    );
  }

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border">
      {isReverseGeocoding && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20">
          <div className="rounded-lg bg-background px-4 py-2 text-sm">
            Getting location details...
          </div>
        </div>
      )}
      <MapLibre
        ref={mapRef}
        initialViewState={viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        onClick={handleMapClick}
        mapStyle="https://tiles.openfreemap.org/styles/liberty"
        attributionControl={{ compact: true, customAttribution: "Galileyo" }}
        style={{ width: "100%", height: "100%" }}
      >
        {selectedLocation && (
          <Marker
            longitude={selectedLocation.lon}
            latitude={selectedLocation.lat}
            anchor="bottom"
          >
            <div className="h-5 w-5 rounded-full border-2 border-white bg-red-500 shadow-lg" />
          </Marker>
        )}
      </MapLibre>
    </div>
  );
}
