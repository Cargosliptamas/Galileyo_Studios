"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import L from "leaflet";
import { renderToString } from "react-dom/server";

import { Badge } from "@galileyo/ui/badge";

import type { Alert } from "~/lib/types/alert";
import { mockAlerts } from "~/lib/data/alerts";
import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from "~/lib/types/alert";

// Dynamically import the map component to avoid SSR issues
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

const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const Circle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Circle),
  { ssr: false },
);

const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false },
);

const Rectangle = dynamic(
  () => import("react-leaflet").then((mod) => mod.Rectangle),
  { ssr: false },
);

const AttributionControl = dynamic(
  () => import("react-leaflet").then((mod) => mod.AttributionControl),
  { ssr: false },
);

interface SelectedLocation {
  lat: number;
  lon: number;
  display_name: string;
  boundingbox?: [string, string, string, string];
  geojson?: {
    type: string;
    coordinates: number[][][] | number[][];
  };
}

interface AlertMapProps {
  alerts?: Alert[];
  center?: [number, number];
  zoom?: number;
  onAlertClick?: (alert: Alert) => void;
  showAffectedAreas?: boolean;
  selectedLocation?: SelectedLocation | null;
}

export interface AlertMapRef {
  panToAlert: (alert: Alert) => void;
  panToLocation: (lat: number, lng: number, zoom?: number) => void;
  getUserLocation: () => Promise<{ lat: number; lng: number } | null>;
}

export const AlertMap = forwardRef<AlertMapRef, AlertMapProps>(
  (
    {
      alerts = mockAlerts,
      center = [40.7128, -74.006], // Default to NYC
      zoom = 6,
      onAlertClick,
      showAffectedAreas = true,
      selectedLocation,
    },
    ref,
  ) => {
    const [isClient, setIsClient] = useState(false);
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

    useImperativeHandle(ref, () => ({
      panToAlert: (alert: Alert) => {
        if (mapRef.current) {
          const latLng = L.latLng(
            alert.location.latitude,
            alert.location.longitude,
          );
          mapRef.current.setView(latLng, 12, {
            animate: true,
            duration: 1,
          });
        }
      },
      panToLocation: (lat: number, lng: number, zoom = 12) => {
        if (mapRef.current) {
          const latLng = L.latLng(lat, lng);
          mapRef.current.setView(latLng, zoom, {
            animate: true,
            duration: 1,
          });
        }
      },
      getUserLocation: async () => {
        return new Promise((resolve) => {
          // if (!navigator.geolocation) {
          //   resolve(null);
          //   return;
          // }

          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            },
            () => {
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 0,
            },
          );
        });
      },
    }));

    if (!isClient) {
      return null;
      // return (
      //   <div className="flex h-[600px] w-full animate-pulse items-center justify-center rounded-lg bg-gray-200">
      //     <div className="text-gray-500">Loading map...</div>
      //   </div>
      // );
    }

    return (
      <div className="h-[600px] w-full overflow-hidden rounded-lg border">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
          className="z-0"
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {alerts.map((alert) => {
            const alertConfig = ALERT_TYPE_CONFIG[alert.type];
            const severityConfig = SEVERITY_CONFIG[alert.severity];

            // Create custom icon for each alert type
            const IconComponent = alertConfig.icon;
            const iconHtml = renderToString(
              <IconComponent className="h-6 w-6" style={{ color: "white" }} />,
            );
            const customIcon = L.divIcon({
              className: "custom-marker",
              html: `
              <div class="custom-marker ${alert.type}" style="background-color: ${alertConfig.color}; display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%;">
                ${iconHtml}
              </div>
            `,
              iconSize: [24, 24],
              iconAnchor: [12, 12],
              popupAnchor: [0, -12],
            });

            return (
              <div key={alert.id}>
                <Marker
                  position={[alert.location.latitude, alert.location.longitude]}
                  icon={customIcon}
                  eventHandlers={{
                    click: () => onAlertClick?.(alert),
                  }}
                >
                  <Popup>
                    <div className="min-w-[250px] p-2">
                      <div className="mb-2 flex items-center gap-2">
                        <IconComponent
                          className="h-5 w-5"
                          style={{ color: alertConfig.color }}
                        />
                        <div>
                          <h3 className="text-sm font-semibold">
                            {alert.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: severityConfig.color,
                                color: "white",
                              }}
                            >
                              {severityConfig.label}
                            </Badge>
                            <Badge
                              variant="secondary"
                              style={{
                                backgroundColor: alertConfig.color,
                                color: "white",
                              }}
                            >
                              {alertConfig.label}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="mb-2 text-sm text-muted-foreground">
                        {alert.description}
                      </p>
                      <div className="text-xs text-muted-foreground">
                        <p>
                          <strong>Source:</strong> {alert.source}
                        </p>
                        <p>
                          <strong>Time:</strong>{" "}
                          {format(alert.timestamp, "MM/dd/yyyy hh:mm a")}
                        </p>
                        {alert.location.address && (
                          <p>
                            <strong>Location:</strong> {alert.location.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </Popup>
                </Marker>

                {showAffectedAreas && alert.affectedArea && (
                  <Circle
                    center={[alert.location.latitude, alert.location.longitude]}
                    radius={alert.affectedArea.radius * 1000} // Convert km to meters
                    pathOptions={{
                      color: alertConfig.color,
                      fillColor: alertConfig.color,
                      fillOpacity: 0.1,
                      weight: 2,
                      opacity: 0.5,
                    }}
                  />
                )}
              </div>
            );
          })}

          {/* Selected Location Region */}
          {selectedLocation && (
            <>
              {/* Render polygon if geojson is available */}
              {selectedLocation.geojson &&
                selectedLocation.geojson.type === "Polygon" &&
                Array.isArray(selectedLocation.geojson.coordinates[0]) && (
                  <Polygon
                    positions={
                      (selectedLocation.geojson.coordinates as number[][][])[0]
                        ?.map((coord: number[]) => {
                          const lat = coord[0];
                          const lon = coord[1];
                          return lat !== undefined && lon !== undefined
                            ? ([lon, lat] as [number, number])
                            : null;
                        })
                        .filter(
                          (coord): coord is [number, number] => coord !== null,
                        ) ?? []
                    }
                    pathOptions={{
                      color: "#4682B4",
                      fillColor: "#87CEEB",
                      fillOpacity: 0.3,
                      weight: 2,
                      opacity: 0.8,
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <p className="text-sm font-medium">
                          {selectedLocation.display_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Number(selectedLocation.lat).toFixed(6)},{" "}
                          {Number(selectedLocation.lon).toFixed(6)}
                        </p>
                      </div>
                    </Popup>
                  </Polygon>
                )}

              {/* Render rectangle if bounding box is available (fallback) */}
              {!selectedLocation.geojson && selectedLocation.boundingbox && (
                <Rectangle
                  bounds={[
                    [
                      parseFloat(selectedLocation.boundingbox[0]),
                      parseFloat(selectedLocation.boundingbox[2]),
                    ], // min_lat, min_lon
                    [
                      parseFloat(selectedLocation.boundingbox[1]),
                      parseFloat(selectedLocation.boundingbox[3]),
                    ], // max_lat, max_lon
                  ]}
                  pathOptions={{
                    color: "#4682B4",
                    fillColor: "#87CEEB",
                    fillOpacity: 0.3,
                    weight: 2,
                    opacity: 0.8,
                  }}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="text-sm font-medium">
                        {selectedLocation.display_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {Number(selectedLocation.lat).toFixed(6)},{" "}
                        {Number(selectedLocation.lon).toFixed(6)}
                      </p>
                    </div>
                  </Popup>
                </Rectangle>
              )}

              {/* Center marker */}
              <Marker
                position={[
                  Number(selectedLocation.lat),
                  Number(selectedLocation.lon),
                ]}
                icon={L.divIcon({
                  className: "selected-location-marker",
                  html: `
                    <div style="
                      background-color: #4682B4; 
                      border: 3px solid #87CEEB;
                      width: 20px; 
                      height: 20px; 
                      border-radius: 50%; 
                      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
                    "></div>
                  `,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              >
                <Popup>
                  <div className="p-2">
                    <p className="text-sm font-medium">
                      {selectedLocation.display_name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Number(selectedLocation.lat).toFixed(6)},{" "}
                      {Number(selectedLocation.lon).toFixed(6)}
                    </p>
                  </div>
                </Popup>
              </Marker>
            </>
          )}
          <AttributionControl position="bottomright" prefix="Galileyo" />
        </MapContainer>
      </div>
    );
  },
);

AlertMap.displayName = "AlertMap";
