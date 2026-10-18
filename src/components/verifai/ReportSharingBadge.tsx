import { useState } from "react";
import { Copy, Check, UserRound } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

export function ReportSharingBadge({ token }: { token: string }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  async function copy() {
    const href = `https://verfiai.app/r/${encodeURIComponent(token)}`;
    const html = `<a href="${href}" target="_blank" rel="noopener noreferrer"><img src="https://verfiai.app/evidence-checked.svg" width="258" height="36" alt="Evidence-checked by Verfiai" /></a>`;
    try { await navigator.clipboard.writeText(html); setCopied(true); setError(""); }
    catch { setError("Couldn't copy the badge. Please allow clipboard access and try again."); }
  }
  return <section aria-label="Report sharing" className="mt-8 border-y border-border py-6 print:hidden">
    <div className="flex flex-wrap items-center gap-4">
      <img src="/evidence-checked.svg" alt="Evidence-checked by Verfiai" width="258" height="36" />
      <Button variant="outline" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? "Badge copied" : "Copy embed badge"}</Button>
    </div>
    <p className="mt-3 text-xs text-muted-foreground">Source-linked AI analysis, not a certification of accuracy. Review the cited evidence.</p>
    <p role="status" className="mt-2 text-xs text-destructive">{error}</p>
    {!user && <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <div><h2 className="font-semibold">Save your next report</h2><p className="mt-1 text-sm text-muted-foreground">Create a free account to keep the reports you generate in your library.</p></div>
      <Button asChild><Link to="/auth"><UserRound />Sign up to save reports</Link></Button>
    </div>}
  </section>;
}