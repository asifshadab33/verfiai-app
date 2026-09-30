import { CircleAlert, CircleCheck, CircleHelp, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Agreement = "high" | "mixed" | "disagreement";

const STATES: Record<Agreement, { label: string; detail: string; icon: typeof CircleCheck; iconClass: string; chipClass: string }> = {
  high: {
    label: "High Response Agreement",
    detail: "Models provided similar details",
    icon: CircleCheck,
    iconClass: "text-success",
    chipClass: "bg-success-soft",
  },
  mixed: {
    label: "Mixed Response Agreement",
    detail: "Models differed on some specifics",
    icon: CircleHelp,
    iconClass: "text-warning",
    chipClass: "bg-warning-soft",
  },
  disagreement: {
    label: "High Model Disagreement",
    detail: "Models provided conflicting information",
    icon: CircleAlert,
    iconClass: "text-destructive",
    chipClass: "bg-danger-soft",
  },
};

const TOOLTIP = "This compares how similar the AI engines' answers were to each other. Agreement between models is not evidence that a claim is true — check the sources below.";

/** Shows a measured agreement state only when one is supplied; never guesses. */
export function ResponseAgreementPanel({ state = null }: { state?: Agreement | null }) {


  const info = (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" aria-label={`About Response Agreement. ${TOOLTIP}`} className="inline-flex size-6 items-center justify-center rounded-full text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
            <Info className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-72">{TOOLTIP}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <section aria-labelledby="response-agreement-title" className="mt-5 min-h-28 border border-border bg-card p-4 print:hidden">
      <div className="flex items-center gap-2">
        <h3 id="response-agreement-title" className="text-sm font-bold">Response Agreement</h3>
        {info}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Model agreement measures similarity between AI responses. It does not establish factual accuracy.</p>
      <div className="mt-3 flex min-h-9 items-center" aria-live="polite">
        {state === null ? (
          <p className="text-sm text-muted-foreground">Not measured for this report — it was written by one engine, so there is no second answer to compare. Check the sources below.</p>
        ) : (() => {
          const s = STATES[state];
          const Icon = s.icon;
          return (
            <p className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${s.chipClass}`}>
              <Icon className={`size-4 ${s.iconClass}`} aria-hidden="true" />
              {s.label}
              <span className="font-normal text-muted-foreground">· {s.detail}</span>
            </p>
          );
        })()}
      </div>
    </section>
  );
}
