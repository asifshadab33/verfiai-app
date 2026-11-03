import { createFileRoute } from "@tanstack/react-router";
import { CitationGenerator } from "@/components/verifai/tools/CitationGenerator";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = {
  path: "/tools/citation-generator",
  name: "Citation Generator",
  title: "Free DOI Citation Generator: APA, MLA, Chicago, Harvard | Verfiai",
  description:
    "Turn DOIs into formatted references in APA, MLA, Chicago, Harvard, IEEE or Vancouver using official DOI registry data. Free, no sign-up.",
};

export const Route = createFileRoute("/tools/citation-generator")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Free Citation Generator from a DOI"
      intro="Turn DOIs into formatted references in APA, MLA, Chicago, Harvard, IEEE or Vancouver. Paste several DOIs, choose a style and copy the list."
      privacy="Only the DOIs you enter are sent to our server, which asks the DOI Foundation’s resolver for each formatted reference."
      notes={[
        {
          title: "Check before you submit",
          body: "References come from registry metadata, which can be incomplete or inconsistent. Journal and book titles may need italics in your document, and you should check capitalisation, author names and page numbers against your style guide.",
        },
        {
          title: "Styles",
          body: "APA 7th, MLA 9th, Chicago author-date, Harvard (Cite Them Right), IEEE and Vancouver. Author-date styles are sorted alphabetically; IEEE and Vancouver are numbered in the order you pasted.",
        },
      ]}
    >
      <CitationGenerator />
    </ToolPage>
  );
}
