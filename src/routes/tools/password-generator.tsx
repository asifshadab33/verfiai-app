import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import PasswordGenerator from "@/components/verifai/tools/PasswordGenerator";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/password-generator")({
  head: () => toolHeadForPath("/tools/password-generator"),
  component: () => (
    <ToolPage
      title="Password Generator"
      description="Generate cryptographically secure random passwords entirely in your browser."
    >
      <PasswordGenerator />
    </ToolPage>
  ),
});
