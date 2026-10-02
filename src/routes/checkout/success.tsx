import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Button } from "@/components/ui/button";
import { getSubscription } from "@/lib/payments.functions";
import { getPaddleEnvironment } from "@/lib/paddle";

export const Route = createFileRoute("/checkout/success")({
  head: () => ({ meta: [{ title: "Subscription status | Verfiai" }, { name: "description", content: "Check your Verfiai Pro subscription status." }, { property: "og:title", content: "Subscription status | Verfiai" }, { property: "og:description", content: "Check your Verfiai Pro subscription status." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }, { name: "robots", content: "noindex" }] }),
  component: Success,
});
function Success() {
  const status = useServerFn(getSubscription);
  const [active, setActive] = useState<boolean | null>(null);
  useEffect(() => {
    let stopped = false; let tries = 0;
    const poll = async () => {
      try { const result = await status({ data: { environment: getPaddleEnvironment() } }); if (!stopped) setActive(result.isPro); if (result.isPro) return; }
      catch { /* allow payment notification to arrive */ }
      if (!stopped && ++tries < 12) window.setTimeout(poll, 2500);
    };
    void poll(); return () => { stopped = true; };
  }, [status]);
  return <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-5 px-5 py-12 text-center"><h1 className="font-display text-3xl font-bold">{active ? "Pro is ready" : "Checking your subscription"}</h1><p className="text-muted-foreground">{active ? "You can now create 50 reports a month and export without a watermark." : "Your payment may be processing. If this takes longer than a minute, check My reports again."}</p><Button asChild><Link to="/reports">Go to My reports</Link></Button></main>;
}