import { createFileRoute } from "@tanstack/react-router";
import { ContentPage } from "@/components/verifai/ContentPage";
import { ResourceLibrary } from "@/components/verifai/ResourceLibrary";
import { toolHead } from "@/lib/tools/tool-head";

const title = "Free Research Templates & Verification Guides";
const description = "Download checklists and logs for claims, evidence, citations, and compliance.";

export const Route = createFileRoute("/templates")({
  head: () =>
    toolHead({
      path: "/templates",
      name: title,
      title: `${title} | Verfiai`,
      description,
    }),
  component: Page,
});

function Page() {
  return (
    <ContentPage
      title={title}
      intro="Download checklists and logs for claims, evidence, citations, and compliance."
    >
      <ResourceLibrary />
    </ContentPage>
  );
}
