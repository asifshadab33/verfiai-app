// Document discovery providers: metadata, abstracts and links only. Never downloads or scrapes
// full article/PDF text, to respect copyright. Each provider fails soft (returns []).
import type { Source } from "../search.server";

const T = 5000;
const UA = { "User-Agent": "Verfiai/1.0 (hello@verfiai.app)", Accept: "application/json" };
const strip = (s: string) => s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
export type DocSource = Source & { authors?: string; kind: "scribd" | "unpaywall" | "semanticscholar" | "core"; openAccess?: boolean; citations?: number };

/** Unpaywall: legal open-access copies. Requires a contact email in the query string (no key). */
export async function unpaywallSearch(query: string): Promise<DocSource[]> {
  const res = await fetch(`https://api.unpaywall.org/v2/search?query=${encodeURIComponent(query.slice(0, 200))}&is_oa=true&email=hello@verfiai.app`, { headers: UA, signal: AbortSignal.timeout(T) });
  if (!res.ok) return [];
  type R = { response?: { title?: string; doi_url?: string; year?: number; journal_name?: string; z_authors?: { family?: string }[]; best_oa_location?: { url?: string; url_for_pdf?: string } } };
  const j = await res.json() as { results?: R[] };
  return (j.results ?? []).slice(0, 10).flatMap(({ response: r }) => {
    const url = r?.best_oa_location?.url_for_pdf ?? r?.best_oa_location?.url ?? r?.doi_url;
    if (!r?.title || !url?.startsWith("https://")) return [];
    return [{ kind: "unpaywall" as const, title: r.title, url, content: `${r.title}. ${r.journal_name ?? ""}`.trim(), published: r.year ? String(r.year) : undefined, authors: (r.z_authors ?? []).map(a => a.family).filter(Boolean).slice(0, 4).join(", "), openAccess: true, score: 0.6 }];
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

/** CORE: open-access repository search. Needs CORE_API_KEY (free); skipped when absent. */
export async function coreSearch(query: string): Promise<DocSource[]> {
  const key = process.env["CORE_API_KEY"];
  if (!key) return [];
  const res = await fetch(`https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(query.slice(0, 200))}&limit=10`, { headers: { ...UA, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(T) });
  if (!res.ok) return [];
  type W = { title?: string; abstract?: string; doi?: string; downloadUrl?: string; yearPublished?: number; authors?: { name: string }[]; links?: { type: string; url: string }[] };
  const j = await res.json() as { results?: W[] };
  return (j.results ?? []).flatMap(w => {
    const url = w.doi ? `https://doi.org/${w.doi}` : w.links?.find(l => l.type === "display")?.url ?? w.downloadUrl;
    if (!w.title || !url?.startsWith("https://")) return [];
    return [{ kind: "core" as const, title: w.title, url, content: strip(w.abstract ?? w.title).slice(0, 1500), published: w.yearPublished ? String(w.yearPublished) : undefined, authors: (w.authors ?? []).map(a => a.name).slice(0, 4).join(", "), openAccess: true, score: 0.6 }];
  });
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
