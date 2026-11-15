import { describe, expect, it } from "vitest";
import { cacheToolNavigation, cacheBuiltAsset, offlineWorkbox } from "./offline-policy";

function input(path: string, mode: RequestMode = "navigate", authorization = false) {
  const url = new URL(path, "https://verfiai.app");
  const request = { method: "GET", mode, headers: new Headers(authorization ? { authorization: "Bearer test" } : {}) } as Request;
  return { request, url, sameOrigin: url.origin === "https://verfiai.app" };
}

describe("offline cache privacy", () => {
  it("caches only query-free same-origin tool navigations without bearer headers", () => {
    expect(cacheToolNavigation(input("/tools/text-cleaner"))).toBe(true);
    expect(cacheToolNavigation(input("/tools"))).toBe(true);
    expect(cacheToolNavigation(input("/tools/text-cleaner?input=private"))).toBe(false);
    expect(cacheToolNavigation(input("/tools/text-cleaner", "navigate", true))).toBe(false);
    expect(cacheToolNavigation(input("https://example.org/tools"))).toBe(false);
    expect(cacheToolNavigation(input("/tools", "cors"))).toBe(false);
  });
  for (const path of ["/", "/admin", "/app", "/research", "/reports", "/account", "/account/usage", "/auth", "/reset-password", "/checkout/success", "/r/private-token", "/api/public/test", "/_server/test", "/~oauth"]) {
    it(`never caches ${path}`, () => {
      expect(cacheToolNavigation(input(path))).toBe(false);
      expect(cacheBuiltAsset(input(path))).toBe(false);
    });
  }
  it("only caches same-origin hashed built assets", () => {
    expect(cacheBuiltAsset(input("/assets/tool-abcdefgh.js", "cors"))).toBe(true);
    expect(cacheBuiltAsset(input("/api/private-abcdefgh.js", "cors"))).toBe(false);
    expect(cacheBuiltAsset(input("/assets/tool.js", "cors"))).toBe(false);
    expect(cacheBuiltAsset(input("https://example.org/assets/tool-abcdefgh.js", "cors"))).toBe(false);
  });
  it("fetches tool documents without cookies and limits cache age and size", () => {
    const documents = offlineWorkbox.runtimeCaching[0];
    expect(documents?.handler).toBe("NetworkFirst");
    expect(documents?.options.fetchOptions).toEqual({ credentials: "omit", redirect: "error" });
    expect(documents?.options.expiration).toEqual({ maxEntries: 60, maxAgeSeconds: 86400 });
    expect(offlineWorkbox.navigateFallback).toBeNull();
  });
  it("rebuilds navigation fetches without credentials or bearer headers", async () => {
    const plugin = offlineWorkbox.runtimeCaching[0]?.options.plugins?.[0];
    if (!plugin) throw new Error("Missing privacy plugin");
    const request = new Request("https://verfiai.app/tools/text-cleaner", {
      credentials: "include", headers: { authorization: "Bearer test" },
    });
    const safe = await plugin.requestWillFetch({ request });
    expect(safe.credentials).toBe("omit");
    expect(safe.mode).toBe("same-origin");
    expect(safe.redirect).toBe("error");
    expect(safe.headers.has("authorization")).toBe(false);
    expect(safe.url).toBe(request.url);
  });
});