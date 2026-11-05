import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("./cache.server", () => ({
  cached: ({ compute }: { compute: () => Promise<string> }) => compute(),
  cacheKey: () => "test-page",
  CACHE_TTL: { page: () => 1000 },
}));

import { fetchArticle, normalizePublicArticleUrl } from "./page.server";

describe("public article URL validation", () => {
  it("accepts ordinary public HTTPS URLs and strips fragments", () => {
    expect(normalizePublicArticleUrl("https://example.com/article#section")).toBe(
      "https://example.com/article",
    );
    expect(normalizePublicArticleUrl("https://example.com:443/article")).toBe(
      "https://example.com/article",
    );
  });

  it.each([
    "http://example.com/",
    "javascript:alert(1)",
    "https://user:pass@example.com/",
    "https://example.com:8443/",
    "https://localhost/",
    "https://service.local/",
    "https://metadata.internal/",
    "https://host.test/",
    "https://127.0.0.1/",
    "https://10.0.0.8/",
    "https://100.64.0.1/",
    "https://169.254.169.254/",
    "https://172.16.0.1/",
    "https://192.168.1.1/",
    "https://192.0.2.1/",
    "https://198.18.0.1/",
    "https://203.0.113.1/",
    "https://[::1]/",
    "https://[::ffff:127.0.0.1]/",
  ])("rejects unsafe or unsupported URL: %s", (url) => {
    expect(normalizePublicArticleUrl(url)).toBeNull();
  });

  it("normalizes legacy numeric IPv4 spellings before rejecting them", () => {
    expect(normalizePublicArticleUrl("https://2130706433/")).toBeNull();
    expect(normalizePublicArticleUrl("https://0177.0.0.1/")).toBeNull();
  });
});

describe("URL extraction configuration fallback", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns a friendly manual-paste message when Tavily is not configured", async () => {
    vi.stubEnv("TAVILY_API_KEY", "");
    await expect(fetchArticle("https://example.com/article")).rejects.toThrow(
      "Live URL extraction requires a configured API key. You can paste the article text instead.",
    );
  });
});
