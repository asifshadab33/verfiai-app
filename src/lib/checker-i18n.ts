import en from "./i18n/checker.en.json";
import { dictionary } from "./locale-dictionaries";

export type CheckerKey = keyof typeof en;
/** Citation checker and source-quality UI strings; untranslated keys fall back to English. */
export function checkerText(
  lang: string,
  key: CheckerKey,
  vars: Record<string, string | number> = {},
) {
  const s = dictionary(lang)?.checker[key] ?? en[key];
  return s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? `{${k}}`));
}
