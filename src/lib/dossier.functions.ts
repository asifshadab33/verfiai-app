import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const generateDossier = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ topic: z.string().trim().min(10).max(2000), strict: z.boolean().default(true), language: z.string().max(50).default("English") }).parse(d))
  .handler(async ({ data, context }) => {
    const { guardVerificationRequest } = await import("./verification-guard.server");
    const { consumeCredits, meter, CREDIT_COSTS } = await import("./metering.server");
    const { generateDeepDossier, getLanguageName } = await import("./research.server");
    await guardVerificationRequest({ userId: context.userId, fingerprint: "" });
    const credits = await consumeCredits(context.userId, "deep_research_report", CREDIT_COSTS.deep_research_report, `dossier:${crypto.randomUUID()}`);
    const t0 = Date.now();
    try {
      const lang = getLanguageName(data.language);
      const li = lang.toLowerCase() === "english" ? "" : `CRITICAL LANGUAGE RULE: You MUST write all human-readable text strictly in ${lang}. Do NOT use English words or headings.`;
      const report = await generateDeepDossier(data.topic, { strict: data.strict, language: lang, languageInstruction: li, meta: { userId: context.userId, purpose: "dossier" } });
      void meter({ userId: context.userId, event: "deep_research_report", latencyMs: Date.now() - t0, quantity: report.bibliography?.length ?? 1 });
      return { report };
    } catch (e) {
      await credits.refund();
      void meter({ userId: context.userId, event: "deep_research_report", success: false, latencyMs: Date.now() - t0 });
      throw e;
    }
  });
