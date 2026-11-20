import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { readAccountStatus } from "./account-status";
import { paymentEnvironment } from "./payments-env.server";

export const getAccountStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(({ context }) => readAccountStatus(context.supabase, context.userId, paymentEnvironment()));