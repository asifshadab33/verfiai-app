import { useId, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { joinCommunityWaitlist } from "@/lib/waitlist.functions";

export function CommunityWaitlist() {
  const id = useId();
  const join = useServerFn(joinCommunityWaitlist);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  return <div className="min-w-0">
    <h3 className="font-display text-xl font-bold">Future Pro & Teams</h3>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">Join the waitlist for future Pro and Teams features. No payment, subscription or commitment.</p>
    {done ? <p role="status" className="mt-5 text-sm font-semibold text-success">You’re on the waitlist. We’ll contact you about future Pro and Teams features.</p> : <form className="mt-5 space-y-4" onSubmit={async e => {
      e.preventDefault(); if (busy || !consent) return;
      setBusy(true); setError("");
      try { await join({ data: { email, consent: true, website } }); setDone(true); setEmail(""); }
      catch (err) { setError(err instanceof Error ? err.message : "Please try again."); }
      finally { setBusy(false); }
    }}>
      <div><label htmlFor={`${id}-email`} className="text-sm font-medium">Email address</label><Input id={`${id}-email`} type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className="mt-2" dir="ltr" /></div>
      <div hidden aria-hidden="true"><label htmlFor={`${id}-website`}>Leave blank</label><input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></div>
      <div className="flex items-start gap-3"><Checkbox id={`${id}-consent`} checked={consent} onCheckedChange={value => setConsent(value === true)} /><label htmlFor={`${id}-consent`} className="text-xs leading-5 text-muted-foreground">I agree to receive emails about future Pro and Teams features. I can withdraw consent at any time by emailing hello@verfiai.app. See our <Link to="/privacy" className="text-brand underline">Privacy Policy</Link>.</label></div>
      <Button type="submit" disabled={busy || !consent}>{busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{busy ? "Joining…" : "Join the waitlist"}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>}
  </div>;
}