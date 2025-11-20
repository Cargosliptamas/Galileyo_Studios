"use client";

import { Badge } from "@galileyo/ui/badge";
import { Card, CardContent } from "@galileyo/ui/card";

import type { Alert } from "~/lib/types/alert";
import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from "~/lib/types/alert";

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
      low: 1,
      information: 0,
    };
    return severityOrder[b.severity] - severityOrder[a.severity];
  });

  return (
    <div className="space-y-3">
      {/* <CardHeader>
        <CardTitle>Recent Alerts ({alerts.length})</CardTitle>
      </CardHeader> */}

      {sortedAlerts.length === 0 ? (
        <div className="py-8 text-center text-muted-foreground">
          <p>No alerts match your current filters.</p>
        </div>
      ) : (
        <div className="max-h-[500px] space-y-3 overflow-y-auto">
          {sortedAlerts.map((alert) => {
            const alertConfig = ALERT_TYPE_CONFIG[alert.type];
            const severityConfig = SEVERITY_CONFIG[alert.severity];
            const IconComponent = alertConfig.icon;

            return (
              <Card
                key={alert.id}
                className="cursor-pointer transition-all hover:border-muted-foreground/50 hover:shadow-md"
                onClick={() => onAlertClick?.(alert)}
              >
                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <IconComponent
                        className="h-5 w-5"
                        style={{ color: alertConfig.color }}
                      />
                      <h4 className="text-sm font-semibold">{alert.title}</h4>
                    </div>
                    <div className="flex gap-1">
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: severityConfig.color,
                          color: "white",
                        }}
                      >
                        {severityConfig.label}
                      </Badge>
                      <Badge
                        variant="secondary"
                        style={{
                          backgroundColor: alertConfig.color,
                          color: "white",
                        }}
                      >
                        {alertConfig.label}
                      </Badge>
                    </div>
                  </div>

                  <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
                    {alert.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      <p>
                        <strong>Source:</strong> {alert.source}
                      </p>
                      <p>
                        <strong>Location:</strong>{" "}
                        {alert.location.address ??
                          `${alert.location.city}, ${alert.location.country}`}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>{new Date(alert.timestamp).toLocaleDateString()}</p>
                      <p>{new Date(alert.timestamp).toLocaleTimeString()}</p>
                    </div>
                  </div>

                  {alert.affectedArea && alert.affectedArea.radius > 0 && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: alertConfig.color }}
                        ></span>
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
