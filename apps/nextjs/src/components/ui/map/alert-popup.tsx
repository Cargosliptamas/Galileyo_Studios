"use client";

import { useMemo } from "react";
import { Clock, ExternalLink, MapPin, XIcon } from "lucide-react";

import type { Alert } from "@galileyo/validators";
import { Badge } from "@galileyo/ui/badge";

import { UserAvatar } from "~/components/feed/user-avatar";
import { formatTimestamp } from "~/lib/formatter";
import { getInfluencerImageUrl } from "~/lib/image";
import { ALERT_TYPE_CONFIG, SEVERITY_CONFIG } from "~/lib/types/alert";
import Interweave from "../interweave";

function AlertCloseButton({ onClose }: { onClose?: () => void }) {
  return (
    <button
      className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
      onClick={() => {
        onClose?.();
      }}
      aria-label="Close alert"
    >
      <XIcon className="h-4 w-4" />
    </button>
  );
}

function AlertFooter({ alert }: { alert: Alert }) {
  return (
    <div className="space-y-2.5 border-t border-border pt-3">
      <div className="flex items-center gap-2 text-xs">
        <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground">Source:</span>
        <span className="text-muted-foreground">{alert.source}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <Clock className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground">Time:</span>
        <span className="text-muted-foreground">
          {formatTimestamp(alert.timestamp)}
        </span>
      </div>
      {alert.location.address && (
        <div className="flex items-start gap-2 text-xs">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <span className="font-medium text-foreground">Location: </span>
            <span className="text-muted-foreground">
              {alert.location.address}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function AlertPopup({
  alert,
  onClose,
  onClick,
}: {
  alert: Alert;
  onClose?: () => void;
  onClick?: () => void;
}) {
  const alertConfig = useMemo(() => {
    return ALERT_TYPE_CONFIG[alert.type];
  }, [alert.type]);

  const severityConfig = useMemo(() => {
    return SEVERITY_CONFIG[alert.severity];
  }, [alert.severity]);

  const IconComponent = useMemo(() => {
    return alertConfig.icon;
  }, [alertConfig]);

  if (alert.is_influencer) {
    return (
      <div className="w-full max-w-sm rounded-lg border border-border bg-card shadow-sm">
        <div className="p-4">
          <div className="flex items-start gap-3 pb-4">
            <UserAvatar
              name={alert.influencer_page?.title ?? ""}
              image={getInfluencerImageUrl(alert.influencer_page?.image) ?? ""}
              isVerified={false}
              isInfluencer={false}
              size="small"
              onlyAvatar={true}
            />
            <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
              <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">
                {alert.influencer_page?.title ?? ""}
              </h3>
              <AlertCloseButton onClose={onClose} />
            </div>
          </div>

          <div
            className="cursor-pointer space-y-4 transition-opacity hover:opacity-90"
            onClick={onClick}
          >
            <div className="break-words text-sm leading-relaxed text-muted-foreground">
              <Interweave content={alert.description} />
            </div>

            <AlertFooter alert={alert} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-sm rounded-lg border border-border bg-card shadow-sm"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: alertConfig.color,
      }}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3 pb-4">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md"
            style={{
              backgroundColor: `${alertConfig.color}15`,
            }}
          >
            <IconComponent
              className="h-5 w-5"
              style={{ color: alertConfig.color }}
            />
          </div>
          <div className="flex min-w-0 flex-1 items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-card-foreground">
              {alert.title}
            </h3>
            <AlertCloseButton onClose={onClose} />
          </div>
        </div>

        {/* Content */}
        <div
          className="cursor-pointer space-y-4 transition-opacity hover:opacity-90"
          onClick={onClick}
        >
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="text-xs font-medium"
              style={{
                backgroundColor: severityConfig.color,
                color: "white",
              }}
            >
              {severityConfig.label}
            </Badge>
            <Badge
              variant="secondary"
              className="text-xs font-medium"
              style={{
                backgroundColor: alertConfig.color,
                color: "white",
              }}
            >
              {alertConfig.label}
            </Badge>
          </div>

          {/* Description */}
          <div className="max-h-[200px] overflow-y-auto">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {alert.description}
            </p>
          </div>

          {/* Footer */}
          <AlertFooter alert={alert} />
        </div>
      </div>
    </div>
  );
}
