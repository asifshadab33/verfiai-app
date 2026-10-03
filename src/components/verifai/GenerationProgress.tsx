import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle } from "lucide-react";
import { siteText } from "@/lib/site-i18n";
import type { Lang } from "@/lib/translations";

const STEPS = ["progressExtract", "progressFind", "progressCompare", "progressPrepare"] as const;

/** Cycles one step forward roughly every 2.4 s while generation is running. */
export function GenerationProgress({ active, lang = "en" }: { active: boolean; lang?: Lang }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!active) { setStep(0); return; }
    const timer = window.setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 12000);
    return () => window.clearInterval(timer);
  }, [active]);

  if (!active) return null;
  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div role="status" aria-live="polite" className="animate-fade-in mt-6 min-h-40 border border-border bg-card p-5">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-brand transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
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
      <p className="mt-4 text-xs text-muted-foreground">{siteText(lang, "progressEstimate")}</p>
    </div>
  );
}
