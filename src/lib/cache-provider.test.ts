import { afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  row: null as null | { payload: unknown; created_at: string },
  writes: 0,
}));
vi.mock("./db.server", () => ({
  admin: async () => ({
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: state.row }) }) }),
      upsert: async (row: { payload: unknown; created_at: string }) => {
        state.row = row;
        state.writes++;
      },
    }),
  }),
}));
import { cached, CACHE_TTL } from "./cache.server";
afterEach(() => {
  state.row = null;
  state.writes = 0;
  vi.useRealTimers();
  vi.unstubAllEnvs();
});
describe("provider cache", () => {
  it("uses the 24-hour search cache without repeating the external request", async () => {
    vi.stubEnv("SEARCH_CACHE_TTL_HOURS", "");
    expect(CACHE_TTL.search()).toBe(24 * 3600_000);
    const compute = vi.fn(async () => [{ title: "Example" }]);
    const options = { key: "search:test", kind: "search", ttlMs: CACHE_TTL.search(), compute };
    await cached(options);
    await cached(options);
    expect(compute).toHaveBeenCalledTimes(1);
    vi.useFakeTimers();
    vi.setSystemTime(Date.now() + 24 * 3600_000 + 1);
    await cached(options);
    expect(compute).toHaveBeenCalledTimes(2);
  });
  it("does not cache an empty upstream failure", async () => {
    const compute = vi.fn(async () => []);
    const options = { key: "search:empty", kind: "search", ttlMs: 24 * 3600_000, compute };
    await cached(options);
    await cached(options);
    expect(compute).toHaveBeenCalledTimes(2);
    expect(state.writes).toBe(0);
  });
});
