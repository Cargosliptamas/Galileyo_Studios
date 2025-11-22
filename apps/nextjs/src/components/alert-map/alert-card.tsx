"use client";

import { useMemo } from "react";

import type { Alert } from "@galileyo/validators";
import { Badge } from "@galileyo/ui/badge";
import { Card, CardContent } from "@galileyo/ui/card";

import { UserAvatar } from "~/components/feed/user-avatar";
import { formatTimestamp } from "~/lib/formatter";
import { getInfluencerImageUrl } from "~/lib/image";
import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from "~/lib/types/alert";

interface AlertCardProps {
  alert: Alert;
  onAlertClick?: (alert: Alert) => void;
}

function AlertItemHeader({ alert }: { alert: Alert }) {
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
        />
        <h4 className="text-sm font-semibold">
          {alert.influencer_page?.title ?? ""}
        </h4>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <IconComponent className="h-5 w-5" style={{ color: alertConfig.color }} />
      <h4 className="text-sm font-semibold">{alert.title}</h4>
    </div>
  );
}

export function AlertCard({ alert, onAlertClick }: AlertCardProps) {
  const alertConfig = ALERT_TYPE_CONFIG[alert.type];
  const severityConfig = SEVERITY_CONFIG[alert.severity];

  return (
    <Card
      className="transform cursor-pointer border-slate-200 bg-white/50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-slate-600"
      onClick={() => onAlertClick?.(alert)}
    >
      <CardContent className="p-4">
        <div className="mb-2 flex flex-col gap-2">
          <AlertItemHeader alert={alert} />
          {!alert.is_influencer && (
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
          )}
        </div>

        <p className="mb-2 line-clamp-2 text-sm text-muted-foreground">
          {alert.description}
        </p>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <p>
            <strong>Source:</strong> {alert.source}
          </p>
          <p>
            <strong>Time:</strong> {formatTimestamp(alert.timestamp)}
          </p>
          {alert.location.address && (
            <p>
              <strong>Location:</strong> {alert.location.address}
            </p>
          )}
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
}
