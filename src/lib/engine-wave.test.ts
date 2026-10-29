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
vi.mock("./providers/semantic-gate.server", async (original) => {
  const actual = await original<typeof import("./providers/semantic-gate.server")>();
  return { ...actual, semanticGate: async (action: string, retry = 0) => {
    const key = "provider:semanticscholar:gate";
    const value = state.rows.get(key) as { until: number; failures: number } | undefined;
    let until = value?.until ?? 0, failures = value?.failures ?? 0;
    if (action === "reserve") { if (until > Date.now()) return false; until = Date.now() + 10000; }
    if (action === "limited") { failures++; until = Math.max(until, Date.now() + Math.max(retry, 60000)); }
    if (action === "success") failures = 0;
    state.rows.set(key, { until, failures }); return true;
  } };
});
import { DEFAULT_ENGINES, engineSearch } from "./search.server";

const json = (value: unknown) => new Response(JSON.stringify(value), { headers: { "Content-Type": "application/json" } });
afterEach(() => { state.rows.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe("engine wave registration", () => {
  it("adds the free engines to the default cascade but keeps community out of verdict evidence", () => {
    for (const id of ["stackexchange", "wayback", "worldbank", "sec-edgar", "europepmc"]) expect(DEFAULT_ENGINES).toContain(id);
    expect(DEFAULT_ENGINES).not.toContain("community");
    expect(DEFAULT_ENGINES).toContain("crossref"); // Crossref already existed; not re-added.
  });
  it("treats free-engine failures as empty results without rejecting", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response("", { status: 503 })));
    for (const id of ["stackexchange", "wayback", "worldbank", "sec-edgar", "europepmc"]) {
      await expect(engineSearch(id, "test query")).resolves.toEqual([]);
    }
  });
});

describe("community sentiment engine (Quora/Reddit)", () => {
  it("skips silently without a Tavily key", async () => {
    const request = vi.fn(); vi.stubGlobal("fetch", request);
    await expect(engineSearch("community", "does coffee dehydrate you")).resolves.toEqual([]);
    expect(request).not.toHaveBeenCalled();
  });
  it("searches only quora.com and reddit.com and labels results as community context", async () => {
    vi.stubEnv("TAVILY_API_KEY", "test-only");
    const request = vi.fn(async (_url: string, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body)) as { include_domains?: string[] };
      expect(body.include_domains).toEqual(["quora.com", "www.quora.com", "reddit.com", "www.reddit.com"]);
      return json({ results: [
        { title: "Quora thread", url: "https://www.quora.com/Does-coffee-dehydrate-you", content: "Anecdotal answers", score: 0.9 },
        { title: "Reddit thread", url: "https://www.reddit.com/r/askscience/comments/x/coffee/", content: "Discussion", score: 0.8 },
        { title: "Injected off-domain result", url: "https://evil.example/promo", content: "Spam", score: 0.99 },
        { title: "Insecure", url: "http://www.quora.com/http-only", content: "Skip", score: 0.7 },
      ] });
    });
    vi.stubGlobal("fetch", request);
    const rows = await engineSearch("community", "does coffee dehydrate you");
    expect(rows).toHaveLength(2);
    for (const r of rows) {
      expect(r.score).toBe(0.3); // low weight regardless of provider ranking
      expect(r.sourceType).toBe("community");
      expect(["www.quora.com", "www.reddit.com"]).toContain(new URL(r.url).hostname);
    }
  });
});

describe("free reference engines", () => {
  it("maps Skeptics Stack Exchange answers to the source shape", async () => {
    const request = vi.fn(async (url: string) => {
      expect(url).toContain("api.stackexchange.com/2.3/search/advanced");
      expect(url).toContain("site=skeptics");
      return json({ items: [{ title: "Does coffee &amp; dehydrate you?", link: "https://skeptics.stackexchange.com/questions/1/coffee", score: 12, creation_date: 1700000000, body: "<p>No, studies show it does not.</p>" }] });
    });
    vi.stubGlobal("fetch", request);
    const rows = await engineSearch("stackexchange", "coffee dehydration");
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ title: "Does coffee & dehydrate you?", url: "https://skeptics.stackexchange.com/questions/1/coffee", published: "2023-11-14", score: 0.45 });
    expect(rows[0]!.content).toContain("No, studies show it does not.");
  });
  it("maps archive.org items to canonical details URLs", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ response: { docs: [
      { identifier: "historical-report-1920", title: ["Historical Report"], description: "Archived scan", date: "1920-01-01T00:00:00Z" },
      { identifier: "no-description-item", title: "Skipped" },
    ] } })));
    const rows = await engineSearch("wayback", "historical report");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.url).toBe("https://archive.org/details/historical-report-1920");
    expect(rows[0]!.published).toBe("1920-01-01");
  });
  it("maps World Bank documents with https links only", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => json({ documents: {
      a: { display_title: "World Development Report", pdfurl: "http://documents.worldbank.org/report.pdf", docdt: "2024-03-01", abstract: "Annual flagship report." },
      b: { display_title: "No link document" },
    } })));
    const rows = await engineSearch("worldbank", "global poverty");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.url).toBe("https://documents.worldbank.org/report.pdf");
    expect(rows[0]!.sourceType).toBe("official-statistics");
  });
  it("builds SEC EDGAR filing URLs from accession ids and skips incomplete hits", async () => {
    const request = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toContain("efts.sec.gov/LATEST/search-index");
      expect(new Headers(init?.headers).get("User-Agent")).toContain("hello@verfiai.app");
      return json({ hits: { hits: [
        { _id: "0000320193-23-000106:aapl-20230701.htm", _source: { ciks: ["320193"], display_names: ["Apple Inc."], file_date: "2023-08-04", form: "10-Q", file_description: "Quarterly report" } },
        { _id: "broken-hit-without-colon", _source: { display_names: ["Mystery Corp"] } },
      ] } });
    });
    vi.stubGlobal("fetch", request);
    const rows = await engineSearch("sec-edgar", "apple revenue");
    expect(rows).toHaveLength(1);
    expect(rows[0]!.url).toBe("https://www.sec.gov/Archives/edgar/data/320193/000032019323000106/aapl-20230701.htm");
    expect(rows[0]!.title).toBe("Apple Inc. (10-Q) filing");
    expect(rows[0]!.published).toBe("2023-08-04");
  });
  it("maps Europe PMC results preferring DOI links", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      expect(url).toContain("ebi.ac.uk/europepmc/webservices/rest/search");
      return json({ resultList: { result: [
        { id: "12345", title: "Metformin study", authorString: "Smith J", pubYear: "2023", doi: "10.1234/met", abstractText: "A randomized trial." },
        { id: "67890", title: "No DOI entry", pubYear: "2022" },
      ] } });
    }));
    const rows = await engineSearch("europepmc", "metformin");
    expect(rows).toHaveLength(2);
    expect(rows[0]!.url).toBe("https://doi.org/10.1234/met");
    expect(rows[0]!.author).toBe("Smith J");
    expect(rows[1]!.url).toBe("https://europepmc.org/article/MED/67890");
  });
});

describe("Semantic Scholar authenticated access", () => {
  const paper = { data: [{ title: "Trial", url: "https://journal.example/trial" }] };
  it("sends the API key header when SEMANTIC_SCHOLAR_API_KEY is configured", async () => {
    vi.stubEnv("SEMANTIC_SCHOLAR_API_KEY", "test-only");
    const request = vi.fn(async (_url: string, _init?: RequestInit) => json(paper));
    vi.stubGlobal("fetch", request);
    const rows = await engineSearch("semanticscholar", "metformin");
    expect(rows[0]).toMatchObject({ title: "Trial", kind: "semanticscholar" });
    const init = request.mock.calls[0]?.[1];
    expect(new Headers(init?.headers).get("x-api-key")).toBe("test-only");
  });
  it("omits the key header when the secret is absent", async () => {
    const request = vi.fn(async (_url: string, _init?: RequestInit) => json(paper));
    vi.stubGlobal("fetch", request);
    await engineSearch("semanticscholar", "metformin");
    const init = request.mock.calls[0]?.[1];
    expect(new Headers(init?.headers).get("x-api-key")).toBeNull();
  });
  it("falls back to OpenAlex when the authenticated API fails", async () => {
    vi.stubEnv("SEMANTIC_SCHOLAR_API_KEY", "test-only");
    const oa = { results: [{ title: "OpenAlex fallback", doi: "https://doi.org/10.1/x", best_oa_location: { landing_page_url: "https://journal.example/x" } }] };
    vi.stubGlobal("fetch", vi.fn(async (url: string) => url.includes("semanticscholar") ? new Response("", { status: 500 }) : json(oa)));
    const rows = await engineSearch("semanticscholar", "metformin");
    expect(rows[0]).toMatchObject({ title: "OpenAlex fallback", kind: "openalex_oa" });
  });
});
