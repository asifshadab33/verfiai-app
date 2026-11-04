import { useLocation } from "@tanstack/react-router";
import { FreeTool } from "@/components/verifai/tools/FreeTool";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { freeToolCopyKey, freeToolPage } from "@/lib/tools/free-tool-pages";
import { isLang } from "@/lib/translations";
import { siteText } from "@/lib/site-i18n";

export function FreeToolPage({ slug }: { slug: string }) {
  const tool = freeToolPage(slug);
  const { searchStr } = useLocation();
  if (!tool) return null;
  const locale = new URLSearchParams(searchStr).get("lang");
  const lang = isLang(locale) ? locale : "en";
  const browserOnly = [
    "phone-verifier",
    "unit-converter",
    "percentage-calculator",
    "calculator",
    "age-date-calculator",
    "flashcards",
    "stopwatch-timer",
    "scratch-notes",
  ].includes(slug);
  return (
    <ToolPage
      title={`Free ${siteText(lang, freeToolCopyKey(slug, "Title")) || tool.title}`}
      intro={siteText(lang, freeToolCopyKey(slug, "Description")) || tool.description}
      privacy={
        browserOnly
          ? "This tool runs locally in your browser. Your input is not uploaded."
          : "Your browser connects directly to the named keyless public service. Verfiai does not proxy or store your query."
      }
      notes={[{ title: "Source and limitations", body: tool.note }]}
    >
      <FreeTool slug={slug} />
    </ToolPage>
  );
}
