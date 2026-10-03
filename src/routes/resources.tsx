import { createFileRoute } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { ResourceBrowse } from "@/components/verifai/ResourceBrowse";
const title = "Evidence Library | Verfiai";
const description =
  "Inspect source-linked Verfiai research briefs, citation reviews, and evidence maps with clear rights and limitations.";
export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Resources,
});
function Resources() {
  return (
    <ContentPage
      title="Verfiai Evidence Library"
      intro="Evidence you can inspect. Research you can reuse."
    >
      <p className="mb-8 max-w-3xl leading-7 text-muted-foreground">
        Browse source-linked verification reports, research briefs, evidence maps, citation reviews,
        policy summaries, and business intelligence reports created or licensed for use through
         Verfiai. Reviewed previews are available here; library downloads and Analyst subscriptions
         are not available yet. The existing Pro plan is unchanged.
      </p>
      <ResourceBrowse kind="library" />
      <PageSection title="Source and rights notice">
        <p>
          Verfiai reports are original evidence syntheses. Linked external sources remain the
          property of their respective publishers. Reuse of external material is subject to the
          licence and terms shown for each source.
        </p>
      </PageSection>
    </ContentPage>
  );
}
