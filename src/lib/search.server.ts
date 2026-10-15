// SearchProvider. One interface over every source engine; each engine is
// individually cached through the CacheProvider and never breaks the caller.
import { cached, cacheKey, CACHE_TTL } from "./cache.server";

export type Source = { title: string; url: string; content: string; published?: string | undefined; score: number };

const stripTags = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

const LANG_CODES: Record<string, string> = { english: "en", spanish: "es", french: "fr", german: "de", portuguese: "pt", italian: "it", dutch: "nl", russian: "ru", turkish: "tr", arabic: "ar", hindi: "hi", bengali: "bn", urdu: "ur", persian: "fa", "mandarin chinese": "zh", chinese: "zh", japanese: "ja", korean: "ko", indonesian: "id", swahili: "sw" };
export const toLangCode = (v?: string) => { const t = (v ?? "en").trim().toLowerCase(); return /^[a-z]{2}$/.test(t) ? t : LANG_CODES[t] ?? "en"; };

type SearchEngine = { id: string; run: (query: string, language?: string) => Promise<Source[]> };

// Tavily (paid web search; key stays server-side).
const tavily: SearchEngine = { id: "tavily", run: async (query) => {
  const key = process.env["TAVILY_API_KEY"];
  if (!key) return [];
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: query.slice(0, 400), search_depth: "basic", max_results: 20, include_answer: false }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  if (!res.ok) { console.error("Tavily error", res.status); return []; }
  const json = await res.json() as { results?: { title: string; url: string; content: string; score: number; published_date?: string }[] };
  return (json.results ?? []).filter(r => r.url?.startsWith("https://")).map(r => ({ title: r.title, url: r.url, content: (r.content ?? "").slice(0, 1500), published: r.published_date, score: r.score }));
} };

// Brave Search API (optional key; skipped when BRAVE_SEARCH_API_KEY is unset).
const brave: SearchEngine = { id: "brave", run: async (query) => {
  const key = process.env["BRAVE_SEARCH_API_KEY"];
  if (!key) return [];
  const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query.slice(0, 380))}&count=10`, { headers: { "X-Subscription-Token": key, Accept: "application/json" }, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("Brave error", res.status); return []; }
  const j = await res.json() as { web?: { results?: { title: string; url: string; description?: string; page_age?: string }[] } };
  return (j.web?.results ?? []).filter(r => r.url?.startsWith("https://")).map(r => ({ title: stripTags(r.title), url: r.url, content: stripTags(r.description ?? "").slice(0, 1500), published: r.page_age, score: 0.6 }));
} };

// You.com Search API (optional key; skipped when YDC_API_KEY is unset).
const youcom: SearchEngine = { id: "youcom", run: async (query) => {
  const key = process.env["YDC_API_KEY"];
  if (!key) return [];
  const res = await fetch(`https://api.ydc-index.io/v1/search?query=${encodeURIComponent(query.slice(0, 380))}&count=10`, { headers: { "X-API-Key": key, Accept: "application/json" }, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("You.com error", res.status); return []; }
  type Hit = { title?: string; url?: string; description?: string; snippets?: string[]; page_age?: string };
  const j = await res.json() as { results?: { web?: Hit[]; news?: Hit[] }; hits?: Hit[] };
  const hits = [...(j.results?.web ?? []), ...(j.results?.news ?? []), ...(j.hits ?? [])];
  return hits.filter(h => h.url?.startsWith("https://") && h.title).map(h => ({ title: stripTags(h.title!), url: h.url!, content: stripTags([h.description, ...(h.snippets ?? [])].filter(Boolean).join(" ")).slice(0, 1500), published: h.page_age, score: 0.6 }));
} };

// SearXNG (self-hosted metasearch; skipped when SEARXNG_BASE_URL is unset).
const searxng: SearchEngine = { id: "searxng", run: async (query, language) => {
  const base = process.env["SEARXNG_BASE_URL"]?.trim().replace(/\/+$/, "");
  if (!base) return [];
  const lang = toLangCode(language);
  const res = await fetch(`${base}/search?q=${encodeURIComponent(query.slice(0, 380))}&format=json&language=${lang}`, { headers: { Accept: "application/json", "User-Agent": "Verfiai/1.0 (hello@verfiai.app)" }, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("SearXNG error", res.status); return []; }
  const j = await res.json() as { results?: { title?: string; url?: string; content?: string; publishedDate?: string }[] };
  return (j.results ?? []).filter(r => r.url?.startsWith("https://") && r.title).slice(0, 10).map(r => ({ title: r.title!, url: r.url!, content: stripTags(r.content ?? "").slice(0, 1500), published: r.publishedDate, score: 0.6 }));
} };

// Day 9: every search provider gets a hard 5-second boundary; a slow provider returns [] instead of stalling the check.
export const PROVIDER_TIMEOUT_MS = 5000;

// GDELT DOC 2.0 news (free, no key), routed through the 2-second queue with backoff retries.
const gdelt: SearchEngine = { id: "gdelt", run: async (query) => {
  const { gdeltFetch } = await import("./gdelt-queue.server");
  const q = query.replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim().slice(0, 250);
  const res = await gdeltFetch(`https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=artlist&maxrecords=15&format=json&sort=hybridrel`, { headers: { "User-Agent": "Verfiai/1.0 (hello@verfiai.app)" } });
  if (!res?.ok) return [];
  const text = await res.text();
  let j: { articles?: { title?: string; url?: string; seendate?: string; domain?: string }[] };
  try { j = JSON.parse(text); } catch { return []; }
  return (j.articles ?? []).filter(a => a.url?.startsWith("https://") && a.title).map(a => ({ title: a.title!, url: a.url!, content: `${a.title} (${a.domain ?? "news"})`, published: a.seendate?.replace(/^(\d{4})(\d{2})(\d{2}).*/, "$1-$2-$3"), score: 0.45 }));
} };

// Crossref scholarly metadata (free, no key).
const crossref: SearchEngine = { id: "crossref", run: async (query) => {
  const url = `https://api.crossref.org/works?query=${encodeURIComponent(query.slice(0, 400))}&rows=5&select=title,URL,abstract,issued,DOI&mailto=hello@verfiai.app`;
  const res = await fetch(url, { headers: { "User-Agent": "Verfiai/1.0 (mailto:hello@verfiai.app)", mailto: "hello@verfiai.app" }, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) return [];
  const json = await res.json() as { message?: { items?: { title?: string[]; URL?: string; abstract?: string; issued?: { "date-parts"?: number[][] }; DOI?: string }[] } };
  return (json.message?.items ?? []).map(it => {
    const parts = it.issued?.["date-parts"]?.[0];
    const link = it.URL ?? (it.DOI ? `https://doi.org/${it.DOI}` : "");
    return { title: it.title?.[0] ?? it.DOI ?? "Untitled", url: link.replace(/^http:/, "https:"), content: stripTags(it.abstract ?? "").slice(0, 1500), published: parts?.length ? parts.map(n => String(n).padStart(2, "0")).join("-") : undefined, score: 0.5 };
  }).filter(s => s.url.startsWith("https://"));
} };

async function wikipediaEdition(query: string, lang: string): Promise<Source[]> {
  const api = `https://${lang}.wikipedia.org/w/api.php`;
  const headers = { "User-Agent": "Verfiai/1.0 (hello@verfiai.app)" };
  const sres = await fetch(`${api}?action=query&list=search&format=json&srsearch=${encodeURIComponent(query.slice(0, 300))}&srlimit=3`, { headers, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!sres.ok) return [];
  const sjson = await sres.json() as { query?: { search?: { title: string; pageid: number }[] } };
  const hits = sjson.query?.search ?? [];
  if (!hits.length) return [];
  const eres = await fetch(`${api}?action=query&prop=extracts&exintro&explaintext&format=json&pageids=${hits.map(h => h.pageid).join("|")}`, { headers, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!eres.ok) return [];
  const ejson = await eres.json() as { query?: { pages?: Record<string, { title?: string; extract?: string }> } };
  const pages = ejson.query?.pages ?? {};
  return hits.map(h => {
    const p = pages[String(h.pageid)];
    return { title: p?.title ?? h.title, url: `https://${lang}.wikipedia.org/?curid=${h.pageid}`, content: (p?.extract ?? "").slice(0, 1500), score: 0.6 };
  }).filter(s => s.content.length > 0);
}

// Wikipedia: English edition, plus the report-language edition when it isn't English (free, no key).
const wikipedia: SearchEngine = { id: "wikipedia", run: async (query, language) => {
  const lang = toLangCode(language);
  const [en, local] = await Promise.all([
    cached({ key: cacheKey("wikipedia:en", [query]), kind: "wikipedia", ttlMs: CACHE_TTL.search(), compute: () => wikipediaEdition(query, "en") }),
    lang === "en" ? Promise.resolve([] as Source[]) : cached({ key: cacheKey(`wikipedia:${lang}`, [query]), kind: "wikipedia", ttlMs: CACHE_TTL.search(), compute: () => wikipediaEdition(query, lang) }),
  ]);
  return [...en, ...local];
} };

// DuckDuckGo official Instant Answer API (free, no key). We do not scrape DDG result pages, per their terms.
const duckduckgo: SearchEngine = { id: "ddg", run: async (query) => {
  const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query.slice(0, 300))}&format=json&no_html=1&skip_disambig=1&t=verfiai`, { headers: { "User-Agent": "Verfiai/1.0 (hello@verfiai.app)" }, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) return [];
  type Topic = { Text?: string; FirstURL?: string; Topics?: Topic[] };
  const j = await res.json() as { Heading?: string; AbstractText?: string; AbstractURL?: string; AbstractSource?: string; RelatedTopics?: Topic[] };
  const out: Source[] = [];
  if (j.AbstractText && j.AbstractURL?.startsWith("https://")) out.push({ title: `${j.Heading ?? query} (${j.AbstractSource ?? "DuckDuckGo"})`, url: j.AbstractURL, content: j.AbstractText.slice(0, 1500), score: 0.55 });
  const flat = (j.RelatedTopics ?? []).flatMap(t => t.Topics ?? [t]);
  for (const t of flat.slice(0, 5)) if (t.Text && t.FirstURL?.startsWith("https://")) out.push({ title: t.Text.slice(0, 120), url: t.FirstURL, content: t.Text.slice(0, 1500), score: 0.4 });
  return out;
} };

// OpenAlex scholarly works (free, no key). Abstracts arrive as an inverted index.
const openalex: SearchEngine = { id: "openalex", run: async (query) => {
  const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(query.slice(0, 300))}&per-page=5&filter=has_abstract:true&mailto=hello@verfiai.app`, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) return [];
  const j = await res.json() as { results?: { title?: string; doi?: string; id?: string; publication_date?: string; abstract_inverted_index?: Record<string, number[]> }[] };
  return (j.results ?? []).map(w => {
    const words: string[] = [];
    for (const [word, pos] of Object.entries(w.abstract_inverted_index ?? {})) for (const p of pos) words[p] = word;
    return { title: w.title ?? "Untitled", url: (w.doi ?? w.id ?? "").replace(/^http:/, "https:"), content: words.filter(Boolean).join(" ").slice(0, 1500), published: w.publication_date, score: 0.55 };
  }).filter(s => s.url.startsWith("https://") && s.content.length > 0);
} };

// PubMed via NCBI E-utilities (free, no key; low volume).
const pubmed: SearchEngine = { id: "pubmed", run: async (query) => {
  const base = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  const tool = "tool=verfiai&email=hello@verfiai.app";
  const sres = await fetch(`${base}/esearch.fcgi?db=pubmed&retmode=json&retmax=4&${tool}&term=${encodeURIComponent(query.slice(0, 300))}`, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!sres.ok) return [];
  const ids = ((await sres.json()) as { esearchresult?: { idlist?: string[] } }).esearchresult?.idlist ?? [];
  if (!ids.length) return [];
  const fres = await fetch(`${base}/efetch.fcgi?db=pubmed&retmode=xml&${tool}&id=${ids.join(",")}`, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!fres.ok) return [];
  const xml = await fres.text();
  return xml.split("<PubmedArticle>").slice(1).map(a => {
    const pmid = a.match(/<PMID[^>]*>(\d+)<\/PMID>/)?.[1] ?? "";
    const title = stripTags(a.match(/<ArticleTitle>([\s\S]*?)<\/ArticleTitle>/)?.[1] ?? "Untitled");
    const abs = [...a.matchAll(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g)].map(m => stripTags(m[1] ?? "")).join(" ");
    const year = a.match(/<PubDate>[\s\S]*?<Year>(\d{4})<\/Year>/)?.[1];
    return { title, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, content: abs.slice(0, 1500), published: year, score: 0.55 };
  }).filter(s => s.content.length > 0 && /\/\d+\/$/.test(s.url));
} };

const docEngine = (id: string, fn: (q: string) => Promise<Source[]>): SearchEngine => ({ id, run: fn });
const ENGINES: Record<string, SearchEngine> = { tavily, brave, youcom, searxng, gdelt, crossref, wikipedia, ddg: duckduckgo, openalex, pubmed,
  openalex_oa: docEngine("openalex_oa", async q => (await import("./providers/documents.server")).openAlexOaSearch(q)),
  semanticscholar: docEngine("semanticscholar", async q => (await import("./providers/documents.server")).semanticScholarSearch(q)),
  core: docEngine("core", async q => (await import("./providers/documents.server")).coreSearch(q)),
  scribd: docEngine("scribd", async q => (await import("./providers/documents.server")).scribdSearch(q, w => tavily.run(w))),
};

/** Runs one engine through the CacheProvider; failures return [] and never break the caller. */
export async function engineSearch(engineId: string, query: string, language?: string): Promise<Source[]> {
  const engine = ENGINES[engineId];
  if (!engine) return [];
  return cached({ key: cacheKey(`search:${engineId}`, [query, engineId === "wikipedia" ? language : undefined]), kind: engineId, ttlMs: CACHE_TTL.search(), compute: () => engine.run(query, language) })
    .catch((e) => { console.error(`search:${engineId} failed`, e); return [] as Source[]; });
}

// Kept for existing callers; each now routes through engineSearch.
export const webSearch = (query: string) => engineSearch("tavily", query);
export const crossrefSearch = (query: string) => engineSearch("crossref", query);
export const duckduckgoSearch = (query: string) => engineSearch("ddg", query);
export const openAlexSearch = (query: string) => engineSearch("openalex", query);
export const pubmedSearch = (query: string) => engineSearch("pubmed", query);
export const wikipediaSearch = (query: string, language?: string) => engineSearch("wikipedia", query, language);

/** All engines in parallel; any failure yields [] and never breaks the caller. */
export async function searchAll(query: string, language?: string, engineIds: string[] = DEFAULT_ENGINES): Promise<Source[]> {
  const results = await Promise.all(engineIds.map(id => engineSearch(id, query, language)));
  return results.flat();
}

export const DEFAULT_ENGINES = ["tavily", "brave", "youcom", "searxng", "gdelt", "crossref", "wikipedia", "ddg", "openalex", "pubmed"];
/** Web/news engines that also receive the counter-angle query (scholarly sources stay single-angle). */
export const COUNTER_ENGINES = ["tavily", "brave", "youcom", "searxng"];

/** Counter-angle query used to surface rebuttals and fact checks alongside affirmative results. */
export const counterQuery = (query: string) => `${query.trim().slice(0, 300)} debunked OR false OR misleading OR "fact check"`;

/**
 * Dual-angle search: the affirmative query on every engine plus a counter/debunk
 * query on web engines, interleaved so neither angle dominates ranking.
 */
export async function dualAngleSearch(query: string, language?: string): Promise<Source[]> {
  const [pro, con] = await Promise.all([searchAll(query, language), searchAll(counterQuery(query), language, COUNTER_ENGINES)]);
  const out: Source[] = [];
  for (let i = 0; i < Math.max(pro.length, con.length); i++) { if (pro[i]) out.push(pro[i]!); if (con[i]) out.push(con[i]!); }
  return out;
}
