/** Maps checked claims back onto sentences of the pasted text. Pure; runs in the browser. */
export type Verdict = "SUPPORTED" | "CONTRADICTED" | "MIXED" | "UNVERIFIABLE";
export type ClaimLike = { claim: string; verdict: Verdict };
export type Annotation = { start: number; end: number; text: string; verdict: Verdict | null; claims: number[] };

const RANK: Record<Verdict, number> = { CONTRADICTED: 3, MIXED: 2, UNVERIFIABLE: 1, SUPPORTED: 0 };
const CJK = /[぀-ヿ㐀-鿿가-힯]/;
const hasSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function";

function tokens(text: string): string[] {
  const norm = text.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase();
  if (hasSegmenter) {
    const out: string[] = [];
    for (const s of new Intl.Segmenter(undefined, { granularity: "word" }).segment(norm)) if (s.isWordLike) out.push(s.segment);
    return out;
  }
  return norm.match(/[\p{L}\p{N}]+/gu) ?? [];
}
const keep = (t: string) => /\d/.test(t) || t.length >= 3 || CJK.test(t);
const stem = (t: string) => (/\d/.test(t) || CJK.test(t) || t.length <= 6 ? t : t.slice(0, 6));
const bag = (text: string) => new Set(tokens(text).filter(keep).map(stem));

export function locateSentences(text: string): { start: number; end: number; text: string }[] {
  const out: { start: number; end: number; text: string }[] = [];
  const push = (raw: string, index: number) => {
    const t = raw.trim();
    if (!/[\p{L}\p{N}]/u.test(t)) return;
    const start = index + (raw.length - raw.trimStart().length);
    out.push({ start, end: start + t.length, text: t });
  };
  if (hasSegmenter) for (const s of new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(text)) push(s.segment, s.index);
  else for (const m of text.matchAll(/[^.!?…。！？\n]+[.!?…。！？]*/g)) push(m[0], m.index ?? 0);
  return out;
}

/** Each claim is attached to the sentence that shares most of its words; the strictest verdict wins. */
export function annotateText(text: string, claims: ClaimLike[]): { sentences: Annotation[]; unmatched: number[] } {
  const sentences = locateSentences(text).map(s => ({ ...s, verdict: null as Verdict | null, claims: [] as number[], words: bag(s.text) }));
  const unmatched: number[] = [];
  claims.forEach((c, i) => {
    const cb = bag(c.claim);
    let best = -1, bestShared = 0, bestScore = 0, bestJac = 0;
    if (cb.size) sentences.forEach((s, k) => {
      let shared = 0;
      for (const t of cb) if (s.words.has(t)) shared++;
      const score = shared / cb.size, jac = shared / (cb.size + s.words.size - shared || 1);
      if (score > bestScore || (score === bestScore && jac > bestJac)) { best = k; bestShared = shared; bestScore = score; bestJac = jac; }
    });
    if (best < 0 || bestScore < 0.5 || bestShared < (cb.size <= 2 ? 1 : 2)) { unmatched.push(i); return; }
    const s = sentences[best]!;
    s.claims.push(i);
    if (s.verdict === null || RANK[c.verdict] > RANK[s.verdict]) s.verdict = c.verdict;
  });
  return { sentences: sentences.map(s => ({ start: s.start, end: s.end, text: s.text, verdict: s.verdict, claims: s.claims })), unmatched };
}

/** Counts only. This describes evidence found for the claims, never whether the text is true or AI-written. */
export function evidenceCoverage(claims: ClaimLike[]) {
  const n = { total: claims.length, supported: 0, contradicted: 0, mixed: 0, insufficient: 0 };
  for (const c of claims) {
    if (c.verdict === "SUPPORTED") n.supported++; else if (c.verdict === "CONTRADICTED") n.contradicted++;
    else if (c.verdict === "MIXED") n.mixed++; else n.insufficient++;
  }
  return { ...n, needsReview: n.contradicted + n.mixed + n.insufficient, supportedPct: n.total ? Math.round((n.supported / n.total) * 100) : 0 };
}
