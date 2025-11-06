"use client";

import { Phone, PhoneOff } from "lucide-react";

import { Button } from "@galileyo/ui/button";

import { UserAvatar } from "~/components/feed/user-avatar";
import { getUserImageUrl } from "~/lib/image";
import { useCall } from "../call-provider";

export function IncomingCallDialog() {
  const { callState, rejectCall, acceptCall } = useCall();

  const isVideoCall = callState.callType === "video";

  const handleAcceptCall = () => {
    void acceptCall();
  };

  const handleRejectCall = () => {
    rejectCall();
  };

  if (!callState.isIncomingCall) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80">
      <div className="flex flex-col items-center gap-6 rounded-lg border bg-background p-8 shadow-lg">
        <div className="flex flex-col items-center gap-4">
          <UserAvatar
            name={callState.fromUserName ?? "Unknown"}
            image={getUserImageUrl(callState.fromUserPhoto)}
            isVerified={false}
            isInfluencer={false}
          />
          <div className="text-center">
            {/* <h3 className="text-lg font-semibold">{callState.fromUserName}</h3> */}
            <p className="text-sm text-muted-foreground">
              {isVideoCall ? "Incoming video call" : "Incoming voice call"}
            </p>
          </div>
        </div>
        {callState.error && (
          <p className="text-sm text-destructive">{callState.error}</p>
        )}
        <div className="flex gap-4">
          <Button
            variant="destructive"
            size="lg"
            onClick={handleRejectCall}
            className="rounded-full"
          >
            <PhoneOff className="size-5" />
          </Button>
          <Button
            variant="primary"
            size="lg"
            onClick={handleAcceptCall}
            className="rounded-full"
          >
            <Phone className="size-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
