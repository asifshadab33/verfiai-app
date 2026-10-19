import { recentText, localizedBreakdown } from "@/lib/recent-i18n";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, HelpCircle, ChevronDown, ArrowRight, BookOpenCheck, Briefcase, Check, CheckCircle2, Code2, FileSearch, Globe, Newspaper, ScanSearch, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteText } from "@/lib/site-i18n";
import { translations } from "@/lib/i18n/interface";
import type { Lang } from "@/lib/translations";
import { CommunityWaitlist } from "./CommunityWaitlist";
import { COMMUNITY_LABELS, FREE_ACCESS_END, FREE_TRY_LINE, IS_FREE_Q, IS_FREE_A } from "@/lib/community";
import { PricingTiers } from "./PricingTiers";

type ClaimState = "supported" | "review" | "conflict" | "insufficient";
const CLAIM_STYLE: Record<ClaimState, { label: string; cls: string; Icon: typeof Check }> = {
  supported: { label: "Supported", cls: "bg-success-soft text-success border-success/30", Icon: CheckCircle2 },
  review: { label: "Mixed Evidence", cls: "bg-warning-soft text-warning border-warning/40", Icon: AlertTriangle },
  conflict: { label: "Contradicted", cls: "bg-danger-soft text-destructive border-destructive/30", Icon: XCircle },
  insufficient: { label: "Insufficient Evidence", cls: "bg-muted text-muted-foreground border-border", Icon: HelpCircle },
};
const Pill = ({ s, lang }: { s: ClaimState; lang: Lang }) => { const { label, cls, Icon } = CLAIM_STYLE[s]; return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}><Icon className="size-3" />{siteText(lang, ({ supported: "verdictSupported", review: "verdictMixed", conflict: "verdictContradicted", insufficient: "verdictInsufficient" } as const)[s])}</span>; };

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
    <div role="tablist" aria-label={siteText(lang, "demoCheckModes")} className="mt-6 flex max-w-full gap-1 overflow-x-auto border-b border-border">
      {(Object.keys(MODES) as Mode[]).map(m => <Button key={m} role="tab" aria-selected={mode === m} variant="ghost" onClick={() => setMode(m)} className={`h-11 shrink-0 rounded-none border-b-2 ${mode === m ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}>{siteText(lang, ({ "Quick check": "demoModeQuick", Research: "demoModeResearch", News: "demoModeNews", Academic: "demoModeAcademic", Business: "demoModeBusiness" } as const)[m])}</Button>)}
    </div>
    <div role="tabpanel" className="mt-6 grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold uppercase text-muted-foreground">{siteText(lang, "demoInput")}</p><p className="mt-3 leading-7">{t(d.text)}</p></div>
      <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold uppercase text-muted-foreground">{siteText(lang, "demoValidation")}</p>
        <ul className="mt-3 hidden space-y-3 md:block">{d.claims.map(([c, s, n]) => <li key={c} className="rounded-xl border border-border p-3 text-sm"><div className="flex items-start justify-between gap-2"><p className="font-medium">{t(c)}</p><Pill s={s} lang={lang} /></div><p className="mt-1 text-xs text-muted-foreground">{t(n)}</p></li>)}</ul>
        <ul className="mt-3 flex flex-col gap-3 md:hidden">{d.claims.map(([c, s, n]) => <li key={c} className={`rounded-lg border border-border border-s-4 bg-background p-3 text-sm ${s === "supported" ? "border-s-success" : s === "review" ? "border-s-warning" : s === "insufficient" ? "border-s-muted-foreground" : "border-s-destructive"}`}>
          <div className="flex flex-col items-start gap-2"><Pill s={s} lang={lang} /><p className="font-medium leading-6">{t(c)}</p></div>
          <details className="group mt-2"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-md text-xs font-semibold text-brand">{siteText(lang, "showEvidence")}<ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" /></summary><p className="pb-1 text-xs leading-5 text-muted-foreground">{t(n)}</p></details>
        </li>)}</ul>
      </div>
    </div>
    <div className="mt-6 flex flex-wrap items-center gap-4"><Button onClick={onTry}>{siteText(lang, "heroPrimary")} <ArrowRight /></Button><span className="text-xs text-muted-foreground">{siteText(lang, "demoNote")}</span></div>
  </section>;
}

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

export function PricingSection({ onStart, lang }: { onStart: () => void; lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return <section id="pricing" aria-labelledby="pricing-title" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
    <p className="text-xs font-bold uppercase text-brand">{COMMUNITY_LABELS[lang]}</p>
    <h2 id="pricing-title" className="mt-2 font-display text-3xl font-bold">Free Access for the Community</h2>
    <div className="mt-8 grid gap-10 md:grid-cols-2">
      <div><p className="font-display text-4xl font-bold">{recentText(lang, "Free until {date}", { date: FREE_ACCESS_END })}</p><p className="mt-4 leading-7 text-muted-foreground">All current features are free during the launch period. No credit card required.</p><div className="mt-6 text-sm"><PricingTiers /></div><p className="mt-4 text-sm leading-6 text-muted-foreground">Reasonable rate limits apply to protect service availability. Current fair-use allowances remain in place; free access does not mean unlimited requests.</p><p className="mt-4 text-sm leading-6 text-muted-foreground">Academic, educator and high-volume research users can request extended access at <a href="mailto:hello@verfiai.app" className="text-brand underline">hello@verfiai.app</a>.</p><div className="mt-6 flex flex-wrap items-center gap-4"><Button onClick={onStart}>{siteText(lang, "heroPrimary")}<ArrowRight /></Button><Link to="/pricing" className="text-sm font-semibold text-brand underline">{t("Community access details")}</Link></div></div>
      <CommunityWaitlist />
    </div>
  </section>;
}

export const FAQS = [
  [IS_FREE_Q, IS_FREE_A],
  ["Does Verfiai tell me what is true?", "No. Verfiai provides verification support by surfacing available evidence. It does not make definitive truth judgments. Review the sources and apply your own judgment."],
  ["How are sources selected?", "Fact-checks and reports use live web search, re-ranked by keyword relevance. Citation scans use Crossref's public records of published papers, including retraction notices."],
  ["What does \"Mixed evidence\" or \"Insufficient evidence\" mean?", "The sources found are ambiguous, conflicting or too thin to clearly support or contradict the claim, so it needs manual review. It isn't a judgement that the claim is false."],
  ["What does confidence mean?", "It reflects the strength of the available evidence — source quality, diversity, recency and whether the AI engines agreed. It is not a guarantee of truth."],
  ["Can Verfiai access paywalled sources?", "No. It can only evaluate publicly accessible content. Paywalled or offline sources cannot be read."],
  ["How does Verfiai handle conflicting evidence?", "Two AI engines review the same retrieved excerpts. If they materially disagree, a third engine reviews the conflicting evidence, and conflicting excerpts are shown side by side. AI agreement is one input to confidence, not proof of accuracy."],
  ["Is my submitted text private?", "Signed-in reports are saved privately to your account. Your text is sent to search and AI providers to produce results. Don't submit confidential, regulated or unpublished material."],
  ["What are the free-plan limits?", "A free account gets 3 reports, 3 fact-checks and 3 citation scans a month. You can try each tool once without an account. Verfiai is free until October 13, 2027, subject to fair-use limits. Academic, educator and high-volume users can request extended access at hello@verfiai.app."],
  ["Can I export or share reports?", "Yes — Word, Markdown or PDF, plus read-only share links you can turn off. Community exports carry a Verfiai watermark. Paid checkout is currently unavailable."],
] as const;

export function FaqSection({ lang }: { lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return <section id="faq" aria-labelledby="faq-title" className="border-t border-border bg-secondary/40"><div className="mx-auto max-w-4xl scroll-mt-24 px-5 py-16">
    <h2 id="faq-title" className="font-display text-3xl font-bold">{siteText(lang, "faqTitle")}</h2>
    <div className="mt-8 divide-y divide-border border-y border-border">{FAQS.map(([q, a]) => <details key={q} className="group py-4"><summary className="cursor-pointer list-none font-semibold focus-visible:outline-2">{t(q)}</summary><p className="mt-2 text-sm leading-6 text-muted-foreground">{t(a)}</p></details>)}</div>
  </div></section>;
}

export function FinalCta({ onStart, lang }: { onStart: () => void; lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return <section className="mx-auto max-w-7xl px-5 py-16 text-center"><h2 className="font-display text-3xl font-bold">{siteText(lang, "finalHeading")}</h2><p className="mx-auto mt-3 max-w-xl text-muted-foreground">{siteText(lang, "finalBody")}</p><Button size="lg" className="mt-6 h-12" onClick={onStart}>{t("Check a claim free")}<ArrowRight /></Button><p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground">{t(FREE_TRY_LINE)}</p></section>;
}

const SAMPLE_CLAIMS: { claim: string; s: ClaimState; strength: string; count: number; quality: string; excerpt: string; pub: string; conflict?: string }[] = [
  { claim: "Global EV sales passed 10 million in 2022.", s: "supported", strength: "Strong", count: 3, quality: "Government or intergovernmental source", excerpt: "“Electric car sales exceeded 10 million in 2022.”", pub: "Example intergovernmental agency · 2023-04-26" },
  { claim: "The new battery doubles range at the same cost.", s: "insufficient", strength: "Weak", count: 1, quality: "Organization/publication source", excerpt: "“Prototype cells showed promising density gains.”", pub: "Example company blog · 2024-02-01" },
  { claim: "Charging stations outnumber petrol stations in Norway.", s: "review", strength: "Moderate", count: 2, quality: "Reputable news source", excerpt: "“Public chargers now exceed fuel pumps in several regions.”", pub: "Example news outlet · 2024-06-10", conflict: "“Nationwide, fuel stations still outnumber charging sites.” — Example statistics office · 2024-05-02" },
  { claim: "EVs produce zero lifetime emissions.", s: "conflict", strength: "Strong", count: 4, quality: "Peer-reviewed source", excerpt: "“Manufacturing emissions mean lifetime emissions are lower, not zero.”", pub: "Example journal · 2022-11-15" },
];

/** Illustrative only: every value below is synthetic sample data, not a real verification. */
export function ReportProofSection({ lang = "en" }: { lang?: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return <section aria-labelledby="proof-title" className="mx-auto max-w-7xl px-5 py-16">
    <h2 id="proof-title" className="font-display text-3xl font-bold">{t("What a real Verfiai report includes")}</h2>
    <p className="mt-2 text-sm text-muted-foreground"><strong>{t("Illustrative sample")}</strong> — synthetic example data showing the layout, not a real check.</p>
    <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
      <dl className="grid gap-3 border-b border-border pb-4 sm:grid-cols-3">
        <div><dt className="text-xs font-bold uppercase text-muted-foreground">{t("Original question")}</dt><dd className="mt-1">Are electric vehicles really cleaner and more practical in 2024?</dd></div>
        <div><dt className="text-xs font-bold uppercase text-muted-foreground">{t("Retrieved")}</dt><dd className="mt-1">2024-07-01 09:30 UTC (sample)</dd></div>
        <div><dt className="text-xs font-bold uppercase text-muted-foreground">{t("Sources")}</dt><dd className="mt-1">10 sources, 8 independent domains</dd></div>
      </dl>
      <h3 className="mt-4 font-display text-lg font-bold">{t("Extracted claims")}</h3>
      <ul className="mt-3 space-y-4">{SAMPLE_CLAIMS.map(c => <li key={c.claim} className="border-s-2 border-border ps-4">
        <div className="flex flex-wrap items-center gap-2"><Pill s={c.s} lang={lang} /><span className="text-xs font-semibold">{t("Evidence strength")}: {c.strength}</span><span className="text-xs text-muted-foreground">· {recentText(lang, "Sources: {count}", {count: c.count})} · {t(c.quality)}</span></div>
        <p className="mt-1 font-medium">{t(c.claim)}</p>
        <div className={c.conflict ? "mt-2 grid gap-2 md:grid-cols-2" : "mt-2"}>
          <blockquote className="border border-border bg-background p-2 text-xs text-muted-foreground">{t(c.excerpt)}<span className="mt-1 block">{t(c.pub)}</span></blockquote>
          {c.conflict && <blockquote className="border border-destructive/30 bg-background p-2 text-xs text-muted-foreground"><span className="font-semibold text-destructive">Conflicting excerpt: </span>{t(c.conflict)}</blockquote>}
        </div>
      </li>)}</ul>
      <h3 className="mt-5 font-display text-lg font-bold">{t("Limitations and open questions")}</h3>
      <p className="mt-1 text-muted-foreground">{t("Paywalled studies were not read; regional charging data may lag by months.")}</p>
      <p className="mt-4 flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full border border-border px-3 py-1">{t("Export: Word · Markdown · PDF")}</span><span className="rounded-full border border-border px-3 py-1">{t("Share link")}</span></p>
    </div>
  </section>;
}

export function CitationFeature({ onScan, lang = "en" }: { onScan: () => void; lang?: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return <section aria-labelledby="cite-title" className="border-y border-border bg-secondary/40"><div className="mx-auto max-w-7xl px-5 py-16">
    <h2 id="cite-title" className="font-display text-3xl font-bold">{t("Check references before submission")}</h2>
    <p className="mt-3 max-w-2xl text-muted-foreground">{t("Paste a reference list or upload a document. Verfiai checks metadata, missing details, retraction notices, and citation risks using Crossref records.")}</p>
    <Button className="mt-6" onClick={onScan}>{t("Scan a reference list")}<ArrowRight /></Button>
  </div></section>;
}
