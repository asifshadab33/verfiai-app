import en from "./i18n/ui-extra.en.json";
import { dictionary } from "./locale-dictionaries";

export type UiExtraKey = keyof typeof en;
/** Newer UI strings (Deep Dossier, source quality, CTAs, feedback). Missing translations fall back to English. */
export const uiText = (lang: string, key: UiExtraKey) => dictionary(lang)?.uiExtra[key] ?? en[key];
