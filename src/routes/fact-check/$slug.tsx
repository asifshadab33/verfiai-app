import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { getClaimBySlug, VERDICT_LABEL, claimReviewSchema, type ClaimEntry } from "@/data/claims";

const BASE = "https://verfiai.app";
const tone = { supported: "bg-success-soft text-success border-success/30", contradicted: "bg-danger-soft text-destructive border-destructive/30", mixed: "bg-warning-soft text-warning border-warning/40" } as const;

function faqs(c: ClaimEntry) {
  return [
    { q: `Is it true that ${c.claim.replace(/\.$/, "").replace(/^./, m => m.toLowerCase())}?`, a: `${VERDICT_LABEL[c.verdict]}. ${c.evidence_summary}` },
    { q: "Why do people search for this?", a: `People commonly search "${c.search_phrase}". Verfiai lists it as: ${c.why_searched}.` },
    { q: "How was this verdict reached?", a: c.review ? `Verfiai reviewed the cited source text on ${c.review.reviewedAt}. The analysis, claim provenance and limitations are shown below. This is a dated editorial review, not a new live check on every visit.` : "This is an unreviewed editorial summary from Verfiai's curated claim list. Evidence and claim provenance have not yet been substantiated for publication; ClaimReview markup is withheld. Use the live checker and inspect its sources." },
  ];
}

export const Route = createFileRoute("/fact-check/$slug")({
  loader: ({ params }) => { const c = getClaimBySlug(params.slug); if (!c) throw notFound(); return c; },
  head: ({ loaderData: c }) => c ? ({
    meta: [
      { title: `Fact check: ${c.claim.slice(0, 60)} | Verfiai` },
      { name: "description", content: `${VERDICT_LABEL[c.verdict]}: ${c.evidence_summary}`.slice(0, 160) },
      { property: "og:title", content: `Fact check: ${c.claim.slice(0, 60)} | Verfiai` },
      { property: "og:description", content: `${VERDICT_LABEL[c.verdict]} — ${c.evidence_summary}`.slice(0, 200) },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: `${BASE}/fact-check/${c.slug}` }],
    scripts: [
      ...(claimReviewSchema(c) ? [{ type: "application/ld+json", children: JSON.stringify(claimReviewSchema(c)) }] : []),
      { type: "application/ld+json", children: JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs(c).map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }) },
    ],
  }) : { meta: [{ title: "Fact check not found | Verfiai" }, { name: "description", content: "This claim is not in Verfiai's editorial claim directory." }, { property: "og:title", content: "Fact check not found | Verfiai" }, { property: "og:description", content: "This claim is not in Verfiai's editorial claim directory." }, { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" }] },
  notFoundComponent: () => <ContentPage title="Fact check not found" intro="This claim isn't in our list."><Link to="/fact-checks" className="text-brand underline">Browse all fact checks</Link></ContentPage>,
  component: FactCheckPage,
});

function FactCheckPage() {
  const c = Route.useLoaderData();
  return <ContentPage title={c.claim} intro={`Category: ${c.category} · Difficulty: ${c.difficulty}`}>
    <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-bold ${tone[c.verdict]}`}>{VERDICT_LABEL[c.verdict]}</span>
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      <section className="border border-border bg-card p-5"><h2 className="font-display text-lg font-bold">The claim as people say it</h2><p className="mt-2 text-muted-foreground">"{c.claim}"</p><p className="mt-3 text-xs text-muted-foreground">Common search: "{c.search_phrase}" · {c.why_searched}</p></section>
      <section className="border border-border bg-card p-5"><h2 className="font-display text-lg font-bold">What the evidence shows</h2><p className="mt-2 text-muted-foreground">{c.evidence_summary}</p></section>
    </div>
    <p role="note" className="mt-5 border-s-2 border-warning bg-warning-soft p-3 text-xs">{c.review ? `Editorial evidence review by ${c.review.reviewer} on ${c.review.reviewedAt}. Not a live check on each visit.` : "Unreviewed editorial summary; cited evidence and provenance pending. ClaimReview markup withheld."} Verdicts are aids to review, not proof.</p>
    {c.review && <>
      <PageSection title="Claim provenance"><p>{c.review.attribution.origin}</p><p className="mt-3">{c.review.attribution.documentedAppearance} <a href={c.review.attribution.url} target="_blank" rel="noopener noreferrer" className="text-brand underline">Read the documented discussion</a>.</p></PageSection>
      <PageSection title="Evidence review">{c.review.analysis.map((p, i) => <p key={i} className="mt-4">{p.text} {p.citations.map(n => <a key={n} href={`#editorial-source-${n}`} className="text-brand underline" aria-label={`Source ${n}`}>[{n}]</a>)}</p>)}</PageSection>
      <PageSection title="Sources"><ol className="space-y-6">{c.review.sources.map((s, i) => <li id={`editorial-source-${i + 1}`} key={s.url} className="scroll-mt-8"><a href={s.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand underline">[{i + 1}] {s.title}</a><p className="mt-1 text-sm">{s.publisher}{s.authors ? ` · ${s.authors}` : ""}{s.publishedAt ? ` · Published ${s.publishedAt}` : " · Publication date not established"} · Source text checked {s.accessedAt}</p><blockquote className="mt-3 border-s-2 border-border ps-4">“{s.quote}”</blockquote><p className="mt-3">{s.relevance}</p></li>)}</ol></PageSection>
      <PageSection title="Scope and limitations"><p>{c.review.limitations}</p></PageSection>
    </>}
    <div className="mt-6"><Button asChild><Link to="/" hash="research">Check this claim with live sources <ArrowRight /></Link></Button></div>
    <PageSection title="Frequently asked questions">{faqs(c).map(f => <div key={f.q} className="mt-4"><h3 className="font-semibold text-foreground">{f.q}</h3><p className="mt-1">{f.a}</p></div>)}</PageSection>
    <Link to="/fact-checks" className="text-sm font-semibold text-brand underline">← All fact checks</Link>
  </ContentPage>;
}
