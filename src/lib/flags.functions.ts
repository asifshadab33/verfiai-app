import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Flags evaluated for the caller (optional sign-in). UI uses this for display only; handlers re-check server-side. */
export const getFeatureFlags = createServerFn({ method: "GET" }).handler(async () => {
  const { identify } = await import("./usage.server");
  const { evaluateFlags } = await import("./flags.server");
  const who = await identify();
  return evaluateFlags(who.userId);
});

export const getCreditSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { creditSummary } = await import("./metering.server");
    return creditSummary(context.userId);
  });
