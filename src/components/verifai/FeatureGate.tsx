import { useEffect, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Clock } from "lucide-react";
import { getFeatureFlags } from "@/lib/flags.functions";
import { useAuth } from "@/hooks/useAuth";
import type { FlagKey } from "@/lib/flags";

/** Display-only gate. The matching server functions enforce the same flag independently. */
export function FeatureGate({
  flag,
  title,
  children,
}: {
  flag: FlagKey;
  title: string;
  children: ReactNode;
}) {
  const fetchFlags = useServerFn(getFeatureFlags);
  const { user, loading } = useAuth();
  const [on, setOn] = useState<boolean | null>(null);
  useEffect(() => {
    if (loading) return;
    fetchFlags()
      .then((f) => setOn(f[flag]))
      .catch(() => setOn(false));
  }, [user, loading, flag]); // eslint-disable-line react-hooks/exhaustive-deps
  if (on === null)
    return (
      <p className="py-10 text-sm text-muted-foreground" role="status">
        Loading…
      </p>
    );
  if (on) return <>{children}</>;
  return <ComingSoon title={title} />;
}

export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center">
      <Clock className="mx-auto size-8 text-brand" aria-hidden />
      <h2 className="mt-4 font-display text-2xl font-bold">{title} is coming soon</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
        We're still reviewing content and rights before opening this to everyone. Claim checks and
        research reports work today.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          to="/"
          className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
        >
          Check a claim free
        </Link>
        <a
          href={`mailto:hello@verfiai.app?subject=${encodeURIComponent(`Waitlist: ${title}`)}`}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 text-sm font-semibold"
        >
          Join the waitlist
        </a>
      </div>
    </div>
  );
}
