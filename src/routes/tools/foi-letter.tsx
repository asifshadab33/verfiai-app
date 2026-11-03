import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import FoiLetter from "@/components/verifai/tools/FoiLetter";
export const Route = createFileRoute("/tools/foi-letter")({
  component: () => (
    <ToolPage
      title="FOI Request Generator"
      description="Generate a standardized Freedom of Information template letter for public records."
    >
      <FoiLetter />
    </ToolPage>
  ),
});
