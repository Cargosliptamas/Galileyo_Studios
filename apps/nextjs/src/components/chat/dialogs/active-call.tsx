"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Maximize2,
  Mic,
  MicOff,
  Minimize2,
  PhoneOff,
  Video,
  VideoOff,
} from "lucide-react";

import { cn } from "@galileyo/ui";
import { Button } from "@galileyo/ui/button";

import { getUserImageUrl } from "~/lib/image";
import { useCall } from "../call-provider";

export function ActiveCallDialog() {
  const { callState, toggleVideo, toggleMute, endCall } = useCall();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const pipRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
  } | null>(null);

  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState(() => {
    if (typeof window !== "undefined") {
      return { x: window.innerWidth - 320, y: 20 };
    }
    return { x: 0, y: 20 };
  });

  const isVideoCall = callState.callType === "video";
  const isMuted = callState.localStream?.getAudioTracks()[0]?.enabled === false;
  const isVideoOff =
    callState.localStream?.getVideoTracks()[0]?.enabled === false;

  const handleEndCall = () => {
    endCall();
  };

  const handleMinimize = () => {
    setIsMinimized(true);
  };

  const handleMaximize = () => {
    setIsMinimized(false);
  };

  // Drag handlers for minimized window
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isMinimized || !pipRef.current) return;

      // Only allow dragging from the header area (not from buttons or controls)
      const target = e.target as HTMLElement;
      if (target.closest("button")) return;

      e.preventDefault();
      const rect = pipRef.current.getBoundingClientRect();
      dragRef.current = {
        isDragging: true,
        startX: e.clientX,
        startY: e.clientY,
        startLeft: rect.left,
        startTop: rect.top,
      };
    },
    [isMinimized],
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragRef.current?.isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    const newX = Math.max(
      0,
      Math.min(window.innerWidth - 280, dragRef.current.startLeft + deltaX),
    );
    const newY = Math.max(
      0,
      Math.min(window.innerHeight - 200, dragRef.current.startTop + deltaY),
    );

    setPosition({ x: newX, y: newY });
  }, []);

  const handleMouseUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  useEffect(() => {
    if (isMinimized) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isMinimized, handleMouseMove, handleMouseUp]);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && callState.localStream) {
      localVideoRef.current.srcObject = callState.localStream;
    }
  }, [callState.localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && callState.remoteStream) {
      remoteVideoRef.current.srcObject = callState.remoteStream;
    }
  }, [callState.remoteStream]);

  // Reset minimized state when call ends
  useEffect(() => {
    if (!callState.isCallActive) {
      setIsMinimized(false);
    }
  }, [callState.isCallActive]);

  if (!callState.isCallActive) {
    return null;
  }

  // Minimized PIP window
  if (isMinimized) {
    return (
      <div
        ref={pipRef}
        style={{
          position: "fixed",
          left: position.x,
          top: position.y,
          zIndex: 10000,
          width: "280px",
          // height: "180px",
        }}
        className="group flex flex-col overflow-hidden rounded-lg border-2 border-white/20 bg-black/90 shadow-2xl"
      >
        {/* Header - draggable area */}
        <div
          className="flex cursor-move items-center justify-between border-b border-white/10 bg-black/50 px-2 py-1"
          onMouseDown={handleMouseDown}
        >
          <div className="flex min-w-0 items-center gap-2">
            {callState.fromUserPhoto ? (
              <img
                src={getUserImageUrl(callState.fromUserPhoto) ?? ""}
                alt={callState.fromUserName ?? ""}
                className="size-6 flex-shrink-0 rounded-full"
              />
            ) : (
              <div className="flex size-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {callState.fromUserName?.charAt(0).toUpperCase() ?? ""}
              </div>
            )}
            <span className="truncate text-xs font-medium text-white">
              {callState.fromUserName ?? "Call"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 h-6 w-6 text-white hover:bg-white/20"
            onClick={(e) => {
              e.stopPropagation();
              handleMaximize();
            }}
          >
            <Maximize2 className="size-3" />
          </Button>
        </div>

        {/* Video/Audio content */}
        <div className="relative flex-1 bg-black">
          {isVideoCall && callState.remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              {callState.fromUserPhoto ? (
                <img
                  src={getUserImageUrl(callState.fromUserPhoto) ?? ""}
                  alt={callState.fromUserName ?? ""}
                  className="size-16 rounded-full"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {callState.fromUserName?.charAt(0).toUpperCase() ?? ""}
                </div>
              )}
            </div>
          )}

          {/* Local video overlay for video calls */}
          {isVideoCall && callState.localStream && (
            <div className="absolute bottom-2 right-2 z-[100001] h-12 w-16 overflow-hidden rounded border border-white/50 shadow-lg">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-contain"
              />
              {isVideoOff && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <VideoOff className="size-3 text-white" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Compact controls */}
        <div className="absolute bottom-0 left-0 right-0 hidden items-center justify-center gap-2 border-t border-white/10 bg-black/50 px-2 py-2 group-hover:flex">
          {isVideoCall && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                toggleVideo();
              }}
              className={cn(
                "size-8 h-8 w-8 rounded-full",
                isVideoOff && "bg-destructive/50 hover:bg-destructive/70",
              )}
            >
              {isVideoOff ? (
                <VideoOff className="size-3 text-white" />
              ) : (
                <Video className="size-3 text-white" />
              )}
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            className={cn(
              "size-8 h-8 w-8 rounded-full",
              isMuted && "bg-destructive/50 hover:bg-destructive/70",
            )}
          >
            {isMuted ? (
              <MicOff className="size-3 text-white" />
            ) : (
              <Mic className="size-3 text-white" />
            )}
          </Button>
          <Button
            variant="destructive"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEndCall();
            }}
            className="size-8 h-8 w-8 rounded-full"
          >
            <PhoneOff className="size-3" />
          </Button>
        </div>
      </div>
    );
  }

  // Maximized fullscreen view
  return (
    <div className="fixed inset-0 z-[10000] flex flex-col bg-black">
      {/* Header with minimize button */}
      <div className="absolute right-4 top-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleMinimize}
          className="size-10 rounded-full border border-white/20 bg-black/50 hover:bg-black/70"
        >
          <Minimize2 className="size-5 text-white" />
        </Button>
      </div>

      {/* Remote video/audio */}
      <div className="relative h-full w-full flex-1">
        {isVideoCall && callState.remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              {callState.fromUserPhoto ? (
                <img
                  src={getUserImageUrl(callState.fromUserPhoto) ?? ""}
                  alt={callState.fromUserName ?? ""}
                  className="size-32 rounded-full"
                />
              ) : (
                <div className="flex size-32 items-center justify-center rounded-full bg-primary text-4xl font-bold text-primary-foreground">
                  {callState.fromUserName?.charAt(0).toUpperCase() ?? ""}
                </div>
              )}
              <h3 className="text-xl font-semibold text-white">
                {callState.fromUserName ?? ""}
              </h3>
              {callState.isOutgoingCall && (
                <p className="text-sm text-muted-foreground">Calling...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Local video (picture-in-picture for video calls) */}
      {isVideoCall && callState.localStream && (
        <div className="absolute right-4 top-4 w-48 overflow-hidden rounded-lg border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover"
          />
          {isVideoOff && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <VideoOff className="size-8 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="fixed bottom-0 left-0 right-0 flex items-center justify-center gap-4 border-t bg-black/50 p-6">
        {isVideoCall && (
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleVideo}
            className={cn(
              "size-12 rounded-full",
              isVideoOff && "bg-destructive hover:bg-destructive/90",
            )}
          >
            {isVideoOff ? (
              <VideoOff className="size-5" />
            ) : (
              <Video className="size-5" />
            )}
          </Button>
        )}
        <Button
          variant="secondary"
          size="icon"
          onClick={toggleMute}
          className={cn(
            "size-12 rounded-full",
            isMuted && "bg-destructive hover:bg-destructive/90",
          )}
        >
          {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={handleEndCall}
          className="size-12 rounded-full"
        >
          <PhoneOff className="size-5" />
        </Button>
      </div>

      {/* Error message */}
      {callState.error && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 rounded-lg bg-destructive px-4 py-2 text-sm text-destructive-foreground">
          {callState.error}
        </div>
      )}
    </div>
  );
}
