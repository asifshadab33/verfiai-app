import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { ToolsHub } from "@/components/verifai/tools/ToolsHub";
import { toolHead } from "@/lib/tools/tool-head";

export const Route = createFileRoute("/tools/")({
  head: () =>
    toolHead({
      path: "/tools",
      name: "Verfiai Free Research Tools",
      title: "Free Research Tools: Fact, Citation and Photo Checks | Verfiai",
      description:
        "Free tools for checking facts, sources and writing: DOI and retraction checker, citation generator, photo metadata, headline analyzer and more.",
    }),
  component: Page,
});

function Page() {
  return (
    <ContentPage
      title="Free research tools"
      intro="Small, free tools for checking facts, sources and writing. Most run entirely in your browser."
    >
      <ToolsHub />
      <PageSection title="Research templates and verification guides">
        <p>Download practical checklists and logs for claims, evidence, citations, and compliance. <Link className="text-brand underline" to="/templates">Browse free research templates and guides ↗</Link></p>
      </PageSection>
      <PageSection title="Executive tools directory">
        <p>Explore a curated directory of external services for company research, media monitoring, documents, reporting, meetings and professional communication. <Link className="text-brand underline" to="/executive-tools">Browse executive tools ↗</Link></p>
      </PageSection>
      <PageSection title="What these tools do not do">
        <p>
          None of these tools tells you whether text was written by AI, and none of them proves that
          something is true. They point you to what is worth checking and show the evidence they
          found. Tools that look things up use public registries and have fair-use limits.
        </p>
      </PageSection>
    </ContentPage>
  );
}
