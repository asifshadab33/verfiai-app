import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { ArrowLeft, LoaderCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/useAuth";
import { ReportView } from "@/components/verifai/ReportView";
import type { ResearchReport } from "@/lib/report.functions";

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
    {open ? <div className="mt-8"><Button variant="ghost" className="mb-6 print:hidden" onClick={() => setOpenId(null)}><ArrowLeft />All reports</Button><ReportView report={open.content as unknown as ResearchReport} reportId={open.id} date={new Date(open.created_at).toLocaleDateString()} /></div>
      : isLoading ? <LoaderCircle className="mt-8 animate-spin" />
      : !data?.length ? <p className="mt-6 text-muted-foreground">No reports yet. <Link to="/" className="text-brand underline">Generate your first report</Link>.</p>
      : <ul className="mt-8 divide-y divide-border border-y border-border">{data.map(r => <li key={r.id} className="flex items-start justify-between gap-4 py-5"><button className="text-left" onClick={() => setOpenId(r.id)}><p className="font-semibold hover:text-brand">{r.title}</p><p className="mt-1 line-clamp-1 text-sm text-muted-foreground">{r.question}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</p></button><Button variant="ghost" size="icon" aria-label="Delete report" onClick={() => remove(r.id)}><Trash2 /></Button></li>)}</ul>}
  </div>;
}
