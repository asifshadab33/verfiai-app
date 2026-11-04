import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import PdfTools from "@/components/verifai/tools/PdfTools";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/pdf-tools")({
  head: () => toolHeadForPath("/tools/pdf-tools"),
  component: () => (
    <ToolPage
      title="PDF Merge, Split & Rotate"
      description="Process PDFs entirely in your browser. Files never leave your device."
      styleControls={false}
    >
      <PdfTools />
    </ToolPage>
  ),
});
