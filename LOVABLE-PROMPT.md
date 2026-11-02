Owner-approved. The free-tools files are ALREADY in the project (added via GitHub/editor): src/lib/tools/*, src/lib/tools.functions.ts, src/lib/tools-limit.server.ts, src/components/verifai/tools/*, src/routes/ai-answer-checker.tsx, src/routes/tools/*. Do NOT rewrite, restyle or "improve" them. Do not publish. Do NOT touch model/routing code, flags, pricing, consent/analytics, or any file not named below.

Make exactly these edits:

1) src/lib/citation.server.ts: add this import with the other imports:
import { collectNotices, integrityOf, type Integrity, type Notice } from "./tools/doi-notices";
then append this block at the very END of the file (it reuses the file's existing UA, crossref(), openAlex(), cached, cacheKey and CACHE_TTL; if any of those names differ, adapt only the names):

// ---- DOI-only lookup for the free DOI checker (appended to citation.server.ts) ----
// Import at the top of the file: import { collectNotices, integrityOf, type Integrity, type Notice } from "./tools/doi-notices";
export type DoiRecord = {
  doi: string; status: "found" | "not_found" | "unreachable"; integrity: Integrity;
  title?: string | undefined; journal?: string | undefined; year?: string | undefined; type?: string | undefined;
  publisher?: string | undefined; citedBy?: number | undefined; notices: Notice[]; source: "crossref" | "openalex" | "doi.org";
};

class DoiMiss extends Error {
  kind: "not_found" | "unreachable";
  constructor(kind: "not_found" | "unreachable") { super(kind); this.kind = kind; }
}

/** Crossref work record, distinguishing "does not exist" from "could not reach". */
async function crossrefWork(doi: string): Promise<any | "missing" | "error"> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) });
      if (res.ok) return ((await res.json()) as { message: any }).message;
      if (res.status === 404) return "missing";
      if (res.status !== 429 && res.status < 500) return "error";
    } catch { /* timeout/network: retry once */ }
    if (attempt === 0) await new Promise(r => setTimeout(r, 800));
  }
  return "error";
}

/** The DOI Foundation's resolver confirms registration even when Crossref has no metadata (e.g. DataCite DOIs). */
async function doiRegistered(doi: string): Promise<boolean> {
  try {
    const res = await fetch(`https://doi.org/api/handles/${doi.split("/").map(encodeURIComponent).join("/")}`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(6000) });
    return res.ok && ((await res.json()) as { responseCode?: number }).responseCode === 1;
  } catch { return false; }
}

async function lookupDoiUncached(doi: string): Promise<DoiRecord> {
  let work = await crossrefWork(doi);
  let source: DoiRecord["source"] = "crossref";
  if (work === "missing" || work === "error") {
    const alt = (await openAlex({ raw: doi, title: "" }, doi))[0];
    if (alt) { work = alt; source = "openalex"; }
    else if (await doiRegistered(doi)) return { doi, status: "found", integrity: "none", notices: [], source: "doi.org" };
    else throw new DoiMiss(work === "missing" ? "not_found" : "unreachable");
  }
  const title = String(work.title?.[0] ?? "");
  const noticeItems: any[] = source === "crossref" ? ((await crossref(`works?filter=updates:${encodeURIComponent(doi)}&rows=20`))?.message?.items ?? []) : [];
  const notices = collectNotices(doi, work, noticeItems);
  return {
    doi: String(work.DOI ?? doi), status: "found", integrity: integrityOf(title, notices), title: title || undefined,
    journal: work["container-title"]?.[0], year: String(work.issued?.["date-parts"]?.[0]?.[0] ?? "") || undefined,
    type: work.type, publisher: work.publisher, citedBy: work["is-referenced-by-count"], notices, source,
  };
}

/** DOI-only lookup (no title matching): existence, metadata, retraction/correction notices. Found records cache ~1 month; misses are never cached. */
export async function lookupDoiRecord(input: string): Promise<DoiRecord> {
  const doi = input.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").replace(/^doi:\s*/i, "").trim();
  try {
    return await cached({ key: cacheKey("doirecord", [doi]), kind: "crossref", ttlMs: CACHE_TTL.citation(), compute: () => lookupDoiUncached(doi) });
  } catch (e) {
    return { doi, status: e instanceof DoiMiss ? e.kind : "unreachable", integrity: "none", notices: [], source: "crossref" };
  }
}

2) src/components/verifai/FactChecker.tsx (nine small edits; nothing else in this file may change):
 a. After the import of useVerificationProgress add: import { AnnotatedAnswer } from "./tools/AnnotatedAnswer";
 b. Change the signature to: export function FactChecker({ lang, variant = "default" }: { lang: Lang; variant?: "default" | "answer" }) { and add on the next line: const answer = variant === "answer";
 c. After const [claims, setClaims] = useState<ClaimResult[] | null>(null); add: const [checkedText, setCheckedText] = useState("");
 d. Where setClaims(r.claims); is called, add after it: setCheckedText(mode === "text" ? text : "");
 e. In the h2, replace {tx("factTitle")} with {answer ? "Check an AI answer" : tx("factTitle")}
 f. In the intro p, replace {tx("factIntro")} with {answer ? "Paste text written by an AI tool. Each factual claim is checked against sources, and the sentences they came from are marked." : tx("factIntro")}
 g. On the input-type toggle div (role="group" aria-label={tx("factInputType")}), make className a template string that appends ${answer ? "hidden" : ""}
 h. Immediately before <p className="text-xs text-muted-foreground">{uiText(lang, "consensus")}</p> add: {answer && checkedText ? <AnnotatedAnswer text={checkedText} claims={claims} /> : null}
 i. On the claim card <li key={i} ...> add id={`claim-${i}`} and the class scroll-mt-24.

3) src/routes/sitemap[.]xml.ts: add these paths to PAGES in the existing format: /ai-answer-checker, /tools, /tools/doi-checker, /tools/citation-generator, /tools/claim-spotter, /tools/photo-check, /tools/headline-analyzer, /tools/text-compare, /tools/word-counter, /tools/text-cleaner. Update the sitemap tests' expected counts accordingly.

4) src/components/verifai/SiteFooter.tsx: next to the Fact checker link add two links with the same classes: /tools labelled "Free tools" and /ai-answer-checker labelled "AI answer checker".

5) Disclosure wording, English only, keeping every other accurate statement:
 - src/routes/privacy.tsx, AI and search processors section: add this paragraph: "Free tools. The DOI checker and citation generator send only the DOIs you enter, from our servers, to Crossref, OpenAlex, the DOI Foundation (doi.org) and Unpaywall. The word counter, text compare, text cleaner, headline analyzer, claim spotter and photo check run in your browser; the text and photos you use in them are not uploaded to us or to analytics. Reverse image search links open Google Lens, Bing, Yandex or TinEye in a new tab only when you click them, and send that service the image address you entered. The AI answer checker uses the same processors as the fact checker." Keep "Last updated" accurate.
 - src/routes/methodology.tsx: add a short "Free tools" section saying the DOI checker uses Crossref (including Retraction Watch data), OpenAlex as a fallback, the DOI Foundation resolver and Unpaywall; "No notices found" is not proof a paper is sound; citation text comes from registry metadata and may be incomplete; claim spotter, headline analyzer and word counter use simple English-language rules and do not judge truth; photo metadata can be edited or removed.
 - src/routes/faq.tsx: add two Q&As: "Does Verfiai detect AI-written text?" -> "No. Verfiai checks whether claims and citations are supported by sources. It does not try to tell whether a person or an AI wrote a text, because such detectors are unreliable and can wrongly flag honest writers." and "Are the free tools really free?" -> "Yes. Tools that run in your browser have no limit. Tools that look things up in public registries (DOI checker, citation generator) have fair-use limits, and the AI answer checker uses your free claim-check allowance."

Then: run the full test suite and the production build (the new files include 64 tests that must pass), fix only type/lint nits in the new files without changing behaviour, and add a short roadmap.md entry. Report files changed, test/build status, and anything you could not verify. Do not publish.
