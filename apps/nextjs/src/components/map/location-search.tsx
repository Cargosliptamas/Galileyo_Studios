"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";

import { Button } from "@galileyo/ui/button";
import { Input } from "@galileyo/ui/input";
import { ScrollArea } from "@galileyo/ui/scroll-area";

import { useDebounce } from "~/hooks/use-debounce";

export interface Location {
  lat: number;
  lon: number;
  display_name: string;
  type: string;
  osm_id?: number;
  place_id?: number;
  boundingbox?: [string, string, string, string]; // [min_lat, max_lat, min_lon, max_lon]
  geojson?: {
    type: string;
    coordinates: number[][][] | number[][];
  };
}

interface LocationResponse extends Omit<Location, "lat" | "lon"> {
  lat: string;
  lon: string;
}

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  onLocationClear?: () => void;
  selectedLocation?: Location | null;
  className?: string;
}

export function LocationSearch({
  onLocationSelect,
  onLocationClear,
  selectedLocation,
  className,
}: LocationSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce the search query
  const debouncedQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    async function searchLocations(query: string) {
      if (!query || query.length < 3) return;

      setIsLoading(true);
      setError(null);

      try {
        // Using OpenStreetMap Nominatim API for geocoding with polygon data
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query,
          )}&limit=10&addressdetails=1&polygon_geojson=1&extratags=1`,
          {
            headers: {
              "User-Agent": "Galileyo Alert Map",
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to search locations");
        }

        const data = (await response.json()) as LocationResponse[];

        const locations = data.map((loc) => ({
          ...loc,
          lat: parseFloat(loc.lat),
          lon: parseFloat(loc.lon),
        }));
        setLocations(locations);
        setShowResults(true);
      } catch (err) {
        setError("Failed to search locations");
        console.error("Location search error:", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (debouncedQuery.length >= 3) {
      void searchLocations(debouncedQuery);
    } else {
      setLocations([]);
      setIsLoading(false);
      setShowResults(false);
    }
  }, [debouncedQuery]);

  const handleSelect = (location: Location) => {
    onLocationSelect(location);
    setSearchQuery("");
    setLocations([]);
    setShowResults(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            selectedLocation?.display_name ?? "Search for a location..."
          }
          className="w-full pl-10 pr-20"
        />
        {isLoading && (
          <Loader2 className="absolute right-1 top-3 h-4 w-4 animate-spin text-muted-foreground" />
        )}
        {selectedLocation && !isLoading && !searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 hover:bg-destructive/10"
            onClick={() => {
              onLocationClear?.();
              setSearchQuery("");
            }}
            title="Clear selected location"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {showResults && (
        <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover shadow-lg">
          {error && <div className="p-4 text-sm text-destructive">{error}</div>}
          {locations.length === 0 && !isLoading && !error && (
            <div className="p-4 text-center text-sm text-muted-foreground">
              No locations found.
            </div>
          )}
          {locations.length > 0 && (
            <ScrollArea className="h-[300px]">
              <div className="p-1">
                {locations.map((location, index) => (
                  <div
                    key={`${location.lat}-${location.lon}-${index}`}
                    onClick={() => handleSelect(location)}
                    className="relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-3 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
                  >
                    <MapPin className="h-4 w-4 shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {location.display_name.split(",")[0]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {location.display_name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>
      )}
    </div>
  );
}
