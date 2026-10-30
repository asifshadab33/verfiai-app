# Verfiai roadmap
## Oct 30 Day 2 scheduled work
- [ ] Gemini addendum: inspect existing server-only Gemini integration, request GEMINI_API_KEY securely, wire existing AI routes with graceful missing/invalid-key fallback; never expose key values.
- [ ] Finish Google Analytics page tracking using G-NSGRV2SG6X, preserving private URL redaction.
- [ ] 0: Verify applied homepage hydration fix with SSR/reload, full tests and automatic production build before Stage A.
- [ ] 1 / Stage A: remove unused merged translation bundles and deduplicate interface extras; verify all 19 locales.
- [ ] 2 / Stage B: hide unmeasured Response Agreement; verify measured state and Arabic RTL.
- [ ] 3 / Stage 4: split index and HomeSections into focused modules without behavior changes.
- [ ] 4 / Stage 5: add a small editorial review batch only after live cached extraction verifies cited excerpts; retain conservative indexing validator.
- [ ] 5 / Stage 6: full regression suite and security pre-check; STOP for owner approval before publishing. After approved publishing, check five requested pages across all three hosts and sitemap shared-link exclusion.
- Constraints: no Paddle/existing billing, checkout, monetization, provider/cache boundary or admin-feedback changes.
## Oct 29 Stage 4 SEO wave (pulled forward)
- [x] Audited public leaves; added missing bare apex canonicals to 8 routes: features, how-it-works, sample-report, faq, methodology, sources, fact-checks, research. Preserved correct existing canonicals; /app now self-canonicalizes genuine locale variants.
- [x] German/Arabic SSR comparison confirmed primary-copy localization only on / and /app. Both now emit reciprocal 19-language plus English x-default alternates; all 38 served language variants checked. English primary-copy pages, including fact-checker/pricing with localized tool/waitlist islands, deliberately excluded.
- [x] Added noindex,nofollow to auth, reset-password, reports, account/library-usage; strengthened account/usage and checkout/success from noindex to noindex,nofollow. Admin already correct and untouched. All seven outside sitemap; robots.txt, shared reports and editorial indexing logic unchanged. Public guest workspaces /app and /research remain indexable.
- [x] Full suite: 116 passed, four pre-existing privileged tests skipped. Automatic production build OK (05:21:57 UTC). Browser Arabic home RTL → English About LTR verified with locale query retained, correct metadata and zero runtime errors. Sitemap remains 22 URLs; no publish or excluded work.
## Oct 29 hydration fix + Day 1 stages A/B — PAUSED by owner (03:55 UTC)
- [~] Hydration fix APPLIED but NOT YET VERIFIED: index.tsx `<main>` now has declarative id="main-content" tabIndex={-1}; __root.tsx effect now only sets the id as a fallback when missing. Reproduction confirmed the warning beforehand (SSR `<main>` had no id; mutation added it post-hydration). Pending: reload check for warning absence, tests, build.
- [ ] Stage A (NOT STARTED): delete unused bundles src/lib/i18n/checker.json, recent.json, ui-extra.json; dedupe speak_request/hide_advanced/attachment keys between interface.ts extras and site dictionaries.
- [ ] Stage B (NOT STARTED): ReportView renders <ResponseAgreementPanel /> only when a measured state is supplied; component stays intact.
- Constraints: no Paddle/billing changes, MONETIZATION_ENABLED=false, no checkout, no publish. Verify when resumed: full suite (baseline 107 passed/4 skipped), build OK, spot-check 3 locales incl. Arabic RTL, report page clean with panel hidden.
## Oct 28 real progress streaming — Stage 1
- [x] Persist coarse research/verification stages in service-only progress_events, broadcasting HMAC-authenticated payloads to opaque per-run Realtime topics. Guests require no anonymous signup; browser cannot forge accepted events. No prompts, claims, reports or signing secret persisted in telemetry.
- [x] Research (homepage and /research) and FactChecker subscribe before dispatch and render real stage counts, not smooth percentages. After four seconds without an event, show clearly labeled estimated fallback; it never completes. Complete emitted after genuine result readiness (and successful report save for accounts). Cache hits skip unused stages. No provider detail or reconnect/replay work.
- [x] Regression suite: 84 passed, four pre-existing privileged tests skipped; Deep Dossier excluded. Automatic production build OK at 16:33:17 UTC. Real signed-in fact-check rendered verdicts with no runtime errors; live Realtime showed validation/search/scoring/complete, and database readback confirmed all six ordered events including synthesis/rendering. Guest attempt correctly hit existing usage limit; limits unchanged. Report streaming is wired but a separate real report generation was not exercised. No publishing requested.
## Oct 28 approved SEO fixes 1–2
- [x] Add substantive dated reviews to 3/75 editorial pages (brain-use myth, Great Wall visibility, seasons); NASA and BMJ source text verified live through existing cached PageExtractionProvider on Oct 28. Explain documented discussions versus unknown first claimants, preserve qualifications and cite short verified excerpts. Withhold ClaimReview on the remaining 72 pages; all pages retained. NOAA lightning page fetched directly but existing extractor could not retrieve it, so no review added in this conservative subset.
- [x] Preserve shared-report noindex/sitemap exclusion and token/access rules unchanged; add nonempty fallback for absent/blank summaries. English primary-copy pages now declare en/ltr, localized tools keep their own language boundary; root search middleware retains explicit locale. Browser verified Arabic home → English About → Arabic home, three reviewed and one withheld ClaimReview pages, no runtime errors, invalid shared link 404/noindex, sitemap still 94 URLs without /r/. No private user report accessed.
- [x] Regression suite: 79 passed, four existing privileged database tests skipped; Deep Dossier excluded. Automatic production build OK (15:39:46 UTC). All 31 content routes retain their own head metadata. Basic pre-publish security check found no issues; existing guest-access warning untouched. Preview rendered evidence/privacy checks passed; republishing requested after validation.
- Scope: no hreflang, leaf canonical, utility noindex, engine, pricing, library or owner-deferred changes.
## Oct 28 workspace pull-forward
- [x] Item 1 — Published the current project state (includes the FactChecker restyle, the Google site-verification meta tag, and this turn's engine/UI work). Verified 5 pages × 3 hosts: verfiai.app all HTTP 200; www.verfiai.app and verfiai-app.lovable.app 302→apex, final 200 after redirect.
- [x] Item 2 — Added `wikidata` (SPARQL EntitySearch at query.wikidata.org, entity URIs normalized to https://www.wikidata.org/wiki/Q…, Tier 2 structured-reference tier, directness classified "aggregation" so structured entries never directly strengthen verdicts) and `google-factcheck` (ClaimReview claims:search, silent skip without GOOGLE_FACTCHECK_API_KEY, score 0.7 strongest claim signal, publisher/date/rating mapped). Both wired into DEFAULT_ENGINES with the shared cache/timeout/failure-to-empty behavior. Methodology "How sources are found" + "Model and data handling" and FAQ wording updated. New src/lib/search-engines.test.ts (7 cases incl. live-shaped http entity URIs); live SPARQL invocation returned real results.
- [x] Item 3a — Research textarea (#research-question) and report container (#report-output) bind dir/lang from the active locale (verified server-rendered: en → dir="ltr" lang="en", ar → dir="rtl" lang="ar").
- [x] Item 3b — SKIPPED: no "Sign in for Pro" button exists anywhere in the codebase, and adding a new "$9/mo" CTA would contradict the community transition (monetization hidden, Pro pricing not a current offer). Owner to confirm intended location before implementing.
- Verification: full suite 75 passed, 4 pre-existing privileged tests skipped; production build OK (11:55:20 UTC). No new keys requested; no checkout/pricing/CORE/library changes. End-to-end paid fact-check run not performed (Google Fact Check key absent; Wikidata verified live via direct SPARQL call).
- Republish verification (post-engine publish): 15/15 checks HTTP 200 across verfiai.app, www.verfiai.app and verfiai-app.lovable.app (www and lovable.app resolve via apex redirect) on /, /sources, /methodology, /privacy, /fact-checker.
## Oct 27 accessibility and follow-up
- [x] Accessibility: fix verdict contrast, file input labeling, main/skip target and focus indicators; keyboard/Escape Tools menu; Radix demo/studio tabs with RTL navigation; voice privacy button. Axe WCAG A/AA + best-practice: zero violations on 13 routes × en/de/ar; desktop/mobile layout checked. See docs-accessibility-test-matrix.md and docs-asset-licenses.md.
- [x] Link existing PostHog connection; add browser-only initialization, automatic $pageview on initial/history navigation, custom page_view per route, autocapture and pageleave. Mask content/attributes, redact queries/share tokens, disable recording and account identification; privacy disclosure updated.
- [x] Regression suite: 66 passed, four pre-existing privileged database tests skipped; Deep Dossier excluded. Automatic production build OK (04:01:34 UTC).
- [x] Publishing requested for verfiai.app. All eight requested host/page checks returned HTTP 200; reachability does not certify deployment completion. Basic pre-publish security checks found no issues; existing guest-cost warning unchanged. PostHog configuration HTTP 200 verified, ingestion/dashboard event visibility remains unconfirmed.

| Host | Page | HTTP |
|---|---|---|
| https://verfiai.app | `/` | 200 |
| https://verfiai.app | `/sources` | 200 |
| https://verfiai.app | `/methodology` | 200 |
| https://verfiai.app | `/privacy` | 200 |
| https://www.verfiai.app | `/` | 200 |
| https://www.verfiai.app | `/sources` | 200 |
| https://www.verfiai.app | `/methodology` | 200 |
| https://www.verfiai.app | `/privacy` | 200 |
- Scope: no Deep Dossier testing, locale-loading refactoring, library activation/catalog publication, CORE, pricing/checkout or new API keys.
## Oct 26 scheduled fixes
- [x] Repair Semantic Scholar with a service-only atomic database gate (10-second start spacing, exponential 60-second–1-hour backoff, valid Retry-After never shortened, fail-closed coordination), provider-level caching and short negative caching. Live provider invocation: Semantic Scholar 429, OpenAlex 200 with real metadata; next distinct query skipped Semantic Scholar and returned six OpenAlex rows. Upstream recovery to Semantic Scholar 200 is not confirmed; no new key or immediate retry.
- [x] Spot-check de/pt/tr/ru/ja/ko/it/nl/bn/ur/fa/id/sw/hi/zh recent/checker/UI/site strings. Fix German English confirmation/error, Russian/Chinese source-link terminology, Urdu confirmation tense, Indonesian retry, Dutch navigation and Swahili headline/navigation; add 21 missing static scoring translations per locale in both checker/UI dictionaries. Existing placeholders checked without mismatches. Native review remains advisable; named product terms retained.
- [x] Recent history and current imports confirmed lazy loading was not already implemented. Split non-English site and checker/recent/UI dictionaries by locale, retain English fallback eagerly, await selected locale before root loading and hydration, resolve interface copy on access. Browser English fetched no secondary dictionary; German fetched German only; Arabic fetched Arabic only. Arabic desktop/mobile RTL, mirrored icon/text ordering and no mobile overflow verified without layout changes.
- [x] Regression verification: 64 tests passed; four pre-existing privileged library database tests skipped (disposable privileged connection unavailable); Deep Dossier test file explicitly excluded. Automatic production build OK at 00:21:03 UTC. English/German/Arabic SSR descriptions and direction verified with HTTP 200; browser reported no runtime errors. No publishing performed.
- Scope: no Deep Dossier test, dependencies, download/CORE activation, pricing/checkout, new keys, catalog publishing or unrelated work.
## Oct 25 code cleanup — part 2 (unused packages)
- [x] Verified no earlier session removed packages since commit 002314e3 (package.json untouched before this pass). Audited every non-framework dependency plus all 26 @radix-ui packages for imports across src/ and config files (static and dynamic). Removed 34 packages with zero imports: ai/@ai-sdk/openai, @hookform/resolvers, react-hook-form, cmdk, date-fns, embla-carousel-react, input-otp, react-day-picker, react-markdown, react-resizable-panels, recharts, vaul, and 21 unused @radix-ui wrappers (accordion, alert-dialog, aspect-ratio, avatar, collapsible, context-menu, dropdown-menu, hover-card, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, switch, tabs, toggle, toggle-group). Regenerated bun.lock.
- [x] Production bundle unchanged: client JS 4,582,388 bytes (1,439,657 gzip), dist/client 5,922,624 bytes, identical before and after — expected, because unused packages were never imported and therefore never bundled. The improvement is install footprint and lockfile size, not shipped bytes.
- [x] Full suite 60 passed, four privileged library database tests skipped (pre-existing, need a disposable privileged connection). Production build OK (Oct 25 00:17:33 UTC); homepage and /sources return HTTP 200.
- Deliberately retained (conservative): class-variance-authority, clsx, tailwind-merge, sonner, lucide-react (used by kept UI components), docx/mammoth/exceljs/pdf-lib/pdfjs-dist/tesseract.js (lazy-loaded dynamic imports), @paddle/paddle-node-sdk, @lovable.dev/cloud-auth-js, tw-animate-css (styles.css @import), tailwind toolchain, drizzle/postgres tooling. Owner-deferred decisions untouched: downloads preview-only, EXECUTE revoked, CORE disabled, no pricing/checkout or API-key changes, no catalog publication.
## Oct 25 UI component cleanup + gateway removal
- [x] Audit every file in src/components/ui/ for imports anywhere (static, dynamic, re-exports): exactly nine are used — button, checkbox, dialog, input, label, sheet, sonner, textarea, tooltip. Deleted the 34 files with no remaining imports (accordion, alert-dialog, alert, avatar, breadcrumb, calendar, card, carousel, chart, collapsible, command, context-menu, drawer, dropdown-menu, form, hover-card, input-otp, menubar, navigation-menu, pagination, popover, radio-group, resizable, scroll-area, select, separator, skeleton, slider, switch, table, tabs, toggle, toggle-group). package.json untouched in this pass.
- [x] Removed the Lovable AI gateway in a targeted revert: model.server.ts (provider entry, two labels, two lovable:* models at the front of triage and evaluation, X-Lovable-AIG-SDK header), methodology.tsx and privacy.tsx (provider lists now name only the external providers), source-tiers.test.ts (asserts cerebras/groq/sambanova lead the routes). External cascade is the only engine; failover unchanged. Remaining "Lovable" mentions on those pages refer to Lovable Cloud, not the AI gateway.
- [x] Full suite 60 passed, four privileged library database tests skipped (pre-existing, need a disposable privileged connection).
- [x] Production build verification after deletion and revert: build OK (Oct 25 00:16:52 UTC) and typecheck clean after also deleting the unused src/components/ui/sidebar.tsx (35 files total; it alone still imported the deleted separator/skeleton wrappers). / and /sources return HTTP 200 on the running app.
- Deliberately retained: sheet/sonner (imported by /sources) and package.json dependency removal (scheduled as cleanup part 2). No behavior changes; routes, flags, deferred owner decisions untouched.
## Oct 24 code cleanup — part 1
- [x] Remove five files with no static/dynamic imports, re-exports or runtime registration: QuickSearch (superseded demo), ProCheckoutButton (unused null placeholder), and UI aspect-ratio/progress/badge wrappers. Remove the uncalled local Checker HeroMockup and its two exclusive icon imports; remove unused qualitativeStrength/AI_CONSENSUS_NOTE imports from ReportView and FactChecker. Shared dependencies and the live homepage mockup remain intact.
- [x] Consolidate identical Markdown/Word object-URL download mechanics into download-blob.ts, retaining exact filenames, Blob content, unattached anchor click, one-second URL revocation, lazy Word generation and existing watermark/entitlement checks. Add two regression cases for filenames and revocation timing.
- [x] Full suite: 60 passed, four pre-existing privileged library database tests skipped (required disposable privileged connection unavailable). Automatic production build passed Oct 24 04:23:09 UTC; browser verification confirms citation text input and actual Markdown/Word downloads, including Word watermark, with no runtime errors. No production publishing performed.
- Deliberately retained: locally used exported helpers (withCitations/reportToText/ComingSoon and OCR/locale helpers) to preserve interfaces; other UI wrappers not fully audited for side effects; ResponseAgreementPanel's optional measured states; DOCX upload handlers with distinct validation/truncation semantics. Translation loading and all package/dependency removal are reserved for separate work. No live AI/provider checks were needed for this client-only cleanup.
- Scope retained: no dependency removal, translation-loading or accessibility work; routes, flags, preview-only downloads, revoked download EXECUTE, disabled CORE, pricing/checkout and unpublished catalog remain unchanged.
## Oct 24 dependency/configuration security review
- [x] Run basic backend/security checks and production dependency advisory scan; basic checks report no issues and do not include fresh deep code analysis.
- [x] Initial dependency scan: zero critical, five high and four moderate advisory rows (shared vulnerable Zod/Undici dependencies repeated under direct dependents). Upgrade direct Zod to 4.6.6 and pin Zod 4.6.6 / Undici 7.30.1 through overrides; regenerate bun.lock. No feature/configuration behavior changes beyond dependency resolution.
- [x] Re-scan: basic backend/security checks report no issues; dependency scan reports no known vulnerabilities across 64 production dependencies, including no remaining moderate/low dependency findings. This does not establish a fresh deep-code review: the available deep finding is dated Oct 14 and remains an active warning about guest checks incurring provider cost; existing bounded guest access is intentionally unchanged and any sign-in requirement is owner-deferred.
- [x] Full suite: 58 passed, four privileged library database tests skipped because the required disposable privileged connection is unavailable. Automatic production build passed (Oct 24 00:16:20 UTC); no failures introduced. No publishing requested or performed.
- Scope retained: downloads preview-only and download EXECUTE revoked; CORE disabled; no checkout/pricing changes, API keys, catalog publication, cleanup or accessibility work.
## Knowledge/library release review (Oct 23)
- [x] Verify live anonymous full-content denial and denied execution of both download signatures; revoke unexpected anon EXECUTE on the legacy signature. Confirm RLS owner predicates, PENDING_REVIEW default, empty catalog, zero library cache entries, safe-column public reads and no-store library responses.
- [x] Verify live /knowledge, /resources, missing resource detail, signed-out/signed-in usage and hidden-target issue rejection; fix hidden detail route and test desktop keyboard plus 390px English/Arabic layout without overflow/runtime errors.
- [x] Browser-only synthetic responses verify filters, bookmark, publisher/licence URLs, verification date, empty/outage-safe response and signed-in issue-form confirmation; no resources or test subscriptions were published/stored.
- [x] Add approved custom five-per-account rolling-hour database trigger, direct-write validation, hidden-target rejection and server-assigned submission timestamp. Full suite: 58 passed, 4 privileged transaction tests skipped; automatic production build OK.
- [ ] Populated two-user issue/download isolation, five/six threshold and rights-revocation execution tests need a privileged disposable database; Cloud schema connection cannot impersonate roles. Retained opt-in rolled-back fixture tests. Live issue reads/download reads returned zero rows; this alone is not populated isolation proof.
- [ ] Real publisher/licence/content review and successful issue storage need owner-supplied approved content. Live Crossref outage execution is gated off; only synthetic empty response and catch-path code review completed. No new report-generation or live legacy Pro checkout end-to-end run; community checkout-blocking regression tests pass and billing code is unchanged.
- Owner-deferred: catalog publication requires supplied rights-reviewed content; downloads and Analyst checkout remain paused.
## Stage 2B source scoring
- [x] Add metadata-grounded source signals and documented composite weights, gated server-side with legacy behavior preserved.
- [x] Surface per-source details in report and claim results using existing styling and locale fallbacks.
- [x] Run the full suite (54 tests), verify automatic production build OK, and exercise server-gated scoring with controlled inputs plus expanded browser details; no live-provider generation or flag activation performed.
## Oct 20 carry-over release
- [x] Retry sources: Wikipedia works; Semantic Scholar remains rate-limited but shared cooldown and cached OpenAlex fallback return real results. Blocked Wikipedia editions fail independently with indexed local alternatives.
- [x] Spot-review static translations in Spanish, Arabic and French; correct export labels, claim terminology, privacy wording and a translated DOI.
- [x] Run 43 regression tests and fresh basic security/dependency checks; no high/critical findings. Two moderate transitive sprintf-js advisories remain without a published fix; basic scan excludes deep code analysis.
- [x] Publishing requested for verfiai.app; both public hosts returned HTTP 200 on homepage, /fact-checker, /app, /security and /contact. Reachability confirms the sites respond, not that the new deployment has finished.
- Excluded by owner: no Deep Dossier end-to-end test; CORE and download-storage decisions remain untouched.

## Oct 19 overnight release
- [x] Synchronize recent research and citation UI across all 18 non-English locales; Spanish/Arabic render checked. Native-language review remains advisable.
- [x] Retry authenticated report, fact-check and citation flows successfully; retry Deep Dossier and test provider/cache behavior. Semantic Scholar rate-limited; multilingual Wikipedia requests blocked by provider HTTP 403; complete dossier remains dependent on upstream synthesis availability.
- [x] Run 39 regression tests and fresh basic security checks; no high/critical findings. Moderate dependency advisories and intentional guest-cost warning remain.
- [x] Publishing requested; both public hosts returned HTTP 200 for homepage, /fact-checker, /app, /security and /contact; public Spanish/Arabic dossier pages contain the new translated placeholders.
- Deferred by owner: CORE remains disabled; download-storage decisions and paid library rights remain untouched.

## Oct 18 release
- [x] Verify authenticated report generation, claim result, share badge and live OpenAlex OA/Semantic Scholar/Scribd discovery; CORE remains disabled.
- Deferred by owner: Deep Dossier end-to-end testing is excluded from the carry-over run.
- [x] Dedicated /fact-checker with existing claim tool, leaf metadata, structured data and sitemap entry.
- [x] Shared-report embeddable evidence badge and account prompt for saving future reports.
- [x] Run 35 regression tests and basic security scan; patch high-severity dependency advisories. Two moderate sprintf-js advisories remain without a published fixed version; guest-check cost warning retained.
- [x] Request publishing to verfiai.app after verification; deployment completion requires confirmation.

- [x] Day 3: add private 24-hour SHA-256 verification response caching and atomic guest 5/hour, signed-in 20/day guardrails; verify real citation caching, HTTP 429, concurrent limits and reset windows.
- [x] Day 2: disable new paid checkouts, replace paid offers with Community Access and one-year free pledge, persist a consented Pro/Teams email waitlist, and verify signup storage plus checkout policy tests.
- [x] Priority 1 trust infrastructure: expand About, Methodology, and Accuracy; add trust navigation, input disclosures, verdict feedback, and footer feedback.
- [x] Create reviewed-rights Knowledge Index and preview-only Evidence Library routes, Crossref metadata discovery, local bookmarks, issue reporting and usage page; pause downloads and keep Analyst checkout unavailable.
- [ ] Publish verified/rights-reviewed catalog resources and finish owner/dependency-deferred QA/security/rights checks listed in the Oct 23 review; enable Analyst only if later approved with pricing and payment mapping (see docs-knowledge-rollout.md). No publishing or download activation performed.
- [x] Add five synthetic professional templates, local PDF/XLSX/DOCX downloads, an accessible dialog, and homepage/report links.
- [x] Resolve 19 language codes to names and enforce selected-language report synthesis, including expansion drafts.
- [x] Enhance /sources with live search, reliability and counted profession filters, catalog trend drawer, copy-prompt action, and registry links.
- [x] Review the proposed ResearchForm against the existing workflow; add missing live speech transcript feedback without duplicating recognition results.
- [x] Add the 19-language translation interface and wire its fields into the research workspace with RTL support.
- [x] Add the supplied source catalog and a filterable directory view; label supplied reliability classifications as catalog metadata, not verified endorsements.
- [x] Add explainable evidence strength, issue links and limitations; deduplicate claims and syndicated evidence before scoring; simplify the hero and show clearly estimated verification progress.
- [x] Add a separate VERFI AI cybersecurity concept page with an honest, non-uploading media preview and no unverified certifications.
- [x] Preserve the Crossref citation checker in its own tab and restore quick search as a clearly labeled demo tab.
- [x] Restore the report-first research workspace with live single-model AI, text-file input, report reader and supported exports.
- [x] Add Features, How It Works, Sample Report, Pricing and FAQ pages with honest capability descriptions.
- [x] Reuse 12 translated interface dictionaries, language URL selection and visible fallback for seven languages.
- [x] Add route metadata and a sitemap.
- [x] Validate a real single-model report and sample Crossref citation scan in the browser; check desktop and mobile layouts.
- [x] Accounts (Google + email), server-side report limit, saved reports, voice input, 2-page minimum reports.
- [x] Saved reports, payment test checkout and policy pages are in place.
- [x] Stage 1 of new brief: live web research reports (Tavily + BM25/RRF, DeepSeek→Qwen failover via OpenRouter), DB cache, 1 guest report.
- [x] Stage 2: claim fact-checker (text/URL, DeepSeek+Qwen consensus, R1 tie-break) and citation cascade (DOI → Jaro-Winkler/phonetic/±1yr, trust score, .bib parsing, server limits).
- [x] Word export (watermarked), share links (/r/$token, revocable), new homepage, /methodology, /privacy, JSON-LD.
- Deferred: new Paddle payments are intentionally disabled during community access; existing billing management remains available.

## Audit follow-up (approved)
- [x] Remove unproven claims (badge, tagline, random agreement panel)
- [x] New headline/CTAs + illustrative sample pop-up
- [x] Two-step research form with Task type + language
- [x] Four claim labels + disclaimer by Generate
- [x] .docx/.csv/.pdf uploads up to 5 MB
- [x] Pro payments in sandbox ($9, 50 reports, no watermark); signed-in checkout opens.
- [x] Accessibility pass, test matrix, asset/license list — see docs-accessibility-test-matrix.md and docs-asset-licenses.md; unknown local asset provenance explicitly documented.
- [x] Add $9/month Pro product, checkout and confirmed subscription rules; displayed brand is Verfi AI.
- [x] Replace placeholder legal pages naming seller verfiai; add a dedicated refund policy and footer link.

## Staff-engineer brief (in progress)
- [x] Stage 1: server-side feature flags + credit/usage metering (flags.server.ts, metering.server.ts, FeatureGate, account usage).
- [x] Voice input: compact floating mic icon in Research Question field; remove Focus textarea voice button.
- [x] Stage 2A: CacheProvider (research_cache, normalized+hashed keys, TTL) + provider abstraction layer (SearchProvider, ModelProvider, CitationProvider, PageExtractionProvider) wired into research/fact-check pipeline.
- [x] Day 8: RTL citation markers (LTR-isolated) + in-browser Tesseract.js OCR (paste/drop) on claim and research inputs.
- [x] Day 9: Four named progress stages (estimates) + 5-second per-provider search timeouts.
- [x] Day 10–11: Standard Brief vs Extended Report (4k–20k chars) with 3-pass synthesis (outline → draft → citation audit) and server-built search audit log.
- [x] Day 12: Analyst waitlist, private report-media bucket with 15-minute owner-only signed URLs, Report Rights Issue dialog (email-based).
- [x] You.com search (YDC_API_KEY) + zero type errors (Oct 11)
- [x] Citation matching + OpenAlex fallback; localize citation checker; fill 5 missing keys per locale
- [x] VoiceButton: visible errors, getUserMedia permission, Safari/mobile, unsupported notice
- [x] Live HTTP check of report source URLs
- [x] Extended Report: move to Advanced options checkbox, 2000–4000 chars; max_tokens; :free fallback models
- [x] Deep Dossier tab (search→dedup→3-pass synthesis→annotated bibliography, ≤50 sources, docx/PDF)
- [x] P1 www→apex 301, canonical/brand consistency
- [x] P2 free-until-Oct-13-2027 banner, pricing tiers, FAQ, remove "forever/next year"
- [x] P3 hero CTAs + 3 tool cards + try-line
- [x] P4 sample report section + 4-step how it works
- [x] P5 evidence transparency + AI consensus explainer
- [x] P6 citation scanner feature section
- [x] P7 upload privacy notice, footer links (/security, /contact), privacy page detail
- [x] P8 verdict feedback buttons stored server-side
- [x] P9 JSON-LD SoftwareApplication/Organization/FAQPage, sitemap/robots
- [x] P10 finish citation checker translations (static dictionaries and translated citation notes)
- [x] Homepage studio Deep Dossier tab
- [x] Document sources: Scribd (oEmbed metadata only), Unpaywall, Semantic Scholar, CORE; dedup prefers OA over Scribd; 15-20 doc cap
- [x] Dossier helper/warning copy update (30-60s)
- [x] Admin search tests include new sources
- [x] Sitemap /security /contact
- [x] i18n sync for new strings + citation checker (static dictionaries; native review advised)

## Oct 17 checks
- [x] Verify business routing, dossier pipeline (live run pending)
- [x] Hide extended/standard format options, 4000-char cap
- [x] Security scan review
- [x] Publish

## Oct 29 scheduled run 1 of 3 (3:15 AM Qatar)
- [x] Stage 2 model routing hardening in src/lib/model.server.ts: provider cooldown map after 429/503 (3 min default, MODEL_COOLDOWN_MS, full-route fallback when all cool), in-memory modelRoutingSummary + logged usage_meter ai_model_call aggregate every 50 calls, RATES with provider-level free-tier $0. Live summary readback: groq succeeding, gemini avg 12.7s. 8 model-cooldown tests.
- [x] Stage 3 engine wave: Quora (+ optional Reddit) Tier-3 context-only community engine via Tavily include_domains, never verdict-strengthening; add free engines in order — Stack Exchange, Wayback Machine, Crossref (verify existing first), World Bank Open Data, SEC EDGAR, Europe PMC — skipped wikidata/google-factcheck/crossref (existing); Semantic Scholar sends x-api-key when SEMANTIC_SCHOLAR_API_KEY present, conservative DB gate unchanged, OpenAlex fallback verified in tests. community engine registered but NOT in DEFAULT_ENGINES (verdicts can never consume it); wired into buildReport as low-weight context. 12 engine-wave tests.
- [ ] Stage 6 i18n one-pass — NOT started (deferred to a later run); CommunityWaitlist, ReportView headings, Word label, locale flash all untouched.
- Exclusions: no Stage 4 SEO, no Stage 5 extended report (4k cap stays), no Stage 1 streaming, no cost guardrail, pricing, catalog/library changes; do not request GOOGLE_FACTCHECK_API_KEY.

## Oct 29 Day 1 stages (workspace chat)
- [ ] Stage 1 i18n bundle deletion/dedup: still open; excluded from Run 1 per owner correction ("dispatched scope: Stage 2, Stage 3, Stage 6 if credits remain — nothing else"); parked for a later run.
- [x] Stage 2 admin feedback panel: NOT in owner-approved plan for Run 1; owner correction (Oct 29 00:16 UTC) says Day 1 feedback work already landed — leave as is, do not implement here.
- [ ] Stage 3 DEFERRED: Response Agreement panel direction pending user decision — do not touch ResponseAgreementPanel.tsx or ReportView.tsx.
- Constraints: no Paddle/subscription/billing path changes; MONETIZATION_ENABLED=false; no new checkout.
- Verification after stages 1–2: full regression suite (baseline 79 passed, 4 privileged skipped), production build, spot-check three locales incl. Arabic RTL.
