import { createFileRoute } from "@tanstack/react-router";
import { ClaimSpotter } from "@/components/verifai/tools/ClaimSpotter";
import { ToolPage } from "@/components/verifai/tools/ToolPage";
import { toolHead } from "@/lib/tools/tool-head";

const meta = { path: "/tools/claim-spotter", name: "Claim Spotter", title: "Claim Spotter: Find Checkable Claims and Vague Wording | Verfiai", description: "Highlight sentences that make checkable factual claims, and flag vague attribution, absolute words and hype. Runs in your browser." };

export const Route = createFileRoute("/tools/claim-spotter")({
  head: () => toolHead(meta),
  component: Page,
});

function Page() {
  return <ToolPage
    title="Claim Spotter"
    intro="Paste an article or an AI answer to see which sentences make checkable factual claims, and where the wording is vague, absolute or hedged."
    privacy="Runs in your browser. The text you enter is not uploaded to our servers or to analytics."
    notes={[
        { title: "What it finds", body: "Claim candidates are sentences with signals such as numbers, dates, comparisons, attributions or cause-and-effect wording. It finds what is worth checking; it does not say whether it is true." },
        { title: "Limits", body: "These are English-language heuristics. They can miss claims and can flag harmless sentences, so treat the result as a starting point." },
    ]}
  >
    <ClaimSpotter />
  </ToolPage>;
}
