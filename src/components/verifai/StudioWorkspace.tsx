import type { ReactNode } from "react";
import { BookOpen, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FactChecker } from "@/components/verifai/FactChecker";
import { Checker } from "@/components/verifai/Checker";
import { DossierForm } from "@/components/verifai/DossierForm";
import { siteText } from "@/lib/site-i18n";
import { uiText } from "@/lib/ui-extra-i18n";
import type { Lang } from "@/lib/translations";

export type StudioTab = "report" | "fact" | "citation" | "dossier";

/** Shared four-tool research studio used by the homepage and /app. */
export function StudioWorkspace({ lang, tab, onTab, report }: { lang: Lang; tab: StudioTab; onTab: (t: StudioTab) => void; report: ReactNode }) {
  const tabs: [StudioTab, string, typeof Search][] = [
    ["report", siteText(lang, "navReport"), BookOpen],
    ["fact", siteText(lang, "navFact"), Search],
    ["citation", siteText(lang, "navCitation"), Search],
    ["dossier", uiText(lang, "dossierTab"), BookOpen],
  ];
  return <>
    <div role="tablist" aria-label={siteText(lang, "workspaceTools")} className="flex max-w-full overflow-x-auto border-b border-border">
      {tabs.map(([id, label, Icon]) => (
        <Button key={id} role="tab" aria-selected={tab === id} title={id === "dossier" ? uiText(lang, "dossierHelp") : undefined} variant="ghost" onClick={() => onTab(id)}
          className={`h-12 shrink-0 rounded-none border-b-2 px-4 ${tab === id ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}><Icon />{label}</Button>
      ))}
    </div>
    <div role="tabpanel" className="pt-10">
      {tab === "report" ? report : tab === "fact" ? <FactChecker lang={lang} /> : tab === "citation" ? <Checker lang={lang} /> : <DossierForm language={lang} />}
    </div>
  </>;
}
