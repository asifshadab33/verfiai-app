import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import MarkdownEditor from "@/components/verifai/tools/MarkdownEditor";
import { toolHead } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/markdown-editor")({
  head: () =>
    toolHead({
      path: "/tools/markdown-editor",
      name: "Markdown Editor & Preview",
      title: "Free Markdown Editor & Preview | Verfiai",
      description: "Write and preview markdown text side-by-side in your browser.",
    }),
  component: () => (
    <ToolPage
      title="Markdown Editor & Preview"
      description="Write and preview markdown text side-by-side in your browser."
    >
      <MarkdownEditor />
    </ToolPage>
  ),
});
