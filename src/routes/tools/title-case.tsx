import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import TitleCaseConverter from "@/components/verifai/tools/TitleCaseConverter";
export const Route = createFileRoute("/tools/title-case")({
  component: () => (
    <ToolPage
      title="Title Case Converter"
      description="Convert headings to APA, Chicago, or MLA title case rules."
    >
      <TitleCaseConverter />
    </ToolPage>
  ),
});
