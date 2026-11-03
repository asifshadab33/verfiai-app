import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkOne, extractRefs, parseBib, type CitationResult } from "./citation.server";
import { claimUsage, usageFor } from "./usage.server";
import { guardVerificationRequest, getVerificationResponse, saveVerificationResponse, verificationResponseKey } from "./verification-guard.server";

export type { CitationResult, CitationStatus } from "./citation.server";

export const FREE_REF_LIMIT = 20;

export const getScanUsage = createServerFn({ method: "GET" }).handler(() => usageFor("scan"));

export const verifyCitations = createServerFn({ method: "POST" })
  .validator((d) => z.object({ text: z.string().trim().min(20).max(200000) }).parse(d))
  .handler(async ({ data }) => {
    const { identify } = await import("./usage.server");
    const { consumeCredits, meter, CREDIT_COSTS } = await import("./metering.server");
    const who = await identify();
    await guardVerificationRequest(who);
    const responseKey = verificationResponseKey(who, "scan", data.text);
    const hit = await getVerificationResponse<{ results: CitationResult[]; total: number; limit: number }>(responseKey);
    if (hit) return hit;
    const { release } = await claimUsage("scan");
    let credits: { refund: () => Promise<void> } | null = null;
    try {
      let refs = /@\w+\s*\{/.test(data.text) ? parseBib(data.text) : [];
      if (!refs.length) refs = await extractRefs(data.text.slice(0, 60000));
      const total = refs.length;
      refs = refs.slice(0, FREE_REF_LIMIT);
      if (who.userId && refs.length) credits = await consumeCredits(who.userId, "citation_scan", CREDIT_COSTS.citation_scan(refs.length), `scan:${crypto.randomUUID()}`);
      void meter({ userId: who.userId, guestFingerprint: who.fingerprint, event: "citation_lookup", quantity: refs.length, provider: "crossref" });
      const results: CitationResult[] = [];
      for (let i = 0; i < refs.length; i += 6) results.push(...(await Promise.all(refs.slice(i, i + 6).map(checkOne))));
      if (!results.length) await release();
      const response = { results, total, limit: FREE_REF_LIMIT };
      if (results.length) await saveVerificationResponse(responseKey, response);
      return response;
    } catch (e) {
      await release(); await credits?.refund();
      if (e instanceof Error && /^(engine|credits|engine-missing)$/.test(e.message)) throw new Error("Couldn't read citations from this text right now. Please try again in a minute.");
      throw e;
    }
  });
