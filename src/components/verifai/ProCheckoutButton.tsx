import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { openProCheckout } from "@/lib/paddle";

export function ProCheckoutButton({ className }: { className?: string }) {
  const { user, loading } = useAuth();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!loading && !user) return <Button asChild className={className}><Link to="/auth">Sign in for Pro</Link></Button>;
  return <div className={className}><Button disabled={loading || busy} onClick={async () => {
    if (!user) return;
    setBusy(true); setError("");
    try { await openProCheckout({ id: user.id, ...(user.email ? { email: user.email } : {}) }); }
    catch (e) { setError(e instanceof Error ? e.message : "Checkout could not open."); }
    finally { setBusy(false); }
  }}>{busy ? "Opening checkout…" : "Get Pro · $9/month"}</Button>{error && <p role="alert" className="mt-2 text-sm text-destructive">{error}</p>}</div>;
}