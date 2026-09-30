// Deterministic evidence aggregation: rejects made-up quotes and stops one site from dominating.
export type Stance = "supports" | "refutes" | "neutral";
export type AggVerdict = "SUPPORTED" | "CONTRADICTED" | "MIXED" | "UNVERIFIABLE";
export type Judgment = { excerptId: string; stance: Stance; quote: string };
export type ExcerptMeta = { originId: string; weight: number };

export const MIN_EVIDENCE_THRESHOLD = 1.5;

const norm = (s: string) => s.toLowerCase().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

export function verifyQuotes(judgments: Judgment[], excerpts: Map<string, string>): Judgment[] {
  return judgments.filter(j => {
    const text = excerpts.get(j.excerptId);
    const q = norm(j.quote);
    if (!text || q.length < 8) return false;
    const t = norm(text);
    const i = t.indexOf(q);
    if (i < 0) return false;
    // word boundaries so "cat" doesn't match "catalog"
    const before = t[i - 1], after = t[i + q.length];
    return (!before || !/\w/.test(before)) && (!after || !/\w/.test(after));
  });
}

export function aggregateEvidence(judgments: Judgment[], meta: Map<string, ExcerptMeta>): AggVerdict {
  const score = { supports: 0, refutes: 0 };
  const seen = new Set<string>();
  for (const j of judgments) {
    const m = meta.get(j.excerptId);
    if (!m || j.stance === "neutral") continue;
    const key = `${m.originId}:${j.stance}`;
    if (seen.has(key)) continue;
    seen.add(key);
    score[j.stance] += m.weight;
  }
  const total = score.supports + score.refutes;
  if (total < MIN_EVIDENCE_THRESHOLD) return "UNVERIFIABLE";
  if (score.supports / total >= 0.8) return "SUPPORTED";
  if (score.refutes / total >= 0.8) return "CONTRADICTED";
  return "MIXED";
}

export function sourceMeta(url: string): ExcerptMeta {
  let host = "";
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
  const strong = /\.(gov|edu|int)(\.[a-z]{2})?$|(^|\.)(nih\.gov|who\.int|nature\.com|science\.org|thelancet\.com|nejm\.org|bmj\.com|doi\.org)$/i.test(host);
  return { originId: host || url, weight: strong ? 2 : 1 };
}
