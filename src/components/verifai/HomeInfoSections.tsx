import { recentText } from "@/lib/recent-i18n";
import { siteText } from "@/lib/site-i18n";
import type { Lang } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight, BookOpenCheck, Briefcase, Check, CheckCircle2, Code2, FileSearch, Globe, Newspaper, ScanSearch, ShieldCheck } from "lucide-react";

export function HowItWorksSection({ lang }: { lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  const steps = [
    [FileSearch, siteText(lang, "howIngest"), siteText(lang, "howIngestBody")],
    [ScanSearch, siteText(lang, "howExtract"), siteText(lang, "howExtractBody")],
    [ShieldCheck, siteText(lang, "howEvaluate"), siteText(lang, "howEvaluateBody")],
    [Globe, t("Review and export"), t("Open sources, inspect conflicting evidence, and export a traceable report.")],
  ] as const;
  const EN: Record<number, [string, string]> = { 0: ["Ingest", "Paste text, a link, a reference list, or a question."], 1: ["Extract", "Verfiai identifies individual claims or references."], 2: ["Research and evaluate", "Verfiai searches available public sources and evaluates the evidence."], 3: ["Review and export", "Open sources, inspect conflicting evidence, and export a traceable report."] };
  const shown = steps.map((st, i) => ({ Icon: st[0], t: lang === "en" ? (EN[i]?.[0] ?? st[1]) : st[1], b: lang === "en" ? (EN[i]?.[1] ?? st[2]) : st[2] }));
  return <section aria-labelledby="how-title" className="border-y border-border bg-secondary/40"><div className="mx-auto max-w-7xl px-5 py-16">
    <h2 id="how-title" className="font-display text-3xl font-bold">{siteText(lang, "howTitle")}</h2>
    <ol className="mt-8 grid gap-8 md:grid-cols-4">{shown.map(({ Icon, t, b }, i) => <li key={i}><Icon className="size-6 text-brand" aria-hidden /><h3 className="mt-3 font-display text-xl font-bold">{i + 1}. {t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{b}</p></li>)}</ol>
    <p className="mt-8 flex max-w-3xl gap-2 border-s-2 border-warning bg-card p-4 text-sm"><AlertTriangle className="size-4 shrink-0 text-warning" />{siteText(lang, "howLimitations")}</p>
  </div></section>;
}

export function UseCases({ lang }: { lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  const cases = [
    [BookOpenCheck, siteText(lang, "researchers"), siteText(lang, "researchersBody")],
    [Newspaper, siteText(lang, "journalists"), siteText(lang, "journalistsBody")],
    [Briefcase, siteText(lang, "businessTeams"), siteText(lang, "businessTeamsBody")],
    [Code2, siteText(lang, "developers"), siteText(lang, "developersBody")],
  ] as const;
  return <section id="use-cases" aria-labelledby="uc-title" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
    <h2 id="uc-title" className="font-display text-3xl font-bold">{siteText(lang, "useCasesTitle")}</h2>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cases.map(([Icon, t, b]) => <div key={t} className="rounded-2xl border border-border bg-card p-6"><Icon className="size-6 text-brand" /><h3 className="mt-4 font-display text-lg font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{b}</p></div>)}</div>
  </section>;
}

export function TrustSection({ lang }: { lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  const points = [siteText(lang, "trustPoint1"), siteText(lang, "trustPoint2"), siteText(lang, "trustPoint3"), siteText(lang, "trustPoint4"), siteText(lang, "trustPoint5")];
  const flow = [siteText(lang, "flow1"), siteText(lang, "flow2"), siteText(lang, "flow3"), siteText(lang, "flow4"), siteText(lang, "flow5")];
  return <section aria-labelledby="trust-title" className="border-y border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2">
    <div><h2 id="trust-title" className="font-display text-3xl font-bold">{siteText(lang, "trustTitle")}</h2>
      <ul className="mt-6 space-y-4 text-sm">{points.map(t => <li key={t} className="flex gap-3"><Check className="size-5 shrink-0 text-brand" />{t}</li>)}</ul>
      <ol aria-label={siteText(lang, "flowLabel")} className="mt-8 flex flex-wrap items-center gap-2 text-xs font-semibold">{flow.map((f, i) => <li key={f} className="flex items-center gap-2"><span className="rounded-full border border-border bg-card px-3 py-1">{f}</span>{i < flow.length - 1 && <ArrowRight aria-hidden className="size-3 text-muted-foreground" />}</li>)}</ol></div>
    <div className="rounded-2xl border border-border bg-card p-6 text-sm">
      <h3 className="font-display text-lg font-bold">{siteText(lang, "trustDetailTitle")}</h3>
      <p className="mt-4 leading-6 text-muted-foreground">{siteText(lang, "trustDetail")}</p>
      <Button asChild variant="outline" className="mt-6"><Link to="/methodology">{t("Read the methodology")}<ArrowRight /></Link></Button>
    </div>
  </div></section>;
}

export function HeroBadges({ lang }: { lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return <ul className="mt-6 grid max-w-xl gap-2 text-sm sm:grid-cols-2">{[siteText(lang, "badgeLive"), siteText(lang, "badgeClaims"), siteText(lang, "badgeExcerpts"), siteText(lang, "badgeExports")].map(t => <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0 text-success" />{t}</li>)}</ul>;
}

export function WorkspaceCards({ onSelect, lang }: { onSelect: (t: "report" | "fact" | "citation") => void; lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  const cards = [
    [ScanSearch, siteText(lang, "appClaim"), siteText(lang, "cardClaimBody"), siteText(lang, "cardClaimCta"), "fact"],
    [FileSearch, lang === "en" ? "Create a research report" : siteText(lang, "appReport"), lang === "en" ? "Ask a question and receive a cited report." : siteText(lang, "cardReportBody"), siteText(lang, "cardReportCta"), "report"],
    [BookOpenCheck, lang === "en" ? "Scan citations" : siteText(lang, "appCitation"), lang === "en" ? "Check references for metadata, retraction, and citation risks." : siteText(lang, "cardCitationBody"), siteText(lang, "cardCitationCta"), "citation"],
  ] as const;
  return <section aria-labelledby="ws-title" className="mx-auto max-w-7xl px-5 py-16">
    <h2 id="ws-title" className="font-display text-3xl font-bold">{siteText(lang, "workspaceCardsTitle")}</h2>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{cards.map(([Icon, t, b, cta, tab]) => <div key={t} className="flex flex-col rounded-2xl border border-border bg-card p-6"><Icon className="size-6 text-brand" /><h3 className="mt-4 font-display text-lg font-bold">{t}</h3><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{b}</p><Button variant="link" className="mt-4 h-11 justify-start px-0" onClick={() => onSelect(tab)}>{cta} <ArrowRight /></Button></div>)}</div>
  </section>;
}

