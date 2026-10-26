import en from "./i18n/recent.en.json";
import { dictionary } from "./locale-dictionaries";
import { languages } from "./translations";
import type { EvidenceBreakdown } from "./evidence";

/** Static UI translations only; provider titles and quoted evidence remain verbatim. */
export function localeCode(value: string) {
 const input = value.trim().toLowerCase();
 return languages.find(l => l.code === input || l.name.toLowerCase() === input)?.code ?? "en";
}
const keys = new Map(Object.entries(en).map(([key, text]) => [text, key]));
export function recentText(lang: string, text: string, vars: Record<string, string | number> = {}) {
 const key = keys.get(text);
 const translated = key ? dictionary(localeCode(lang))?.recent[key] ?? text : text;
 return translated.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? `{${key}}`));
}
export function evidenceDetail(lang: string, value: string) {
 const t = (text: string, vars: Record<string, string | number> = {}) => recentText(lang, text, vars);
 const authority = value.match(/^(\d+) sources? from Tier 1 .*domains(.*); domain alone/);
 if (authority) return t("{count} sources from Tier 1 (academic, government or institutional) domains{press}; domain alone does not validate a claim.", { count: authority[1] ?? "0", press: authority[2] ? t(", plus Tier 2 established press") : "" });
 const dates = value.match(/^(\d+) of (\d+) sources have parseable publication dates/);
 if (dates) return t("{dated} of {total} sources have parseable publication dates{recent}.", { dated: dates[1] ?? "0", total: dates[2] ?? "0", recent: t(value.includes("at least one") ? "; at least one is within two years" : "; none is confirmed within two years") });
 const publishers = value.match(/^(\d+) independent publisher/);
 if (publishers) return t("{count} independent publishers (subdomains of one base domain count once); shared ownership or reporting may still overlap.", { count: publishers[1] ?? "0" }) + (value.includes("Report citations") ? " " + t("Report citations have not been checked against full source text.") : "");
 return t(value);
}
export function localizedBreakdown(lang: string, value: EvidenceBreakdown): EvidenceBreakdown {
 return { ...value, authority: evidenceDetail(lang, value.authority), recency: evidenceDetail(lang, value.recency), independence: evidenceDetail(lang, value.independence) };
}
export function citationNote(lang: string, note: string) {
 const verified = note.match(/^(DOI and title|Title, author and year) match a (OpenAlex|Crossref) record with no retraction notice\.$/);
 if (verified) return recentText(lang, "{match} match a {provider} record with no retraction notice.", { match: recentText(lang, verified[1] ?? ""), provider: verified[2] ?? "" });
 const partial = note.match(/^Close match found, but (.*)\. Check this reference\.$/);
 if (partial) return recentText(lang, "Close match found, but {issues}. Check this reference.", { issues: (partial[1] ?? "").split(", ").map(s => recentText(lang, s)).join(", ") });
 return recentText(lang, note);
}
