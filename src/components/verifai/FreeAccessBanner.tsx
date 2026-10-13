import { FREE_ACCESS_BANNER } from "@/lib/community";

/** Persistent, non-dismissable, low-key notice shown above every public page. */
export function FreeAccessBanner() {
  return <div role="region" aria-label="Free access notice" className="border-b border-border bg-brand-soft px-4 py-2 text-center text-xs font-medium text-foreground print:hidden" dir="ltr" lang="en">{FREE_ACCESS_BANNER}</div>;
}
