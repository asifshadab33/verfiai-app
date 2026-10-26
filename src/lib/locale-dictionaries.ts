import en from "./i18n/en.json";
import checker from "./i18n/checker.en.json";
import recent from "./i18n/recent.en.json";
import uiExtra from "./i18n/ui-extra.en.json";
import { isLang, type Lang } from "./translations";

type Sections = { checker: Record<string, string>; recent: Record<string, string>; uiExtra: Record<string, string> };
export type LocaleDictionary = Sections & { site: Partial<typeof en> };
const dictionaries: Partial<Record<Lang, LocaleDictionary>> = { en: { site: en, checker, recent, uiExtra } };
const pending: Partial<Record<Lang, Promise<LocaleDictionary>>> = {};
const sites = import.meta.glob<{ default: Partial<typeof en> }>("./i18n/??.json");
const sections = import.meta.glob<{ default: Sections }>("./i18n/locales/*.json");

/** Cache by locale, never by a global active language: SSR requests stay independent. */
export function dictionary(lang: string) { return isLang(lang) ? dictionaries[lang] : undefined; }
export function ensureLocale(lang: Lang): Promise<LocaleDictionary> {
  const hit = dictionaries[lang];
  if (hit) return Promise.resolve(hit);
  const loading = pending[lang];
  if (loading) return loading;
  const loadSite = sites[`./i18n/${lang}.json`];
  const loadSections = sections[`./i18n/locales/${lang}.json`];
  if (!loadSite || !loadSections) return Promise.reject(new Error(`Missing locale: ${lang}`));
  const promise = Promise.all([loadSite(), loadSections()]).then(([site, values]) => {
    const result = { site: site.default, ...values.default };
    dictionaries[lang] = result;
    return result;
  }).finally(() => { delete pending[lang]; });
  pending[lang] = promise;
  return promise;
}