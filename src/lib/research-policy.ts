/** Freshness, not a promise of physical database deletion. */
export const RESEARCH_SHORT_TTL_MS = 24 * 60 * 60 * 1000;
export const RESEARCH_POPULAR_TTL_MS = 7 * RESEARCH_SHORT_TTL_MS;
export const RESEARCH_STALE_TTL_MS = 30 * RESEARCH_SHORT_TTL_MS;
export const RESEARCH_POPULAR_USES = 3;
export const researchFreshnessMs = (uses: number) =>
  uses >= RESEARCH_POPULAR_USES ? RESEARCH_POPULAR_TTL_MS : RESEARCH_SHORT_TTL_MS;

/** Only the cascade's known availability errors qualify; unrelated failures still propagate. */
export function providerExhausted(error: unknown): boolean {
  return (
    error instanceof Error &&
    (/^(engine|engine-empty|engine-missing|rate-limited|unavailable|credits)$/.test(
      error.message,
    ) ||
      error.message ===
        "The report could not be generated right now. Please try again in a few minutes." ||
      error.name === "TimeoutError" ||
      error.name === "AbortError")
  );
}
