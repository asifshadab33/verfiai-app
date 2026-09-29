import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BookOpen, Check, ChevronDown, Clipboard, Download, FileCheck2, FileText, Globe2, LoaderCircle, Menu, Printer, Search, ShieldCheck, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checker } from "@/components/verifai/Checker";
import { QuickSearch } from "@/components/verifai/QuickSearch";
import { generateReport, type ResearchReport } from "@/lib/report.functions";
import { isLang, languages, type Lang } from "@/lib/translations";
import { hasSiteTranslation, siteText } from "@/lib/site-i18n";

const SITE = "https://verfiai.app";
const STORE_LANG = "verifai-lang";
const REPORT_USAGE = "verifai-report-usage";
const month = () => new Date().toISOString().slice(0, 7);
function usedReports() { try { const v = JSON.parse(localStorage.getItem(REPORT_USAGE) || "null"); return v?.period === month() ? Number(v.used) || 0 : 0; } catch { return 0; } }
function saveReports(used: number) { try { localStorage.setItem(REPORT_USAGE, JSON.stringify({ period: month(), used })); } catch { /* optional */ } }
const RTL: Lang[] = ["ar", "ur", "fa"];

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { lang?: Lang } => isLang(s["lang"]) ? { lang: s["lang"] } : {},
  loaderDeps: ({ search }) => ({ lang: search.lang ?? "en" }),
  loader: ({ deps }) => ({ lang: deps.lang as Lang }),
  head: ({ loaderData }) => {
    const lang = loaderData?.lang ?? "en";
    const title = `${siteText(lang, "heroTitle")} | VerifAI`;
    const description = siteText(lang, "seoDescription");
    const url = lang === "en" ? `${SITE}/` : `${SITE}/?lang=${lang}`;
    return { meta: [
      { title }, { name: "description", content: description },
      { property: "og:title", content: title }, { property: "og:description", content: description },
      { property: "og:type", content: "website" }, { property: "og:url", content: url },
      { property: "og:locale", content: lang }, { name: "twitter:card", content: "summary_large_image" },
    ], links: [{ rel: "canonical", href: url }] };
  },
  component: Home,
});

type TextKey = Parameters<typeof siteText>[1];
function LanguagePicker({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return <label className="flex items-center gap-1.5 text-sm text-muted-foreground"><Globe2 className="size-4" /><span className="sr-only">Language</span><select aria-label="Language" value={lang} onChange={e => onChange(e.target.value as Lang)} className="max-w-32 bg-transparent font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">{languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select></label>;
}

function ReportForm({ lang }: { lang: Lang }) {
  const tx = (key: TextKey) => siteText(lang, key);
  const generate = useServerFn(generateReport);
  const [question, setQuestion] = useState("");
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
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [used, setUsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setUsed(usedReports()), []);
  const left = Math.max(0, 3 - used);
  const reportText = report ? `${report.title}\n\n${tx("execSummary")}\n${report.summary}\n\n${tx("keyFindings")}\n${report.findings.map(f => `- [${f.status}] ${f.title}: ${f.detail}`).join("\n")}\n\n${tx("sources")}\n${report.sources.map(s => `${s.title} — ${s.publisher}, ${s.date}\n${s.url}`).join("\n")}\n\nConflicting evidence\n${report.conflictingEvidence}\n\n${tx("methodology")}\n${report.methodology}\n\n${tx("limitations")}\n${report.limitations}\n\n${tx("conclusion")}\n${report.conclusion}\n\nAI-generated. Sources were not checked against the live web.` : "";
  async function readFile(file: File) {
    setFileError("");
    if (!/\.(txt|md)$/i.test(file.name) || file.size > 200 * 1024) { setFileError(tx("uploadError")); return; }
    try { const text = await file.text(); setAttachment(text.slice(0, 12000)); setFilename(file.name); }
    catch { setFileError(tx("uploadError")); }
  }
  async function submit() {
    if (busy || left === 0) return;
    if (question.trim().length < 10) { setError(tx("tooShort")); return; }
    setBusy(true); setError(""); setReport(null);
    try {
      const result = await generate({ data: { question, attachment, language: languages.find(l => l.code === lang)?.name ?? "English", mode, company, website, industry, competitors, focus } });
      setReport(result); setUsed(used + 1); saveReports(used + 1);
      setTimeout(() => document.getElementById("report-output")?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) { setError(e instanceof Error ? e.message : tx("errorTitle")); }
    finally { setBusy(false); }
  }
  async function copy() { try { await navigator.clipboard.writeText(reportText); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { setError("Could not copy. Please select the text manually."); } }
  function download() { const blob = new Blob([reportText], { type: "text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "verifai-report.md"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  return <div>
    <div className="grid gap-9 lg:grid-cols-[1fr_300px]">
      <div>
        <h2 className="font-display text-2xl font-bold">{tx("formTitle")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{tx("formBody")}</p>
        <label htmlFor="research-question" className="mt-7 block text-sm font-semibold">{tx("promptLabel")}</label>
        <Textarea id="research-question" maxLength={4000} value={question} onChange={e => setQuestion(e.target.value)} placeholder={tx("promptPlaceholder")} className="mt-2 min-h-40 border-input bg-card p-4 text-base" />
        <div className="mt-3 flex flex-wrap gap-2">{(["ex1", "ex2", "ex3"] as const).map(key => <Button key={key} size="sm" variant="outline" className="h-auto max-w-full whitespace-normal text-left" onClick={() => setQuestion(tx(key))}>{tx(key)}</Button>)}</div>
        <div className="mt-7 border-y border-border py-5"><input ref={inputRef} type="file" accept=".txt,.md" className="sr-only" onChange={e => { const f = e.target.files?.[0]; if (f) void readFile(f); e.target.value = ""; }} />
          <div onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) void readFile(f); }} className="flex flex-wrap items-center gap-3">
            <Button variant="outline" onClick={() => inputRef.current?.click()}><Upload />{tx("upload")}</Button><span className="text-xs text-muted-foreground">{tx("uploadHint")}</span>
          </div>{filename && <p className="mt-3 flex items-center gap-2 text-sm"><FileText className="size-4" />{filename}<Button aria-label={tx("removeFile")} variant="ghost" size="icon" onClick={() => { setFilename(""); setAttachment(""); }}><X /></Button></p>}{fileError && <p role="alert" className="mt-2 text-sm text-destructive">{fileError}</p>}
        </div>
        <details className="group border-b border-border py-5"><summary className="flex cursor-pointer list-none items-center gap-2 font-semibold">{tx("advanced")}<ChevronDown className="size-4 transition-transform group-open:rotate-180" /></summary>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">{([["company", company, setCompany], ["website", website, setWebsite], ["industry", industry, setIndustry], ["competitors", competitors, setCompetitors], ["focus", focus, setFocus]] as const).map(([key, value, setter]) => <label key={key} className="text-sm font-medium">{tx(key)}<Input value={value} maxLength={key === "focus" ? 500 : 200} onChange={e => setter(e.target.value)} className="mt-2 bg-card" /></label>)}<label className="text-sm font-medium">{tx("mode")}<select value={mode} onChange={e => setMode(e.target.value as typeof mode)} className="mt-2 h-9 w-full rounded-md border border-input bg-card px-3">{(["Balanced", "Fast", "Focused", "Comparative"] as const).map((m) => <option key={m} value={m}>{tx(({ Balanced: "modeBalanced", Fast: "modeQuick", Focused: "modeDeep", Comparative: "modeComparative" } as const)[m])}</option>)}</select></label></div>
        </details>
        <div className="mt-6 flex flex-wrap items-center gap-4"><Button size="lg" className="h-12 px-7" onClick={submit} disabled={busy || left === 0}>{busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{busy ? tx("generating") : tx("generate")}</Button><span className="text-sm text-muted-foreground">{left} {tx("left")}</span></div>
        {left === 0 && <p role="status" className="mt-4 text-sm text-muted-foreground">{tx("limit")} Browser-based demo allowance; not a secure account limit.</p>}
        {error && <div role="alert" className="mt-5 flex items-center gap-3 text-sm text-destructive">{error}<Button variant="outline" size="sm" disabled={busy} onClick={submit}>{tx("retry")}</Button></div>}
        <p className="mt-5 text-xs leading-5 text-muted-foreground">Your question and attached text are sent to an AI provider. Do not include confidential information. Reports are not saved to an account. This tool does not browse the live web.</p>
      </div>
      <aside className="border-t border-border pt-7 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"><p className="text-xs font-bold uppercase text-brand">{tx("previewLabel")}</p><h3 className="mt-4 font-display text-xl font-bold">{tx("sampleTitle")}</h3><p className="mt-3 text-sm text-muted-foreground">{tx("sampleBadge")}</p><div className="mt-6 space-y-4 border-l-2 border-border pl-4 text-sm"><p className="font-semibold">{tx("sampleTopic")}</p><p className="text-muted-foreground">{tx("sampleSummary")}</p><p className="text-muted-foreground">{tx("sampleFinding")}</p></div><Link to="/sample-report" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline">{tx("heroSecondary")} <ArrowRight className="size-4" /></Link></aside>
    </div>
    {report && <article id="report-output" className="mt-16 scroll-mt-28 border-t border-border pt-12 print:mt-0 print:border-0"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-brand">VerifAI · {new Date().toLocaleDateString()}</p><h2 className="mt-2 max-w-3xl font-display text-3xl font-bold">{report.title}</h2></div><div className="flex gap-1 print:hidden"><Button size="icon" variant="outline" aria-label={tx("copy")} title={tx("copy")} onClick={copy}>{copied ? <Check /> : <Clipboard />}</Button><Button size="icon" variant="outline" aria-label={tx("download")} title="Download Markdown" onClick={download}><Download /></Button><Button size="icon" variant="outline" aria-label={tx("print")} title={tx("print")} onClick={() => window.print()}><Printer /></Button></div></div>
      <p className="mt-5 border-l-2 border-primary bg-secondary p-4 text-sm">{tx("aiLabel")} {tx("noWeb")}</p>
      <div className="mt-9 grid gap-8 lg:grid-cols-[190px_1fr]"><nav aria-label={tx("toc")} className="flex flex-col gap-3 text-sm text-muted-foreground print:hidden">{[["summary", tx("execSummary")], ["findings", tx("keyFindings")], ["sources", tx("sources")], ["method", tx("methodology")]].map(([id, label]) => <a key={id} href={`#${id}`} className="hover:text-brand">{label}</a>)}</nav><div className="space-y-9 text-sm leading-7"><section id="summary"><h3 className="font-display text-xl font-bold">{tx("execSummary")}</h3><p className="mt-3 whitespace-pre-wrap">{report.summary}</p></section><section id="findings"><h3 className="font-display text-xl font-bold">{tx("keyFindings")}</h3><div className="mt-4 space-y-5">{report.findings.map((f, i) => <div key={i} className="border-l-2 border-border pl-4"><span className="text-xs font-bold uppercase text-brand">{f.status}</span><h4 className="font-semibold">{f.title}</h4><p className="mt-1 text-muted-foreground">{f.detail}</p></div>)}</div></section><section id="sources"><h3 className="font-display text-xl font-bold">{tx("sources")}</h3>{report.sources.length ? <ul className="mt-3 list-inside list-disc space-y-2">{report.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">{s.title}</a> <span className="text-muted-foreground">— {s.publisher}, {s.date}</span></li>)}</ul> : <p className="mt-2 text-muted-foreground">No source links were confidently identified. Do not treat uncited claims as verified.</p>}</section><section><h3 className="font-display text-xl font-bold">Conflicting evidence</h3><p className="mt-2">{report.conflictingEvidence}</p></section><section id="method"><h3 className="font-display text-xl font-bold">{tx("methodology")}</h3><p className="mt-2">{report.methodology}</p><h3 className="mt-7 font-display text-xl font-bold">{tx("limitations")}</h3><p className="mt-2">{report.limitations}</p><h3 className="mt-7 font-display text-xl font-bold">{tx("conclusion")}</h3><p className="mt-2">{report.conclusion}</p></section></div></div>
    </article>}
  </div>;
}

function Home() {
  const { lang: urlLang } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [lang, setLang] = useState<Lang>(urlLang ?? "en");
  const [tab, setTab] = useState<"report" | "quick" | "citation">("report");
  const [menuOpen, setMenuOpen] = useState(false);
  const tx = (key: TextKey) => siteText(lang, key);
  useEffect(() => { if (!urlLang) { try { const stored = localStorage.getItem(STORE_LANG); if (isLang(stored) && stored !== "en") changeLang(stored); } catch { /* optional */ } } }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (urlLang) setLang(urlLang); }, [urlLang]);
  useEffect(() => { document.documentElement.lang = lang; document.documentElement.dir = RTL.includes(lang) ? "rtl" : "ltr"; }, [lang]);
  function changeLang(l: Lang) { setLang(l); try { localStorage.setItem(STORE_LANG, l); } catch { /* optional */ } navigate({ search: l === "en" ? {} : { lang: l }, replace: true, resetScroll: false }); }
  function selectTab(next: "report" | "quick" | "citation") { setTab(next); setMenuOpen(false); document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" }); }
  return <div className="min-h-screen bg-background text-foreground">
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5"><Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold"><span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><FileCheck2 className="size-5" /></span>Verif<span className="text-brand">AI</span></Link><nav className="hidden items-center gap-6 text-sm font-medium lg:flex"><div className="group relative"><Button variant="ghost" className="gap-1">Research tools <ChevronDown /></Button><div className="invisible absolute left-0 top-full z-40 min-w-52 border border-border bg-card p-2 opacity-0 shadow-lg group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"><Button variant="ghost" className="w-full justify-start" onClick={() => selectTab("report")}>{"Professional report"}</Button><Button variant="ghost" className="w-full justify-start" onClick={() => selectTab("quick")}>Quick AI search · demo</Button><Button variant="ghost" className="w-full justify-start" onClick={() => selectTab("citation")}>Citation checker</Button></div></div><Link to="/features" className="hover:text-brand">{tx("navFeatures")}</Link><Link to="/how-it-works" className="hover:text-brand">{tx("navHow")}</Link><Link to="/sample-report" className="hover:text-brand">{tx("navSample")}</Link><Link to="/pricing" className="hover:text-brand">{tx("navPricing")}</Link><Link to="/faq" className="hover:text-brand">{tx("navFaq")}</Link><LanguagePicker lang={lang} onChange={changeLang} /><Button asChild size="sm"><a href="#studio">{tx("navCta")}</a></Button></nav><div className="flex items-center gap-3 lg:hidden"><LanguagePicker lang={lang} onChange={changeLang} /><Button size="icon" variant="ghost" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button></div></div>{menuOpen && <nav className="flex flex-col gap-1 border-t border-border bg-background px-5 py-3 text-sm lg:hidden"><Button variant="ghost" className="justify-start" onClick={() => selectTab("report")}>{"Professional report"}</Button><Button variant="ghost" className="justify-start" onClick={() => selectTab("citation")}>Citation checker</Button>{([["/features", "navFeatures"], ["/how-it-works", "navHow"], ["/sample-report", "navSample"], ["/pricing", "navPricing"], ["/faq", "navFaq"]] as const).map(([to, label]) => <Link key={to} to={to} className="px-4 py-2" onClick={() => setMenuOpen(false)}>{tx(label)}</Link>)}</nav>}</header>
    <main><section className="border-b border-border bg-secondary/50"><div className="mx-auto max-w-7xl px-5 pb-14 pt-14 md:pb-20 md:pt-20"><div className="max-w-4xl"><p className="text-xs font-bold uppercase text-brand">{tx("tagline")}</p><h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">{tx("heroTitle")}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">{tx("heroBody")}</p><div className="mt-8 flex flex-wrap gap-3"><Button size="lg" asChild className="h-12"><a href="#studio">{tx("heroPrimary")} <ArrowRight /></a></Button><Button size="lg" asChild variant="outline" className="h-12"><Link to="/sample-report">{tx("heroSecondary")}</Link></Button></div><p className="mt-5 text-xs text-muted-foreground">AI-generated reports · Sources require independent review · No account needed for this preview</p>{!hasSiteTranslation(lang) && <p className="mt-3 text-sm text-brand">{tx("fallback")}</p>}</div></div></section>
      <section id="studio" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-brand">VerifAI / Workspace</p><h2 className="mt-2 font-display text-3xl font-bold">Research workspace</h2></div><div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4" /> AI output is not independent verification</div></div><div role="tablist" aria-label="Research tools" className="mt-9 flex border-b border-border"><Button role="tab" aria-selected={tab === "report"} variant="ghost" onClick={() => setTab("report")} className={`h-12 rounded-none border-b-2 px-5 ${tab === "report" ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}><BookOpen />{"Professional report"}</Button><Button role="tab" aria-selected={tab === "quick"} variant="ghost" onClick={() => setTab("quick")} className={`h-12 rounded-none border-b-2 px-5 ${tab === "quick" ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}><Search />Quick search · demo</Button><Button role="tab" aria-selected={tab === "citation"} variant="ghost" onClick={() => setTab("citation")} className={`h-12 rounded-none border-b-2 px-5 ${tab === "citation" ? "border-primary text-brand" : "border-transparent text-muted-foreground"}`}><Search />Citation checker</Button></div><div role="tabpanel" className="pt-10">{tab === "report" ? <ReportForm lang={lang} /> : tab === "quick" ? <QuickSearch /> : <Checker />}</div></section>
      <section className="border-t border-border bg-secondary/40"><div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 md:grid-cols-3">{[["01", tx("how1"), tx("how1Body")], ["02", tx("how2"), tx("how2Body")], ["03", tx("how4"), tx("how4Body")]].map(([num, title, body]) => <div key={num}><p className="text-sm font-bold text-brand">{num}</p><h3 className="mt-3 font-display text-xl font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p></div>)}</div></section>
      <section className="mx-auto max-w-7xl px-5 py-16"><h2 className="font-display text-3xl font-bold">{tx("evTitle")}</h2><p className="mt-3 max-w-2xl text-muted-foreground">{tx("evBody")}</p><p className="mt-4 max-w-2xl text-sm text-muted-foreground">{tx("evNote")}</p><div className="mt-8 flex flex-wrap gap-4"><Link to="/features" className="inline-flex items-center gap-2 font-semibold text-brand">{tx("navFeatures")} <ArrowRight className="size-4" /></Link><Link to="/pricing" className="inline-flex items-center gap-2 font-semibold text-brand">{tx("navPricing")} <ArrowRight className="size-4" /></Link></div></section></main>
    <footer className="border-t border-border px-5 py-9"><div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 text-sm text-muted-foreground"><span className="font-semibold text-foreground">VerifAI <span className="font-normal text-muted-foreground">— {tx("footerTag")}</span></span><div className="flex flex-wrap gap-5"><Link to="/features">{tx("navFeatures")}</Link><Link to="/pricing">{tx("navPricing")}</Link><Link to="/faq">{tx("navFaq")}</Link></div></div></footer>
  </div>;
}
