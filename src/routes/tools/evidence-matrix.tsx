import { createFileRoute } from "@tanstack/react-router";
import { EvidenceMatrix } from "@/components/verifai/tools/EvidenceMatrix";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = {
  path: "/tools/evidence-matrix",
  name: "Claim Evidence Matrix",
  title: "Free Claim Evidence Matrix | Verfiai",
  description:
    "Organize excerpts and notes from sources for and against a claim. Runs in your browser and exports locally.",
};

export const Route = createFileRoute("/tools/evidence-matrix")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Free Claim Evidence Matrix"
      intro="Compare what different sources say about a claim by organizing excerpts, your assessment, and the questions that remain."
      privacy="Runs in your browser. Your claim, excerpts, and notes are not uploaded or saved. CSV export is generated locally."
      notes={[
        {
          title: "How to use it",
          body: "Write one specific claim, add a source for each relevant excerpt, and record whether you think it supports, contradicts, partly addresses, or does not clearly address the claim. Include dates and context in your notes.",
        },
        {
          title: "What this does not do",
          body: "This tool does not verify sources, judge source quality, or decide whether a claim is true. The evidence assessment is yours; check original sources and consider missing context.",
        },
      ]}
    >
      <EvidenceMatrix />
    </ToolPage>
  );
}
