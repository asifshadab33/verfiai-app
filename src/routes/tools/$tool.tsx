import { createFileRoute, useLocation } from "@tanstack/react-router";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { NewTool } from "@/components/verifai/tools/NewTool";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { toolHead } from "@/lib/tools/tool-head";
import { Checker } from "@/components/verifai/Checker";
import { isLang } from "@/lib/translations";

export const Route = createFileRoute("/tools/$tool")({
  head: ({ params }) => {
    const item = NEW_TOOLS.find((tool) => tool.slug === params.tool);
    if (!item) return {};
    return toolHead({
      path: `/tools/${item.slug}`,
      name: item.title,
      title: `Free ${item.title} | Verfiai`,
      description: item.description,
    });
  },
  component: Page,
});

function Page() {
  const { tool: slug } = Route.useParams();
  const search = useLocation().searchStr;
  const locale = new URLSearchParams(search).get("lang");
  const lang = isLang(locale) ? locale : "en";
  const item = NEW_TOOLS.find((tool) => tool.slug === slug);
  if (!item) {
    return (
      <ToolPage title="Free tool not found" intro="This tool route is not available.">
        <p>Browse the complete free tool catalog to find an available tool.</p>
      </ToolPage>
    );
  }
  if (slug === "citation-checker") {
    return (
      <ToolPage
        title={item.title}
        intro={item.description}
        privacy="Citation text is processed by Verfiai's sign-in-gated citation checker. Do not submit confidential references."
      >
        <Checker lang={lang} />
      </ToolPage>
    );
  }
  const isLauncher = item.kind === "launcher";
  return (
    <ToolPage
      title={item.title}
      intro={item.description}
      privacy={
        isLauncher
          ? "This page only links to the external provider. Verfiai does not proxy or store your content."
          : item.kind === "api"
            ? "Queries go directly from your browser to the named public service. Verfiai does not proxy or store them."
            : "This tool runs in your browser. Your input is not uploaded to Verfiai."
      }
      notes={
        isLauncher
          ? [
              {
                title: "What this verifies and its limits",
                body: "External tools can provide useful investigative clues, but none proves that a claim, image, video, or paper is authentic or accurate. Check original sources and use independent methods.",
              },
            ]
          : []
      }
    >
      <NewTool slug={slug} />
    </ToolPage>
  );
}
