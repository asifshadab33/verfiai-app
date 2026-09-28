import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Check, FileText, Globe2, LoaderCircle, Menu, Search, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { hasTranslation, isLang, languages, t, type Key, type Lang } from "@/lib/translations";
import hero from "@/assets/verifai-hero.jpg";

const SITE = "https://sweet-site-sprucer.lovable.app";
const RTL: Lang[] = ["ar", "ur", "fa"];
const QUICK_LIMIT = 3;
const REPORT_LIMIT = 25;
const STORE_LANG = "verifai-lang";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { lang?: Lang } => (isLang(s.lang) ? { lang: s.lang } : {}),
  loaderDeps: ({ search }) => ({ lang: search.lang ?? "en" }),
  loader: ({ deps }) => ({ lang: deps.lang as Lang }),
  head: ({ loaderData }) => {
    const lang = loaderData?.lang ?? "en";
    const title = `Verifai — ${t(lang, "heroTitle")}`;
    const desc = t(lang, "seoDescription");
    const url = lang === "en" ? `${SITE}/` : `${SITE}/?lang=${lang}`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:locale", content: lang },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: desc },
      ],
      links: [
        { rel: "canonical", href: url },
        ...languages.filter((l) => hasTranslation(l.code)).map((l) => ({ rel: "alternate", hrefLang: l.code, href: l.code === "en" ? `${SITE}/` : `${SITE}/?lang=${l.code}` })),
      ],
    };
  },
  component: VerifaiPage,
});

function today() { return new Date().toISOString().slice(0, 10); }
function readCount(key: string, period: string) {
  try { const v = JSON.parse(localStorage.getItem(key) || "null"); return v?.period === period ? Number(v.used) || 0 : 0; } catch { return 0; }
}
function writeCount(key: string, period: string, used: number) {
  try { localStorage.setItem(key, JSON.stringify({ period, used })); } catch { /* optional */ }
}

function LanguageMenu({ lang, onChange, compact }: { lang: Lang; onChange: (l: Lang) => void; compact?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button type="button" aria-label="Language" aria-expanded={open} onClick={() => setOpen((o) => !o)}
        className={compact
          ? "flex size-14 items-center justify-center gap-1 rounded-full bg-primary text-primary-foreground shadow-lg"
          : "flex h-10 items-center gap-2 rounded-full border border-border px-3 text-sm font-semibold hover:bg-accent"}>
        <Globe2 className="size-4" /> <span className="uppercase">{lang}</span>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <ul role="listbox" className={`absolute z-50 max-h-80 w-56 overflow-auto rounded-xl border border-border bg-popover p-1 shadow-xl ${compact ? "bottom-16 right-0" : "right-0 top-12"}`}>
            {languages.map((l) => (
              <li key={l.code}>
                <button type="button" role="option" aria-selected={l.code === lang} onClick={() => { onChange(l.code); setOpen(false); }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm hover:bg-accent">
                  <span>{l.name}</span>{l.code === lang ? <Check className="size-4 text-brand" /> : <span className="text-xs uppercase text-muted-foreground">{l.code}</span>}
                </button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function AdBox({ lang }: { lang: Lang }) {
  return (
    <div className="mt-8 flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-secondary/60 p-6 text-center">
      <span className="text-xs font-semibold uppercase text-muted-foreground">{t(lang, "ad")}</span>
      <span className="text-sm text-muted-foreground">{t(lang, "sponsored")}</span>
    </div>
  );
}

function mockResult(lang: Lang, topic: string, engines: string[]) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-xl font-bold">{topic}</h3>
      <p className="text-xs font-bold uppercase text-brand">{t(lang, "summary")}</p>
      <ol className="space-y-3">
        {engines.map((e, i) => (
          <li key={e} className="rounded-lg border border-border bg-secondary/50 p-4 text-sm">
            <span className="font-semibold text-brand">{t(lang, "engineFinding")} {i + 1} · {e}</span>
            <p className="mt-1 text-muted-foreground">{t(lang, [ "step1Body", "step2Body", "step3Body", "heroBody", "studioBody"][i] as Key)}</p>
          </li>
        ))}
      </ol>
      <p className="text-sm"><strong>{t(lang, "nextStep")}:</strong> {t(lang, "step3Body")}</p>
      <p className="text-xs italic text-muted-foreground">{t(lang, "disclaimer")}</p>
    </div>
  );
}

function VerifaiPage() {
  const { lang: urlLang } = Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const [lang, setLangState] = useState<Lang>(urlLang ?? "en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [quickUsed, setQuickUsed] = useState(0);
  const [reportUsed, setReportUsed] = useState(0);
  const [question, setQuestion] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickAnswer, setQuickAnswer] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportTopic, setReportTopic] = useState<string | null>(null);
  const [mode, setMode] = useState("modeBalanced");
  const busy = useRef(false);

  useEffect(() => {
    if (!urlLang) {
      try { const saved = localStorage.getItem(STORE_LANG); if (isLang(saved) && saved !== "en") { setLang(saved); } } catch { /* optional */ }
    }
    setQuickUsed(readCount("verifai-quick", today()));
    setReportUsed(readCount("verifai-reports", today().slice(0, 7)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { if (urlLang && urlLang !== lang) setLangState(urlLang); }, [urlLang]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL.includes(lang) ? "rtl" : "ltr";
  }, [lang]);

  function setLang(l: Lang) {
    setLangState(l);
    try { localStorage.setItem(STORE_LANG, l); } catch { /* optional */ }
    navigate({ search: l === "en" ? {} : { lang: l }, replace: true, resetScroll: false });
  }

  const quickLeft = Math.max(0, QUICK_LIMIT - quickUsed);
  const reportsLeft = Math.max(0, REPORT_LIMIT - reportUsed);

  async function onQuick(e: FormEvent) {
    e.preventDefault();
    if (!question.trim() || quickLeft === 0 || busy.current) return;
    busy.current = true; setQuickLoading(true); setQuickAnswer(null);
    await new Promise((r) => setTimeout(r, 2000));
    setQuickAnswer(question.trim());
    const used = quickUsed + 1; setQuickUsed(used); writeCount("verifai-quick", today(), used);
    setQuickLoading(false); busy.current = false;
  }

  async function onReport(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (reportsLeft === 0 || busy.current) return;
    const company = String(new FormData(e.currentTarget).get("company") || "");
    busy.current = true; setReportLoading(true); setReportTopic(null);
    await new Promise((r) => setTimeout(r, 2500));
    setReportTopic(company);
    const used = reportUsed + 1; setReportUsed(used); writeCount("verifai-reports", today().slice(0, 7), used);
    setReportLoading(false); busy.current = false;
  }

  const langSelect = (
    <Select value={lang} onValueChange={(v) => setLang(v as Lang)}>
      <SelectTrigger className="mt-2 h-11"><SelectValue /></SelectTrigger>
      <SelectContent>{languages.map((l) => <SelectItem key={l.code} value={l.code}>{l.name}</SelectItem>)}</SelectContent>
    </Select>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a href="#top" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>
            <span>Veri<span className="text-brand">fai</span></span>
          </a>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <a href="#how" className="text-muted-foreground hover:text-foreground">{t(lang, "navHow")}</a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground">{t(lang, "navPricing")}</a>
            <LanguageMenu lang={lang} onChange={setLang} />
          </nav>
          <button type="button" className="md:hidden" aria-label="Menu" onClick={() => setMenuOpen((o) => !o)}>{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && (
          <div className="flex flex-col gap-4 border-t border-border px-5 py-4 md:hidden">
            <a href="#how" onClick={() => setMenuOpen(false)}>{t(lang, "navHow")}</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>{t(lang, "navPricing")}</a>
          </div>
        )}
      </header>

      <div className="fixed bottom-5 right-5 z-40 md:hidden"><LanguageMenu lang={lang} onChange={setLang} compact /></div>

      <main id="top">
        <section className="relative overflow-hidden" lang={lang} style={{ background: "var(--hero-gradient)" }}>
          <img src={hero} alt="" width={1600} height={900} className="absolute inset-0 size-full object-cover opacity-40" />
          <div className="relative mx-auto max-w-6xl px-5 py-20 md:py-32">
            <span className="inline-block rounded-full border border-brand/40 bg-brand-soft px-4 py-1.5 text-xs font-semibold text-brand">{t(lang, "heroBadge")}</span>
            <h1 className="mt-6 max-w-3xl font-display text-4xl font-extrabold leading-tight break-words hyphens-auto md:text-6xl">{t(lang, "heroTitle")}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">{t(lang, "heroBody")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6"><a href="#studio">{t(lang, "heroPrimary")}</a></Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6"><a href="#pricing">{t(lang, "heroSecondary")}</a></Button>
            </div>
            <p className="mt-8 text-sm text-muted-foreground">{t(lang, "trust")}</p>
            {!hasTranslation(lang) && <p className="mt-4 text-xs text-brand">{t(lang, "fallback")}</p>}
          </div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20">
          <h2 className="font-display text-3xl font-bold">{t(lang, "howTitle")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {(["step1", "step2", "step3"] as const).map((k, i) => (
              <div key={k} className="rounded-xl border border-border bg-card p-6">
                <span className="font-display text-2xl font-bold text-brand">0{i + 1}</span>
                <h3 className="mt-3 font-semibold">{t(lang, k)}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t(lang, `${k}Body` as Key)}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="studio" className="mx-auto max-w-4xl scroll-mt-20 px-5 py-16">
          <h2 className="font-display text-3xl font-bold">{t(lang, "studioTitle")}</h2>
          <p className="mt-2 text-muted-foreground">{t(lang, "studioBody")}</p>
          <Tabs defaultValue="quick" className="mt-8">
            <TabsList className="grid h-12 w-full max-w-md grid-cols-2 rounded-full p-1">
              <TabsTrigger value="quick" className="h-full gap-2 rounded-full text-xs sm:text-sm"><Search className="size-4" /> {t(lang, "tabQuick")}</TabsTrigger>
              <TabsTrigger value="report" className="h-full gap-2 rounded-full text-xs sm:text-sm"><FileText className="size-4" /> {t(lang, "tabReport")}</TabsTrigger>
            </TabsList>

            <TabsContent value="quick" className="mt-8 rounded-2xl border border-border bg-card p-5 md:p-8">
              <p className="text-xs font-bold uppercase text-brand">{t(lang, "quickBadge")}</p>
              <form onSubmit={onQuick} className="mt-5 space-y-5">
                <label className="block text-sm font-semibold">{t(lang, "question")}
                  <Textarea value={question} onChange={(e) => setQuestion(e.target.value)} required maxLength={800} placeholder={t(lang, "questionPlaceholder")} className="mt-2 min-h-32" />
                </label>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <label className="block w-52 text-sm font-semibold">{t(lang, "language")}{langSelect}</label>
                  <Button type="submit" size="lg" className="h-11" disabled={quickLoading || quickLeft === 0 || !question.trim()}><Search className="size-4" /> {t(lang, "search")}</Button>
                </div>
                <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-4 text-xs text-muted-foreground">
                  <span>{t(lang, "freeNote")}</span><span>{quickLeft} {t(lang, "remaining")}</span>
                </div>
              </form>
              {quickLoading && <p role="status" className="mt-6 flex items-center gap-3 text-sm"><LoaderCircle className="size-5 animate-spin text-brand" /> {t(lang, "loading")} (Gemini · Groq · Hugging Face)</p>}
              {quickAnswer && !quickLoading && <div className="mt-8 border-t border-border pt-6"><p className="mb-4 text-sm font-semibold text-brand">{t(lang, "ready")}</p>{mockResult(lang, quickAnswer, ["Gemini", "Groq", "Hugging Face"])}<AdBox lang={lang} /></div>}
              {quickLeft === 0 && !quickLoading && <p role="status" className="mt-6 rounded-lg bg-brand-soft p-4 text-sm">{t(lang, "limit")}</p>}
            </TabsContent>

            <TabsContent value="report" className="mt-8 rounded-2xl border border-border bg-card p-5 md:p-8">
              <p className="text-xs font-bold uppercase text-brand">{t(lang, "reportBadge")}</p>
              <form onSubmit={onReport} className="mt-5 grid gap-5 sm:grid-cols-2">
                <label className="text-sm font-semibold">{t(lang, "company")}<Input required name="company" className="mt-2 h-11" /></label>
                <label className="text-sm font-semibold">{t(lang, "website")}<Input name="website" type="url" className="mt-2 h-11" /></label>
                <label className="text-sm font-semibold">{t(lang, "industry")}<Input required name="industry" className="mt-2 h-11" /></label>
                <label className="text-sm font-semibold">{t(lang, "competitors")}<Input name="competitors" className="mt-2 h-11" /></label>
                <label className="text-sm font-semibold sm:col-span-2">{t(lang, "focus")}<Textarea name="focus" className="mt-2 min-h-24" /></label>
                <label className="text-sm font-semibold">{t(lang, "language")}{langSelect}</label>
                <label className="text-sm font-semibold">{t(lang, "mode")}
                  <Select value={mode} onValueChange={setMode}><SelectTrigger className="mt-2 h-11"><SelectValue /></SelectTrigger>
                    <SelectContent>{(["modeBalanced", "modeFast", "modeFocused", "modeComparative", "modeUltimate"] as const).map((m) => <SelectItem key={m} value={m}>{t(lang, m)}</SelectItem>)}</SelectContent>
                  </Select>
                </label>
                <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
                  <Button type="submit" size="lg" className="h-11" disabled={reportLoading || reportsLeft === 0}>{t(lang, "generate")}</Button>
                  <span className="text-xs text-muted-foreground">{t(lang, "reportLimit")}: {reportsLeft}</span>
                </div>
                <p className="text-xs text-muted-foreground sm:col-span-2">{t(lang, "reportNote")}</p>
              </form>
              {reportLoading && <p role="status" className="mt-6 flex items-center gap-3 text-sm"><LoaderCircle className="size-5 animate-spin text-brand" /> {t(lang, "reportLoading")}</p>}
              {reportTopic && !reportLoading && <div className="mt-8 border-t border-border pt-6"><p className="mb-4 text-sm font-semibold text-brand">{t(lang, "reportReady")}</p>{mockResult(lang, reportTopic, ["Gemini", "Groq", "Hugging Face", "OpenAI", "Claude"])}</div>}
            </TabsContent>
          </Tabs>
        </section>

        <section id="pricing" className="mx-auto max-w-5xl scroll-mt-20 px-5 py-20">
          <h2 className="text-center font-display text-3xl font-bold">{t(lang, "pricingTitle")}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {([["free", "$0", "freeDesc", "freeFeature", "freeCta", false], ["pro", "$5", "proDesc", "proFeature", "proCta", true]] as const).map(([name, price, desc, feat, cta, pop]) => (
              <div key={name} className={`relative rounded-2xl border bg-card p-7 ${pop ? "border-primary" : "border-border"}`}>
                {pop && <span className="absolute -top-3 right-6 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">{t(lang, "popular")}</span>}
                <h3 className="font-display text-xl font-bold">{t(lang, name)}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{t(lang, desc)}</p>
                <p className="mt-5 font-display text-4xl font-extrabold">{price}<span className="text-base font-medium text-muted-foreground"> {t(lang, "month")}</span></p>
                <ul className="mt-6 space-y-2 text-sm">{t(lang, feat).split(" · ").map((f) => <li key={f} className="flex gap-2"><Check className="size-4 shrink-0 text-brand" />{f}</li>)}</ul>
                <Button asChild className="mt-7 w-full" variant={pop ? "default" : "outline"}><a href="#studio">{t(lang, cta)}</a></Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-5 py-10 pb-24 md:pb-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground">
          <span><strong className="text-foreground">Verifai</strong> — {t(lang, "footerTag")}</span>
          <div className="flex gap-5"><a href="mailto:hello@verifai.example">{t(lang, "contact")}</a><span>{t(lang, "privacy")}</span><span>{t(lang, "terms")}</span></div>
        </div>
      </footer>
    </div>
  );
}
