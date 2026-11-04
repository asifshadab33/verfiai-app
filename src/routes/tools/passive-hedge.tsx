import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import PassiveHedgeDetector from "@/components/verifai/tools/PassiveHedgeDetector";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/passive-hedge")({
  head: () => toolHeadForPath("/tools/passive-hedge"),
  component: () => (
    <ToolPage
      title="Passive Voice & Hedge Detector"
      description="Identify weak, passive, or hedging language in your writing."
    >
      <PassiveHedgeDetector />
    </ToolPage>
  ),
});
