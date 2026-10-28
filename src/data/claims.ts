// Curated editorial claims. Only explicitly reviewed entries may emit ClaimReview.
import raw from "./claims.json";

export type ClaimVerdict = "supported" | "contradicted" | "mixed";
export type EditorialReview = {
  reviewedAt: string;
  reviewer: string;
  attribution: { origin: string; documentedAppearance: string; url: string };
  analysis: { text: string; citations: number[] }[];
  limitations: string;
  sources: { title: string; publisher: string; authors?: string; url: string; publishedAt?: string; accessedAt: string; quote: string; relevance: string }[];
};
export type ClaimEntry = {
  id: number; slug: string; claim: string; category: string; search_phrase: string;
  why_searched: string; difficulty: string; verdict: ClaimVerdict; evidence_summary: string;
  review?: EditorialReview;
};

export const CLAIMS = raw as ClaimEntry[];
const BY_SLUG = new Map(CLAIMS.map(c => [c.slug, c]));
export const getClaimBySlug = (slug: string) => BY_SLUG.get(slug);
export const listClaimSlugs = () => CLAIMS.map(c => c.slug);
export const claimCategories = () => [...new Set(CLAIMS.map(c => c.category))].sort();
export const VERDICT_LABEL: Record<ClaimVerdict, string> = { supported: "Supported", contradicted: "Contradicted", mixed: "Mixed evidence" };
// schema.org ClaimReview rating scale: 1 = false, 3 = mixed, 5 = true.
export const VERDICT_RATING: Record<ClaimVerdict, number> = { contradicted: 1, mixed: 3, supported: 5 };

/** Fail closed: undated, uncited summaries are not evidence-reviewed articles. */
export function claimReviewSchema(c: ClaimEntry) {
  const r = c.review;
  const https = (url: string) => { try { return new URL(url).protocol === "https:"; } catch { return false; } };
  if (!r || !/^\d{4}-\d{2}-\d{2}$/.test(r.reviewedAt) || !r.reviewer.trim() ||
    !r.attribution.origin.trim() || !r.attribution.documentedAppearance.trim() || !https(r.attribution.url) ||
    !r.sources.length || r.sources.some(s => !s.quote.trim() || !s.relevance.trim() || !https(s.url) || !s.accessedAt) ||
    !r.analysis.length || r.analysis.some(p => !p.text.trim() || !p.citations.length || p.citations.some(n => n < 1 || n > r.sources.length))) return null;
  const base = "https://verfiai.app";
  return {
    "@context": "https://schema.org", "@type": "ClaimReview", url: `${base}/fact-check/${c.slug}`,
    claimReviewed: c.claim, datePublished: r.reviewedAt,
    author: { "@type": "Organization", name: r.reviewer, url: base },
    reviewBody: r.analysis.map(p => p.text).join("\n\n") + "\n\n" + r.limitations,
    // This is a documented discussion of the assertion, NOT its first author or publication.
    itemReviewed: { "@type": "Claim", name: c.claim, description: r.attribution.origin,
      appearance: { "@type": "CreativeWork", url: r.attribution.url, description: r.attribution.documentedAppearance } },
    citation: r.sources.map(s => ({ "@type": "CreativeWork", name: s.title, url: s.url, publisher: { "@type": "Organization", name: s.publisher }, ...(s.publishedAt ? { datePublished: s.publishedAt } : {}) })),
    reviewRating: { "@type": "Rating", ratingValue: VERDICT_RATING[c.verdict], bestRating: 5, worstRating: 1, alternateName: VERDICT_LABEL[c.verdict] },
  };
}
