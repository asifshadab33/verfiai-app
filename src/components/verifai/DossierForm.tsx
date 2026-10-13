import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ReportView } from "./ReportView";
import { useAuth } from "@/hooks/useAuth";
import { generateDossier } from "@/lib/dossier.functions";
import type { ResearchReport } from "@/lib/report-schema";

export const DOSSIER_HELP = "Generates a comprehensive, synthesized report and deduplicated bibliography from top-tier academic and news sources. (Max 50 sources analyzed).";

export function DossierForm({ language = "English" }: { language?: string }) {
  const { user } = useAuth();
  const run = useServerFn(generateDossier);
  const [topic, setTopic] = useState("");
  const [strict, setStrict] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState<ResearchReport | null>(null);
  async function go() {
    setBusy(true); setError(""); setReport(null);
    try { setReport((await run({ data: { topic, strict, language } })).report); }
    catch (e) { setError(e instanceof Error ? e.message : "The dossier could not be generated."); }
    finally { setBusy(false); }
  }
  return <div>
    <p className="text-sm text-muted-foreground">{DOSSIER_HELP}</p>
    <p className="mt-4 text-xs text-muted-foreground">Your submission may be processed by search and AI providers. Do not submit confidential, regulated, or unpublished material. See <Link to="/privacy" className="underline">Privacy</Link> and <Link to="/methodology" className="underline">Methodology</Link>.</p>
    <Label htmlFor="dossier-topic" className="mt-3 block font-semibold">Research Topic or Niche Question</Label>
    <Textarea id="dossier-topic" className="mt-2 min-h-48" value={topic} onChange={e => setTopic(e.target.value)} maxLength={2000} placeholder="e.g. How have microplastics in drinking water been measured since 2015, and where do studies disagree?" />
    <div className="mt-3 flex items-center gap-2"><Checkbox id="dossier-strict" checked={strict} onCheckedChange={v => setStrict(v === true)} /><Label htmlFor="dossier-strict">Strict Deduplication Mode (Removes syndicated/repeated content)</Label></div>
    <p role="note" className="mt-4 border-s-2 border-warning bg-warning-soft p-3 text-sm">This process performs multi-pass synthesis and may take 60-90 seconds. Only publicly available, high-credibility sources are analyzed.</p>
    {user
      ? <Button className="mt-4" disabled={busy || topic.trim().length < 10} onClick={go}>{busy ? <><Loader2 className="animate-spin" /> Building dossier…</> : "Generate Deep Dossier"}</Button>
      : <Button className="mt-4" asChild><Link to="/auth">Sign in free to generate a dossier</Link></Button>}
    <div aria-live="polite">{busy && <p className="mt-2 text-sm text-muted-foreground">Searching, removing duplicates and writing three passes — this is an estimate of progress, not a finished step.</p>}</div>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {report && <div className="mt-12 border-t border-border pt-8"><ReportView report={report} /></div>}
  </div>;
}
