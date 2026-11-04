import { createFileRoute } from "@tanstack/react-router";
import { FreeToolPage } from "@/components/verifai/tools/FreeToolPage";
import { freeToolPage } from "@/lib/tools/free-tool-pages";
import { toolHead } from "@/lib/tools/tool-head";
const meta = freeToolPage("ip-checker")!;
export const Route = createFileRoute("/tools/ip-checker")({
  head: () =>
    toolHead({
      path: `/tools/${meta.slug}`,
      name: meta.title,
      title: `Free ${meta.title} | Verfiai`,
      description: meta.description,
    }),
  component: Page,
});
function Page() {
  return <FreeToolPage slug={meta.slug} />;
}
