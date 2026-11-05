import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";

const title = "How Verfiai works";
const description =
  "See how Verfiai searches public sources, evaluates claims, checks citations and creates reports with a reviewable evidence trail.";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      {
        property: "og:description",
        content: "From a research question to source-linked findings you can inspect.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/how-it-works" }],
  }),
  component: How,
});

function How() {
  return (
    <ContentPage
      title="From a question to evidence you can inspect"
      intro="Verfiai brings research, claim verification and citation checks into one workspace. It searches available public sources when you submit a request, then uses AI to organize and assess the material. The result is decision support—not a definitive truth judgment."
    >
      <PageSection title="01 / Choose the job you need to do">
        <p>
          Use Research report for a question or topic, Claim check for factual statements in
          text or an article, Citation checker for a reference list, or Deep Dossier when you
          need broader source and document discovery. Each workflow has a different purpose;
          a citation lookup is not the same as checking whether a source supports a claim.
        </p>
        <p className="mt-3">
          <Link to="/" className="font-semibold text-brand underline">
            Open the Verfiai workspace
          </Link>{" "}
          to choose a workflow.
        </p>
      </PageSection>

      <PageSection title="02 / Submit a focused question or document">
        <p>
          Describe the question, claim or research task in your own words. For reports, you can
          add context such as a company, website, industry, competitors or specific data needs.
          Supported report attachments include .txt, .md, .csv, .docx and .pdf files up to 5 MB.
          Keep the question focused and identify the geography, time period and audience when
          those details matter.
        </p>
        <p className="mt-3">
          Research reports require a signed-in account. Claim checks and citation scans can be
          used without signing in, subject to the published fair-use limits.
        </p>
      </PageSection>

      <PageSection title="03 / Verfiai searches available sources">
        <p>
          When you submit a research report or claim check, Verfiai searches the public sources
          available to the relevant workflow and configuration. Depending on the request, these
          can include web and news search, academic indexes, public datasets, reference
          registries and professional fact-check records. Results are deduplicated and ranked
          before relevant excerpts are passed to AI models for assessment. Not every provider
          is contacted for every request, and search coverage is not complete.
        </p>
      </PageSection>

      <PageSection title="04 / Review claims, evidence and disagreement">
        <p>
          Reports organize findings into individual factual claims and show available source
          links, excerpts, dates and evidence context. Claim findings may be labelled Supported,
          Contradicted, Mixed evidence or Insufficient evidence. Credible disagreement should
          remain visible as mixed evidence rather than being hidden behind a single confident
          answer. If AI evaluation is unavailable, source links alone do not establish a verdict.
        </p>
        <p className="mt-3">
          Evidence strength reflects factors such as source quality, independence, recency,
          directness and consistency. It is not a probability that a claim is true, and agreement
          between AI models is not independent proof.
        </p>
      </PageSection>

      <PageSection title="05 / Check references and export your work">
        <p>
          The Citation checker looks up reference metadata and available retraction or
          withdrawal notices, primarily through Crossref. Coverage is incomplete: a reference
          that is not found is not automatically fabricated, and a matching record does not
          prove that the source supports the statement. Open the original publication and
          inspect it yourself.
        </p>
        <p className="mt-3">
          Signed-in research reports are saved to the account that created them and can be
          managed from My reports. Depending on the report and account features, you can export
          the report or create and later disable a read-only share link. Guest claim checks and
          citation scans are not saved to an account history.
        </p>
      </PageSection>

      <PageSection title="Important limitations and privacy">
        <p>
          Verfiai cannot reliably read paywalled, offline or non-indexed sources. Search
          indexing can lag, excerpts can omit context, and AI systems can misinterpret nuanced
          evidence. Do not submit confidential, regulated, unpublished or sensitive personal
          material: submitted text and extracted document content may be processed by configured
          search and AI providers. Third-party retention and training practices are governed by
          those providers' policies.
        </p>
        <p className="mt-3">
          Read the{" "}
          <Link to="/methodology" className="font-semibold text-brand underline">
            verification methodology
          </Link>
          ,{" "}
          <Link to="/accuracy" className="font-semibold text-brand underline">
            accuracy and limitations
          </Link>{" "}
          and{" "}
          <Link to="/privacy" className="font-semibold text-brand underline">
            privacy notice
          </Link>{" "}
          before using results for important decisions.
        </p>
      </PageSection>
    </ContentPage>
  );
}
