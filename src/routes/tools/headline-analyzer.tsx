import { createFileRoute } from "@tanstack/react-router";
import { HeadlineAnalyzer } from "@/components/verifai/tools/HeadlineAnalyzer";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = { path: "/tools/headline-analyzer", name: "Headline Analyzer", title: "Free Headline Analyzer: Length, Clickbait and Absolute Claims | Verfiai", description: "Check a headline for length, clickbait phrasing, absolute claims and vague attribution. Runs in your browser; nothing is uploaded." };

export const Route = createFileRoute("/tools/headline-analyzer")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return <ToolPage
    title="Free Headline Analyzer"
    intro="Paste one or more headlines, one per line, to check length, clickbait phrasing, absolute claims and vague attribution."
    privacy="Runs in your browser. The text you enter is not uploaded to our servers or to analytics."
    notes={[
        { title: "What this does and does not do", body: "These are plain writing checks for English headlines. They do not predict clicks, search ranking, or whether the story is true." },
        { title: "A good headline can still be wrong", body: "Paste the claim a headline makes into the fact checker to see what sources say." },
    ]}
  >
    <HeadlineAnalyzer />
  </ToolPage>;
}
