"use client";

import { createContext, useContext, useState } from "react";
import { Layer } from "@vis.gl/react-maplibre";
import { Source } from "react-map-gl/maplibre";

export const weatherLayers = {
  weather_clouds: {
    id: "weather_clouds_layer",
    type: "raster",
    source: "weather_clouds",
  },
  weather_pressure: {
    id: "weather_pressure_layer",
    type: "raster",
    source: "weather_pressure",
  },
  weather_temperature: {
    id: "weather_temperature_layer",
    type: "raster",
    source: "weather_temperature",
  },
  weather_wind: {
    id: "weather_wind_layer",
    type: "raster",
    source: "weather_wind",
  },
  weather_precipitation: {
    id: "weather_precipitation_layer",
    type: "raster",
    source: "weather_precipitation",
  },
} as const;

export type WeatherLayerIds = keyof typeof weatherLayers;
export const WeatherLayerIdsString = Object.keys(
  weatherLayers,
) as WeatherLayerIds[];

const WeatherLayersContext = createContext<{
  weatherLayers: Record<WeatherLayerIds, boolean>;
  toggleLayer: (layerId: WeatherLayerIds) => void;
}>({
  weatherLayers: {
    weather_clouds: false,
    weather_pressure: false,
    weather_temperature: false,
    weather_wind: false,
    weather_precipitation: false,
  },
  toggleLayer: () => {
    /* noop */
  },
});

export function useWeatherLayers() {
  const context = useContext(WeatherLayersContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error(
      "useWeatherLayers must be used within a WeatherLayersProvider",
    );
  }

  return context;
}

export function WeatherLayersProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [weatherLayersState, setWeatherLayersState] = useState({
    weather_clouds: false,
    weather_pressure: false,
    weather_temperature: false,
    weather_wind: false,
    weather_precipitation: false,
  });

  const toggleLayer = (layerId: WeatherLayerIds) => {
    setWeatherLayersState((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  };

  return (
    <WeatherLayersContext.Provider
      value={{ weatherLayers: weatherLayersState, toggleLayer }}
    >
      {children}
    </WeatherLayersContext.Provider>
  );
}

export function WeatherLayer() {
  const { weatherLayers: availableWeatherLayers } =
    useContext(WeatherLayersContext);

  return (
    <>
      {availableWeatherLayers.weather_clouds && (
        <Source
          id="weather_clouds"
          type="raster"
          tiles={["/api/weather/clouds/{z}/{x}/{y}.png"]}
        >
          <Layer {...weatherLayers.weather_clouds} />
        </Source>
      )}
      {availableWeatherLayers.weather_pressure && (
        <Source
          id="weather_pressure"
          type="raster"
          tiles={["/api/weather/pressure/{z}/{x}/{y}.png"]}
        >
          <Layer {...weatherLayers.weather_pressure} />
        </Source>
      )}
      {availableWeatherLayers.weather_temperature && (
        <Source
          id="weather_temperature"
          type="raster"
          tiles={["/api/weather/temperature/{z}/{x}/{y}.png"]}
        >
          <Layer {...weatherLayers.weather_temperature} />
        </Source>
      )}
      {availableWeatherLayers.weather_wind && (
        <Source
          id="weather_wind"
          type="raster"
          tiles={["/api/weather/wind/{z}/{x}/{y}.png"]}
        >
          <Layer {...weatherLayers.weather_wind} />
        </Source>
      )}
      {availableWeatherLayers.weather_precipitation && (
        <Source
          id="weather_precipitation"
          type="raster"
          tiles={["/api/weather/precipitation/{z}/{x}/{y}.png"]}
        >
          <Layer {...weatherLayers.weather_precipitation} />
        </Source>
      )}
    </>
  );
}
