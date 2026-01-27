"use client";

import { useEffect } from "react";

const BRIDGE_NAME = "GalileyoBridge" as const;

interface BridgeMessage {
  type: "session";
  loggedIn: boolean;
  userId?: string | null;
}

interface BridgeState {
  lastUserId: string | null;
  lastWasLoggedIn: boolean;
}

declare global {
  interface Window {
    __NATIVE_BRIDGE_STATE__?: BridgeState;
    __NATIVE_BRIDGE__?: boolean;
    webkit?: {
      messageHandlers?: Record<
        string,
        { postMessage(data: BridgeMessage): void }
      >;
    };
  }
}

function getBridgeState(win: Window): BridgeState {
  win.__NATIVE_BRIDGE_STATE__ ??= { lastUserId: null, lastWasLoggedIn: false };
  return win.__NATIVE_BRIDGE_STATE__;
}

interface Props {
  hasSession: boolean;
  userId?: string | null;
  isNativeUA: boolean;
}

export default function NativeBridgePing({
  hasSession,
  userId,
  isNativeUA,
}: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handler = window.webkit?.messageHandlers?.[BRIDGE_NAME] as
      | { postMessage(data: BridgeMessage): void }
      | undefined;
    const hasBridge = Boolean(handler) && window.__NATIVE_BRIDGE__ === true;

    if (!isNativeUA || !hasBridge || !handler) return;

    const state = getBridgeState(window);

    // LOGIN / USER SWITCH (send once per userId)
    if (hasSession && userId && state.lastUserId !== userId) {
      handler.postMessage({ type: "session", loggedIn: true, userId });
      state.lastUserId = userId;
      state.lastWasLoggedIn = true;
      return;
    }

    // LOGOUT (send once when transitioning from logged in → logged out)
    if (!hasSession && state.lastWasLoggedIn) {
      handler.postMessage({ type: "session", loggedIn: false, userId: null });
      state.lastWasLoggedIn = false;
      state.lastUserId = null;
    }
  }, [hasSession, userId, isNativeUA]);

  return null;
}
