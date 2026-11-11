import { afterEach, describe, expect, it, vi } from "vitest";

const state = { rows: new Map<string, unknown>() };
vi.mock("./cache.server", () => ({
  cacheKey: (kind: string, parts: unknown[]) => `${kind}:${parts.join("|")}`,
  CACHE_TTL: { search: () => 86400_000 },
  cacheGet: async (key: string) => state.rows.get(key) ?? null,
  cacheSet: async (key: string, _kind: string, value: unknown) => {
    state.rows.set(key, value);
  },
  cached: async (o: { key: string; compute: () => Promise<unknown> }) => {
    if (state.rows.has(o.key)) return state.rows.get(o.key);
    const value = await o.compute();
    if (Array.isArray(value) && value.length) state.rows.set(o.key, value);
    return value;
  },
}));
import { DEFAULT_ENGINES, engineSearch } from "./search.server";

const json = (value: unknown) =>
  new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json" } });
afterEach(() => {
  state.rows.clear();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("first-wave search engines", () => {
  it("separates language-sensitive results and reuses canonical language aliases", async () => {
    const request = vi.fn(async () => json({ results: { bindings: [{ item: { value: "http://www.wikidata.org/entity/Q42" }, itemLabel: { value: "Example" } }] } }));
    vi.stubGlobal("fetch", request);
    await engineSearch("wikidata", "example", "German");
    await engineSearch("wikidata", "example", "de");
    expect(request).toHaveBeenCalledTimes(1);
    await engineSearch("wikidata", "example", "ar");
    expect(request).toHaveBeenCalledTimes(2);
  });
  it("runs Wikidata in the default cascade and the Google Fact Check engine is registered", () => {
    expect(DEFAULT_ENGINES).toContain("wikidata");
    expect(DEFAULT_ENGINES).toContain("google-factcheck");
  });

  it("maps Wikidata SPARQL bindings to the standard source shape and deduplicates", async () => {
    const request = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toContain("https://query.wikidata.org/sparql");
      expect(url).toContain("format=json");
      expect(new Headers(init?.headers).get("User-Agent")).toContain("mailto:hello@verfiai.app");
      expect(decodeURIComponent(url)).toContain("mwapi:language \u0022en\u0022");
      return json({
        results: {
          bindings: [
            {
              item: { value: "http://www.wikidata.org/entity/Q42" },
              itemLabel: { value: "Douglas Adams" },
              itemDescription: { value: "English writer and humorist" },
            },
            {
              item: { value: "http://www.wikidata.org/entity/Q42" },
              itemLabel: { value: "Douglas Adams" },
              itemDescription: { value: "duplicate row" },
            },
            { item: { value: "https://example.org/not-an-entity" }, itemLabel: { value: "Skip" } },
          ],
        },
      });
    });
    vi.stubGlobal("fetch", request);
    const rows = await engineSearch("wikidata", "Douglas Adams");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      title: "Douglas Adams",
      url: "https://www.wikidata.org/wiki/Q42",
      content: "Wikidata structured reference: Douglas Adams — English writer and humorist",
      score: 0.5,
    });
    // Cached second call: no additional upstream request.
    await engineSearch("wikidata", "Douglas Adams");
    expect(request).toHaveBeenCalledTimes(1);
  });

  it("treats a Wikidata failure as an empty result without rejecting", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 500 })),
    );
    await expect(engineSearch("wikidata", "query")).resolves.toEqual([]);
  });

  it("skips the Google Fact Check engine silently when no key is configured", async () => {
    vi.stubEnv("GOOGLE_FACT_CHECK_API_KEY", "");
    vi.stubEnv("GOOGLE_FACTCHECK_API_KEY", "");
    const request = vi.fn();
    vi.stubGlobal("fetch", request);
    await expect(engineSearch("google-factcheck", "vaccine claim")).resolves.toEqual([]);
    expect(request).not.toHaveBeenCalled();
  });

  it("maps Google Fact Check ClaimReview results to the source shape with the strongest claim signal", async () => {
    vi.stubEnv("GOOGLE_FACTCHECK_API_KEY", "test-only");
    vi.stubEnv("GOOGLE_FACT_CHECK_API_KEY", "");
    const request = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toContain("factchecktools.googleapis.com/v1alpha1/claims:search");
      expect(url).not.toContain("key=");
      expect(new Headers(init?.headers).get("X-Goog-Api-Key")).toBe("test-only");
      expect(url).toContain("query=");
      return json({
        claims: [
          {
            text: "Drinking bleach cures disease.",
            claimReview: [
              {
                url: "https://www.politifact.com/factchecks/2026/claim/",
                title: "Bleach cure claim",
                textualRating: "False",
                reviewDate: "2026-09-01T00:00:00Z",
                publisher: { name: "PolitiFact", site: "politifact.com" },
              },
              { url: "http://insecure.example/review", title: "Skip" },
            ],
          },
          { text: "Unclassified claim without reviews", claimReview: [] },
        ],
      });
    });
    vi.stubGlobal("fetch", request);
    const rows = await engineSearch("google-factcheck", "bleach cure");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      title: "Bleach cure claim",
      url: "https://www.politifact.com/factchecks/2026/claim/",
      published: "2026-09-01T00:00:00Z",
      publisher: "PolitiFact",
      score: 0.7,
    });
    expect(rows[0]!.content).toContain("Claim: Drinking bleach cures disease.");
    expect(rows[0]!.content).toContain("Rated: False");
  });

  it("treats a Google Fact Check failure as an empty result without rejecting", async () => {
    vi.stubEnv("GOOGLE_FACTCHECK_API_KEY", "test-only");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status: 503 })),
    );
    await expect(engineSearch("google-factcheck", "claim")).resolves.toEqual([]);
  });

  it("uses the new Google Fact Check secret and reuses the provider cache", async () => {
    vi.stubEnv("GOOGLE_FACT_CHECK_API_KEY", "test-new-key");
    vi.stubEnv("GOOGLE_FACTCHECK_API_KEY", "test-legacy-key");
    const request = vi.fn(async (_url: string, init?: RequestInit) => {
      expect(new Headers(init?.headers).get("X-Goog-Api-Key")).toBe("test-new-key");
      return json({
        claims: [{ text: "Claim", claimReview: [{ url: "https://example.org/review" }] }],
      });
    });
    vi.stubGlobal("fetch", request);
    expect(await engineSearch("google-factcheck", "cached claim")).toHaveLength(1);
    expect(await engineSearch("google-factcheck", "cached claim")).toHaveLength(1);
    expect(request).toHaveBeenCalledTimes(1);
  });

  it.each([401, 403, 429])("keeps the cascade working when Google returns %s", async (status) => {
    vi.stubEnv("GOOGLE_FACT_CHECK_API_KEY", "test-new-key");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("", { status })),
    );
    await expect(engineSearch("google-factcheck", "claim")).resolves.toEqual([]);
  });

  it("labels Wikidata and Google Fact Check review publishers with honest tiers", async () => {
    const { sourceTier } = await import("./evidence");
    expect(sourceTier("www.wikidata.org")).toBe(2);
    expect(sourceTier("politifact.com")).toBe(2);
    // A fact-check review hosted on an unknown domain stays conservatively Tier 3.
    expect(sourceTier("unknown-factchecker.example")).toBe(3);
  });
});
