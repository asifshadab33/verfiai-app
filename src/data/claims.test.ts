import { describe, expect, it } from "vitest";
import { CLAIMS, claimReviewSchema, claimRobotsMeta, type ClaimEntry } from "./claims";
import { sitemapPaths } from "../routes/sitemap[.]xml";

describe("editorial evidence publication", () => {
  it("noindexes unreviewed pages and excludes them from the sitemap", () => {
    const unreviewed = CLAIMS.find((c) => c.slug === "lightning-hotter-than-sun");
    if (!unreviewed) throw new Error("Unreviewed fixture missing");
    expect(claimRobotsMeta(unreviewed)).toEqual([{ name: "robots", content: "noindex,follow" }]);
    expect(sitemapPaths()).not.toContain(`/fact-check/${unreviewed.slug}`);
    expect(CLAIMS.filter((c) => claimRobotsMeta(c).length)).toHaveLength(70);
  });
  it("keeps reviewed pages indexable and includes them in the 77-URL sitemap", () => {
    const reviewed = CLAIMS.find((c) => c.slug === "humans-use-10-percent-of-brain");
    if (!reviewed?.review) throw new Error("Reviewed fixture missing");
    expect(claimRobotsMeta(reviewed)).toEqual([]);
    expect(sitemapPaths()).toContain(`/fact-check/${reviewed.slug}`);
    expect(sitemapPaths()).toHaveLength(77);
    const { review: _review, ...withoutReview } = reviewed;
    expect(claimRobotsMeta(withoutReview)).toEqual([{ name: "robots", content: "noindex,follow" }]);
  });
  it("retains all 75 pages but withholds ClaimReview for the 70 unsubstantiated entries", () => {
    expect(CLAIMS).toHaveLength(75);
    expect(CLAIMS.filter((c) => claimReviewSchema(c))).toHaveLength(5);
    expect(CLAIMS.filter((c) => !claimReviewSchema(c))).toHaveLength(70);
    expect(CLAIMS.filter((c) => c.review).map((c) => c.slug)).toEqual([
      "humans-use-10-percent-of-brain",
      "great-wall-visible-from-space",
      "seasons-earth-distance",
      "moon-dark-side",
      "flu-shot-gives-flu",
    ]);
  });
  it.each(["moon-dark-side", "flu-shot-gives-flu"])(
    "publishes the live-excerpt-reviewed %s record through the shared validator",
    (slug) => {
      const claim = CLAIMS.find((c) => c.slug === slug);
      if (!claim) throw new Error("Review fixture missing");
      expect(claimReviewSchema(claim)?.datePublished).toBe("2026-10-30");
      expect(claimReviewSchema(claim)?.reviewRating.ratingValue).toBe(1);
      expect(claim.review?.sources[0]?.accessedAt).toBe("2026-10-30");
      expect(claimRobotsMeta(claim)).toEqual([]);
      expect(sitemapPaths()).toContain(`/fact-check/${slug}`);
    },
  );
  it("requires citations, dated review and honest provenance before emitting ClaimReview", () => {
    const reviewed = CLAIMS.find((c) => c.review);
    if (!reviewed?.review) throw new Error("Reviewed fixture missing");
    const schema = claimReviewSchema(reviewed);
    expect(schema?.datePublished).toBe("2026-10-28");
    expect(schema?.citation[0]?.url).toBe("https://pmc.ncbi.nlm.nih.gov/articles/PMC2151163/");
    expect(schema?.reviewRating.ratingValue).toBe(1);
    const { review: _review, ...unreviewed } = reviewed;
    const invalid: ClaimEntry[] = [
      unreviewed,
      { ...reviewed, review: { ...reviewed.review, reviewedAt: "" } },
      { ...reviewed, review: { ...reviewed.review, sources: [] } },
      {
        ...reviewed,
        review: { ...reviewed.review, attribution: { ...reviewed.review.attribution, origin: "" } },
      },
      {
        ...reviewed,
        review: { ...reviewed.review, analysis: [{ text: "A claim", citations: [2] }] },
      },
      {
        ...reviewed,
        review: {
          ...reviewed.review,
          sources: [
            {
              ...reviewed.review.sources[0],
              title: "Invalid",
              publisher: "Invalid",
              url: "javascript:alert(1)",
              accessedAt: "2026-10-28",
              quote: "An assertion",
              relevance: "Test",
            },
          ],
        },
      },
    ];
    for (const claim of invalid) expect(claimReviewSchema(claim)).toBeNull();
  });
});
