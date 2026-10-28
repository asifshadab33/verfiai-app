# VerifAI

TanStack Start application for AI-assisted research reports and Crossref citation checks.

## Local development
Install dependencies with `bun install` and start with `bun run dev`. The Lovable AI gateway was removed on October 25; `LOVABLE_API_KEY` is not required for AI calls. AI generation and extraction use only the external model cascade in `src/lib/model.server.ts` and require at least one configured provider key for the selected routes: `CEREBRAS_API_KEY`, `GROQ_API_KEY`, `SAMBANOVA_API_KEY`, `OPENROUTER_API_KEY`, `NVIDIA_API_KEY`, `GEMINI_API_KEY`, `MISTRAL_API_KEY`, `DEEPSEEK_API_KEY`, `DEEPINFRA_API_KEY`, `DASHSCOPE_API_KEY`, or `GITHUB_MODELS_TOKEN`. No individual provider key is mandatory; missing-key providers are skipped, and additional keys enable failover. Keep all these credentials server-side, never in browser code.

`TAVILY_API_KEY` enables Tavily search but is optional in code; unkeyed search engines remain available without it. `BRAVE_SEARCH_API_KEY`, `YDC_API_KEY`, and `GOOGLE_FACTCHECK_API_KEY` are optional search credentials; `SEARXNG_BASE_URL` is an optional endpoint setting. Google Fact Check is silently skipped when its key is absent. The public Crossref API used for citation matching requires no key.

## Current architecture
The homepage studio offers three workspace tools: research reports, a claim fact-checker, and the citation checker, plus a separate Deep Dossier tab. Google and email accounts are live, with server-side usage limits and metering, saved reports, feature flags (`src/lib/flags.server.ts`), and verdict feedback stored server-side. Research reports run live web search (Tavily, Brave, GDELT, DuckDuckGo, Wikipedia, OpenAlex, PubMed, You.com/SearXNG optional) with normalized database caching and multi-model failover (`src/lib/model.server.ts`); claim checks use multi-engine consensus with a 24-hour verification cache and rate limits. The citation checker matches references against Crossref with an OpenAlex fallback. The Deep Dossier performs deduplicated multi-pass synthesis with an annotated bibliography. Reports can be shared via unguessable `/r/$token` links and exported to watermarked Word; free exports carry a watermark.

The dedicated `/fact-checker` page reuses the claim-checking tool. Search also includes Wikidata structured references and optional Google Fact Check results; structured references do not by themselves strengthen a verdict. Research (homepage and `/research`) and fact-checking subscribe to persisted, authenticated Realtime stage events, with completion only after the result is ready. A clearly labeled estimate appears after four seconds without events and cannot reach completion; per-provider detail and reconnect/replay remain deferred. Live fact-check streaming was verified; a separate real report-generation streaming run remains unverified in the roadmap.

Server-generated source-quality scoring uses metadata-based authority, recency, independence, transparency, directness and original-data signals, separately from evidence verdicts. These are estimates, not truth scores or full-source verification. PostHog initializes only in the browser, masks text and element attributes, redacts queries and private report identifiers, and disables session recording and account identification. Configuration was checked, but analytics ingestion remains unconfirmed.

New paid checkout is intentionally disabled during community free access until October 13, 2027 (`MONETIZATION_ENABLED = false` in `src/lib/community.ts`); existing billing management remains available for current customers. Do not advertise paid plans as purchasable until checkout and entitlements are re-enabled.

The report tool reads a single .txt, .md, .docx, .csv or .pdf file (5 MB maximum); text is processed by AI providers and search engines under their own retention policies — do not send confidential, regulated, or unpublished material. No virus scanner or long-term file storage exists. AI output is not independent verification: verdict labels are the AI's assessment of the sources it found, and users should review the cited sources themselves.

## Languages and pages
Nineteen locales have translated interface dictionaries in `src/lib/i18n/`; Arabic, Urdu and Persian render RTL. Language selection is saved both in the `?lang=` URL and browser storage. The citation checker UI is localized. Each leaf route provides its own SEO metadata and JSON-LD, and the generated sitemap lists the public pages.

Editorial fact-check pages retain all 75 claims, but ClaimReview markup is emitted only for the three dated, cited reviews (brain-use myth, Great Wall visibility, and seasons). Markup is withheld on the other 72 pages; unknown original claimants are not inferred. Shared reports at `/r/$token` remain noindexed and excluded from the sitemap.

The completed accessibility audit and its route/language/keyboard coverage are documented in `docs-accessibility-test-matrix.md`; asset provenance and limitations are in `docs-asset-licenses.md`. The audit is recorded test evidence, not a guarantee of continuing conformance.

## Before launch
The community free-access period runs to October 13, 2027, after which Pro and Teams pricing will be announced; fair-use limits and metering already run server-side. Paid checkout must be re-enabled and tested end to end (Paddle, entitlements, refund policy) before any paid capability is advertised. Validate provider costs and coverage, confirm AI-vendor retention terms, maintain and rerun the documented accessibility test matrix, and measure activation and repeat usage before paid acquisition. Do not claim features or accuracy figures that have not been actually built or measured.
