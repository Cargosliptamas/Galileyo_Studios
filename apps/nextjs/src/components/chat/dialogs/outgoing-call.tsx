"use client";

import { PhoneOff } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { useCall } from "../call-provider";

export function OutgoingCallDialog() {
  const { callState, remoteProfile, endCall } = useCall();

  const isVideoCall = callState.callType === "video";

  const onClose = () => {
    endCall();
  };

  if (!callState.isOutgoingCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50">
      <div className="flex min-w-64 flex-col gap-4 rounded-lg border bg-background p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            Call {remoteProfile?.name ?? "Unknown"}
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center">
          {isVideoCall ? (
            <div className="relative mb-4 flex h-24 w-36 items-center justify-center overflow-hidden rounded-lg border border-muted bg-white shadow-inner dark:bg-black">
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-800/80 to-neutral-900/80" />
              <svg
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-60"
                width="60"
                height="60"
                viewBox="0 0 60 60"
              >
                <circle
                  cx="30"
                  cy="30"
                  r="28"
                  stroke="#fff"
                  strokeOpacity="0.15"
                  strokeWidth="3"
                  fill="none"
                />
                <circle
                  cx="30"
                  cy="26"
                  r="10"
                  fill="#444"
                  stroke="#fff"
                  strokeOpacity="0.20"
                  strokeWidth="1"
                />
                <ellipse
                  cx="30"
                  cy="44"
                  rx="14"
                  ry="6"
                  fill="#333"
                  stroke="#fff"
                  strokeOpacity="0.10"
                  strokeWidth="1"
                />
              </svg>
              <div className="absolute left-1/2 -translate-x-1/2">
                <Avatar>
                  <AvatarImage
                    src={remoteProfile?.photo ?? ""}
                    alt={remoteProfile?.name ?? ""}
                  />
                  <AvatarFallback>
                    {remoteProfile?.name.charAt(0) ?? ""}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          ) : (
            <div className="relative mb-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-muted shadow-inner">
              <Avatar>
                <AvatarImage
                  src={remoteProfile?.photo ?? ""}
                  alt={remoteProfile?.name ?? ""}
                />
                <AvatarFallback>
                  {remoteProfile?.name.charAt(0) ?? ""}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <Button
            variant="destructive"
            onClick={onClose}
            className="flex items-center gap-2"
            disabled={!callState.isOutgoingCall}
          >
            <PhoneOff className="size-5" />
            <span>Cancel</span>
          </Button>
        </div>
        {callState.error && (
          <p className="text-center text-sm text-destructive">
            {callState.error}
          </p>
        )}
      </div>
    </div>
  );
}
