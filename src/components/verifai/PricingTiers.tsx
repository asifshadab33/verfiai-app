import { AFTER_FREE_NOTE, PRICING_TIERS } from "@/lib/community";

export function PricingTiers() {
  return <div>
    <dl className="divide-y divide-border border-y border-border">{PRICING_TIERS.map(([t, d]) => <div key={t} className="grid gap-1 py-3 sm:grid-cols-[180px_1fr]"><dt className="font-semibold">{t}</dt><dd className="text-muted-foreground">{d}</dd></div>)}</dl>
    <p className="mt-4 text-sm text-muted-foreground">{AFTER_FREE_NOTE}</p>
  </div>;
}
