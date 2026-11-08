import { describe, expect, it } from "vitest";
import { CLAIMS, claimReviewSchema } from "@/data/claims";
import { matchEditorialClaim } from "./editorial-match";

describe("conservative editorial reuse", () => {
  it("reuses all five eligible reviews with original quotes and dated provenance", () => {
    const reviewed = CLAIMS.filter((entry) => claimReviewSchema(entry));
    expect(reviewed).toHaveLength(5);
    for (const entry of reviewed) {
      const result = matchEditorialClaim(entry.claim, "English");
      expect(result?.verdict).toBe(entry.verdict.toUpperCase());
      expect(result?.sources.map((s) => s.quote)).toEqual(entry.review?.sources.map((s) => s.quote));
      expect(result?.explanation).toContain(entry.review?.reviewedAt);
      expect(result?.strength).toBeUndefined();
      expect(result?.sources.some((s) => s.quality)).toBe(false);
    }
  });
  it("allows only case and whitespace normalization", () => {
    expect(matchEditorialClaim("  HUMANS only use 10%   of their brains.  ", "en")?.verdict).toBe("CONTRADICTED");
  });
  it.each([
    "Humans only use 100% of their brains.",
    "Humans do not only use 10% of their brains.",
    "Humans only use 10% of their brains?",
    "Humans only use 10% of their brains. Another assertion.",
    "Humans only use 1.0% of their brains.",
  ])("does not reuse changed assertions: %s", (text) => {
    expect(matchEditorialClaim(text, "en")).toBeNull();
  });
  it("never reuses unreviewed claims", () => {
    for (const entry of CLAIMS.filter((c) => !claimReviewSchema(c))) {
      expect(matchEditorialClaim(entry.claim, "en")).toBeNull();
    }
  });
  it("rejects non-English output requests", () => {
    expect(matchEditorialClaim("Humans only use 10% of their brains.", "Arabic")).toBeNull();
  });
  it("applies the shared fail-closed review validator", () => {
    const entry = CLAIMS.find((c) => c.review);
    if (!entry?.review) throw new Error("Missing review fixture");
    expect(matchEditorialClaim(entry.claim, "en", [{ ...entry, review: { ...entry.review, sources: [] } }])).toBeNull();
  });
});