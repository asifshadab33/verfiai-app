import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import SampleSize from "@/components/verifai/tools/SampleSize";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/sample-size")({
  head: () => toolHeadForPath("/tools/sample-size"),
  component: () => (
    <ToolPage
      title="Sample Size Calculator"
      description="Calculate the required sample size for surveys using standard statistical formulas."
    >
      <SampleSize />
    </ToolPage>
  ),
});
