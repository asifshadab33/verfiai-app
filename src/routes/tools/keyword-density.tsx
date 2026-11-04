import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import KeywordDensity from "@/components/verifai/tools/KeywordDensity";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/keyword-density")({
  head: () => toolHeadForPath("/tools/keyword-density"),
  component: () => (
    <ToolPage
      title="Keyword Density Checker"
      description="Analyze the frequency of words in your text for SEO optimization."
    >
      <KeywordDensity />
    </ToolPage>
  ),
});
