import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState, type DragEvent, type ReactNode } from "react";
import { AlertTriangle, ShieldCheck, Check, FileSearch, FileText, LoaderCircle, Lock, Trash2, Upload, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { verifyCitations, type CitationResult } from "@/lib/verify.functions";

const FREE_LIMIT = 3;
const USAGE_KEY = "verifai-scans";
const month = () => new Date().toISOString().slice(0, 7);
function readUsage() { try { const v = JSON.parse(localStorage.getItem(USAGE_KEY) || "null"); return v?.period === month() ? Number(v.used) || 0 : 0; } catch { return 0; } }
function writeUsage(used: number) { try { localStorage.setItem(USAGE_KEY, JSON.stringify({ period: month(), used })); } catch { /* optional */ } }
const SAMPLE = `Recent work suggests that social priming strongly affects behaviour (Smith, 2019).

References
1. Wakefield AJ, et al. Ileal-lymphoid-nodular hyperplasia, non-specific colitis, and pervasive developmental disorder in children. Lancet. 1998. doi:10.1016/S0140-6736(97)11096-0
2. LeCun Y, Bengio Y, Hinton G. Deep learning. Nature. 2015;521:436-444. doi:10.1038/nature14539
3. Smith J, Lee K. Quantum priming effects on consumer memory retention. Journal of Advanced Cognitive Metrics. 2019;12:44-59.`;
const STAGES = ["Reading your text…", "Identifying citations…", "Checking Crossref records…"];

const statusStyle = {
  retracted: { label: "Retracted", cls: "bg-danger-soft text-destructive border-destructive/30", mark: "bg-destructive/15 underline decoration-destructive" },
  unverified: { label: "High fabrication risk", cls: "bg-warning-soft text-warning border-warning/40", mark: "bg-warning/15 underline decoration-warning" },
  verified: { label: "Verified", cls: "bg-success-soft text-success border-success/30", mark: "bg-success/15" },
} as const;

function Badge({ s }: { s: CitationResult["status"] }) {
  return <span className={`inline-flex shrink-0 items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusStyle[s].cls}`}>{statusStyle[s].label}</span>;
}

function HeroMockup() {
  return (
    <div className="grid gap-4 sm:grid-cols-2" aria-label="Before and after example">
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
        <p className="text-xs font-bold uppercase text-muted-foreground">Before</p>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold"><FileText className="size-4" /> manuscript_v3.docx</div>
        <ul className="mt-4 space-y-2 text-xs">
          {["[12] Wakefield et al., 1998", "[18] Smith & Lee, 2019", "[23] Chen, 2021"].map((r, i) => (
            <li key={r} className="flex items-center justify-between gap-2 rounded-lg bg-secondary p-2">
              <span className="truncate">{r}</span>
              {i < 2 ? <AlertTriangle className="size-4 shrink-0 text-destructive" /> : <span className="size-4" />}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-destructive">2 hidden problems</p>
      </div>
      <div className="rounded-2xl border border-primary/30 bg-card p-4 shadow-md">
        <p className="text-xs font-bold uppercase text-brand">After</p>
        <div className="mt-3 flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="size-4 text-success" /> Citation report</div>
        <p className="mt-4 font-display text-3xl font-extrabold">92%</p>
        <p className="text-xs text-muted-foreground">Integrity score</p>
        <div className="mt-3 flex flex-wrap gap-1.5"><Badge s="retracted" /><Badge s="unverified" /><Badge s="verified" /></div>
      </div>
    </div>
  );
}

function highlight(text: string, results: CitationResult[]) {
  const marks: { start: number; end: number; s: CitationResult["status"] }[] = [];
  results.forEach((r) => {
    const needle = r.raw.trim();
    if (needle.length < 8) return;
    let i = text.indexOf(needle);
    if (i < 0) i = text.indexOf(needle.slice(0, 60));
    if (i >= 0 && !marks.some((m) => i < m.end && i + needle.length > m.start)) marks.push({ start: i, end: Math.min(text.length, i + needle.length), s: r.status });
  });
  marks.sort((a, b) => a.start - b.start);
  const out: ReactNode[] = [];
  let pos = 0;
  marks.forEach((m, k) => {
    out.push(text.slice(pos, m.start));
    out.push(<mark key={k} className={`rounded px-0.5 text-foreground ${statusStyle[m.s].mark}`}>{text.slice(m.start, m.end)}</mark>);
    pos = m.end;
  });
  out.push(text.slice(pos));
  return out;
}

function Results({ text, results }: { text: string; results: CitationResult[] }) {
  const flagged = results.filter((r) => r.status !== "verified").length;
  const retracted = results.filter((r) => r.status === "retracted").length;
  const score = results.length ? Math.round(((results.length - flagged) / results.length) * 100) : 0;
  const order = { retracted: 0, unverified: 1, verified: 2 };
  const sorted = [...results].sort((a, b) => order[a.status] - order[b.status]);
  return (
    <div className="mt-10 space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Total citations scanned", results.length], ["Flagged / retracted", `${flagged} / ${retracted}`], ["Citation integrity score", `${score}%`]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{l}</p><p className="mt-1 font-display text-3xl font-extrabold">{v}</p></div>
        ))}
      </div>
      {results.length === 0 ? (
        <p className="rounded-xl bg-secondary p-5 text-sm">No citations were found in this text. Make sure your reference list is included.</p>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold">Original text</h3>
            <div className="mt-3 max-h-[32rem] overflow-auto whitespace-pre-wrap text-sm leading-7 [overflow-wrap:anywhere]">{highlight(text, results)}</div>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <h3 className="font-display font-bold">Citation checks</h3>
            <ul className="mt-3 max-h-[32rem] space-y-3 overflow-auto">
              {sorted.map((r, i) => (
                <li key={i} className="rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold [overflow-wrap:anywhere]">{r.title || r.raw}</p><Badge s={r.status} /></div>
                  <p className="mt-2 text-xs text-muted-foreground">{r.note}</p>
                  {r.doi && r.status !== "unverified" && <a className="mt-1 inline-block text-xs text-brand underline [overflow-wrap:anywhere]" href={`https://doi.org/${r.doi}`} target="_blank" rel="noreferrer">doi.org/{r.doi}</a>}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <p className="text-xs text-muted-foreground">Checks use public Crossref records. A "high fabrication risk" flag means we couldn't match the source; please confirm it manually before removing it.</p>
    </div>
  );
}

export function Checker() {
  const verify = useServerFn(verifyCitations);
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [stage, setStage] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<CitationResult[] | null>(null);
  const [scanned, setScanned] = useState("");
  const [used, setUsed] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => setUsed(readUsage()), []);
  const left = Math.max(0, FREE_LIMIT - used);
  const busy = stage >= 0;

  async function readFile(f: File) {
    setFileError(null);
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (f.size > 5 * 1024 * 1024) return setFileError("This file is larger than 5 MB. Please upload a smaller file.");
    try {
      if (ext === "txt" || ext === "md" || ext === "bib") {
        setText((await f.text()).slice(0, 60000));
      } else if (ext === "docx") {
        const mammoth = await import("mammoth");
        const { value } = await mammoth.extractRawText({ arrayBuffer: await f.arrayBuffer() });
        if (!value.trim()) throw new Error("empty");
        setText(value.slice(0, 60000));
      } else if (ext === "pdf") {
        return setFileError("PDF reading isn't available yet. Open the PDF, copy the text and paste it above.");
      } else {
        return setFileError("Unsupported file type. Use .docx, .bib, .txt or .md.");
      }
      setFileName(f.name);
    } catch {
      setFileError("We couldn't read this file. It may be damaged or password-protected.");
    }
  }

  function onDrop(e: DragEvent) { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) void readFile(f); }

  async function run() {
    if (text.trim().length < 20 || busy || left === 0) return;
    setError(null); setResults(null); setStage(0);
    const timers = [setTimeout(() => setStage(1), 700), setTimeout(() => setStage(2), 4000)];
    try {
      const { results } = await verify({ data: { text } });
      setScanned(text); setResults(results);
      const u = used + 1; setUsed(u); writeUsage(u);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally { timers.forEach(clearTimeout); setStage(-1); }
  }

  return (
    <section id="check" className="mx-auto max-w-6xl scroll-mt-20">
      <h2 className="font-display text-3xl font-bold">Check your citations</h2>
      <p className="mt-2 max-w-2xl text-muted-foreground">Paste your manuscript or reference list, or upload a file. We check every reference against Crossref.</p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
        <label className="block text-sm font-semibold" htmlFor="ms">Manuscript text or reference list</label>
        <Textarea id="ms" value={text} onChange={(e) => { setText(e.target.value); setFileName(null); }} maxLength={60000} placeholder="Paste your text with its reference list…" className="mt-2 min-h-44" />
        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground">
          <button type="button" className="text-brand underline" onClick={() => { setText(SAMPLE); setFileName(null); }}>Try a sample with known problems</button>
          <span>{text.length.toLocaleString()} / 60,000</span>
        </div>
        <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
          className={`mt-5 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors ${drag ? "border-primary bg-brand-soft" : "border-border"}`}>
          <Upload className="size-6 text-brand" />
          <p className="text-sm">Drag a file here or <button type="button" className="font-semibold text-brand underline" onClick={() => inputRef.current?.click()}>browse</button></p>
          <p className="text-xs text-muted-foreground">.docx, .bib, .txt or .md · up to 5 MB</p>
          <input ref={inputRef} type="file" accept=".docx,.bib,.txt,.md" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) void readFile(f); e.target.value = ""; }} />
          {fileName && <p className="flex items-center gap-2 text-sm font-medium"><FileText className="size-4" /> {fileName} <button type="button" aria-label="Remove file" onClick={() => { setFileName(null); setText(""); }}><Trash2 className="size-4 text-muted-foreground" /></button></p>}
          {fileError && <p role="alert" className="text-sm text-destructive">{fileError}</p>}
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <Button size="lg" className="h-12 px-6" onClick={run} disabled={busy || left === 0 || text.trim().length < 20}>
            {busy ? <LoaderCircle className="size-4 animate-spin" /> : <FileSearch className="size-4" />} {busy ? STAGES[stage] : "Verify citations"}
          </Button>
          <span className="text-xs text-muted-foreground">{left} of {FREE_LIMIT} free scans left this month</span>
        </div>
        <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><Lock className="size-3.5" /> Text is sent to an AI service to identify citations. Reference details are checked with Crossref; do not submit confidential material.</p>
        {busy && (
          <ol role="status" className="mt-6 space-y-2 text-sm">
            {STAGES.map((s, i) => <li key={s} className={`flex items-center gap-2 ${i > stage ? "text-muted-foreground" : ""}`}>{i < stage ? <Check className="size-4 text-success" /> : i === stage ? <LoaderCircle className="size-4 animate-spin text-brand" /> : <span className="size-4" />}{s}</li>)}
          </ol>
        )}
        {error && <div role="alert" className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-danger-soft p-4 text-sm text-destructive"><XCircle className="size-4" /> {error} <Button size="sm" variant="outline" onClick={run}>Retry</Button></div>}
        {left === 0 && !busy && <p className="mt-6 rounded-xl bg-brand-soft p-4 text-sm">You've used this month's demo allowance. Paid scans are not available yet.</p>}
      </div>
      {results && <Results text={scanned} results={results} />}
    </section>
  );
}

