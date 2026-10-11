import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MONTHLY_REPORT_LIMIT, reportInput, wordCount } from "./report-schema";
import { buildReport } from "./research.server";
import { sha } from "./cache.server";
import { paymentEnvironment } from "./payments-env.server";
import { guardVerificationRequest } from "./verification-guard.server";

export { MONTHLY_REPORT_LIMIT };
export type { ResearchReport } from "./report-schema";

function monthStart() { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString(); }
async function reportLimit(context: { supabase: { rpc: (name: "has_active_subscription", args: { user_uuid: string; check_env: string }) => PromiseLike<{ data: boolean | null; error: unknown }> }; userId: string }) {
  const { isAdminUser } = await import("./db.server");
  if (await isAdminUser(context.userId)) return 100000;
  const { data, error } = await context.supabase.rpc("has_active_subscription", { user_uuid: context.userId, check_env: paymentEnvironment() });
  if (error) throw new Error("Could not check your plan. Please try again.");
  return data ? 50 : MONTHLY_REPORT_LIMIT;
}

export const getReportUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase.from("reports").select("id", { count: "exact", head: true }).gte("created_at", monthStart());
    return { used: count ?? 0, limit: await reportLimit(context) };
  });

export const generateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => reportInput.parse(data))
  .handler(async ({ data, context }) => {
    const meta = { userId: context.userId };
    await guardVerificationRequest({ userId: context.userId, fingerprint: "" });
    const { count } = await context.supabase.from("reports").select("id", { count: "exact", head: true }).gte("created_at", monthStart());
    const limit = await reportLimit(context);
    if ((count ?? 0) >= limit) return { limitReached: true as const, message: `You've used your ${limit} reports this month.` };
    const { consumeCredits, meter, CREDIT_COSTS } = await import("./metering.server");
    const credits = await consumeCredits(context.userId, "report_created", CREDIT_COSTS.report_created * (data.format === "extended" ? 3 : 1), `report:${crypto.randomUUID()}`);
    const t0 = Date.now();
    if (data.attachment) void meter({ userId: context.userId, event: "document_upload" });
    let report;
    try { report = await buildReport(data, meta); }
    catch (e) { await credits.refund(); void meter({ userId: context.userId, event: "report_created", success: false, latencyMs: Date.now() - t0 }); throw e; }
    const { data: row, error } = await context.supabase.from("reports")
      .insert({ user_id: context.userId, question: data.question, title: report.title, content: report as never })
      .select("id").single();
    if (error) throw new Error("The report was written but could not be saved. Please try again.");
    void meter({ userId: context.userId, event: "report_created", reportId: row.id, latencyMs: Date.now() - t0, provider: "openrouter", modelRoute: "deepseek>qwen" });
    return { id: row.id, report, words: wordCount(report) };
  });

// One free report per device/network for visitors who are not signed in (server-enforced).
export const generateGuestReport = createServerFn({ method: "POST" })
  .inputValidator((data) => reportInput.parse(data))
  .handler(async ({ data }) => {
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ua = getRequestHeader("user-agent") ?? "";
    const fingerprint = sha(`${ip}|${ua}|verifai-guest`);
    await guardVerificationRequest({ userId: null, fingerprint });
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: claimErr } = await supabaseAdmin.from("guest_usage").insert({ fingerprint });
    if (claimErr) return { limitReached: true as const, message: "You've used your free report. Sign in with Google or email to get 3 more every month." };
    try {
      const report = await buildReport(data, { userId: null, guestFingerprint: fingerprint });
      const { meter } = await import("./metering.server");
      void meter({ userId: null, guestFingerprint: fingerprint, event: "report_created", provider: "openrouter" });
      return { report, words: wordCount(report) };
    } catch (e) {
      await supabaseAdmin.from("guest_usage").delete().eq("fingerprint", fingerprint);
      throw e;
    }
  });
