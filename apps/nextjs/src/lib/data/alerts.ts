import { Alert, AlertType, AlertSeverity } from '~/lib/types/alert';

// Mock data for demonstration - in a real app, this would come from an API
export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Severe Thunderstorm Warning',
    description: 'Heavy rain and strong winds expected in the downtown area. Avoid outdoor activities.',
    type: 'weather',
    severity: 'high',
    location: {
      latitude: 33.4484,
      longitude: -112.0740,
      address: 'Phoenix, AZ',
      city: 'Phoenix',
      country: 'USA'
    },
    timestamp: new Date().toISOString(),
    source: 'National Weather Service',
    isActive: true,
    affectedArea: {
      radius: 15
    },
    metadata: {
      windSpeed: 45,
      temperature: 22,
      humidity: 85
    }
  },
  {
    id: '2',
    title: 'Cybersecurity Incident Detected',
    description: 'Suspicious network activity detected in financial district. Enhanced monitoring in place.',
    type: 'cyber_attack',
    severity: 'medium',
    location: {
      latitude: 27.9506,
      longitude: -82.4572,
      address: 'Tampa, FL',
      city: 'Tampa',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: 'Cybersecurity Agency',
    isActive: true,
    metadata: {
      affectedSystems: ['Banking', 'Trading Systems']
    }
  },
  {
    id: '3',
    title: 'Traffic Accident on Highway',
    description: 'Multi-vehicle accident causing delays on I-95 North. Expect 30-minute delays.',
    type: 'traffic',
    severity: 'medium',
    location: {
      latitude: 30.2672,
      longitude: -97.7431,
      address: 'Austin, TX',
      city: 'Austin',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    source: 'NYC Traffic Authority',
    isActive: true,
    metadata: {
      casualties: 2,
      damage: 'Minor injuries reported'
    }
  },
  {
    id: '4',
    title: 'Wildfire Alert',
    description: 'Wildfire spreading rapidly in forest area. Evacuation orders issued for nearby communities.',
    type: 'natural_disaster',
    severity: 'critical',
    location: {
      latitude: 45.5152,
      longitude: -122.6784,
      address: 'Portland, OR',
      city: 'Portland',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    source: 'California Fire Department',
    isActive: true,
    affectedArea: {
      radius: 25
    },
    metadata: {
      casualties: 0,
      damage: 'Multiple structures threatened'
    }
  },
  {
    id: '5',
    title: 'Power Grid Failure',
    description: 'Major power outage affecting downtown area. Estimated restoration time: 3 hours.',
    type: 'infrastructure',
    severity: 'high',
    location: {
      latitude: 32.7767,
      longitude: -96.7970,
      address: 'Dallas, TX',
      city: 'Dallas',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    source: 'Chicago Electric Company',
    isActive: true,
    affectedArea: {
      radius: 10
    },
    metadata: {
      affectedSystems: ['Power Grid', 'Traffic Lights', 'Public Transportation']
    }
  },
  {
    id: '6',
    title: 'Public Health Advisory',
    description: 'Air quality alert due to industrial emissions. Sensitive individuals should stay indoors.',
    type: 'health_emergency',
    severity: 'medium',
    location: {
      latitude: 40.7128,
      longitude: -74.0060,
      address: 'New York, NY',
      city: 'New York',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: 'Texas Health Department',
    isActive: true,
    affectedArea: {
      radius: 20
    },
    metadata: {
      temperature: 28,
      humidity: 70
    }
  },
  {
    id: '7',
    title: 'Severe Thunderstorm Warning',
    description: 'Severe thunderstorms expected with damaging winds and hail.',
    type: 'weather',
    severity: 'high',
    location: {
      latitude: 47.6062,
      longitude: -122.3321,
      address: 'Seattle, WA',
      city: 'Seattle',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: 'National Weather Service',
    isActive: true,
    affectedArea: {
      radius: 30
    },
    metadata: {
      windSpeed: 80,
      hailSize: '2cm'
    }
  },
  {
    id: '8',
    title: 'Cyber Attack Detected',
    description: 'Suspicious network activity detected in city infrastructure.',
    type: 'cyber_attack',
    severity: 'medium',
    location: {
      latitude: 25.7617,
      longitude: -80.1918,
      address: 'Miami, FL',
      city: 'Miami',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: 'City IT Department',
    isActive: false,
    affectedArea: {
      radius: 0
    },
    metadata: {
      affectedSystems: ['Traffic Control', 'Water Supply']
    }
  },
  {
    id: '9',
    title: 'Flood Watch',
    description: 'Heavy rainfall may cause flooding in low-lying areas.',
    type: 'natural_disaster',
    severity: 'medium',
    location: {
      latitude: 33.7490,
      longitude: -84.3880,
      address: 'Atlanta, GA',
      city: 'Atlanta',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    source: 'NOAA',
    isActive: true,
    affectedArea: {
      radius: 15
    },
    metadata: {
      rainfall: '50mm'
    }
  },
  {
    id: '10',
    title: 'Security Breach at Airport',
    description: 'Unauthorized access detected in restricted area.',
    type: 'security_breach',
    severity: 'high',
    location: {
      latitude: 39.9526,
      longitude: -75.1652,
      address: 'Philadelphia, PA',
      city: 'Philadelphia',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    source: 'Airport Security',
    isActive: false,
    affectedArea: {
      radius: 1
    },
    metadata: {
      breachType: 'Physical',
      response: 'Evacuation'
    }
  },
  {
    id: '11',
    title: 'Bridge Closure',
    description: 'Bridge closed due to structural concerns.',
    type: 'infrastructure',
    severity: 'medium',
    location: {
      latitude: 42.3601,
      longitude: -71.0589,
      address: 'Boston, MA',
      city: 'Boston',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    source: 'City Engineering',
    isActive: true,
    affectedArea: {
      radius: 2
    },
    metadata: {
      bridge: 'Golden Gate',
      detour: 'US-101'
    }
  },
  {
    id: '12',
    title: 'Heat Advisory',
    description: 'High temperatures expected. Stay hydrated.',
    type: 'health_emergency',
    severity: 'low',
    location: {
      latitude: 36.1627,
      longitude: -86.7816,
      address: 'Nashville, TN',
      city: 'Nashville',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    source: 'Tennessee Health Dept',
    isActive: false,
    affectedArea: {
      radius: 25
    },
    metadata: {
      temperature: 35,
      humidity: 60
    }
  },
  {
    id: '13',
    title: 'Major Traffic Accident',
    description: 'Multi-vehicle accident causing major delays.',
    type: 'traffic',
    severity: 'high',
    location: {
      latitude: 41.8781,
      longitude: -87.6298,
      address: 'Chicago, IL',
      city: 'Chicago',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    source: 'Miami Police',
    isActive: true,
    affectedArea: {
      radius: 3
    },
    metadata: {
      vehiclesInvolved: 5,
      injuries: 2
    }
  },
  {
    id: '14',
    title: 'Gas Leak Reported',
    description: 'Evacuations underway due to gas leak.',
    type: 'infrastructure',
    severity: 'critical',
    location: {
      latitude: 38.9072,
      longitude: -77.0369,
      address: 'Washington, DC',
      city: 'Washington',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    source: 'Philadelphia Fire Dept',
    isActive: true,
    affectedArea: {
      radius: 1
    },
    metadata: {
      evacuationZone: 'Block 1200-1300'
    }
  },
  {
    id: '15',
    title: 'Tornado Watch',
    description: 'Conditions are favorable for tornadoes.',
    type: 'weather',
    severity: 'critical',
    location: {
      latitude: 35.4676,
      longitude: -97.5164,
      address: 'Oklahoma City, OK',
      city: 'Oklahoma City',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    source: 'NOAA',
    isActive: false,
    affectedArea: {
      radius: 40
    },
    metadata: {
      tornadoRisk: 'High'
    }
  },
  {
    id: '16',
    title: 'Water Contamination Alert',
    description: 'Boil water advisory in effect.',
    type: 'health_emergency',
    severity: 'high',
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'San Francisco, CA',
      city: 'San Francisco',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    source: 'Boston Water Authority',
    isActive: true,
    affectedArea: {
      radius: 8
    },
    metadata: {
      contaminant: 'E. coli'
    }
  },
  {
    id: '17',
    title: 'Wildfire Contained',
    description: 'Wildfire has been contained, monitoring continues.',
    type: 'natural_disaster',
    severity: 'medium',
    location: {
      latitude: 34.0522,
      longitude: -118.2437,
      address: 'Los Angeles, CA',
      city: 'Los Angeles',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    source: 'Cal Fire',
    isActive: false,
    affectedArea: {
      radius: 12
    },
    metadata: {
      areaBurned: '200 acres'
    }
  },
  {
    id: '18',
    title: 'Suspicious Package',
    description: 'Police investigating suspicious package at train station.',
    type: 'security_breach',
    severity: 'medium',
    location: {
      latitude: 39.7392,
      longitude: -104.9903,
      address: 'Denver, CO',
      city: 'Denver',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: 'Seattle Police',
    isActive: true,
    affectedArea: {
      radius: 0.5
    },
    metadata: {
      evacuation: true
    }
  },
  {
    id: '19',
    title: 'Network Outage',
    description: 'Internet connectivity lost in several neighborhoods.',
    type: 'infrastructure',
    severity: 'medium',
    location: {
      latitude: 29.7604,
      longitude: -95.3698,
      address: 'Houston, TX',
      city: 'Houston',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: 'Portland ISP',
    isActive: false,
    affectedArea: {
      radius: 6
    },
    metadata: {
      affectedNeighborhoods: ['Downtown', 'Pearl District']
    }
  },
  {
    id: '20',
    title: 'Hazardous Material Spill',
    description: 'Chemical spill reported on highway.',
    type: 'other',
    severity: 'high',
    location: {
      latitude: 39.7684,
      longitude: -86.1581,
      address: 'Indianapolis, IN',
      city: 'Indianapolis',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    source: 'Indiana State Police',
    isActive: true,
    affectedArea: {
      radius: 2
    },
    metadata: {
      chemical: 'Ammonia'
    }
  },
  {
    id: '21',
    title: 'Amber Alert',
    description: 'Child abduction reported, vehicle last seen heading north.',
    type: 'other',
    severity: 'critical',
    location: {
      latitude: 44.9778,
      longitude: -93.2650,
      address: 'Minneapolis, MN',
      city: 'Minneapolis',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    source: 'Minneapolis Police',
    isActive: true,
    affectedArea: {
      radius: 50
    },
    metadata: {
      vehicle: 'Red Honda Civic'
    }
  },
  {
    id: '22',
    title: 'Winter Storm Warning',
    description: 'Heavy snow and ice expected overnight.',
    type: 'weather',
    severity: 'high',
    location: {
      latitude: 43.0389,
      longitude: -87.9065,
      address: 'Milwaukee, WI',
      city: 'Milwaukee',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(),
    source: 'National Weather Service',
    isActive: false,
    affectedArea: {
      radius: 35
    },
    metadata: {
      snowAccumulation: '8 inches'
    }
  },
  {
    id: '23',
    title: 'Hospital System Outage',
    description: 'IT outage affecting patient records and scheduling.',
    type: 'infrastructure',
    severity: 'critical',
    location: {
      latitude: 40.4406,
      longitude: -79.9959,
      address: 'Pittsburgh, PA',
      city: 'Pittsburgh',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: 'UPMC',
    isActive: true,
    affectedArea: {
      radius: 0
    },
    metadata: {
      affectedSystems: ['EHR', 'Scheduling']
    }
  },
  {
    id: '24',
    title: 'Earthquake Aftershock',
    description: 'Minor aftershock felt in the region.',
    type: 'natural_disaster',
    severity: 'low',
    location: {
      latitude: 34.0522,
      longitude: -117.2437,
      address: 'San Bernardino, CA',
      city: 'San Bernardino',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    source: 'USGS',
    isActive: false,
    affectedArea: {
      radius: 10
    },
    metadata: {
      magnitude: 3.2
    }
  },
  {
    id: '25',
    title: 'School Lockdown',
    description: 'Precautionary lockdown due to nearby police activity.',
    type: 'security_breach',
    severity: 'medium',
    location: {
      latitude: 39.1031,
      longitude: -84.5120,
      address: 'Cincinnati, OH',
      city: 'Cincinnati',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    source: 'Cincinnati Police',
    isActive: true,
    affectedArea: {
      radius: 0.2
    },
    metadata: {
      school: 'Central High'
    }
  },
  {
    id: '26',
    title: 'Train Derailment',
    description: 'Freight train derailed, hazardous materials contained.',
    type: 'infrastructure',
    severity: 'high',
    location: {
      latitude: 41.2565,
      longitude: -95.9345,
      address: 'Omaha, NE',
      city: 'Omaha',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    source: 'Union Pacific',
    isActive: false,
    affectedArea: {
      radius: 4
    },
    metadata: {
      carsDerailed: 7
    }
  },
  {
    id: '27',
    title: 'Extreme Cold Warning',
    description: 'Wind chills below -20°C expected.',
    type: 'weather',
    severity: 'critical',
    location: {
      latitude: 46.8772,
      longitude: -96.7898,
      address: 'Fargo, ND',
      city: 'Fargo',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000).toISOString(),
    source: 'National Weather Service',
    isActive: true,
    affectedArea: {
      radius: 60
    },
    metadata: {
      windChill: -25
    }
  },
  {
    id: '28',
    title: 'Fire at Industrial Plant',
    description: 'Large fire reported, emergency crews on scene.',
    type: 'natural_disaster',
    severity: 'high',
    location: {
      latitude: 29.4241,
      longitude: -98.4936,
      address: 'San Antonio, TX',
      city: 'San Antonio',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    source: 'San Antonio Fire Dept',
    isActive: true,
    affectedArea: {
      radius: 5
    },
    metadata: {
      plant: 'Southside Industrial'
    }
  },
  {
    id: '29',
    title: 'Malware Outbreak',
    description: 'Ransomware detected in city government systems.',
    type: 'cyber_attack',
    severity: 'critical',
    location: {
      latitude: 39.9612,
      longitude: -82.9988,
      address: 'Columbus, OH',
      city: 'Columbus',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 7 * 60 * 60 * 1000).toISOString(),
    source: 'City IT Department',
    isActive: false,
    affectedArea: {
      radius: 0
    },
    metadata: {
      affectedSystems: ['Finance', 'Permitting']
    }
  },
  {
    id: '30',
    title: 'Major Road Construction',
    description: 'Expect delays due to ongoing roadwork.',
    type: 'traffic',
    severity: 'medium',
    location: {
      latitude: 36.1699,
      longitude: -115.1398,
      address: 'Las Vegas, NV',
      city: 'Las Vegas',
      country: 'USA'
    },
    timestamp: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
    source: 'Nevada DOT',
    isActive: true,
    affectedArea: {
      radius: 7
    },
    metadata: {
      project: 'I-15 Expansion'
    }
  },
];

export const getAlertsByType = (type: AlertType): Alert[] => {
  return mockAlerts.filter(alert => alert.type === type);
};

export const getAlertsBySeverity = (severity: AlertSeverity): Alert[] => {
  return mockAlerts.filter(alert => alert.severity === severity);
};

export const getActiveAlerts = (): Alert[] => {
  return mockAlerts.filter(alert => alert.isActive);
};

export const getAlertsInRadius = (
  centerLat: number,
  centerLng: number,
  radiusKm: number
): Alert[] => {
  return mockAlerts.filter(alert => {
    const distance = calculateDistance(
      centerLat,
      centerLng,
      alert.location.latitude,
      alert.location.longitude
    );
    return distance <= radiusKm;
  });
};

// Haversine formula to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
