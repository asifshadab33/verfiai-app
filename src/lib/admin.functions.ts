import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// Every admin function verifies the caller's role through their own RLS-scoped client first.
async function assertAdmin(context: { supabase: { rpc: (n: "has_role", a: { _user_id: string; _role: "admin" }) => PromiseLike<{ data: boolean | null }> }; userId: string }) {
  const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (data !== true) throw new Error("Forbidden");
}

export const getAdminStatus = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => { const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" }); return { isAdmin: data === true }; });

const SEARCH_KEYS: Record<string, string | null> = { tavily: "TAVILY_API_KEY", brave: "BRAVE_SEARCH_API_KEY", youcom: "YDC_API_KEY", searxng: "SEARXNG_BASE_URL", gdelt: null, crossref: null, wikipedia: null, ddg: null, openalex: null, pubmed: null, openalex_oa: null, semanticscholar: null, core: "CORE_DISABLED", scribd: "TAVILY_API_KEY" };

/** Which providers are configured (true/false only — never key values) and database reachability. */
export const getSystemHealth = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context);
    const { PROVIDERS, ROUTES } = await import("./model.server");
    const { admin } = await import("./db.server");
    const db = await admin();
    const t0 = Date.now();
    const { error } = await db.from("research_cache").select("key", { head: true, count: "exact" }).limit(1);
    return {
      database: { ok: !error, latencyMs: Date.now() - t0 },
      models: Object.entries(PROVIDERS).map(([id, p]) => ({ id, configured: !!process.env[p.keyEnv] })),
      routes: { triage: [...ROUTES.triage], evaluation: [...ROUTES.evaluation] },
      search: Object.entries(SEARCH_KEYS).map(([id, k]) => ({ id, configured: k ? !!process.env[k] : true, needsKey: !!k })),
    };
  });

export const testModel = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .validator(d => z.object({ model: z.string().min(1).max(120) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { callEngine, hasKey } = await import("./model.server");
    if (!hasKey(data.model)) return { ok: false, latencyMs: 0, output: "", error: "No key configured" };
    const t0 = Date.now();
    try {
      const out = await callEngine(data.model, 'Reply with JSON only: {"ok":true,"answer":"<one short sentence>"}', "Say hello and name the capital of France.", { userId: context.userId, purpose: "admin_test" });
      return { ok: true, latencyMs: Date.now() - t0, output: out.slice(0, 500), error: "" };
    } catch (e) { return { ok: false, latencyMs: Date.now() - t0, output: "", error: e instanceof Error ? e.message : "failed" }; }
  });

export const testSearch = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth])
  .validator(d => z.object({ engine: z.string().min(1).max(30), query: z.string().trim().min(2).max(200) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { engineSearch } = await import("./search.server");
    const t0 = Date.now();
    const r = await engineSearch(data.engine, data.query);
    return { count: r.length, latencyMs: Date.now() - t0, results: r.slice(0, 5).map(s => ({ title: s.title, url: s.url })) };
  });

/** Usage metering summary for the last N days (aggregated; no submitted text). */
export const getUsageAnalytics = createServerFn({ method: "GET" }).middleware([requireSupabaseAuth])
  .validator(d => z.object({ days: z.number().int().min(1).max(90) }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { admin } = await import("./db.server");
    const db = await admin();
    const since = new Date(Date.now() - data.days * 864e5).toISOString();
    const { data: rows } = await db.from("usage_meter").select("event_type, provider, model_route, success, latency_ms, estimated_cost_usd, user_id, created_at").gte("created_at", since).order("created_at", { ascending: false }).limit(5000);
    const list = rows ?? [];
    const byEvent: Record<string, number> = {};
    const byProvider: Record<string, { calls: number; failures: number; totalLatency: number; cost: number }> = {};
    for (const r of list) {
      byEvent[r.event_type] = (byEvent[r.event_type] ?? 0) + 1;
      if (r.event_type === "ai_model_call") {
        const k = r.model_route ?? r.provider ?? "unknown";
        const p = (byProvider[k] ??= { calls: 0, failures: 0, totalLatency: 0, cost: 0 });
        p.calls++; if (!r.success) p.failures++; p.totalLatency += r.latency_ms ?? 0; p.cost += Number(r.estimated_cost_usd ?? 0);
      }
    }
    return {
      total: list.length, users: new Set(list.map(r => r.user_id).filter(Boolean)).size,
      byEvent: Object.entries(byEvent).sort((a, b) => b[1] - a[1]),
      byProvider: Object.entries(byProvider).map(([id, p]) => ({ id, calls: p.calls, failures: p.failures, avgLatencyMs: Math.round(p.totalLatency / p.calls), estCostUsd: Number(p.cost.toFixed(4)) })).sort((a, b) => b.calls - a.calls),
      recent: list.slice(0, 25).map(r => ({ at: r.created_at, event: r.event_type, route: r.model_route ?? r.provider ?? "", success: r.success, latencyMs: r.latency_ms })),
    };
  });
