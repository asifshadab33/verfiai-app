import { Link } from "@tanstack/react-router";
import { siteText } from "@/lib/site-i18n";
import type { Lang } from "@/lib/translations";
import { FileCheck2, Lock } from "lucide-react";

export function SiteFooter({ lang }: { lang?: Lang }) {
  const tx = (key: Parameters<typeof siteText>[1]) => siteText(lang ?? "en", key);
  return <footer className="bg-footer text-footer-foreground">
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><FileCheck2 className="size-5" /></span>
            Verfiai
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-footer-muted">{tx("footerTagline")}</p>
        </div>
        <nav aria-label="Footer links">
          <ul className="space-y-2.5 text-sm text-footer-muted">
            <li><Link to="/about" className="transition-colors hover:text-footer-foreground hover:underline">{tx("footerAbout")}</Link></li>
            <li><Link to="/accuracy" className="transition-colors hover:text-footer-foreground hover:underline">{tx("footerAccuracy")}</Link></li>
            <li><Link to="/pricing" className="transition-colors hover:text-footer-foreground hover:underline">{tx("navPricing")}</Link></li>
            <li><Link to="/how-it-works" className="transition-colors hover:text-footer-foreground hover:underline">{tx("navHow")}</Link></li>
            <li><a href="mailto:hello@verfiai.app" className="transition-colors hover:text-footer-foreground hover:underline">{tx("footerContact")}</a></li>
            <li><Link to="/privacy" className="transition-colors hover:text-footer-foreground hover:underline">{tx("privacy")}</Link></li>
            <li><Link to="/terms" className="transition-colors hover:text-footer-foreground hover:underline">{tx("footerTerms")}</Link></li>
            <li><Link to="/refunds" className="transition-colors hover:text-footer-foreground hover:underline">{tx("footerRefund")}</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-sm text-footer-muted">© 2026 Verfiai. {tx("footerRights")}</p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-footer-border bg-footer-badge px-3 py-1.5 text-xs font-medium text-footer-muted"><Lock className="size-3.5" aria-hidden="true" />{tx("footerVoice")}</span>
        </div>
      </div>
    </div>
  </footer>;
}
