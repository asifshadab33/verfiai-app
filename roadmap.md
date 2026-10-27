# Verfiai roadmap
## Oct 27 accessibility and follow-up
- [x] Accessibility: fix verdict contrast, file input labeling, main/skip target and focus indicators; keyboard/Escape Tools menu; Radix demo/studio tabs with RTL navigation; voice privacy button. Axe WCAG A/AA + best-practice: zero violations on 13 routes × en/de/ar; desktop/mobile layout checked. See docs-accessibility-test-matrix.md and docs-asset-licenses.md.
- [x] Link existing PostHog connection; add browser-only initialization, automatic $pageview on initial/history navigation, custom page_view per route, autocapture and pageleave. Mask content/attributes, redact queries/share tokens, disable recording and account identification; privacy disclosure updated.
- [x] Regression suite: 66 passed, four pre-existing privileged database tests skipped; Deep Dossier excluded. Automatic production build OK (04:01:34 UTC).
- [ ] Republish and record per-page HTTP status for /, /sources, /methodology and /privacy on verfiai.app and www.verfiai.app.
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
