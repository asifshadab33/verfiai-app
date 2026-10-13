import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const generateDossier = createServerFn({ method: "POST" })
  .inputValidator(d => z.object({ topic: z.string().trim().min(10).max(2000), strict: z.boolean().default(true), language: z.string().max(50).default("English") }).parse(d))
  .handler(async ({ data }) => {
    const { identify } = await import("./usage.server");
    const { guardVerificationRequest } = await import("./verification-guard.server");
    const { consumeCredits, meter, CREDIT_COSTS } = await import("./metering.server");
    const { generateDeepDossier, getLanguageName } = await import("./research.server");
    const who = await identify();
    if (!who.userId) throw new Error("Sign in to generate a Deep Dossier.");
    await guardVerificationRequest(who);
    const credits = await consumeCredits(who.userId, "deep_research_report", CREDIT_COSTS.deep_research_report, `dossier:${crypto.randomUUID()}`);
    const t0 = Date.now();
    try {
      const lang = getLanguageName(data.language);
      const li = lang.toLowerCase() === "english" ? "" : `CRITICAL LANGUAGE RULE: write all human-readable text strictly in ${lang}.`;
      const report = await generateDeepDossier(data.topic, { strict: data.strict, language: lang, languageInstruction: li, meta: { userId: who.userId } });
      void meter({ userId: who.userId, event: "deep_research_report", latencyMs: Date.now() - t0, quantity: report.bibliography?.length ?? 0 });
      return { report };
    } catch (e) {
      await credits.refund();
      void meter({ userId: who.userId, event: "deep_research_report", success: false, latencyMs: Date.now() - t0 });
      throw e;
    }
  });
