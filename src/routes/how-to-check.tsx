import { createFileRoute, Link } from "@tanstack/react-router";
import { isValidElement, type ReactNode } from "react";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { toolHead } from "@/lib/tools/tool-head";

const faqs = [
  {
    question: "How do I check if a photo is real?",
    answer: (
      <>
        Look for the earliest version, compare details across independent sources, and inspect
        metadata when available. Metadata can be changed or removed and does not prove authenticity.
        Try the{" "}
        <Link className="text-brand underline" to="/tools/photo-check">
          Photo Check
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I know if a source is credible?",
    answer: (
      <>
        Check who published it, the author's expertise, evidence links, corrections policy, and
        whether independent sources corroborate it. Use the{" "}
        <Link className="text-brand underline" to="/tools/source-checklist">
          Source Evaluation Checklist
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I verify a quote?",
    answer: (
      <>
        Find the original recording, transcript, document, or publication. Check exact wording and
        context, then confirm the speaker and date. The{" "}
        <Link className="text-brand underline" to="/tools/wayback">
          Wayback Machine Checker
        </Link>{" "}
        may help locate older page versions.
      </>
    ),
  },
  {
    question: "How do I check whether a webpage has changed?",
    answer: (
      <>
        Compare the current page with archived captures, while remembering that archives may be
        incomplete. Search the exact URL with the{" "}
        <Link className="text-brand underline" to="/tools/wayback">
          Wayback Machine Checker
        </Link>
        .
      </>
    ),
  },
  {
    question: "How can I compare evidence for a claim?",
    answer: (
      <>
        Write the claim precisely, collect relevant excerpts from independent sources, and record
        evidence that disagrees as well as evidence that supports it. Organize it in the{" "}
        <Link className="text-brand underline" to="/tools/evidence-matrix">
          Claim Evidence Matrix
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I check if a claim is specific enough to verify?",
    answer: (
      <>
        Identify who did what, where, and when. Replace broad or absolute language with a testable
        statement. The{" "}
        <Link className="text-brand underline" to="/tools/claim-spotter">
          Claim Spotter
        </Link>{" "}
        can help find statements to examine.
      </>
    ),
  },
  {
    question: "How do I check whether a headline is misleading?",
    answer: (
      <>
        Read the full article, compare its evidence with the headline, and watch for missing
        qualifiers or unsupported certainty. The{" "}
        <Link className="text-brand underline" to="/tools/headline-analyzer">
          Headline Analyzer
        </Link>{" "}
        flags wording to inspect; it cannot judge whether a headline is true.
      </>
    ),
  },
  {
    question: "How do I verify a statistic?",
    answer: (
      <>
        Find the original dataset or report, confirm definitions and dates, and check the
        denominator, sample, and method. Use the{" "}
        <Link className="text-brand underline" to="/tools/numbers-check">
          Numbers-in-News Checker
        </Link>{" "}
        to spot questions for further verification.
      </>
    ),
  },
  {
    question: "How do I check if a website is trustworthy?",
    answer: (
      <>
        Confirm the domain spelling, organization details, contact information, and links to primary
        evidence. HTTPS protects a connection but does not establish that the publisher is reliable.
        Review the{" "}
        <Link className="text-brand underline" to="/tools/source-checklist">
          Source Evaluation Checklist
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I check when a domain was registered?",
    answer: (
      <>
        Look up public registration data and note that privacy services or registry practices may
        limit dates and owner details. Try the{" "}
        <Link className="text-brand underline" to="/tools/domain-age">
          Domain Age Checker
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I check a suspicious link?",
    answer: (
      <>
        Inspect the actual destination and domain carefully without entering credentials. Avoid
        opening unexpected links on a device with sensitive accounts. The{" "}
        <Link className="text-brand underline" to="/tools/url-inspector">
          URL Inspector
        </Link>{" "}
        shows a URL's structure.
      </>
    ),
  },
  {
    question: "How can I verify an email's origin?",
    answer: (
      <>
        Review the full message headers and compare sending domains and authentication results.
        Header fields can be forged; treat them as clues, not proof. Use the{" "}
        <Link className="text-brand underline" to="/tools/email-headers">
          Email Header Analyzer
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I check a research paper's DOI?",
    answer: (
      <>
        Resolve the DOI and compare its title, authors, and publication details with the paper.
        Registry records can be incomplete. Use the{" "}
        <Link className="text-brand underline" to="/tools/doi-checker">
          DOI and Retraction Checker
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I find an open-access journal?",
    answer: (
      <>
        Search the journal title in the Directory of Open Access Journals and verify the exact title
        and publisher. Indexing is not an endorsement of every article. Try the{" "}
        <Link className="text-brand underline" to="/tools/doaj-journal-checker">
          DOAJ Journal Checker
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I check who owns a public IP address?",
    answer: (
      <>
        A public IP lookup may show approximate network registration and location, not the identity
        or precise location of a person. Use the{" "}
        <Link className="text-brand underline" to="/tools/ip-checker">
          IP Address Checker
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I inspect DNS records for a domain?",
    answer: (
      <>
        Query the needed record type and treat DNS output as time-sensitive infrastructure data. The{" "}
        <Link className="text-brand underline" to="/tools/dns-inspector">
          DNS Inspector
        </Link>{" "}
        displays public answers and TTL values.
      </>
    ),
  },
  {
    question: "How do I check a website's TLS certificate history?",
    answer: (
      <>
        Certificate transparency records show certificates issued for names, not proof of ownership
        or malicious activity. Search with the{" "}
        <Link className="text-brand underline" to="/tools/certificate-explorer">
          Certificate Explorer
        </Link>
        .
      </>
    ),
  },
  {
    question: "How do I verify a video transcript?",
    answer: (
      <>
        Replay the original at the relevant timecode, check nearby context, and confirm the speaker.
        Automated transcripts often mishear names and technical terms. See the{" "}
        <Link className="text-brand underline" to="/video-research">
          Video Research guide
        </Link>
        .
      </>
    ),
  },
];

export const Route = createFileRoute("/how-to-check")({
  head: () => ({
    ...toolHead({
      path: "/how-to-check",
      name: "How to Check",
      title: "How to Check: Verification Questions & Answers | Verfiai",
      description:
        "Practical answers to common questions about checking photos, sources, quotes, statistics, and online claims.",
    }),
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: { "@type": "Answer", text: answerText(faq.answer) },
          })),
        }),
      },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <ContentPage
      title="How to Check: Practical Verification Answers"
      intro="Short, practical steps for checking information online. These methods can surface useful evidence, but no single check proves that a claim is true."
    >
      <div className="space-y-3">
        {faqs.map((faq) => (
          <PageSection key={faq.question} title={faq.question}>
            <p>{faq.answer}</p>
          </PageSection>
        ))}
      </div>
    </ContentPage>
  );
}

function answerText(node: ReactNode): string {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(answerText).join("");
  if (isValidElement<{ children?: ReactNode }>(node)) return answerText(node.props.children);
  return "";
}
