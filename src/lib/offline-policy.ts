/** Public tool documents only; never research, account, OAuth or server responses. */
export function cacheToolNavigation({ request, url, sameOrigin }: { request: Request; url: URL; sameOrigin: boolean }) {
  return sameOrigin && request.method === "GET" && request.mode === "navigate" &&
    !request.headers.has("authorization") && !url.search && /^\/tools(?:\/|$)/.test(url.pathname);
}

export function cacheBuiltAsset({ request, url, sameOrigin }: { request: Request; url: URL; sameOrigin: boolean }) {
  return sameOrigin && request.method === "GET" && !request.headers.has("authorization") &&
    !url.search && /^\/assets\/.+-[A-Za-z0-9_-]{8,}\.(?:m?js|css|woff2?)$/.test(url.pathname);
}

export const offlineWorkbox = {
  globDirectory: "dist/client",
  globPatterns: ["offline.html", "icons/*.png"],
  navigateFallback: null,
  cleanupOutdatedCaches: true,
  skipWaiting: true,
  clientsClaim: true,
  runtimeCaching: [
    {
      urlPattern: cacheToolNavigation,
      handler: "NetworkFirst" as const,
      options: {
        cacheName: "verfiai-tools-documents-v2",
        // Tool HTML is fetched without a session, including when the visitor is signed in.
        fetchOptions: { credentials: "omit" as const, redirect: "error" as const },
        // Workbox ignores fetchOptions for navigate-mode requests. Convert the
        // fetch itself to a credential-free request; the cache key stays the URL.
        plugins: [{
          requestWillFetch: async ({ request }: { request: Request }) => new Request(request.url, {
            method: "GET", mode: "same-origin", credentials: "omit", redirect: "error",
            cache: "no-cache",
          }),
        }],
        cacheableResponse: { statuses: [200] },
        expiration: { maxEntries: 60, maxAgeSeconds: 86400 },
      },
    },
    {
      urlPattern: cacheBuiltAsset,
      handler: "CacheFirst" as const,
      options: {
        cacheName: "verfiai-tools-assets-v2",
        cacheableResponse: { statuses: [200] },
        expiration: { maxEntries: 200, maxAgeSeconds: 604800 },
      },
    },
  ],
};