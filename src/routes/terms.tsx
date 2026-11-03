import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "Terms of Service | Verfiai";
const description =
  "Terms for using Verfiai research tools and subscriptions, operated by verfiai.";
export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/terms" }],
  }),
  component: Terms,
});
function Terms() {
  return (
    <ContentPage
      title="Terms of Service"
      intro="Draft for owner review; not legal advice. Last updated October 31, 2026. These terms describe the Verfiai service provided by verfiai (the seller) and should be reviewed before adoption."
    >
      <PageSection title="The service and your account">
        <p>
          Verfiai provides AI-assisted research reports, claim checks and citation checks. You are
          responsible for your account credentials and for information submitted through your
          account. We may change or discontinue features; the service is not guaranteed to be
          uninterrupted, error-free or available at all times.
        </p>
      </PageSection>
      <PageSection title="AI outputs and decisions">
        <p>
          AI-generated material may be incomplete, inaccurate or outdated. Sources and citations
          should be independently checked. Model agreement is not proof. This service provides
          information, not legal, financial, investment, medical or tax advice. You are responsible
          for your prompts, verifying results and how you use or publish outputs.
        </p>
      </PageSection>
      <PageSection title="Requested research, cached results and availability">
        <p>
          Browsing does not start search or model processing. Submitting a research, claim-check or
          citation request instructs Verfiai to process it using the configured third-party services
          described in our{" "}
          <Link to="/privacy" className="text-brand underline">
            Privacy Policy
          </Link>
          . Fresh matching research may be reused for 24 hours, or seven days for repeated requests.
          If AI providers are unavailable, an older matching research result up to thirty days old
          may be shown with its date; otherwise source links may be offered without an AI answer or
          measured verdict. Such output is not a current independent verification and is not
          guaranteed to meet normal report length. Check source dates and original publications.
          Existing fair-use and account limits continue to apply; service or storage failures can
          still prevent a request from completing.
        </p>
      </PageSection>
      <PageSection title="Your content and rights">
        <p>
          You retain your rights to material you submit and are responsible for having the rights to
          use it. You grant verfiai a limited permission to process that material to provide the
          service. Subject to third-party rights, you may use reports produced for you for lawful
          internal or commercial purposes. verfiai retains ownership of its software, design,
          documentation and branding; your subscription grants a limited, non-transferable right to
          use the service within your plan, not ownership of the service.
        </p>
      </PageSection>
      <PageSection title="Acceptable use">
        <p>
          Do not use the service for unlawful activity, fraud, spam, impersonation, harmful or
          abusive material, non-consensual deepfakes, hate speech, malware, infringement of others’
          rights, bypassing safeguards or usage limits, scraping, probing, reverse engineering or
          disrupting security. We may filter or refuse requests, restrict or remove content, and
          suspend or terminate access for material breach, non-payment, fraud or security risk, or
          repeated or serious violations. Rights holders can report infringing material to{" "}
          <a className="text-brand underline" href="mailto:hello@verfiai.app">
            hello@verfiai.app
          </a>
          ; repeat infringers may lose access.
        </p>
      </PageSection>
      <PageSection title="Community access and fair use">
        <p>
          Verfiai is free from October 13, 2026 until October 13, 2027 (the launch free-access
          period). After that period, Pro and Teams pricing will be announced and existing free
          accounts will receive advance notice. Reasonable rate limits apply to protect service
          availability; existing fair-use allowances remain in place. Academic, educator and
          high-volume research users can request extended access at hello@verfiai.app. New paid
          checkout is unavailable. Joining the future Pro and Teams waitlist does not create a
          subscription or commit you to a purchase.
        </p>
        <p className="mt-3">
          If you already have a paid subscription, you can still manage or cancel it through the
          billing portal in My reports. This community transition does not automatically cancel
          existing subscriptions or issue refunds. See{" "}
          <Link to="/refunds" className="text-brand underline">
            our refund policy
          </Link>
          . Paddle remains the Merchant of Record for existing orders.
        </p>
      </PageSection>
      <PageSection title="Responsibility and changes">
        <p>
          To the extent permitted by applicable law, the service is provided without implied
          warranties, and verfiai is not responsible for losses resulting from reliance on
          unverified output or interruptions. Nothing here excludes rights or liabilities that
          cannot legally be excluded. We may update these terms and post the revised date here;
          continued use after changes take effect constitutes acceptance.
        </p>
      </PageSection>
      <PageSection title="Contact">
        <p>
          Questions or infringement notices:{" "}
          <a className="text-brand underline" href="mailto:hello@verfiai.app">
            hello@verfiai.app
          </a>
          .
        </p>
      </PageSection>
    </ContentPage>
  );
}
