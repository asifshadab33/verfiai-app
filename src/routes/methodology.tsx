import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "Methodology — how Verfi AI checks | Verfi AI";
const description = "How Verfi AI searches the web, ranks evidence, uses multiple AI engines and checks citations against Crossref — and what it cannot determine.";

export const Route = createFileRoute("/methodology")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Methodology,
});

function Methodology() {
  return <ContentPage title="Verification methodology" intro="Transparency is core to Verfi AI. This page explains how the system processes information, evaluates evidence and presents findings. Last updated: October 1, 2026.">
    <PageSection title="What Verfi AI analyzes"><p>User-submitted text, documents or research questions, to identify discrete factual claims or academic references. It does not evaluate subjective opinions, predictions or creative content.</p></PageSection>
    <PageSection title="How sources are found and selected"><p>For reports and fact-checks, your question or claim is sent to a live web search service (Tavily), which returns up to 20 results. These are re-ordered by combining the search service's ranking with a keyword-relevance score (BM25), merged with Reciprocal Rank Fusion. The top results are kept with their link, title, excerpt and retrieval time. References are looked up in Crossref.</p></PageSection>
    <PageSection title="How claims and evidence are assessed"><p>Qwen splits the submission into individual claims. DeepSeek and Qwen then each judge every claim using only the retrieved excerpts, labelling it <strong>Supported</strong>, <strong>Contradicted</strong> or <strong>Unverifiable</strong>. Reports are written by DeepSeek (Qwen as backup) and labelled <strong>Web-Verified</strong> when written from fetched sources, or <strong>Model Knowledge Only</strong> when none were found. Engines are accessed through OpenRouter.</p></PageSection>
    <PageSection title="What “confidence” means"><p>Confidence reflects the strength of the available evidence. It rises with several independent, recent, consistent sources and when both engines agree; it falls when sources are sparse, outdated or contradictory, or a tie-break was needed. <strong>High confidence does not equal absolute truth.</strong></p></PageSection>
    <PageSection title="Handling disagreement and conflicting evidence"><p>When the two engines disagree, DeepSeek R1 acts as tie-breaker, and the differing source excerpts are shown side by side so you can judge for yourself.</p></PageSection>
    <PageSection title="Citation checks"><p>Each reference is looked up in Crossref by DOI first. Without a DOI, Verfi AI searches Crossref and compares titles (Jaro-Winkler similarity), first-author surnames (phonetic match) and years (±1). Retraction and withdrawal notices recorded in Crossref are flagged. The trust score is 0.4 × record type + 0.25 × recency + 0.2 × citation count − 0.15 × retraction, scaled to 0–100 — an approximate guide, not a quality judgement. "Not found" is a prompt to check manually, not proof of fabrication.</p></PageSection>
    <PageSection title="Product limitations"><ul className="list-disc space-y-2 pl-5"><li>Verfi AI cannot read paywalled, offline or non-indexed sources.</li><li>Search coverage may miss very recent events due to indexing delays.</li><li>AI engines can misinterpret nuanced evidence or context.</li><li>Crossref does not cover every publication.</li><li>Outputs are decision support, not definitive truth judgments.</li></ul></PageSection>
    <PageSection title="User responsibilities"><p>Open the source links, review the full context of the excerpts, and apply your own professional judgment before making important decisions based on Verfi AI results.</p></PageSection>
  </ContentPage>;
}
