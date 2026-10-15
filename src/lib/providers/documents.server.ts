// Document discovery providers: metadata, abstracts and links only. Never downloads or scrapes
// full article/PDF text, to respect copyright. Each provider fails soft (returns []).
import type { Source } from "../search.server";

const T = 5000;
const UA = { "User-Agent": "Verfiai/1.0 (hello@verfiai.app)", Accept: "application/json" };
const strip = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
export type DocSource = Source & { authors?: string; kind: "scribd" | "openalex_oa" | "semanticscholar" | "core"; openAccess?: boolean; citations?: number };

type OaWork = { title?: string; doi?: string; publication_year?: number; abstract_inverted_index?: Record<string, number[]> | null; authorships?: { author?: { display_name?: string } }[]; cited_by_count?: number; best_oa_location?: { pdf_url?: string | null; landing_page_url?: string | null } | null; open_access?: { oa_url?: string | null } };
const unInvert = (idx?: Record<string, number[]> | null) => {
  if (!idx) return "";
  const words: string[] = [];
  for (const [w, ps] of Object.entries(idx)) for (const p of ps) words[p] = w;
  return words.filter(Boolean).join(" ");
};

/** OpenAlex open-access keyword search (replaces the retired Unpaywall search endpoint). Keyless, polite pool via mailto. */
export async function openAlexOaSearch(query: string): Promise<DocSource[]> {
  const res = await fetch(`https://api.openalex.org/works?search=${encodeURIComponent(query.slice(0, 200))}&filter=is_oa:true&per-page=10&mailto=hello@verfiai.app`, { headers: UA, signal: AbortSignal.timeout(T) });
  if (!res.ok) return [];
  const j = await res.json() as { results?: OaWork[] };
  return (j.results ?? []).flatMap(w => {
    const url = w.best_oa_location?.pdf_url ?? w.best_oa_location?.landing_page_url ?? w.open_access?.oa_url ?? w.doi;
    if (!w.title || !url?.startsWith("https://")) return [];
    return [{ kind: "openalex_oa" as const, title: w.title, url, content: (unInvert(w.abstract_inverted_index) || w.title).slice(0, 1500), published: w.publication_year ? String(w.publication_year) : undefined, authors: (w.authorships ?? []).map(a => a.author?.display_name).filter(Boolean).slice(0, 4).join(", "), openAccess: true, citations: w.cited_by_count ?? 0, score: 0.65 }];
  });
}

/** Semantic Scholar Graph API: peer-reviewed papers with abstracts and citation counts (no key, rate-limited). */
export async function semanticScholarSearch(query: string): Promise<DocSource[]> {
  const res = await fetch(`https://api.semanticscholar.org/graph/v1/paper/search?query=${encodeURIComponent(query.slice(0, 200))}&limit=10&fields=title,abstract,url,year,authors,citationCount,openAccessPdf,externalIds`, { headers: UA, signal: AbortSignal.timeout(T) });
  if (!res.ok) return [];
  type P = { title?: string; abstract?: string | null; url?: string; year?: number; authors?: { name: string }[]; citationCount?: number; openAccessPdf?: { url?: string } | null; externalIds?: { DOI?: string } };
  const j = await res.json() as { data?: P[] };
  return (j.data ?? []).flatMap(p => {
    const url = p.externalIds?.DOI ? `https://doi.org/${p.externalIds.DOI}` : p.url;
    if (!p.title || !url?.startsWith("https://")) return [];
    return [{ kind: "semanticscholar" as const, title: p.title, url, content: (p.abstract ?? p.title).slice(0, 1500), published: p.year ? String(p.year) : undefined, authors: (p.authors ?? []).map(a => a.name).slice(0, 4).join(", "), openAccess: !!p.openAccessPdf?.url, citations: p.citationCount ?? 0, score: 0.7 }];
  });
}

/** CORE is intentionally disabled (owner decision: no trial key). Always returns no results. */
export async function coreSearch(_query: string): Promise<DocSource[]> {
  return [];
}

/**
 * Scribd: discovers public document URLs via web search (site:scribd.com), then reads only the
 * public oEmbed metadata (title, author). Document text is never fetched.
 */
export async function scribdSearch(query: string, webSearch: (q: string) => Promise<Source[]>): Promise<DocSource[]> {
  const hits = (await webSearch(`${query.slice(0, 200)} site:scribd.com`)).filter(h => /^https:\/\/(www\.)?scribd\.com\/(document|doc|presentation)\//.test(h.url)).slice(0, 5);
  return Promise.all(hits.map(async h => {
    let title = h.title, authors = "";
    try {
      const r = await fetch(`https://www.scribd.com/services/oembed/?url=${encodeURIComponent(h.url)}&format=json`, { headers: UA, signal: AbortSignal.timeout(T) });
      if (r.ok) { const o = await r.json() as { title?: string; author_name?: string }; title = o.title ?? title; authors = o.author_name ?? ""; }
    } catch { /* metadata optional */ }
    return { kind: "scribd" as const, title, url: h.url, content: h.content.slice(0, 600), published: h.published, authors, score: 0.3 };
  }));
}
