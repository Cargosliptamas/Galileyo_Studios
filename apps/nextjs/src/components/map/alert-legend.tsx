"use client";

import { Label } from "@galileyo/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@galileyo/ui/tooltip";

import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from "~/lib/types/alert";

export function AlertLegend() {
  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Alert Types */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Alert Types
          </h4>
          <div className="grid grid-cols-1 gap-2">
            {Object.entries(ALERT_TYPE_CONFIG).map(([type, config]) => {
              const IconComponent = config.icon;
              return (
                <div key={type} className="flex items-center space-x-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Label
                        htmlFor={`type-${type}`}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <IconComponent
                          className="h-4 w-4"
                          style={{ color: config.color }}
                        />
                        {config.label}
                      </Label>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{config.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              );
            })}
          </div>
        </div>

        {/* Severity Levels */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Severity Levels
          </h4>
          <div className="space-y-1">
            {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (
              <Tooltip key={severity}>
                <TooltipTrigger asChild>
                  <div className="flex cursor-pointer items-center space-x-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: config.color }}
                    ></div>
                    <span className="text-sm">{config.label}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Priority level: {config.priority}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Map Controls */}
        <div>
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">
            Map Controls
          </h4>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p>• Click markers to view alert details</p>
            <p>• Circles show affected areas</p>
            <p>• Use filters to customize view</p>
            <p>• Zoom and pan to explore</p>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
