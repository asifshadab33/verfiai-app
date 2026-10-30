// SearchProvider. One interface over every source engine; each engine is
// individually cached through the CacheProvider and never breaks the caller.
import type { ScoringSource } from "./evidence";
import { cached, cacheKey, CACHE_TTL } from "./cache.server";

export type Source = ScoringSource & { title: string; url: string; content: string; published?: string | undefined; score: number };

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
  const json = await res.json() as { results?: { title: string; url: string; content: string; score: number; published_date?: string; author?: string; publisher?: string }[] };
  return (json.results ?? []).filter(r => r.url?.startsWith("https://")).map(r => ({ title: r.title, url: r.url, content: (r.content ?? "").slice(0, 1500), published: r.published_date, score: r.score, author: r.author, publisher: r.publisher }));
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
  const headers = { "User-Agent": "Verfiai/1.0 (https://verfiai.app; mailto:hello@verfiai.app)", Accept: "application/json" };
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
  const edition = (code: string) => cached({ key: cacheKey(`wikipedia:${code}`, [query]), kind: "wikipedia", ttlMs: CACHE_TTL.search(), compute: () => wikipediaEdition(query, code) }).catch(() => [] as Source[]);
  const [en, local] = await Promise.all([
    edition("en"),
    lang === "en" ? Promise.resolve([] as Source[]) : edition(lang),
  ]);
  // A blocked local edition must not discard English evidence. Search indexed local
  // pages through available cached providers; these are snippets, not verified quotes.
  if (lang !== "en" && !local.length) {
    const alternatives = await searchAll(`${query.slice(0, 250)} site:${lang}.wikipedia.org`, lang, COUNTER_ENGINES);
    const localLinks = alternatives.filter(s => {
      try { return new URL(s.url).hostname === `${lang}.wikipedia.org`; } catch { return false; }
    });
    return [...en, ...localLinks];
  }
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
  const j = await res.json() as { results?: { title?: string; doi?: string; id?: string; publication_date?: string; authorships?: { author?: { display_name?: string } }[]; abstract_inverted_index?: Record<string, number[]> }[] };
  return (j.results ?? []).map(w => {
    const words: string[] = [];
    for (const [word, pos] of Object.entries(w.abstract_inverted_index ?? {})) for (const p of pos) words[p] = word;
    return { title: w.title ?? "Untitled", url: (w.doi ?? w.id ?? "").replace(/^http:/, "https:"), content: words.filter(Boolean).join(" ").slice(0, 1500), published: w.publication_date, author: w.authorships?.map(a => a.author?.display_name).filter(Boolean).join(", "), score: 0.55 };
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
    const author = [...a.matchAll(/<LastName>([^<]+)<\/LastName>/g)].map(m => m[1]).join(", ");
    return { title, author, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`, content: abs.slice(0, 1500), published: year, score: 0.55 };
  }).filter(s => s.content.length > 0 && /\/\d+\/$/.test(s.url));
} };

// Wikidata structured reference (free, no key). Entity search through the SPARQL
// query service, mapped to the standard result shape — useful for structured
// who/when/how-many questions. Entries are reference context, not evidence quotes.
const wikidata: SearchEngine = { id: "wikidata", run: async (query, language) => {
  const lang = toLangCode(language);
  const sparql = `SELECT ?item ?itemLabel ?itemDescription WHERE { SERVICE wikibase:mwapi { bd:serviceParam wikibase:endpoint "www.wikidata.org"; wikibase:api "EntitySearch"; mwapi:search ${JSON.stringify(query.slice(0, 300))}; mwapi:language "${lang}". ?item wikibase:apiOutputItem mwapi:item. } OPTIONAL { ?item schema:description ?itemDescription. FILTER(LANG(?itemDescription) IN ("${lang}", "en")) } SERVICE wikibase:label { bd:serviceParam wikibase:language "${lang},en". } } LIMIT 5`;
  const res = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json`, { headers: { Accept: "application/sparql-results+json", "User-Agent": "Verfiai/1.0 (https://verfiai.app; mailto:hello@verfiai.app)" }, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("Wikidata error", res.status); return []; }
  type Row = { item?: { value: string }; itemLabel?: { value?: string }; itemDescription?: { value?: string } };
  const j = await res.json() as { results?: { bindings?: Row[] } };
  const seen = new Set<string>();
  // The endpoint returns http://www.wikidata.org/entity/Q… URIs; results are
  // normalized to the canonical https://www.wikidata.org/wiki/Q… entry URL.
  return (j.results?.bindings ?? []).map(r => {
    const qid = (r.item?.value ?? "").split("/").pop() ?? "";
    return { r, qid };
  }).filter(({ qid }) => /^Q\d+$/.test(qid) && !seen.has(qid) && (seen.add(qid), true)).map(({ r, qid }) => ({
    title: stripTags(r.itemLabel?.value ?? qid),
    url: `https://www.wikidata.org/wiki/${qid}`,
    content: stripTags(`Wikidata structured reference: ${r.itemLabel?.value ?? qid} — ${r.itemDescription?.value ?? ""}`).slice(0, 1500),
    sourceType: "reference",
    score: 0.5,
  }));
} };

// Google Fact Check Tools ClaimReview search; missing keys silently skip it.
// Preserve the legacy secret name while accepting the owner's new spelling.
// Each result is a professional fact-check verdict: the strongest claim signal.
const googleFactCheck: SearchEngine = { id: "google-factcheck", run: async (query) => {
  const key = process.env["GOOGLE_FACT_CHECK_API_KEY"] || process.env["GOOGLE_FACTCHECK_API_KEY"];
  if (!key) return [];
  const res = await fetch(`https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query.slice(0, 380))}&pageSize=10`, { headers: { "X-Goog-Api-Key": key }, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("Google Fact Check error", res.status); return []; }
  type Review = { url?: string; title?: string; textualRating?: string; reviewDate?: string; publisher?: { name?: string; site?: string } };
  const j = await res.json() as { claims?: { text?: string; claimReview?: Review[] }[] };
  return (j.claims ?? []).flatMap(c => (c.claimReview ?? []).filter(r => r.url?.startsWith("https://")).map(r => ({
    title: stripTags(r.title ?? c.text ?? "Fact check").slice(0, 200),
    url: r.url!,
    content: stripTags(`Claim: ${c.text ?? ""} ${r.textualRating ? `— Rated: ${r.textualRating}` : ""} (${r.publisher?.name ?? "fact-checker"}${r.reviewDate ? `, ${r.reviewDate.slice(0, 10)}` : ""})`).slice(0, 1500),
    published: r.reviewDate,
    publisher: r.publisher?.name,
    score: 0.7,
  })));
} };

// Community sentiment (Quora + Reddit) through site-scoped Tavily searches.
// Tier 3 context only: registered outside DEFAULT_ENGINES so fact-check verdicts
// can never consume it; research reports may list it as low-weight context.
const COMMUNITY_HOSTS = new Set(["quora.com", "reddit.com"]);
const community: SearchEngine = { id: "community", run: async (query) => {
  const key = process.env["TAVILY_API_KEY"];
  if (!key) return [];
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: query.slice(0, 400), search_depth: "basic", max_results: 6, include_answer: false, include_domains: ["quora.com", "www.quora.com", "reddit.com", "www.reddit.com"] }),
    signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
  });
  if (!res.ok) { console.error("Tavily community error", res.status); return []; }
  const json = await res.json() as { results?: { title: string; url: string; content: string; published_date?: string }[] };
  return (json.results ?? []).filter(r => {
    if (!r.url?.startsWith("https://")) return false;
    try { return COMMUNITY_HOSTS.has(new URL(r.url).hostname.replace(/^www\./, "")); } catch { return false; }
  }).map(r => ({ title: stripTags(r.title), url: r.url, content: stripTags(r.content ?? "").slice(0, 1500), published: r.published_date, score: 0.3, sourceType: "community" }));
} };

// Stack Exchange (Skeptics) public Q&A via the official SE API (free, no key).
const stackexchange: SearchEngine = { id: "stackexchange", run: async (query) => {
  const res = await fetch(`https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&site=skeptics&pagesize=5&filter=withbody&q=${encodeURIComponent(query.slice(0, 300))}`, { headers: UA_SEARCH, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("Stack Exchange error", res.status); return []; }
  const j = await res.json() as { items?: { title?: string; link?: string; score?: number; creation_date?: number; body?: string }[] };
  return (j.items ?? []).filter(it => it.link?.startsWith("https://") && it.title).map(it => ({
    title: stripTags(it.title!), url: it.link!,
    content: stripTags(it.body ?? it.title!).slice(0, 1500),
    published: it.creation_date ? new Date(it.creation_date * 1000).toISOString().slice(0, 10) : undefined,
    score: 0.45,
  }));
} };

// Archive.org item search (free, no key): archived texts and documents.
const wayback: SearchEngine = { id: "wayback", run: async (query) => {
  const res = await fetch(`https://archive.org/advancedsearch.php?q=${encodeURIComponent(query.slice(0, 300))}&fl[]=identifier&fl[]=title&fl[]=description&fl[]=date&rows=5&output=json`, { headers: UA_SEARCH, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("Archive.org error", res.status); return []; }
  const j = await res.json() as { response?: { docs?: { identifier?: string; title?: string | string[]; description?: string | string[]; date?: string }[] } };
  return (j.response?.docs ?? []).filter(d => d.identifier).map(d => ({
    title: stripTags([d.title ?? ""].flat()[0] ?? d.identifier!),
    url: `https://archive.org/details/${encodeURIComponent(d.identifier!)}`,
    content: stripTags([d.description ?? ""].flat()[0] ?? "").slice(0, 1500),
    published: d.date?.slice(0, 10),
    score: 0.4,
  })).filter(s => s.content.length > 0);
} };

// World Bank Documents & Reports (free, no key).
const worldbank: SearchEngine = { id: "worldbank", run: async (query) => {
  const res = await fetch(`https://search.worldbank.org/api/v2/wds?format=json&qterm=${encodeURIComponent(query.slice(0, 300))}&rows=5`, { headers: UA_SEARCH, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("World Bank error", res.status); return []; }
  const j = await res.json() as { documents?: Record<string, { display_title?: string; pdfurl?: string; url?: string; docdt?: string; abstract?: string | { cdata?: string } }> };
  return Object.values(j.documents ?? {}).filter(d => d.display_title).flatMap(d => {
    const link = (d.pdfurl ?? d.url ?? "").replace(/^http:/, "https:");
    if (!link.startsWith("https://")) return [];
    const abs = typeof d.abstract === "string" ? d.abstract : d.abstract?.cdata ?? "";
    return [{ title: stripTags(d.display_title!), url: link, content: stripTags(abs || d.display_title!).slice(0, 1500), published: d.docdt?.slice(0, 10), score: 0.6, sourceType: "official-statistics" }];
  });
} };

// SEC EDGAR full-text search (free, no key; fair-access User-Agent with contact).
const secEdgar: SearchEngine = { id: "sec-edgar", run: async (query) => {
  const res = await fetch(`https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(`"${query.slice(0, 200)}"`)}`, { headers: { "User-Agent": "Verfiai hello@verfiai.app", Accept: "application/json" }, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("SEC EDGAR error", res.status); return []; }
  type Hit = { _id?: string; _source?: { display_names?: string[]; file_date?: string; form?: string; file_description?: string } };
  const j = await res.json() as { hits?: { hits?: Hit[] } };
  return (j.hits?.hits ?? []).flatMap(h => {
    const [adsh, file] = (h._id ?? "").split(":");
    const cik = h._source?.display_names?.length ? (h as unknown as { _source: { ciks?: string[] } })._source.ciks?.[0] : undefined;
    if (!adsh || !file || !cik || !/^\d+$/.test(cik)) return [];
    const url = `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${adsh.replace(/-/g, "")}/${file}`;
    const name = h._source?.display_names?.[0] ?? "SEC filing";
    const form = h._source?.form ? ` (${h._source.form})` : "";
    return [{ title: stripTags(`${name}${form} filing`), url, content: stripTags(`${h._source?.file_description ?? "SEC EDGAR filing"} — ${name}${form}`).slice(0, 1500), published: h._source?.file_date, score: 0.6, sourceType: "official-statistics" }];
  });
} };

// Europe PMC biomedical literature (free, no key).
const europepmc: SearchEngine = { id: "europepmc", run: async (query) => {
  const res = await fetch(`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(query.slice(0, 300))}&format=json&pageSize=5&resultType=core`, { headers: UA_SEARCH, signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) });
  if (!res.ok) { console.error("Europe PMC error", res.status); return []; }
  const j = await res.json() as { resultList?: { result?: { id?: string; title?: string; authorString?: string; pubYear?: string; doi?: string; abstractText?: string }[] } };
  return (j.resultList?.result ?? []).flatMap(r => {
    const url = r.doi ? `https://doi.org/${r.doi}` : r.id ? `https://europepmc.org/article/MED/${r.id}` : "";
    if (!r.title || !url.startsWith("https://")) return [];
    return [{ title: stripTags(r.title), url, content: stripTags(r.abstractText ?? r.title).slice(0, 1500), published: r.pubYear, author: r.authorString, score: 0.6 }];
  });
} };

const UA_SEARCH = { "User-Agent": "Verfiai/1.0 (https://verfiai.app; mailto:hello@verfiai.app)", Accept: "application/json" };
const docEngine = (id: string, fn: (q: string) => Promise<Source[]>): SearchEngine => ({ id, run: fn });
const ENGINES: Record<string, SearchEngine> = { tavily, brave, youcom, searxng, gdelt, crossref, wikipedia, ddg: duckduckgo, openalex, pubmed, wikidata, "google-factcheck": googleFactCheck, community, stackexchange, wayback, worldbank, "sec-edgar": secEdgar, europepmc,
  openalex_oa: docEngine("openalex_oa", async q => (await import("./providers/documents.server")).openAlexOaSearch(q)),
  semanticscholar: docEngine("semanticscholar", async q => (await import("./providers/documents.server")).semanticScholarSearch(q)),
  core: docEngine("core", async q => (await import("./providers/documents.server")).coreSearch(q)),
  scribd: docEngine("scribd", async q => (await import("./providers/documents.server")).scribdSearch(q, w => searchAll(w, "en", ["tavily", "brave", "youcom", "searxng"]))),
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

// Community (Quora/Reddit) is deliberately absent: verdict evidence must never include it.
export const DEFAULT_ENGINES = ["tavily", "brave", "youcom", "searxng", "gdelt", "crossref", "wikipedia", "ddg", "openalex", "pubmed", "wikidata", "google-factcheck", "stackexchange", "wayback", "worldbank", "sec-edgar", "europepmc"];
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
