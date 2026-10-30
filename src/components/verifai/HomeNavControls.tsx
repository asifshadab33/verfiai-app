import { Link } from "@tanstack/react-router";
import { Globe2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { languages, type Lang } from "@/lib/translations";
import { translations } from "@/lib/i18n/interface";
import { siteText } from "@/lib/site-i18n";

export function AccountLink({ lang }: { lang: Lang }) {
  const { user } = useAuth();
  return <Button asChild variant="outline" size="sm"><Link to={user ? "/reports" : "/auth"} aria-label={siteText(lang, user ? "navReports" : "navSignIn")}><UserRound /><span className="hidden sm:inline">{siteText(lang, user ? "navReports" : "navSignIn")}</span></Link></Button>;
}

export function LanguagePicker({ lang, onChange }: { lang: Lang; onChange: (lang: Lang) => void }) {
  return <label className="flex items-center gap-1.5 text-sm text-muted-foreground"><Globe2 className="size-4" /><span className="sr-only">{translations[lang].report_language}</span><select aria-label={translations[lang].report_language} value={lang} onChange={e => onChange(e.target.value as Lang)} className="max-w-32 bg-transparent font-semibold text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring">{languages.map(l => <option key={l.code} value={l.code}>{translations[l.code].name}</option>)}</select></label>;
}

