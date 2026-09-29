<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history — force pushing, or rebasing/amending/squashing commits that are already pushed — as it rewrites history on Lovable's side and the user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Verifai's research experience on the index route with client-side simulated answers and independent browser-stored usage trackers, because no backend is connected and the requested engines are mock simulations.
- Keep locale selection in the URL query as well as browser storage, because server-rendered share metadata must reflect the selected language.
- Keep report generation on the index route with the citation checker as a separate tab; this preserves the existing Crossref workflow while making research the primary entry point.
- Keep brochure sections as separate content routes with leaf metadata because each is independently shareable.
- Browser-only report and citation allowances are demonstration counters, never authorization or production billing entitlements.
- Reports require sign-in (Lovable Cloud auth: Google + email); generation, the 3/month limit and saving run server-side in `report.functions.ts` against the `reports` table, because browser counters are not enforceable.
- Voice input uses the browser's free Web Speech API with `cleanVoiceTranscript`, so no audio leaves the browser via our server.
- Reports target 1000+ words (~2 pages) with one automatic expansion pass when the draft is short.

- Reports use Tavily web search + local BM25/RRF ranking and OpenRouter engines (DeepSeek primary, Qwen fallback) in `research.server.ts`; keys stay server-side because browser keys can be stolen.
- Search and report results are cached in the `research_cache` table (24h / 7d) instead of Redis, since no Redis service is connected.
- Guest reports are limited to one per IP+user-agent hash in `guest_usage`, server-side.
