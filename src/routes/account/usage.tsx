import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { ContentPage } from "@/components/verifai/ContentPage";
import { useAuth } from "@/hooks/useAuth";
import { getCreditSummary } from "@/lib/flags.functions";

const title = "Credits and usage | Verfiai";
export const Route = createFileRoute("/account/usage")({
  head: () => ({
    meta: [
      { name: "robots", content: "noindex,nofollow" },
      { title },
      { name: "description", content: "See your Verfiai credits used, remaining, and reset date." },
      { property: "og:title", content: title },
      { property: "og:description", content: "Your Verfiai credit balance for this billing cycle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Usage,
});

function Usage() {
  const { user, loading } = useAuth();
  const fetchSummary = useServerFn(getCreditSummary);
  const [s, setS] = useState<Awaited<ReturnType<typeof getCreditSummary>> | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (user) fetchSummary().then(setS).catch(() => setError("Usage could not load right now."));
  }, [user, fetchSummary]);
  return (
    <ContentPage title="Credits and usage" intro="Claim checks, citation scans and reports use credits from your billing cycle.">
      {loading ? <p>Checking your account…</p>
        : !user ? <p><Link to="/auth" className="text-brand underline">Sign in</Link> to see your credits.</p>
        : error ? <p role="alert">{error}</p>
        : !s ? <p role="status">Loading…</p>
        : <div className="grid gap-4 sm:grid-cols-3">
            {[["Included", s.included], ["Used", s.used], ["Remaining", s.remaining]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-border bg-card p-5"><p className="text-sm text-muted-foreground">{k}</p><p className="mt-1 font-display text-3xl font-extrabold">{v}</p></div>
            ))}
            <p className="text-sm text-muted-foreground sm:col-span-3">Plan: {s.plan === "pro" ? "Pro" : "Free"} · Resets on {new Date(s.resetsAt).toLocaleDateString()}. Quick claim check 1 credit · citation scan 1–3 · report 3.</p>
          </div>}
    </ContentPage>
  );
}
