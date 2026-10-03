import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Clipboard, Download, FileType2, Link2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResearchReport } from "@/lib/report.functions";
import { downloadDocx } from "@/lib/docx-export";
import { ResponseAgreementPanel } from "@/components/verifai/ResponseAgreementPanel";
import { disableShare, enableShare, getShareState } from "@/lib/share.functions";
import { useAuth } from "@/hooks/useAuth";
import { getSubscription } from "@/lib/payments.functions";
import { getPaddleEnvironment } from "@/lib/paddle";
import { ProCheckoutButton } from "./ProCheckoutButton";
import { reportFindingStrength } from "@/lib/evidence";

const ISSUE_EMAIL = "hello@verfiai.app";
const LIMITATION = "Evidence labels are aids to review, not proof. Search coverage is incomplete; source dates, independence and quoted claims may be inaccurate. Open the original sources before relying on a finding.";
function issueLink(claim: string) { return `mailto:${ISSUE_EMAIL}?subject=${encodeURIComponent("Verfiai report issue")}&body=${encodeURIComponent(`Finding: ${claim}\n\nWhat seems wrong? (Do not include confidential material):\n`)}`; }

function SharePanel({ id }: { id: string }) {
  const getState = useServerFn(getShareState), on = useServerFn(enableShare), off = useServerFn(disableShare);
  const [token, setToken] = useState<string | null | undefined>(undefined);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  useEffect(() => { getState({ data: { id } }).then(r => setToken(r.token)).catch(() => setToken(null)); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const link = token ? `${typeof window !== "undefined" ? window.location.origin : "https://verfiai.app"}/r/${token}` : "";
  async function toggle() {
    setBusy(true); setMsg("");
    try { const r = token ? await off({ data: { id } }) : await on({ data: { id } }); setToken(r.token); }
    catch (e) { setMsg(e instanceof Error ? e.message : "Something went wrong."); } finally { setBusy(false); }
  }
  async function copy() { try { await navigator.clipboard.writeText(link); setMsg("Link copied."); } catch { setMsg("Copy the link above."); } }
  return <div className="mt-5 border border-border bg-card p-4 text-sm print:hidden">
    <div className="flex flex-wrap items-center gap-3"><Link2 className="size-4 text-brand" /><span className="font-semibold">Share link</span><span className="text-muted-foreground">{token ? "Anyone with the link can read this report." : "Only you can see this report."}</span>
      <Button size="sm" variant={token ? "outline" : "default"} className="ml-auto" disabled={busy || token === undefined} onClick={toggle}>{token ? "Stop sharing" : "Create share link"}</Button></div>
    {token && <div className="mt-3 flex flex-wrap items-center gap-2"><input readOnly value={link} aria-label="Share link" className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-xs" onFocus={e => e.target.select()} /><Button size="sm" variant="outline" onClick={copy}><Clipboard />Copy</Button></div>}
    {msg && <p role="status" className="mt-2 text-xs text-muted-foreground">{msg}</p>}
  </div>;
}

const paras = (t: string) => (t || "").split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i} className="mt-3">{p}</p>);

export function reportToText(r: ResearchReport) {
  return `# ${r.title}\n\n## Executive summary\n${r.summary}\n\n## Background\n${r.background}\n\n## Key findings\n${r.findings.map(f => `- [${reportFindingStrength(f.status, f.detail, r.sources).label}] ${f.title}: ${f.detail}`).join("\n")}\n\n## Analysis\n${r.analysis}\n\n## Sources\n${r.sources.map(s => `${s.title} — ${s.publisher}, ${s.date}\n${s.url}`).join("\n") || "None confidently identified."}\n\n## Conflicting evidence\n${r.conflictingEvidence}\n\n## Methodology\n${r.methodology}\n\n## Limitations\n${r.limitations}\n\n${LIMITATION}\n\n## Conclusion\n${r.conclusion}\n\n${r.verification === "web" ? "Evidence-checked" : "Model Knowledge Only"}. Generated with: ${(r.engines ?? []).join(", ") || "AI"}. Verfiai provides verification support, not definitive truth judgments. Review sources before relying on a result.`;
}

export function ReportView({ report, date, reportId, readOnly }: { report: ResearchReport; date?: string | undefined; reportId?: string | undefined; readOnly?: boolean }) {
  const [wordBusy, setWordBusy] = useState(false);
  const { user } = useAuth();
  const getPlan = useServerFn(getSubscription);
  const [pro, setPro] = useState(false);
  useEffect(() => { if (!user || readOnly) return; getPlan({ data: { environment: getPaddleEnvironment() } }).then(r => setPro(r.isPro)).catch(() => setPro(false)); }, [user?.id, readOnly]); // eslint-disable-line react-hooks/exhaustive-deps
  async function word() { setWordBusy(true); try {
    // Recheck at export time; a stale browser flag never removes the watermark.
    const paid = user && !readOnly ? (await getPlan({ data: { environment: getPaddleEnvironment() } })).isPro : false;
    await downloadDocx(report, { watermark: !paid });
  } finally { setWordBusy(false); } }
  const [copied, setCopied] = useState(false);
  const text = reportToText(report);
  const words = text.split(/\s+/).length;
  async function copy() { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } }
  function download() { const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" })); const a = document.createElement("a"); a.href = url; a.download = "verifai-report.md"; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
  const sections: [string, string, string][] = [["summary", "Executive summary", report.summary], ["background", "Background", report.background]];
  return <article id="report-output" className="scroll-mt-28">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-brand">Verfiai · {date ?? new Date().toLocaleDateString()} · ~{Math.max(2, Math.round(words / 500))} pages</p><h2 className="mt-2 max-w-3xl font-display text-3xl font-bold">{report.title}</h2></div>
      <div className="flex gap-1 print:hidden"><Button size="icon" variant="outline" aria-label="Copy" onClick={copy}>{copied ? <Check /> : <Clipboard />}</Button><Button variant="outline" onClick={word} disabled={wordBusy}><FileType2 />Word</Button><Button size="icon" variant="outline" aria-label="Download Markdown" title="Download Markdown" onClick={download}><Download /></Button><Button size="icon" variant="outline" aria-label="Print or save as PDF" onClick={() => window.print()}><Printer /></Button></div></div>
    {!readOnly && !pro && <div role="note" className="mt-5 flex flex-wrap items-center gap-3 border border-warning/40 bg-warning-soft p-3 text-sm text-foreground print:hidden"><span>Upgrade to Pro ($9/mo) to remove the Verfiai watermark and unlock 50 reports/month.</span><ProCheckoutButton /></div>}
    {!pro && <div aria-hidden className="pointer-events-none fixed inset-0 z-50 hidden items-center justify-center print:flex"><span className="-rotate-45 whitespace-nowrap text-6xl font-bold text-muted-foreground/25">Generated by Verfiai (Free Tier)</span></div>}
    <ResponseAgreementPanel />
    {reportId && !readOnly && <SharePanel id={reportId} />}
    <p className="mt-5 flex flex-wrap items-center gap-3 border-s-2 border-primary bg-secondary p-4 text-sm">{report.verification === "web" ? <span className="rounded-full bg-success px-3 py-1 text-xs font-bold text-primary-foreground">Evidence-checked</span> : <span className="rounded-full bg-warning px-3 py-1 text-xs font-bold text-primary-foreground">Model Knowledge Only</span>}<span>{report.verification === "web" ? "Written from live web sources fetched for this report." : "No live web sources were used."} Verfiai provides verification support, not definitive truth judgments. Review sources before relying on a result.</span></p>
    <p role="note" className="mt-4 border-s-2 border-warning bg-warning-soft p-4 text-sm">{LIMITATION}</p>
    <div className="mt-9 grid gap-8 lg:grid-cols-[190px_1fr]">
      <nav aria-label="Contents" className="flex flex-col gap-3 text-sm text-muted-foreground print:hidden">{[["summary", "Summary"], ["background", "Background"], ["findings", "Key findings"], ["analysis", "Analysis"], ["sources", "Sources"], ["method", "Method & limits"]].map(([id, l]) => <a key={id} href={`#${id}`} className="hover:text-brand">{l}</a>)}</nav>
      <div className="space-y-9 text-sm leading-7">
        {sections.map(([id, h, t]) => t ? <section key={id} id={id}><h3 className="font-display text-xl font-bold">{h}</h3>{paras(t)}</section> : null)}
        <section id="findings"><h3 className="font-display text-xl font-bold">Key findings</h3><div className="mt-4 space-y-5">{report.findings.map((f, i) => { const strength = reportFindingStrength(f.status, f.detail, report.sources); return <div key={i} className="border-s-2 border-border ps-4"><span className="text-xs font-bold text-brand">{strength.label}</span><h4 className="font-semibold">{f.title}</h4><p className="mt-1 text-muted-foreground">{f.detail}</p><details className="mt-2 text-xs"><summary className="min-h-11 cursor-pointer font-semibold text-brand">Why this rating?</summary><dl className="space-y-1 text-muted-foreground"><div><dt className="font-semibold">Source authority</dt><dd>{strength.authority}</dd></div><div><dt className="font-semibold">Recency</dt><dd>{strength.recency}</dd></div><div><dt className="font-semibold">Independence</dt><dd>{strength.independence}</dd></div></dl></details><a href={issueLink(f.title)} className="mt-2 inline-flex min-h-11 items-center text-xs font-semibold text-brand underline">Report an issue</a></div>; })}</div></section>
        {report.analysis && <section id="analysis"><h3 className="font-display text-xl font-bold">Analysis</h3>{paras(report.analysis)}</section>}
        <section id="sources"><h3 className="font-display text-xl font-bold">Sources</h3>{report.sources.length ? <ol className="mt-3 list-inside list-decimal space-y-4">{report.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">{s.title}</a> <span className="text-muted-foreground">— {s.publisher}{s.date ? `, ${s.date.slice(0, 10)}` : ""}{s.fetchedAt ? ` · fetched ${new Date(s.fetchedAt).toLocaleString()}` : " · unverified until opened"}</span>{s.snippet && <blockquote className="mt-1 border-l border-border pl-3 text-xs text-muted-foreground">"{s.snippet}…"</blockquote>}</li>)}</ol> : <p className="mt-2 text-muted-foreground">No source links were found. Do not treat uncited claims as verified.</p>}</section>
        <section><h3 className="font-display text-xl font-bold">Conflicting evidence</h3>{paras(report.conflictingEvidence)}</section>
        <section id="method"><h3 className="font-display text-xl font-bold">Methodology</h3>{paras(report.methodology)}<h3 className="mt-7 font-display text-xl font-bold">Limitations</h3>{paras(report.limitations)}<p className="mt-3">{LIMITATION}</p><h3 className="mt-7 font-display text-xl font-bold">Conclusion</h3>{paras(report.conclusion)}</section>
        {report.engines?.length ? <footer className="border-t border-border pt-4 text-xs text-muted-foreground">Generated with: {report.engines.join(" · ")}</footer> : null}
      </div>
    </div>
  </article>;
}
