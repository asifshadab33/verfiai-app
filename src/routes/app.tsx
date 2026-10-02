import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ContentPage } from "@/components/verifai/ContentPage";
import { FactChecker } from "@/components/verifai/FactChecker";
import { Checker } from "@/components/verifai/Checker";
import { ReportForm } from "./index";
import type { Lang } from "@/lib/translations";

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
  const [lang, setLang] = useState<Lang>("en" as Lang);
  return (
    <ContentPage title="Research Workspace" intro="Paste a claim, ask a research question, or scan a reference list.">
      <div role="tablist" aria-label="Workspace tools" className="mb-6 flex gap-4 overflow-x-auto border-b border-border">
        {TABS.map(([id, label]) => (
          <button key={id} role="tab" aria-selected={tab === id} onClick={() => setTab(id)}
            className={`min-h-11 shrink-0 border-b-2 pb-2 font-semibold transition-colors ${tab === id ? "border-primary text-brand" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === "claim" ? <FactChecker lang={lang} /> : tab === "report" ? <ReportForm lang={lang} onLang={setLang} /> : <Checker />}
      </div>
      <p className="mt-8 max-w-2xl text-xs text-muted-foreground">
        Verfiai provides verification support, not definitive truth judgments. Your submission may be processed by search and AI providers. Do not submit confidential, regulated, or unpublished material.
      </p>
    </ContentPage>
  );
}
