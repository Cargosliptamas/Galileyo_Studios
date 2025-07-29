/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* @ts-ignore */

self.addEventListener("push", function (event) {
  // @ts-ignore
  if (event.data) {
    // @ts-ignore
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon ?? "/icon.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };

    // @ts-ignore
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  // @ts-ignore
  event.notification.close();
  // @ts-ignore
  event.waitUntil(clients.openWindow("<https://your-website.com>"));
});
