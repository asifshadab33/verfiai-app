import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AlertTriangle, HelpCircle, ChevronDown, ArrowRight, BookOpenCheck, Briefcase, Check, CheckCircle2, Code2, FileSearch, Globe, Newspaper, ScanSearch, ShieldCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProCheckoutButton } from "./ProCheckoutButton";

type ClaimState = "supported" | "review" | "conflict" | "insufficient";
const CLAIM_STYLE: Record<ClaimState, { label: string; cls: string; Icon: typeof Check }> = {
  supported: { label: "Supported", cls: "bg-success-soft text-success border-success/30", Icon: CheckCircle2 },
  review: { label: "Mixed Evidence", cls: "bg-warning-soft text-warning border-warning/40", Icon: AlertTriangle },
  conflict: { label: "Contradicted", cls: "bg-danger-soft text-destructive border-destructive/30", Icon: XCircle },
  insufficient: { label: "Insufficient Evidence", cls: "bg-muted text-muted-foreground border-border", Icon: HelpCircle },
};
const Pill = ({ s }: { s: ClaimState }) => { const { label, cls, Icon } = CLAIM_STYLE[s]; return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}><Icon className="size-3" />{label}</span>; };

export function HeroMockup() {
  return <div aria-label="Example verification report" className="rounded-2xl border border-border bg-card p-5 shadow-lg">
    <div className="flex items-center justify-between border-b border-border pb-3"><p className="text-sm font-semibold">Verification report</p><span className="rounded-full bg-success px-2.5 py-0.5 text-xs font-bold text-primary-foreground">Evidence-checked</span></div>
    <ul className="mt-4 space-y-3 text-sm">
      {([["Global EV sales passed 10 million in 2022.", "supported", "3 sources"], ["The new battery doubles range at the same cost.", "review", "1 source"], ["Charging stations outnumber petrol stations in Norway.", "conflict", "2 sources disagree"]] as const).map(([c, s, n]) => <li key={c} className="rounded-xl border border-border p-3"><div className="flex items-start justify-between gap-2"><p>{c}</p><Pill s={s} /></div><p className="mt-1 text-xs text-muted-foreground">{n}</p></li>)}
    </ul>
    <p className="mt-4 text-xs text-muted-foreground">Illustrative example</p>
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

export function ProductDemo({ onTry }: { onTry: () => void }) {
  const [mode, setMode] = useState<Mode>("Quick check");
  const d = MODES[mode];
  return <section aria-labelledby="demo-title" className="mx-auto max-w-7xl px-5 py-16 md:py-20">
    <p className="text-xs font-bold uppercase text-brand">Interactive demo</p>
    <h2 id="demo-title" className="mt-2 font-display text-3xl font-bold">See what Verfiai checks</h2>
    <div role="tablist" aria-label="Check modes" className="mt-6 flex max-w-full gap-1 overflow-x-auto border-b border-border">
      {(Object.keys(MODES) as Mode[]).map(m => <Button key={m} role="tab" aria-selected={mode === m} variant="ghost" onClick={() => setMode(m)} className={`h-11 shrink-0 rounded-none border-b-2 ${mode === m ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}>{m}</Button>)}
    </div>
    <div role="tabpanel" className="mt-6 grid gap-5 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold uppercase text-muted-foreground">Input text</p><p className="mt-3 leading-7">{d.text}</p></div>
      <div className="rounded-2xl border border-border bg-card p-5"><p className="text-xs font-bold uppercase text-muted-foreground">Validation panel</p>
        <ul className="mt-3 hidden space-y-3 md:block">{d.claims.map(([c, s, n]) => <li key={c} className="rounded-xl border border-border p-3 text-sm"><div className="flex items-start justify-between gap-2"><p className="font-medium">{c}</p><Pill s={s} /></div><p className="mt-1 text-xs text-muted-foreground">{n}</p></li>)}</ul>
        <ul className="mt-3 flex flex-col gap-3 md:hidden">{d.claims.map(([c, s, n]) => <li key={c} className={`rounded-lg border border-border border-l-4 bg-background p-3 text-sm ${s === "supported" ? "border-l-success" : s === "review" ? "border-l-warning" : s === "insufficient" ? "border-l-muted-foreground" : "border-l-destructive"}`}>
          <div className="flex flex-col items-start gap-2"><Pill s={s} /><p className="font-medium leading-6">{c}</p></div>
          <details className="group mt-2"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-2 rounded-md text-xs font-semibold text-brand">Show evidence<ChevronDown aria-hidden className="size-4 transition-transform group-open:rotate-180" /></summary><p className="pb-1 text-xs leading-5 text-muted-foreground">{n}</p></details>
        </li>)}</ul>
      </div>
    </div>
    <div className="mt-6 flex flex-wrap items-center gap-4"><Button onClick={onTry}>Check a claim free <ArrowRight /></Button><span className="text-xs text-muted-foreground">Sample data for illustration — real checks show live sources.</span></div>
  </section>;
}

export function HowItWorksSection() {
  const steps = [
    [FileSearch, "1. Ingest", "Paste text, a link, a reference list or a question. Speak it if you prefer."],
    [ScanSearch, "2. Extract", "Verfiai splits text into individual claims or references and searches the web and Crossref for each."],
    [ShieldCheck, "3. Evaluate", "Two AI engines weigh the evidence independently; disagreements go to a third. Every verdict links to its sources."],
  ] as const;
  return <section aria-labelledby="how-title" className="border-y border-border bg-secondary/40"><div className="mx-auto max-w-7xl px-5 py-16">
    <h2 id="how-title" className="font-display text-3xl font-bold">How it works</h2>
    <div className="mt-8 grid gap-8 md:grid-cols-3">{steps.map(([Icon, t, b]) => <div key={t}><Icon className="size-6 text-brand" /><h3 className="mt-3 font-display text-xl font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{b}</p></div>)}</div>
    <p className="mt-8 flex max-w-3xl gap-2 border-l-2 border-warning bg-card p-4 text-sm"><AlertTriangle className="size-4 shrink-0 text-warning" />Limitations: Verfiai can't read paywalled sources, can miss recent events, and AI engines can misread evidence. Treat results as a starting point and open the sources.</p>
  </div></section>;
}

export function UseCases() {
  const cases = [
    [BookOpenCheck, "Researchers", "Validate citations and investigate the evidence behind claims before submission."],
    [Newspaper, "Journalists", "Compare sources and preserve a clear evidence trail for fact-checking workflows."],
    [Briefcase, "Business teams", "Create cited research briefs to validate market figures for decisions and presentations."],
    [Code2, "Developers", "Prepare for structured research and verification workflows. API access coming soon."],
  ] as const;
  return <section id="use-cases" aria-labelledby="uc-title" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
    <h2 id="uc-title" className="font-display text-3xl font-bold">Built for research that needs an audit trail</h2>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cases.map(([Icon, t, b]) => <div key={t} className="rounded-2xl border border-border bg-card p-6"><Icon className="size-6 text-brand" /><h3 className="mt-4 font-display text-lg font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{b}</p></div>)}</div>
  </section>;
}

export function TrustSection() {
  const points = ["Verfiai searches available sources and evaluates the evidence for each claim.", "Results are labelled Supported, Contradicted, Mixed evidence or Insufficient evidence.", "Confidence reflects the available evidence: source quality, diversity, recency and consistency of assessment.", "AI agreement is one signal, not proof that a claim is definitively true.", "Open the sources, review the context, and apply your own judgment for important decisions."];
  const flow = ["Question or text", "Claim extraction", "Source research", "Evidence comparison", "Traceable report"];
  return <section aria-labelledby="trust-title" className="border-y border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2">
    <div><h2 id="trust-title" className="font-display text-3xl font-bold">Evidence, not black-box answers</h2>
      <ul className="mt-6 space-y-4 text-sm">{points.map(t => <li key={t} className="flex gap-3"><Check className="size-5 shrink-0 text-brand" />{t}</li>)}</ul>
      <ol aria-label="Verification pipeline" className="mt-8 flex flex-wrap items-center gap-2 text-xs font-semibold">{flow.map((f, i) => <li key={f} className="flex items-center gap-2"><span className="rounded-full border border-border bg-card px-3 py-1">{f}</span>{i < flow.length - 1 && <ArrowRight aria-hidden className="size-3 text-muted-foreground" />}</li>)}</ol></div>
    <div className="rounded-2xl border border-border bg-card p-6 text-sm">
      <h3 className="font-display text-lg font-bold">Designed for transparent verification</h3>
      <p className="mt-4 leading-6 text-muted-foreground">Verfiai extracts claims and gathers relevant publicly available evidence, recording source links, excerpts and retrieval times. Two AI engines assess each claim, with a tie-break when they disagree. Outputs are decision support, not definitive truth judgments. Search coverage may be incomplete due to paywalls, indexing limits or recent publication dates.</p>
      <Button asChild variant="outline" className="mt-6"><Link to="/methodology">Read the methodology <ArrowRight /></Link></Button>
    </div>
  </div></section>;
}

export function HeroBadges() {
  return <ul className="mt-6 grid max-w-xl gap-2 text-sm sm:grid-cols-2">{["Live web and Crossref research", "Claim-by-claim evidence verdicts", "Source excerpts and timestamps", "Exportable, shareable reports"].map(t => <li key={t} className="flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0 text-success" />{t}</li>)}</ul>;
}

export function WorkspaceCards({ onSelect }: { onSelect: (t: "report" | "fact" | "citation") => void }) {
  const cards = [
    [ScanSearch, "Claim check", "Paste a statement, article or draft. Verfiai identifies factual claims and shows evidence that supports, contradicts or needs further review.", "Check a claim", "fact"],
    [FileSearch, "Research report", "Ask a question and receive a structured, cited research report with key findings, source links, excerpts and limitations.", "Generate a report", "report"],
    [BookOpenCheck, "Citation scan", "Review references for metadata issues, retractions, missing details and other citation risks.", "Scan citations", "citation"],
  ] as const;
  return <section aria-labelledby="ws-title" className="mx-auto max-w-7xl px-5 py-16">
    <h2 id="ws-title" className="font-display text-3xl font-bold">One workspace for evidence-based research</h2>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{cards.map(([Icon, t, b, cta, tab]) => <div key={t} className="flex flex-col rounded-2xl border border-border bg-card p-6"><Icon className="size-6 text-brand" /><h3 className="mt-4 font-display text-lg font-bold">{t}</h3><p className="mt-2 flex-1 text-sm leading-6 text-muted-foreground">{b}</p><Button variant="link" className="mt-4 h-11 justify-start px-0" onClick={() => onSelect(tab)}>{cta} <ArrowRight /></Button></div>)}</div>
  </section>;
}

export const PLANS = [
  { name: "Free", price: "$0", note: "forever", features: ["3 web reports a month", "3 fact-checks a month", "3 citation scans (20 references each)", "Watermarked Word and PDF exports; share links", "1 free try of each without an account"], cta: "Check a claim free", live: true },
  { name: "Pro", price: "$9", note: "per month", features: ["50 reports a month", "Watermark-free Word and PDF exports", "Manage or cancel your subscription anytime"], cta: "Get Pro", live: true, featured: true },
  { name: "Teams", price: "Custom", note: "coming later", features: ["Shared report library", "Higher volumes", "Priority support"], cta: "Contact us", live: false },
];

export function PricingSection({ onStart }: { onStart: () => void }) {
  return <section id="pricing" aria-labelledby="pricing-title" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
    <h2 id="pricing-title" className="font-display text-3xl font-bold">Pricing</h2>
    <div className="mt-8 grid gap-5 md:grid-cols-3">{PLANS.map(p => <div key={p.name} className={`flex flex-col rounded-2xl border bg-card p-6 ${p.featured ? "border-primary shadow-md" : "border-border"}`}>
      <h3 className="font-display text-lg font-bold">{p.name}</h3><p className="mt-3"><span className="font-display text-4xl font-extrabold">{p.price}</span> <span className="text-sm text-muted-foreground">{p.note}</span></p>
      <ul className="mt-5 flex-1 space-y-2 text-sm">{p.features.map(f => <li key={f} className="flex gap-2"><Check className="size-4 shrink-0 text-success" />{f}</li>)}</ul>
      {p.name === "Pro" ? <div className="mt-6"><ProCheckoutButton /></div> : p.live ? <Button className="mt-6" onClick={onStart}>{p.cta}</Button> : <Button asChild variant="outline" className="mt-6"><a href="mailto:hello@verfiai.app">{p.cta}</a></Button>}
    </div>)}</div>
    <p className="mt-5 text-sm text-muted-foreground">No credit card required for the free plan.</p>
  </section>;
}

export const FAQS = [
  ["Does Verfiai tell me what is true?", "No. Verfiai provides verification support by surfacing available evidence. It does not make definitive truth judgments. Review the sources and apply your own judgment."],
  ["How are sources selected?", "Fact-checks and reports use live web search, re-ranked by keyword relevance. Citation scans use Crossref's public records of published papers, including retraction notices."],
  ["What does \"Mixed evidence\" or \"Insufficient evidence\" mean?", "The sources found are ambiguous, conflicting or too thin to clearly support or contradict the claim, so it needs manual review. It isn't a judgement that the claim is false."],
  ["What does confidence mean?", "It reflects the strength of the available evidence — source quality, diversity, recency and whether the AI engines agreed. It is not a guarantee of truth."],
  ["Can Verfiai access paywalled sources?", "No. It can only evaluate publicly accessible content. Paywalled or offline sources cannot be read."],
  ["How does Verfiai handle conflicting evidence?", "Two AI engines (DeepSeek and Qwen) judge each claim; if they disagree, DeepSeek R1 breaks the tie, and conflicting excerpts are shown side by side."],
  ["Is my submitted text private?", "Signed-in reports are saved privately to your account. Your text is sent to search and AI providers to produce results. Don't submit confidential, regulated or unpublished material."],
  ["What are the free-plan limits?", "A free account gets 3 reports, 3 fact-checks and 3 citation scans a month. You can try each tool once without an account. Pro is $9/month for 50 reports."],
  ["Can I export or share reports?", "Yes — Word, Markdown or PDF, plus read-only share links you can turn off. Free exports carry a Verfiai watermark; Pro exports don't."],
] as const;

export function FaqSection() {
  return <section id="faq" aria-labelledby="faq-title" className="border-t border-border bg-secondary/40"><div className="mx-auto max-w-4xl scroll-mt-24 px-5 py-16">
    <h2 id="faq-title" className="font-display text-3xl font-bold">Frequently asked questions</h2>
    <div className="mt-8 divide-y divide-border border-y border-border">{FAQS.map(([q, a]) => <details key={q} className="group py-4"><summary className="cursor-pointer list-none font-semibold focus-visible:outline-2">{q}</summary><p className="mt-2 text-sm leading-6 text-muted-foreground">{a}</p></details>)}</div>
  </div></section>;
}

export function FinalCta({ onStart }: { onStart: () => void }) {
  return <section className="mx-auto max-w-7xl px-5 py-16 text-center"><h2 className="font-display text-3xl font-bold">Check your next claim before you publish it</h2><p className="mx-auto mt-3 max-w-xl text-muted-foreground">Free to try. No credit card. Every verdict comes with its sources.</p><Button size="lg" className="mt-6 h-12" onClick={onStart}>Check a claim free <ArrowRight /></Button></section>;
}
