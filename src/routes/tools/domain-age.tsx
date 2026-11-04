import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import DomainAgeChecker from "@/components/verifai/tools/DomainAgeChecker";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/domain-age")({
  head: () => toolHeadForPath("/tools/domain-age"),
  component: () => (
    <ToolPage
      title="Domain Age Checker"
      description="Check domain registration date to spot brand-new fake-news sites via public RDAP."
    >
      <DomainAgeChecker />
    </ToolPage>
  ),
});
