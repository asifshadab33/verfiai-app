<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history — force pushing, or rebasing/amending/squashing commits that are already pushed — as it rewrites history on Lovable's side and the user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep locale selection in the URL query as well as browser storage, because server-rendered share metadata must reflect the selected language.
- Keep report generation on the index route with the citation checker as a separate tab; this preserves the existing Crossref workflow while making research the primary entry point.
- Keep brochure sections as separate content routes with leaf metadata because each is independently shareable.
- Keep cybersecurity exploration on a separate concept route with a browser-only file preview and no claimed scan results, because the research product does not provide media-forensics scanning.
- Reports use Cloud auth (Google + email); generation, plan limits and saving run server-side against reports/subscriptions, because browser counters cannot enforce access.
- Voice input uses the browser's free Web Speech API with `cleanVoiceTranscript`, so no audio leaves the browser via our server.
- Reports target 1000+ words (~2 pages) with one automatic expansion pass when the draft is short.

- Reports and claim checks use Tavily plus free sources (DuckDuckGo Instant Answer API only, never scraped result pages; English + report-language Wikipedia; Crossref; OpenAlex; PubMed) merged via local BM25/RRF ranking and OpenRouter engines (DeepSeek primary, Qwen fallback) in `research.server.ts`; keys stay server-side because browser keys can be stolen.
- All external lookups flow through the provider layer — `cache.server.ts` (CacheProvider), `search.server.ts` (SearchProvider), `model.server.ts` (ModelProvider routes: triage=cheap extraction, evaluation=DeepSeek→Qwen failover), `citation.server.ts` (CitationProvider), `page.server.ts` (PageExtractionProvider), `db.server.ts` (admin client) — and the CacheProvider is always checked before any external API call; `research.server.ts` orchestrates and keeps BM25/RRF ranking.
- Search and report results are cached in the `research_cache` table (24h / 7d) instead of Redis, since no Redis service is connected.
- Guest reports are limited to one per IP+user-agent hash in `guest_usage`, server-side.
- All usage limits (scans, fact-checks) go through `usage.server.ts`: signed-in users in `usage_events`, guests one use per kind in `guest_usage`; no browser counters, because they can't be enforced.
- The quick-search demo tab was replaced by the real fact-checker (`factcheck.functions.ts`).
- Share links use an unguessable `reports.share_token` read by a public server fn (title/content/date only), because anon RLS would expose every report.
- Word export is generated in the browser with `docx` (lazy-loaded) so no server cost.
- Paddle test checkout uses the Pro product; verified server-side subscription rows determine paid access, never browser state.
- Paddle environment is derived from server request host, not client data, so test purchases cannot unlock live access.
- Evidence strength is derived from verified excerpts for claim checks and conservatively from cited links for reports; report links never imply quote verification, because generated citations can be inaccurate.
- Progress indicators are labeled estimates until an actual server event exists; elapsed time alone cannot certify a completed verification step.
- Keep the supplied source directory informational and separate from live evidence scoring, because catalog ratings and historical claims have not been independently verified.
- Generate free professional templates locally as actual PDF/XLSX/DOCX with synthetic illustrative data; do not collect email or claim inbox delivery until a consented delivery service exists.
- Keep the Evidence Library preview-only and disable all paid downloads at both API and database levels until rights and a paid plan are explicitly approved, because browsing must not imply an available entitlement.
- Feature flags are evaluated server-side in `flags.server.ts` (code default < env var < `feature_flags` row, with user/org allowlists and admin-only via `has_role`); UI `FeatureGate` is display-only, because hidden UI cannot enforce access.
- Credits are consumed atomically and idempotently via the `consume_credits` DB function before expensive work and refunded on failure; every operation is logged to `usage_meter` (never shown raw to users), because client counters can be bypassed.
