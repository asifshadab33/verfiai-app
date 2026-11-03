import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import PassiveHedgeDetector from "@/components/verifai/tools/PassiveHedgeDetector";
export const Route = createFileRoute("/tools/passive-hedge")({
  component: () => (
    <ToolPage
      title="Passive Voice & Hedge Detector"
      description="Identify weak, passive, or hedging language in your writing."
    >
      <PassiveHedgeDetector />
    </ToolPage>
  ),
});
