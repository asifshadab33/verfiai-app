import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import TitleCaseConverter from "@/components/verifai/tools/TitleCaseConverter";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/title-case")({
  head: () => toolHeadForPath("/tools/title-case"),
  component: () => (
    <ToolPage
      title="Title Case Converter"
      description="Convert headings to APA, Chicago, or MLA title case rules."
    >
      <TitleCaseConverter />
    </ToolPage>
  ),
});
