import { afterEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ rows: new Map<string, unknown>() }));
vi.mock("./cache.server", () => ({
  cacheKey: (kind: string, parts: unknown[]) => `${kind}:${parts.join("|")}`,
  CACHE_TTL: { search: () => 86400_000 },
  cacheGet: async (key: string) => state.rows.get(key) ?? null,
  cacheSet: async (key: string, _kind: string, value: unknown) => { state.rows.set(key, value); },
  cached: async (o: { key: string; compute: () => Promise<unknown> }) => {
    if (state.rows.has(o.key)) return state.rows.get(o.key);
    const value = await o.compute();
    if (Array.isArray(value) && value.length) state.rows.set(o.key, value);
    return value;
  },
}));
import { engineSearch } from "./search.server";

const oa = { results: [{ title: "Metformin trial", doi: "https://doi.org/10.1234/trial", best_oa_location: { landing_page_url: "https://journal.example/trial" } }] };
const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json" } });
afterEach(() => { state.rows.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });

describe("blocked source providers", () => {
  it("respects Semantic Scholar Retry-After and labels fallback results as OpenAlex", async () => {
    vi.useFakeTimers();
    const request = vi.fn(async (url: string) => url.includes("semanticscholar")
      ? new Response("", { status: 429, headers: { "Retry-After": "120" } }) : json(oa));
    vi.stubGlobal("fetch", request);
    const first = await engineSearch("semanticscholar", "metformin");
    expect(first[0]).toMatchObject({ title: "Metformin trial", kind: "openalex_oa" });
    expect(state.rows.get("provider:semanticscholar:cooldown")).toEqual({ until: Date.now() + 120_000 });
    await engineSearch("semanticscholar", "diabetes");
    expect(request.mock.calls.filter(([url]) => url.includes("semanticscholar"))).toHaveLength(1);
    vi.advanceTimersByTime(120_001);
    await engineSearch("semanticscholar", "insulin");
    expect(request.mock.calls.filter(([url]) => url.includes("semanticscholar"))).toHaveLength(2);
  });

  it("contains Semantic Scholar timeouts and unavailable fallback without rejecting", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => { throw new Error("timeout"); }));
    await expect(engineSearch("semanticscholar", "diabetes")).resolves.toEqual([]);
  });

  it("preserves English evidence when the local edition throws, adding cached local search snippets", async () => {
    vi.stubEnv("TAVILY_API_KEY", "test-only");
    vi.stubEnv("BRAVE_SEARCH_API_KEY", ""); vi.stubEnv("YDC_API_KEY", ""); vi.stubEnv("SEARXNG_BASE_URL", "");
    const request = vi.fn(async (url: string, init?: RequestInit) => {
      if (url.includes("ar.wikipedia.org")) throw new Error("blocked");
      if (url.includes("en.wikipedia.org")) {
        expect(new Headers(init?.headers).get("User-Agent")).toContain("https://verfiai.app; mailto:hello@verfiai.app");
        return url.includes("list=search") ? json({ query: { search: [{ title: "Diabetes", pageid: 1 }] } })
          : json({ query: { pages: { "1": { title: "Diabetes", extract: "English evidence" } } } });
      }
      return json({ results: [{ title: "السكري", url: "https://ar.wikipedia.org/wiki/diabetes", content: "Local snippet", score: 0.6 }] });
    });
    vi.stubGlobal("fetch", request);
    const result = await engineSearch("wikipedia", "السكري", "ar");
    expect(result.map(s => s.title)).toEqual(["Diabetes", "السكري"]);
    await engineSearch("wikipedia", "السكري", "ar");
    expect(request).toHaveBeenCalledTimes(4);
  });

  it("keeps CORE disabled without an external request", async () => {
    const request = vi.fn(); vi.stubGlobal("fetch", request);
    expect(await engineSearch("core", "diabetes")).toEqual([]);
    expect(request).not.toHaveBeenCalled();
  });
});