/** Finds sentences that look checkable and flags vague or absolute wording. English heuristics; pure. */
import { locateSentences } from "./claim-highlight";

export type ClaimCandidate = {
  start: number;
  end: number;
  text: string;
  signals: string[];
  strength: "strong" | "likely";
};
export type WordingCategory = "vague-attribution" | "absolute-or-hype" | "hedge";
export type WordingMatch = { start: number; end: number; text: string; category: WordingCategory };

const MONTH =
  "January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec";
const SIGNALS: [string, RegExp, boolean][] = [
  ["number", /\d/, true],
  ["date", new RegExp(`\\b(?:1[5-9]\\d{2}|20\\d{2})\\b|\\b(?:${MONTH})\\b`), true],
  [
    "comparison",
    /\b(?:most|least|largest|biggest|smallest|highest|lowest|the first|first to|fastest|oldest|youngest|more than|less than|fewer than|greater than|better than|worse than|[a-z]+er than)\b/i,
    true,
  ],
  [
    "attribution",
    /\b(?:according to|study|studies|research|report|survey|poll|statistics|scientists?|researchers?|experts?|officials?|published|found that|shows? that|showed that)\b/i,
    true,
  ],
  [
    "causal or definitive",
    /\b(?:causes?|caused|leads? to|led to|results? in|resulted in|increases?|increased|reduces?|reduced|prevents?|cures?|kills?|proves?|linked to|due to|because of|is the|was the|are the|were the)\b/i,
    true,
  ],
  ["named entity", /(?<=\s)(?:[A-Z][a-z]+|[A-Z]{2,})(?:\s+(?:[A-Z][a-z]+|[A-Z]{2,}))*/, false],
  ["quotation", /["“”]/, false],
];
const OPINION = /\b(?:i think|i believe|in my opinion|i feel|we think|seems to me|imo)\b/i;

export function spotClaims(text: string): ClaimCandidate[] {
  const out: ClaimCandidate[] = [];
  for (const s of locateSentences(text)) {
    const words = s.text.split(/\s+/).length;
    if (words < 5 || /\?\s*$/.test(s.text) || OPINION.test(s.text)) continue;
    const hits = SIGNALS.filter(([, re]) => re.test(s.text));
    const signals = hits.map(([name]) => name);
    if (signals.length < 2 || !hits.some(([, , core]) => core)) continue;
    out.push({
      start: s.start,
      end: s.end,
      text: s.text,
      signals,
      strength: signals.length >= 3 ? "strong" : "likely",
    });
  }
  return out;
}

const PHRASES: Record<WordingCategory, RegExp[]> = {
  "vague-attribution": [
    /\b(?:studies|research|experts?|scientists?|doctors?|sources?|critics?|insiders?|analysts?|many people|some people|people|they) (?:show|shows|say|says|suggest|suggests|agree|agrees|believe|believes|claim|claims|warn|warns|reveal|reveals|found)\b/gi,
    /\b(?:some say|it is said|it is widely believed|it is well known|everyone knows|as we all know|common knowledge|reportedly|allegedly)\b/gi,
  ],
  "absolute-or-hype": [
    /\b(?:always|never|everyone|nobody|no one|guaranteed|100\s?%|proven|undeniably|obviously|clearly|of course|totally|completely|absolutely|literally|miracle|game[- ]chang(?:er|ing)|revolutionary|groundbreaking|unprecedented|incredible|shocking|devastating|best ever|worst ever|the best|the worst)\b/gi,
  ],
  hedge: [
    /\b(?:might|could|may|possibly|perhaps|probably|seems? to|appears? to|suggests?|tends? to|likely|unlikely|some evidence)\b/gi,
  ],
};

export function spotWording(text: string): WordingMatch[] {
  const all: WordingMatch[] = [];
  for (const category of Object.keys(PHRASES) as WordingCategory[])
    for (const re of PHRASES[category])
      for (const m of text.matchAll(new RegExp(re.source, re.flags)))
        all.push({ start: m.index ?? 0, end: (m.index ?? 0) + m[0].length, text: m[0], category });
  all.sort((a, b) => a.start - b.start || b.end - a.end);
  const out: WordingMatch[] = [];
  let edge = -1;
  for (const m of all)
    if (m.start >= edge) {
      out.push(m);
      edge = m.end;
    }
  return out;
}
