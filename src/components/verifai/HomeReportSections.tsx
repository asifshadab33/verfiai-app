import { recentText } from "@/lib/recent-i18n";
import type { Lang } from "@/lib/translations";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Pill, type ClaimState } from "./HomeClaimPill";

const SAMPLE_CLAIMS: {
  claim: string;
  s: ClaimState;
  strength: string;
  count: number;
  quality: string;
  excerpt: string;
  pub: string;
  conflict?: string;
}[] = [
  {
    claim: "Global EV sales passed 10 million in 2022.",
    s: "supported",
    strength: "Strong",
    count: 3,
    quality: "Government or intergovernmental source",
    excerpt: "“Electric car sales exceeded 10 million in 2022.”",
    pub: "Example intergovernmental agency · 2023-04-26",
  },
  {
    claim: "The new battery doubles range at the same cost.",
    s: "insufficient",
    strength: "Weak",
    count: 1,
    quality: "Organization/publication source",
    excerpt: "“Prototype cells showed promising density gains.”",
    pub: "Example company blog · 2024-02-01",
  },
  {
    claim: "Charging stations outnumber petrol stations in Norway.",
    s: "review",
    strength: "Moderate",
    count: 2,
    quality: "Reputable news source",
    excerpt: "“Public chargers now exceed fuel pumps in several regions.”",
    pub: "Example news outlet · 2024-06-10",
    conflict:
      "“Nationwide, fuel stations still outnumber charging sites.” — Example statistics office · 2024-05-02",
  },
  {
    claim: "EVs produce zero lifetime emissions.",
    s: "conflict",
    strength: "Strong",
    count: 4,
    quality: "Peer-reviewed source",
    excerpt: "“Manufacturing emissions mean lifetime emissions are lower, not zero.”",
    pub: "Example journal · 2022-11-15",
  },
];

/** Illustrative only: every value below is synthetic sample data, not a real verification. */
export function ReportProofSection({ lang = "en" }: { lang?: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return (
    <section aria-labelledby="proof-title" className="mx-auto max-w-7xl px-5 py-16">
      <h2 id="proof-title" className="font-display text-3xl font-bold">
        {t("What a real Verfiai report includes")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        <strong>{t("Illustrative sample")}</strong> —{" "}
        {t("synthetic example data showing the layout, not a real check.")}
      </p>
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-sm">
        <dl className="grid gap-3 border-b border-border pb-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-bold uppercase text-muted-foreground">
              {t("Original question")}
            </dt>
            <dd className="mt-1">
              {t("Are electric vehicles really cleaner and more practical in 2024?")}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-muted-foreground">{t("Retrieved")}</dt>
            <dd className="mt-1">2024-07-01 09:30 UTC (sample)</dd>
          </div>
          <div>
            <dt className="text-xs font-bold uppercase text-muted-foreground">{t("Sources")}</dt>
            <dd className="mt-1">{t("10 sources, 8 independent domains")}</dd>
          </div>
        </dl>
        <h3 className="mt-4 font-display text-lg font-bold">{t("Extracted claims")}</h3>
        <ul className="mt-3 space-y-4">
          {SAMPLE_CLAIMS.map((c) => (
            <li key={c.claim} className="border-s-2 border-border ps-4">
              <div className="flex flex-wrap items-center gap-2">
                <Pill s={c.s} lang={lang} />
                <span className="text-xs font-semibold">
                  {t("Evidence strength")}: {t(c.strength)}
                </span>
                <span className="text-xs text-muted-foreground">
                  · {recentText(lang, "Sources: {count}", { count: c.count })} · {t(c.quality)}
                </span>
              </div>
              <p className="mt-1 font-medium">{t(c.claim)}</p>
              <div className={c.conflict ? "mt-2 grid gap-2 md:grid-cols-2" : "mt-2"}>
                <blockquote className="border border-border bg-background p-2 text-xs text-muted-foreground">
                  {t(c.excerpt)}
                  <span className="mt-1 block">{t(c.pub)}</span>
                </blockquote>
                {c.conflict && (
                  <blockquote className="border border-destructive/30 bg-background p-2 text-xs text-muted-foreground">
                    <span className="font-semibold text-destructive">
                      {t("Conflicting excerpt")}:{" "}
                    </span>
                    {t(c.conflict)}
                  </blockquote>
                )}
              </div>
            </li>
          ))}
        </ul>
        <h3 className="mt-5 font-display text-lg font-bold">
          {t("Limitations and open questions")}
        </h3>
        <p className="mt-1 text-muted-foreground">
          {t("Paywalled studies were not read; regional charging data may lag by months.")}
        </p>
        <p className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
          <span className="rounded-full border border-border px-3 py-1">
            {t("Export: Word · Markdown · PDF")}
          </span>
          <span className="rounded-full border border-border px-3 py-1">{t("Share link")}</span>
        </p>
      </div>
    </section>
  );
}

export function CitationFeature({ onScan, lang = "en" }: { onScan: () => void; lang?: Lang }) {
  const t = (text: string) => recentText(lang, text);
  return (
    <section aria-labelledby="cite-title" className="border-y border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-5 py-16">
        <h2 id="cite-title" className="font-display text-3xl font-bold">
          {t("Check references before submission")}
        </h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          {t(
            "Paste a reference list or upload a document. Verfiai checks metadata, missing details, retraction notices, and citation risks using Crossref records.",
          )}
        </p>
        <Button className="mt-6" onClick={onScan}>
          {t("Scan a reference list")}
          <ArrowRight />
        </Button>
      </div>
    </section>
  );
}
