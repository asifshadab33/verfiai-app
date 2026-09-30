import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "About Verfi AI";
const description = "What Verfi AI is, why it was built, and how models and data are handled: providers, retention and training.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/about" }],
  }),
  component: About,
});

function About() {
  return (
    <ContentPage
      title="About Verfi AI"
      intro="Verfi AI is an AI-assisted research and verification tool that helps users verify factual claims, assess citations, search for supporting or conflicting evidence, and generate source-traced reports."
    >
      <PageSection title="Why it was built">
        <p>
          Verfi AI was built to bring transparency and auditability to AI-assisted research. Instead of a single
          black-box answer, reports break topics into individual claims, label each one supported, contradicted,
          mixed or insufficiently evidenced, and list the sources behind every judgment so you can check them
          yourself.
        </p>
      </PageSection>

      <PageSection title="Who is behind it">
        <p>Verfi AI is developed and maintained by the verfiai team.</p>
        <p className="mt-2">Legal entity: verfiai</p>
        <p className="mt-2">
          Contact:{" "}
          <a className="text-brand underline" href="mailto:hello@verfiai.app">
            hello@verfiai.app
          </a>
        </p>
      </PageSection>

      <PageSection title="Model and data handling">
        <p>
          Submitted text and documents are processed by AI model providers accessed through OpenRouter (including
          DeepSeek and Qwen) to generate reports and verification checks. Web searches are performed by Tavily and
          citation lookups by Crossref.
        </p>
        <p className="mt-4">
          Regarding data retention and training: your submitted text is <strong>not</strong> used to train our own AI
          models. To avoid repeating identical work, search results are cached for up to 24 hours and generated
          reports for up to 7 days; verification caches may persist up to 30 days. Monthly usage records and a hashed
          guest identifier are kept only as needed to enforce plan limits and prevent abuse. Third-party providers
          process your content under their own policies, which may differ.
        </p>
        <p className="mt-4">
          Generated reports are stored in your account until you delete them from My reports. Guests do not have
          accounts, so guest reports are not saved. Deleting a report does not remove records our payment provider
          must retain for billing and tax purposes.
        </p>
        <p className="mt-4">
          Full details are in our{" "}
          <Link to="/privacy" className="text-brand underline">
            Privacy Notice
          </Link>
          .
        </p>
      </PageSection>
    </ContentPage>
  );
}
