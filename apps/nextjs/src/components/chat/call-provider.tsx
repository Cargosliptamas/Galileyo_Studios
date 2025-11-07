"use client";

import type { Instance, SignalData } from "simple-peer";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useMutation } from "@tanstack/react-query";
import { useSubscription } from "@trpc/tanstack-react-query";
import Peer from "simple-peer";

import { authClient } from "~/auth/client";
import { useTRPC } from "~/trpc/react";
import { ActiveCallDialog } from "./dialogs/active-call";
import { IncomingCallDialog } from "./dialogs/incoming-call";
import { OutgoingCallDialog } from "./dialogs/outgoing-call";

export type CallType = "video" | "voice";

export interface CallState {
  isInitiator: boolean;
  isCallActive: boolean;
  isIncomingCall: boolean;
  isOutgoingCall: boolean;
  callType: CallType | null;
  remoteUserId: number | null;
  fromUserName: string | null;
  fromUserPhoto: string | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  error: string | null;
  startTime: number | null;
}

export interface CallContextType {
  callState: CallState;
  remoteProfile: {
    name: string;
    photo: string;
  } | null;
  setCallState: (callState: CallState) => void;
  startCall: ({
    callType,
    remoteUserId,
    remoteProfile,
  }: {
    callType: CallType;
    remoteUserId: number;
    remoteProfile: { name: string; photo: string };
  }) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => void;
  endCall: () => void;
  toggleVideo: () => void;
  toggleMute: () => void;
}

const CallContext = createContext<CallContextType | null>(null);

function getUserMediaConstraints(callType: CallType): MediaStreamConstraints {
  const isVideo = callType === "video";

  const constraints: MediaStreamConstraints = {
    video: isVideo,
    audio: true,
  };

  // if (isVideo) {
  //   constraints.video = {
  //     width: { min: 1024, ideal: 1920, max: 2560 },
  //     height: { min: 576, ideal: 1080, max: 1440 },
  //   };
  // }

  return constraints;
}

export function useCall() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
}

export function CallProvider({ children }: { children: React.ReactNode }) {
  const [callState, setCallState] = useState<CallState>(() => ({
    isInitiator: false,
    isCallActive: false,
    isIncomingCall: false,
    isOutgoingCall: false,
    callType: null,
    remoteUserId: null,
    fromUserName: null,
    fromUserPhoto: null,
    localStream: null,
    remoteStream: null,
    error: null,
    startTime: null,
  }));

  const [remoteProfile, setRemoteProfile] = useState<{
    name: string;
    photo: string;
  } | null>(null);

  const peerRef = useRef<Instance | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);
  const isInitiatorRef = useRef<boolean>(false);
  const endCallRef = useRef<(() => void) | null>(null);
  const isEndingCallRef = useRef<boolean>(false);
  const [pendingSignal, setPendingSignal] = useState<{
    type: "offer" | "answer" | "ice-candidate" | "call-init" | "call-end";
    signal?: SignalData | null;
  } | null>(null);
  const trpc = useTRPC();

  const { data: session } = authClient.useSession();
  const currentUserId = session?.user.id ? Number(session.user.id) : null;

  const sendCallSignal = useMutation(
    trpc.chat.sendCallSignal.mutationOptions(),
  );

  const endCall = useCallback(() => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Destroy peer
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Send call end signal
    if (currentUserId && callState.remoteUserId && !isEndingCallRef.current) {
      isEndingCallRef.current = true;

      sendCallSignal.mutate(
        {
          type: "call-end",
          // fromUserId: currentUserId,
          toUserId: callState.remoteUserId,
          callType: callState.callType ?? "voice",
          metadata: callState.isInitiator
            ? {
                isAnswered: callState.isCallActive,
                time: callState.isCallActive
                  ? Date.now() - (callState.startTime ?? 0)
                  : 0,
              }
            : undefined,
        },
        {
          onSettled: () => {
            isEndingCallRef.current = false;
          },
        },
      );
    }

    setCallState({
      isInitiator: false,
      isCallActive: false,
      isIncomingCall: false,
      isOutgoingCall: false,
      callType: null,
      remoteUserId: null,
      fromUserName: null,
      fromUserPhoto: null,
      localStream: null,
      remoteStream: null,
      error: null,
      startTime: null,
    });
  }, [
    currentUserId,
    callState.isInitiator,
    callState.callType,
    callState.remoteUserId,
    // callState.isCallActive,
    trpc,
    sendCallSignal,
  ]);

  // Update ref whenever endCall changes
  useEffect(() => {
    endCallRef.current = endCall;
  }, [endCall]);

  // Subscribe to call signaling
  useSubscription(
    trpc.chat.onCallSignal.subscriptionOptions(undefined, {
      enabled: currentUserId !== null,
      onError(error) {
        console.error("call signal error", error);
      },
      onData: (data) => {
        handleSignal({
          ...data.data,
          toUserId: Number(data.data.toUserId),
          signal: data.data.signal,
        });
      },
    }),
  );

  const handleSignal = useCallback(
    (data: {
      type: "offer" | "answer" | "ice-candidate" | "call-init" | "call-end";
      fromUserId: number;
      toUserId: number;
      callType: CallType;
      signal?: SignalData;
      fromUserName?: string;
      fromUserPhoto?: string | null;
    }) => {
      // Ignore signals not for this call
      if (
        data.toUserId !== currentUserId &&
        data.fromUserId !== currentUserId
      ) {
        return;
      }

      if (data.type === "call-init") {
        // Incoming call
        setCallState((prev) => ({
          ...prev,
          isIncomingCall: true,
          callType: data.callType,
          remoteUserId: data.fromUserId,
          fromUserName: data.fromUserName ?? null,
          fromUserPhoto: data.fromUserPhoto ?? null,
        }));
      } else if (data.type === "call-end") {
        // Call ended
        if (endCallRef.current) {
          endCallRef.current();
        }
      } else if (peerRef.current && data.signal) {
        switch (data.type) {
          case "offer":
            peerRef.current.signal(data.signal);
            break;
          case "answer":
            setCallState((prev) => ({
              ...prev,
              startTime: Date.now(),
            }));
            peerRef.current.signal(data.signal);
            break;
          case "ice-candidate":
            peerRef.current.signal(data.signal);
            break;
          default:
            console.error("handleSignal: unknown signal type", data.type);
            break;
        }
      } else {
        setPendingSignal({
          type: data.type,
          signal: data.signal,
        });
      }
    },
    [currentUserId],
  );

  const initializePeer = useCallback(
    ({
      isInitiator,
      stream,
      callType,
      remoteUserId,
      isTrickle = false,
    }: {
      isInitiator: boolean;
      stream: MediaStream;
      callType: CallType;
      remoteUserId: number | string;
      isTrickle?: boolean;
    }) => {
      return new Promise<Instance>((resolve, reject) => {
        const peer = new Peer({
          initiator: isInitiator,
          trickle: isTrickle,
          stream: stream,
        });

        peer.on("signal", (signal: SignalData) => {
          if (!currentUserId || !remoteUserId) {
            console.error("initializePeer: no current user or remote user id");
            return;
          }

          const signalType = isInitiator ? "offer" : "answer";
          sendCallSignal.mutate({
            type: signalType,
            // fromUserId: currentUserId,
            toUserId: Number(remoteUserId),
            callType,
            signal,
          });
        });

        peer.on("stream", (remoteStream: MediaStream) => {
          if (callType === "voice") {
            const audio = new Audio();
            audio.srcObject = remoteStream;
            void audio.play();
          }
          remoteStreamRef.current = remoteStream;
          setCallState((prev) => ({
            ...prev,
            remoteStream,
            isCallActive: true,
            isIncomingCall: false,
            isOutgoingCall: false,
          }));
        });

        peer.on("error", (err) => {
          console.error("Peer error:", err);
          setCallState((prev) => ({
            ...prev,
            error: err.message,
          }));
          reject(err);
        });

        peer.on("connect", () => {
          console.log("Peer connected");
        });

        peer.on("close", () => {
          console.log("Peer closed");
          if (endCallRef.current) {
            endCallRef.current();
          }
        });

        resolve(peer);
      });
    },
    [
      currentUserId,
      callState.remoteUserId,
      callState.callType,
      trpc,
      sendCallSignal,
    ],
  );

  const startCall = useCallback(
    async ({
      callType,
      remoteUserId,
      remoteProfile,
    }: {
      callType: CallType;
      remoteUserId: number;
      remoteProfile: { name: string; photo: string };
    }) => {
      if (!currentUserId) {
        return;
      }
      // setRemoteUserId(remoteUserId);
      setRemoteProfile(remoteProfile);

      try {
        const stream = await navigator.mediaDevices.getUserMedia(
          getUserMediaConstraints(callType),
        );
        localStreamRef.current = stream;

        setCallState((prev) => ({
          ...prev,
          isInitiator: true,
          localStream: stream,
          isOutgoingCall: true,
          callType,
          remoteUserId,
          error: null,
        }));

        // Send call initiation signal
        sendCallSignal.mutate({
          type: "call-init",
          // fromUserId: currentUserId,
          toUserId: remoteUserId,
          fromUserName: session?.user.name ?? "",
          fromUserPhoto: session?.user.image ?? "",
          callType,
        });

        // Initialize peer as initiator
        isInitiatorRef.current = true;
        const peer = await initializePeer({
          isInitiator: true,
          stream,
          callType,
          remoteUserId,
        });
        peerRef.current = peer;
      } catch (error) {
        console.error("Error starting call:", error);
        setCallState((prev) => ({
          ...prev,
          error:
            error instanceof Error ? error.message : "Failed to start call",
        }));
      }
    },
    [
      currentUserId,
      initializePeer,
      trpc,
      sendCallSignal,
      session?.user.name,
      session?.user.image,
    ],
  );

  const rejectCall = useCallback(() => {
    if (!currentUserId || !callState.remoteUserId) return;

    sendCallSignal.mutate({
      type: "call-end",
      // fromUserId: currentUserId,
      toUserId: callState.remoteUserId,
      callType: callState.callType ?? "voice",
    });

    endCall();
  }, [
    currentUserId,
    callState.remoteUserId,
    callState.callType,
    sendCallSignal,
    trpc,
    endCall,
  ]);

  const acceptCall = useCallback(async () => {
    if (!currentUserId || !callState.remoteUserId || !callState.callType) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia(
        getUserMediaConstraints(callState.callType),
      );
      localStreamRef.current = stream;

      setCallState((prev) => ({
        ...prev,
        localStream: stream,
        isIncomingCall: false,
        startTime: Date.now(),
      }));

      // Initialize peer as answerer
      isInitiatorRef.current = false;
      const peer = await initializePeer({
        isInitiator: false,
        stream,
        callType: callState.callType,
        remoteUserId: callState.remoteUserId,
      });
      peerRef.current = peer;

      if (pendingSignal?.type === "offer" && pendingSignal.signal) {
        peer.signal(pendingSignal.signal);
      } else {
        console.error("Error accepting call: no pending signal");
      }
    } catch (error) {
      console.error("Error accepting call:", error);
      setCallState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Failed to accept call",
      }));
      rejectCall();
    }
  }, [
    currentUserId,
    callState.remoteUserId,
    callState.callType,
    initializePeer,
    trpc,
    endCall,
    pendingSignal,
    rejectCall,
  ]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setCallState((prev) => ({
          ...prev,
          localStream: localStreamRef.current
            ? new MediaStream(localStreamRef.current.getTracks())
            : null,
        }));
      }
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setCallState((prev) => ({
          ...prev,
          localStream: localStreamRef.current
            ? new MediaStream(localStreamRef.current.getTracks())
            : null,
        }));
      }
    }
  }, []);

  return (
    <CallContext.Provider
      value={{
        callState,
        remoteProfile,
        setCallState,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleVideo,
        toggleMute,
      }}
    >
      {children}

      <IncomingCallDialog />
      <ActiveCallDialog />
      <OutgoingCallDialog />
    </CallContext.Provider>
  );
}
