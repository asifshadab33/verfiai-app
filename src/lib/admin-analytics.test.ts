import { describe, expect, it } from "vitest";
import { dailySeries } from "./admin-analytics";

describe("dailySeries", () => {
  const now = Date.parse("2026-11-07T12:00:00Z");
  it("zero-fills each day in the window and counts per UTC date", () => {
    const s = dailySeries(["2026-11-07T01:00:00Z", "2026-11-07T23:00:00Z", "2026-11-05T10:00:00Z"], 7, now);
    expect(s).toHaveLength(7);
    expect(s[0].date).toBe("2026-11-01");
    expect(s[6]).toEqual({ date: "2026-11-07", count: 2 });
    expect(s[4]).toEqual({ date: "2026-11-05", count: 1 });
  });
  it("ignores timestamps outside the window", () => {
    expect(dailySeries(["2026-10-01T00:00:00Z"], 7, now).every((d) => d.count === 0)).toBe(true);
  });
});
