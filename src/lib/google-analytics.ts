let initialized = false;
let previousPath: string | undefined;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Page visits only: omit queries, document titles and private share identifiers. */
export function googleAnalyticsPath(path: string) {
  return (path.split(/[?#]/)[0] || "/")
    .replace(/^\/r\/[^/]+/, "/r/:token")
    .replace(/^\/fact-check\/[^/]+/, "/fact-check/:slug")
    .replace(/^\/resources\/[^/]+/, "/resources/:slug");
}

/** Imported by the root after hydration, never evaluated during SSR. */
export function trackGooglePage(path: string) {
  const id = import.meta.env.VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY;
  if (!id || typeof window === "undefined") return;
  const pagePath = googleAnalyticsPath(path);
  const parameters = {
    page_path: pagePath,
    page_location: window.location.origin + pagePath,
    page_title: "Verfiai",
    page_referrer: "",
  };
  if (!initialized) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function (..._args: unknown[]) {
      // gtag.js consumes Arguments objects, not the rest parameter array.
      window.dataLayer?.push(arguments);
    };
    window.gtag("set", "developer_id.dZjgwMW", true);
    window.gtag("js", new Date());
    window.gtag("config", id, {
      ...parameters, send_page_view: false,
      allow_google_signals: false, allow_ad_personalization_signals: false,
    });
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    document.head.appendChild(script);
    initialized = true;
  }
  if (previousPath === path) return;
  previousPath = path;
  window.gtag?.("set", parameters);
  window.gtag?.("event", "page_view", { ...parameters, send_to: id });
}