import { createFileRoute } from "@tanstack/react-router";
import ToolPage from "@/components/verifai/tools/ToolPage";
import MarkdownEditor from "@/components/verifai/tools/MarkdownEditor";
import { toolHeadForPath } from "@/lib/tools/tool-head";
export const Route = createFileRoute("/tools/markdown-editor")({
  head: () => toolHeadForPath("/tools/markdown-editor"),
  component: () => (
    <ToolPage
      title="Markdown Editor & Preview"
      description="Write and preview markdown text side-by-side in your browser."
    >
      <MarkdownEditor />
    </ToolPage>
  ),
});
