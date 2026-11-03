import { createFileRoute } from "@tanstack/react-router";
import { EvaluationChecklist } from "@/components/verifai/tools/EvaluationChecklist";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = {
  path: "/tools/evaluation-checklist",
  name: "Printable Evaluation Checklist",
  title: "Printable Source Evaluation Checklist | Verfiai",
  description:
    "A free, print-friendly worksheet for evaluating a source's authorship, evidence, date, purpose and corroboration.",
};

export const Route = createFileRoute("/tools/evaluation-checklist")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Source Evaluation Checklist"
      intro="A printable worksheet for recording what you checked about a source and what still needs verification."
      privacy="Static content only. Your notes are not collected or saved."
    >
      <EvaluationChecklist />
    </ToolPage>
  );
}
