'use client';

import type { Alert} from '~/lib/types/alert';
import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from '~/lib/types/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@galileyo/ui/card';
import { Badge } from '@galileyo/ui/badge';

interface AlertListProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
}

export function AlertList({ alerts, onAlertClick }: AlertListProps) {
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder = {
      critical: 4,
      high: 3,
      medium: 2,
      low: 1
    };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  return (
    <div className="space-y-3">
      <CardHeader>
        <CardTitle>Recent Alerts ({alerts.length})</CardTitle>
      </CardHeader>
      
      {sortedAlerts.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No alerts match your current filters.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto">
          {sortedAlerts.map((alert) => {
            const alertConfig = ALERT_TYPE_CONFIG[alert.type];
            const severityConfig = SEVERITY_CONFIG[alert.severity];
            const IconComponent = alertConfig.icon;
            
            return (
              <Card
                key={alert.id}
                className="cursor-pointer transition-all hover:shadow-md hover:border-muted-foreground/50"
                onClick={() => onAlertClick?.(alert)}
              >
                <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" style={{ color: alertConfig.color }} />
                    <h4 className="font-semibold text-sm">{alert.title}</h4>
                  </div>
                  <div className="flex gap-1">
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: severityConfig.color, color: 'white' }}
                    >
                      {severityConfig.label}
                    </Badge>
                    <Badge
                      variant="secondary"
                      style={{ backgroundColor: alertConfig.color, color: 'white' }}
                    >
                      {alertConfig.label}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {alert.description}
                </p>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    <p><strong>Source:</strong> {alert.source}</p>
                    <p><strong>Location:</strong> {alert.location.address ?? `${alert.location.city}, ${alert.location.country}`}</p>
                  </div>
                  <div className="text-right">
                    <p>{new Date(alert.timestamp).toLocaleDateString()}</p>
                    <p>{new Date(alert.timestamp).toLocaleTimeString()}</p>
                  </div>
                </div>
                
                {alert.affectedArea && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: alertConfig.color }}></span>
                      Affected area: {alert.affectedArea.radius}km radius
                    </span>
                  </div>
                )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
