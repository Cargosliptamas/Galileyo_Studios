export type AlertType =
  | "UNKNOWN"
  | "ACCIDENT"
  | "ACTIVESHOOTER"
  | "AVALANCHE"
  | "BIOMEDICAL"
  | "CIVILUNREST"
  | "COMBAT"
  | "CONFLICT"
  | "CYBER"
  | "DROUGHT"
  | "EARTHQUAKE"
  | "EQUIPMENT"
  | "EXTREMETEMPERATURE"
  | "FLOOD"
  | "HIGHSURF"
  | "HIGHWIND"
  | "INCIDENT"
  | "LANDSLIDE"
  | "MANMADE"
  | "MARINE"
  | "OCCURRENCE"
  | "POLITICALCONFLICT"
  | "SEVEREWEATHER"
  | "STORM"
  | "TERRORISM"
  | "TORNADO"
  | "CYCLONE"
  | "TSUNAMI"
  | "UNIT"
  | "VOLCANO"
  | "WEAPONS"
  | "WILDFIRE"
  | "WINTERSTORM";

export type AlertSeverity =
  | "information"
  | "low"
  | "medium"
  | "high"
  | "critical";

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: AlertType;
  severity: AlertSeverity;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
    city?: string;
    country?: string;
  };
  timestamp: string;
  source: string;
  isActive: boolean;
  affectedArea?: {
    radius: number; // in kilometers
  };
  metadata?: {
    windSpeed?: number;
    temperature?: number;
    humidity?: number;
    affectedSystems?: string[];
    casualties?: number;
    damage?: string;
    [key: string]: unknown;
  };
  is_influencer?: boolean;
}
