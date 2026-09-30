import { Link } from "@tanstack/react-router";
import { FileCheck2, Lock } from "lucide-react";

export function SiteFooter() {
  return <footer className="bg-footer text-footer-foreground">
    <div className="mx-auto max-w-7xl px-5 py-12">
      <div className="grid gap-10 md:grid-cols-3">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 font-display text-xl font-extrabold">
            <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground"><FileCheck2 className="size-5" /></span>
            Verfi <span className="text-brand">AI</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-footer-muted">Claim-level evidence checking for research, news and business.</p>
        </div>
        <nav aria-label="Footer links">
          <ul className="space-y-2.5 text-sm text-footer-muted">
            <li><Link to="/pricing" className="transition-colors hover:text-footer-foreground hover:underline">Pricing</Link></li>
            <li><Link to="/how-it-works" className="transition-colors hover:text-footer-foreground hover:underline">How it Works</Link></li>
            <li><a href="mailto:hello@verfiai.app" className="transition-colors hover:text-footer-foreground hover:underline">Contact Us</a></li>
            <li><Link to="/privacy" className="transition-colors hover:text-footer-foreground hover:underline">Privacy Policy</Link></li>
            <li><Link to="/terms" className="transition-colors hover:text-footer-foreground hover:underline">Terms of Service</Link></li>
            <li><Link to="/refunds" className="transition-colors hover:text-footer-foreground hover:underline">Refund Policy</Link></li>
          </ul>
        </nav>
        <div>
          <p className="text-sm text-footer-muted">© 2026 Verfi AI. All rights reserved.</p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-footer-border bg-footer-badge px-3 py-1.5 text-xs font-medium text-footer-muted"><Lock className="size-3.5" aria-hidden="true" />Voice stays in your browser</span>
        </div>
      </div>
    </div>
  </footer>;
}
