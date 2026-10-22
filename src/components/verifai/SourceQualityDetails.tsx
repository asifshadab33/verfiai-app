import type { SourceScore } from "@/lib/evidence";
import { checkerText } from "@/lib/checker-i18n";
import { uiText } from "@/lib/ui-extra-i18n";

export function SourceQualityDetails({ quality, lang, context = "report" }: { quality?: SourceScore; lang: string; context?: "report" | "claim" }) {
  if (!quality) return null;
  const t = (key: Parameters<typeof checkerText>[1]) => context === "claim" ? checkerText(lang, key) : uiText(lang, key as Parameters<typeof uiText>[1]);
  const rows = [["scoreAuthority", `${Math.round(quality.signals.authority * 100)}/100`], ["scoreRecency", `${Math.round(quality.signals.recency * 100)}/100`], ["scoreIndependence", `${Math.round(quality.signals.independence * 100)}/100`], ["authorTransparency", t(quality.transparency)], ["directnessToClaim", t(quality.directness)], ["originalDataAvailability", t(quality.originalData)]] as const;
  const label = quality.label === "Strong" ? "sStrong" : quality.label === "Moderate" ? "sModerate" : "sLimited";
  return <details className="mt-2 text-xs text-muted-foreground">
    <summary className="min-h-11 cursor-pointer font-semibold text-brand">{t("compositeSourceScore")} · {quality.score}/100 · {uiText(lang, label)}</summary>
    <dl className="space-y-1">{rows.map(([key, value]) => <div key={key}><dt className="font-semibold">{t(key)}</dt><dd>{value}</dd></div>)}</dl>
    <p className="mt-2">{t("scoringWeights")}</p><p className="mt-1">{t("scoringCaution")}</p>
  </details>;
}