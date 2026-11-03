import { createFileRoute } from "@tanstack/react-router";
import { HeadlineQuiz } from "@/components/verifai/tools/HeadlineQuiz";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = {
  path: "/tools/headline-quiz",
  name: "Spot the Fake Headline",
  title: "Spot the Fake Headline Quiz | Verfiai",
  description:
    "Take a free, browser-based quiz to spot clickbait, misleading statistics, false balance and fabricated attribution in illustrative headlines.",
};

export const Route = createFileRoute("/tools/headline-quiz")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return (
    <ToolPage
      title="Spot the Fake Headline"
      intro="Decide whether each headline uses manipulated framing, then see your score and the technique behind each example."
      privacy="Runs entirely in your browser. Your answers are not uploaded or saved."
      notes={[
        {
          title: "About the examples",
          body: "The headlines are illustrative exercises, not quotations from news outlets. The quiz tests framing techniques and does not determine whether a real-world claim is true.",
        },
      ]}
    >
      <HeadlineQuiz />
    </ToolPage>
  );
}
