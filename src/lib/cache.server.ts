// CacheProvider. Every external lookup (search, citation, page text, model
// output, claim results, reports) goes through here first, so identical or
// near-identical inputs are served from `research_cache` instead of costing
// search credits and model calls.
import { createHash } from "crypto";
import { admin } from "./db.server";

export const sha = (s: string) => createHash("sha256").update(s).digest("hex");

// Only case and whitespace are interchangeable: punctuation/numbers carry meaning.
export const normalizeQuery = (q: string) =>
  q
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

/** Versioned, unambiguous parts; invalidate the older punctuation-stripping keys. */
export function cacheKey(kind: string, parts: (string | number | undefined)[]): string {
  return `${kind}:v2:${sha(JSON.stringify(parts.map((p) => p === undefined ? null : normalizeQuery(String(p)))))}`;
}

const hours = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : d;
};

/** TTLs in ms; configurable server-side via env (hours). */
export const CACHE_TTL = {
  search: () => hours(process.env["SEARCH_CACHE_TTL_HOURS"], 24) * 3600_000,
  page: () => hours(process.env["PAGE_CACHE_TTL_HOURS"], 24) * 3600_000,
  model: () => hours(process.env["MODEL_CACHE_TTL_HOURS"], 24) * 3600_000,
  claim: () => hours(process.env["CLAIM_CACHE_TTL_HOURS"], 24) * 3600_000,
  citation: () => hours(process.env["CITATION_CACHE_TTL_HOURS"], 30 * 24) * 3600_000,
  report: () => hours(process.env["REPORT_CACHE_TTL_HOURS"], 7 * 24) * 3600_000,
};

export async function cacheGet<T>(key: string, ttl: number): Promise<T | null> {
  try {
    const db = await admin();
    const { data } = await db
      .from("research_cache")
      .select("payload, created_at")
      .eq("key", key)
      .maybeSingle();
    if (!data || Date.now() - new Date(data.created_at).getTime() > ttl) return null;
    return data.payload as T;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, kind: string, payload: unknown) {
  try {
    const db = await admin();
    await db
      .from("research_cache")
      .upsert({ key, kind, payload: payload as never, created_at: new Date().toISOString() });
  } catch {
    /* cache is best-effort */
  }
}

/**
 * Cache-first helper: check the CacheProvider before running `compute`.
 * Empty array results are not cached by default, so a failed upstream fetch
 * can be retried on the next request.
 */
export async function cached<T>(o: {
  key: string;
  kind: string;
  ttlMs: number;
  compute: () => Promise<T>;
  cacheEmpty?: boolean;
  shouldCache?: (value: T) => boolean;
}): Promise<T> {
  const hit = await cacheGet<T>(o.key, o.ttlMs);
  if (hit !== null && hit !== undefined) return hit;
  const value = await o.compute();
  const empty = Array.isArray(value) && value.length === 0;
  if ((!empty || o.cacheEmpty) && (o.shouldCache?.(value) ?? true)) await cacheSet(o.key, o.kind, value);
  return value;
}
