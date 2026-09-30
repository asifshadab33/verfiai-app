import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "Terms of Service | VerifAI";
const description = "The terms that apply when you use VerifAI. A full legal agreement is being prepared.";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [
    { title }, { name: "description", content: description },
    { property: "og:title", content: title }, { property: "og:description", content: description },
    { property: "og:type", content: "article" }, { name: "twitter:card", content: "summary" },
  ], links: [{ rel: "canonical", href: "https://verfiai.app/terms" }] }),
  component: Terms,
});

function Terms() {
  return <ContentPage title="Terms of Service" intro="A short, plain summary of the terms that apply today. A complete legal agreement is being prepared and will replace this page.">
    <PageSection title="What VerifAI is"><p>VerifAI generates research reports and evidence checks with the help of AI models and web search. It provides verification support, not definitive truth judgments. Review every source before relying on a result.</p></PageSection>
    <PageSection title="Your responsibilities"><p>Do not submit confidential or personal information. Do not use VerifAI to break the law, misrepresent authorship, or present AI output as independently verified fact.</p></PageSection>
    <PageSection title="Availability and accounts"><p>Free allowances are set per month and reset on the 1st. Paid plans are arranged by contacting us. Accounts exist only to store the reports you choose to save.</p></PageSection>
    <PageSection title="Questions"><p>Write to <a className="text-brand underline" href="mailto:hello@verfiai.app">hello@verfiai.app</a> about these terms or anything else.</p></PageSection>
  </ContentPage>;
}
