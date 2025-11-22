"use client";

import type { StyleItem } from "map-gl-style-switcher/react-map-gl";
import type {
  ControlPosition,
  ViewState as MapLibreViewState,
} from "react-map-gl/maplibre";
import { useCallback, useState } from "react";
import { MapGLStyleSwitcher } from "map-gl-style-switcher/react-map-gl";
import {
  GeolocateControl,
  Map as MapLibre,
  NavigationControl,
  Popup,
  ScaleControl,
} from "react-map-gl/maplibre";

import type { MapData } from "./types";
import { AlertPopup } from "./alert-popup";
import { MapMarker } from "./map-marker";

import "maplibre-gl/dist/maplibre-gl.css";
import "map-gl-style-switcher/dist/map-gl-style-switcher.css";

const mapStyles = [
  {
    id: "liberty",
    name: "Liberty",
    image: "",
    styleUrl: "https://tiles.openfreemap.org/styles/liberty",
    description: "Liberty style from OpenFreemap",
  },
  {
    id: "voyager",
    name: "Voyager",
    image: "",
    styleUrl: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    description: "Voyager style from Carto",
  },
  {
    id: "positron",
    name: "Positron",
    image: "",
    styleUrl: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    description: "Positron style from Carto",
  },
  {
    id: "dark-matter",
    name: "Dark Matter",
    image: "",
    styleUrl:
      "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    description: "Dark style from Carto",
  },
  {
    id: "arcgis-hybrid",
    name: "ArcGIS Hybrid",
    image: "",
    styleUrl:
      "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json",
    description: "Hybrid Satellite style from ESRI",
  },
  {
    id: "osm",
    name: "OSM",
    image: "",
    styleUrl:
      "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/openStreetMap.json",
    description: "OSM style",
  },
] as const satisfies StyleItem[];

export type ViewState = MapLibreViewState;

export interface MapProps {
  id?: string;
  initialViewState?: Partial<ViewState>;
  onViewStateChange?: (viewState: ViewState) => void;
  onMoveEnd?: (viewState: ViewState) => void;
  data?: MapData[];
  children?: React.ReactNode;

  popupEnabled?: boolean;
  config?: {
    useGeolocateControl?: {
      position?: ControlPosition;
      enabled?: boolean;
    };
    useNavigationControl?: {
      position?: ControlPosition;
      enabled?: boolean;
    };
    useScaleControl?: {
      position?: ControlPosition;
      enabled?: boolean;
    };
    useStyleSwitcher?: {
      position?: ControlPosition;
      enabled?: boolean;
    };
  };
  onMarkerClick?: (item: MapData) => void;
  onPopupClick?: (item: MapData) => void;
}

export function Map({
  id,
  initialViewState,
  onViewStateChange,
  data,
  children,
  popupEnabled = true,
  config = {
    useGeolocateControl: {
      position: "top-left",
      enabled: true,
    },
    useNavigationControl: {
      position: "top-left",
      enabled: true,
    },
    useScaleControl: {
      position: "bottom-left",
      enabled: false,
    },
    useStyleSwitcher: {
      position: "bottom-left",
      enabled: true,
    },
  },
  onMarkerClick,
  onPopupClick,
  onMoveEnd,
}: MapProps) {
  const [mapStyle, setMapStyle] = useState<string>(mapStyles[0].styleUrl);
  const [activeStyleId, setActiveStyleId] = useState<string>(mapStyles[0].id);
  const [selectedItem, setSelectedItem] = useState<MapData | null>(null);

  const handleMarkerClick = useCallback(
    (item: MapData) => {
      setSelectedItem(item);
      onMarkerClick?.(item);
    },
    [onMarkerClick],
  );

  const handleViewStateChange = useCallback(
    (viewState: ViewState) => {
      // setViewState(viewState);
      onViewStateChange?.(viewState);
    },
    [onViewStateChange],
  );

  const handleStyleChange = (styleUrl: string) => {
    setMapStyle(styleUrl);
    const style = mapStyles.find((s) => s.styleUrl === styleUrl);

    if (style) {
      setActiveStyleId(style.id);
    }
  };

  return (
    <MapLibre
      id={id}
      initialViewState={initialViewState}
      onMove={(event) => handleViewStateChange(event.viewState)}
      onMoveEnd={(event) => onMoveEnd?.(event.viewState)}
      // style={{width: 600, height: 400}}
      mapStyle={mapStyle}
      attributionControl={{ compact: true, customAttribution: "Galileyo" }}
    >
      {data?.map((item, index) => (
        <MapMarker
          key={index}
          item={item}
          onClick={() => handleMarkerClick(item)}
        />
      ))}

      {children}

      {selectedItem && popupEnabled && (
        <Popup
          longitude={selectedItem.longitude}
          latitude={selectedItem.latitude}
          onClose={() => setSelectedItem(null)}
          closeButton={false}
          // className="text-foreground dark:text-black"
        >
          {selectedItem.alert && (
            <AlertPopup
              alert={selectedItem.alert}
              onClose={() => setSelectedItem(null)}
              onClick={() => onPopupClick?.(selectedItem)}
            />
          )}
        </Popup>
      )}

      {config.useGeolocateControl?.enabled && (
        <GeolocateControl position={config.useGeolocateControl.position} />
      )}

      {config.useNavigationControl?.enabled && (
        <NavigationControl position={config.useNavigationControl.position} />
      )}

      {config.useScaleControl?.enabled && (
        <ScaleControl position={config.useScaleControl.position} />
      )}

      {config.useStyleSwitcher?.enabled && (
        <MapGLStyleSwitcher
          styles={mapStyles}
          activeStyleId={activeStyleId}
          theme="auto"
          showLabels={true}
          showImages={false}
          position={config.useStyleSwitcher.position}
          onStyleChange={handleStyleChange}
        />
      )}
    </MapLibre>
  );
}

export { MapProvider, useMap } from "react-map-gl/maplibre";
export type { MapData };
