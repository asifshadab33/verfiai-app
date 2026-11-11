import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ rows: new Map<string, unknown>(), calls: 0 }));
vi.mock("./db.server", () => ({ admin: async () => ({ from: () => ({
  select: () => ({ eq: (_: string, key: string) => ({ maybeSingle: async () => ({ data: state.rows.get(key) ?? null }) }) }),
  upsert: async (row: { key: string; payload: unknown; created_at: string }) => { state.rows.set(row.key, row); },
}) }) }));
vi.mock("./model.server", () => ({ runRoute: vi.fn() }));
import { checkOne } from "./citation.server";

beforeEach(() => {
  state.rows.clear();
  state.calls = 0;
  vi.stubGlobal("fetch", vi.fn(async () => {
    state.calls++;
    return new Response(JSON.stringify({ message: { items: [] }, results: [] }), { status: 200 });
  }));
});

describe("citation cache identity", () => {
  it("keeps raw-only references distinct and retries not-found responses", async () => {
    await checkOne({ raw: "Alpha reference 2026", title: "" });
    const firstCalls = state.calls;
    await checkOne({ raw: "Beta reference 2025", title: "" });
    expect(state.calls).toBeGreaterThan(firstCalls);
    expect(state.rows.size).toBe(0);
    const secondCalls = state.calls;
    await checkOne({ raw: "Alpha reference 2026", title: "" });
    expect(state.calls).toBeGreaterThan(secondCalls);
  });
  it("reuses equivalent DOI prefixes and keeps each caller's raw citation", async () => {
    vi.stubGlobal("fetch", vi.fn(async (url: string) => {
      state.calls++;
      return new Response(JSON.stringify({ message: url.includes("filter=") ? { items: [] } : { DOI: "10.1234/example", title: ["Example research"], issued: { "date-parts": [[2026]] } } }));
    }));
    await checkOne({ raw: "First citation", title: "Example research", doi: "https://doi.org/10.1234/example" });
    const firstCalls = state.calls;
    const result = await checkOne({ raw: "Second citation", title: "Example research", doi: "doi:10.1234/example" });
    expect(state.calls).toBe(firstCalls);
    expect(result.raw).toBe("Second citation");
    expect(result.status).toBe("verified");
  });
});