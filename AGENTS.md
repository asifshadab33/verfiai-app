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
- Share links use an unguessable `reports.share_token` read by a public server fn (title/content/date only), because anon RLS would expose every report.
- Word export is generated in the browser with `docx` (lazy-loaded) so no server cost.
- New checkout is hard-disabled in a shared policy and at the server price resolver; retain billing management and verified subscription handling for existing customers so hiding offers never prevents cancellation.
- Evidence strength is derived from verified excerpts for claim checks and conservatively from cited links for reports; report links never imply quote verification, because generated citations can be inaccurate.
- Progress indicators are labeled estimates until an actual server event exists; elapsed time alone cannot certify a completed verification step.
- Keep the supplied source directory informational and separate from live evidence scoring, because catalog ratings and historical claims have not been independently verified.
- Generate free professional templates locally as actual PDF/XLSX/DOCX with synthetic illustrative data; do not collect email or claim inbox delivery until a consented delivery service exists.
- Keep the Evidence Library preview-only and disable all paid downloads at both API and database levels until rights and a paid plan are explicitly approved, because browsing must not imply an available entitlement.
- OCR runs in the browser with lazy-loaded Tesseract.js; images never go to our server, because OCR must stay zero-cost and private.
- Rights/DMCA notices are composed as email to hello@verfiai.app and not stored, until a reviewed takedown workflow exists.
- Server-side rules for `src/lib` live in `src/lib/AGENTS.md`.
- The dedicated /fact-checker page reuses FactChecker; shared-report embed badges link to the revocable report token and make no accuracy certification.
- Pin security-patched transitive dependencies through package overrides so spreadsheet and document tools retain compatible public APIs.
