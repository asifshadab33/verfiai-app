# src/lib rules

- Knowledge/library public reads use an anonymous server publishable client and safe column projections; library responses are no-store and issue validation/throttling is enforced by a database trigger so direct writes cannot bypass it.

- Reports and claim checks use Tavily plus free sources (DuckDuckGo Instant Answer API only, never scraped result pages; English + report-language Wikipedia; Crossref; OpenAlex; PubMed) merged via local BM25/RRF ranking and OpenRouter engines (DeepSeek primary, Qwen fallback) in `research.server.ts`; keys stay server-side because browser keys can be stolen.
- All external lookups flow through the provider layer — `cache.server.ts` (CacheProvider), `search.server.ts` (SearchProvider), `model.server.ts` (ModelProvider routes: triage=cheap extraction, evaluation=DeepSeek→Qwen failover), `citation.server.ts` (CitationProvider), `page.server.ts` (PageExtractionProvider), `db.server.ts` (admin client) — and the CacheProvider is always checked before any external API call; `research.server.ts` orchestrates and keeps BM25/RRF ranking.
- Search and report results are cached in the `research_cache` table (24h / 7d) instead of Redis, since no Redis service is connected.
- Full research reuse uses the separate research-cache helper with caller/exact-input/cohort keys, pre-search reads and non-sliding adaptive freshness; degraded output is never cached, and timestamps govern reuse rather than guaranteed deletion.
- Guest reports are limited to one per IP+user-agent hash in `guest_usage`, server-side.
- All usage limits (scans, fact-checks) go through `usage.server.ts`: signed-in users in `usage_events`, guests one use per kind in `guest_usage`; no browser counters, because they can't be enforced.
- The quick-search demo tab was replaced by the real fact-checker (`factcheck.functions.ts`).
- Paddle environment is derived from server request host, not client data, so test purchases cannot unlock live access.
- Feature flags are evaluated server-side in `flags.server.ts` (code default < env var < `feature_flags` row, with user/org allowlists and admin-only via `has_role`); UI `FeatureGate` is display-only, because hidden UI cannot enforce access.
- Credits are consumed atomically and idempotently via the `consume_credits` DB function before expensive work and refunded on failure; every operation is logged to `usage_meter` (never shown raw to users), because client counters can be bypassed.
- Community waitlist signups use a public validated server function and a service-role-only atomic database function with consent records and per-IP request throttling; never expose the email list to clients.
- Verification response caching is caller-scoped and versioned in a private table; preserve punctuation/numbers in normalization to avoid incorrect verdict reuse. Provider caches remain in research_cache.
- All verification entry points reserve an atomic database request slot before cache reads or expensive work; guest buckets ignore user-agent, cache hits still count toward abuse limits but do not consume monthly quota or credits. Use TanStack server functions, not separate edge functions.
- Extended Reports use three synthesis passes with a deterministic citation-marker guard and a server-built search audit log, because model-written audit trails cannot be trusted.
- Report and dossier synthesis validates the chapter schema inside the model cascade so malformed provider output advances to the next configured engine.
- Private media lives in the `report-media` bucket under `<userId>/` and is served only via 15-minute signed URLs from `media.functions.ts`, because permanent links would leak attachments.
