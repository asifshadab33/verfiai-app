import { checkerText } from "@/lib/checker-i18n";
import { SourceQualityDetails } from "./SourceQualityDetails";
import { getFeatureFlags } from "@/lib/flags.functions";
import { uiText } from "@/lib/ui-extra-i18n";
import { recentText, localizedBreakdown } from "@/lib/recent-i18n";
import { StrengthBadge } from "./StrengthBadge";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Check, Link2, LoaderCircle, ScanSearch, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { factCheck, getFactUsage, type ClaimResult, type Verdict } from "@/lib/factcheck.functions";
import { useAuth } from "@/hooks/useAuth";
import { VoiceButton } from "./VoiceButton";
import { useImageOcr } from "./useImageOcr";
import { siteText } from "@/lib/site-i18n";
import { languages, type Lang } from "@/lib/translations";
import { evidenceStrength, sourceQuality } from "@/lib/evidence";
import { VerdictFeedback } from "./VerdictFeedback";

const verdictKeys = { SUPPORTED: "verdictSupported", CONTRADICTED: "verdictContradicted", MIXED: "verdictMixed", UNVERIFIABLE: "verdictInsufficient" } as const;
const STAGES = ["Extracting claims…", "Searching providers…", "Cross-checking sources…", "Synthesizing verdict…"];
const style: Record<Verdict, { label: string; cls: string }> = {
  SUPPORTED: { label: "Supported", cls: "bg-success-soft text-success border-success/30" },
  CONTRADICTED: { label: "Contradicted", cls: "bg-danger-soft text-destructive border-destructive/30" },
  MIXED: { label: "Mixed evidence", cls: "bg-warning-soft text-warning border-warning/40" },
  UNVERIFIABLE: { label: "Insufficient evidence", cls: "bg-muted text-muted-foreground border-border" },
};
const SAMPLE = "The Great Wall of China is visible from the Moon with the naked eye. Water boils at 100 degrees Celsius at sea level. Humans only use 10 percent of their brains. Mount Everest is the highest mountain above sea level.";

export function FactChecker({ lang }: { lang: Lang }) {
  const t = (text: string) => recentText(lang, text);
  const tx = (key: Parameters<typeof siteText>[1]) => siteText(lang, key);
  const run = useServerFn(factCheck);
  const fetchUsage = useServerFn(getFactUsage);
  const { user, loading } = useAuth();
  const flags = useServerFn(getFeatureFlags);
  const [advanced, setAdvanced] = useState(false);
  useEffect(() => { flags().then(f => setAdvanced(f.ADVANCED_SOURCE_SCORING_ENABLED)).catch(() => setAdvanced(false)); }, [user?.id, flags]);
  const [mode, setMode] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState("");
  const [claims, setClaims] = useState<ClaimResult[] | null>(null);
  const [usage, setUsage] = useState<{ signedIn: boolean; used: number; limit: number } | null>(null);
  useEffect(() => { if (!loading) fetchUsage().then(setUsage).catch(() => {}); }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = usage ? Math.max(0, usage.limit - usage.used) : 1;
  const ocr = useImageOcr(lang, t => setText(q => ((q ? q.trimEnd() + "\n\n" : "") + t).slice(0, 15000)));
  const busy = stage >= 0;
  const ready = mode === "text" ? text.trim().length >= 30 : /^https:\/\//i.test(url.trim());

  async function submit() {
    if (!ready || busy) return;
    setError(""); setClaims(null); setStage(0);
    const timers = [setTimeout(() => setStage(1), 1500), setTimeout(() => setStage(2), 6000), setTimeout(() => setStage(3), 14000)];
    try {
      const r = await run({ data: { ...(mode === "text" ? { text } : { url: url.trim() }), language: languages.find(l => l.code === lang)?.name ?? "English" } });
      setClaims(r.claims);
      if (r.claims.length) setUsage(await fetchUsage());
    } catch (e) { setError(e instanceof Error ? e.message : tx("factError")); }
    finally { timers.forEach(clearTimeout); setStage(-1); }
  }

  const counts = claims ? (["SUPPORTED", "CONTRADICTED", "MIXED", "UNVERIFIABLE"] as const).map(v => [v, claims.filter(c => c.verdict === v).length] as const) : [];
  return <div>
    <h2 className="font-display text-2xl font-bold">{tx("factTitle")}</h2>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{tx("factIntro")}</p>
    <div role="group" aria-label={tx("factInputType")} className="mt-6 inline-flex rounded-lg border border-border p-1">
      {(["text", "url"] as const).map(m => <Button key={m} aria-pressed={mode === m} size="sm" variant={mode === m ? "default" : "ghost"} onClick={() => setMode(m)}>{m === "text" ? tx("factPaste") : <><Link2 />{tx("factLink")}</>}</Button>)}
    </div>
    <p className="mt-5 text-xs leading-5 text-muted-foreground">{checkerText(lang, "privacy")} <a href="/privacy" className="text-brand underline">{t("privacy notice")}</a>{" "}{t("and")}{" "}<a href="/methodology" className="text-brand underline">{t("methodology")}</a>.</p>
    {mode === "text" ? <>
      <label htmlFor="fact-text" className="mt-3 block text-sm font-semibold">{tx("factText")}</label>
      <Textarea id="fact-text" {...ocr.handlers} aria-describedby="fact-ocr" value={text} maxLength={15000} onChange={e => setText(e.target.value)} placeholder={tx("factPlaceholder")} className={`mt-2 min-h-40 bg-card ${ocr.over ? "ring-2 ring-brand" : ""}`} dir="auto" />
      <div id="fact-ocr">{ocr.status}</div>
      <div className="mt-3 flex flex-wrap items-center gap-3"><VoiceButton lang={lang} onText={t => setText(q => (q ? q.trimEnd() + " " : "") + t)} /><button type="button" className="text-xs text-brand underline" onClick={() => setText(SAMPLE)}>{tx("factSample")}</button><span className="ms-auto text-xs text-muted-foreground">{text.length.toLocaleString()} / 15,000</span></div>
    </> : <>
      <label htmlFor="fact-url" className="mt-5 block text-sm font-semibold">{tx("factArticle")}</label>
      <Input id="fact-url" type="url" dir="ltr" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className="mt-2 bg-card" />
      <p className="mt-2 text-xs text-muted-foreground">{tx("factLinkHint")}</p>
    </>}
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <Button size="lg" className="h-12 px-6" onClick={submit} disabled={!ready || busy}>{busy ? <LoaderCircle className="animate-spin" /> : <ScanSearch />}{busy ? tx((["factStage1", "factStage2", "factStage3", "factStage4"] as const)[stage] ?? "factStage1") : tx("factCheck")}</Button>
      <span className="text-xs text-muted-foreground">{usage ? (usage.signedIn ? `${left} / ${usage.limit} ${tx("factRemaining")}` : left ? tx("factGuest") : "") : ""} · {tx("factUpTo")}</span>
    </div>
    {busy && <ol role="status" className="mt-6 space-y-2 text-sm">{STAGES.map((s, i) => <li key={s} className={`flex items-center gap-2 ${i > stage ? "text-muted-foreground" : ""}`}>{i < stage ? <Check className="size-4 text-success" /> : i === stage ? <LoaderCircle className="size-4 animate-spin text-brand" /> : <span className="size-4" />}{tx((["factStage1", "factStage2", "factStage3", "factStage4"] as const)[i] ?? "factStage1")}</li>)}</ol>}
    {left === 0 && !busy && <p className="mt-6 rounded-xl bg-brand-soft p-4 text-sm">{usage?.signedIn ? tx("factLimit") : <>{tx("factGuestLimit")} <a href="/auth" className="font-semibold text-brand underline">{tx("navSignIn")}</a> {tx("factGuestMore")}</>}</p>}
    {error && <div role="alert" className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft p-4 text-sm text-destructive"><XCircle className="size-4" />{error}{!/used your/.test(error) && <Button size="sm" variant="outline" onClick={submit}>{tx("retry")}</Button>}</div>}
    <p className="mt-5 text-xs leading-5 text-muted-foreground">{tx("factPrivacy")}</p>

    {claims && <section aria-label={tx("factResults")} className="mt-10 space-y-5">
      {claims.length === 0 ? <p className="rounded-xl bg-secondary p-5 text-sm">{tx("factEmpty")}</p> : <>
        <p className="text-xs text-muted-foreground">{uiText(lang, "consensus")}</p>
        <div className="grid gap-4 sm:grid-cols-3">{counts.map(([v, n]) => <div key={v} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{tx(verdictKeys[v])}</p><p className="mt-1 font-display text-3xl font-extrabold">{n}</p></div>)}</div>
        <ul className="space-y-4">{claims.map((c, i) => <li key={i} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><p className="font-semibold">{c.claim}</p><span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style[c.verdict].cls}`}>{tx(verdictKeys[c.verdict])}</span></div>
          <p className="mt-2 text-sm text-muted-foreground">{c.explanation}</p>
          {(() => { const rating = localizedBreakdown(lang, c.strength ?? evidenceStrength(c.verdict, c.sources.filter(s => s.quote))); return <><div className="mt-3 flex flex-wrap items-center gap-2"><StrengthBadge label={rating.label} lang={lang} /><span className="text-xs font-semibold">{t("Evidence strength")}</span><span className="text-xs text-muted-foreground">· {recentText(lang, "Sources: {count}", { count: c.sources.length })}</span></div><details className="mt-2 text-xs"><summary className="flex min-h-11 cursor-pointer items-center font-semibold text-brand">{t("Why this rating?")}</summary><dl className="space-y-1 text-muted-foreground"><div><dt className="font-semibold">{t("Source authority")}</dt><dd>{rating.authority}</dd></div><div><dt className="font-semibold">{t("Recency")}</dt><dd>{rating.recency}</dd></div><div><dt className="font-semibold">{t("Independence")}</dt><dd>{rating.independence}</dd></div></dl></details></>; })()}
          {c.conflict && <div className="mt-4 grid gap-3 sm:grid-cols-2"><blockquote className="border-s-2 border-success ps-3 text-xs"><span className="font-semibold">{tx("factOneSource")}</span> "{c.conflict.a}"</blockquote><blockquote className="border-s-2 border-destructive ps-3 text-xs"><span className="font-semibold">{tx("factAnotherSource")}</span> "{c.conflict.b}"</blockquote></div>}
          {c.sources.length > 0 && <ol className="mt-4 space-y-2 text-xs">{c.sources.map(s => <li key={s.n}><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">[{s.n}] {s.title}</a><span className="ms-2 rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">{t(sourceQuality(s.url))}</span>{s.quote && <span className="text-muted-foreground"> — "{s.quote}"</span>}{advanced && <SourceQualityDetails quality={s.quality} lang={lang} context="claim" />}</li>)}</ol>}
          <VerdictFeedback claim={c.claim} verdict={c.verdict} explanation={`${c.explanation} ${uiText(lang, "consensus")}`} />
          <p className="mt-3 text-xs text-muted-foreground">{tx("factSourceNote")}</p>
          <a href={`mailto:hello@verfiai.app?subject=${encodeURIComponent("Verfiai claim issue")}&body=${encodeURIComponent(`Claim: ${c.claim}\n\nWhat seems wrong? (Do not include confidential material):\n`)}`} className="inline-flex min-h-11 items-center text-xs font-semibold text-brand underline">{t("Report an issue")}</a>
        </li>)}</ul>
      </>}
    </section>}
  </div>;
}
