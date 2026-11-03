import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import ReferenceConverter from "@/components/verifai/tools/ReferenceConverter";
export const Route = createFileRoute("/tools/reference-converter")({
  component: () => (
    <ToolPage
      title="Reference Format Converter"
      description="Convert BibTeX entries to APA, MLA, or Chicago citation formats."
    >
      <ReferenceConverter />
    </ToolPage>
  ),
});
