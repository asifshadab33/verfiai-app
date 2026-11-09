import { createFileRoute } from "@tanstack/react-router";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { FREE_TOOL_PAGES, TOOL_GUIDE_PAGES } from "@/lib/tools/free-tool-pages";

const BASE = "https://verfiai.app";
type Item = { slug: string; title: string; description: string; category?: string };

function section(items: Item[], prefix: string) {
  return items.map((t) => `- [${t.title}](${BASE}${prefix}${t.slug}): ${t.description}`).join("\n");
}

function build() {
  return `# Verfiai

> Free research and claim-level evidence checking. Verfiai shows the sources behind each finding; it is a review aid, not an infallible truth engine.

Verfiai is free for everyone during the community period, with fair-use limits. Most tools run in the visitor's browser; tools that consult public registries (Crossref, PubMed, arXiv, ORCID, Open Library, Internet Archive and others) say so on their page.

## Core product
- [Fact checker](${BASE}/fact-checker): Check a single claim against cited web and scholarly evidence.
- [Research reports](${BASE}/research): Generate a cited research report (sign-in required).
- [Citation checker](${BASE}/tools/citation-checker): Verify references against Crossref.
- [Methodology](${BASE}/methodology): How evidence is gathered, ranked and labeled.
- [Accuracy](${BASE}/accuracy): Known limits of automated checking.

## Free tools
${section(FREE_TOOL_PAGES, "/tools/")}
${section(NEW_TOOLS, "/tools/")}

## Guides
${section(TOOL_GUIDE_PAGES, "/")}

## Optional
- [Glossary](${BASE}/glossary): Research and fact-checking terms.
- [Sources directory](${BASE}/sources): Informational catalog of sources.
- [All tools](${BASE}/tools): Categorized hub.
`;
}

export const Route = createFileRoute("/llms-full.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(build(), {
          headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
        }),
    },
  },
});
