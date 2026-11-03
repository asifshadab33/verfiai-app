import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "Contact Verfiai";
const description =
  "Contact the Verfiai team for support, extended access, privacy requests, rights notices or feedback.";
export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://verfiai.app/contact" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/contact" }],
  }),
  component: Contact,
});

const ROWS: [string, string, string][] = [
  ["Support and feedback", "Verfiai%20support", "Questions about reports, checks or your account."],
  [
    "Cached or sources-only results",
    "Research%20result%20question",
    "Tell us which tool you used and the result date if a saved result is outdated or sources-only output needs attention. Do not email confidential questions or full reports.",
  ],
  [
    "Extended access",
    "Extended%20access%20request",
    "For academic, educator and high-volume research use. Tell us your needs and expected volume.",
  ],
  [
    "Privacy requests (GDPR / CCPA)",
    "Privacy%20request",
    "Access, export, correction or deletion of your personal data.",
  ],
  ["Rights and copyright notices", "Rights%20notice", "Concerns about content shown in a report."],
  ["Security reports", "Security%20report", "Vulnerabilities or suspected misuse."],
];

function Contact() {
  return (
    <ContentPage
      title="Contact"
      intro="Contact the Verfiai team at hello@verfiai.app. Email links open your email application; this page does not submit a form, run search or generate an AI answer."
    >
      {ROWS.map(([t, subj, body]) => (
        <PageSection key={t} title={t}>
          <p>
            {body}{" "}
            <a href={`mailto:hello@verfiai.app?subject=${subj}`} className="text-brand underline">
              Email us
            </a>
          </p>
        </PageSection>
      ))}
    </ContentPage>
  );
}
