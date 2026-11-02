/** Pure, browser-safe text statistics. Nothing here touches the network or storage. */
export type TextStats = {
  characters: number; charactersNoSpaces: number; words: number; sentences: number; paragraphs: number;
  readingMinutes: number; speakingMinutes: number; averageWordLength: number; averageSentenceWords: number;
  fleschReadingEase: number | null; topWords: { word: string; count: number }[];
};

const CJK = /[぀-ヿ㐀-鿿가-힯]/g;
const hasSegmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function";
const STOP = new Set("the and for are but not you all any can had her was one our out has have this that with from they will would there their what about which when your said each she how its who did get may him his now old see two way use been into than then them these some could other more very just also only over such even most made after where those being because should while".split(" "));

export function wordsOf(text: string): string[] {
  if (hasSegmenter) {
    const out: string[] = [];
    for (const s of new Intl.Segmenter(undefined, { granularity: "word" }).segment(text)) if (s.isWordLike) out.push(s.segment);
    return out;
  }
  return text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
}

export function sentencesOf(text: string): string[] {
  const out: string[] = [];
  if (hasSegmenter) {
    for (const s of new Intl.Segmenter(undefined, { granularity: "sentence" }).segment(text)) { const t = s.segment.trim(); if (/[\p{L}\p{N}]/u.test(t)) out.push(t); }
    return out;
  }
  return text.split(/(?<=[.!?…。！？])\s+|\n+/).map(t => t.trim()).filter(t => /[\p{L}\p{N}]/u.test(t));
}

function syllables(word: string) {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const stripped = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "");
  return Math.max(1, (stripped.match(/[aeiouy]{1,2}/g) ?? []).length);
}

/** Flesch scoring is only meaningful for English prose, so other languages return null. */
function looksEnglish(text: string, words: string[]) {
  if (words.length < 30) return false;
  const letters = (text.match(/\p{L}/gu) ?? []).length || 1;
  if ((text.match(/[A-Za-z]/g) ?? []).length / letters < 0.9) return false;
  return words.filter(w => STOP.has(w.toLowerCase())).length / words.length >= 0.12;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

export function textStats(text: string): TextStats {
  const words = wordsOf(text);
  const sentences = sentencesOf(text).length;
  const letters = (text.match(/\p{L}/gu) ?? []).length || 1;
  const cjk = (text.match(CJK) ?? []).length;
  const cjkHeavy = cjk / letters > 0.3;
  const counts = new Map<string, number>();
  for (const w of words) { const k = w.toLowerCase(); if (k.length >= 4 && !STOP.has(k) && !/^\d+$/.test(k)) counts.set(k, (counts.get(k) ?? 0) + 1); }
  const topWords = [...counts].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 8).map(([word, count]) => ({ word, count }));
  let flesch: number | null = null;
  if (looksEnglish(text, words) && sentences > 0) {
    const syl = words.reduce((n, w) => n + syllables(w), 0);
    flesch = round1(Math.max(0, Math.min(100, 206.835 - 1.015 * (words.length / sentences) - 84.6 * (syl / words.length))));
  }
  return {
    characters: Array.from(text).length,
    charactersNoSpaces: Array.from(text.replace(/\s/g, "")).length,
    words: words.length,
    sentences,
    paragraphs: text.split(/\n\s*\n/).filter(p => p.trim()).length,
    readingMinutes: round1(cjkHeavy ? cjk / 500 : words.length / 238),
    speakingMinutes: round1(cjkHeavy ? cjk / 300 : words.length / 150),
    averageWordLength: words.length ? round1(words.reduce((n, w) => n + Array.from(w).length, 0) / words.length) : 0,
    averageSentenceWords: sentences ? round1(words.length / sentences) : 0,
    fleschReadingEase: flesch,
    topWords,
  };
}
