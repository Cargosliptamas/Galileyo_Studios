"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import L from "leaflet";

import { Badge } from "@galileyo/ui/badge";

import type { Alert } from "~/lib/types/alert";
import { mockAlerts } from "~/lib/data/alerts";
import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from "~/lib/types/alert";

// Helper function to get SVG path for each alert type
function getIconPath(alertType: string): string {
  const iconPaths: Record<string, string> = {
    ACCIDENT: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    ACTIVESHOOTER:
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    AVALANCHE:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    BIOMEDICAL:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.51 4.04 3 5.5l7 7Z"/>',
    CIVILUNREST:
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    COMBAT:
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    CONFLICT:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    CYBER:
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    DROUGHT:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    EARTHQUAKE:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    EQUIPMENT:
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    EXTREMETEMPERATURE:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    FLOOD:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    HIGHSURF:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    HIGHWIND:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    INCIDENT: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    LANDSLIDE:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    MANMADE:
      '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>',
    MARINE:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    OCCURRENCE: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    POLITICALCONFLICT:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    SEVEREWEATHER:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    STORM:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    TERRORISM:
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    TORNADO:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    CYCLONE:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
    TSUNAMI:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    UNIT: '<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
    VOLCANO:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    WEAPONS:
      '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
    WILDFIRE:
      '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    WINTERSTORM:
      '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10Z"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/>',
  };
  
  const path = iconPaths[alertType];
  
  if (!path) {
    return iconPaths.INCIDENT ?? "";
  }

  return path;
}

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

interface AlertMapProps {
  alerts?: Alert[];
  center?: [number, number];
  zoom?: number;
  onAlertClick?: (alert: Alert) => void;
  showAffectedAreas?: boolean;
}

export interface AlertMapRef {
  panToAlert: (alert: Alert) => void;
}

export const AlertMap = forwardRef<AlertMapRef, AlertMapProps>(
  (
    {
      alerts = mockAlerts,
      center = [40.7128, -74.006], // Default to NYC
      zoom = 6,
      onAlertClick,
      showAffectedAreas = true,
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
    }));

    if (!isClient) {
      return (
        <div className="flex h-[600px] w-full animate-pulse items-center justify-center rounded-lg bg-gray-200">
          <div className="text-gray-500">Loading map...</div>
        </div>
      );
    }

    return (
      <div className="h-[600px] w-full overflow-hidden rounded-lg border">
        <MapContainer
          center={center}
          zoom={zoom}
          style={{ height: "100%", width: "100%" }}
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
            const customIcon = L.divIcon({
              className: "custom-marker",
              html: `
              <div class="custom-marker ${alert.type}" style="background-color: ${alertConfig.color};">
                <svg style="color: white; width: 12px; height: 12px; display: flex; align-items: center; justify-content: center;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  ${getIconPath(alert.type)}
                </svg>
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
                          {new Date(+alert.timestamp).toLocaleString()}
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
        </MapContainer>
      </div>
    );
  },
);

AlertMap.displayName = "AlertMap";
