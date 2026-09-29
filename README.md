# VerifAI

TanStack Start application for AI-assisted research reports and Crossref citation checks.

## Local development
Install dependencies with `bun install` and start with `bun run dev`. The project requires a server-side `LOVABLE_API_KEY` for the AI Gateway; never put it in browser code. Without it, report generation and citation extraction cannot run. The public Crossref API is used for citation matching.

## Current architecture
The index route has two independently selected tools. `src/lib/report.functions.ts` calls one AI Gateway model to produce a structured JSON report without live web browsing. `src/lib/verify.functions.ts` uses the AI Gateway to extract references, then looks up citation records and retraction notices in Crossref. Source URLs from generated reports are suggestions, not verified live citations. Browser storage holds separate monthly demo counters. It is not secure usage enforcement.

The report tool reads a single .txt or .md file (200 KB maximum) in the browser, sends up to 12,000 characters of extracted text to the AI service and does not store reports in a database. The citation tool reads .txt, .md, .bib or .docx files (5 MB maximum) in the browser and sends up to 60,000 characters for processing. PDF and image extraction are not supported. AI provider and Crossref handling and retention are governed by their own policies; do not send confidential information. No virus scanner or server-side file storage exists.

The report reader offers copy, Markdown download and browser print/PDF. DOCX export is not implemented. No accounts, dashboards, payment checkout, ad network, production analytics, or multi-provider orchestration are connected. Do not advertise the proposed Pro plan as purchasable until billing and entitlements are implemented. The intended Pro price is $5/month for 15 reports, pending validation; the business goal of $10,000 gross collected in year one is a target, not a projection.

## Languages and pages
Twelve locales have translated interface dictionaries in `src/lib/i18n/`; seven other selectable languages display a visible English fallback. Language selection is saved both in the `?lang=` URL and browser storage. Arabic is RTL; Urdu and Persian also get RTL layout but currently fall back to English text. The citation checker remains English. Share metadata on the homepage follows the URL language. Other informational pages currently use English. Leaf routes each provide their own SEO metadata, and `public/sitemap.xml` lists the public pages.

## Before launch
Connect a secure backend for accounts, server-side limits, report history and billing. Verify provider costs and coverage, obtain owner-approved contact and legal text, clarify deletion/retention terms with AI vendors, and test checkout and authorization before advertising paid capabilities. Interview target users and measure activation, repeat usage and cost per report before paid acquisition; track collected revenue separately from MRR and profit. Validate DOCX, richer files, voice and multi-model claims only if actually built.
