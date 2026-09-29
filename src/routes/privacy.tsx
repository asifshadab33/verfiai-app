import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "Privacy and data handling | VerifAI";
const description = "What data VerifAI sends to which services, what it stores and how to delete it.";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Privacy,
});

function Privacy() {
  return <ContentPage title="Privacy and data handling" intro="A plain summary of how VerifAI handles your data today. A full privacy policy is being prepared.">
    <PageSection title="What is sent to other services"><p>Text you submit is sent to AI engines through OpenRouter (DeepSeek, Qwen) and search queries to Tavily in order to produce results. Reference details are looked up in Crossref. Voice input is processed by your browser's speech feature, not by VerifAI's servers.</p></PageSection>
    <PageSection title="What VerifAI stores"><p>If you sign in, your email, reports you generate, and a count of checks you've used this month. Search results, claim verdicts and citation lookups are cached for up to 30 days so repeated checks are faster; these caches aren't linked to your account. For visitors without an account, a one-way hash of network address and browser type is stored to enforce the free allowance.</p></PageSection>
    <PageSection title="Sharing"><p>Reports are private unless you create a share link. Anyone with that link can read the report until you press "Stop sharing".</p></PageSection>
    <PageSection title="Deleting your data"><p>You can delete any report from My reports. Don't submit confidential or personal information.</p></PageSection>
  </ContentPage>;
}
