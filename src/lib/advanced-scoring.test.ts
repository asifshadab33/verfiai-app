import { describe, expect, it, vi, afterEach } from "vitest";
const state = vi.hoisted(() => ({ enabled: false }));
vi.mock("./flags.server", () => ({ isEnabled: vi.fn(async () => state.enabled) }));
vi.mock("./search.server", () => ({ engineSearch: async () => [], dualAngleSearch: async () => [
  { url: "https://cdc.gov/data.csv", title: "Water temperatures increased worldwide", content: "Methods: we measured water temperatures worldwide.", author: "Jane Smith", published: "2026-10-01", score: 1 },
] }));
vi.mock("./link-check.server", () => ({ filterLiveSources: async (s: unknown[]) => ({ kept: s, dead: [] }) }));
vi.mock("./cache.server", () => ({ sha: (s: string) => s, CACHE_TTL: { report: () => 1000 }, cached: async () => ({
  title: "Water temperatures", summary: "Summary", background: "", analysis: "", conflictingEvidence: "", methodology: "", limitations: "", conclusion: "",
  sources: [{ url: "https://cdc.gov/data.csv", title: "Water temperatures increased worldwide", publisher: "cdc.gov", date: "2026-10-01" }],
  findings: [{ title: "Water temperatures increased worldwide", detail: "Water temperatures increased worldwide [1].", status: "sourced" }],
}) }));
import { buildReport } from "./research.server";
import { reportFindingStrength } from "./evidence";
import { isEnabled } from "./flags.server";
const input = { question: "Water temperatures increased worldwide", language: "en", mode: "Balanced" as const, format: "standard" as const };
afterEach(() => { state.enabled = false; vi.clearAllMocks(); });
describe("server-gated report scoring", () => {
  it("returns legacy cached report fields exactly when the server flag is off", async () => {
    const r = await buildReport(input, { userId: "caller" });
    expect(isEnabled).toHaveBeenCalledWith("ADVANCED_SOURCE_SCORING_ENABLED", "caller");
    expect(r.sources[0]).toEqual({ url: "https://cdc.gov/data.csv", title: "Water temperatures increased worldwide", publisher: "cdc.gov", date: "2026-10-01" });
    expect(r.findings[0]).toEqual({ title: "Water temperatures increased worldwide", detail: "Water temperatures increased worldwide [1].", status: "sourced" });
  });
  it("adds metadata scores both per source and against the cited finding without upgrading report verification", async () => {
    state.enabled = true;
    const r = await buildReport(input);
    expect(isEnabled).toHaveBeenCalledWith("ADVANCED_SOURCE_SCORING_ENABLED", null);
    expect(r.sources[0]?.quality?.transparency).toBe("namedAuthor");
    expect(r.findings[0]?.sourceScores?.[0]?.quality.directness).toBe("primary");
    expect(r.findings[0]?.sourceScores?.[0]?.url).toBe("https://cdc.gov/data.csv");
    expect(reportFindingStrength("sourced", "Water temperatures [1]", r.sources).label).toBe("Moderate evidence");
    state.enabled = false;
    const legacy = await buildReport(input);
    expect(legacy.sources[0]).not.toHaveProperty("quality");
    expect(legacy.findings[0]).not.toHaveProperty("sourceScores");
  });
});