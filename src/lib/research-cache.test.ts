import { afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  rows: new Map<string, { payload: unknown; created_at: string }>(),
}));
vi.mock("./db.server", () => ({
  admin: async () => ({
    from: () => ({
      select: () => ({
        eq: (_column: string, key: string) => ({
          maybeSingle: async () => ({ data: state.rows.get(key) ?? null }),
        }),
      }),
      upsert: async (row: { key: string; payload: unknown; created_at: string }) => {
        state.rows.set(row.key, row);
      },
    }),
  }),
}));
import { readResearchCache, writeResearchCache, researchResultKey } from "./research-cache.server";
import {
  RESEARCH_SHORT_TTL_MS,
  RESEARCH_POPULAR_TTL_MS,
  RESEARCH_STALE_TTL_MS,
} from "./research-policy";
afterEach(() => {
  state.rows.clear();
  vi.useRealTimers();
});
describe("caller-scoped adaptive research cache", () => {
  it("retains the 24-hour freshness for rare queries", async () => {
    vi.useFakeTimers();
    vi.setSystemTime("2026-10-31T00:00:00Z");
    await writeResearchCache("rare", { answer: "old" });
    vi.advanceTimersByTime(RESEARCH_SHORT_TTL_MS);
    expect((await readResearchCache("rare"))?.fresh).toBe(false);
  });
  it("promotes three uses to seven days without sliding the creation date", async () => {
    vi.useFakeTimers();
    vi.setSystemTime("2026-10-31T00:00:00Z");
    await writeResearchCache("popular", "answer");
    await readResearchCache("popular");
    await readResearchCache("popular");
    vi.advanceTimersByTime(6 * RESEARCH_SHORT_TTL_MS);
    expect((await readResearchCache("popular"))?.fresh).toBe(true);
    expect(state.rows.get("popular")?.created_at).toBe("2026-10-31T00:00:00.000Z");
    vi.advanceTimersByTime(RESEARCH_POPULAR_TTL_MS - 6 * RESEARCH_SHORT_TTL_MS);
    expect((await readResearchCache("popular"))?.fresh).toBe(false);
  });
  it("never revives expired rare entries and bounds stale fallback at thirty days", async () => {
    vi.useFakeTimers();
    vi.setSystemTime("2026-10-31T00:00:00Z");
    await writeResearchCache("old", "answer");
    vi.advanceTimersByTime(RESEARCH_SHORT_TTL_MS);
    for (let i = 0; i < 5; i++) expect((await readResearchCache("old"))?.fresh).toBe(false);
    vi.advanceTimersByTime(RESEARCH_STALE_TTL_MS - RESEARCH_SHORT_TTL_MS);
    expect(await readResearchCache("old")).toBeNull();
  });
  it("isolates users, input punctuation, attachments, language and scoring cohorts", () => {
    const input = { question: "Rate is 1.5%", language: "en" };
    const key = researchResultKey("a", input, "legacy");
    for (const other of [
      researchResultKey("b", input, "legacy"),
      researchResultKey("a", { ...input, question: "Rate is 15%" }, "legacy"),
      researchResultKey("a", { ...input, attachment: "private" }, "legacy"),
      researchResultKey("a", { ...input, language: "ar" }, "legacy"),
      researchResultKey("a", input, "scoring-v1"),
    ])
      expect(other).not.toBe(key);
  });
});
