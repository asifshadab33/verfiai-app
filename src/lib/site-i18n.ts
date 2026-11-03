import en from "./i18n/en.json";
import { isLang, type Lang } from "./translations";
import { dictionary } from "./locale-dictionaries";

export const hasSiteTranslation = (lang: Lang) => isLang(lang);
type ConsentKey =
  | "consentTitle"
  | "consentBody"
  | "consentAccept"
  | "consentReject"
  | "consentPrivacy"
  | "cookieSettings"
  | "consentClose";
export const siteText = (lang: Lang, key: keyof typeof en | ConsentKey): string => {
  const english: Record<string, string> = en;
  const localized: Partial<Record<string, string>> | undefined = dictionary(lang)?.site;
  return localized?.[key] ?? english[key] ?? "";
};
