import { AccountLink, LanguagePicker } from "@/components/verifai/HomeNavControls";
import { SampleReportDialog } from "@/components/verifai/SampleReportDialog";
import { ReportForm } from "@/components/verifai/ReportForm";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowRight, ChevronDown, FileCheck2, Menu, ShieldCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CitationFeature,
  FAQS,
  FaqSection,
  FinalCta,
  ReportProofSection,
  HeroBadges,
  HeroMockup,
  HowItWorksSection,
  PricingSection,
  ProductDemo,
  TrustSection,
  UseCases,
  WorkspaceCards,
} from "@/components/verifai/HomeSections";
import { StudioWorkspace, type StudioTab } from "@/components/verifai/StudioWorkspace";
import { uiText } from "@/lib/ui-extra-i18n";
import { PaymentTestModeBanner } from "@/components/verifai/PaymentTestModeBanner";
import { isLang, type Lang } from "@/lib/translations";
import { siteText } from "@/lib/site-i18n";
import { useSiteLocale } from "@/lib/locale";
import { COMMUNITY_LABELS } from "@/lib/community";
import { translations } from "@/lib/i18n/interface";
import { pageSeoLinks } from "@/lib/seo";
import { SearchPalette } from "@/components/verifai/SearchPalette";

const SITE = "https://verfiai.app";

export const Route = createFileRoute("/")({
  validateSearch: (s: Record<string, unknown>): { lang?: Lang } =>
    isLang(s["lang"]) ? { lang: s["lang"] } : {},
  loaderDeps: ({ search }) => ({ lang: search.lang ?? "en" }),
  loader: ({ deps }) => ({ lang: deps.lang as Lang }),
  head: ({ loaderData }) => {
    const lang = loaderData?.lang ?? "en";
    const title = "AI Fact Checker & Citation Checker | Verfiai";
    const description = siteText(lang, "seoDescription");
    const url = lang === "en" ? `${SITE}/` : `${SITE}/?lang=${lang}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:locale", content: lang },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: pageSeoLinks("/", lang),
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "Verfiai",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: SITE,
            description,
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          }),
        },
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(([q, a]) => ({
              "@type": "Question",
              name: q,
              acceptedAnswer: { "@type": "Answer", text: a },
            })),
          }),
        },
      ],
    };
  },
  component: Home,
});

type TextKey = Parameters<typeof siteText>[1];
function Home() {
  const { lang, changeLang } = useSiteLocale();
  const [tab, setTab] = useState<StudioTab>("report");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLButtonElement>(null);
  const tx = (key: TextKey) => siteText(lang, key);
  function selectTab(next: StudioTab) {
    setTab(next);
    setMenuOpen(false);
    setToolsOpen(false);
    document.getElementById("studio")?.scrollIntoView({ behavior: "smooth" });
  }
  return (
    <div
      lang={lang}
      dir={translations[lang].dir}
      className="min-h-screen overflow-x-clip bg-background text-foreground"
    >
      <PaymentTestModeBanner />
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5">
          <Link to="/" className="flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <FileCheck2 className="size-5" />
            </span>
            Verfiai
          </Link>
          <nav className="hidden items-center gap-4 text-sm font-medium lg:flex">
            <div
              className="relative"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) setToolsOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setToolsOpen(false);
                  toolsRef.current?.focus();
                }
              }}
            >
              <Button
                ref={toolsRef}
                variant="ghost"
                className="min-h-11 gap-1"
                aria-expanded={toolsOpen}
                aria-controls="research-tools-menu"
                onClick={() => setToolsOpen((open) => !open)}
              >
                {tx("navTools")} <ChevronDown />
              </Button>
              <div
                id="research-tools-menu"
                hidden={!toolsOpen}
                className="absolute start-0 top-full z-40 min-w-52 border border-border bg-card p-2 shadow-lg"
              >
                <Button
                  variant="ghost"
                  className="min-h-11 w-full justify-start"
                  onClick={() => selectTab("report")}
                >
                  {tx("navReport")}
                </Button>
                <Button
                  variant="ghost"
                  className="min-h-11 w-full justify-start"
                  onClick={() => selectTab("fact")}
                >
                  {tx("navFact")}
                </Button>
                <Button
                  variant="ghost"
                  className="min-h-11 w-full justify-start"
                  onClick={() => selectTab("citation")}
                >
                  {tx("navCitation")}
                </Button>
                <Link
                  to="/tools"
                  className="flex min-h-11 w-full items-center justify-start gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                  onClick={() => setToolsOpen(false)}
                >
                  {tx("navAllTools")}
                </Link>
              </div>
            </div>
            <Link to="/how-it-works" className="hover:text-brand">
              {tx("navHow")}
            </Link>
            <Link to="/about" className="hover:text-brand">
              {tx("navAbout")}
            </Link>
            <Link to="/methodology" className="hover:text-brand">
              {tx("navMethodology")}
            </Link>
            <Link to="/accuracy" className="hover:text-brand">
              {tx("navAccuracy")}
            </Link>
            <Link to="/pricing" className="hover:text-brand">
              {COMMUNITY_LABELS[lang]}
            </Link>
            <a href="#faq" className="hover:text-brand">
              {tx("navFaq")}
            </a>
            <SearchPalette lang={lang} />
            <LanguagePicker lang={lang} onChange={changeLang} />
            <AccountLink lang={lang} />
            <Button size="sm" onClick={() => selectTab("fact")}>
              {tx("heroPrimary")}
            </Button>
          </nav>
          <div className="flex items-center gap-3 lg:hidden">
            <LanguagePicker lang={lang} onChange={changeLang} />
            <AccountLink lang={lang} />
            <Button
              size="icon"
              variant="ghost"
              className="min-h-11 min-w-11"
              aria-label={tx("menu")}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="mobile-navigation-menu"
            className="flex flex-col gap-1 border-t border-border bg-background px-5 py-3 text-sm lg:hidden"
          >
            <div className="flex min-h-11 items-center justify-between">
              <span className="font-medium">{siteText(lang, "searchTitle")}</span>
              <SearchPalette lang={lang} />
            </div>
            <Button
              variant="ghost"
              className="min-h-11 justify-start"
              onClick={() => selectTab("report")}
            >
              {tx("navReport")}
            </Button>
            <Button
              variant="ghost"
              className="min-h-11 justify-start"
              onClick={() => selectTab("fact")}
            >
              {tx("navFact")}
            </Button>
            <Button
              variant="ghost"
              className="min-h-11 justify-start"
              onClick={() => selectTab("citation")}
            >
              {tx("navCitation")}
            </Button>
            <Link
              to="/tools"
              className="flex min-h-11 items-center px-4 py-2"
              onClick={() => setMenuOpen(false)}
            >
              {tx("navAllTools")}
            </Link>
            <Link to="/how-it-works" className="flex min-h-11 items-center px-4 py-2">
              {tx("navHow")}
            </Link>
            <Link to="/about" className="flex min-h-11 items-center px-4 py-2">
              {tx("navAbout")}
            </Link>
            <Link to="/methodology" className="flex min-h-11 items-center px-4 py-2">
              {tx("navMethodology")}
            </Link>
            <Link to="/accuracy" className="flex min-h-11 items-center px-4 py-2">
              {tx("navAccuracy")}
            </Link>
            <Link
              to="/pricing"
              className="flex min-h-11 items-center px-4 py-2"
              onClick={() => setMenuOpen(false)}
            >
              {COMMUNITY_LABELS[lang]}
            </Link>
            <a
              href="#faq"
              className="flex min-h-11 items-center px-4 py-2"
              onClick={() => setMenuOpen(false)}
            >
              {tx("navFaq")}
            </a>
          </nav>
        )}
      </header>
      <main id="main-content" tabIndex={-1}>
        <section className="border-b border-border bg-secondary/50">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-5 pb-14 pt-14 md:pb-20 md:pt-20 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <p className="text-xs font-bold uppercase text-brand">{tx("tagline")}</p>
              <h1 className="mt-5 font-display text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
                {lang === "en"
                  ? "Research you can verify. Sources you can see."
                  : translations[lang].hero_headline}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                {translations[lang].hero_sub}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" className="h-12" onClick={() => selectTab("fact")}>
                  {lang === "en" ? uiText(lang, "heroCheck") : translations[lang].cta_primary}{" "}
                  <ArrowRight />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12"
                  onClick={() => selectTab("report")}
                >
                  {uiText(lang, "heroReport")}
                </Button>
                <Button size="lg" variant="ghost" className="h-12" asChild>
                  <Link to="/tools/$tool" params={{ tool: "citation-checker" }}>
                    {uiText(lang, "heroCite")}
                  </Link>
                </Button>
              </div>
              <p className="mt-4 max-w-xl text-sm text-muted-foreground">
                {uiText(lang, "tryLine")}
              </p>
              <div className="mt-2">
                <SampleReportDialog lang={lang} label={translations[lang].cta_secondary} />
              </div>
              <HeroBadges lang={lang} />
              <p className="mt-5 max-w-xl text-xs text-muted-foreground">
                {translations[lang].disclaimer}
              </p>
            </div>
            <HeroMockup lang={lang} />
          </div>
        </section>
        <WorkspaceCards lang={lang} onSelect={selectTab} />
        <ProductDemo lang={lang} onTry={() => selectTab("fact")} />
        <section id="studio" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-14 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase text-brand">Verfiai / Workspace</p>
              <h2 className="mt-2 font-display text-3xl font-bold">{tx("workspace")}</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="size-4" /> AI output is not independent verification
            </div>
          </div>
          <div className="mt-9">
            <StudioWorkspace
              lang={lang}
              tab={tab}
              onTab={setTab}
              report={<ReportForm lang={lang} onLang={changeLang} />}
            />
          </div>
        </section>
        <ReportProofSection lang={lang} />
        <CitationFeature lang={lang} />
        <HowItWorksSection lang={lang} />
        <UseCases lang={lang} />
        <TrustSection lang={lang} />
        <PricingSection lang={lang} onStart={() => selectTab("report")} />
        <FaqSection lang={lang} />
        <FinalCta lang={lang} onStart={() => selectTab("fact")} />
      </main>
    </div>
  );
}
