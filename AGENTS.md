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

- Reports use Tavily web search + local BM25/RRF ranking and OpenRouter engines (DeepSeek primary, Qwen fallback) in `research.server.ts`; keys stay server-side because browser keys can be stolen.
- Search and report results are cached in the `research_cache` table (24h / 7d) instead of Redis, since no Redis service is connected.
- Guest reports are limited to one per IP+user-agent hash in `guest_usage`, server-side.
- All usage limits (scans, fact-checks) go through `usage.server.ts`: signed-in users in `usage_events`, guests one use per kind in `guest_usage`; no browser counters, because they can't be enforced.
- The quick-search demo tab was replaced by the real fact-checker (`factcheck.functions.ts`).
- Share links use an unguessable `reports.share_token` read by a public server fn (title/content/date only), because anon RLS would expose every report.
- Word export is generated in the browser with `docx` (lazy-loaded) so no server cost.
- Paddle test checkout uses the Pro product; verified server-side subscription rows determine paid access, never browser state.
- Paddle environment is derived from server request host, not client data, so test purchases cannot unlock live access.
