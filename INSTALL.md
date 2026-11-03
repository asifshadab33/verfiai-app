# Verfiai free tools: install guide

Nine free-tool pages built from your pasted ideas (Tier 1 + Top 5) and the earlier citation/DOI work:

| Page                      | What it is                                                                                           | Cost to run                                  |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| /tools                    | Hub page                                                                                             | none                                         |
| /tools/doi-checker        | DOI exists? retraction / correction / concern? free full text?                                       | Free public registries, cached, rate-limited |
| /tools/citation-generator | DOIs to APA, MLA, Chicago, Harvard, IEEE, Vancouver                                                  | Free DOI resolver, cached, rate-limited      |
| /tools/claim-spotter      | Checkable claims + vague/absolute wording (this is the "claim extractor" and "weasel word detector") | none (browser)                               |
| /tools/photo-check        | Photo metadata (EXIF) + reverse image search links + strip-metadata copy                             | none (browser)                               |
| /tools/headline-analyzer  | Length, clickbait, absolute claims, vague attribution                                                | none (browser)                               |
| /tools/text-compare       | Word-level diff                                                                                      | none (browser)                               |
| /tools/word-counter       | Counts, reading time, keyword repeats                                                                | none (browser)                               |
| /tools/text-cleaner       | Case converter + PDF-paste cleaner                                                                   | none (browser)                               |

## What was verified, and what was not

Verified outside your project: 64 unit tests pass; the DOI lookup passed a mocked-network run
(found, retracted, OpenAlex fallback, DataCite-only, not found, unreachable, misses never cached);
the photo metadata reader was tested on real JPEG, PNG and WebP files and 2,000 randomly corrupted
files without a crash; every new file passes a strict TypeScript check against stubs of your libraries.

NOT verified (I had no network or browser): the live Crossref/doi.org/Unpaywall responses, that all six
CSL style names return text, how the pages look, accessibility in a real browser, and Lovable's build.
Do the 6-step check at the end before publishing.

## Three ways to get the files in (pick one)

A. GitHub (free, no AI credits, recommended): connect the project to GitHub in Lovable, add the files in
this pack at the same paths, commit. Lovable syncs the repo.
B. Lovable Code editor: if your plan offers it, create each file and paste its contents.
C. Lovable chat: only when you have credits, and only for the small edits below (see LOVABLE-PROMPT.md).

## Then make these small edits (or paste LOVABLE-PROMPT.md into Lovable chat)

1. src/lib/citation.server.ts: add the import and append the block in snippets/citation.server.append.ts.
2. src/components/verifai/FactChecker.tsx: nine find/replace edits (listed below).
3. src/routes/sitemap[.]xml.ts: add the 9 new paths to PAGES, then update the sitemap test count.
4. src/components/verifai/SiteFooter.tsx: add a "Free tools" link.
5. Privacy, Methodology and FAQ wording (below).

### FactChecker.tsx edits (exact)

1. After `import { useVerificationProgress } from "@/hooks/useVerificationProgress";` add
   `import { AnnotatedAnswer } from "./tools/AnnotatedAnswer";`
2. Replace `export function FactChecker({ lang }: { lang: Lang }) {` with
   `export function FactChecker({ lang, variant = "default" }: { lang: Lang; variant?: "default" | "answer" }) {`
   and add `const answer = variant === "answer";` as the next line.
3. After `const [claims, setClaims] = useState<ClaimResult[] | null>(null);` add
   `const [checkedText, setCheckedText] = useState("");`
4. Replace `setClaims(r.claims);` with `setClaims(r.claims); setCheckedText(mode === "text" ? text : "");`
5. Replace `{tx("factTitle")}` (inside the h2) with `{answer ? "Check an AI answer" : tx("factTitle")}`
6. Replace `{tx("factIntro")}` (inside the intro p) with
   `{answer ? "Paste text written by an AI tool. Each factual claim is checked against sources, and the sentences they came from are marked." : tx("factIntro")}`
7. On `<div role="group" aria-label={tx("factInputType")} className="mt-6 inline-flex rounded-lg border border-border p-1">`
   change the className to ``className={`mt-6 inline-flex rounded-lg border border-border p-1 ${answer ? "hidden" : ""}`}``
8. Immediately before `<p className="text-xs text-muted-foreground">{uiText(lang, "consensus")}</p>` add
   `{answer && checkedText ? <AnnotatedAnswer text={checkedText} claims={claims} /> : null}`
9. On the claim card `<li key={i} className={`rounded-2xl border border-border bg-card p-5 ${P.accent} border-s-4`}>`
   change to ``<li key={i} id={`claim-${i}`} className={`scroll-mt-24 rounded-2xl border border-border bg-card p-5 ${P.accent} border-s-4`}>``

### Sitemap and footer

New paths: /tools, /tools/doi-checker, /tools/citation-generator, /tools/claim-spotter,
/tools/photo-check, /tools/headline-analyzer, /tools/text-compare, /tools/word-counter, /tools/text-cleaner.
Footer: add `<li><Link to="/tools" className="transition-colors hover:text-footer-foreground hover:underline">Free tools</Link></li>`

### Disclosure wording (English)

Privacy Policy, in the AI and search processors section:
"Free tools. The DOI checker and citation generator send only the DOIs you enter, from our servers, to Crossref, OpenAlex, the DOI Foundation (doi.org) and Unpaywall. The word counter, text compare, text cleaner, headline analyzer, claim spotter and photo check run in your browser; the text and photos you use in them are not uploaded to us or to analytics. Reverse image search links open Google Lens, Bing, Yandex or TinEye in a new tab only when you click them, and send that service the image address you entered."

Methodology, new section "Free tools": say that the DOI checker uses Crossref (including Retraction Watch data),
OpenAlex as a fallback, the DOI Foundation resolver and Unpaywall; that "No notices found" is not proof a paper is
sound; that citation text comes from registry metadata and may be incomplete; that claim spotter, headline analyzer
and word counter use simple English-language rules and do not judge truth; and that photo metadata can be edited or removed.

FAQ, two new questions:

- "Does Verfiai detect AI-written text?" "No. Verfiai checks whether claims and citations are supported by sources. It does not try to tell whether a person or an AI wrote a text, because such detectors are unreliable and can wrongly flag honest writers."
- "Are the free tools really free?" "Yes. Tools that run in your browser have no limit. Tools that look things up in public registries (DOI checker, citation generator) have fair-use limits. The fact checker uses your free claim-check allowance."

Before publishing the privacy sentence: confirm in PostHog that autocapture does not record text typed into
textarea fields (the roadmap says masking is on; check it once), otherwise change "or to analytics".

## Six checks before you publish

1. Build passes; the new routes appear (src/routeTree.gen.ts regenerates by itself).
2. /tools/doi-checker with the "Try an example" text: the Wakefield DOI shows Retracted, the Nature DOI shows No notices, the fake DOI shows DOI not found.
3. /tools/citation-generator: all six styles return text for 10.1038/nature14539. If one style fails, tell me which; its id in src/lib/tools/cite-format.ts may need changing.
4. /fact-checker: paste the example and confirm the claims and evidence are displayed.
5. /tools/photo-check with a phone photo: location shows, "Download a copy without metadata" works, Arabic (?lang=ar) pages still render.
6. Keyboard-only pass on each page, and the cookie banner still works.

## Tier 1 ideas from the paste that I deliberately left out

QR codes, Markdown editor, Pomodoro timer, text-to-speech/speech-to-text, password generator and slug tools.
They bring visitors who will never need a fact checker, each adds pages to keep accessible and translated, and
near-duplicate tool pages in crowded categories can look like thin content to search engines. Good next
candidates that fit the brand: a domain-age (RDAP) checker, a Wayback Machine checker and a link expander.
