"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import L from "leaflet";
import { useMap, useMapEvents } from "react-leaflet";

import { toast } from "@galileyo/ui/toast";

import type { Location } from "./location-search";

import "leaflet/dist/leaflet.css";

// Dynamically import map components to avoid SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false },
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false },
);

const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false },
);

const AttributionControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.AttributionControl),
  { ssr: false },
);

function MapClickHandler({
  onLocationSelect,
  onMapReady,
}: {
  onLocationSelect: (lat: number, lon: number) => void;
  onMapReady?: (map: L.Map) => void;
}) {
  const map = useMap();

  useMapEvents({
    click: (e: { latlng: { lat: number; lng: number } }) => {
      const { lat, lng } = e.latlng;
      onLocationSelect(lat, lng);
    },
  });

  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);

  return null;
}

export function LocationPickerMap({
  selectedLocation,
  onLocationSelect,
}: {
  selectedLocation: Location | null;
  onLocationSelect: (location: Location) => void;
}) {
  const [isClient, setIsClient] = useState(false);
  const [isReverseGeocoding, setIsReverseGeocoding] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    setIsClient(true);

    // Fix for default markers in Leaflet
    delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })
      ._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
  }, []);

  // Pan to selected location when it changes
  useEffect(() => {
    if (selectedLocation && mapRef.current) {
      const latLng = L.latLng(selectedLocation.lat, selectedLocation.lon);
      mapRef.current.setView(latLng, undefined, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedLocation]);

  const handleMapClick = async (lat: number, lon: number) => {
    setIsReverseGeocoding(true);
    try {
      // Reverse geocode using Nominatim API
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1`,
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
  };

  if (!isClient) {
    return (
      <div className="h-[400px] w-full animate-pulse rounded-lg bg-muted" />
    );
  }

  const center: [number, number] = selectedLocation
    ? [selectedLocation.lat, selectedLocation.lon]
    : [40.7128, -74.006]; // Default to NYC

  return (
    <div className="relative h-[400px] w-full overflow-hidden rounded-lg border">
      {isReverseGeocoding && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-black/20">
          <div className="rounded-lg bg-background px-4 py-2 text-sm">
            Getting location details...
          </div>
        </div>
      )}
      <MapContainer
        center={center}
        zoom={selectedLocation ? 15 : 10}
        style={{ height: "100%", width: "100%" }}
        attributionControl={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler
          onLocationSelect={handleMapClick}
          onMapReady={(map) => {
            mapRef.current = map;
          }}
        />
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lon]} />
        )}
        <AttributionControl position="bottomright" prefix="Galileyo" />
      </MapContainer>
    </div>
  );
}
