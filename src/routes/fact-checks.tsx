import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContentPage } from "@/components/verifai/ContentPage";
import { CLAIMS, claimCategories, VERDICT_LABEL, type ClaimVerdict } from "@/data/claims";

export const Route = createFileRoute("/fact-checks")({
  head: () => ({
    meta: [
      { title: "Fact checks: common myths and claims | Verfiai" },
      {
        name: "description",
        content:
          "Browse Verfiai's fact checks of popular science, health, history and money claims, filtered by category and verdict.",
      },
      { property: "og:title", content: "Fact checks | Verfiai" },
      {
        property: "og:description",
        content: "Common myths and claims, with verdicts and evidence summaries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://verfiai.app/fact-checks" }],
  }),
  component: FactChecks,
});

function FactChecks() {
  const [cat, setCat] = useState("all");
  const [verdict, setVerdict] = useState<"all" | ClaimVerdict>("all");
  const list = CLAIMS.filter(
    (c) => (cat === "all" || c.category === cat) && (verdict === "all" || c.verdict === verdict),
  );
  return (
    <ContentPage
      title="Fact checks"
      intro="Popular claims with a verdict and short evidence summary. These are editorial summaries — run any claim through the live checker for current sources."
    >
      <div className="flex flex-wrap gap-2" role="group" aria-label="Category">
        {["all", ...claimCategories()].map((c) => (
          <Button
            key={c}
            size="sm"
            variant={cat === c ? "default" : "outline"}
            aria-pressed={cat === c}
            onClick={() => setCat(c)}
            className="capitalize"
          >
            {c === "all" ? "All categories" : c}
          </Button>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Verdict">
        {(["all", "supported", "contradicted", "mixed"] as const).map((v) => (
          <Button
            key={v}
            size="sm"
            variant={verdict === v ? "default" : "outline"}
            aria-pressed={verdict === v}
            onClick={() => setVerdict(v)}
          >
            {v === "all" ? "All verdicts" : VERDICT_LABEL[v]}
          </Button>
        ))}
      </div>
      <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
        {list.length} fact checks
      </p>
      <ul className="mt-4 grid gap-3 md:grid-cols-2">
        {list.map((c) => (
          <li key={c.slug} className="border border-border bg-card p-4">
            <Link
              to="/fact-check/$slug"
              params={{ slug: c.slug }}
              className="font-semibold hover:text-brand"
            >
              {c.claim}
            </Link>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-semibold">{VERDICT_LABEL[c.verdict]}</span> ·{" "}
              <span className="capitalize">{c.category}</span> · {c.difficulty}
            </p>
          </li>
        ))}
      </ul>
    </ContentPage>
  );
}
