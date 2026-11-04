import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import SerpPreview from "@/components/verifai/tools/SerpPreview";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/serp-preview")({
  head: () => toolHeadForPath("/tools/serp-preview"),
  component: () => (
    <ToolPage
      title="SERP & Open Graph Preview"
      description="Preview how your page title and description will look in Google search results."
    >
      <SerpPreview />
    </ToolPage>
  ),
});
