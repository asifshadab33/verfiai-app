import { createFileRoute } from "@tanstack/react-router";
import { verifyWebhook, type PaddleEnv } from "@/lib/paddle.server";

type PaddleItem = { price?: { importMeta?: { externalId?: string } }; product?: { importMeta?: { externalId?: string } } };
type SubscriptionEvent = {
  id: string; customerId: string; status: string; customData?: { userId?: string };
  items?: PaddleItem[]; currentBillingPeriod?: { startsAt?: string; endsAt?: string };
  scheduledChange?: { action?: string };
};

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: { handlers: { POST: async ({ request }) => {
    const rawEnv = new URL(request.url).searchParams.get("env");
    if (rawEnv !== "sandbox" && rawEnv !== "live") return new Response("Unknown environment", { status: 400 });
    const env: PaddleEnv = rawEnv;
    try {
      const event = await verifyWebhook(request, env);
      const data = event.data as SubscriptionEvent;
      if (!event.eventType.startsWith("subscription.")) return Response.json({ received: true });
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      if (event.eventType === "subscription.created") {
        // Updated events can arrive before created events. Upsert from either complete payload.
        const item = data.items?.[0];
        const priceId = item?.price?.importMeta?.externalId;
        const productId = item?.product?.importMeta?.externalId;
        const userId = data.customData?.userId;
        if (!userId || priceId !== "pro_monthly" || productId !== "pro_plan") {
          console.error("Subscription could not be attributed to a Pro account");
          return new Response("Subscription attribution failed", { status: 422 });
        }
        const { error } = await supabaseAdmin.from("subscriptions").upsert({
          paddle_subscription_id: data.id, paddle_customer_id: data.customerId, user_id: userId,
          product_id: productId, price_id: priceId, status: data.status,
          current_period_start: data.currentBillingPeriod?.startsAt ?? null,
          current_period_end: data.currentBillingPeriod?.endsAt ?? null,
          cancel_at_period_end: data.scheduledChange?.action === "cancel",
          environment: env, updated_at: new Date().toISOString(),
        }, { onConflict: "paddle_subscription_id" });
        if (error) throw error;
      } else if (event.eventType === "subscription.updated") {
        const { error } = await supabaseAdmin.from("subscriptions").update({ status: data.status,
          current_period_start: data.currentBillingPeriod?.startsAt ?? null,
          current_period_end: data.currentBillingPeriod?.endsAt ?? null,
          cancel_at_period_end: data.scheduledChange?.action === "cancel",
          updated_at: new Date().toISOString(),
        }).eq("paddle_subscription_id", data.id).eq("environment", env);
        if (error) throw error;
      } else if (event.eventType === "subscription.canceled") {
        const { error } = await supabaseAdmin.from("subscriptions").update({ status: "canceled", cancel_at_period_end: false,
          updated_at: new Date().toISOString(),
        }).eq("paddle_subscription_id", data.id).eq("environment", env);
        if (error) throw error;
      }
      return Response.json({ received: true });
    } catch (error) {
      console.error("Payment notification rejected", error);
      return new Response("Invalid payment notification", { status: 400 });
    }
  } } },
});