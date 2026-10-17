# VerifAI

TanStack Start application for AI-assisted research reports and Crossref citation checks.

## Local development
Install dependencies with `bun install` and start with `bun run dev`. The project requires a server-side `LOVABLE_API_KEY` for the AI Gateway; never put it in browser code. Without it, report generation and citation extraction cannot run. The public Crossref API is used for citation matching.

## Current architecture
The homepage studio offers three workspace tools: research reports, a claim fact-checker, and the citation checker, plus a separate Deep Dossier tab. Google and email accounts are live, with server-side usage limits and metering, saved reports, feature flags (`src/lib/flags.server.ts`), and verdict feedback stored server-side. Research reports run live web search (Tavily, Brave, GDELT, DuckDuckGo, Wikipedia, OpenAlex, PubMed, You.com/SearXNG optional) with normalized database caching and multi-model failover (`src/lib/model.server.ts`); claim checks use multi-engine consensus with a 24-hour verification cache and rate limits. The citation checker matches references against Crossref with an OpenAlex fallback. The Deep Dossier performs deduplicated multi-pass synthesis with an annotated bibliography. Reports can be shared via unguessable `/r/$token` links and exported to watermarked Word; free exports carry a watermark.

New paid checkout is intentionally disabled during community free access until October 13, 2027 (`MONETIZATION_ENABLED = false` in `src/lib/community.ts`); existing billing management remains available for current customers. Do not advertise paid plans as purchasable until checkout and entitlements are re-enabled.

The report tool reads a single .txt, .md, .docx, .csv or .pdf file (5 MB maximum); text is processed by AI providers and search engines under their own retention policies — do not send confidential, regulated, or unpublished material. No virus scanner or long-term file storage exists. AI output is not independent verification: verdict labels are the AI's assessment of the sources it found, and users should review the cited sources themselves.

## Languages and pages
Nineteen locales have translated interface dictionaries in `src/lib/i18n/`; Arabic, Urdu and Persian render RTL. Language selection is saved both in the `?lang=` URL and browser storage. The citation checker UI is localized. Each leaf route provides its own SEO metadata and JSON-LD, and the generated sitemap lists the public pages.

## Before launch
The community free-access period runs to October 13, 2027, after which Pro and Teams pricing will be announced; fair-use limits and metering already run server-side. Paid checkout must be re-enabled and tested end to end (Paddle, entitlements, refund policy) before any paid capability is advertised. Validate provider costs and coverage, confirm AI-vendor retention terms, complete an accessibility pass and test matrix, and measure activation and repeat usage before paid acquisition. Do not claim features or accuracy figures that have not been actually built or measured.
