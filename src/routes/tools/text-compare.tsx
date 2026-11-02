import { createFileRoute } from "@tanstack/react-router";
import { TextCompare } from "@/components/verifai/tools/TextCompare";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = { path: "/tools/text-compare", name: "Text Compare", title: "Free Text Compare: See Differences Between Two Texts | Verfiai", description: "Compare two versions of a text and see what was added or removed, word by word. Runs in your browser; your text is never uploaded." };

export const Route = createFileRoute("/tools/text-compare")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return <ToolPage
    title="Free Text Compare"
    intro="Paste two versions of a text and see exactly which words were added or removed."
    privacy="Runs in your browser. The text you enter is not uploaded to our servers or to analytics."
    notes={[
        { title: "How the comparison works", body: "Texts are compared word by word. Differences in spacing and line breaks are ignored. Very large texts are compared line by line first, and only the first 200,000 characters of each side are used." },
        { title: "Good for", body: "Checking edits between drafts, seeing what an editor changed, or comparing a quotation with its original source." },
    ]}
  >
    <TextCompare />
  </ToolPage>;
}
