import { CLAIMS, claimReviewSchema, type ClaimEntry } from "@/data/claims";
import { normalizeVerificationInput } from "./verification-policy";
import type { ClaimResult } from "./factcheck.functions";

/** Exact English assertions only: no fuzzy matching, paraphrases or reversed claims. */
export function matchEditorialClaim(
  text: string,
  language: string,
  entries: readonly ClaimEntry[] = CLAIMS,
): ClaimResult | null {
  if (language.trim().toLowerCase() !== "en") return null;
  const normalized = normalizeVerificationInput(text);
  const entry = entries.find(
    (candidate) => normalizeVerificationInput(candidate.claim) === normalized,
  );
  if (!entry?.review || !claimReviewSchema(entry)) return null;
  const review = entry.review;
  const verdict = {
    supported: "SUPPORTED",
    contradicted: "CONTRADICTED",
    mixed: "MIXED",
  } as const;
  return {
    claim: text.trim(),
    verdict: verdict[entry.verdict],
    consensus: "single",
    explanation: `Existing editorial review by ${review.reviewer}, reviewed ${review.reviewedAt}; not a new live check. ${review.analysis.map((p) => p.text).join(" ")} Limitations: ${review.limitations} Review: https://verfiai.app/fact-check/${entry.slug}`,
    sources: review.sources.map((source, i) => ({
      n: i + 1,
      title: source.title,
      url: source.url,
      quote: source.quote,
    })),
  };
}