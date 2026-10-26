import en from "./i18n/en.json";
import { isLang, type Lang } from "./translations";
import { dictionary } from "./locale-dictionaries";

export const hasSiteTranslation = (lang: Lang) => isLang(lang);
export const siteText = (lang: Lang, key: keyof typeof en) => dictionary(lang)?.site[key] ?? en[key];