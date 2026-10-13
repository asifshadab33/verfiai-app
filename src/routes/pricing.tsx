import { createFileRoute, Link } from "@tanstack/react-router";
import { ContentPage, PageSection } from "@/components/verifai/ContentPage";
import { CommunityWaitlist } from "@/components/verifai/CommunityWaitlist";
import { Button } from "@/components/ui/button";
import { PricingTiers } from "@/components/verifai/PricingTiers";

const title = "Community Access — Free until October 13, 2027 | Verfiai";
const description = "Verfiai is free until October 13, 2027 under fair-use limits and extended-access requests for researchers and educators.";
export const Route = createFileRoute("/pricing")({
  head: () => ({ meta: [{ title }, { name: "description", content: description }, { property: "og:title", content: title }, { property: "og:description", content: description }, { property: "og:type", content: "website" }, { property: "og:url", content: "https://verfiai.app/pricing" }, { name: "twitter:card", content: "summary" }], links: [{ rel: "canonical", href: "https://verfiai.app/pricing" }] }),
  component: CommunityAccess,
});

function CommunityAccess() {
  return <ContentPage title="Free Access for the Community" intro="All current features are free from October 13, 2026 until October 13, 2027. Fair-use limits apply. No credit card required.">
    <div className="grid gap-10 md:grid-cols-2">
      <div>
        <PageSection title="Plans during the launch period"><PricingTiers /></PageSection>
        <PageSection title="Our one-year free pledge"><p>Research should be open to everyone. Use Verfiai’s research reports, factual claim checks and citation checker without paying until October 13, 2027.</p></PageSection>
        <PageSection title="Fair use keeps Verfiai available"><p>Reasonable rate limits apply to protect service availability. Current allowances are 3 reports, 3 fact-checks and 3 citation scans per month with a free account, with up to 20 references per scan. You can try each tool once without an account. These safeguards remain in place; free access is not unlimited access.</p><p className="mt-3">Community exports retain the Verfiai watermark.</p></PageSection>
        <Button asChild><Link to="/">Start researching free</Link></Button>
      </div>
      <div className="border-t border-border pt-8"><CommunityWaitlist /></div>
      <div id="analyst" className="border-t border-border pt-8"><CommunityWaitlist interest="analyst" /></div>
    </div>
    <PageSection title="Extended access for research and education"><p>Academic, educator and high-volume research users can reach out to <a href="mailto:hello@verfiai.app" className="text-brand underline">hello@verfiai.app</a> to request extended access. Tell us about your research needs and expected volume.</p></PageSection>
  </ContentPage>;
}
