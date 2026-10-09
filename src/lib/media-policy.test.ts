import { describe, expect, it } from "vitest";
import { MEDIA_URL_TTL_SECONDS, isOwnMediaPath } from "./media-policy";
import { clampExtended, charCount, EXTENDED_MAX_CHARS, reportInput } from "./report-schema";

describe("media signed URLs", () => {
  it("expire after 15 minutes", () => expect(MEDIA_URL_TTL_SECONDS).toBe(900));
  it("only allow the owner's folder", () => {
    expect(isOwnMediaPath("u1/a.png", "u1")).toBe(true);
    expect(isOwnMediaPath("u2/a.png", "u1")).toBe(false);
    expect(isOwnMediaPath("u1/../u2/a.png", "u1")).toBe(false);
  });
});
describe("extended reports", () => {
  it("default to the standard brief", () => expect(reportInput.parse({ question: "What is the evidence on X?", language: "English", mode: "Balanced" }).format).toBe("standard"));
  it("are capped at 20,000 characters", () => {
    const long = "word ".repeat(3000);
    const r = { title: "t", summary: "s", background: long, analysis: long, findings: [], sources: [], conflictingEvidence: long, methodology: "m", limitations: "l", conclusion: "c", proceduralGuidance: long, blindSpots: long };
    expect(charCount(clampExtended(r))).toBeLessThanOrEqual(EXTENDED_MAX_CHARS);
  });
});
