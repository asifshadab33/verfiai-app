import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ContentPage } from "@/components/verifai/ContentPage";
import { ReportView } from "@/components/verifai/ReportView";
import { useAuth } from "@/hooks/useAuth";
import { generateReport, generateGuestReport, type ResearchReport } from "@/lib/report.functions";

type Kind = "summary" | "deep" | "matrix";
const KINDS: { id: Kind; label: string; hint: string }[] = [
  { id: "summary", label: "Executive Summary", hint: "A concise, source-linked brief." },
  { id: "deep", label: "Deep Dive", hint: "Extended multi-pass report with background, timeline, blind spots and a search audit log." },
  { id: "matrix", label: "Evidence Matrix", hint: "Each finding mapped against the sources it cites." },
];

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [
    { title: "Research reports with citations | Verfiai" },
    { name: "description", content: "Generate an Executive Summary, Deep Dive or Evidence Matrix with source links and a search audit trail." },
    { property: "og:title", content: "Research reports with citations | Verfiai" },
    { property: "og:description", content: "Executive Summary, Deep Dive and Evidence Matrix reports with citations and audit trails." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Research,
});

/** Citation markers like [1] or [2, 3] in a finding's text, mapped to 0-based source indexes. */
export function citedIndexes(text: string): number[] {
  const out = new Set<number>();
  for (const m of text.matchAll(/\[(\d+(?:\s*,\s*\d+)*)\]/g)) for (const n of m[1]!.split(",")) out.add(Number(n.trim()) - 1);
  return [...out].filter(n => n >= 0);
}

function Matrix({ report }: { report: ResearchReport }) {
  return <div className="overflow-x-auto"><table className="w-full border-collapse text-sm">
    <thead><tr><th className="border border-border p-2 text-start">Finding</th>{report.sources.map((s, i) => <th key={s.url} className="border border-border p-2" title={s.title}><a href={s.url} target="_blank" rel="noreferrer" className="text-brand underline">[{i + 1}]</a></th>)}</tr></thead>
    <tbody>{report.findings.map(f => { const c = citedIndexes(f.detail); return <tr key={f.title}><td className="border border-border p-2"><span className="font-semibold">{f.title}</span><span className="ms-2 text-xs text-muted-foreground">({f.status})</span></td>{report.sources.map((s, i) => <td key={s.url} className="border border-border p-2 text-center">{c.includes(i) ? <span aria-label="cited">●</span> : <span className="text-muted-foreground" aria-label="not cited">·</span>}</td>)}</tr>; })}</tbody>
  </table><p className="mt-2 text-xs text-muted-foreground">● means the finding cites that source. A citation link is not proof the source contains the quoted point — open it and check.</p></div>;
}

function Research() {
  const { user } = useAuth();
  const gen = useServerFn(generateReport), genGuest = useServerFn(generateGuestReport);
  const [kind, setKind] = useState<Kind>("summary");
  const [question, setQuestion] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ report: ResearchReport; id?: string; kind: Kind } | null>(null);
  async function run() {
    setBusy(true); setError(""); setResult(null);
    try {
      const data = { question, language: "English", mode: "Balanced" as const, task: "topic" as const, format: "extended" as const };
      const r = user ? await gen({ data }) : await genGuest({ data });
      if ("limitReached" in r) setError(r.message ?? "Limit reached.");
      else { const id = "id" in r && typeof r.id === "string" ? r.id : undefined; setResult({ report: r.report, ...(id ? { id } : {}), kind }); }
    } catch (e) { setError(e instanceof Error ? e.message : "The report could not be generated."); }
    finally { setBusy(false); }
  }
  return <ContentPage title="Research with citations" intro="Choose a format, ask a question, and get a source-linked report with its search audit trail.">
    <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="Report format">{KINDS.map(k => <button key={k.id} role="radio" aria-checked={kind === k.id} onClick={() => setKind(k.id)} className={`border p-4 text-start ${kind === k.id ? "border-brand bg-brand-soft" : "border-border bg-card"}`}><span className="font-display font-bold">{k.label}</span><span className="mt-1 block text-sm text-muted-foreground">{k.hint}</span></button>)}</div>
    <p className="mt-6 text-xs text-muted-foreground">Your submission may be processed by search and AI providers. Do not submit confidential, regulated, or unpublished material. See <Link to="/privacy" className="underline">Privacy</Link> and <Link to="/methodology" className="underline">Methodology</Link>.</p>
    <Textarea className="mt-2 min-h-32" value={question} onChange={e => setQuestion(e.target.value)} maxLength={4000} placeholder="What do you want to research?" aria-label="Research question" />
    <Button className="mt-4" disabled={busy || question.trim().length < 10} onClick={run}>{busy ? <><Loader2 className="animate-spin" /> Generating…</> : "Generate report"}</Button>
    {busy && <p className="mt-2 text-sm text-muted-foreground" aria-live="polite">{kind === "deep" ? "Deep dives can take a few minutes." : "This usually takes under a minute."}</p>}
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {result && <div className="mt-12 border-t border-border pt-8">{result.kind === "matrix" && <section className="mb-10"><h2 className="mb-4 font-display text-2xl font-bold">Evidence Matrix</h2><Matrix report={result.report} /></section>}<ReportView report={result.report} reportId={result.id} /></div>}
  </ContentPage>;
}
