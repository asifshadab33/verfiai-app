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
import { uiText } from "@/lib/ui-extra-i18n";

export const DOSSIER_HELP = uiText("en", "dossierHelp");

export function DossierForm({ language = "English" }: { language?: string }) {
  const { user } = useAuth();
  const u = (k: Parameters<typeof uiText>[1]) => uiText(language, k);
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
    <p className="text-sm text-muted-foreground">{u("dossierHelp")}</p>
    <p className="mt-4 text-xs text-muted-foreground">Your submission may be processed by search and AI providers. Do not submit confidential, regulated, or unpublished material. See <Link to="/privacy" className="underline">Privacy</Link> and <Link to="/methodology" className="underline">Methodology</Link>.</p>
    <Label htmlFor="dossier-topic" className="mt-3 block font-semibold">{u("dossierTopic")}</Label>
    <Textarea id="dossier-topic" className="mt-2 min-h-48" value={topic} onChange={e => setTopic(e.target.value)} maxLength={2000} placeholder="e.g. How have microplastics in drinking water been measured since 2015, and where do studies disagree?" />
    <div className="mt-3 flex items-center gap-2"><Checkbox id="dossier-strict" checked={strict} onCheckedChange={v => setStrict(v === true)} /><Label htmlFor="dossier-strict">{u("dossierStrict")}</Label></div>
    <p role="note" className="mt-4 border-s-2 border-warning bg-warning-soft p-3 text-sm">{u("dossierWarn")}</p>
    {user
      ? <Button className="mt-4" disabled={busy || topic.trim().length < 10} onClick={go}>{busy ? <><Loader2 className="animate-spin" /> {u("dossierBusy")}</> : u("dossierGenerate")}</Button>
      : <Button className="mt-4" asChild><Link to="/auth">{u("dossierSignIn")}</Link></Button>}
    <div aria-live="polite">{busy && <p className="mt-2 text-sm text-muted-foreground">Searching, removing duplicates and writing three passes — this is an estimate of progress, not a finished step.</p>}</div>
    {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
    {report && <div className="mt-12 border-t border-border pt-8"><ReportView report={report} /></div>}
  </div>;
}
