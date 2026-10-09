# Verfiai roadmap
- [x] Day 3: add private 24-hour SHA-256 verification response caching and atomic guest 5/hour, signed-in 20/day guardrails; verify real citation caching, HTTP 429, concurrent limits and reset windows.
- [x] Day 2: disable new paid checkouts, replace paid offers with Community Access and one-year free pledge, persist a consented Pro/Teams email waitlist, and verify signup storage plus checkout policy tests.
- [x] Priority 1 trust infrastructure: expand About, Methodology, and Accuracy; add trust navigation, input disclosures, verdict feedback, and footer feedback.
- [x] Create reviewed-rights Knowledge Index and preview-only Evidence Library routes, Crossref metadata discovery, local bookmarks, issue reporting and usage page; pause downloads and keep Analyst checkout unavailable.
- [ ] Publish verified/rights-reviewed catalog resources and complete release QA/security/rights review; enable Analyst only if later approved with pricing and payment mapping (see docs-knowledge-rollout.md).
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
- [ ] Accessibility pass, test matrix, asset/license list
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
