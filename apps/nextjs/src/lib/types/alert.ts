import {
  AlertCircle,
  AlertTriangle,
  CloudRain,
  Heart,
  Shield,
  Wrench,
} from "lucide-react";

import type { Alert, AlertSeverity, AlertType } from "@galileyo/validators";

export interface AlertFilters {
  types: AlertType[];
  severities: AlertSeverity[];
  isActive: boolean;
  showInfluencers: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const ALERT_TYPE_CONFIG = {
  UNKNOWN: {
    label: "Unknown",
    color: "#6B7280",
    icon: AlertCircle,
    description: "Unknown incidents",
  },
  ACCIDENT: {
    label: "Accident",
    color: "#EF4444",
    icon: AlertCircle,
    description: "Accidents and incidents",
  },
  ACTIVESHOOTER: {
    label: "Active Shooter",
    color: "#DC2626",
    icon: AlertTriangle,
    description: "Active shooter incidents",
  },
  AVALANCHE: {
    label: "Avalanche",
    color: "#7C3AED",
    icon: AlertTriangle,
    description: "Avalanche warnings and incidents",
  },
  BIOMEDICAL: {
    label: "Biomedical",
    color: "#10B981",
    icon: Heart,
    description: "Biomedical emergencies",
  },
  CIVILUNREST: {
    label: "Civil Unrest",
    color: "#F59E0B",
    icon: AlertCircle,
    description: "Civil unrest and protests",
  },
  COMBAT: {
    label: "Combat",
    color: "#DC2626",
    icon: Shield,
    description: "Combat situations",
  },
  CONFLICT: {
    label: "Conflict",
    color: "#EF4444",
    icon: AlertTriangle,
    description: "Conflict situations",
  },
  CYBER: {
    label: "Cyber",
    color: "#8B5CF6",
    icon: Shield,
    description: "Cybersecurity incidents",
  },
  DROUGHT: {
    label: "Drought",
    color: "#F59E0B",
    icon: CloudRain,
    description: "Drought conditions",
  },
  EARTHQUAKE: {
    label: "Earthquake",
    color: "#DC2626",
    icon: AlertTriangle,
    description: "Earthquake warnings and incidents",
  },
  EQUIPMENT: {
    label: "Equipment",
    color: "#6B7280",
    icon: Wrench,
    description: "Equipment failures",
  },
  EXTREMETEMPERATURE: {
    label: "Extreme Temperature",
    color: "#EF4444",
    icon: CloudRain,
    description: "Extreme temperature warnings",
  },
  FLOOD: {
    label: "Flood",
    color: "#3B82F6",
    icon: CloudRain,
    description: "Flood warnings and incidents",
  },
  HIGHSURF: {
    label: "High Surf",
    color: "#3B82F6",
    icon: CloudRain,
    description: "High surf warnings",
  },
  HIGHWIND: {
    label: "High Wind",
    color: "#3B82F6",
    icon: CloudRain,
    description: "High wind warnings",
  },
  INCIDENT: {
    label: "Incident",
    color: "#F59E0B",
    icon: AlertCircle,
    description: "General incidents",
  },
  LANDSLIDE: {
    label: "Landslide",
    color: "#EF4444",
    icon: AlertTriangle,
    description: "Landslide warnings",
  },
  MANMADE: {
    label: "Man-Made",
    color: "#6B7280",
    icon: Wrench,
    description: "Man-made incidents",
  },
  MARINE: {
    label: "Marine",
    color: "#3B82F6",
    icon: CloudRain,
    description: "Marine incidents",
  },
  OCCURRENCE: {
    label: "Occurrence",
    color: "#64748B",
    icon: AlertCircle,
    description: "General occurrences",
  },
  POLITICALCONFLICT: {
    label: "Political Conflict",
    color: "#EF4444",
    icon: AlertTriangle,
    description: "Political conflicts",
  },
  SEVEREWEATHER: {
    label: "Severe Weather",
    color: "#3B82F6",
    icon: CloudRain,
    description: "Severe weather warnings",
  },
  STORM: {
    label: "Storm",
    color: "#3B82F6",
    icon: CloudRain,
    description: "Storm warnings",
  },
  TERRORISM: {
    label: "Terrorism",
    color: "#DC2626",
    icon: Shield,
    description: "Terrorism incidents",
  },
  TORNADO: {
    label: "Tornado",
    color: "#DC2626",
    icon: AlertTriangle,
    description: "Tornado warnings",
  },
  CYCLONE: {
    label: "Tropical Cyclone",
    color: "#3B82F6",
    icon: CloudRain,
    description: "Tropical cyclone warnings",
  },
  TSUNAMI: {
    label: "Tsunami",
    color: "#3B82F6",
    icon: AlertTriangle,
    description: "Tsunami warnings",
  },
  UNIT: {
    label: "Unit",
    color: "#6B7280",
    icon: AlertCircle,
    description: "Unit incidents",
  },
  VOLCANO: {
    label: "Volcanic Eruption",
    color: "#DC2626",
    icon: AlertTriangle,
    description: "Volcanic eruption warnings",
  },
  WEAPONS: {
    label: "Weapons",
    color: "#DC2626",
    icon: Shield,
    description: "Weapons incidents",
  },
  WILDFIRE: {
    label: "Wildfire",
    color: "#EF4444",
    icon: AlertTriangle,
    description: "Wildfire warnings",
  },
  WINTERSTORM: {
    label: "Winter Storm",
    color: "#3B82F6",
    icon: CloudRain,
    description: "Winter storm warnings",
  },
} as const;

export const SEVERITY_CONFIG = {
  information: {
    label: "Information",
    color: "#6B7280",
    priority: 0,
  },
  low: {
    label: "Low",
    color: "#10B981",
    priority: 1,
  },
  medium: {
    label: "Medium",
    color: "#F59E0B",
    priority: 2,
  },
  high: {
    label: "High",
    color: "#EF4444",
    priority: 3,
  },
  critical: {
    label: "Critical",
    color: "#DC2626",
    priority: 4,
  },
} as const;

export type { Alert, AlertType, AlertSeverity };
