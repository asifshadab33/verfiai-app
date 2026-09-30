import { useEffect, useState } from "react";
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

/**
 * Mock agreement indicator: randomly assigns one of three states per report
 * to demonstrate the UI. A real cross-model comparison will replace this.
 */
export function ResponseAgreementPanel() {
  const [state, setState] = useState<Agreement | null>(null);

  useEffect(() => {
    const states: Agreement[] = ["high", "mixed", "disagreement"];
    const t = window.setTimeout(() => setState(states[Math.floor(Math.random() * states.length)]), 900);
    return () => window.clearTimeout(t);
  }, []);

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
          <div role="status" aria-label="Measuring response agreement" className="flex w-full items-center gap-3">
            <span className="size-6 animate-pulse rounded-full bg-muted" />
            <span className="h-4 w-56 max-w-full animate-pulse rounded bg-muted" />
          </div>
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
