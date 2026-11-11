import en from "./i18n/en.json";
import checker from "./i18n/checker.en.json";
import recent from "./i18n/recent.en.json";
import uiExtra from "./i18n/ui-extra.en.json";
import { isLang, type Lang } from "./translations";

type Sections = {
  checker: Record<string, string>;
  recent: Record<string, string>;
  uiExtra: Record<string, string>;
};
export type LocaleDictionary = Sections & { site: Partial<typeof en> };
const dictionaries: Partial<Record<Lang, LocaleDictionary>> = {
  en: { site: en, checker, recent, uiExtra },
};
const pending: Partial<Record<Lang, Promise<LocaleDictionary>>> = {};
const pendingSites: Partial<Record<Lang, Promise<LocaleDictionary>>> = {};
const complete = new Set<Lang>(["en"]);
const sites = import.meta.glob<{ default: Partial<typeof en> }>("./i18n/??.json");
const sections = import.meta.glob<{ default: Sections }>("./i18n/locales/*.json");

/** Cache by locale, never by a global active language: SSR requests stay independent. */
export function dictionary(lang: string) {
  return isLang(lang) ? dictionaries[lang] : undefined;
}
/** Tool pages use site copy only; citation checking still needs all sections. */
export function localeScope(pathname: string): "site" | "full" {
  return /^\/tools(?:\/|$)/.test(pathname) && pathname.replace(/\/$/, "") !== "/tools/citation-checker" ? "site" : "full";
}
export function ensureLocale(lang: Lang, scope: "site" | "full" = "full"): Promise<LocaleDictionary> {
  const hit = dictionaries[lang];
  if (hit && (scope === "site" || complete.has(lang))) return Promise.resolve(hit);
  if (scope === "site") {
    const loading = pending[lang] ?? pendingSites[lang];
    if (loading) return loading;
    const loader = sites[`./i18n/${lang}.json`];
    if (!loader) return Promise.reject(new Error(`Missing locale: ${lang}`));
    const promise = loader().then((site) => {
      const result = dictionaries[lang] ?? { site: site.default, checker: {}, recent: {}, uiExtra: {} };
      dictionaries[lang] = result;
      return result;
    }).finally(() => { delete pendingSites[lang]; });
    pendingSites[lang] = promise;
    return promise;
  }
  const loading = pending[lang];
  if (loading) return loading;
  const loadSite = sites[`./i18n/${lang}.json`];
  const loadSections = sections[`./i18n/locales/${lang}.json`];
  if (!loadSite || !loadSections) return Promise.reject(new Error(`Missing locale: ${lang}`));
  const promise = Promise.all([loadSite(), loadSections()])
    .then(([site, values]) => {
      const result = { site: site.default, ...values.default };
      dictionaries[lang] = result;
      complete.add(lang);
      return result;
    })
    .finally(() => {
      delete pending[lang];
    });
  pending[lang] = promise;
  return promise;
}
