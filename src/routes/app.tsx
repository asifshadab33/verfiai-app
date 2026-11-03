import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentPage } from "@/components/verifai/ContentPage";
import { z } from "zod";
import { StudioWorkspace, type StudioTab } from "@/components/verifai/StudioWorkspace";
import { ReportForm } from "./index";
import { languages } from "@/lib/translations";
import { siteText } from "@/lib/site-i18n";
import { useSiteLocale } from "@/lib/locale";
import { translations } from "@/lib/i18n/interface";
import { pageSeoLinks } from "@/lib/seo";

const title = "Research Workspace — Verfiai";
const description =
  "Check a claim, generate a source-linked research report, or scan citations in one workspace.";

export const Route = createFileRoute("/app")({
  head: ({ match }) => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: pageSeoLinks("/app", match.search.lang),
  }),
  validateSearch: z
    .object({
      tab: z.enum(["claim", "fact", "report", "citation", "dossier"]).optional().catch(undefined),
    })
    .passthrough(),
  component: Workspace,
});

function Workspace() {
  const search = Route.useSearch();
  const [tab, setTab] = useState<StudioTab>(
    search.tab === "claim" || !search.tab ? "fact" : search.tab,
  );
  const { lang, changeLang } = useSiteLocale();
  return (
    <ContentPage title={siteText(lang, "appTitle")} intro={siteText(lang, "appIntro")} lang={lang}>
      <label className="mb-5 block text-sm font-semibold">
        {translations[lang].report_language}{" "}
        <select
          aria-label={translations[lang].report_language}
          className="ms-2 rounded-md border border-input bg-card p-2"
          value={lang}
          onChange={(e) => changeLang(e.target.value as typeof lang)}
        >
          {languages.map((l) => (
            <option key={l.code} value={l.code}>
              {translations[l.code].name}
            </option>
          ))}
        </select>
      </label>
      <StudioWorkspace
        lang={lang}
        tab={tab}
        onTab={setTab}
        report={<ReportForm lang={lang} onLang={changeLang} />}
      />
      <p className="mt-8 max-w-2xl text-xs text-muted-foreground">
        {siteText(lang, "appDisclaimer")}
      </p>
    </ContentPage>
  );
}
