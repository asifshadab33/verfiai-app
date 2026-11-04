import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import WaybackChecker from "@/components/verifai/tools/WaybackChecker";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/wayback")({
  head: () => toolHeadForPath("/tools/wayback"),
  component: () => (
    <ToolPage
      title="Wayback Machine Checker"
      description="See if a URL has been archived or altered over time via archive.org."
    >
      <WaybackChecker />
    </ToolPage>
  ),
});
