import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentPage } from "@/components/verifai/ContentPage";
import { FactChecker } from "@/components/verifai/FactChecker";
import { Checker } from "@/components/verifai/Checker";
import { ReportForm } from "./index";
import { languages } from "@/lib/translations";
import { siteText } from "@/lib/site-i18n";
import { useSiteLocale } from "@/lib/locale";
import { translations } from "@/lib/i18n/interface";
import { Button } from "@/components/ui/button";

const title = "Research Workspace — Verfiai";
const description = "Check a claim, generate a source-linked research report, or scan citations in one workspace.";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/app" }],
  }),
  component: Workspace,
});

const TABS = [["claim", "Claim check"], ["report", "Research report"], ["citation", "Citation scan"]] as const;

function Workspace() {
  const [tab, setTab] = useState<(typeof TABS)[number][0]>("claim");
  const { lang, changeLang } = useSiteLocale();
  return (
    <ContentPage title={siteText(lang, "appTitle")} intro={siteText(lang, "appIntro")} lang={lang}>
      <label className="mb-5 block text-sm font-semibold">{translations[lang].report_language} <select aria-label={translations[lang].report_language} className="ms-2 rounded-md border border-input bg-card p-2" value={lang} onChange={e => changeLang(e.target.value as typeof lang)}>{languages.map(l => <option key={l.code} value={l.code}>{translations[l.code].name}</option>)}</select></label>
      <div role="tablist" aria-label={siteText(lang, "appTools")} className="mb-6 flex gap-4 overflow-x-auto border-b border-border">
        {TABS.map(([id, label]) => (
          <Button key={id} variant="ghost" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`min-h-11 shrink-0 border-b-2 pb-2 font-semibold transition-colors ${tab === id ? "border-primary text-brand" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {siteText(lang, id === "claim" ? "appClaim" : id === "report" ? "appReport" : "appCitation")}
          </Button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === "claim" ? <FactChecker lang={lang} /> : tab === "report" ? <ReportForm lang={lang} onLang={changeLang} /> : <Checker lang={lang} />}
      </div>
      <p className="mt-8 max-w-2xl text-xs text-muted-foreground">
        {siteText(lang, "appDisclaimer")}
      </p>
    </ContentPage>
  );
}
