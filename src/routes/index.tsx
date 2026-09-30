import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, ChevronDown, FileCheck2, FileText, Globe2, LoaderCircle, Menu, Search, ShieldCheck, Upload, UserRound, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checker } from "@/components/verifai/Checker";
import { FactChecker } from "@/components/verifai/FactChecker";
import { GenerationProgress } from "@/components/verifai/GenerationProgress";
import { ReportView } from "@/components/verifai/ReportView";
import { FAQS, FaqSection, FinalCta, HeroBadges, HeroMockup, HowItWorksSection, PricingSection, ProductDemo, TrustSection, UseCases, WorkspaceCards } from "@/components/verifai/HomeSections";
import { SiteFooter } from "@/components/verifai/SiteFooter";
import { PaymentTestModeBanner } from "@/components/verifai/PaymentTestModeBanner";
import { VoiceButton, isRtlLang } from "@/components/verifai/VoiceButton";
import { useAuth } from "@/hooks/useAuth";
import { generateReport, generateGuestReport, getReportUsage, MONTHLY_REPORT_LIMIT, type ResearchReport } from "@/lib/report.functions";
import { isLang, languages, type Lang } from "@/lib/translations";
import { hasSiteTranslation, siteText } from "@/lib/site-i18n";

const SITE = "https://verfiai.app";
const STORE_LANG = "verifai-lang";

function AccountLink() {
  const { user } = useAuth();
  return <Button asChild variant="outline" size="sm"><Link to={user ? "/reports" : "/auth"}><UserRound />{user ? "My reports" : "Sign in"}</Link></Button>;
}
const RTL: Lang[] = ["ar", "ur", "fa"];

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { lang?: Lang } => isLang(s["lang"]) ? { lang: s["lang"] } : {},
  loaderDeps: ({ search }) => ({ lang: search.lang ?? "en" }),
  loader: ({ deps }) => ({ lang: deps.lang as Lang }),
  head: ({ loaderData }) => {
    const lang = loaderData?.lang ?? "en";
    const title = `${siteText(lang, "heroTitle")} | Verfi AI`;
    const description = siteText(lang, "seoDescription");
    const url = lang === "en" ? `${SITE}/` : `${SITE}/?lang=${lang}`;
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { property: "og:url", content: url },
      { property: "og:locale", content: lang }, { name: "twitter:card", content: "summary_large_image" },
    ], links: [{ rel: "canonical", href: url }], scripts: [
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: "Verfi AI", applicationCategory: "BusinessApplication", operatingSystem: "Web", url: SITE, description, offers: { "@type": "Offer", price: "0", priceCurrency: "USD" } }) },
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQS.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }) },
    ] };
  },
  component: Home,
});

type TextKey = Parameters<typeof siteText>[1];
function LanguagePicker({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return <label className="flex items-center gap-1.5 text-sm text-muted-foreground"><Globe2 className="size-4" /><span className="sr-only">Language</span><select aria-label="Language" value={lang} onChange={e => onChange(e.target.value as Lang)} className="max-w-32 bg-transparent font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">{languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select></label>;
}

async function extractFileText(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) { const mammoth = await import("mammoth"); return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value; }
  if (name.endsWith(".pdf")) {
    const pdfjs = await import("pdfjs-dist");
    const worker = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
    pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
    const pdf = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    let out = "";
    for (let i = 1; i <= Math.min(pdf.numPages, 30) && out.length < 12000; i++) {
      const c = await (await pdf.getPage(i)).getTextContent();
      out += c.items.map(it => ("str" in it ? it.str : "")).join(" ") + "\n\n";
    }
    return out;
  }
  return file.text();
}

function SampleReportDialog({ label }: { label: string }) {
  return <Dialog><DialogTrigger asChild><Button size="lg" variant="outline" className="h-12">{label}</Button></DialogTrigger>
    <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>Sample report (illustrative)</DialogTitle><DialogDescription>Example output for demonstration only. It is not live data and its sources were not checked.</DialogDescription></DialogHeader>
      <div className="space-y-4 text-sm leading-6">
        <p className="text-xs font-bold uppercase text-brand">Question: Does daily coffee affect sleep quality?</p>
        <div><h3 className="font-semibold">Executive summary</h3><p className="text-muted-foreground">Caffeine late in the day is widely reported to delay sleep and shorten deep sleep, but the size of the effect varies between people and with timing.</p></div>
        <div><h3 className="font-semibold">Claim assessments</h3><ul className="mt-2 space-y-2">
          <li className="border-l-4 border-l-warning pl-3"><span className="text-xs font-bold">Mixed Evidence</span><p>Caffeine within 6 hours of bedtime reduces total sleep.</p></li>
          <li className="border-l-4 border-l-muted-foreground pl-3"><span className="text-xs font-bold">Insufficient Evidence</span><p>Morning coffee has no effect on sleep.</p></li></ul></div>
        <div><h3 className="font-semibold">Limitations</h3><p className="text-muted-foreground">Illustrative example; a real report links each claim to live sources with retrieval dates.</p></div>
      </div>
      <Button asChild variant="outline"><Link to="/sample-report">Open the full sample report</Link></Button>
    </DialogContent></Dialog>;
}

export function ReportForm({ lang, onLang }: { lang: Lang; onLang: (l: Lang) => void }) {
  const tx = (key: TextKey) => siteText(lang, key);
  const generate = useServerFn(generateReport);
  const generateGuest = useServerFn(generateGuestReport);
  const [guestDone, setGuestDone] = useState(false);
  const fetchUsage = useServerFn(getReportUsage);
  const { user, loading: authLoading } = useAuth();
  const [question, setQuestion] = useState("");
  const [task, setTask] = useState<"claim" | "topic" | "business">("topic");
  const [attachment, setAttachment] = useState("");
  const [filename, setFilename] = useState("");
  const [fileError, setFileError] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [focus, setFocus] = useState("");
  const [mode, setMode] = useState<"Balanced" | "Fast" | "Focused" | "Comparative">("Balanced");
  const [report, setReport] = useState<ResearchReport | null>(null);
  const [reportId, setReportId] = useState<string | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [used, setUsed] = useState(0);
  const [limit, setLimit] = useState(MONTHLY_REPORT_LIMIT);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (user) fetchUsage().then(u => { setUsed(u.used); setLimit(u.limit); }).catch(() => {}); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = Math.max(0, limit - used);
  async function readFile(file: File) {
    setFileError("");
    if (!/\.(txt|md|csv|docx|pdf)$/i.test(file.name) || file.size > 5 * 1024 * 1024) { setFileError(tx("uploadError")); return; }
    try {
      const text = await extractFileText(file);
      if (!text.trim()) { setFileError("No readable text was found in this file. Scanned PDFs are not supported — paste the text instead."); return; }
      setAttachment(text.slice(0, 12000)); setFilename(file.name);
    } catch { setFileError("This file couldn't be read. Try another file or paste the text."); }
  }
  async function submit() {
    if (busy || authLoading || (user && left === 0)) return;
    if (question.trim().length < 10) { setError(tx("tooShort")); return; }
    setBusy(true); setError(""); setReport(null);
    try {
      const payload = { task, question, attachment, language: languages.find(l => l.code === lang)?.name ?? "English", mode, company, website, industry, competitors, focus };
      const result = user ? await generate({ data: payload }) : await generateGuest({ data: payload });
      if ("limitReached" in result) { setError(result.message ?? ""); if (!user) setGuestDone(true); return; }
      setReport(result.report); setReportId("id" in result ? String(result.id) : undefined); if (user) setUsed(used + 1); else setGuestDone(true);
      setTimeout(() => document.getElementById("report-output")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) { setError(e instanceof Error ? e.message : tx("errorTitle")); }
    finally { setBusy(false); }
  }
  return <div>
    <div className="grid gap-9 lg:grid-cols-[1fr_300px]">
      <div>
        <h2 className="font-display text-2xl font-bold">{tx("formTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{tx("formBody")}</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-semibold">Task type<select value={task} onChange={e => setTask(e.target.value as typeof task)} className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 font-normal"><option value="claim">Check a claim</option><option value="topic">Research a topic</option><option value="business">Analyze a business</option></select></label>
          <label className="text-sm font-semibold">Report language<select value={lang} onChange={e => onLang(e.target.value as Lang)} className="mt-2 h-11 w-full rounded-md border border-input bg-card px-3 font-normal">{languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select></label>
        </div>
        <label htmlFor="research-question" className="mt-5 block text-sm font-semibold">{tx("promptLabel")}</label>
        <Textarea id="research-question" dir={isRtlLang(lang) ? "rtl" : "ltr"} maxLength={4000} value={question} onChange={e => setQuestion(e.target.value)} placeholder={tx("promptPlaceholder")} className="mt-2 min-h-40 border-input bg-card p-4 text-base" />
        <div className="mt-3"><VoiceButton lang={lang} onText={t => setQuestion(q => (q ? q.trimEnd() + " " : "") + t)} /></div>
        <div className="mt-3 flex flex-wrap gap-2">{(["ex1", "ex2", "ex3"] as const).map(key => <Button key={key} size="sm" variant="outline" className="h-auto max-w-full whitespace-normal text-left" onClick={() => setQuestion(tx(key))}>{tx(key)}</Button>)}</div>
        <div className="mt-7 border-y border-border py-5"><input ref={inputRef} type="file" accept=".txt,.md,.csv,.docx,.pdf" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) void readFile(f); e.target.value = ""; }} />
          <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void readFile(f); }} className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => inputRef.current?.click()}><Upload />{tx("upload")}</Button><span className="text-xs text-muted-foreground">{tx("uploadHint")}</span>
          </div>{filename && <p className="mt-3 flex items-center gap-2 text-sm"><FileText className="size-4" />{filename}<Button aria-label={tx("removeFile")} variant="ghost" size="icon" onClick={() => { setFilename(""); setAttachment(""); }}><X /></Button></p>}{fileError && <p role="alert" className="mt-2 text-sm text-destructive">{fileError}</p>}
        </div>
        <details className="group border-b border-border py-5"><summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">{task === "business" ? "Business details" : tx("advanced")} <span className="font-normal text-muted-foreground">(optional)</span><ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{([["company", company, setCompany], ["website", website, setWebsite], ["industry", industry, setIndustry], ["competitors", competitors, setCompetitors]] as const).map(([key, value, setter]) => <label key={key} className="text-sm font-medium">{tx(key)}<Input value={value} maxLength={200} onChange={e => setter(e.target.value)} className="mt-2 bg-card" /></label>)}<label className="text-sm font-medium sm:col-span-2">{tx("focus")}<Textarea id="focus-data" dir={isRtlLang(lang) ? "rtl" : "ltr"} value={focus} maxLength={500} onChange={e => setFocus(e.target.value)} className="mt-2 min-h-20 bg-card" /><span className="mt-2 block"><VoiceButton lang={lang} onText={t => setFocus(f => (f ? f.trimEnd() + " " : "") + t)} /></span></label><label className="text-sm font-medium">{tx("mode")}<select value={mode} onChange={e => setMode(e.target.value as typeof mode)} className="mt-2 h-9 w-full rounded-md border border-input bg-card px-3">{(["Balanced", "Fast", "Focused", "Comparative"] as const).map((m) => <option key={m} value={m}>{tx(({ Balanced: "modeBalanced", Fast: "modeQuick", Focused: "modeDeep", Comparative: "modeComparative" } as const)[m])}</option>)}</select></label></div>
        </details>
        {!authLoading && !user && guestDone ? <div className="mt-6 flex flex-wrap items-center gap-4 border border-border bg-secondary p-5"><p className="text-sm">You've used your free report. Sign in with Google or email for 3 reports a month, saved to your library.</p><Button asChild><Link to="/auth">Sign in to continue</Link></Button></div>
         : <div className="mt-6 flex flex-wrap items-center gap-4"><Button size="lg" className="h-12 px-7" onClick={submit} disabled={busy || (!!user && left === 0) || authLoading}>{busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{busy ? "Searching the web and writing (1–2 minutes)…" : tx("generate")}</Button><span className="text-sm text-muted-foreground">{user ? `${left} of ${limit} reports left this month` : <>1 free report without an account · <Link to="/auth" className="text-brand underline">Sign in</Link> for 3 a month</>}</span></div>}
        {user && left === 0 && <p role="status" className="mt-4 text-sm text-muted-foreground">{tx("limit")}</p>}
        {error && <div role="alert" className="mt-5 flex flex-wrap items-center gap-3 text-sm text-destructive">{error}{!/used your/.test(error) && <Button variant="outline" size="sm" disabled={busy} onClick={submit}>{tx("retry")}</Button>}</div>}
        <GenerationProgress active={busy} />
        <p className="mt-5 text-xs leading-5 text-muted-foreground">Verfi AI searches the live web and sends your question, attached text and the found excerpts to AI engines to write the report. Signed-in reports are saved privately to your account. Do not include confidential information.</p>
        <p role="note" className="mt-3 border-l-2 border-warning bg-warning-soft p-3 text-xs font-medium leading-5">Verfi AI provides verification support, not definitive truth judgments. Model consensus is not proof. Review sources before relying on a result.</p>
      </div>
      <aside className="border-t border-border pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><p className="text-xs font-bold uppercase text-brand">{tx("previewLabel")}</p><h3 className="mt-4 font-display text-xl font-bold">{tx("sampleTitle")}</h3><p className="mt-3 text-sm text-muted-foreground">{tx("sampleBadge")}</p><div className="mt-6 space-y-4 border-l-2 border-border pl-4 text-sm"><p className="font-semibold">{tx("sampleTopic")}</p><p className="text-muted-foreground">{tx("sampleSummary")}</p><p className="text-muted-foreground">{tx("sampleFinding")}</p></div><Link to="/sample-report" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">{tx("heroSecondary")} <ArrowRight className="size-4" /></Link></aside>
    </div>
     {report && <div className="mt-16 border-t border-border pt-12 print:mt-0 print:border-0"><ReportView report={report} reportId={reportId} /><p className="mt-8 text-sm print:hidden">{user ? <Link to="/reports" className="font-semibold text-brand hover:underline">Saved to My reports →</Link> : <>This report isn't saved. Download it now, or <Link to="/auth" className="font-semibold text-brand hover:underline">sign in</Link> to keep future reports.</>}</p></div>}
  </div>;
}

function Home() {
  const { lang: urlLang } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [lang, setLang] = useState<Lang>(urlLang ?? "en");
  const [tab, setTab] = useState<"report" | "fact" | "citation">("report");
  const [menuOpen, setMenuOpen] = useState(false);
  const tx = (key: TextKey) => siteText(lang, key);
  useEffect(() => { if (!urlLang) { try { const stored = localStorage.getItem(STORE_LANG); if (isLang(stored) && stored !== "en") changeLang(stored); } catch { /* optional */ } } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (urlLang) setLang(urlLang); }, [urlLang]);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = RTL.includes(lang) ? "rtl" : "ltr"; }, [lang]);
  function changeLang(l: Lang) { setLang(l); try { localStorage.setItem(STORE_LANG, l); } catch { /* optional */ } navigate({ search: l === "en" ? {} : { lang: l }, replace: true, resetScroll: false }); }
  function selectTab(next: "report" | "fact" | "citation") { setTab(next); setMenuOpen(false); document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" }); }
  return <div className="min-h-screen bg-background text-foreground">
    <PaymentTestModeBanner />
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5"><Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><FileCheck2 className="size-5" /></span>Verfi <span className="text-brand">AI</span></Link><nav className="hidden items-center gap-6 text-sm font-medium lg:flex"><div className="group relative"><Button variant="ghost" className="gap-1">Research tools <ChevronDown /></Button><div className="invisible absolute left-0 top-full z-40 min-w-52 border border-border bg-card p-2 opacity-0 shadow-lg group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"><Button variant="ghost" className="w-full justify-start" onClick={() => selectTab("report")}>{"Professional report"}</Button><Button variant="ghost" className="w-full justify-start" onClick={() => selectTab("fact")}>Fact-checker</Button><Button variant="ghost" className="w-full justify-start" onClick={() => selectTab("citation")}>Citation checker</Button></div></div><Link to="/how-it-works" className="hover:text-brand">{tx("navHow")}</Link><a href="#use-cases" className="hover:text-brand">Use cases</a><a href="#pricing" className="hover:text-brand">{tx("navPricing")}</a><Link to="/methodology" className="hover:text-brand">Methodology</Link><a href="#faq" className="hover:text-brand">{tx("navFaq")}</a><LanguagePicker lang={lang} onChange={changeLang} /><AccountLink /><Button size="sm" onClick={() => selectTab("fact")}>Check text free</Button></nav><div className="flex items-center gap-3 lg:hidden"><LanguagePicker lang={lang} onChange={changeLang} /><AccountLink /><Button size="icon" variant="ghost" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button></div></div>{menuOpen && <nav className="flex flex-col gap-1 border-t border-border bg-background px-5 py-3 text-sm lg:hidden"><Button variant="ghost" className="justify-start" onClick={() => selectTab("report")}>{"Professional report"}</Button><Button variant="ghost" className="justify-start" onClick={() => selectTab("fact")}>Fact-checker</Button><Button variant="ghost" className="justify-start" onClick={() => selectTab("citation")}>Citation checker</Button><Link to="/how-it-works" className="px-4 py-2">{tx("navHow")}</Link><a href="#use-cases" className="px-4 py-2" onClick={() => setMenuOpen(false)}>Use cases</a><a href="#pricing" className="px-4 py-2" onClick={() => setMenuOpen(false)}>{tx("navPricing")}</a><Link to="/methodology" className="px-4 py-2">Methodology</Link><a href="#faq" className="px-4 py-2" onClick={() => setMenuOpen(false)}>{tx("navFaq")}</a></nav>}</header>
    <main><section className="border-b border-border bg-secondary/50"><div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-14 md:pb-20 md:pt-20 lg:grid-cols-[1.2fr_1fr]"><div><p className="text-xs font-bold uppercase text-brand">{tx("tagline")}</p><h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{tx("heroTitle")}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{tx("heroBody")}</p><div className="mt-8 flex flex-wrap gap-3"><Button size="lg" className="h-12" onClick={() => selectTab("fact")}>{tx("heroPrimary")} <ArrowRight /></Button><SampleReportDialog label={tx("heroSecondary")} /></div><HeroBadges /><p className="mt-5 max-w-xl text-xs text-muted-foreground">Verfi AI provides verification support, not definitive truth judgments. Review sources before relying on a result.</p>{!hasSiteTranslation(lang) && <p className="mt-3 text-sm text-brand">{tx("fallback")}</p>}</div><HeroMockup /></div></section>
      <WorkspaceCards onSelect={selectTab} />
      <ProductDemo onTry={() => selectTab("fact")} />
      <section id="studio" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-brand">Verfi AI / Workspace</p><h2 className="mt-2 font-display text-3xl font-bold">Research workspace</h2></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4" /> AI output is not independent verification</div></div><div role="tablist" aria-label="Research tools" className="mt-9 flex max-w-full overflow-x-auto border-b border-border"><Button role="tab" aria-selected={tab === "report"} variant="ghost" onClick={() => setTab("report")} className={`h-12 shrink-0 rounded-none border-b-2 px-4 ${tab === "report" ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}><BookOpen />{"Professional report"}</Button><Button role="tab" aria-selected={tab === "fact"} variant="ghost" onClick={() => setTab("fact")} className={`h-12 shrink-0 rounded-none border-b-2 px-4 ${tab === "fact" ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}><Search />Fact-checker</Button><Button role="tab" aria-selected={tab === "citation"} variant="ghost" onClick={() => setTab("citation")} className={`h-12 shrink-0 rounded-none border-b-2 px-4 ${tab === "citation" ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}><Search />Citation checker</Button></div><div role="tabpanel" className="pt-10">{tab === "report" ? <ReportForm lang={lang} onLang={changeLang} /> : tab === "fact" ? <FactChecker lang={lang} /> : <Checker />}</div></section>
      <HowItWorksSection /><UseCases /><TrustSection /><PricingSection onStart={() => selectTab("report")} /><FaqSection /><FinalCta onStart={() => selectTab("fact")} /></main>
    <SiteFooter />
  </div>;
}
