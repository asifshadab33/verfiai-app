import { useDeferredValue, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { spotClaims, spotWording, type WordingCategory, type WordingMatch } from "@/lib/tools/claim-spotter";
import { CopyButton } from "./CopyButton";

const SAMPLE = "The company reported revenue of $4.2 billion in 2023, up 12% from the year before. Experts say it is the best phone ever made. Studies show customers always prefer it. The new model might help, reportedly. I think the design is lovely.";
const CLS: Record<WordingCategory, string> = {
  "vague-attribution": "bg-warning-soft underline decoration-warning decoration-wavy",
  "absolute-or-hype": "bg-danger-soft underline decoration-destructive",
  hedge: "bg-secondary underline decoration-dotted",
};
const LABEL: Record<WordingCategory, string> = { "vague-attribution": "vague attribution", "absolute-or-hype": "absolute or hype wording", hedge: "hedge" };

function renderRange(text: string, from: number, to: number, wording: WordingMatch[], key: string): ReactNode[] {
  const out: ReactNode[] = [];
  let pos = from;
  wording.forEach((w, i) => {
    if (w.start < pos || w.end > to) return;
    if (w.start > pos) out.push(text.slice(pos, w.start));
    out.push(<mark key={`${key}-${i}`} className={`rounded px-0.5 text-foreground ${CLS[w.category]}`}>{w.text}<span className="sr-only"> ({LABEL[w.category]})</span></mark>);
    pos = w.end;
  });
  if (pos < to) out.push(text.slice(pos, to));
  return out;
}

export function ClaimSpotter() {
  const [text, setText] = useState("");
  const [showWording, setShowWording] = useState(true);
  const [showHedges, setShowHedges] = useState(false);
  const deferred = useDeferredValue(text);
  const claims = useMemo(() => spotClaims(deferred), [deferred]);
  const wording = useMemo(() => spotWording(deferred).filter(w => showWording && (showHedges || w.category !== "hedge")), [deferred, showWording, showHedges]);
  const body: ReactNode[] = [];
  let pos = 0;
  claims.forEach((c, i) => {
    if (c.start > pos) body.push(...renderRange(deferred, pos, c.start, wording, `g${i}`));
    body.push(<span key={`c${i}`} className="rounded bg-brand-soft px-0.5 underline decoration-brand underline-offset-4">{renderRange(deferred, c.start, c.end, wording, `c${i}`)}<sup className="ms-0.5 text-[10px] font-semibold">{i + 1}</sup></span>);
    pos = c.end;
  });
  if (pos < deferred.length) body.push(...renderRange(deferred, pos, deferred.length, wording, "tail"));
  const copyText = claims.map((c, i) => `${i + 1}. ${c.text}`).join("\n");
  return <section aria-label="Claim spotter" className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
    <label htmlFor="cs-text" className="block text-sm font-semibold">Text to scan</label>
    <Textarea id="cs-text" dir="auto" value={text} onChange={e => setText(e.target.value)} maxLength={30000} className="mt-2 min-h-44 bg-background" placeholder="Paste an article, report or AI answer…" />
    <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
      <button type="button" className="text-brand underline" onClick={() => setText(SAMPLE)}>Try an example</button>
      <span>{text.length.toLocaleString()} / 30,000</span>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <label className="flex items-center gap-2"><input type="checkbox" checked={showWording} onChange={e => setShowWording(e.target.checked)} className="size-4 accent-primary" />Mark vague or absolute wording</label>
      <label className="flex items-center gap-2"><input type="checkbox" checked={showHedges} disabled={!showWording} onChange={e => setShowHedges(e.target.checked)} className="size-4 accent-primary" />Also mark hedges (may, might, could)</label>
      <Button type="button" size="sm" variant="outline" onClick={() => setText("")} disabled={!text}>Clear</Button>
    </div>
    {deferred.trim() && <div className="mt-6 space-y-4" role="region" aria-label="Scan result">
      <p className="text-sm"><strong>{claims.length}</strong> sentence{claims.length === 1 ? "" : "s"} look{claims.length === 1 ? "s" : ""} checkable{showWording ? <> · <strong>{wording.length}</strong> wording flag{wording.length === 1 ? "" : "s"}</> : null}</p>
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        <li><span className="rounded bg-brand-soft px-1 underline decoration-brand">numbered</span> checkable claim</li>
        <li><span className="rounded bg-warning-soft px-1">vague</span> attribution</li>
        <li><span className="rounded bg-danger-soft px-1">absolute</span> or hype</li>
        {showHedges && <li><span className="rounded bg-secondary px-1">hedge</span></li>}
      </ul>
      <div dir="auto" className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl border border-border bg-background p-4 text-sm leading-7 [overflow-wrap:anywhere]">{body}</div>
      {claims.length > 0 && <div>
        <h3 className="font-display text-lg font-bold">Claims worth checking</h3>
        <ol className="mt-2 space-y-2 text-sm">{claims.map((c, i) => <li key={i} className="rounded-xl border border-border bg-background p-3"><p className="[overflow-wrap:anywhere]">{c.text}</p><p className="mt-1 text-xs text-muted-foreground">{c.strength === "strong" ? "Strong" : "Likely"} candidate · {c.signals.join(", ")}</p></li>)}</ol>
        <div className="mt-3 flex flex-wrap items-center gap-3"><CopyButton text={copyText} label="Copy these claims" /><Link to="/fact-checker" className="text-sm font-semibold text-brand underline">Check them against sources</Link></div>
      </div>}
      <p className="text-xs text-muted-foreground">This highlights what is worth checking. It does not say whether anything is true.</p>
    </div>}
  </section>;
}
