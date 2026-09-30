import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { Check, Link2, LoaderCircle, ScanSearch, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { factCheck, getFactUsage, type ClaimResult, type Verdict } from "@/lib/factcheck.functions";
import { useAuth } from "@/hooks/useAuth";
import { VoiceButton } from "./VoiceButton";
import { languages, type Lang } from "@/lib/translations";

const STAGES = ["Reading the text…", "Finding checkable claims…", "Searching the web for evidence…", "Two AI engines are weighing the evidence…"];
const style: Record<Verdict, { label: string; cls: string }> = {
  SUPPORTED: { label: "Supported", cls: "bg-success-soft text-success border-success/30" },
  CONTRADICTED: { label: "Contradicted", cls: "bg-danger-soft text-destructive border-destructive/30" },
  UNVERIFIABLE: { label: "Unverifiable", cls: "bg-warning-soft text-warning border-warning/40" },
};
const SAMPLE = "The Great Wall of China is visible from the Moon with the naked eye. Water boils at 100 degrees Celsius at sea level. Humans only use 10 percent of their brains. Mount Everest is the highest mountain above sea level.";

export function FactChecker({ lang }: { lang: Lang }) {
  const run = useServerFn(factCheck);
  const fetchUsage = useServerFn(getFactUsage);
  const { user, loading } = useAuth();
  const [mode, setMode] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState("");
  const [claims, setClaims] = useState<ClaimResult[] | null>(null);
  const [usage, setUsage] = useState<{ signedIn: boolean; used: number; limit: number } | null>(null);
  useEffect(() => { if (!loading) fetchUsage().then(setUsage).catch(() => {}); }, [user, loading]); // eslint-disable-line react-hooks/exhaustive-deps
  const left = usage ? Math.max(0, usage.limit - usage.used) : 1;
  const busy = stage >= 0;
  const ready = mode === "text" ? text.trim().length >= 30 : /^https:\/\//i.test(url.trim());

  async function submit() {
    if (!ready || busy || left === 0) return;
    setError(""); setClaims(null); setStage(0);
    const timers = [setTimeout(() => setStage(1), 1500), setTimeout(() => setStage(2), 6000), setTimeout(() => setStage(3), 14000)];
    try {
      const r = await run({ data: { ...(mode === "text" ? { text } : { url: url.trim() }), language: languages.find(l => l.code === lang)?.name ?? "English" } });
      setClaims(r.claims);
      if (r.claims.length) setUsage(u => u ? { ...u, used: u.used + 1 } : u);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Please try again."); }
    finally { timers.forEach(clearTimeout); setStage(-1); }
  }

  const counts = claims ? (["SUPPORTED", "CONTRADICTED", "UNVERIFIABLE"] as const).map(v => [v, claims.filter(c => c.verdict === v).length] as const) : [];
  return <div>
    <h2 className="font-display text-2xl font-bold">Fact-check a text or article</h2>
    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Verfi AI splits the text into individual claims, searches the web for each one, and has two AI engines judge the evidence. If they disagree, a third engine breaks the tie.</p>
    <div role="tablist" aria-label="Input type" className="mt-6 inline-flex rounded-lg border border-border p-1">
      {(["text", "url"] as const).map(m => <Button key={m} role="tab" aria-selected={mode === m} size="sm" variant={mode === m ? "default" : "ghost"} onClick={() => setMode(m)}>{m === "text" ? "Paste text" : <><Link2 />Web link</>}</Button>)}
    </div>
    {mode === "text" ? <>
      <label htmlFor="fact-text" className="mt-5 block text-sm font-semibold">Text to check</label>
      <Textarea id="fact-text" value={text} maxLength={15000} onChange={e => setText(e.target.value)} placeholder="Paste an article, AI answer or paragraph…" className="mt-2 min-h-40 bg-card" />
      <div className="mt-3 flex flex-wrap items-center gap-3"><VoiceButton lang={lang} onText={t => setText(q => (q ? q.trimEnd() + " " : "") + t)} /><button type="button" className="text-xs text-brand underline" onClick={() => setText(SAMPLE)}>Try a sample</button><span className="ml-auto text-xs text-muted-foreground">{text.length.toLocaleString()} / 15,000</span></div>
    </> : <>
      <label htmlFor="fact-url" className="mt-5 block text-sm font-semibold">Article link</label>
      <Input id="fact-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…" className="mt-2 bg-card" />
      <p className="mt-2 text-xs text-muted-foreground">Some sites block automated readers. If a link fails, paste the text instead.</p>
    </>}
    <div className="mt-6 flex flex-wrap items-center gap-4">
      <Button size="lg" className="h-12 px-6" onClick={submit} disabled={!ready || busy || left === 0}>{busy ? <LoaderCircle className="animate-spin" /> : <ScanSearch />}{busy ? STAGES[stage] : "Check claims"}</Button>
      <span className="text-xs text-muted-foreground">{usage ? (usage.signedIn ? `${left} of ${usage.limit} free fact-checks left this month` : left ? "1 free fact-check without an account" : "") : ""} · up to 8 claims</span>
    </div>
    {busy && <ol role="status" className="mt-6 space-y-2 text-sm">{STAGES.map((s, i) => <li key={s} className={`flex items-center gap-2 ${i > stage ? "text-muted-foreground" : ""}`}>{i < stage ? <Check className="size-4 text-success" /> : i === stage ? <LoaderCircle className="size-4 animate-spin text-brand" /> : <span className="size-4" />}{s}</li>)}</ol>}
    {left === 0 && !busy && <p className="mt-6 rounded-xl bg-brand-soft p-4 text-sm">{usage?.signedIn ? "You've used this month's free fact-checks. More come with Pro (coming soon)." : <>You've used your free fact-check. <a href="/auth" className="font-semibold text-brand underline">Sign in</a> for 3 every month.</>}</p>}
    {error && <div role="alert" className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft p-4 text-sm text-destructive"><XCircle className="size-4" />{error}{!/used your/.test(error) && <Button size="sm" variant="outline" onClick={submit}>Retry</Button>}</div>}
    <p className="mt-5 text-xs leading-5 text-muted-foreground">Your text is sent to AI engines and a web search service to check it. Don't submit confidential material. Verfi AI provides verification support, not definitive truth judgments. Review sources before relying on a result.</p>

    {claims && <section aria-label="Fact-check results" className="mt-10 space-y-5">
      {claims.length === 0 ? <p className="rounded-xl bg-secondary p-5 text-sm">No checkable factual claims were found. Opinions and predictions can't be fact-checked. This didn't use up a check.</p> : <>
        <div className="grid gap-4 sm:grid-cols-3">{counts.map(([v, n]) => <div key={v} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{style[v].label}</p><p className="mt-1 font-display text-3xl font-extrabold">{n}</p></div>)}</div>
        <ul className="space-y-4">{claims.map((c, i) => <li key={i} className="rounded-2xl border border-border bg-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-3"><p className="font-semibold">{c.claim}</p><span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${style[c.verdict].cls}`}>{style[c.verdict].label}</span></div>
          <p className="mt-2 text-sm text-muted-foreground">{c.explanation}</p>
          {c.conflict && <div className="mt-4 grid gap-3 sm:grid-cols-2"><blockquote className="border-l-2 border-success pl-3 text-xs"><span className="font-semibold">One source says:</span> "{c.conflict.a}"</blockquote><blockquote className="border-l-2 border-destructive pl-3 text-xs"><span className="font-semibold">Another source says:</span> "{c.conflict.b}"</blockquote></div>}
          {c.sources.length > 0 && <ol className="mt-4 space-y-2 text-xs">{c.sources.map(s => <li key={s.n}><a href={s.url} target="_blank" rel="noopener noreferrer" className="break-all text-brand underline">[{s.n}] {s.title}</a>{s.quote && <span className="text-muted-foreground"> — "{s.quote}"</span>}</li>)}</ol>}
          <p className="mt-3 text-xs text-muted-foreground">{c.consensus === "agreed" ? "Both engines agreed." : c.consensus === "tie-break" ? "Engines disagreed; a third engine decided." : "Checked by one engine."}</p>
        </li>)}</ul>
      </>}
    </section>}
  </div>;
}
