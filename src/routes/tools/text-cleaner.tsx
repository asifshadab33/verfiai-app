import { createFileRoute } from "@tanstack/react-router";
import { TextCleaner } from "@/components/verifai/tools/TextCleaner";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = {
  path: "/tools/text-cleaner",
  name: "Text Cleaner and Case Converter",
  title: "Text Cleaner & Case Converter: Fix Copied Text | Verfiai",
  description:
    "Fix text copied from PDFs and web pages, remove hidden characters and convert between UPPER, lower, Title, Sentence, camel, snake and kebab case.",
};

export const Route = createFileRoute("/tools/text-cleaner")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Text Cleaner and Case Converter"
      intro="Fix text copied from PDFs and web pages, remove hidden characters, and convert between UPPER, lower, Title, Sentence, camel, snake and kebab case."
      privacy="Runs in your browser. The text you enter is not uploaded to our servers or to analytics."
      notes={[
        {
          title: "Case rules",
          body: "Title case keeps small words such as “of” and “the” lowercase except at the start and end, and leaves acronyms and mixed-case names like NASA and iPhone alone. Sentence case lowercases everything else, so acronyms are lost.",
        },
        {
          title: "Hyphenation repair",
          body: "The hyphenation option joins words split across lines. It cannot tell a split word from a real hyphen, so check the result.",
        },
      ]}
    >
      <TextCleaner />
    </ToolPage>
  );
}
