# VerifAI.app redesign + real AI reports

## What you'll get

- A new light, premium look: white and soft-neutral backgrounds, deep navy text, restrained green accents, original line icons and an original checkmark-plus-magnifier logo. The old dark hero photo is removed.
- New homepage sections, in order: navigation (Features, How It Works, Sample Report, Pricing, FAQ, Generate Report button, mobile menu), hero with the new headline and a product preview, research box, clearly labeled illustrative sample report, how it works (4 steps), features, evidence and transparency, use cases, pricing, trust and privacy, FAQ, final call to action, footer.
- Real AI reports: the research box sends your question to AI and returns a structured report (executive summary, key findings, claims marked supported / disputed / unverified, limitations, methodology, conclusion). It's clearly labeled AI-generated. It only lists sources the AI actually cites, and it says plainly that it doesn't browse the live web.
- Two-step form: a big question box with example prompts, then an expandable Advanced Options section (company, website, industry, competitors, focus, language, research mode).
- Report reader with a table of contents and a toolbar for Copy, Download (text/Markdown) and Print / Save as PDF. No Word export and no fake sharing.
- Loading, error and retry states. Nothing fake is shown while a report is being written.
- Pricing: Free (3 reports/month), Pro Researcher ($5/month, 15 reports), Enterprise/API (contact us). Payments aren't connected yet, so upgrade buttons go to contact.
- All 19 languages stay. New text is translated into the 12 fully supported languages, and the other 7 fall back to English as they do now.
- SEO: each language gets its own title, description and share tags, plus a sitemap.

## Honest gaps (shown on the site, not hidden)

- No sign-in or saved report history yet, so no dashboard. It can be added later with Lovable Cloud.
- Document upload: text files (.txt/.md, up to 200 KB) get read into the question. Other file types are refused with a clear message.
- The monthly free limit is tracked in your browser only, so anyone can reset it.
- The privacy section says prompts go to an AI provider to write the report and aren't stored by VerifAI. Your real Privacy and Terms pages and your contact email are still needed.

## Technical details

- Server function `src/lib/report.functions.ts` calls the Lovable AI Gateway (`openai/gpt-6-astra`, Responses API, streamed and collected server-side). It validates input with zod and returns JSON matching a strict schema. It handles 402/429 errors with clear messages. It needs `LOVABLE_API_KEY` (provisioned if missing). No Cloud database.
- Split `src/routes/index.tsx` into components under `src/components/verifai/*`. Restyle the tokens in `src/styles.css` to a light oklch palette and add a reduced-motion rule.
- Extend `src/lib/translations.ts` with the new keys. The `?lang=` URL + localStorage behavior stays.
- Add `public/sitemap.xml` and update the robots file. Update AGENTS.md, roadmap.md and README.
- Check with Playwright on desktop and mobile, plus one real report generation.
