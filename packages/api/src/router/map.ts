import type { TRPCRouterRecord } from "@trpc/server";
import openmeteo from "openmeteo";
import { z } from "zod/v4";

import { getCache } from "../lib/cache";
import { protectedProcedure } from "../trpc";

// type WeatherData = {
//   lat: number;
//   lon: number;
//   timezone: string;
//   timezone_offset: number;
//   current: {
//     dt: number;
//     sunrise: number;
//     sunset: number;
//     temp: number;
//     feels_like: number;
//     pressure: number;
//     humidity: number;
//     dew_point: number;
//     uvi: number;
//     clouds: number;
//     visibility: number;
//     wind_speed: number;
//     wind_deg: number;
//     wind_gust: number;
//     weather: {
//       id: number;
//       main: string;
//       description: string;
//       icon: string;
//     }[];
//   };
// };

export interface WeatherData {
  latitude: number;
  longitude: number;
  elevation: number;
  utcOffsetSeconds: number;
  current: {
    time: Date;
    temperature_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
    rain: number;
    snowfall: number;
  };
}

async function getWeatherData() {
  const startingLatitude = -80;
  const startingLongitude = -180;
  const endingLatitude = 80;
  const endingLongitude = 180;
  const n = 10;
  // const points = [];
  const latPoints: number[] = [];
  const lonPoints: number[] = [];

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      // points.push({
      //     lat: startingLatitude + i * (endingLatitude - startingLatitude)/n,
      //     lng: startingLongitude + j * (endingLongitude - startingLongitude)/n,
      //     val: 0
      // });
      latPoints.push(
        startingLatitude + (i * (endingLatitude - startingLatitude)) / n,
      );
      lonPoints.push(
        startingLongitude + (j * (endingLongitude - startingLongitude)) / n,
      );
    }
  }

  const params = {
    latitude: latPoints,
    longitude: lonPoints,
    models: "gfs_seamless",
    current: [
      "temperature_2m",
      "wind_speed_10m",
      "wind_direction_10m",
      "wind_gusts_10m",
      "rain",
      "snowfall",
    ],
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    temperature_unit: "fahrenheit",
  };
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await openmeteo.fetchWeatherApi(url, params);
  console.log("SENDING REQUESTS");

  const weatherData: WeatherData[] = [];

  for (const response of responses) {
    // Attributes for timezone and location
    const latitude = response.latitude();
    const longitude = response.longitude();
    const elevation = response.elevation();
    const utcOffsetSeconds = response.utcOffsetSeconds();

    const current = response.current();

    if (current) {
      // Note: The order of weather variables in the URL query and the indices below need to match!
      weatherData.push({
        latitude,
        longitude,
        elevation,
        utcOffsetSeconds,
        current: {
          time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
          temperature_2m: current.variables(0)?.value() ?? 0,
          wind_speed_10m: current.variables(1)?.value() ?? 0,
          wind_direction_10m: current.variables(2)?.value() ?? 0,
          wind_gusts_10m: current.variables(3)?.value() ?? 0,
          rain: current.variables(4)?.value() ?? 0,
          snowfall: current.variables(5)?.value() ?? 0,
        },
      });
    }
  }

  return weatherData;
}

export const mapRouter = {
  getWeather: protectedProcedure
    .input(
      z.object({
        // latitude: z.number(),
        // longitude: z.number(),
        start_date: z.string().optional().nullish(),
      }),
    )
    .query(async () => {
      const weatherData = await getCache().getOrSet({
        key: "weatherData",
        factory: async () => {
          const weatherData = await getWeatherData();
          return weatherData;
        },
        ttl: "1h",
        grace: "5h",
        graceBackoff: "5m",
      });

      return weatherData;
    }),
} satisfies TRPCRouterRecord;
