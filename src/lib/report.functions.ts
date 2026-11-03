import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MONTHLY_REPORT_LIMIT, reportInput, wordCount } from "./report-schema";
import { buildReport } from "./research.server";
import { paymentEnvironment } from "./payments-env.server";
import { guardVerificationRequest } from "./verification-guard.server";
import { createProgressEmitter } from "./progress.server";

export { MONTHLY_REPORT_LIMIT };
export type { ResearchReport } from "./report-schema";

function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}
async function reportLimit(context: {
  supabase: {
    rpc: (
      name: "has_active_subscription",
      args: { user_uuid: string; check_env: string },
    ) => PromiseLike<{ data: boolean | null; error: unknown }>;
  };
  userId: string;
}) {
  const { isAdminUser } = await import("./db.server");
  if (await isAdminUser(context.userId)) return 100000;
  const { data, error } = await context.supabase.rpc("has_active_subscription", {
    user_uuid: context.userId,
    check_env: paymentEnvironment(),
  });
  if (error) throw new Error("Could not check your plan. Please try again.");
  return data ? 50 : MONTHLY_REPORT_LIMIT;
}

export const getReportUsage = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart());
    return { used: count ?? 0, limit: await reportLimit(context) };
  });

export const generateReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => reportInput.parse(data))
  .handler(async ({ data, context }) => {
    const meta = { userId: context.userId };
    await guardVerificationRequest({ userId: context.userId, fingerprint: "" });
    const { count } = await context.supabase
      .from("reports")
      .select("id", { count: "exact", head: true })
      .gte("created_at", monthStart());
    const limit = await reportLimit(context);
    if ((count ?? 0) >= limit)
      return {
        limitReached: true as const,
        message: `You've used your ${limit} reports this month.`,
      };
    const { consumeCredits, meter, CREDIT_COSTS } = await import("./metering.server");
    const credits = await consumeCredits(
      context.userId,
      "report_created",
      CREDIT_COSTS.report_created,
      `report:${crypto.randomUUID()}`,
    );
    const t0 = Date.now();
    if (data.attachment) void meter({ userId: context.userId, event: "document_upload" });
    const { progress: progressInput, ...request } = data;
    const progress = createProgressEmitter(progressInput);
    await progress("validation");
    let report;
    try {
      report = await buildReport(request, meta, progress);
    } catch (e) {
      await credits.refund();
      void meter({
        userId: context.userId,
        event: "report_created",
        success: false,
        latencyMs: Date.now() - t0,
      });
      throw e;
    }
    await progress("rendering");
    const { data: row, error } = await context.supabase
      .from("reports")
      .insert({
        user_id: context.userId,
        question: data.question,
        title: report.title,
        content: report as never,
      })
      .select("id")
      .single();
    if (error) throw new Error("The report was written but could not be saved. Please try again.");
    void meter({
      userId: context.userId,
      event: "report_created",
      reportId: row.id,
      latencyMs: Date.now() - t0,
      provider: "openrouter",
      modelRoute: "deepseek>qwen",
    });
    await progress("complete");
    return { id: row.id, report, words: wordCount(report) };
  });

// Research reports require a signed-in account (owner decision, Nov 1 2026):
// guests may run claim checks and citation scans, but fresh report generation
// is authenticated-only so unauthenticated callers can never trigger paid model
// calls. There is intentionally no guest report server function.
