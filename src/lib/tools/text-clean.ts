/** Case conversion and text cleaning. Pure; runs in the browser. */
const SMALL = new Set("a an and as at but by for from in nor of on or per the to via vs with".split(" "));
const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

export function toTitleCase(s: string): string {
  const words = [...s.matchAll(WORD)];
  let out = "", pos = 0;
  words.forEach((m, i) => {
    const w = m[0], idx = m.index ?? 0;
    out += s.slice(pos, idx);
    pos = idx + w.length;
    if (/\p{Ll}\p{Lu}/u.test(w) || (w.length > 1 && w === w.toUpperCase() && /\p{L}/u.test(w))) { out += w; return; }
    const lower = w.toLowerCase();
    out += lower.split("-").map((part, k) => (!SMALL.has(part) || (k === 0 && (i === 0 || i === words.length - 1)) ? cap(part) : part)).join("-");
  });
  return out + s.slice(pos);
}

export function toSentenceCase(s: string): string {
  return s.toLowerCase()
    .replace(/(^|[.!?…]\s+|\n\s*)(\p{Ll})/gu, (_m, p: string, c: string) => p + c.toUpperCase())
    .replace(/\bi\b(?=[\s'’.,!?;:]|$)/g, "I");
}

const splitWords = (s: string) => s.replace(/([\p{Ll}\p{N}])(\p{Lu})/gu, "$1 $2").split(/[^\p{L}\p{N}]+/u).filter(Boolean);
export const toCamelCase = (s: string) => splitWords(s).map((w, i) => (i ? cap(w.toLowerCase()) : w.toLowerCase())).join("");
export const toSnakeCase = (s: string) => splitWords(s).map(w => w.toLowerCase()).join("_");
export const toKebabCase = (s: string) => splitWords(s).map(w => w.toLowerCase()).join("-");

export type CaseMode = "none" | "upper" | "lower" | "title" | "sentence" | "camel" | "snake" | "kebab";
export function convertCase(s: string, mode: CaseMode): string {
  switch (mode) {
    case "upper": return s.toUpperCase();
    case "lower": return s.toLowerCase();
    case "title": return toTitleCase(s);
    case "sentence": return toSentenceCase(s);
    case "camel": return toCamelCase(s);
    case "snake": return toSnakeCase(s);
    case "kebab": return toKebabCase(s);
    default: return s;
  }
}

export type CleanOptions = {
  removeInvisible?: boolean; straightenQuotes?: boolean; trimLines?: boolean; collapseSpaces?: boolean;
  unwrapLines?: boolean; fixHyphenation?: boolean; blankLines?: "keep" | "collapse" | "remove"; removeDuplicateLines?: boolean;
};

export function cleanText(input: string, o: CleanOptions = {}): string {
  let s = input.replace(/\r\n?/g, "\n");
  if (o.removeInvisible) s = s.replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, "");
  if (o.straightenQuotes) s = s.replace(/[“”„‟]/g, '"').replace(/[‘’‚‛]/g, "'");
  if (o.trimLines) s = s.split("\n").map(l => l.trim()).join("\n");
  if (o.fixHyphenation) s = s.replace(/(\p{L})-\n(\p{Ll})/gu, "$1$2");
  if (o.unwrapLines) s = s.split(/\n{2,}/).map(p => p.replace(/\n/g, " ")).join("\n\n");
  if (o.collapseSpaces) s = s.replace(/[ \t ]{2,}/g, " ");
  if (o.blankLines === "collapse") s = s.replace(/\n{3,}/g, "\n\n");
  else if (o.blankLines === "remove") s = s.split("\n").filter(l => l.trim()).join("\n");
  if (o.removeDuplicateLines) { const seen = new Set<string>(); s = s.split("\n").filter(l => { const k = l.trim().toLowerCase(); if (!k) return true; if (seen.has(k)) return false; seen.add(k); return true; }).join("\n"); }
  return s;
}
