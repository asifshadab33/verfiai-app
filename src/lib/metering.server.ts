// UsageMeter + CreditLedger. All quota decisions happen here on the server; the browser only displays results.
import { admin } from "./db.server";
import { paymentEnvironment } from "./payments-env.server";

export type MeterEvent =
  | "quick_claim_check" | "report_created" | "claims_extracted" | "deep_research_report"
  | "document_upload" | "document_pages_processed" | "web_search" | "source_extraction"
  | "citation_lookup" | "ai_model_call" | "evaluator_escalation" | "tie_breaker_call"
  | "evidence_refresh" | "export_generation" | "resource_preview" | "resource_download";

// Server-side configuration: credits per operation and per plan per billing cycle.
export const CREDIT_COSTS = {
  quick_claim_check: 1,
  report_created: 3,
  deep_research_report: 10,
  evidence_refresh: 1,
  citation_scan: (refs: number) => (refs <= 10 ? 1 : refs <= 25 ? 2 : 3),
} as const;
export const PLAN_CREDITS = { free: 30, pro: 300 } as const;

function monthPeriod() {
  const d = new Date();
  return {
    start: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString(),
    end: new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString(),
  };
}

/** Plan and billing period come from the verified subscription row, else the calendar month. */
export async function billingContext(userId: string | null) {
  if (!userId) return { plan: "guest" as const, allowance: 0, ...monthPeriod() };
  const db = await admin();
  const { data } = await db.from("subscriptions")
    .select("current_period_start, current_period_end, status")
    .eq("user_id", userId).eq("environment", paymentEnvironment()).eq("product_id", "pro_plan")
    .in("status", ["active", "trialing", "past_due", "canceled"])
    .gt("current_period_end", new Date().toISOString())
    .order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (data?.current_period_start && data.current_period_end)
    return { plan: "pro" as const, allowance: PLAN_CREDITS.pro, start: data.current_period_start, end: data.current_period_end };
  return { plan: "free" as const, allowance: PLAN_CREDITS.free, ...monthPeriod() };
}

/** Atomically consumes credits before expensive work. Same idempotency key = no double charge on retries. */
export async function consumeCredits(userId: string, operation: string, cost: number, idempotencyKey: string) {
  const { isAdminUser } = await import("./db.server");
  if (await isAdminUser(userId)) return { remaining: Number.MAX_SAFE_INTEGER, refund: async () => {} };
  const ctx = await billingContext(userId);
  const db = await admin();
  const { data, error } = await db.rpc("consume_credits", {
    _user: userId, _op: operation, _cost: cost, _allowance: ctx.allowance,
    _pstart: ctx.start, _pend: ctx.end, _key: idempotencyKey,
  });
  if (error) throw new Error("Could not check your credits. Please try again.");
  const row = Array.isArray(data) ? data[0] : data;
  if (!row?.ok) throw new Error(`You've used your ${ctx.allowance} credits for this billing cycle. They reset on ${new Date(ctx.end).toLocaleDateString("en-GB", { day: "numeric", month: "long" })}.`);
  return {
    remaining: row.remaining as number,
    refund: async () => {
      if (row.replay) return;
      await db.from("credit_ledger").insert({ user_id: userId, period_start: ctx.start, period_end: ctx.end, operation: `refund:${operation}`, delta: cost, idempotency_key: `${idempotencyKey}:refund` });
    },
  };
}

type MeterInput = {
  userId: string | null; guestFingerprint?: string; event: MeterEvent; quantity?: number;
  reportId?: string; resourceId?: string; provider?: string; modelRoute?: string;
  latencyMs?: number; success?: boolean; estimatedCostUsd?: number; idempotencyKey?: string;
};

/** Records a usage event for cost tracking. Never throws — metering must not break user flows. */
export async function meter(e: MeterInput) {
  try {
    const ctx = await billingContext(e.userId);
    const db = await admin();
    await db.from("usage_meter").upsert({
      user_id: e.userId, guest_fingerprint: e.userId ? null : e.guestFingerprint ?? null,
      plan: ctx.plan, period_start: ctx.start, period_end: ctx.end,
      event_type: e.event, quantity: e.quantity ?? 1, report_id: e.reportId ?? null, resource_id: e.resourceId ?? null,
      provider: e.provider ?? null, model_route: e.modelRoute ?? null, latency_ms: e.latencyMs ?? null,
      success: e.success ?? true, estimated_cost_usd: e.estimatedCostUsd ?? null, idempotency_key: e.idempotencyKey ?? null,
    }, { onConflict: "idempotency_key", ignoreDuplicates: true });
  } catch (err) { console.error("meter failed", err); }
}

/** User-facing credit summary (no provider costs). */
export async function creditSummary(userId: string) {
  const ctx = await billingContext(userId);
  const db = await admin();
  const { data } = await db.from("credit_ledger").select("delta").eq("user_id", userId).eq("period_start", ctx.start);
  const used = Math.max(0, -(data ?? []).reduce((s, r) => s + r.delta, 0));
  return { plan: ctx.plan, included: ctx.allowance, used, remaining: Math.max(0, ctx.allowance - used), resetsAt: ctx.end };
}
