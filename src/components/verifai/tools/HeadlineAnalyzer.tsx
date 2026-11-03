import { useDeferredValue, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeHeadline, type CheckStatus } from "@/lib/tools/headline-analyzer";

const SAMPLE =
  "You Won't Believe What Doctors Say About Coffee!!\nStudy finds coffee linked to 12% lower risk of liver disease\nVitamin D always cures colds, scientists say";
const STATUS: Record<CheckStatus, { label: string; cls: string }> = {
  good: { label: "Good", cls: "bg-success-soft text-success border-success/30" },
  warn: { label: "Review", cls: "bg-warning-soft text-warning border-warning/40" },
  note: { label: "Note", cls: "bg-secondary text-foreground border-border" },
};

export function HeadlineAnalyzer() {
  const [text, setText] = useState("");
  const deferred = useDeferredValue(text);
  const reports = useMemo(
    () =>
      deferred
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .slice(0, 10)
        .map(analyzeHeadline),
    [deferred],
  );
  return (
    <section
      aria-label="Headline analyzer"
      className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8"
    >
      <label htmlFor="ha-text" className="block text-sm font-semibold">
        Headlines (one per line, up to 10)
      </label>
      <Textarea
        id="ha-text"
        dir="auto"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={3000}
        className="mt-2 min-h-28 bg-background"
        placeholder="Paste a headline…"
      />
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <button type="button" className="text-brand underline" onClick={() => setText(SAMPLE)}>
          Try an example
        </button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => setText("")}
          disabled={!text}
        >
          Clear
        </Button>
      </div>
      <div className="mt-5 space-y-4">
        {reports.map((r, i) => (
          <article key={i} className="rounded-xl border border-border bg-background p-4">
            <h2 className="font-display text-lg font-bold [overflow-wrap:anywhere]">
              {r.headline}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {r.characters} characters · {r.words} words · {r.good} checks look good, {r.warnings}{" "}
              to review
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {r.checks.map((c) => (
                <li key={c.id} className="flex flex-wrap items-start gap-2">
                  <span
                    className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS[c.status].cls}`}
                  >
                    {STATUS[c.status].label}
                  </span>
                  <span>
                    <strong>{c.label}.</strong>{" "}
                    <span className="text-muted-foreground">{c.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
