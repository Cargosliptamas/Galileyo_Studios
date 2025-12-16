"use client";

import { useMemo } from "react";

import type { Alert } from "@galileyo/validators";
import { cn } from "@galileyo/ui";
import { Badge } from "@galileyo/ui/badge";
import { Card, CardContent } from "@galileyo/ui/card";

import { UserAvatar } from "~/components/feed/user-avatar";
import { formatTimestamp } from "~/lib/formatter";
import { getInfluencerImageUrl } from "~/lib/image";
import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from "~/lib/types/alert";
import Interweave from "../ui/interweave";

interface AlertCardProps {
  alert: Alert;
  onAlertClick?: (alert: Alert) => void;
  showFull?: boolean;
  compact?: boolean;
}

function AlertItemHeader({
  alert,
  compact = false,
}: {
  alert: Alert;
  compact?: boolean;
}) {
  const alertConfig = useMemo(
    () => ALERT_TYPE_CONFIG[alert.type],
    [alert.type],
  );
  const IconComponent = useMemo(() => alertConfig.icon, [alertConfig.icon]);

  if (alert.is_influencer) {
    return (
      <div className="flex items-center gap-2">
        <UserAvatar
          name={alert.influencer_page?.title ?? ""}
          image={getInfluencerImageUrl(alert.influencer_page?.image) ?? ""}
          isVerified={false}
          isInfluencer={false}
          onlyAvatar={true}
          size={compact ? "xs" : "small"}
        />
        <h4
          className={cn(
            "line-clamp-1 font-semibold",
            compact ? "text-xs" : "text-sm",
          )}
        >
          {alert.influencer_page?.title ?? ""}
        </h4>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <IconComponent
        className={cn(compact ? "h-4 w-4" : "h-5 w-5")}
        style={{ color: alertConfig.color }}
      />
      <h4
        className={cn(
          "line-clamp-1 font-semibold",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {alert.title}
      </h4>
    </div>
  );
}

export function AlertCard({
  alert,
  onAlertClick,
  showFull = false,
  compact = false,
}: AlertCardProps) {
  const alertConfig = ALERT_TYPE_CONFIG[alert.type];
  const severityConfig = SEVERITY_CONFIG[alert.severity];

  return (
    <Card
      className="transform cursor-pointer border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
      onClick={() => onAlertClick?.(alert)}
    >
      <CardContent className={cn("p-4", compact && "p-2.5")}>
        <div
          className={cn("mb-2 flex flex-col gap-2", compact && "mb-1.5 gap-1")}
        >
          <AlertItemHeader alert={alert} compact={compact} />
          {!alert.is_influencer && (
            <div className="flex flex-wrap gap-1">
              <Badge
                variant="secondary"
                className={cn(compact && "px-1.5 py-0 text-[10px]")}
                style={{
                  backgroundColor: severityConfig.color,
                  color: "white",
                }}
              >
                {severityConfig.label}
              </Badge>
              <Badge
                variant="secondary"
                className={cn(compact && "px-1.5 py-0 text-[10px]")}
                style={{
                  backgroundColor: alertConfig.color,
                  color: "white",
                }}
              >
                {alertConfig.label}
              </Badge>
            </div>
          )}
        </div>

        <p
          className={cn(
            "mb-2 text-sm text-muted-foreground",
            showFull ? "line-clamp-none" : "line-clamp-2",
            compact && "mb-1 line-clamp-1 text-xs",
          )}
        >
          {showFull ? (
            <Interweave content={alert.description} />
          ) : (
            alert.description
          )}
        </p>

        <div
          className={cn(
            "flex flex-col gap-1 text-xs text-muted-foreground",
            compact && "gap-0.5 text-[10px]",
          )}
        >
          <p>
            <strong>Source:</strong> {alert.source}
          </p>
          <p>
            <strong>Time:</strong> {formatTimestamp(alert.timestamp)}
          </p>
          {alert.location.address && !compact && (
            <p>
              <strong>Location:</strong> {alert.location.address}
            </p>
          )}
        </div>

        {alert.affectedArea && alert.affectedArea.radius > 0 && !compact && (
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
}
