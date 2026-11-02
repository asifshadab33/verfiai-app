/** DOI parsing helpers shared by the free tools. Pure. */
const TRAIL = /[.,;:'"’”>\]}]+$/;

export function normalizeDoi(raw: string): string | null {
  let s = raw.trim().replace(/^[(\[{<"'“‘]+/, "").replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "");
  try { s = decodeURIComponent(s); } catch { /* keep as typed */ }
  s = s.replace(TRAIL, "");
  while (s.endsWith(")") && (s.match(/\(/g)?.length ?? 0) < (s.match(/\)/g)?.length ?? 0)) s = s.slice(0, -1).replace(TRAIL, "");
  return /^10\.\d{4,9}\/\S+$/.test(s) ? s : null;
}

/** Finds DOIs anywhere in pasted text or reference lists; de-duplicates ignoring case. */
export function extractDois(text: string, max = 10): { dois: string[]; total: number } {
  const seen = new Set<string>(), all: string[] = [];
  for (const m of text.replace(/%2F/gi, "/").matchAll(/10\.\d{4,9}\/[^\s"<>]+/g)) {
    const d = normalizeDoi(m[0]);
    if (!d || seen.has(d.toLowerCase())) continue;
    seen.add(d.toLowerCase()); all.push(d);
  }
  return { dois: all.slice(0, max), total: all.length };
}
