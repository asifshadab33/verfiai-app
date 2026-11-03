import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { ToolsHub } from "@/components/verifai/tools/ToolsHub";
import { toolHead } from "@/lib/tools/tool-head";

export const Route = createFileRoute("/tools/")({
 head: () => toolHead({ path: "/tools", name: "Verfiai Free Research Tools", title: "Free Research Tools: Fact, Citation and Photo Checks | Verfiai", description: 'Free tools for checking facts, sources and writing: DOI and retraction checker, citation generator, photo metadata, headline analyzer and more.' }),
 component: Page,
});

function Page() {
 return <ContentPage title="Free research tools" intro="Small, free tools for checking facts, sources and writing. Most run entirely in your browser.">
  <ToolsHub />
  <PageSection title="What these tools do not do"><p>None of these tools tells you whether text was written by AI, and none of them proves that something is true. They point you to what is worth checking and show the evidence they found. Tools that look things up use public registries and have fair-use limits.</p></PageSection>
 </ContentPage>;
}
