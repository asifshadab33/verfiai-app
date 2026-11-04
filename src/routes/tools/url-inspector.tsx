import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import UrlInspector from "@/components/verifai/tools/UrlInspector";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/url-inspector")({
  head: () => toolHeadForPath("/tools/url-inspector"),
  component: () => (
    <ToolPage
      title="URL Inspector"
      description="Detect Punycode lookalikes and strip tracking parameters from URLs."
    >
      <UrlInspector />
    </ToolPage>
  ),
});
