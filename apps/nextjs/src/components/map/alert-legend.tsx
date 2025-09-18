'use client';

import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from '~/lib/types/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@galileyo/ui/card';

export function AlertLegend() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Map Legend</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
      
      {/* Alert Types */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Alert Types</h4>
        <div className="grid grid-cols-1 gap-2">
          {Object.entries(ALERT_TYPE_CONFIG).map(([type, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={type} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded-full border-2 border-background shadow-sm flex items-center justify-center"
                  style={{ backgroundColor: config.color }}
                >
                  <IconComponent className="w-2.5 h-2.5 text-white" />
                </div>
                <span className="text-sm">{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Severity Levels */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Severity Levels</h4>
        <div className="space-y-1">
          {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (
            <div key={severity} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: config.color }}
              ></div>
              <span className="text-sm">{config.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map Controls */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Map Controls</h4>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click markers to view alert details</p>
          <p>• Circles show affected areas</p>
          <p>• Use filters to customize view</p>
          <p>• Zoom and pan to explore</p>
        </div>
      </div>
      </CardContent>
    </Card>
  );
}
