import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import ReadabilityScorer from "@/components/verifai/tools/ReadabilityScorer";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/readability")({
  head: () => toolHeadForPath("/tools/readability"),
  component: () => (
    <ToolPage
      title="Readability Scorer"
      description="Calculate Flesch-Kincaid grade level and reading difficulty of your text."
    >
      <ReadabilityScorer />
    </ToolPage>
  ),
});
