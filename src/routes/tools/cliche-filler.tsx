import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import ClicheFiller from "@/components/verifai/tools/ClicheFiller";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/cliche-filler")({
  head: () => toolHeadForPath("/tools/cliche-filler"),
  component: () => (
    <ToolPage
      title="Cliché & Filler Detector"
      description="Identify weak filler words and clichés to strengthen your writing."
    >
      <ClicheFiller />
    </ToolPage>
  ),
});
