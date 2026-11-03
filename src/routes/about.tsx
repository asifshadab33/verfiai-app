import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "About Verfiai";
const description =
  "What Verfiai is, why this AI verification tool was built, and who develops it.";

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
      title="About Verfiai"
      intro="Verfiai is an AI-assisted research and verification tool that helps users verify factual claims, assess citations, search for supporting or conflicting evidence, and generate source-traced reports."
    >
      <PageSection title="What Verfiai is">
        <p>
          Verfiai is an AI verification tool for checking factual claims and citations against
          source-linked evidence. It organizes what it finds into reviewable findings rather than
          presenting its output as an infallible truth judgment.
        </p>
      </PageSection>
      <PageSection title="Why it was built">
        <p>
          Verfiai was built to bring transparency and auditability to AI-assisted research. Instead
          of a single black-box answer, reports break topics into individual claims, label each one
          supported, contradicted, mixed or insufficiently evidenced, and list the sources behind
          every judgment so you can check them yourself.
        </p>
      </PageSection>

      <PageSection title="Who is behind it">
        <p>Verfiai is developed and maintained by the Verfiai team.</p>
        <p className="mt-2">
          Contact:{" "}
          <a className="text-brand underline" href="mailto:hello@verfiai.app">
            hello@verfiai.app
          </a>
        </p>
      </PageSection>

      <PageSection title="Learn how verification works">
        <p>
          Our{" "}
          <Link to="/methodology" className="text-brand underline">
            methodology
          </Link>{" "}
          explains source discovery, evidence assessment, model and data handling, limitations, and
          your role in reviewing results. Full privacy details are in our{" "}
          <Link to="/privacy" className="text-brand underline">
            Privacy Notice
          </Link>
          .
        </p>
      </PageSection>
    </ContentPage>
  );
}
