"use client";

import { createContext, useContext, useEffect, useState } from "react";

import {
  sendNotification,
  subscribeUser,
  unsubscribeUser,
} from "~/app/actions";
import { env } from "~/env";

export const PushNotificationContext = createContext<{
  isSupported: boolean;
  subscription: PushSubscription | null;
  subscribeToPush: () => Promise<void>;
  unsubscribeFromPush: () => Promise<void>;
  sendPushNotification: (message: string) => Promise<void>;
}>({
  isSupported: false,
  subscription: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  subscribeToPush: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  unsubscribeFromPush: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  sendPushNotification: async () => {},
});

export function usePushNotification() {
  const context = useContext(PushNotificationContext);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!context) {
    throw new Error(
      "usePushNotification must be used within a PushNotificationProvider",
    );
  }

  return context;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function PushNotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null,
  );

  async function registerServiceWorker() {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
      updateViaCache: "none",
    });
    const sub = await registration.pushManager.getSubscription();
    setSubscription(sub);
  }

  async function subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      ),
    });
    setSubscription(sub);

    const serializedSub = JSON.parse(
      JSON.stringify(sub),
    ) as unknown as PushSubscription;
    await subscribeUser(serializedSub);

    await sendNotification("Thank you for subscribing to push notifications!");
  }

  async function unsubscribeFromPush() {
    await subscription?.unsubscribe();
    setSubscription(null);
    await unsubscribeUser();
  }

  async function sendPushNotification(message: string) {
    if (subscription) {
      await sendNotification(message);
    }
  }

  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      setIsSupported(true);
      void registerServiceWorker();
    }
  }, []);

  return (
    <PushNotificationContext.Provider
      value={{
        isSupported,
        subscription,
        subscribeToPush,
        unsubscribeFromPush,
        sendPushNotification,
      }}
    >
      {children}
    </PushNotificationContext.Provider>
  );
}
