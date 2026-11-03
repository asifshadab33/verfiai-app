import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { siteText } from "@/lib/site-i18n";
import { isLang, type Lang } from "@/lib/translations";
import { isRtl } from "@/lib/locale";
import {
  chooseConsent,
  consentChoice,
  initializeConsent,
  subscribeConsent,
  trackConsentedPage,
} from "@/lib/analytics-consent";

export function ConsentBanner({
  lang,
  onChoose,
  onClose,
}: {
  lang: Lang;
  onChoose: (value: "accepted" | "rejected") => void;
  onClose: () => void;
}) {
  const tx = (key: Parameters<typeof siteText>[1]) => siteText(lang, key);
  return (
    <section
      role="region"
      aria-labelledby="analytics-consent-title"
      lang={lang}
      dir={isRtl(lang) ? "rtl" : "ltr"}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background text-foreground shadow-lg"
    >
      <div className="mx-auto max-w-5xl px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <h2 id="analytics-consent-title" className="font-display text-lg font-bold">
            {tx("consentTitle")}
          </h2>
          <Button
            variant="ghost"
            className="min-h-11 min-w-11 shrink-0"
            aria-label={tx("consentClose")}
            onClick={onClose}
          >
            ×
          </Button>
        </div>
        <p className="mt-1 max-w-3xl text-sm leading-6">{tx("consentBody")}</p>
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <div className="grid w-full grid-cols-2 gap-3 sm:w-auto sm:min-w-96">
            <Button
              variant="outline"
              className="h-auto min-h-11 whitespace-normal px-3 py-2"
              onClick={() => onChoose("accepted")}
            >
              {tx("consentAccept")}
            </Button>
            <Button
              variant="outline"
              className="h-auto min-h-11 whitespace-normal px-3 py-2"
              onClick={() => onChoose("rejected")}
            >
              {tx("consentReject")}
            </Button>
          </div>
          <Link
            to="/privacy"
            className="inline-flex min-h-11 items-center text-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
          >
            {tx("consentPrivacy")}
          </Link>
        </div>
      </div>
    </section>
  );
}

/** Initial SSR and hydration both render nothing; only mount reads browser preferences. */
export function AnalyticsConsent() {
  const location = useLocation();
  const value = new URLSearchParams(location.searchStr).get("lang");
  const lang = isLang(value) ? value : "en";
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    initializeConsent();
    setVisible(consentChoice() === null);
    const unsubscribe = subscribeConsent(() => setVisible(consentChoice() === null));
    const reopen = () => setVisible(true);
    window.addEventListener("verfiai-cookie-settings", reopen);
    return () => {
      unsubscribe();
      window.removeEventListener("verfiai-cookie-settings", reopen);
    };
  }, []);
  useEffect(() => {
    void trackConsentedPage(location.pathname);
  }, [location.pathname]);
  if (!visible) return null;
  return (
    <ConsentBanner
      lang={lang}
      onChoose={(value) => {
        chooseConsent(value);
        setVisible(false);
      }}
      onClose={() => setVisible(false)}
    />
  );
}
