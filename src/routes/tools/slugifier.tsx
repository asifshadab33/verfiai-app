import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import Slugifier from "@/components/verifai/tools/Slugifier";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/slugifier")({
  head: () => toolHeadForPath("/tools/slugifier"),
  component: () => (
    <ToolPage
      title="Slug & URL Encoder"
      description="Generate clean URL slugs and encode/decode URL strings."
    >
      <Slugifier />
    </ToolPage>
  ),
});
