import { useState } from "react";
import { Check, Clipboard, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResearchReport } from "@/lib/report.functions";

const paras = (t: string) => (t || "").split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i} className="mt-3">{p}</p>);

export function reportToText(r: ResearchReport) {
  return `# ${r.title}\n\n## Executive summary\n${r.summary}\n\n## Background\n${r.background}\n\n## Key findings\n${r.findings.map(f => `- [${f.status}] ${f.title}: ${f.detail}`).join("\n")}\n\n## Analysis\n${r.analysis}\n\n## Sources\n${r.sources.map(s => `${s.title} — ${s.publisher}, ${s.date}\n${s.url}`).join("\n") || "None confidently identified."}\n\n## Conflicting evidence\n${r.conflictingEvidence}\n\n## Methodology\n${r.methodology}\n\n## Limitations\n${r.limitations}\n\n## Conclusion\n${r.conclusion}\n\n${r.verification === "web" ? "Web-Verified" : "Model Knowledge Only"}. Generated with: ${(r.engines ?? []).join(", ") || "AI"}. VerifAI provides verification support, not definitive truth judgments. Review sources before relying on a result.`;
}

export function ReportView({ report, date }: { report: ResearchReport; date?: string }) {
  const [copied, setCopied] = useState(false);
  const text = reportToText(report);
  const words = text.split(/\s+/).length;
  async function copy() { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } }
  function download() { const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "verifai-report.md"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  const sections: [string, string, string][] = [["summary", "Executive summary", report.summary], ["background", "Background", report.background]];
  return <article id="report-output" className="scroll-mt-28">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-brand">VerifAI · {date ?? new Date().toLocaleDateString()} · ~{Math.max(2, Math.round(words / 500))} pages</p><h2 className="mt-2 max-w-3xl font-display text-3xl font-bold">{report.title}</h2></div>
      <div className="flex gap-1 print:hidden"><Button size="icon" variant="outline" aria-label="Copy" onClick={copy}>{copied ? <Check /> : <Clipboard />}</Button><Button size="icon" variant="outline" aria-label="Download Markdown" onClick={download}><Download /></Button><Button size="icon" variant="outline" aria-label="Print or save as PDF" onClick={() => window.print()}><Printer /></Button></div></div>
    <p className="mt-5 flex flex-wrap items-center gap-3 border-l-2 border-primary bg-secondary p-4 text-sm">{report.verification === "web" ? <span className="rounded-full bg-success px-3 py-1 text-xs font-bold text-primary-foreground">Web-Verified</span> : <span className="rounded-full bg-warning px-3 py-1 text-xs font-bold text-primary-foreground">Model Knowledge Only</span>}<span>{report.verification === "web" ? "Written from live web sources fetched for this report." : "No live web sources were used."} VerifAI provides verification support, not definitive truth judgments. Review sources before relying on a result.</span></p>
    <div className="mt-9 grid gap-8 lg:grid-cols-[190px_1fr]">
      <nav aria-label="Contents" className="flex flex-col gap-3 text-sm text-muted-foreground print:hidden">{[["summary", "Summary"], ["background", "Background"], ["findings", "Key findings"], ["analysis", "Analysis"], ["sources", "Sources"], ["method", "Method & limits"]].map(([id, l]) => <a key={id} href={`#${id}`} className="hover:text-brand">{l}</a>)}</nav>
      <div className="space-y-9 text-sm leading-7">
        {sections.map(([id, h, t]) => t ? <section key={id} id={id}><h3 className="font-display text-xl font-bold">{h}</h3>{paras(t)}</section> : null)}
        <section id="findings"><h3 className="font-display text-xl font-bold">Key findings</h3><div className="mt-4 space-y-5">{report.findings.map((f, i) => <div key={i} className="border-l-2 border-border pl-4"><span className="text-xs font-bold uppercase text-brand">{f.status}</span><h4 className="font-semibold">{f.title}</h4><p className="mt-1 text-muted-foreground">{f.detail}</p></div>)}</div></section>
        {report.analysis && <section id="analysis"><h3 className="font-display text-xl font-bold">Analysis</h3>{paras(report.analysis)}</section>}
        <section id="sources"><h3 className="font-display text-xl font-bold">Sources</h3>{report.sources.length ? <ol className="mt-3 list-inside list-decimal space-y-4">{report.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">{s.title}</a> <span className="text-muted-foreground">— {s.publisher}{s.date ? `, ${s.date.slice(0, 10)}` : ""}{s.fetchedAt ? ` · fetched ${new Date(s.fetchedAt).toLocaleString()}` : " · unverified until opened"}</span>{s.snippet && <blockquote className="mt-1 border-l border-border pl-3 text-xs text-muted-foreground">"{s.snippet}…"</blockquote>}</li>)}</ol> : <p className="mt-2 text-muted-foreground">No source links were found. Do not treat uncited claims as verified.</p>}</section>
        <section><h3 className="font-display text-xl font-bold">Conflicting evidence</h3>{paras(report.conflictingEvidence)}</section>
        <section id="method"><h3 className="font-display text-xl font-bold">Methodology</h3>{paras(report.methodology)}<h3 className="mt-7 font-display text-xl font-bold">Limitations</h3>{paras(report.limitations)}<h3 className="mt-7 font-display text-xl font-bold">Conclusion</h3>{paras(report.conclusion)}</section>
        {report.engines?.length ? <footer className="border-t border-border pt-4 text-xs text-muted-foreground">Generated with: {report.engines.join(" · ")}</footer> : null}
      </div>
    </div>
  </article>;
}
