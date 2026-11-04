import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import DisposableEmail from "@/components/verifai/tools/DisposableEmail";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/disposable-email")({
  head: () => toolHeadForPath("/tools/disposable-email"),
  component: () => (
    <ToolPage
      title="Disposable Email Checker"
      description="Check if an email address uses a known temporary or disposable domain."
    >
      <DisposableEmail />
    </ToolPage>
  ),
});
