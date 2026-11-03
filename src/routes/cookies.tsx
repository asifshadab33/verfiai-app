import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { Button } from "@/components/ui/button";
import { openCookieSettings } from "@/lib/analytics-consent";

const title = "Cookies & Browser Storage | Verfiai";
const description =
  "Verfiai's essential browser storage, opt-in Google Analytics and PostHog, and how to withdraw analytics consent.";
export const Route = createFileRoute("/cookies")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/cookies" }],
  }),
  component: Cookies,
});
function Cookies() {
  return (
    <ContentPage
      title="Cookies & browser storage"
      intro="Draft for owner review; not legal advice. Last updated October 31, 2026."
    >
      <PageSection title="Essential storage">
        <p>
          Sign-in sessions and language preferences use browser storage. The strictly necessary
          localStorage record <code>verfiai-analytics-consent</code> stores an accepted or rejected
          choice, policy version and timestamp. We ask again after twelve months or a policy version
          change. Clearing essential storage can sign you out or reset your choices.
        </p>
      </PageSection>
      <PageSection title="Analytics only after acceptance">
        <p>
          Google Analytics and PostHog stay off until you accept analytics. Before acceptance, we do
          not initialize these services or send cookieless consent-mode pings. After acceptance,
          Google Analytics can set <code>_ga</code> and <code>_ga_*</code> first-party cookies;
          PostHog uses <code>ph_*</code> identifiers and opt-in/out storage under{" "}
          <code>__ph_opt_in_out_*</code>. These measure use, not advertising. Research text and
          report contents are excluded from analytics, private URL identifiers are redacted, and
          session recording is disabled.
        </p>
      </PageSection>
      <PageSection title="Change or withdraw your choice">
        <p>
          Global Privacy Control is treated as a refusal unless you explicitly opt in through Cookie
          settings. Rejection keeps analytics off. Withdrawal stops further tracking and attempts to
          remove accessible analytics cookies on the current and parent domains and analytics
          local/session storage; it leaves sign-in and language preferences alone. Already-sent or
          queued requests cannot be recalled.
        </p>
        <Button variant="outline" className="mt-4 min-h-11" onClick={openCookieSettings}>
          Cookie settings
        </Button>
      </PageSection>
      <PageSection title="Research is a separate choice">
        <p>
          Accepting analytics does not start research. Search or AI runs only after a research,
          claim-check or citation submission. Details of providers and server-side caching are in
          our{" "}
          <Link to="/privacy" className="text-brand underline">
            Privacy Policy
          </Link>{" "}
          and{" "}
          <Link to="/methodology" className="text-brand underline">
            Methodology
          </Link>
          .
        </p>
      </PageSection>
    </ContentPage>
  );
}
