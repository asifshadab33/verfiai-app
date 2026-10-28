import { useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { isLang, type Lang } from "./translations";
import { translations } from "./i18n/interface";
import { documentLanguage } from "./page-language";

const STORAGE_KEY = "verifai-lang";
export const isRtl = (lang: Lang) => translations[lang].dir === "rtl";

export function useSiteLocale() {
  const location = useLocation();
  const urlLang = new URLSearchParams(location.searchStr).get("lang");
  const lang: Lang = isLang(urlLang) ? urlLang : "en";
  useEffect(() => {
    if (!isLang(urlLang)) {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (isLang(saved) && saved !== "en") {
          const next = new URL(window.location.href);
          next.searchParams.set("lang", saved);
          window.location.replace(next.href);
          return;
        }
      } catch { /* storage may be disabled */ }
    }
    try { localStorage.setItem(STORAGE_KEY, lang); } catch { /* optional */ }
    const pageLang = documentLanguage(location.pathname, lang);
    document.documentElement.lang = pageLang;
    document.documentElement.dir = isRtl(pageLang) ? "rtl" : "ltr";
  }, [lang, urlLang, location.pathname]);

  function changeLang(nextLang: Lang) {
    try { localStorage.setItem(STORAGE_KEY, nextLang); } catch { /* optional */ }
    const next = new URL(window.location.href);
    if (nextLang === "en") next.searchParams.delete("lang");
    else next.searchParams.set("lang", nextLang);
    window.location.assign(next.href);
  }
  return { lang, changeLang };
}