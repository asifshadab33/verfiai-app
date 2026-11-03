import type { SourceScore } from "@/lib/evidence";
import { checkerText } from "@/lib/checker-i18n";
import { uiText } from "@/lib/ui-extra-i18n";

export function SourceQualityDetails({
  quality,
  lang,
  context = "report",
}: {
  quality?: SourceScore | undefined;
  lang: string;
  context?: "report" | "claim";
}) {
  if (!quality) return null;
  const t = (key: Parameters<typeof checkerText>[1]) =>
    context === "claim"
      ? checkerText(lang, key)
      : uiText(lang, key as Parameters<typeof uiText>[1]);
  const value = (n: number) => `${Math.round(n * 100)}/100`;
  const rows = [
    ["scoreAuthority", value(quality.signals.authority)],
    [
      "scoreRecency",
      `${value(quality.signals.recency)}${quality.signals.recency === 0.5 ? ` · ${t("unknown")}` : ""}`,
    ],
    ["scoreIndependence", `${value(quality.signals.independence)} · ${t("independenceEstimate")}`],
    ["authorTransparency", `${value(quality.signals.transparency)} · ${t(quality.transparency)}`],
    ["directnessToClaim", `${value(quality.signals.directness)} · ${t(quality.directness)}`],
    [
      "originalDataAvailability",
      `${value(quality.signals.originalData)} · ${t(quality.originalData)}`,
    ],
  ] as const;
  return (
    <details className="mt-2 text-xs text-muted-foreground">
      <summary className="min-h-11 cursor-pointer font-semibold text-brand">
        {t("compositeSourceScore")} · {quality.score}/100 · {quality.label}
      </summary>
      <dl className="space-y-1">
        {rows.map(([key, value]) => (
          <div key={key}>
            <dt className="font-semibold">{t(key)}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-2">{t("scoringWeights")}</p>
      <p className="mt-1">{t("scoringCaution")}</p>
    </details>
  );
}
