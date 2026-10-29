import { useId, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Link, useLocation } from "@tanstack/react-router";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { joinCommunityWaitlist } from "@/lib/waitlist.functions";
import { recentText } from "@/lib/recent-i18n";

const COPY = {
  pro_teams: { title: "Future Pro & Teams", body: "Join the waitlist for future Pro and Teams features. No payment, subscription or commitment.", done: "You’re on the waitlist. We’ll contact you about future Pro and Teams features.", consent: "future Pro and Teams features" },
  analyst: { title: "Analyst community waitlist", body: "For journalists, researchers, analysts and compliance teams who want early access to the Evidence Library and Analyst features when they open. Free, no commitment.", done: "You’re on the Analyst waitlist. We’ll email you when Analyst features open.", consent: "Analyst features and early access" },
} as const;

export function CommunityWaitlist({ interest = "pro_teams" }: { interest?: keyof typeof COPY }) {
  const c = COPY[interest];
  const id = useId();
  const lang = new URLSearchParams(useLocation().searchStr).get("lang") ?? "en";
  const t = (text: string, vars: Record<string, string | number> = {}) => recentText(lang, text, vars);
  const join = useServerFn(joinCommunityWaitlist);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const consentTemplate = t("I agree to receive emails about {topic}. I can withdraw consent at any time by emailing hello@verfiai.app. See our {privacyLink}.", { topic: t(c.consent), privacyLink: "{privacyLink}" });
  const [consentBefore, consentAfter = ""] = consentTemplate.split("{privacyLink}");
  return <div className="min-w-0">
    <h3 className="font-display text-xl font-bold">{t(c.title)}</h3>
    <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(c.body)}</p>
    {done ? <p role="status" className="mt-5 text-sm font-semibold text-success">{t(c.done)}</p> : <form className="mt-5 space-y-4" onSubmit={async e => {
      e.preventDefault(); if (busy || !consent) return;
      setBusy(true); setError("");
      try { await join({ data: { email, consent: true, website, interest } }); setDone(true); setEmail(""); }
      catch (err) { const m = err instanceof Error ? err.message : ""; setError(m.includes("Too many requests") ? t("Too many requests. Please try again in an hour.") : t("We couldn’t save your email. Please try again.")); }
      finally { setBusy(false); }
    }}>
      <div><label htmlFor={`${id}-email`} className="text-sm font-medium">{t("Email address")}</label><Input id={`${id}-email`} type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className="mt-2" dir="ltr" /></div>
      <div hidden aria-hidden="true"><label htmlFor={`${id}-website`}>{t("Leave blank")}</label><input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={website} onChange={e => setWebsite(e.target.value)} /></div>
      <div className="flex items-start gap-3"><Checkbox id={`${id}-consent`} checked={consent} onCheckedChange={value => setConsent(value === true)} /><label htmlFor={`${id}-consent`} className="text-xs leading-5 text-muted-foreground">{consentBefore}<Link to="/privacy" className="text-brand underline">{t("Privacy Policy")}</Link>{consentAfter}</label></div>
      <Button type="submit" disabled={busy || !consent}>{busy ? <LoaderCircle className="animate-spin" /> : <ArrowRight />}{busy ? t("Joining…") : t("Join the waitlist")}</Button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    </form>}
  </div>;
}
