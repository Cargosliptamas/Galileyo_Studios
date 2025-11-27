import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod/v4";

import { validate } from "~/app/api/helper";
import { env } from "~/env";

const WeatherTileRequest = z.object({
  type: z.enum(["clouds", "pressure", "temperature", "wind", "precipitation"]),
  params: z.array(z.string()),
});

type ValidWeatherTypes = z.infer<typeof WeatherTileRequest>["type"];

const weatherTileMap: Record<ValidWeatherTypes, string> = {
  clouds: "clouds_new",
  pressure: "pressure_new",
  temperature: "temp_new",
  wind: "wind_new",
  precipitation: "precipitation_new",
} as const;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ type: string; params?: string[] }> },
) {
  try {
    const paramsValue = await params;

    if (!env.OPENWEATHER_API_KEY) {
      return NextResponse.json({ error: "Invalid request" }, { status: 500 });
    }

    const { result: payload, error } = await validate(
      WeatherTileRequest,
      paramsValue,
    );
    if (error) {
      return NextResponse.json(
        { error: "Invalid weather layer type." },
        { status: 400 },
      );
    }

    // Extract z, x, y from the params array
    // params will be something like ["0", "0", "0.png"] or ["0", "0", "0"]
    const segments = paramsValue.params ?? [];

    if (segments.length < 3) {
      return NextResponse.json(
        { error: "Invalid tile coordinates" },
        { status: 400 },
      );
    }

    const [z, x, yWithExt] = segments;
    const y = yWithExt?.replace(/\.png$/, "") ?? "";
    const appid = env.OPENWEATHER_API_KEY;
    const type = weatherTileMap[payload.type];

    const tileUrl = `https://tile.openweathermap.org/map/${type}/${z}/${x}/${y}.png?appid=${appid}`;

    const response = await fetch(tileUrl);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch tile" },
        { status: response.status },
      );
    }

    // Get the image data
    const imageBuffer = await response.arrayBuffer();

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching weather tile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
