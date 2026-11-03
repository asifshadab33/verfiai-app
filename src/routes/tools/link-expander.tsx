import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import LinkExpander from "@/components/verifai/tools/LinkExpander";
export const Route = createFileRoute("/tools/link-expander")({
  component: () => (
    <ToolPage
      title="Link Expander"
      description="Reveal the final destination of shortened URLs. (Skipped if CORS-blocked)."
    >
      <LinkExpander />
    </ToolPage>
  ),
});
