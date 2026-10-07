export const VERIFICATION_TTL_MS = 24 * 60 * 60 * 1000;
export const VERIFICATION_REQUEST_LIMITS = { guest: 5, authenticated: 20 } as const;

// Preserve punctuation and numbers: “1.5” and “15” must not reuse a verdict.
export function normalizeVerificationInput(text: string) {
  return text.normalize("NFKC").toLowerCase().replace(/\s+/gu, " ").trim();
}

export function verificationCacheFresh(createdAt: string, now = Date.now()) {
  const age = now - Date.parse(createdAt);
  return Number.isFinite(age) && age >= 0 && age < VERIFICATION_TTL_MS;
}