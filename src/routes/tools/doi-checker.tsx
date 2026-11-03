import { createFileRoute } from "@tanstack/react-router";
import { DoiChecker } from "@/components/verifai/tools/DoiChecker";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = {
  path: "/tools/doi-checker",
  name: "DOI and Retraction Checker",
  title: "Free DOI & Retraction Checker | Verfiai",
  description:
    "Check whether a DOI exists and whether Crossref lists a retraction, correction or expression of concern. Paste up to 10 DOIs. Free, no sign-up.",
};

export const Route = createFileRoute("/tools/doi-checker")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Free DOI and Retraction Checker"
      intro="Paste DOIs or a reference list to see whether each DOI exists, whether a retraction, correction or expression of concern is listed, and whether a free full-text copy is available."
      privacy="Only the DOIs you enter are sent to our server, which looks them up at Crossref, OpenAlex, the DOI Foundation and Unpaywall."
      notes={[
        {
          title: "How to read the results",
          body: "“No notices found” means none of the sources we checked lists one. It does not prove a paper is sound, and notices can take days to appear.",
        },
        {
          title: "Why a DOI might not be found",
          body: "A typo, a very new DOI, or a registry with limited metadata. We try several sources before saying a DOI cannot be found.",
        },
        {
          title: "Where the data comes from",
          body: "Crossref (which also carries Retraction Watch data), OpenAlex as a fallback, the DOI Foundation’s resolver, and Unpaywall for open-access copies.",
        },
      ]}
    >
      <DoiChecker />
    </ToolPage>
  );
}
