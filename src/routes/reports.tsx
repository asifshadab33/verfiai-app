import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/useAuth";
import { ReportView } from "@/components/verifai/ReportView";
import type { ResearchReport } from "@/lib/report.functions";
import { getSubscription, getBillingPortal } from "@/lib/payments.functions";
import { getPaddleEnvironment } from "@/lib/paddle";
import { useServerFn } from "@tanstack/react-start";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [
    { title: "My reports | VerifAI" }, { name: "description", content: "Your saved VerifAI research reports." },
    { property: "og:title", content: "My reports | VerifAI" }, { property: "og:description", content: "Your saved VerifAI research reports." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Reports,
});

function Reports() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [plan, setPlan] = useState<{ isPro: boolean; status: string | null; periodEnd: string | null; cancelAtPeriodEnd: boolean } | null>(null);
  const [billingError, setBillingError] = useState("");
  const fetchPlan = useServerFn(getSubscription);
  const portal = useServerFn(getBillingPortal);
  useEffect(() => { if (!user) return; fetchPlan({ data: { environment: getPaddleEnvironment() } }).then(setPlan).catch(() => setPlan(null)); }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps
  async function manageBilling() { setBillingError(""); try { const url = await portal({ data: { environment: getPaddleEnvironment() } }); window.open(url, "_blank", "noopener,noreferrer"); } catch { setBillingError("Billing could not open. Please try again."); } }
  useEffect(() => { if (!loading && !user) navigate({ to: "/auth" }); }, [loading, user, navigate]);
  const { data, isLoading } = useQuery({
    queryKey: ["reports", user?.id], enabled: !!user,
    queryFn: async () => { const { data, error } = await supabase.from("reports").select("id,title,question,content,created_at").order("created_at", { ascending: false }); if (error) throw error; return data; },
  });
  async function remove(id: string) { await supabase.from("reports").delete().eq("id", id); if (openId === id) setOpenId(null); qc.invalidateQueries({ queryKey: ["reports"] }); }
  async function out() { await qc.cancelQueries(); qc.clear(); await signOut(); navigate({ to: "/auth", replace: true }); }
  const open = data?.find(r => r.id === openId);
  if (loading || !user) return <div className="flex min-h-screen items-center justify-center"><LoaderCircle className="animate-spin" /></div>;
  return <div className="mx-auto min-h-screen max-w-6xl px-5 py-10">
    <div className="flex flex-wrap items-center justify-between gap-3 print:hidden"><Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-brand"><ArrowLeft className="size-4" />Back to workspace</Link><div className="flex items-center gap-3 text-sm text-muted-foreground"><span>{user.email}</span><Button variant="outline" size="sm" onClick={out}>Sign out</Button></div></div>
    <h1 className="mt-8 font-display text-3xl font-bold print:hidden">My reports</h1>
    {plan?.isPro && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-border py-4 print:hidden"><p className="text-sm"><strong>Pro active</strong>{plan.status === "past_due" ? " · Payment needs attention" : plan.cancelAtPeriodEnd ? " · Cancels at period end" : " · 50 reports/month, watermark-free exports"}{plan.periodEnd ? ` · Current period ends ${new Date(plan.periodEnd).toLocaleDateString()}` : ""}</p><Button variant="outline" onClick={manageBilling}>Manage billing</Button>{billingError && <p role="alert" className="w-full text-sm text-destructive">{billingError}</p>}</div>}
    {open ? <div className="mt-8"><Button variant="ghost" className="mb-6 print:hidden" onClick={() => setOpenId(null)}><ArrowLeft />All reports</Button><ReportView report={open.content as unknown as ResearchReport} reportId={open.id} date={new Date(open.created_at).toLocaleDateString()} /></div>
      : isLoading ? <LoaderCircle className="mt-8 animate-spin" />
      : !data?.length ? <p className="mt-6 text-muted-foreground">No reports yet. <Link to="/" className="text-brand underline">Generate your first report</Link>.</p>
      : <ul className="mt-8 divide-y divide-border border-y border-border">{data.map(r => <li key={r.id} className="flex items-start justify-between gap-4 py-5"><button className="text-left" onClick={() => setOpenId(r.id)}><p className="font-semibold hover:text-brand">{r.title}</p><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{r.question}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p></button><Button variant="ghost" size="icon" aria-label="Delete report" onClick={() => remove(r.id)}><Trash2 /></Button></li>)}</ul>}
  </div>;
}
