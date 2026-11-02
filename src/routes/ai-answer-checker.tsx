import { createFileRoute, Link } from "@tanstack/react-router";
import { FactChecker } from "@/components/verifai/FactChecker";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { useSiteLocale } from "@/lib/locale";
import { isLang, type Lang } from "@/lib/translations";
import { translations } from "@/lib/i18n/interface";
import { toolHead } from "@/lib/tools/tool-head";

export const Route = createFileRoute("/ai-answer-checker")({
  validateSearch: (s: Record<string, unknown>): { lang?: Lang } => (isLang(s["lang"]) ? { lang: s["lang"] } : {}),
  head: () => toolHead({ path: "/ai-answer-checker", name: "Verfiai AI Answer Checker", title: "AI Answer Checker: Verify Claims in ChatGPT and AI Text | Verfiai", description: "Paste an AI-generated answer and check each factual claim against source-linked evidence. See which sentences are supported, contradicted or lack evidence." }),
  component: Page,
});

function Page() {
  const { lang } = useSiteLocale();
  return <ContentPage title="AI Answer Checker" intro="Paste an answer from ChatGPT, Claude, Gemini or any AI tool. Verfiai finds the factual claims, checks them against sources and marks each sentence in your text." lang={lang}>
    <div lang={lang} dir={translations[lang].dir}><FactChecker lang={lang} variant="answer" /></div>
    <PageSection title="How it works"><p>Verfiai pulls out the factual claims in your text, searches for evidence, and labels each claim supported, contradicted, mixed or lacking evidence. Your sentences are then marked to match, and each mark links to the claim it came from.</p></PageSection>
    <PageSection title="What it can and cannot tell you"><p>Marks show the evidence found for each claim, not whether the whole answer is true. Claims that cannot be matched to one sentence are still listed below the text. This tool does not detect whether text was written by AI, and it cannot read paywalled or offline sources. It uses the same free allowance as the <Link to="/fact-checker" className="text-brand underline">fact checker</Link>.</p></PageSection>
    <PageSection title="Also check the citations"><p>AI answers often invent references. Use the <Link to="/tools/doi-checker" className="text-brand underline">DOI and retraction checker</Link> to confirm that a cited paper exists, or the <Link to="/tools" className="text-brand underline">other free tools</Link>.</p></PageSection>
  </ContentPage>;
}
