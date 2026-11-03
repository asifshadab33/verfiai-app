import { afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  result: { data: true as boolean | null, error: null as unknown },
}));
vi.mock("../db.server", () => ({ admin: async () => ({ rpc: async () => state.result }) }));
import { retryAfterMs, semanticGate } from "./semantic-gate.server";
afterEach(() => {
  state.result = { data: true, error: null };
});
describe("Semantic Scholar coordination", () => {
  it("respects seconds, dates and Retry-After longer than one hour", () => {
    const now = Date.parse("2026-10-26T00:00:00Z");
    expect(retryAfterMs("120", now)).toBe(120000);
    expect(retryAfterMs("Mon, 26 Oct 2026 02:00:00 GMT", now)).toBe(7200000);
    expect(retryAfterMs("7200", now)).toBe(7200000);
    expect(retryAfterMs(null, now)).toBe(0);
    expect(retryAfterMs("invalid", now)).toBe(0);
  });
  it("skips upstream if atomic coordination fails", async () => {
    state.result = { data: null, error: new Error("unavailable") };
    expect(await semanticGate("reserve")).toBe(false);
  });
});
