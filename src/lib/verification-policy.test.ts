import { describe, expect, it, vi } from "vitest";
import { VERIFICATION_REQUEST_LIMITS, VERIFICATION_TTL_MS, normalizeVerificationInput, verificationCacheFresh } from "./verification-policy";

describe("Day 3 policy", () => {
  it("reuses case and whitespace variants without changing numbers or meaning", () => {
    expect(normalizeVerificationInput("  A CLAIM\n has   1.5 units. ")).toBe("a claim has 1.5 units.");
    expect(normalizeVerificationInput("1.5")).not.toBe(normalizeVerificationInput("15"));
    expect(normalizeVerificationInput("is not safe")).not.toBe(normalizeVerificationInput("is safe"));
  });
  it("expires responses at exactly 24 hours", () => {
    const created = "2026-10-07T00:00:00Z", now = Date.parse(created);
    expect(VERIFICATION_TTL_MS).toBe(86400000);
    expect(verificationCacheFresh(created, now + 86399999)).toBe(true);
    expect(verificationCacheFresh(created, now + 86400000)).toBe(false);
    expect(verificationCacheFresh("invalid", now)).toBe(false);
  });
  it("limits guests to five requests per hour", () => { expect(VERIFICATION_REQUEST_LIMITS.guest).toBe(5); });
  it("limits signed-in users to twenty requests per day", () => { expect(VERIFICATION_REQUEST_LIMITS.authenticated).toBe(20); });
});