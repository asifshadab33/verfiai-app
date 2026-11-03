import { createFileRoute, Link } from "@tanstack/react-router";
import { ScanSearch, BookOpen, ExternalLink } from "lucide-react";
import { FactChecker } from "@/components/verifai/FactChecker";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { useSiteLocale } from "@/lib/locale";
import { isLang, type Lang } from "@/lib/translations";
import { translations } from "@/lib/i18n/interface";

const url = "https://verfiai.app/fact-checker";
const title = "Free Fact Checker — Check Claims with Sources | Verfiai";
const description =
  "Check factual claims against source-linked evidence with Verfiai's free AI fact checker. Review supporting and conflicting evidence, citations and limitations.";

export const Route = createFileRoute("/fact-checker")({
  validateSearch: (s: Record<string, unknown>): { lang?: Lang } =>
    isLang(s["lang"]) ? { lang: s["lang"] } : {},
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Verfiai Fact Checker",
          url,
          description,
          applicationCategory: "ReferenceApplication",
          operatingSystem: "Web",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "USD",
            priceValidUntil: "2027-10-13",
          },
        }),
      },
    ],
  }),
  component: FactCheckerPage,
});

function FactCheckerPage() {
  const { lang } = useSiteLocale();
  return (
    <ContentPage
      title="Free Fact Checker"
      intro="Check a claim. Inspect the evidence. Make your own judgment."
      lang={lang}
    >
      <ScanSearch aria-hidden="true" className="mb-5 size-12 text-brand" />
      <div lang={lang} dir={translations[lang].dir}>
        <FactChecker lang={lang} />
      </div>
      <PageSection title="What a fact checker can tell you">
        <p>
          Verfiai compares factual claims with available source excerpts and flags supported,
          contradicted, mixed or insufficient evidence. AI agreement is not independent
          verification: follow the source links and check whether they actually support the claim.
        </p>
      </PageSection>
      <PageSection title="Free community access">
        <p>
          Free access runs until October 13, 2027. Reasonable fair-use limits apply; visitors can
          try a claim check without an account.{" "}
          <Link to="/pricing" className="text-brand underline">
            Community access details
          </Link>
          .
        </p>
      </PageSection>
      <div className="flex flex-wrap gap-6 text-sm font-semibold">
        <Link to="/methodology" className="inline-flex items-center gap-2 text-brand">
          <BookOpen className="size-4" />
          How evidence is assessed
        </Link>
        <Link to="/fact-checks" className="inline-flex items-center gap-2 text-brand">
          <ExternalLink className="size-4" />
          Browse editorial claim examples
        </Link>
      </div>
    </ContentPage>
  );
}
