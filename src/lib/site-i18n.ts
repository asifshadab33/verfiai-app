import en from "./i18n/en.json";
import de from "./i18n/de.json";
import pt from "./i18n/pt.json";
import tr from "./i18n/tr.json";
import ru from "./i18n/ru.json";
import ja from "./i18n/ja.json";
import ko from "./i18n/ko.json";
import es from "./i18n/es.json";
import fr from "./i18n/fr.json";
import hi from "./i18n/hi.json";
import ar from "./i18n/ar.json";
import zh from "./i18n/zh.json";
import type { Lang } from "./translations";

const dictionaries: Partial<Record<Lang, Partial<typeof en>>> = { en, de, pt, tr, ru, ja, ko, es, fr, hi, ar, zh };
export const hasSiteTranslation = (lang: Lang) => Boolean(dictionaries[lang]);
export const siteText = (lang: Lang, key: keyof typeof en) => dictionaries[lang]?.[key] ?? en[key];