import { isLang } from "@/lib/translations";
import { translations } from "@/lib/i18n/interface";
import { uiText } from "@/lib/ui-extra-i18n";
import { SourceQualityDetails } from "./SourceQualityDetails";
import { getFeatureFlags } from "@/lib/flags.functions";
import { siteText } from "@/lib/site-i18n";
import { localeCode } from "@/lib/recent-i18n";
import { useLocation } from "@tanstack/react-router";
import { recentText, localizedBreakdown } from "@/lib/recent-i18n";
import { StrengthBadge } from "./StrengthBadge";
import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Check, Clipboard, Download, FileType2, Link2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResearchReport } from "@/lib/report.functions";
import { downloadDocx } from "@/lib/docx-export";
import { downloadBlob } from "@/lib/download-blob";
import { ResponseAgreementPanel } from "@/components/verifai/ResponseAgreementPanel";
import { disableShare, enableShare, getShareState } from "@/lib/share.functions";
import { useAuth } from "@/hooks/useAuth";
import { getSubscription } from "@/lib/payments.functions";
import { getPaddleEnvironment } from "@/lib/paddle";
import { reportFindingStrength, sourceQuality } from "@/lib/evidence";
import { RightsIssueDialog } from "./RightsIssueDialog";

const ISSUE_EMAIL = "hello@verfiai.app";
const LIMITATION = "Evidence labels are aids to review, not proof. Search coverage is incomplete; source dates, independence and quoted claims may be inaccurate. Open the original sources before relying on a finding.";
function issueLink(claim: string) { return `mailto:${ISSUE_EMAIL}?subject=${encodeURIComponent("Verfiai report issue")}&body=${encodeURIComponent(`Finding: ${claim}\n\nWhat seems wrong? (Do not include confidential material):\n`)}`; }

function SharePanel({ id }: { id: string }) {
 const lang = new URLSearchParams(useLocation().searchStr).get("lang") ?? "en";
 const t = (text: string) => recentText(lang, text);
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
  async function copy() { try { await navigator.clipboard.writeText(link); setMsg(t("Link copied.")); } catch { setMsg(t("Copy the link above.")); } }
  return <div className="mt-5 border border-border bg-card p-4 text-sm print:hidden">
    <div className="flex flex-wrap items-center gap-3"><Link2 className="size-4 text-brand" /><span className="font-semibold">{t("Share link")}</span><span className="text-muted-foreground">{token ? t("Anyone with the link can read this report.") : t("Only you can see this report.")}</span>
      <Button size="sm" variant={token ? "outline" : "default"} className="ml-auto" disabled={busy || token === undefined} onClick={toggle}>{token ? t("Stop sharing") : t("Create share link")}</Button></div>
    {token && <div className="mt-3 flex flex-wrap items-center gap-2"><input readOnly value={link} aria-label={t("Share link")} className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-xs" onFocus={e => e.target.select()} /><Button size="sm" variant="outline" onClick={copy}><Clipboard />{t("Copy")}</Button></div>}
    {msg && <p role="status" className="mt-2 text-xs text-muted-foreground">{msg}</p>}
  </div>;
}

/** Wrap [n] citation markers in an LTR isolate so brackets/digits never flip inside Arabic, Urdu or Persian text. */
export function withCitations(t: string) {
  return t.split(/(\[\d+(?:[,\u060C]\s*\d+)*\])/g).map((part, i) => /^\[\d/.test(part)
    ? <bdi key={i} dir="ltr" className="whitespace-nowrap text-xs font-semibold text-brand"><sup>{part}</sup></bdi> : part);
}
const paras = (t: string) => (t || "").split(/\n\s*\n/).filter(Boolean).map((p, i) => <p key={i} className="mt-3">{withCitations(p)}</p>);

export function reportToText(r: ResearchReport, lang = "en") {
 const t = (text: string) => recentText(lang, text);
  return `# ${r.title}\n\n## ${t("Executive summary")}\n${r.summary}\n\n## ${t("Background")}\n${r.background}\n\n## ${t("Key findings")}\n${r.findings.map(f => `- [${reportFindingStrength(f.status, f.detail, r.sources).label}] ${f.title}: ${f.detail}`).join("\n")}\n\n## ${t("Analysis")}\n${r.analysis}\n\n## ${t("Sources")}\n${r.sources.map(s => `${s.title} — ${s.publisher}, ${s.date}\n${s.url}`).join("\n") || "None confidently identified."}\n\n## ${t("Conflicting evidence")}\n${r.conflictingEvidence}${r.proceduralGuidance ? `\n\n## ${t("Procedural guidance")}\n${r.proceduralGuidance}` : ""}${r.timeline?.length ? `\n\n## ${t("Timeline")}\n${r.timeline.map(t => `- ${t.date}: ${t.event}`).join("\n")}` : ""}${r.themes?.length ? `\n\n## ${t("Core themes")}\n${r.themes.map(t => `### ${t.title}\n${t.summary}`).join("\n\n")}` : ""}${r.bibliography?.length ? `\n\n## ${t("Annotated bibliography")}\n${r.bibliography.map(b => `- [${b.title}](${b.url}) — ${b.publisher}${b.date ? `, ${b.date.slice(0, 10)}` : ""} · ${b.tier}\n  ${b.annotation}`).join("\n")}` : ""}${r.blindSpots ? `\n\n## ${t("Blind spots")}\n${r.blindSpots}` : ""}${r.searchAudit?.length ? `\n\n## ${t("Search audit log")}\n${r.searchAudit.map(l => `- ${l}`).join("\n")}` : ""}\n\n## ${t("Methodology")}\n${r.methodology}\n\n## ${t("Limitations")}\n${r.limitations}\n\n${t(LIMITATION)}\n\n## ${t("Conclusion")}\n${r.conclusion}\n\n${r.verification === "web" ? "Evidence-checked" : "Model Knowledge Only"}. Generated with: ${(r.engines ?? []).join(", ") || "AI"}. Verfiai provides verification support, not definitive truth judgments. Review sources before relying on a result.`;
}

export function ReportView({ report, date, reportId, readOnly }: { report: ResearchReport; date?: string | undefined; reportId?: string | undefined; readOnly?: boolean }) {
  const lang = new URLSearchParams(useLocation().searchStr).get("lang") ?? "en";
  const dir = isLang(lang) ? translations[lang].dir : "auto";
  const t = (text: string) => recentText(lang, text);
  const [wordBusy, setWordBusy] = useState(false);
  const flags = useServerFn(getFeatureFlags);
  const [advanced, setAdvanced] = useState(false);
  const { user } = useAuth();
  useEffect(() => { flags().then(f => setAdvanced(f.ADVANCED_SOURCE_SCORING_ENABLED)).catch(() => setAdvanced(false)); }, [user?.id, flags]);
  const getPlan = useServerFn(getSubscription);
  const [pro, setPro] = useState(false);
  useEffect(() => { if (!user || readOnly) return; getPlan({ data: { environment: getPaddleEnvironment() } }).then(r => setPro(r.isPro)).catch(() => setPro(false)); }, [user?.id, readOnly]); // eslint-disable-line react-hooks/exhaustive-deps
  async function word() { setWordBusy(true); try {
    // Recheck at export time; a stale browser flag never removes the watermark.
    const paid = user && !readOnly ? (await getPlan({ data: { environment: getPaddleEnvironment() } })).isPro : false;
    await downloadDocx(report, { watermark: !paid });
  } finally { setWordBusy(false); } }
  const [copied, setCopied] = useState(false);
  const [helpful, setHelpful] = useState<Record<number, boolean>>({});
  const text = reportToText(report, lang);
  const words = text.split(/\s+/).length;
  async function copy() { try { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* ignore */ } }
  function download() { downloadBlob(new Blob([text], { type: "text/markdown;charset=utf-8" }), "verifai-report.md"); }
  const sections: [string, string, string][] = [["summary", "Executive summary", report.summary], ["background", "Background", report.background]];
  return <article id="report-output" dir={dir} lang={isLang(lang) ? lang : undefined} className="scroll-mt-28">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase text-brand">Verfiai · {date ?? new Date().toLocaleDateString()} · {recentText(lang, "Pages: {count}", { count: Math.max(2, Math.round(words / 500)) })}{report.format === "extended" ? ` · ${uiText(lang, "heroReport")}` : report.format === "dossier" ? ` · ${uiText(lang, "dossierTab")}` : ""}</p><h2 className="mt-2 max-w-3xl font-display text-3xl font-bold">{report.title}</h2></div>
      <div className="flex gap-1 print:hidden"><Button size="icon" variant="outline" aria-label={t("Copy")} onClick={copy}>{copied ? <Check /> : <Clipboard />}</Button><Button variant="outline" onClick={word} disabled={wordBusy}><FileType2 />Word</Button><Button size="icon" variant="outline" aria-label={t("Download Markdown")} title={t("Download Markdown")} onClick={download}><Download /></Button><Button size="icon" variant="outline" aria-label={t("Print or save as PDF")} onClick={() => window.print()}><Printer /></Button></div></div>
    {!pro && <div aria-hidden className="pointer-events-none fixed inset-0 z-50 hidden items-center justify-center print:flex"><span className="-rotate-45 whitespace-nowrap text-6xl font-bold text-muted-foreground/25">{t("Generated by Verfiai (Free Tier)")}</span></div>}
    <ResponseAgreementPanel />
    {reportId && !readOnly && <SharePanel id={reportId} />}
    <p className="mt-5 flex flex-wrap items-center gap-3 border-s-2 border-primary bg-secondary p-4 text-sm">{report.verification === "web" ? <span className="rounded-full bg-success px-3 py-1 text-xs font-bold text-primary-foreground">{t("Evidence-checked")}</span> : <span className="rounded-full bg-warning px-3 py-1 text-xs font-bold text-primary-foreground">{t("Model Knowledge Only")}</span>}<span>{report.verification === "web" ? t("Written from live web sources fetched for this report.") : t("No live web sources were used.")} {siteText(localeCode(lang), "verifyDisclaimer")}</span></p>
    <p role="note" className="mt-4 border-s-2 border-warning bg-warning-soft p-4 text-sm">{t(LIMITATION)}</p>
    <p className="mt-3 text-xs text-muted-foreground">{uiText(lang, "consensus")}</p>
    <div className="mt-9 grid gap-8 lg:grid-cols-[190px_1fr]">
      <nav aria-label={t("Contents")} className="flex flex-col gap-3 text-sm text-muted-foreground print:hidden">{[["summary", "Summary"], ["background", "Background"], ["findings", "Key findings"], ["analysis", "Analysis"], ...(report.themes?.length ? [["themes", "Core themes"]] : []), ...(report.bibliography?.length ? [["bibliography", "Annotated bibliography"]] : []), ...(report.format === "extended" || report.format === "dossier" ? [["procedural", "Procedural guidance"], ["timeline", "Timeline"], ["blindspots", "Blind spots"]] : []), ["sources", "Sources"], ...(report.searchAudit?.length ? [["audit", "Search audit log"]] : []), ["method", "Method & limits"]].map(([id, l]) => <a key={id} href={`#${id}`} className="hover:text-brand">{t(l ?? "")}</a>)}</nav>
      <div className="space-y-9 text-sm leading-7">
        {sections.map(([id, h, body]) => body ? <section key={id} id={id}><h3 className="font-display text-xl font-bold">{t(h)}</h3>{paras(body)}</section> : null)}
        <section id="findings"><h3 className="font-display text-xl font-bold">{t("Key findings")}</h3><div className="mt-4 space-y-5">{report.findings.map((f, i) => { const strength = localizedBreakdown(lang, reportFindingStrength(f.status, f.detail, report.sources)); return <div key={i} className="border-s-2 border-border ps-4"><StrengthBadge label={strength.label} lang={lang} /><span className="ms-2 text-xs font-semibold">{t("Evidence strength")}</span><h4 className="font-semibold">{f.title}</h4><p className="mt-1 text-muted-foreground">{withCitations(f.detail)}</p><details className="mt-2 text-xs"><summary className="min-h-11 cursor-pointer font-semibold text-brand">{t("Why this rating?")}</summary><dl className="space-y-1 text-muted-foreground"><div><dt className="font-semibold">{t("Source authority")}</dt><dd>{strength.authority}</dd></div><div><dt className="font-semibold">{t("Recency")}</dt><dd>{strength.recency}</dd></div><div><dt className="font-semibold">{t("Independence")}</dt><dd>{strength.independence}</dd></div></dl>{advanced && f.sourceScores?.map(s => <div key={s.url} className="mt-2"><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">{s.title}</a><SourceQualityDetails quality={s.quality} lang={lang} /></div>)}</details><div className="mt-3 flex flex-wrap items-center gap-2 text-xs"><span className="font-semibold">{t("Was this verdict helpful?")}</span>{helpful[i] ? <span role="status" className="text-success">{t("Thanks for your feedback.")}</span> : <><Button size="sm" variant="outline" onClick={() => setHelpful(v => ({ ...v, [i]: true }))}>{t("Yes")}</Button><Button size="sm" variant="outline" asChild><a href={issueLink(f.title)}>{t("No — Report Issue")}</a></Button></>}</div></div>; })}</div></section>
        {report.analysis && <section id="analysis"><h3 className="font-display text-xl font-bold">{t("Analysis")}</h3>{paras(report.analysis)}</section>}
        {report.proceduralGuidance && <section id="procedural"><h3 className="font-display text-xl font-bold">{t("Procedural guidance")}</h3>{paras(report.proceduralGuidance)}<p className="mt-3 text-xs text-muted-foreground">{t("General verification steps only — not legal, medical or financial advice.")}</p></section>}
        {report.themes?.length ? <section id="themes"><h3 className="font-display text-xl font-bold">{t("Core themes")}</h3><div className="mt-3 grid gap-3 md:grid-cols-2">{report.themes.map((t, i) => <div key={i} className="border border-border bg-card p-4"><h4 className="font-semibold">{t.title}</h4><p className="mt-1 text-muted-foreground">{t.summary}</p></div>)}</div></section> : null}
        {(report.format === "extended" || report.format === "dossier") && <section id="timeline"><h3 className="font-display text-xl font-bold">{t("Timeline / chronology")}</h3>{report.timeline?.length ? <ol className="mt-3 space-y-2 border-s-2 border-border ps-4">{report.timeline.map((t, i) => <li key={i}><span className="font-semibold" dir="auto">{t.date}</span> — {withCitations(t.event)}</li>)}</ol> : <p className="mt-2 text-muted-foreground">{t("No dated events were found in the retrieved sources.")}</p>}</section>}
        {report.blindSpots && <section id="blindspots"><h3 className="font-display text-xl font-bold">{t("Blind spots")}</h3>{paras(report.blindSpots)}</section>}
        {report.bibliography?.length ? <section id="bibliography"><h3 className="font-display text-xl font-bold">{t("Annotated bibliography")}</h3><p className="mt-1 text-xs text-muted-foreground">{report.bibliography.length} unique sources, ranked by source tier. Notes summarise each source's contribution; open the link to read the original.</p><ul className="mt-3 list-disc space-y-4 ps-5">{report.bibliography.map((b, i) => <li key={i}><a href={b.url} target="_blank" rel="noopener noreferrer" className="break-all font-semibold text-brand underline">{b.title}</a> <span className="text-xs text-muted-foreground">— {b.publisher}{b.date ? `, ${b.date.slice(0, 10)}` : ""} · {b.tier}</span><p className="mt-1 text-muted-foreground" dir="auto">{b.annotation}</p></li>)}</ul></section> : null}
        <section id="sources"><h3 className="font-display text-xl font-bold">{t("Sources")}</h3>{report.sources.length ? <ol className="mt-3 list-inside list-decimal space-y-4">{report.sources.map((s, i) => <li key={i}><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">{s.title}</a> <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{t(sourceQuality(s.url))}</span> <span className="text-muted-foreground">— {s.publisher}{s.date ? `, ${s.date.slice(0, 10)}` : ""}{s.fetchedAt ? ` · fetched ${new Date(s.fetchedAt).toLocaleString()}` : " · unverified until opened"}</span>{advanced && <SourceQualityDetails quality={s.quality} lang={lang} />}{s.snippet && <blockquote className="mt-1 border-l border-border pl-3 text-xs text-muted-foreground">"{s.snippet}…"</blockquote>}</li>)}</ol> : <p className="mt-2 text-muted-foreground">{t("No source links were found. Do not treat uncited claims as verified.")}</p>}</section>
        {report.searchAudit?.length ? <section id="audit"><h3 className="font-display text-xl font-bold">{t("Search audit log")}</h3><ul className="mt-3 list-disc space-y-1 ps-5 text-xs text-muted-foreground">{report.searchAudit.map((l, i) => <li key={i} dir="auto">{l}</li>)}</ul>{report.passes?.length ? <p className="mt-3 text-xs text-muted-foreground">Writing passes: {report.passes.join(" · ")}</p> : null}</section> : null}
        <section><h3 className="font-display text-xl font-bold">{t("Conflicting evidence")}</h3>{paras(report.conflictingEvidence)}</section>
        <section id="method"><h3 className="font-display text-xl font-bold">{t("Methodology")}</h3>{paras(report.methodology)}<h3 className="mt-7 font-display text-xl font-bold">{t("Limitations")}</h3>{paras(report.limitations)}<p className="mt-3">{t(LIMITATION)}</p><h3 className="mt-7 font-display text-xl font-bold">{t("Conclusion")}</h3>{paras(report.conclusion)}</section>
        {report.engines?.length ? <footer className="border-t border-border pt-4 text-xs text-muted-foreground">Generated with: {report.engines.join(" · ")}</footer> : null}
      </div>
    </div>
    <aside className="mt-10 border-t border-border pt-5 text-sm print:hidden"><p className="text-muted-foreground">Working on a larger project? Download our free verification templates to structure your next report. <Link to="/" hash="templates" className="font-semibold text-brand underline">{t("Browse free templates")}</Link></p><p className="mt-3 text-muted-foreground">Explore original publications in the <Link to="/knowledge" className="font-semibold text-brand underline">{t("Open Knowledge Index")}</Link> and reviewed briefs in the <Link to="/resources" className="font-semibold text-brand underline">{t("Evidence Library")}</Link>.</p><p className="mt-3 text-xs text-muted-foreground">Source and rights notice: This Verfiai report is an original evidence synthesis. Linked external sources remain the property of their respective publishers. Reuse of external material is subject to the licence and terms shown for each source.</p><RightsIssueDialog reportTitle={report.title} reportUrl={typeof window !== "undefined" ? window.location.href : undefined} /></aside>
  </article>;
}
