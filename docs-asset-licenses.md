# Verfiai asset and license inventory

Reviewed 2026-10-27. Inventory covers local media, external fonts, shipped icons and generated document assets; this is not a legal clearance of unknown assets or third-party research content.

| Asset | Source / use | License and verification |
|---|---|---|
| `public/favicon.ico` | Template-provided favicon; root head references it | Creator/source/license not documented in repository history. **Unknown; owner provenance needed.** |
| `public/evidence-checked.svg` | Local SVG sharing badge; `/evidence-checked.svg` and ReportSharingBadge | Project-owned markup in repo; no explicit author/license grant recorded. **Unknown; owner clearance needed.** No accuracy certification is established by this inventory. |
| `src/assets/verifai-hero.jpg` | JPEG retained in repo, no current source import found; not an active bundled page image | Added in initial project history; no recorded creator/source/license. **Unknown; not assumed stock or AI-generated.** |
| DM Sans | Google Fonts runtime stylesheet, fonts.googleapis.com / fonts.gstatic.com; root head and styles.css | **SIL OFL 1.1**, copyright 2014 DM Sans Project Authors. Verified upstream `google/fonts/ofl/dmsans/OFL.txt`; copy in `docs/licenses/DM-Sans-OFL.txt`. |
| Manrope | Google Fonts runtime stylesheet; root head and styles.css | **SIL OFL 1.1**, copyright 2018 Manrope Project Authors. Verified upstream `google/fonts/ofl/manrope/OFL.txt`; copy in `docs/licenses/Manrope-OFL.txt`. |
| Lucide React icons | npm `lucide-react` 0.575.0; UI/route SVG icons | **ISC**, with Feather-derived portions **MIT**. Verified installed package LICENSE; full notices retained in `docs/licenses/Lucide-LICENSE.txt`. |
| PostHog browser SDK | npm `posthog-js`; browser tracker and provider-hosted configuration scripts | **Apache 2.0**, installed package license retained in `docs/licenses/PostHog-LICENSE.txt`. Provider-hosted scripts follow PostHog terms. |
| Locally generated professional templates | ResourceLibrary: PDF/XLSX/DOCX generated in browser with synthetic illustrative data | Project-authored content; no separate public redistribution license declared. Document generators are software dependencies, not rights grants for catalog resources. |
| PDF.js worker / OCR worker and language models | Lazy document parsing and Tesseract.js OCR | PDF.js package Apache 2.0; Tesseract.js Apache 2.0. External OCR trained-data provenance/version requires checking the exact language-model download before redistribution; not catalog content. |

Font source notices: https://github.com/google/fonts/blob/main/ofl/dmsans/OFL.txt and https://github.com/google/fonts/blob/main/ofl/manrope/OFL.txt. Licenses for local favicon/badge/unused JPEG cannot be inferred from their appearance or filenames. No media was replaced, deleted or relicensed in this pass.

No catalog resources were published or rights-approved. Research citations, publisher/license fields and external source links are references, not licensed copies shipped by this inventory. Owner-supplied rights-reviewed content is still required before catalog publication; library downloads remain paused.