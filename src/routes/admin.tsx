import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContentPage } from "@/components/verifai/ContentPage";
import { useAuth } from "@/hooks/useAuth";
import { getAdminStatus, getSystemHealth, getUsageAnalytics, testModel, testSearch } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Admin dashboard | Verfiai" }, { name: "robots", content: "noindex, nofollow" },
    { name: "description", content: "Verfiai internal testing and analysis dashboard." },
    { property: "og:title", content: "Admin dashboard | Verfiai" }, { property: "og:description", content: "Internal testing dashboard." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: AdminPage,
});

type Health = Awaited<ReturnType<typeof getSystemHealth>>;
type Usage = Awaited<ReturnType<typeof getUsageAnalytics>>;
type ModelResult = Awaited<ReturnType<typeof testModel>>;
type SearchResult = Awaited<ReturnType<typeof testSearch>>;

const Dot = ({ ok }: { ok: boolean }) => <span className={`inline-block size-2.5 rounded-full ${ok ? "bg-success" : "bg-destructive"}`} aria-label={ok ? "ok" : "not ok"} />;
const Card = ({ title, children }: { title: string; children: ReactNode }) => <section className="mt-8 border border-border bg-card p-5"><h2 className="font-display text-xl font-bold">{title}</h2><div className="mt-4">{children}</div></section>;

function AdminPage() {
  const { user, loading } = useAuth();
  const status = useServerFn(getAdminStatus), health = useServerFn(getSystemHealth), usage = useServerFn(getUsageAnalytics);
  const runModel = useServerFn(testModel), runSearch = useServerFn(testSearch);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [h, setH] = useState<Health | null>(null);
  const [u, setU] = useState<Usage | null>(null);
  const [days, setDays] = useState(7);
  const [modelRes, setModelRes] = useState<Record<string, ModelResult | "running">>({});
  const [searchRes, setSearchRes] = useState<Record<string, SearchResult | "running">>({});
  const [query, setQuery] = useState("Is lightning hotter than the sun?");

  useEffect(() => { if (user) status().then(r => setIsAdmin(r.isAdmin)).catch(() => setIsAdmin(false)); }, [user]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAdmin) health().then(setH).catch(() => {}); }, [isAdmin]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (isAdmin) usage({ data: { days } }).then(setU).catch(() => {}); }, [isAdmin, days]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading || (user && isAdmin === null)) return <ContentPage title="Admin" intro="Loading…"><Loader2 className="animate-spin" /></ContentPage>;
  if (!user) return <ContentPage title="Admin" intro="Sign in with an admin account to continue."><Button asChild><Link to="/auth">Sign in</Link></Button></ContentPage>;
  if (!isAdmin) return <ContentPage title="Admin" intro="This account doesn't have admin access."><Link to="/" className="text-brand underline">Back home</Link></ContentPage>;

  const models = h ? [...new Set([...h.routes.evaluation, ...h.routes.triage])] : [];
  const testAllModels = async () => { for (const m of models) { setModelRes(r => ({ ...r, [m]: "running" })); const res = await runModel({ data: { model: m } }).catch(e => ({ ok: false, latencyMs: 0, output: "", error: String(e) })); setModelRes(r => ({ ...r, [m]: res })); } };
  const testOne = async (m: string) => { setModelRes(r => ({ ...r, [m]: "running" })); const res = await runModel({ data: { model: m } }); setModelRes(r => ({ ...r, [m]: res })); };
  const searchOne = async (e: string) => { setSearchRes(r => ({ ...r, [e]: "running" })); const res = await runSearch({ data: { engine: e, query } }); setSearchRes(r => ({ ...r, [e]: res })); };

  return <ContentPage title="Admin dashboard" intro="Test AI providers and search engines, view usage metering and system health. Your account bypasses usage limits.">
    <Card title="System health">{!h ? <Loader2 className="animate-spin" /> : <div className="grid gap-6 md:grid-cols-3 text-sm">
      <div><h3 className="font-semibold">Database</h3><p className="mt-2 flex items-center gap-2"><Dot ok={h.database.ok} /> {h.database.ok ? "Reachable" : "Error"} · {h.database.latencyMs} ms</p></div>
      <div><h3 className="font-semibold">AI provider keys</h3><ul className="mt-2 space-y-1">{h.models.map(m => <li key={m.id} className="flex items-center gap-2"><Dot ok={m.configured} /> {m.id}</li>)}</ul></div>
      <div><h3 className="font-semibold">Search engines</h3><ul className="mt-2 space-y-1">{h.search.map(s => <li key={s.id} className="flex items-center gap-2"><Dot ok={s.configured} /> {s.id}{!s.needsKey && <span className="text-xs text-muted-foreground">(free)</span>}</li>)}</ul></div>
    </div>}</Card>

    <Card title="AI provider tests"><Button size="sm" onClick={testAllModels} disabled={!h}>Test all in order</Button>
      <div className="mt-4 overflow-x-auto"><table className="w-full text-sm"><thead><tr className="text-start text-muted-foreground"><th className="p-2 text-start">Model</th><th className="p-2 text-start">Result</th><th className="p-2 text-start">Latency</th><th className="p-2 text-start">Output / error</th><th /></tr></thead>
        <tbody>{models.map(m => { const r = modelRes[m]; return <tr key={m} className="border-t border-border align-top"><td className="p-2 font-mono text-xs">{m}</td><td className="p-2">{r === "running" ? <Loader2 className="size-4 animate-spin" /> : r ? <Dot ok={r.ok} /> : "—"}</td><td className="p-2">{r && r !== "running" ? `${r.latencyMs} ms` : ""}</td><td className="max-w-md p-2 break-words text-xs text-muted-foreground">{r && r !== "running" ? (r.ok ? r.output : r.error) : ""}</td><td className="p-2"><Button size="sm" variant="outline" onClick={() => testOne(m)}>Test</Button></td></tr>; })}</tbody></table></div>
    </Card>

    <Card title="Search engine tests"><Input value={query} onChange={e => setQuery(e.target.value)} aria-label="Test query" maxLength={200} />
      <div className="mt-4 space-y-3">{h?.search.map(s => { const r = searchRes[s.id]; return <div key={s.id} className="border-t border-border pt-3 text-sm"><div className="flex items-center gap-3"><Button size="sm" variant="outline" onClick={() => searchOne(s.id)}>Test {s.id}</Button>{r === "running" ? <Loader2 className="size-4 animate-spin" /> : r ? <span><Dot ok={r.count > 0} /> {r.count} results · {r.latencyMs} ms</span> : null}</div>{r && r !== "running" && <ul className="mt-2 ms-4 list-disc text-xs">{r.results.map(x => <li key={x.url}><a href={x.url} target="_blank" rel="noreferrer" className="text-brand underline">{x.title}</a></li>)}</ul>}</div>; })}</div>
      <p className="mt-3 text-xs text-muted-foreground">Results are cached for 24 hours, so a repeat test may return instantly.</p>
    </Card>

    <Card title="Usage metering"><div className="flex gap-2">{[1, 7, 30, 90].map(d => <Button key={d} size="sm" variant={days === d ? "default" : "outline"} onClick={() => setDays(d)}>{d}d</Button>)}</div>
      {!u ? <Loader2 className="mt-4 animate-spin" /> : <div className="mt-4 grid gap-6 text-sm md:grid-cols-2">
        <div><p><strong>{u.total}</strong> events · <strong>{u.users}</strong> signed-in users</p><h3 className="mt-3 font-semibold">By event</h3><ul className="mt-1">{u.byEvent.map(([k, n]) => <li key={k} className="flex justify-between border-b border-border py-1"><span>{k}</span><span>{n}</span></li>)}</ul></div>
        <div><h3 className="font-semibold">AI calls by model</h3><table className="mt-1 w-full text-xs"><thead><tr><th className="text-start">Model</th><th>Calls</th><th>Fail</th><th>Avg ms</th><th>Est. $</th></tr></thead><tbody>{u.byProvider.map(p => <tr key={p.id} className="border-b border-border"><td className="py-1 font-mono">{p.id}</td><td className="text-center">{p.calls}</td><td className="text-center">{p.failures}</td><td className="text-center">{p.avgLatencyMs}</td><td className="text-center">{p.estCostUsd}</td></tr>)}</tbody></table></div>
        <div className="md:col-span-2"><h3 className="font-semibold">Recent events</h3><ul className="mt-1 text-xs">{u.recent.map((r, i) => <li key={i} className="flex gap-3 border-b border-border py-1"><Dot ok={r.success} /><span>{new Date(r.at).toLocaleString()}</span><span>{r.event}</span><span className="font-mono text-muted-foreground">{r.route}</span><span>{r.latencyMs ?? ""}{r.latencyMs ? " ms" : ""}</span></li>)}</ul></div>
      </div>}
    </Card>
  </ContentPage>;
}
