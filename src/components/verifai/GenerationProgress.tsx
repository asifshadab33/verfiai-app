import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { siteText } from "@/lib/site-i18n";
import type { Lang } from "@/lib/translations";
import { PROGRESS_LABELS, PROGRESS_STAGES, type ProgressEvent } from "@/lib/progress";

const STEPS = ["progressExtract", "progressFind", "progressCompare", "progressPrepare"] as const;

/** Timed estimates are only a no-event fallback, never evidence of a completed stage. */
export function GenerationProgress({ active, lang = "en", event }: { active: boolean; lang?: Lang; event?: ProgressEvent | null }) {
  const [step, setStep] = useState(0);
  const [fallback, setFallback] = useState(false);

  useEffect(() => {
    setStep(0); setFallback(false);
    if (!active || event) return;
    const grace = window.setTimeout(() => setFallback(true), 4000);
    const timer = window.setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 12000);
    return () => { window.clearTimeout(grace); window.clearInterval(timer); };
  }, [active, Boolean(event)]);

  if (!active) return null;
  if (event) return <div role="status" aria-live="polite" className="animate-fade-in mt-6 min-h-40 border border-border bg-card p-5">
    <p className="text-sm font-semibold" lang="en">{event.label}</p>
    <p className="mt-1 text-xs text-muted-foreground" lang="en">{event.detail}</p>
    <ol className="mt-4 space-y-2.5">{PROGRESS_STAGES.map((stage, i) => {
      const done = i < event.completedSteps;
      const current = stage === event.stage;
      return <li key={stage} className={`flex items-center gap-2.5 text-sm ${done || current ? "text-foreground" : "text-muted-foreground"}`}>
        {done ? <CheckCircle2 className="size-4 shrink-0 text-brand" aria-hidden /> : current ? <LoaderCircle className="size-4 shrink-0 animate-spin text-brand motion-reduce:animate-none" aria-hidden /> : <span className="size-4 shrink-0 rounded-full border border-border" aria-hidden />}
        <span lang="en">{PROGRESS_LABELS[stage][0]}</span>
      </li>;
    })}</ol>
    <p className="mt-4 text-xs text-muted-foreground" lang="en">{event.stage === "complete" ? "100% — result ready" : `${event.completedSteps} / 5 stages completed`}</p>
  </div>;
  if (!fallback) return <p role="status" className="mt-6 text-sm text-muted-foreground" lang="en">Waiting for live progress…</p>;
  return (
    <div role="status" aria-live="polite" className="animate-fade-in mt-6 min-h-40 border border-border bg-card p-5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" aria-hidden="true"><div className="h-full w-1/3 animate-pulse rounded-full bg-brand motion-reduce:animate-none" /></div>
      <ol className="mt-4 space-y-2.5">
        {STEPS.map((label, i) => {
          const done = false;
          const current = i === step;
          return (
            <li key={label} className={`flex items-center gap-2.5 text-sm ${done ? "text-muted-foreground" : current ? "font-medium text-foreground" : "text-muted-foreground/50"}`}>
              {done
                ? <CheckCircle2 className="size-4 shrink-0 text-brand" aria-hidden="true" />
                : current
                  ? <LoaderCircle className="size-4 shrink-0 animate-spin text-brand" aria-hidden="true" />
                  : <span className="inline-flex size-4 shrink-0 rounded-full border border-border" aria-hidden="true" />}
              <span>{siteText(lang, label)}</span>
              {current && <span className="sr-only">(in progress)</span>}
            </li>
          );
        })}
      </ol>
      <p className="mt-4 text-xs text-muted-foreground"><span lang="en">Live progress unavailable — fallback estimate. </span>{siteText(lang, "progressEstimate")}</p>
    </div>
  );
}
