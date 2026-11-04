import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import PhishingChecklist from "@/components/verifai/tools/PhishingChecklist";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/phishing-checklist")({
  head: () => toolHeadForPath("/tools/phishing-checklist"),
  component: () => (
    <ToolPage
      title="Phishing Red-Flag Checklist"
      description="Interactive rubric to evaluate emails and messages for phishing indicators."
    >
      <PhishingChecklist />
    </ToolPage>
  ),
});
