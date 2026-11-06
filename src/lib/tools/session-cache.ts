/** Best-effort sessionStorage cache with expiry and a per-entry size limit. */
export const SESSION_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
export const SESSION_CACHE_MAX_CHARS = 100_000; // ~200 KB as UTF-16

type Envelope = { v: 1; t: number; d: unknown };

export function readSessionCache<T>(key: string, ttlMs = SESSION_CACHE_TTL_MS): T | undefined {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw === null) return undefined;
    if (raw.length > SESSION_CACHE_MAX_CHARS) {
      sessionStorage.removeItem(key);
      return undefined;
    }
    const parsed = JSON.parse(raw) as Envelope;
    if (!parsed || parsed.v !== 1 || typeof parsed.t !== "number" || Date.now() - parsed.t > ttlMs || parsed.t > Date.now() + 60_000) {
      sessionStorage.removeItem(key);
      return undefined;
    }
    return parsed.d as T;
  } catch {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // storage unavailable
    }
    return undefined;
  }
}

export function writeSessionCache(key: string, data: unknown): boolean {
  try {
    const raw = JSON.stringify({ v: 1, t: Date.now(), d: data } satisfies Envelope);
    if (raw.length > SESSION_CACHE_MAX_CHARS) return false;
    sessionStorage.setItem(key, raw);
    return true;
  } catch {
    return false;
  }
}
