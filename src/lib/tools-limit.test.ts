import { describe, expect, it } from "vitest";
import { createLimiter } from "./tools-limit.server";

describe("free tools limiter", () => {
  it("blocks after the window quota and recovers", () => {
    let t = 0;
    const l = createLimiter({ windowMs: 1000, max: 3 }, () => t);
    expect(l.check("ip:1").ok).toBe(true);
    expect(l.check("ip:1", 2).ok).toBe(true);
    const blocked = l.check("ip:1");
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBe(1);
    expect(l.check("ip:2").ok).toBe(true);
    t = 1001;
    expect(l.check("ip:1").ok).toBe(true);
  });
  it("rejects a single request larger than the quota", () => { expect(createLimiter({ windowMs: 1000, max: 3 }).check("a", 4).ok).toBe(false); });
});
