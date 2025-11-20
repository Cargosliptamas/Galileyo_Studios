import nlp from "compromise";
import { Hono } from "hono";
import OpenAI from "openai";
import { z } from "zod/v4";

import { env } from "../env.js";
import { validate } from "../helpers/validator.js";

const location = new Hono();

const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
});

async function geocodeWithNominatim(place: string) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", place);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("limit", "5");

  const response = await fetch(url, {});

  const data = (await response.json()) as {
    lat: string;
    lon: string;
    importance: number;
  }[];

  if (!data.length) {
    return null;
  }

  let bestMatch = data[0];
  for (const match of data) {
    if (match.importance > bestMatch.importance) {
      bestMatch = match;
    }
  }

  return {
    latitude: parseFloat(bestMatch.lat),
    longitude: parseFloat(bestMatch.lon),
    source: "nominatim",
  };
}

async function geocodeWithOpenAI(place: string) {
  const prompt = `
      Return ONLY valid lat/lon numbers (no text), as JSON.
      Location: "${place}"

      Format example:
      {"lat": 40.7128, "lon": -74.0060}
    `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const json = JSON.parse(
      completion.choices[0].message.content?.trim() ?? "",
    ) as { lat: number; lon: number };

    return {
      latitude: json.lat,
      longitude: json.lon,
      source: "openai-fallback",
    };
  } catch (e) {
    console.error("OpenAI parsing error:", e);
    return null;
  }
}

async function getPlacesFromOpenAI(text: string) {
  const prompt = `
      You are a helpful assistant that extracts place names from text.
      Return ONLY valid place names, as an array of strings.
      If no place names are found, return an empty array.
      If there is a typo, correct it.
      Text: "${text}"

      Format example:
      ["New York", "Los Angeles", "Chicago"]
    `;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  try {
    const json = JSON.parse(
      completion.choices[0].message.content?.trim() ?? "",
    ) as string[];

    return json;
  } catch (e) {
    console.error("OpenAI parsing error:");
    console.error(e);
    return null;
  }
}

async function extractLocations(text: string) {
  const doc = nlp(text);
  //
  const placesArray = doc.places().out("array") as string[];
  const places = [...new Set(placesArray)];

  const results: {
    latitude: number;
    longitude: number;
    source: string;
  }[] = [];

  const getCoordinates = async (place: string) => {
    let coords = await geocodeWithNominatim(place);

    coords ??= await geocodeWithOpenAI(place);

    return coords;
  };

  for (const place of places) {
    const coords = await getCoordinates(place);

    if (coords) {
      results.push(coords);
    }
  }

  if (!places.length) {
    const openaiPlaces = await getPlacesFromOpenAI(text);
    if (openaiPlaces) {
      for (const place of openaiPlaces) {
        const coords = await getCoordinates(place);

        if (coords) {
          results.push(coords);
        }
      }
    }
  }

  return results;
}

const LocationFromTextRequest = z.object({
  text: z.string(),
});

location.post(
  "/from-text",
  validate("json", LocationFromTextRequest),
  async (c) => {
    const { text } = c.req.valid("json");

    const result = await extractLocations(text);

    return c.json(result);
  },
);

export default location;
