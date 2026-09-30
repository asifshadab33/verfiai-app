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
    <div className="flex items-center justify-between border-b border-border pb-3"><p className="text-sm font-semibold">Verification report</p><span className="rounded-full bg-success px-2.5 py-0.5 text-xs font-bold text-primary-foreground">Web-Verified</span></div>
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
    <h2 id="demo-title" className="mt-2 font-display text-3xl font-bold">See what Verfi AI checks</h2>
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
    <div className="mt-6 flex flex-wrap items-center gap-4"><Button onClick={onTry}>Check your own text <ArrowRight /></Button><span className="text-xs text-muted-foreground">Sample data for illustration — real checks show live sources.</span></div>
  </section>;
}

export function HowItWorksSection() {
  const steps = [
    [FileSearch, "1. Ingest", "Paste text, a link, a reference list or a question. Speak it if you prefer."],
    [ScanSearch, "2. Extract", "Verfi AI splits text into individual claims or references and searches the web and Crossref for each."],
    [ShieldCheck, "3. Evaluate", "Two AI engines weigh the evidence independently; disagreements go to a third. Every verdict links to its sources."],
  ] as const;
  return <section aria-labelledby="how-title" className="border-y border-border bg-secondary/40"><div className="mx-auto max-w-7xl px-5 py-16">
    <h2 id="how-title" className="font-display text-3xl font-bold">How it works</h2>
    <div className="mt-8 grid gap-8 md:grid-cols-3">{steps.map(([Icon, t, b]) => <div key={t}><Icon className="size-6 text-brand" /><h3 className="mt-3 font-display text-xl font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{b}</p></div>)}</div>
    <p className="mt-8 flex max-w-3xl gap-2 border-l-2 border-warning bg-card p-4 text-sm"><AlertTriangle className="size-4 shrink-0 text-warning" />Limitations: Verfi AI can't read paywalled sources, can miss recent events, and AI engines can misread evidence. Treat results as a starting point and open the sources.</p>
  </div></section>;
}

export function UseCases() {
  const cases = [
    [BookOpenCheck, "Research", "Catch retracted papers and mis-cited references before submission, and get a sourced literature overview in minutes."],
    [Newspaper, "Journalism", "Check every factual claim in a draft or a viral article, with side-by-side quotes where sources disagree."],
    [Briefcase, "Business", "Validate market figures and competitor claims before they go into a deck or decision memo."],
    [Code2, "Developers", "Verify AI-generated answers before showing them to users. A public API is planned."],
  ] as const;
  return <section id="use-cases" aria-labelledby="uc-title" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
    <h2 id="uc-title" className="font-display text-3xl font-bold">Who it's for</h2>
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{cases.map(([Icon, t, b]) => <div key={t} className="rounded-2xl border border-border bg-card p-6"><Icon className="size-6 text-brand" /><h3 className="mt-4 font-display text-lg font-bold">{t}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{b}</p></div>)}</div>
  </section>;
}

export function TrustSection() {
  return <section aria-labelledby="trust-title" className="border-y border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 lg:grid-cols-2">
    <div><h2 id="trust-title" className="font-display text-3xl font-bold">Built for traceable verification</h2>
      <ul className="mt-6 space-y-4 text-sm">{[[Globe, "Every source is saved with its link, excerpt and fetch time."], [ShieldCheck, "Two independent AI engines per claim, with a tie-breaker."], [BookOpenCheck, "Citations checked against Crossref, including retraction notices."], [Check, "Clear labels when results rely on model knowledge alone."]].map(([Icon, t], i) => { const I = Icon as typeof Check; return <li key={i} className="flex gap-3"><I className="size-5 shrink-0 text-brand" />{t as string}</li>; })}</ul>
      <Button asChild variant="outline" className="mt-8"><Link to="/methodology">Read our methodology <ArrowRight /></Link></Button></div>
    <div className="rounded-2xl border border-border bg-card p-6 text-sm">
      <h3 className="font-display text-lg font-bold">At a glance</h3>
      <dl className="mt-4 space-y-4"><div><dt className="font-semibold">What it checks</dt><dd className="mt-1 text-muted-foreground">Factual claims against current web sources; references against Crossref records and retraction notices.</dd></div>
        <div><dt className="font-semibold">What it can't determine</dt><dd className="mt-1 text-muted-foreground">Opinions, predictions, paywalled or offline facts, and whether a source is itself accurate.</dd></div>
        <div><dt className="font-semibold">How confidence works</dt><dd className="mt-1 text-muted-foreground">Agreement between engines and multiple independent sources increases confidence; tie-breaks and single sources call for closer review.</dd></div></dl>
    </div>
  </div></section>;
}

export const PLANS = [
  { name: "Free", price: "$0", note: "forever", features: ["3 web reports a month", "3 fact-checks a month", "3 citation scans (20 references each)", "Word export and share links, with Verfi AI watermark", "1 free try of each without an account"], cta: "Start free", live: true },
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
  ["Is Verfi AI always right?", "No. Verfi AI provides verification support, not definitive truth judgments. It shows the evidence it found so you can decide. Review sources before relying on a result."],
  ["Where does the evidence come from?", "Fact-checks and reports use live web search results; citation checks use Crossref's public records of published papers, including retraction notices."],
  ["Which AI engines do you use?", "DeepSeek and Qwen (through OpenRouter), with DeepSeek R1 as a tie-breaker. Each report lists the engines used."],
  ["What does \"Unverifiable\" mean?", "The sources found didn't clearly support or contradict the claim. It isn't a judgement that the claim is false."],
  ["Is my text stored?", "Reports are saved to your account if you're signed in. Text is sent to AI and search services to run the check. Don't submit confidential material. See our privacy page for details."],
  ["Can I share or export results?", "Yes — download reports as Word, Markdown or PDF, or create a read-only share link you can turn off at any time."],
  ["Do I need an account?", "You can try each tool once without one. A free account gives you 3 of each every month and saves your reports."],
] as const;

export function FaqSection() {
  return <section id="faq" aria-labelledby="faq-title" className="border-t border-border bg-secondary/40"><div className="mx-auto max-w-4xl scroll-mt-24 px-5 py-16">
    <h2 id="faq-title" className="font-display text-3xl font-bold">Frequently asked questions</h2>
    <div className="mt-8 divide-y divide-border border-y border-border">{FAQS.map(([q, a]) => <details key={q} className="group py-4"><summary className="cursor-pointer list-none font-semibold focus-visible:outline-2">{q}</summary><p className="mt-2 text-sm leading-6 text-muted-foreground">{a}</p></details>)}</div>
  </div></section>;
}

export function FinalCta({ onStart }: { onStart: () => void }) {
  return <section className="mx-auto max-w-7xl px-5 py-16 text-center"><h2 className="font-display text-3xl font-bold">Check your next claim before you publish it</h2><p className="mx-auto mt-3 max-w-xl text-muted-foreground">Free to try. No credit card. Every verdict comes with its sources.</p><Button size="lg" className="mt-6 h-12" onClick={onStart}>Check text free <ArrowRight /></Button></section>;
}
