import { Check, CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
import { siteText } from "@/lib/site-i18n";
import type { Lang } from "@/lib/translations";
export type ClaimState = "supported" | "review" | "conflict" | "insufficient";
const CLAIM_STYLE: Record<ClaimState, { label: string; cls: string; Icon: typeof Check }> = {
  supported: { label: "Supported", cls: "bg-success-soft text-success border-success/30", Icon: CheckCircle2 },
  review: { label: "Mixed Evidence", cls: "bg-warning-soft text-warning border-warning/40", Icon: AlertTriangle },
  conflict: { label: "Contradicted", cls: "bg-danger-soft text-destructive border-destructive/30", Icon: XCircle },
  insufficient: { label: "Insufficient Evidence", cls: "bg-muted text-muted-foreground border-border", Icon: HelpCircle },
};
export const Pill = ({ s, lang }: { s: ClaimState; lang: Lang }) => { const { label, cls, Icon } = CLAIM_STYLE[s]; return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${cls}`}><Icon className="size-3" />{siteText(lang, ({ supported: "verdictSupported", review: "verdictMixed", conflict: "verdictContradicted", insufficient: "verdictInsufficient" } as const)[s])}</span>; };

