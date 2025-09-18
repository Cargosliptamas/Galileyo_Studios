import { 
  CloudRain, 
  AlertTriangle, 
  Shield, 
  Lock, 
  Wrench, 
  Heart, 
  Car, 
  AlertCircle 
} from 'lucide-react';

export type AlertType = 
  | 'weather'
  | 'natural_disaster'
  | 'cyber_attack'
  | 'security_breach'
  | 'infrastructure'
  | 'health_emergency'
  | 'traffic'
  | 'other';

export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

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
}

export interface AlertFilters {
  types: AlertType[];
  severities: AlertSeverity[];
  isActive: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export const ALERT_TYPE_CONFIG = {
  weather: {
    label: 'Weather',
    color: '#3B82F6',
    icon: CloudRain,
    description: 'Weather-related alerts including storms, floods, and extreme conditions'
  },
  natural_disaster: {
    label: 'Natural Disaster',
    color: '#EF4444',
    icon: AlertTriangle,
    description: 'Natural disasters like earthquakes, hurricanes, wildfires'
  },
  cyber_attack: {
    label: 'Cyber Attack',
    color: '#8B5CF6',
    icon: Shield,
    description: 'Cybersecurity incidents and digital threats'
  },
  security_breach: {
    label: 'Security Breach',
    color: '#F59E0B',
    icon: Lock,
    description: 'Physical security incidents and breaches'
  },
  infrastructure: {
    label: 'Infrastructure',
    color: '#6B7280',
    icon: Wrench,
    description: 'Infrastructure failures and maintenance issues'
  },
  health_emergency: {
    label: 'Health Emergency',
    color: '#10B981',
    icon: Heart,
    description: 'Public health emergencies and medical alerts'
  },
  traffic: {
    label: 'Traffic',
    color: '#F97316',
    icon: Car,
    description: 'Traffic incidents and road closures'
  },
  other: {
    label: 'Other',
    color: '#64748B',
    icon: AlertCircle,
    description: 'Other types of alerts and notifications'
  }
} as const;

export const SEVERITY_CONFIG = {
  low: {
    label: 'Low',
    color: '#10B981',
    priority: 1
  },
  medium: {
    label: 'Medium',
    color: '#F59E0B',
    priority: 2
  },
  high: {
    label: 'High',
    color: '#EF4444',
    priority: 3
  },
  critical: {
    label: 'Critical',
    color: '#DC2626',
    priority: 4
  }
} as const;
