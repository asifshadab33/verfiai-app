<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history — force pushing, or rebasing/amending/squashing commits that are already pushed — as it rewrites history on Lovable's side and the user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

- Keep locale selection in the URL query as well as browser storage, because server-rendered share metadata must reflect the selected language.
- Retain explicit locale across navigation using root search middleware; document language follows primary page copy, not merely the selected tool locale, so English-only pages remain English with localized tool islands.
- Editorial ClaimReview is generated only from dated, cited review records with documented provenance; unknown original authors remain explicitly unknown rather than being inferred from a later discussion.
- Editorial robots metadata and sitemap inclusion use the same ClaimReview eligibility validator so review publication requires only one state change.
- Leaf search alternates use the primary-page language policy, not localized tool islands; shared SEO link generation keeps canonical and hreflang URLs consistent.
- Keep report generation on the index route with the citation checker as a separate tab; this preserves the existing Crossref workflow while making research the primary entry point.
- HomeSections is a compatibility barrel; helpers/forms are separate from metadata.
- Brochure sections use content routes with leaf metadata.
- Library browsing is an index leaf beside the resource-detail leaf, not a parent page that hides its child; this keeps detail and issue-reporting views reachable.
- Keep cybersecurity exploration on a separate concept route with a browser-only file preview and no claimed scan results, because the research product does not provide media-forensics scanning.
- Reports use Cloud auth (Google + email); generation, plan limits and saving run server-side against reports/subscriptions, because browser counters cannot enforce access.
- Voice input uses the browser's free Web Speech API with `cleanVoiceTranscript`, so no audio leaves the browser via our server.
- Reports target 1000+ words (~2 pages) with one automatic expansion pass when the draft is short.
- Share links use an unguessable `reports.share_token` read by a public server fn (title/content/date only), because anon RLS would expose every report.
- Word export is generated in the browser with `docx` (lazy-loaded) so no server cost.
- Report Markdown and Word exports share browser-only Blob download mechanics; callers retain filenames, generation and entitlement checks so consolidation cannot change export policy.
- New checkout is hard-disabled in a shared policy and at the server price resolver; retain billing management and verified subscription handling for existing customers so hiding offers never prevents cancellation.
- Evidence strength is derived from verified excerpts for claim checks and conservatively from cited links for reports; report links never imply quote verification, because generated citations can be inaccurate.
- Advanced source scores are deterministic server-generated metadata snapshots, separately displayed from evidence verdicts; cache cohorts are separated and current server flags gate display so disabled scoring preserves legacy results.
- Progress is service-persisted and HMAC-authenticated on opaque Realtime topics; subscribe before dispatch, never expose secrets or infer completion from time. Labeled fallback cannot complete; replay is deferred.
- Keep the supplied source directory informational and separate from live evidence scoring, because catalog ratings and historical claims have not been independently verified.
- Generate free professional templates locally as actual PDF/XLSX/DOCX with synthetic illustrative data; do not collect email or claim inbox delivery until a consented delivery service exists.
- Keep the Evidence Library preview-only and disable all paid downloads at both API and database levels until rights and a paid plan are explicitly approved, because browsing must not imply an available entitlement.
- OCR runs in the browser with lazy-loaded Tesseract.js; images never go to our server, because OCR must stay zero-cost and private.
- Rights/DMCA notices are composed as email to hello@verfiai.app and not stored, until a reviewed takedown workflow exists.
- Server-side rules for `src/lib` live in `src/lib/AGENTS.md`.
- The dedicated /fact-checker page reuses FactChecker; shared-report embed badges link to the revocable report token and make no accuracy certification.
- Pin security-patched transitive dependencies through package overrides so spreadsheet and document tools retain compatible public APIs.
- Recent UI, citation notes and deterministic evidence explanations use precompiled locale dictionaries through `recent-i18n.ts`; keep original source titles and quotes verbatim because translating evidence can change its meaning.
- Load only the URL-selected non-English dictionary before root route loading and hydration; keep English eager and cache by locale, with interface values resolved on access so SSR and browser copy agree. Aggregate review dictionaries mirror the per-locale lazy files.
- Blocked sources use cache-first alternatives with honest provenance. Semantic Scholar requires atomic spacing/backoff respecting Retry-After; no coordination means skip upstream. Wikipedia editions fail independently.
- Analytics initializes through browser-only dynamic imports after hydration and explicit versioned consent; the root owns the shared footer and consent banner on every page; withdrawal disables both SDKs and removes only analytics storage, because declining must keep the site usable; mask content and attributes, redact private URL identifiers and disable session recording so research content is not tracked.
- Google Analytics uses one browser startup configuration with automatic pageviews disabled and explicit sanitized page_view events per navigation, avoiding duplicate visits and research-content leakage.
- Use Radix tabs for tool/demo navigation and a shared main-content skip target so keyboard behavior and panel relationships remain accessible.
- Research reuse is caller/exact-input/cohort scoped and checked before search; adaptive freshness never slides dates or caches degraded answers. Details live in src/lib/AGENTS.md.
