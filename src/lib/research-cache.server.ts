import { admin } from "./db.server";
import { sha } from "./cache.server";
import { researchFreshnessMs, RESEARCH_STALE_TTL_MS } from "./research-policy";

type Entry<T> = { version: 1; value: T; uses: number };
export type ResearchCacheHit<T> = { value: T; createdAt: string; fresh: boolean };

/** Exact inputs, caller scope and scoring cohort are supplied by report callers. */
export const researchResultKey = (scope: string, input: unknown, cohort: string) =>
  `research-result-v2:${sha(JSON.stringify([scope, normalizeCacheInput(input), cohort]))}`;

/** Case/whitespace-insensitive, but punctuation and numbers are preserved so "1.5" ≠ "15".
 * Object keys are sorted so field order never splits the cache; empty strings drop out. */
export function normalizeCacheInput(input: unknown): unknown {
  if (typeof input === "string") return input.normalize("NFKC").toLowerCase().replace(/\s+/gu, " ").trim();
  if (Array.isArray(input)) return input.map(normalizeCacheInput);
  if (input && typeof input === "object") {
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(input).sort()) {
      const v = normalizeCacheInput((input as Record<string, unknown>)[k]);
      if (v !== undefined && v !== "") out[k] = v;
    }
    return out;
  }
  return input;
}

/** Popularity is an efficiency hint, never an authorization or quota counter.
 * Concurrent best-effort writes may undercount hits; timestamps never slide. */
export async function readResearchCache<T>(key: string): Promise<ResearchCacheHit<T> | null> {
  try {
    const db = await admin();
    const { data, error } = await db
      .from("research_cache")
      .select("payload, created_at")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return null;
    const entry = data.payload as unknown as Entry<T>;
    const age = Date.now() - Date.parse(data.created_at);
    if (
      entry?.version !== 1 ||
      !Number.isFinite(entry.uses) ||
      !Number.isFinite(age) ||
      age < 0 ||
      age >= RESEARCH_STALE_TTL_MS
    )
      return null;
    // Decide freshness before this visit can promote an expired entry.
    const fresh = age < researchFreshnessMs(entry.uses);
    if (fresh)
      await db.from("research_cache").upsert({
        key,
        kind: "research_result",
        created_at: data.created_at,
        payload: { ...entry, uses: Math.min(1000, entry.uses + 1) } as never,
      });
    return { value: entry.value, createdAt: data.created_at, fresh };
  } catch {
    return null;
  }
}

export async function writeResearchCache<T>(key: string, value: T) {
  try {
    const db = await admin();
    await db.from("research_cache").upsert({
      key,
      kind: "research_result",
      created_at: new Date().toISOString(),
      payload: { version: 1, value, uses: 1 } as never,
    });
  } catch {
    /* Caching is optional; a completed answer must remain usable. */
  }
}
