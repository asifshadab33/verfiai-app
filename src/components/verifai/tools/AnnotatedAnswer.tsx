import type { ReactNode } from "react";
import { annotateText, evidenceCoverage, type Verdict } from "@/lib/tools/claim-highlight";

const MARK: Record<Verdict, { label: string; icon: string; mark: string; bar: string }> = {
  SUPPORTED: { label: "Supported", icon: "✓", mark: "bg-success-soft", bar: "bg-success" },
  CONTRADICTED: { label: "Contradicted", icon: "✕", mark: "bg-danger-soft underline decoration-destructive", bar: "bg-destructive" },
  MIXED: { label: "Mixed evidence", icon: "~", mark: "bg-warning-soft underline decoration-warning decoration-dashed", bar: "bg-warning" },
  UNVERIFIABLE: { label: "Not enough evidence", icon: "?", mark: "bg-secondary underline decoration-muted-foreground decoration-dotted", bar: "bg-muted-foreground/40" },
};
const ORDER: Verdict[] = ["SUPPORTED", "CONTRADICTED", "MIXED", "UNVERIFIABLE"];

/** Shows the pasted text with each checked sentence marked by its verdict. Marks are never colour-only. */
export function AnnotatedAnswer({ text, claims }: { text: string; claims: { claim: string; verdict: Verdict }[] }) {
  const cov = evidenceCoverage(claims);
  if (!cov.total) return null;
  const { sentences, unmatched } = annotateText(text, claims);
  const count: Record<Verdict, number> = { SUPPORTED: cov.supported, CONTRADICTED: cov.contradicted, MIXED: cov.mixed, UNVERIFIABLE: cov.insufficient };
  const body: ReactNode[] = [];
  let pos = 0;
  sentences.forEach((s, k) => {
    if (s.start > pos) body.push(text.slice(pos, s.start));
    if (s.verdict) {
      const m = MARK[s.verdict];
      body.push(<mark key={k} className={`rounded px-0.5 text-foreground ${m.mark}`}><span className="sr-only">{m.label}: </span>{s.text}<sup className="ms-0.5 text-[10px] font-semibold">{m.icon}{s.claims.map(i => <a key={i} href={`#claim-${i}`} className="ms-0.5 underline" aria-label={`Go to claim ${i + 1}`}>{i + 1}</a>)}</sup></mark>);
    } else body.push(s.text);
    pos = s.end;
  });
  if (pos < text.length) body.push(text.slice(pos));
  return <section aria-label="Your text, marked" className="rounded-2xl border border-border bg-card p-5">
    <h3 className="font-display text-lg font-bold">Your text, marked</h3>
    <p className="mt-1 text-sm">{cov.supported} of {cov.total} claims have supporting evidence in the sources found; {cov.needsReview} need your review.</p>
    <div role="img" aria-label={ORDER.map(v => `${count[v]} ${MARK[v].label.toLowerCase()}`).join(", ")} className="mt-3 flex h-3 overflow-hidden rounded-full bg-secondary">
      {ORDER.map(v => count[v] ? <span key={v} className={MARK[v].bar} style={{ width: `${(count[v] / cov.total) * 100}%` }} /> : null)}
    </div>
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">{ORDER.map(v => <li key={v}><span className={`rounded px-1 ${MARK[v].mark}`}>{MARK[v].icon}</span> {MARK[v].label} ({count[v]})</li>)}</ul>
    <div dir="auto" className="mt-4 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere]">{body}</div>
    {unmatched.length > 0 && <p className="mt-3 text-xs text-muted-foreground">{unmatched.length} checked claim{unmatched.length === 1 ? "" : "s"} could not be matched to a single sentence; see the full list below.</p>}
    <p className="mt-3 text-xs text-muted-foreground">Marks show the evidence found for each claim. They do not show whether the whole text is true, or whether an AI wrote it. Open the sources before relying on a result.</p>
  </section>;
}
