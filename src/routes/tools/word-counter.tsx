import { createFileRoute } from "@tanstack/react-router";
import { WordCounter } from "@/components/verifai/tools/WordCounter";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = {
  path: "/tools/word-counter",
  name: "Word and Character Counter",
  title: "Free Word & Character Counter with Reading Time | Verfiai",
  description:
    "Count words, characters, sentences and paragraphs and estimate reading time. Runs in your browser; your text is never uploaded.",
};

export const Route = createFileRoute("/tools/word-counter")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Free Word and Character Counter"
      intro="Count words, characters, sentences and paragraphs, estimate reading and speaking time, and see your most repeated words."
      privacy="Runs in your browser. The text you enter is not uploaded to our servers or to analytics."
      notes={[
        {
          title: "How it counts",
          body: "Words are counted with your browser’s word-boundary rules, so it also works for languages written without spaces. Reading time assumes about 238 words a minute (about 500 characters a minute for Chinese, Japanese and Korean); speaking time assumes 150 words a minute.",
        },
        {
          title: "Reading ease score",
          body: "The Flesch reading-ease score appears only for English text. Treat it as a rough guide, not a quality grade.",
        },
      ]}
    >
      <WordCounter />
    </ToolPage>
  );
}
