import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { checkOne, extractRefs, parseBib, type CitationResult } from "./citation.server";
import { claimUsage, usageFor } from "./usage.server";

export type { CitationResult, CitationStatus } from "./citation.server";

export const FREE_REF_LIMIT = 20;

export const getScanUsage = createServerFn({ method: "GET" }).handler(() => usageFor("scan"));

export const verifyCitations = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().trim().min(20).max(200000) }).parse(d))
  .handler(async ({ data }) => {
    const { release } = await claimUsage("scan");
    const { identify } = await import("./usage.server");
    const { consumeCredits, meter, CREDIT_COSTS } = await import("./metering.server");
    const who = await identify();
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
      return { results, total, limit: FREE_REF_LIMIT };
    } catch (e) {
      await release(); await credits?.refund();
      if (e instanceof Error && /^(engine|credits|engine-missing)$/.test(e.message)) throw new Error("Couldn't read citations from this text right now. Please try again in a minute.");
      throw e;
    }
  });
