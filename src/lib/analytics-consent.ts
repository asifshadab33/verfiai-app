/** Strictly necessary preference only. No analytics SDK is imported before acceptance. */
export const CONSENT_VERSION = "2026-10-30";
export const CONSENT_STORAGE_KEY = "verfiai-analytics-consent";
export type ConsentChoice = "accepted" | "rejected";
export type ConsentRecord = { choice: ConsentChoice; version: string; timestamp: number };
let choice: ConsentChoice | null = null;
let path = "/";
let revision = 0;
let started = false;
const listeners = new Set<() => void>();
type Providers = { google: typeof import("./google-analytics"); posthog: typeof import("./posthog") };
let providers: Providers | undefined;
let loading: Promise<Providers> | undefined;

export function validConsent(value: unknown, now = Date.now(), version = CONSENT_VERSION): value is ConsentRecord {
  if (!value || typeof value !== "object") return false;
  const record = value as Partial<ConsentRecord>;
  if ((record.choice !== "accepted" && record.choice !== "rejected") || record.version !== version ||
    typeof record.timestamp !== "number" || !Number.isFinite(record.timestamp) || record.timestamp > now) return false;
  const expiry = new Date(record.timestamp);
  expiry.setUTCFullYear(expiry.getUTCFullYear() + 1);
  return now < expiry.getTime();
}
export function analyticsAccepted() { return choice === "accepted"; }
export function consentChoice() { return choice; }
export function subscribeConsent(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; }
function notify() { listeners.forEach(listener => listener()); }
function save(next: ConsentChoice) {
  try { localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify({ choice: next, version: CONSENT_VERSION, timestamp: Date.now() })); } catch { /* Choice remains effective for this page. */ }
}
export function initializeConsent() {
  if (started || typeof window === "undefined") return;
  started = true;
  let record: unknown;
  try { record = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY) || "null"); } catch { /* Invalid/unavailable storage means no consent. */ }
  // An explicit, still-current opt-in from Cookie settings can override GPC.
  const gpc = (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
  choice = validConsent(record) ? record.choice : gpc ? "rejected" : null;
  if (gpc && !validConsent(record)) save("rejected");
  if (choice !== "accepted") cleanupAnalyticsStorage();
  notify();
}

/** Delete only analytics namespaces, never auth, locale or other application storage. */
export function cleanupAnalyticsStorage() {
  if (typeof window === "undefined") return;
  const id = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_ANALYTICS_API_KEY"];
  if (id) (window as unknown as Record<string, unknown>)[`ga-disable-${id}`] = true;
  for (const storage of ["localStorage", "sessionStorage"] as const) {
    try {
      const store = window[storage];
      const keys = Array.from({ length: store.length }, (_, i) => store.key(i));
      for (const key of keys) if (key && (/^ph_.*_posthog(?:_|$)/.test(key) || key.startsWith("__ph_opt_in_out_"))) store.removeItem(key);
    } catch { /* Storage can be blocked. */ }
  }
  const names = document.cookie.split(";").map(value => value.trim().split("=")[0]);
  const host = window.location.hostname;
  const parts = host.split(".");
  const domains = ["", ...parts.map((_, i) => parts.slice(i).join(".")).flatMap(domain => [domain, `.${domain}`])];
  const paths = ["/", ...window.location.pathname.split("/").slice(1).map((_, i, values) => "/" + values.slice(0, i + 1).join("/"))];
  for (const name of names) {
    if (!name || !(name === "_ga" || name.startsWith("_ga_") || /^ph_.*_posthog/.test(name) || name.startsWith("__ph_opt_in_out_"))) continue;
    for (const domain of domains) for (const cookiePath of paths) document.cookie = `${name}=; Max-Age=0; path=${cookiePath}${domain ? `; domain=${domain}` : ""}; SameSite=Lax`;
  }
}

export function chooseConsent(next: ConsentChoice) {
  choice = next; revision++; save(next);
  if (next === "rejected") {
    providers?.google.stopGoogleAnalytics();
    providers?.posthog.stopPosthog();
    cleanupAnalyticsStorage();
  }
  notify();
  if (next === "accepted") void trackConsentedPage(path);
}
export async function trackConsentedPage(nextPath: string) {
  path = nextPath;
  if (!analyticsAccepted()) return;
  const current = revision;
  try {
    loading ??= Promise.all([import("./google-analytics"), import("./posthog")]).then(([google, posthog]) => ({ google, posthog })).catch(error => { loading = undefined; throw error; });
    providers = await loading;
    if (!analyticsAccepted() || revision !== current || path !== nextPath) return;
    providers.google.trackGooglePage(nextPath);
    providers.posthog.trackPage(nextPath);
  } catch { /* Analytics must never block the site. */ }
}
export function openCookieSettings() { window.dispatchEvent(new Event("verfiai-cookie-settings")); }