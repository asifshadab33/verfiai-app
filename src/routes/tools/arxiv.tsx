import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import ArxivFinder from "@/components/verifai/tools/ArxivFinder";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/arxiv")({
  head: () => toolHeadForPath("/tools/arxiv"),
  component: () => (
    <ToolPage
      title="arXiv Paper Finder"
      description="Search academic preprints in physics, CS, and math. (Skipped if CORS-blocked)."
    >
      <ArxivFinder />
    </ToolPage>
  ),
});
