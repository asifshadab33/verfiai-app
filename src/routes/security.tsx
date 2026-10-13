import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "Security at Verfiai";
const description = "How Verfiai protects accounts, reports and submitted text, and how to report a security issue.";
export const Route = createFileRoute("/security")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "article" }, { property: "og:url", content: "https://verfiai.app/security" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://verfiai.app/security" }] }),
  component: Security,
});

function Security() {
  return <ContentPage title="Security" intro="What we do to protect your account and content, and what we can't promise.">
    <PageSection title="Accounts and access"><p>Saved reports are private to your account and protected by database access rules. Share links use unguessable tokens and can be turned off from My reports. Attachments are served only through links that expire after 15 minutes.</p></PageSection>
    <PageSection title="Keys and providers"><p>Search and AI provider keys stay on our servers and are never sent to your browser. Usage limits are enforced on the server, not in the browser.</p></PageSection>
    <PageSection title="Browser-only processing"><p>Voice input and image text recognition (OCR) run in your browser; audio and images are not uploaded to our servers for those features.</p></PageSection>
    <PageSection title="Limits"><p>No internet service is completely secure, and we have not completed an independent security audit. Do not submit confidential, regulated, unpublished or personally identifiable material. See the <Link to="/privacy" className="text-brand underline">Privacy Policy</Link>.</p></PageSection>
    <PageSection title="Report a vulnerability"><p>Email <a href="mailto:hello@verfiai.app?subject=Security%20report" className="text-brand underline">hello@verfiai.app</a> with the subject “Security report”. Please give us reasonable time to fix an issue before disclosing it.</p></PageSection>
  </ContentPage>;
}
