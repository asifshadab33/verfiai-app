import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { EvidenceStrength } from "@/lib/evidence";
import { uiText, type UiExtraKey } from "@/lib/ui-extra-i18n";

const STYLE: Record<EvidenceStrength, string> = {
  "Strong evidence": "border-success/40 bg-success/10 text-success",
  "Moderate evidence": "border-brand/40 bg-brand/10 text-brand",
  "Limited evidence": "border-border bg-muted text-muted-foreground",
  "Conflicting evidence": "border-warning/40 bg-warning/10 text-warning",
  "Insufficient evidence": "border-destructive/30 bg-destructive/10 text-destructive",
};
export const STRENGTH_HELP: Record<EvidenceStrength, string> = {
  "Strong evidence": "2+ independent publishers, at least one Tier 1 (academic, government or institutional) source, and a source from the last two years.",
  "Moderate evidence": "2+ independent publishers or at least one Tier 1 source, but not all strong-evidence conditions are met.",
  "Limited evidence": "Only one independent publisher, without a Tier 1 source.",
  "Conflicting evidence": "Independent sources disagree about this claim.",
  "Insufficient evidence": "Not enough verified evidence was found to assess the claim.",
};

const KEY: Record<EvidenceStrength, string> = { "Strong evidence": "Strong", "Moderate evidence": "Moderate", "Limited evidence": "Limited", "Conflicting evidence": "Conflicting", "Insufficient evidence": "Insufficient" };

export function StrengthBadge({ label, lang = "en" }: { label: EvidenceStrength; lang?: string }) {
  const name = uiText(lang, `s${KEY[label]}` as UiExtraKey), help = uiText(lang, `h${KEY[label]}` as UiExtraKey);
  return (
    <TooltipProvider><Tooltip><TooltipTrigger asChild>
      <button type="button" aria-label={`${name}: ${help}`} className={`inline-flex min-h-7 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STYLE[label]}`}>{name}</button>
    </TooltipTrigger><TooltipContent className="max-w-72">{help}{lang === "en" ? " Sources from the same base domain count as one voice. Tiers: 1 academic/government/institutional, 2 established press and news agencies, 3 blogs, forums and social." : ""}</TooltipContent></Tooltip></TooltipProvider>
  );
}
