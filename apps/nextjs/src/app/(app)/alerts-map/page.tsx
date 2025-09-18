'use client';

import { useState, useMemo, useRef } from 'react';
import { Alert, AlertFilters } from '~/lib/types/alert';
import { mockAlerts } from '~/lib/data/alerts';
import { AlertMap, AlertMapRef } from '~/components/map/alert-map';
import { AlertFiltersComponent } from '~/components/map/alert-filters';
import { AlertList } from '~/components/map/alert-list';
import { AlertLegend } from '~/components/map/alert-legend';
import { Button } from '@galileyo/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@galileyo/ui/card';

import 'leaflet/dist/leaflet.css';

export default function AlertsMapPage() {
  const mapRef = useRef<AlertMapRef>(null);
  
  const [filters, setFilters] = useState<AlertFilters>({
    types: Object.keys({
      weather: 'Weather',
      natural_disaster: 'Natural Disaster',
      cyber_attack: 'Cyber Attack',
      security_breach: 'Security Breach',
      infrastructure: 'Infrastructure',
      health_emergency: 'Health Emergency',
      traffic: 'Traffic',
      other: 'Other'
    }) as any[],
    severities: ['low', 'medium', 'high', 'critical'],
    isActive: true,
  });
  
  const [showFilters, setShowFilters] = useState(true);
  const [showList, setShowList] = useState(true);
  const [showLegend, setShowLegend] = useState(true);

  // Filter alerts based on current filters
  const filteredAlerts = useMemo(() => {
    return mockAlerts.filter(alert => {
      // Check if alert type is in selected types
      if (!filters.types.includes(alert.type)) return false;
      
      // Check if alert severity is in selected severities
      if (!filters.severities.includes(alert.severity)) return false;
      
      // Check if alert is active (if filter is enabled)
      if (filters.isActive && !alert.isActive) return false;
      
      return true;
    });
  }, [filters]);

  const handleAlertClick = (alert: Alert) => {
    // Pan the map to the alert location
    if (mapRef.current) {
      mapRef.current.panToAlert(alert);
    }
  };

  const handleFiltersChange = (newFilters: AlertFilters) => {
    setFilters(newFilters);
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold">Alerts Map</h1>
              <p className="text-sm text-muted-foreground">
                Real-time alerts and incidents across the region
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowList(!showList)}
              >
                {showList ? 'Hide List' : 'Show List'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
              >
                {showLegend ? 'Hide Legend' : 'Show Legend'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="lg:col-span-1">
              <AlertFiltersComponent
                onFiltersChange={handleFiltersChange}
                initialFilters={filters}
              />
            </div>
          )}

          {/* Map and List */}
          <div className={`${showFilters ? 'lg:col-span-3' : 'lg:col-span-4'} grid grid-cols-1 lg:grid-cols-6 gap-6`}>
            {/* <div className="space-y-6"> */}
              {/* Map */}
              <Card className="lg:col-span-4">
                <CardHeader>
                  <CardTitle>Interactive Map</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredAlerts.length} alerts
                  </p>
                </CardHeader>
                <CardContent>
                  <AlertMap
                    ref={mapRef}
                    alerts={filteredAlerts}
                    onAlertClick={handleAlertClick}
                    showAffectedAreas={true}
                  />
                </CardContent>
              </Card>

              {/* Legend Sidebar */}
              {showLegend && (
                <div className="lg:col-span-2">
                  <AlertLegend />
                </div>
              )}
            {/* </div> */}
          </div>
        </div>
      </div>

      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alert List */}
        {showList && (
          <Card>
            <CardContent className="p-4">
              <AlertList
                alerts={filteredAlerts}
                onAlertClick={handleAlertClick}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
