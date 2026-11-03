import { afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  hit: null as null | { value: unknown; createdAt: string; fresh: boolean },
  fail: true,
}));
vi.mock("./research-cache.server", () => ({
  researchResultKey: vi.fn(() => "private-key"),
  readResearchCache: vi.fn(async () => state.hit),
  writeResearchCache: vi.fn(),
}));
vi.mock("./flags.server", () => ({ isEnabled: async () => false }));
vi.mock("./search.server", () => ({
  dualAngleSearch: vi.fn(async () => [
    { title: "Source", url: "https://example.org/paper", content: "Original excerpt", score: 1 },
  ]),
  engineSearch: vi.fn(async () => []),
}));
vi.mock("./link-check.server", () => ({
  filterLiveSources: async (sources: unknown[]) => ({ kept: sources, dead: [] }),
}));
vi.mock("./cache.server", () => ({
  sha: (s: string) => s,
  CACHE_TTL: { report: () => 1000 },
  cached: async (o: { compute: () => Promise<unknown> }) => o.compute(),
}));
vi.mock("./model.server", () => ({
  synthesize: vi.fn(async () => {
    throw new Error(state.fail ? "rate-limited" : "unrelated failure");
  }),
}));
import { buildReport } from "./research.server";
import { dualAngleSearch } from "./search.server";
import { synthesize } from "./model.server";
import { writeResearchCache } from "./research-cache.server";
import { sourcesOnlyReport } from "./research-fallback";
const input = {
  question: "What does the research show?",
  language: "en",
  mode: "Balanced" as const,
  format: "standard" as const,
};
afterEach(() => {
  state.hit = null;
  state.fail = true;
  vi.clearAllMocks();
});
describe("research exhaustion and pre-search reuse", () => {
  it("a fresh matching report makes zero search and zero model calls", async () => {
    const report = sourcesOnlyReport(input.question, [], "2026-10-30");
    state.hit = { value: { ...report, delivery: undefined }, createdAt: "2026-10-30", fresh: true };
    const result = await buildReport(input, { userId: "a" });
    expect(result.delivery?.mode).toBe("cached");
    expect(dualAngleSearch).not.toHaveBeenCalled();
    expect(synthesize).not.toHaveBeenCalled();
  });
  it("returns a dated matching stale report on exhausted providers, without recaching", async () => {
    const report = sourcesOnlyReport("Previous report", [], "2026-10-25");
    state.hit = { value: report, createdAt: "2026-10-25", fresh: false };
    const result = await buildReport(input, { userId: "a" });
    expect(result.title).toBe("Previous report");
    expect(result.delivery).toEqual({ mode: "stale", generatedAt: "2026-10-25" });
    expect(writeResearchCache).not.toHaveBeenCalled();
  });
  it("with no cached answer returns sources only, no findings and no verification claim", async () => {
    const result = await buildReport(input, { guestFingerprint: "g" });
    expect(result.delivery?.mode).toBe("sources-only");
    expect(result.findings).toEqual([]);
    expect(result.sources[0]?.url).toBe("https://example.org/paper");
    expect(result.verification).toBeUndefined();
    expect(writeResearchCache).not.toHaveBeenCalled();
  });
  it("does not hide non-provider failures", async () => {
    state.fail = false;
    await expect(buildReport(input)).rejects.toThrow("unrelated failure");
  });
});
