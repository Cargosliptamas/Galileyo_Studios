"use client";

import { useState } from "react";

import { Button } from "@galileyo/ui/button";
import { Checkbox } from "@galileyo/ui/checkbox";
import { Label } from "@galileyo/ui/label";

import type { AlertFilters, AlertSeverity, AlertType } from "~/lib/types/alert";
import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from "~/lib/types/alert";

interface AlertFiltersProps {
  onFiltersChange: (filters: AlertFilters) => void;
  initialFilters?: AlertFilters;
}

export function AlertFiltersComponent({
  onFiltersChange,
  initialFilters,
}: AlertFiltersProps) {
  const [filters, setFilters] = useState<AlertFilters>(
    initialFilters ?? {
      types: Object.keys(ALERT_TYPE_CONFIG) as AlertType[],
      severities: Object.keys(SEVERITY_CONFIG) as AlertSeverity[],
      isActive: true,
      showInfluencers: true,
      showOnlyInfluencers: false,
    },
  );

  const allAlertTypes = Object.keys(ALERT_TYPE_CONFIG) as AlertType[];
  const allSeverities = Object.keys(SEVERITY_CONFIG) as AlertSeverity[];

  const handleTypeToggle = (type: AlertType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];

    const newFilters = { ...filters, types: newTypes };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSeverityToggle = (severity: AlertSeverity) => {
    const newSeverities = filters.severities.includes(severity)
      ? filters.severities.filter((s) => s !== severity)
      : [...filters.severities, severity];

    const newFilters = { ...filters, severities: newSeverities };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleActiveToggle = () => {
    const newFilters = { ...filters, isActive: !filters.isActive };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleShowInfluencersToggle = () => {
    const newFilters = {
      ...filters,
      showInfluencers: !filters.showInfluencers,
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSelectAllTypes = () => {
    const newFilters = { ...filters, types: allAlertTypes };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleDeselectAllTypes = () => {
    const newFilters = { ...filters, types: [] };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handlePresetFilter = (preset: "all" | "influencers" | "alerts") => {
    let newFilters: AlertFilters;
    switch (preset) {
      case "all":
        newFilters = {
          types: allAlertTypes,
          severities: allSeverities,
          isActive: true,
          showInfluencers: true,
          showOnlyInfluencers: false,
        };
        break;
      case "influencers":
        newFilters = {
          types: allAlertTypes, // Keep all types selected so influencers pass type check
          severities: allSeverities,
          isActive: true,
          showInfluencers: true,
          showOnlyInfluencers: true, // Only show influencers
        };
        break;
      case "alerts":
        newFilters = {
          types: allAlertTypes,
          severities: allSeverities,
          isActive: true,
          showInfluencers: false,
          showOnlyInfluencers: false,
        };
        break;
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  return (
    <div className="space-y-4">
      {/* Quick Filter Presets */}
      <div>
        <h4 className="mb-2 text-sm font-medium text-muted-foreground">
          Quick Filters
        </h4>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("all")}
            className="text-xs"
          >
            All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("influencers")}
            className="text-xs"
          >
            Influencers Only
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handlePresetFilter("alerts")}
            className="text-xs"
          >
            Alerts Only
          </Button>
        </div>
      </div>

      {/* Alert Types */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-medium text-muted-foreground">
            Alert Types
          </h4>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleSelectAllTypes}
              className="h-6 px-2 text-xs"
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDeselectAllTypes}
              className="h-6 px-2 text-xs"
            >
              Deselect All
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(ALERT_TYPE_CONFIG).map(([type, config]) => {
            const IconComponent = config.icon;
            return (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={`type-${type}`}
                  checked={filters.types.includes(type as AlertType)}
                  onCheckedChange={() => handleTypeToggle(type as AlertType)}
                />
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
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(SEVERITY_CONFIG).map(([severity, config]) => (
            <div key={severity} className="flex items-center space-x-2">
              <Checkbox
                id={`severity-${severity}`}
                checked={filters.severities.includes(severity as AlertSeverity)}
                onCheckedChange={() =>
                  handleSeverityToggle(severity as AlertSeverity)
                }
              />
              <Label
                htmlFor={`severity-${severity}`}
                className="cursor-pointer text-sm"
              >
                <span
                  className="mr-2 inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                ></span>
                {config.label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Active Status */}
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="active-only"
              checked={filters.isActive}
              onCheckedChange={handleActiveToggle}
            />
            <Label htmlFor="active-only" className="cursor-pointer text-sm">
              Show only active alerts
            </Label>
          </div>
        </div>

        {/* Show Influencers */}
        <div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="show-influencers"
              checked={filters.showInfluencers}
              onCheckedChange={handleShowInfluencersToggle}
            />
            <Label
              htmlFor="show-influencers"
              className="cursor-pointer text-sm"
            >
              Show influencers
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
