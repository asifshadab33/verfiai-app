/** Rule-based headline signals (English-language heuristics). Pure; nothing is uploaded or scored by a model. */
export type CheckStatus = "good" | "warn" | "note";
export type HeadlineCheck = { id: string; label: string; status: CheckStatus; detail: string };
export type HeadlineReport = { headline: string; characters: number; words: number; checks: HeadlineCheck[]; good: number; warnings: number };

const CLICKBAIT = [
  /you won['’]?t believe/i, /what happens next/i, /will (?:blow|melt) your/i, /mind[- ]?blowing/i, /one (?:weird|simple) trick/i,
  /doctors? (?:hate|don['’]?t want)/i, /nobody (?:is )?talking about/i, /the truth about/i, /here['’]?s why/i, /this is why/i,
  /everything you (?:know|thought)/i, /\b(?:shocking|unbelievable|jaw[- ]dropping|epic fail)\b/i, /you(?:['’]ll| will) never guess/i, /gone (?:wrong|viral)/i,
];
const ABSOLUTE = /\b(?:always|never|everyone|nobody|no one|proves?|proven|guaranteed?|100\s?%|cures?|cured|miracle|definitely|undeniable|impossible|only way)\b/gi;
const VAGUE = /\b(?:studies|research|experts?|scientists?|doctors?|sources?|critics?|insiders?|analysts?) (?:show|shows|say|says|claim|claims|agree|agrees|warn|warns|reveal|reveals|suggest|suggests)\b/gi;
const EMOTIVE = new Set("amazing incredible shocking stunning brutal devastating horrifying heartbreaking terrifying outrageous disgusting insane crazy secret revealed exposed slams destroys blasts epic ultimate best worst terrible awful scandal furious".split(" "));

const uniq = (a: string[]) => [...new Set(a.map(s => s.toLowerCase()))];

export function analyzeHeadline(raw: string): HeadlineReport {
  const headline = raw.replace(/\s+/g, " ").trim();
  const words = headline.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) ?? [];
  const checks: HeadlineCheck[] = [];
  const add = (id: string, label: string, status: CheckStatus, detail: string) => checks.push({ id, label, status, detail });
  const chars = Array.from(headline).length;
  if (!headline) return { headline, characters: 0, words: 0, checks, good: 0, warnings: 0 };

  if (chars < 30) add("length", "Length", "warn", `${chars} characters is short; there may be room to be more specific.`);
  else if (chars > 70) add("length", "Length", "warn", `${chars} characters; search results often cut headlines after about 60 to 70 characters.`);
  else add("length", "Length", "good", `${chars} characters fits typical search-result and social previews.`);

  if (words.length < 5) add("words", "Word count", "warn", `${words.length} words; very short headlines can be vague.`);
  else if (words.length > 14) add("words", "Word count", "warn", `${words.length} words; long headlines are harder to scan.`);
  else add("words", "Word count", "good", `${words.length} words is easy to scan.`);

  if (/\d/.test(headline)) add("number", "Specific number", "good", "A number makes the claim specific. Make sure the article backs it up.");
  else add("number", "Specific number", "note", "No number. That is fine if the headline names something concrete another way.");

  const bait = CLICKBAIT.map(r => headline.match(r)?.[0]).filter((m): m is string => !!m);
  if (bait.length) add("clickbait", "Clickbait phrasing", "warn", `Curiosity-gap wording: ${uniq(bait).map(b => `“${b}”`).join(", ")}. Readers may feel the headline withholds the point.`);
  else add("clickbait", "Clickbait phrasing", "good", "No common curiosity-gap phrases found.");

  const absolute = uniq(headline.match(ABSOLUTE) ?? []);
  if (absolute.length) add("absolute", "Absolute claims", "warn", `Absolute wording: ${absolute.map(a => `“${a}”`).join(", ")}. Absolute claims are hard to support; check the evidence.`);
  else add("absolute", "Absolute claims", "good", "No absolute wording such as “always”, “never” or “proves”.");

  const vague = uniq(headline.match(VAGUE) ?? []);
  if (vague.length) add("attribution", "Vague attribution", "warn", `“${vague.join("”, “")}” does not say who or which study. Name the source if you can.`);
  else add("attribution", "Vague attribution", "good", "No vague “experts say” style attribution found.");

  const emotive = uniq(words.filter(w => EMOTIVE.has(w.toLowerCase())));
  if (emotive.length >= 3) add("emotive", "Emotive words", "warn", `${emotive.length} emotive words (${emotive.join(", ")}) can read as sensational.`);
  else if (emotive.length) add("emotive", "Emotive words", "note", `Emotive wording: ${emotive.join(", ")}.`);

  const letters = headline.match(/\p{L}/gu) ?? [];
  const upper = headline.match(/\p{Lu}/gu) ?? [];
  const shouted = words.filter(w => w.length >= 5 && w === w.toUpperCase() && /\p{L}/u.test(w));
  if (letters.length >= 12 && upper.length / letters.length > 0.5) add("caps", "Capital letters", "warn", "Mostly capital letters can read as shouting.");
  else if (shouted.length) add("caps", "Capital letters", "note", `Fully capitalised: ${shouted.join(", ")}.`);

  if (/[!?]{2,}/.test(headline) || (headline.match(/!/g) ?? []).length > 1) add("punctuation", "Punctuation", "warn", "Repeated exclamation or question marks look sensational.");

  if (/\?\s*$/.test(headline)) add("question", "Question headline", "note", "A question can suggest something the article does not actually establish. Check that the article answers it.");
  if (/^\d+\s/.test(headline)) add("list", "List style", "note", "A numbered list headline sets an expectation of exactly that many items.");

  const scored = checks.filter(c => c.status !== "note");
  return { headline, characters: chars, words: words.length, checks, good: scored.filter(c => c.status === "good").length, warnings: scored.filter(c => c.status === "warn").length };
}
