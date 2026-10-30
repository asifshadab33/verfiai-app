import { recentText } from "@/lib/recent-i18n";
import { siteText } from "@/lib/site-i18n";
import type { Lang } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, HelpCircle, ChevronDown, ArrowRight, BookOpenCheck, Briefcase, Check, CheckCircle2, Code2, FileSearch, Globe, Newspaper, ScanSearch, ShieldCheck, XCircle } from "lucide-react";
import { useState } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { Pill } from "./HomeClaimPill";

export function HeroMockup({ lang }: { lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return <div aria-label="Example verification report" className="rounded-2xl border border-border bg-card p-5 shadow-lg">
    <div className="flex items-center justify-between border-b border-border pb-3"><p className="text-sm font-semibold">{siteText(lang, "verificationReport")}</p><span className="rounded-full bg-success px-2.5 py-0.5 text-xs font-bold text-primary-foreground">{siteText(lang, "evidenceChecked")}</span></div>
    <ul className="mt-4 space-y-3 text-sm">
      {([["Global EV sales passed 10 million in 2022.", "supported", "3 sources"], ["The new battery doubles range at the same cost.", "review", "1 source"], ["Charging stations outnumber petrol stations in Norway.", "conflict", "2 sources disagree"]] as const).map(([c, s, n]) => <li key={c} className="rounded-xl border border-border p-3"><div className="flex items-start justify-between gap-2"><p>{t(c)}</p><Pill s={s} lang={lang} /></div><p className="mt-1 text-xs text-muted-foreground">{t(n)}</p></li>)}
    </ul>
    <p className="mt-4 text-xs text-muted-foreground">{siteText(lang, "illustrative")}</p>
  </div>;
}

const MODES = {
  "Quick check": { text: "The Eiffel Tower was completed in 1889 and is repainted every seven years. It was originally meant to stand for only 20 years.", claims: [["The Eiffel Tower was completed in 1889.", "supported", "Official site and encyclopedias agree."], ["It is repainted every seven years.", "review", "Sources say roughly every 7 years; the exact interval varies."], ["It was meant to stand for only 20 years.", "supported", "The original permit was for 20 years."]] },
  Research: { text: "Intermittent fasting leads to greater weight loss than calorie restriction, and it improves insulin sensitivity in all adults.", claims: [["Intermittent fasting improves insulin sensitivity.", "supported", "Several trials report improvement in some groups."], ["It leads to greater weight loss than calorie restriction.", "conflict", "Meta-analyses find similar results for both."], ["The benefit applies to all adults.", "review", "Evidence is limited for older adults and some conditions."]] },
  News: { text: "The city's unemployment rate fell to 3.1% last month, the lowest in 50 years, according to officials.", claims: [["Unemployment fell to 3.1% last month.", "supported", "Matches the published labour statistics."], ["It is the lowest in 50 years.", "insufficient", "Historical series only goes back 35 years."], ["Officials made the announcement.", "supported", "Press release found."]] },
  Academic: { text: "As shown by Wakefield et al. (1998), and confirmed by LeCun et al. (2015)…", claims: [["Wakefield et al. (1998) is a valid source.", "conflict", "The paper was retracted in 2010."], ["LeCun et al. (2015) exists as cited.", "supported", "Matches Nature record, DOI 10.1038/nature14539."], ["The two papers support the same point.", "review", "They cover unrelated topics."]] },
  Business: { text: "Our competitor holds a 40% market share and grew revenue by 25% last year.", claims: [["Competitor holds a 40% market share.", "conflict", "Industry reports give figures between 28% and 41%."], ["Revenue grew 25% last year.", "supported", "Matches the annual report."], ["Growth came from new markets.", "insufficient", "No public breakdown found."]] },
} as const;
type Mode = keyof typeof MODES;

export function ProductDemo({ onTry, lang }: { onTry: () => void; lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  const [mode, setMode] = useState<Mode>("Quick check");
  const d = MODES[mode];
  return <section aria-labelledby="demo-title" className="mx-auto max-w-7xl px-5 py-16 md:py-20">
    <p className="text-xs font-bold uppercase text-brand">{siteText(lang, "demoLabel")}</p>
    <h2 id="demo-title" className="mt-2 font-display text-3xl font-bold">{siteText(lang, "demoTitle")}</h2>
    <Tabs.Root value={mode.replaceAll(" ", "-")} dir={["ar", "fa", "ur"].includes(lang) ? "rtl" : "ltr"} onValueChange={value => { const next = value.replaceAll("-", " "); if (next in MODES) setMode(next as Mode); }}><Tabs.List aria-label={siteText(lang, "demoCheckModes")} className="mt-6 flex max-w-full gap-1 overflow-x-auto border-b border-border">
      {(Object.keys(MODES) as Mode[]).map(m => <Tabs.Trigger key={m} value={m.replaceAll(" ", "-")} asChild><Button variant="ghost" className={`h-11 shrink-0 rounded-none border-b-2 ${mode === m ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}>{siteText(lang, ({ "Quick check": "demoModeQuick", Research: "demoModeResearch", News: "demoModeNews", Academic: "demoModeAcademic", Business: "demoModeBusiness" } as const)[m])}</Button></Tabs.Trigger>)}
    </Tabs.List>
    <Tabs.Content key={mode} value={mode.replaceAll(" ", "-")} className="mt-6 grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold uppercase text-muted-foreground">{siteText(lang, "demoInput")}</p><p className="mt-3 leading-7">{t(d.text)}</p></div>
      <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold uppercase text-muted-foreground">{siteText(lang, "demoValidation")}</p>
        <ul className="mt-3 hidden space-y-3 md:block">{d.claims.map(([c, s, n]) => <li key={c} className="rounded-xl border border-border p-3 text-sm"><div className="flex items-start justify-between gap-2"><p className="font-medium">{t(c)}</p><Pill s={s} lang={lang} /></div><p className="mt-1 text-xs text-muted-foreground">{t(n)}</p></li>)}</ul>
        <ul className="mt-3 flex flex-col gap-3 md:hidden">{d.claims.map(([c, s, n]) => <li key={c} className={`rounded-lg border border-border border-s-4 bg-background p-3 text-sm ${s === "supported" ? "border-s-success" : s === "review" ? "border-s-warning" : s === "insufficient" ? "border-s-muted-foreground" : "border-s-destructive"}`}>
          <div className="flex flex-col items-start gap-2"><Pill s={s} lang={lang} /><p className="font-medium leading-6">{t(c)}</p></div>
          <details className="group mt-2"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-md text-xs font-semibold text-brand">{siteText(lang, "showEvidence")}<ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" /></summary><p className="pb-1 text-xs leading-5 text-muted-foreground">{t(n)}</p></details>
        </li>)}</ul>
      </div>
    </Tabs.Content></Tabs.Root>
    <div className="mt-6 flex flex-wrap items-center gap-4"><Button onClick={onTry}>{siteText(lang, "heroPrimary")} <ArrowRight /></Button><span className="text-xs text-muted-foreground">{siteText(lang, "demoNote")}</span></div>
  </section>;
}

