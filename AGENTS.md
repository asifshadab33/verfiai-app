<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history — force pushing, or rebasing/amending/squashing commits that are already pushed — as it rewrites history on Lovable's side and the user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Verifai's research experience on the index route with client-side simulated answers and independent browser-stored usage trackers, because no backend is connected and the requested engines are mock simulations.
- Keep locale selection in the URL query as well as browser storage, because server-rendered share metadata must reflect the selected language.
- Keep report generation on the index route with the citation checker as a separate tab; this preserves the existing Crossref workflow while making research the primary entry point.
- Use the single configured AI Gateway model for reports and label all report sources unverified until opened; additional advertised engines are not connected.
- Keep brochure sections as separate content routes with leaf metadata because each is independently shareable.
- Browser-only report and citation allowances are demonstration counters, never authorization or production billing entitlements.
