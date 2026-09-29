import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "Methodology — how VerifAI checks | VerifAI";
const description = "How VerifAI searches the web, ranks evidence, uses multiple AI engines and checks citations against Crossref — and what it cannot determine.";

export const Route = createFileRoute("/methodology")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Methodology,
});

function Methodology() {
  return <ContentPage title="Our methodology" intro="VerifAI provides verification support, not definitive truth judgments. Here is exactly what happens when you run a check, so you can decide how much to rely on it.">
    <PageSection title="1. Web evidence retrieval"><p>For reports and fact-checks, VerifAI sends your question or claim to a web search service (Tavily) and collects up to 20 results. Results are re-ordered by combining the search service's own ranking with a keyword-relevance score (BM25), merged with Reciprocal Rank Fusion. The top results are kept with their link, title, excerpt and the time they were fetched.</p></PageSection>
    <PageSection title="2. AI engines"><p>Reports are written by DeepSeek, with Qwen as an automatic backup. For fact-checks, Qwen splits the text into individual claims, then DeepSeek and Qwen each judge every claim using only the retrieved excerpts. If they agree, that verdict is used; if they disagree, DeepSeek R1 decides. Engines are accessed through OpenRouter.</p></PageSection>
    <PageSection title="3. Verdicts and labels"><p><strong>Supported</strong>: the excerpts directly back the claim. <strong>Contradicted</strong>: the excerpts directly dispute it. <strong>Unverifiable</strong>: there wasn't enough evidence either way. Reports are labeled <strong>Web-Verified</strong> when written from fetched web sources, or <strong>Model Knowledge Only</strong> when no sources were found.</p></PageSection>
    <PageSection title="4. Citation checks"><p>Each reference is looked up in Crossref by DOI first. Without a DOI, VerifAI searches Crossref and compares titles (Jaro-Winkler similarity), first-author surnames (phonetic match) and years (±1). Retraction and withdrawal notices recorded in Crossref are flagged. The trust score is 0.4 × record type + 0.25 × recency + 0.2 × citation count − 0.15 × retraction, scaled to 0–100 — an approximate guide, not a quality judgement.</p></PageSection>
    <PageSection title="What VerifAI cannot determine"><p>It cannot read paywalled articles, verify facts that aren't online, judge opinions or predictions, or guarantee that a source is itself accurate. AI engines can misread evidence. Search results can be incomplete or outdated. Crossref doesn't cover every publication, so "Not found" is a prompt to check manually, not proof of fabrication.</p></PageSection>
    <PageSection title="How to read confidence"><p>A claim both engines agreed on, backed by several independent sources, is stronger than one decided by a tie-break or backed by a single excerpt. Always open the sources before relying on a result.</p></PageSection>
  </ContentPage>;
}
