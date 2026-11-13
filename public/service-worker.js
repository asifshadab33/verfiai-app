// One-release cleanup at the previously deployed path. Never touch messaging caches.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil((async () => {
  try {
    const names = await caches.keys();
    await Promise.allSettled(names.filter((name) =>
      name === "verfiai-pwa-v1" || name === "verfiai-pages-v1" ||
      (/(^|-)precache-v\d+-|(^|-)runtime-|(^|-)googleAnalytics-/.test(name) && name.endsWith(self.registration.scope))
    ).map((name) => caches.delete(name)));
    await self.clients.claim();
    const clients = await self.clients.matchAll({ type: "window" });
    await Promise.allSettled(clients.map((client) => client.navigate(client.url)));
  } finally {
    await self.registration.unregister();
  }
})()));
