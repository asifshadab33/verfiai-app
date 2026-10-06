import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "Accuracy and Limitations | Verfiai";
const description = "How Verfiai's accuracy is measured, what has not been evaluated yet, and the known limitations of claim verification and citation checks.";

export const Route = createFileRoute("/accuracy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/accuracy" }],
  }),
  component: Accuracy,
});

function Accuracy() {
  return (
    <ContentPage
      title="Accuracy and Limitations"
      intro="We prefer published, checkable results over claimed ones. This page states what has been measured, what has not, and where the tool falls short."
    >
      <PageSection title="Public dataset evaluation">
        <p>
          We plan to evaluate Verfiai against public claim-verification datasets to monitor performance, and we
          will publish the results — dataset, number of claims, accuracy and test date — in this table when that
          evaluation has actually been run.
        </p>
        <div className="mt-5 overflow-x-auto border border-border">
          <table className="w-full min-w-[620px] text-left text-sm">
            <thead className="border-b border-border bg-secondary"><tr><th className="p-3">Dataset name</th><th className="p-3">Number of claims</th><th className="p-3">Accuracy</th><th className="p-3">Date tested</th></tr></thead>
            <tbody><tr><td className="p-3">[TO BE FILLED]</td><td className="p-3">[TO BE FILLED]</td><td className="p-3">[TO BE FILLED]</td><td className="p-3">[TO BE FILLED]</td></tr></tbody>
          </table>
        </div>
        <p className="mt-4 text-sm"><strong>No public-dataset evaluation has been completed yet.</strong> These placeholders are not results and must not be interpreted as performance claims.</p>
      </PageSection>

      <PageSection title="Known limitations">
        <ul className="list-disc space-y-2 pl-5">
          <li>Verfiai cannot read paywalled, offline, or non-indexed sources.</li>
          <li>Search coverage may miss very recent events due to indexing delays.</li>
          <li>Books, preprints, and references without a DOI may not be found during citation scans.</li>
          <li>AI engines can occasionally misinterpret nuanced evidence or context.</li>
          <li>Scanned or image-only PDFs cannot be read; paste the text instead.</li>
          <li>Verdict labels are the AI's assessment of the sources it found, not proof. Open the sources yourself before relying on a result.</li>
          <li>Outputs are decision-support tools, not definitive truth judgments.</li>
        </ul>
      </PageSection>

      <PageSection title="How verification works">
        <p>
          Reports break your question into individual claims, search the live web for evidence, and label each claim
          supported, contradicted, mixed or insufficiently evidenced. Citation checks query Crossref for retractions
          and record status. The method is described in full on the{" "}
          <Link to="/methodology" className="text-brand underline">
            methodology page
          </Link>
          .
        </p>
      </PageSection>
    </ContentPage>
  );
}
