# Verfiai accessibility and release test matrix

Reviewed 2026-10-27. This is a scoped accessibility review, not a WCAG certification.

## Executed matrix

Chromium desktop 1280×1800; English (default), German (secondary LTR), Arabic (RTL).
Each cell below passed HTTP rendering and axe-core 4.10.3 WCAG 2 A/AA, WCAG 2.1 AA and best-practice checks with zero violations after fixes.

| Page | English | German | Arabic | State |
|---|---|---|---|---|
| `/` | Pass | Pass | Pass | Report-first homepage |
| `/app` | Pass | Pass | Pass | Claim form |
| `/fact-checker` | Pass | Pass | Pass | Empty input |
| `/sources` | Pass | Pass | Pass | Source directory |
| `/knowledge` | Pass | Pass | Pass | Preview-only |
| `/resources` | Pass | Pass | Pass | Empty catalog |
| `/account/library-usage` | Pass | Pass | Pass | Signed out |
| `/auth` | Pass | Pass | Pass | Email/Google sign-in presentation |
| `/sample-report` | Pass | Pass | Pass | Illustrative report |
| `/contact` | Pass | Pass | Pass | Contact content |
| `/security` | Pass | Pass | Pass | Concept page, not a scanner |
| `/methodology` | Pass | Pass | Pass | Methodology content |
| `/privacy` | Pass | Pass | Pass | Privacy/analytics disclosure |

The same first seven pages except account usage, plus `/auth`, were checked at 390×844 and desktop in all three locales: no document overflow in the final run. Arabic direction and screenshots confirm mirrored ordering. No runtime errors in the final unmocked run.

## Keyboard checks executed

- Skip link focuses `main-content`; focus outlines remain visible.
- Tools menu opens with Enter, Tab reaches its commands, Escape closes it and restores trigger focus.
- Demo tabs: ArrowRight changes selection, Home returns to the first tab.
- Studio tabs: report → claim via keyboard, citation via its tab; panel relationships are provided by Radix. Dossier was not activated.
- Sample dialog opens, Escape dismisses it; Radix manages modal focus.
- Text/URL input selection is a labeled pressed-button group, not an incomplete tab pattern.

## Fixes

Darkened semantic success/warning/destructive colors for small-text AA contrast; labeled/hidden the upload chooser; added main landmark/skip target and general focus indicators; replaced incomplete demo/studio tab patterns with Radix; made Tools state explicit; made voice privacy information a named button.

## Regression and limitations

- `bunx vitest run --exclude '**/dossier.test.ts'`: 66 passed, four existing privileged database tests skipped. All 19 dictionaries remain covered by locale tests.
- Automatic production build passed. No manual competing production build was started.
- No live report generation, sign-in mutation, checkout, populated catalog/issue flow or privileged two-user isolation was exercised in this accessibility pass. Prior reviews are in roadmap.md.
- Other 16 locales are supported but not individually browser-audited today. Native screen-reader testing (NVDA/VoiceOver), Safari/Firefox and human translation review remain recommended; automated checks do not establish full conformance.
- Deep Dossier testing explicitly excluded. Downloads remain paused, CORE disabled, catalog unpublished and checkout/pricing unchanged.

## Tracking verification

Unit tests verify one-time initialization, route events, host selection, click/pageleave settings and URL redaction. The live browser fetched PostHog configuration successfully (HTTP 200) with no runtime errors. Ingestion/event visibility was not yet confirmed by these configuration responses; pageleave supports exit/time measurement, not a guaranteed funnel drop-off classification.