/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { defaultCache } from "@serwist/turbopack/worker";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope {
    // Change this attribute's name to your `injectionPoint`.
    // `injectionPoint` is an InjectManifest option.
    // See https://serwist.pages.dev/docs/build/configuring
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    __SW_MANIFEST: (any | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  precacheOptions: {
    concurrency: 10,
    cleanupOutdatedCaches: true,
  },
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
  // fallbacks: {
  //   entries: [
  //     {
  //       url: "/~offline",
  //       matcher({ request }) {
  //         return request.destination === "document";
  //       },
  //     },
  //   ],
  // },
});

self.addEventListener("push", (event) => {
  const data = JSON.parse(event.data?.text() ?? '{ title: "" }') as {
    title: string;
    message: string;
  };

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.message,
      icon: "/icons/android-chrome-192x192.png",
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (const clientListItem of clientList) {
            if (clientListItem.focused) {
              client = clientListItem;
            }
          }
          return client?.focus();
        }
        return self.clients.openWindow("/");
      }),
  );
});

serwist.addEventListeners();
