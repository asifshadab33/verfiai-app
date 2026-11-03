import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { gatewayFetch } from "./paddle.server";
import { assertMonetizationEnabled } from "./community";
import { paymentEnvironment } from "./payments-env.server";

const environment = z.enum(["sandbox", "live"]);
export const resolvePaddlePrice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ priceId: z.literal("pro_monthly"), environment }).parse(data))
  .handler(async ({ data }) => {
    assertMonetizationEnabled();
    const response = await gatewayFetch(paymentEnvironment(), `/prices?external_id=${encodeURIComponent(data.priceId)}`);
    if (!response.ok) throw new Error("Unable to load the price. Please try again.");
    const result = await response.json() as { data?: { id: string }[] };
    const id = result.data?.[0]?.id;
    if (!id) throw new Error("Pro price is not available yet.");
    return id;
  });

export const getSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ environment }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.from("subscriptions")
      .select("status,current_period_end,cancel_at_period_end,paddle_customer_id,paddle_subscription_id")
      .eq("user_id", context.userId).eq("environment", paymentEnvironment())
      .eq("product_id", "pro_plan").order("created_at", { ascending: false });
    if (error) throw error;
    const active = rows?.find(row => ["active", "trialing", "past_due", "canceled"].includes(row.status)
      && !!row.current_period_end && new Date(row.current_period_end).getTime() > Date.now());
    return { isPro: !!active, status: active?.status ?? null, periodEnd: active?.current_period_end ?? null, cancelAtPeriodEnd: active?.cancel_at_period_end ?? false };
  });

export const getBillingPortal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => z.object({ environment }).parse(data))
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase.from("subscriptions")
      .select("paddle_customer_id,paddle_subscription_id,status")
      .eq("user_id", context.userId).eq("environment", paymentEnvironment())
      .eq("product_id", "pro_plan").order("created_at", { ascending: false }).limit(1);
    if (error) throw error;
    const row = rows?.[0];
    if (!row) throw new Error("No billing account was found.");
    const { getPaddleClient } = await import("./paddle.server");
    const portal = await getPaddleClient(paymentEnvironment()).customerPortalSessions.create(row.paddle_customer_id, [row.paddle_subscription_id]);
    return portal.urls.general.overview;
  });