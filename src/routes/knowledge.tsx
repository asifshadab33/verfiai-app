import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { ResourceBrowse } from "@/components/verifai/ResourceBrowse";
import { FeatureGate } from "@/components/verifai/FeatureGate";
import { useSiteLocale } from "@/lib/locale";

const title = "Open Global Knowledge Index | Verfiai";
const description =
  "Explore publisher-linked research and open publications with transparent source and reuse information.";
export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Knowledge,
});
function Knowledge() {
  const { lang } = useSiteLocale();
  return (
    <ContentPage
      lang={lang}
      title="Open Global Knowledge Index"
      intro="Explore source-linked reports, research publications, policy documents, academic resources, and public data from around the world."
    >
      <p className="mb-8 text-sm text-muted-foreground">
        Every curated resource shows its publisher, original source, licence or reuse conditions,
        and latest verification date. Publisher-search results show only metadata until reviewed;
        they are not hosted here.
      </p>
      <FeatureGate flag="OPEN_KNOWLEDGE_INDEX_ENABLED" title="The Open Knowledge Index">
        <ResourceBrowse kind="index" />
      </FeatureGate>
      <PageSection title="Source and rights">
        <p>
          Links lead to the original publishers. Availability does not grant permission to reproduce
          or redistribute a work. Verify reuse terms with each publisher. For Verfiai-created
          briefs, browse the{" "}
          <Link to="/resources" className="text-brand underline">
            Evidence Library
          </Link>
          .
        </p>
      </PageSection>
    </ContentPage>
  );
}
