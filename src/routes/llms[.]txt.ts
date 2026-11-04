import { createFileRoute } from "@tanstack/react-router";

const CONTENT = `# Verfiai

Verfiai is a research and fact-checking workspace. It helps people examine claims, sources, evidence and writing; its tools support review and do not certify truth.

## Main sections
- Fact checks: https://verfiai.app/fact-checks
- Research and report generation: https://verfiai.app/research
- Sources directory: https://verfiai.app/sources
- Free tools hub: https://verfiai.app/tools

## Key links
- Live fact checker: https://verfiai.app/fact-checker
- Methodology: https://verfiai.app/methodology
- About Verfiai: https://verfiai.app/about
- How to check information: https://verfiai.app/how-to-check
- Video research guide: https://verfiai.app/video-research
- Free research templates: https://verfiai.app/templates
- Misinformation glossary: https://verfiai.app/glossary
- RSS feed of reviewed fact checks: https://verfiai.app/rss.xml
`;

export const Route = createFileRoute("/llms.txt")({
  server: {
    handlers: {
      GET: async () =>
        new Response(CONTENT, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        }),
    },
  },
});
