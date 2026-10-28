import { describe, expect, it } from "vitest";
import { CLAIMS, claimReviewSchema, type ClaimEntry } from "./claims";

describe("editorial evidence publication", () => {
  it("retains all 75 pages but withholds ClaimReview for the 72 unsubstantiated entries", () => {
    expect(CLAIMS).toHaveLength(75);
    expect(CLAIMS.filter(c => claimReviewSchema(c))).toHaveLength(3);
    expect(CLAIMS.filter(c => !claimReviewSchema(c))).toHaveLength(72);
    expect(CLAIMS.filter(c => c.review).map(c => c.slug)).toEqual([
      "humans-use-10-percent-of-brain", "great-wall-visible-from-space", "seasons-earth-distance",
    ]);
  });
  it("requires citations, dated review and honest provenance before emitting ClaimReview", () => {
    const reviewed = CLAIMS.find(c => c.review);
    if (!reviewed?.review) throw new Error("Reviewed fixture missing");
    const schema = claimReviewSchema(reviewed);
    expect(schema?.datePublished).toBe("2026-10-28");
    expect(schema?.citation[0]?.url).toBe("https://pmc.ncbi.nlm.nih.gov/articles/PMC2151163/");
    expect(schema?.reviewRating.ratingValue).toBe(1);
    const invalid: ClaimEntry[] = [
      { ...reviewed, review: undefined },
      { ...reviewed, review: { ...reviewed.review, reviewedAt: "" } },
      { ...reviewed, review: { ...reviewed.review, sources: [] } },
      { ...reviewed, review: { ...reviewed.review, attribution: { ...reviewed.review.attribution, origin: "" } } },
      { ...reviewed, review: { ...reviewed.review, analysis: [{ text: "A claim", citations: [2] }] } },
      { ...reviewed, review: { ...reviewed.review, sources: [{ ...reviewed.review.sources[0], title: "Invalid", publisher: "Invalid", url: "javascript:alert(1)", accessedAt: "2026-10-28", quote: "An assertion", relevance: "Test" }] } },
    ];
    for (const claim of invalid) expect(claimReviewSchema(claim)).toBeNull();
  });
});