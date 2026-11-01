import { recentText } from "@/lib/recent-i18n";
import { siteText } from "@/lib/site-i18n";
import type { Lang } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { CommunityWaitlist } from "./CommunityWaitlist";
import { COMMUNITY_LABELS, FREE_ACCESS_END, FREE_TRY_LINE, IS_FREE_Q, IS_FREE_A } from "@/lib/community";
import { PricingTiers } from "./PricingTiers";

export function PricingSection({ onStart, lang }: { onStart: () => void; lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return <section id="pricing" aria-labelledby="pricing-title" className="mx-auto max-w-7xl scroll-mt-24 px-5 py-16">
    <p className="text-xs font-bold uppercase text-brand">{COMMUNITY_LABELS[lang]}</p>
    <h2 id="pricing-title" className="mt-2 font-display text-3xl font-bold">{t("Free Access for the Community")}</h2>
    <div className="mt-8 grid gap-10 md:grid-cols-2">
      <div><p className="font-display text-4xl font-bold">{recentText(lang, "Free until {date}", { date: FREE_ACCESS_END })}</p><p className="mt-4 leading-7 text-muted-foreground">{t("All current features are free during the launch period. No credit card required.")}</p><div className="mt-6 text-sm"><PricingTiers /></div><p className="mt-4 text-sm leading-6 text-muted-foreground">{t("Reasonable rate limits apply to protect service availability. Current fair-use allowances remain in place; free access does not mean unlimited requests.")}</p><p className="mt-4 text-sm leading-6 text-muted-foreground">{t("Academic, educator and high-volume research users can request extended access at")}<a href="mailto:hello@verfiai.app" className="text-brand underline">hello@verfiai.app</a>.</p><div className="mt-6 flex flex-wrap items-center gap-4"><Button onClick={onStart}>{siteText(lang, "heroPrimary")}<ArrowRight /></Button><Link to="/pricing" className="text-sm font-semibold text-brand underline">{t("Community access details")}</Link></div></div>
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
  ["What are the free-plan limits?", "A free account gets 3 reports, 3 fact-checks and 3 citation scans a month. You can try a claim check without an account. Verfiai is free until October 13, 2027, subject to fair-use limits. Academic, educator and high-volume users can request extended access at hello@verfiai.app."],
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

