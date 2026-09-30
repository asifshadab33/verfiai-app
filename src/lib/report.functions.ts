import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MONTHLY_REPORT_LIMIT, reportInput, wordCount } from "./report-schema";
import { buildReport, sha } from "./research.server";

export { MONTHLY_REPORT_LIMIT };
export type { ResearchReport } from "./report-schema";

function monthStart() { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString(); }
function paymentEnv(): "sandbox" | "live" {
  const host = getRequestHeader("host") ?? "";
  return host.includes("localhost") || host.includes("-dev.lovable.app") || host.includes("id-preview--") ? "sandbox" : "live";
}
async function reportLimit(context: { supabase: { rpc: (name: "has_active_subscription", args: { user_uuid: string; check_env: string }) => PromiseLike<{ data: boolean | null; error: unknown }> }; userId: string }) {
  const { data, error } = await context.supabase.rpc("has_active_subscription", { user_uuid: context.userId, check_env: paymentEnv() });
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
    const { count } = await context.supabase.from("reports").select("id", { count: "exact", head: true }).gte("created_at", monthStart());
    const limit = await reportLimit(context);
    if ((count ?? 0) >= limit) return { limitReached: true as const, message: `You've used your ${limit} reports this month.` };
    const report = await buildReport(data);
    const { data: row, error } = await context.supabase.from("reports")
      .insert({ user_id: context.userId, question: data.question, title: report.title, content: report as never })
      .select("id").single();
    if (error) throw new Error("The report was written but could not be saved. Please try again.");
    return { id: row.id, report, words: wordCount(report) };
  });

// One free report per device/network for visitors who are not signed in (server-enforced).
export const generateGuestReport = createServerFn({ method: "POST" })
  .inputValidator((data) => reportInput.parse(data))
  .handler(async ({ data }) => {
    const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ua = getRequestHeader("user-agent") ?? "";
    const fingerprint = sha(`${ip}|${ua}|verifai-guest`);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error: claimErr } = await supabaseAdmin.from("guest_usage").insert({ fingerprint });
    if (claimErr) return { limitReached: true as const, message: "You've used your free report. Sign in with Google or email to get 3 more every month." };
    try {
      const report = await buildReport(data);
      return { report, words: wordCount(report) };
    } catch (e) {
      await supabaseAdmin.from("guest_usage").delete().eq("fingerprint", fingerprint);
      throw e;
    }
  });
