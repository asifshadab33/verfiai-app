/** Best-effort per-instance sliding-window limiter for the free tools (no database cost). */
export function createLimiter({ windowMs, max }: { windowMs: number; max: number }, now: () => number = Date.now) {
  const hits = new Map<string, number[]>();
  return {
    check(key: string, cost = 1): { ok: boolean; retryAfterSec: number } {
      const t = now(), cutoff = t - windowMs;
      const list = (hits.get(key) ?? []).filter(x => x > cutoff);
      if (list.length + cost > max) {
        hits.set(key, list);
        return { ok: false, retryAfterSec: Math.max(1, Math.ceil(((list[0] ?? t) + windowMs - t) / 1000)) };
      }
      for (let i = 0; i < cost; i++) list.push(t);
      hits.set(key, list);
      if (hits.size > 5000) for (const [k, v] of hits) if (!v.some(x => x > cutoff)) hits.delete(k);
      return { ok: true, retryAfterSec: 0 };
    },
  };
}
export const toolLimiter = createLimiter({ windowMs: 10 * 60_000, max: 40 });
