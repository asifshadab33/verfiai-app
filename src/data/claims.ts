// Curated claim dataset (editorial summaries supplied by the Verfiai team; not live-verified evidence).
import raw from "./claims.json";

export type ClaimVerdict = "supported" | "contradicted" | "mixed";
export type ClaimEntry = {
  id: number; slug: string; claim: string; category: string; search_phrase: string;
  why_searched: string; difficulty: string; verdict: ClaimVerdict; evidence_summary: string;
};

export const CLAIMS = raw as ClaimEntry[];
const BY_SLUG = new Map(CLAIMS.map(c => [c.slug, c]));
export const getClaimBySlug = (slug: string) => BY_SLUG.get(slug);
export const listClaimSlugs = () => CLAIMS.map(c => c.slug);
export const claimCategories = () => [...new Set(CLAIMS.map(c => c.category))].sort();
export const VERDICT_LABEL: Record<ClaimVerdict, string> = { supported: "Supported", contradicted: "Contradicted", mixed: "Mixed evidence" };
// schema.org ClaimReview rating scale: 1 = false, 3 = mixed, 5 = true.
export const VERDICT_RATING: Record<ClaimVerdict, number> = { contradicted: 1, mixed: 3, supported: 5 };
