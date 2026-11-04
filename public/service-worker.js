const CACHE_NAME = "verfiai-pwa-v1";
const PAGE_CACHE_NAME = "verfiai-pages-v1";
const OFFLINE_URL = "/offline.html";
const PRECACHE_URLS = [
  OFFLINE_URL,
  "/icons/verfiai-192.png",
  "/icons/verfiai-512.png",
  "/icons/verfiai-maskable-512.png",
  "/icons/apple-touch-icon.png",
];
const PRIVATE_PATH = /^\/(?:account(?:\/|$)|admin(?:\/|$)|app(?:\/|$)|auth(?:\/|$)|checkout(?:\/|$)|r(?:\/|$)|reports?(?:\/|$))/;
const SERVER_PATH = /^\/(?:api|_server|_tanstack|__server)(?:\/|$)/;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith("verfiai-pwa-") && key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => caches.delete(PAGE_CACHE_NAME))
      .then(() => caches.open(PAGE_CACHE_NAME))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (request.headers.has("authorization") || SERVER_PATH.test(url.pathname)) return;

  const isRemoteFont =
    url.origin === "https://fonts.gstatic.com" &&
    request.destination === "font" &&
    /\.(?:woff2?|ttf|otf)$/i.test(url.pathname);
  if (isRemoteFont) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    if (PRIVATE_PATH.test(url.pathname)) return;
    event.respondWith(networkFirstPage(request));
    return;
  }

  const isIcon = url.pathname.startsWith("/icons/");
  const isHashedBundle =
    /-[A-Za-z0-9_-]{8,}\.(?:m?js|css)$/i.test(url.pathname) ||
    (request.destination === "font" && /\.(?:woff2?|ttf|otf)$/i.test(url.pathname));

  if ((isIcon || isHashedBundle) && !url.search) {
    event.respondWith(cacheFirstStatic(request));
  }
});

async function networkFirstPage(request) {
  try {
    const response = await fetch(request);
    if (!new URL(request.url).search && isPublicPageResponse(response)) {
      try {
        const cache = await caches.open(PAGE_CACHE_NAME);
        await cache.put(request, response.clone());
      } catch (error) {
        console.error("Verfiai could not cache a public page:", error);
      }
    }
    return response;
  } catch {
    const pageCache = await caches.open(PAGE_CACHE_NAME);
    const cachedPage = await pageCache.match(request);
    if (cachedPage) return cachedPage;

    const offline = await caches.match(OFFLINE_URL);
    if (offline) return offline;

    return new Response("You are offline. Please try again when your connection returns.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

function isPublicPageResponse(response) {
  if (!response.ok || response.type !== "basic" || response.redirected) return false;
  if (!response.headers.get("content-type")?.includes("text/html")) return false;
  if (response.headers.has("set-cookie")) return false;

  const cacheControl = response.headers.get("cache-control")?.toLowerCase() ?? "";
  if (!cacheControl.includes("public") || /(?:private|no-store)/.test(cacheControl)) return false;

  const vary = response.headers.get("vary")?.toLowerCase() ?? "";
  return !vary.split(",").some((value) => ["cookie", "authorization", "*"].includes(value.trim()));
}

async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok && (response.type === "basic" || response.type === "cors")) {
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    } catch (error) {
      console.error("Verfiai could not cache a static asset:", error);
    }
  }
  return response;
}
