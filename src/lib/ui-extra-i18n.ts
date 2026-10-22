import en from "./i18n/ui-extra.en.json";
import tr from "./i18n/ui-extra.json";

export type UiExtraKey = keyof typeof en;
const dicts = tr as Record<string, Partial<Record<UiExtraKey, string>>>;
/** Newer UI strings (Deep Dossier, source quality, CTAs, feedback). Missing translations fall back to English. */
export const uiText = (lang: string, key: UiExtraKey) => dicts[lang]?.[key] ?? en[key];
