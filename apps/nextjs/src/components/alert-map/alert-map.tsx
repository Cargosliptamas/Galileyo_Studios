"use client";

import { useCallback, useMemo } from "react";

import type { Alert } from "@galileyo/validators";

import type { Location } from "../map/location-search";
import type { MapData, MapProps, ViewState } from "../ui/map/map";
import { Map } from "../ui/map/map";

interface AlertMapProps {
  alerts?: Alert[];
  center?: {
    latitude: number;
    longitude: number;
  };
  zoom?: number;
  showAffectedAreas?: boolean;
  selectedLocation?: Location | null;
  onMarkerClick?: (alert: Alert) => void;
  onAlertClick?: (alert: Alert) => void;
  onViewStateChange?: (viewState: ViewState) => void;
  onMoveEnd?: (viewState: ViewState) => void;
  children?: React.ReactNode;
  cooperativeGestures?: boolean;
  canClickAlerts?: boolean;
  config?: MapProps["config"];
}

export function AlertMap({
  alerts = [],
  center,
  zoom,
  // showAffectedAreas,
  // selectedLocation,
  onMarkerClick,
  onAlertClick,
  onViewStateChange,
  onMoveEnd,
  children,
  cooperativeGestures,
  canClickAlerts = true,
  config,
}: AlertMapProps) {
  const data: MapData[] = useMemo(() => {
    return alerts.map((alert) => ({
      latitude: alert.location.latitude,
      longitude: alert.location.longitude,
      alert,
    }));
  }, [alerts]);

  const handleMarkerClick = useCallback(
    (item: MapData) => {
      if (item.alert && canClickAlerts) {
        onMarkerClick?.(item.alert);
      }
    },
    [onMarkerClick, canClickAlerts],
  );

  const handleAlertClick = useCallback(
    (item: MapData) => {
      if (item.alert && canClickAlerts) {
        onAlertClick?.(item.alert);
      }
    },
    [onAlertClick, canClickAlerts],
  );

  const viewState = useMemo(() => {
    if (!center) {
      return undefined;
    }

    return {
      latitude: center.latitude,
      longitude: center.longitude,
      zoom,
    };
  }, [center, zoom]);

  return (
    <div className="h-full w-full">
      <Map
        id="alertMap"
        initialViewState={viewState}
        data={data}
        onMarkerClick={handleMarkerClick}
        onPopupClick={handleAlertClick}
        onViewStateChange={onViewStateChange}
        onMoveEnd={onMoveEnd}
        cooperativeGestures={cooperativeGestures}
        canClickMarkers={canClickAlerts}
        config={config}
      >
        {children}
      </Map>
    </div>
  );
}
