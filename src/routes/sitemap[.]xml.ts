import { createFileRoute } from "@tanstack/react-router";
import { listReviewedClaimSlugs } from "@/data/claims";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { FREE_TOOL_PAGES, TOOL_GUIDE_PAGES } from "@/lib/tools/free-tool-pages";

const BASE = "https://verfiai.app";
const PAGES = [
  "/",
  "/features",
  "/how-it-works",
  "/sample-report",
  "/pricing",
  "/faq",
  "/methodology",
  "/about",
  "/accuracy",
  "/privacy",
  "/cookies",
  "/terms",
  "/refunds",
  "/app",
  "/research",
  "/fact-checker",
  "/fact-checks",
  "/glossary",
  "/rss.xml",
  "/llms.txt",
  "/sources",
  "/security",
  "/contact",
];
export const sitemapPaths = () => [
  ...PAGES,
  ...listReviewedClaimSlugs().map((s) => `/fact-check/${s}`),
  "/tools",
  "/tools/claim-spotter",
  "/tools/doi-checker",
  "/tools/citation-generator",
  "/tools/photo-check",
  "/tools/headline-analyzer",
  "/tools/text-compare",
  "/tools/word-counter",
  "/tools/text-cleaner",
  "/tools/weasel-words",
  "/tools/keyword-density",
  "/tools/readability",
  "/tools/passive-hedge",
  "/tools/similarity",
  "/tools/title-case",
  "/tools/character-counter",
  "/tools/qr-code",
  "/tools/password-generator",
  "/tools/markdown-editor",
  "/tools/pomodoro",
  "/tools/slugifier",
  "/tools/text-to-speech",
  "/tools/speech-to-text",
  "/tools/email-headers",
  "/tools/invisible-chars",
  "/tools/phishing-checklist",
  "/tools/file-hash",
  "/tools/fallacy-spotter",
  "/tools/foi-letter",
  "/tools/numbers-check",
  "/tools/mailto-builder",
  "/tools/disposable-email",
  "/tools/subject-line-preview",
  "/tools/csv-json",
  "/tools/sample-size",
  "/tools/random-picker",
  "/tools/timestamp-converter",
  "/tools/reference-converter",
  "/tools/wayback",
  "/tools/domain-age",
  "/tools/pubmed",
  "/tools/isbn-citer",
  "/tools/url-inspector",
  "/tools/cliche-filler",
  "/tools/sentence-rhythm",
  "/tools/serp-preview",
  "/tools/quote-card",
  "/tools/source-checklist",
  "/tools/headline-quiz",
  "/tools/evaluation-checklist",
  "/tools/evidence-matrix",
  "/tools/link-expander",
  "/tools/arxiv",
  "/tools/orcid",
  "/tools/pdf-tools",
  ...NEW_TOOLS.map((tool) => `/tools/${tool.slug}`),
  ...FREE_TOOL_PAGES.filter(
    (tool) => !NEW_TOOLS.some((existing) => existing.slug === tool.slug),
  ).map((tool) => `/tools/${tool.slug}`),
  ...TOOL_GUIDE_PAGES.map((page) => `/${page.slug}`),
];

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const urls = sitemapPaths();
        const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${BASE}${u}</loc></url>`).join("\n")}\n</urlset>\n`;
        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
