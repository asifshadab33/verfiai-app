import en from "./i18n/checker.en.json";
import tr from "./i18n/checker.json";

export type CheckerKey = keyof typeof en;
const dicts = tr as Record<string, Partial<Record<CheckerKey, string>>>;
/** Citation checker and source-quality UI strings; untranslated keys fall back to English. */
export function checkerText(lang: string, key: CheckerKey, vars: Record<string, string | number> = {}) {
  const s = dicts[lang]?.[key] ?? en[key];
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
