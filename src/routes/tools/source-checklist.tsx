import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import SourceChecklist from "@/components/verifai/tools/SourceChecklist";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/source-checklist")({
  head: () => toolHeadForPath("/tools/source-checklist"),
  component: () => (
    <ToolPage
      title="Source Evaluation Checklist"
      description="Interactive rubric to assess the reliability and credibility of a source."
    >
      <SourceChecklist />
    </ToolPage>
  ),
});
