import { useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { isLang, type Lang } from "./translations";

const STORAGE_KEY = "verifai-lang";
export const isRtl = (lang: Lang) => lang === "ar" || lang === "fa" || lang === "ur";

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
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
  }, [lang, urlLang]);

  function changeLang(nextLang: Lang) {
    try { localStorage.setItem(STORAGE_KEY, nextLang); } catch { /* optional */ }
    const next = new URL(window.location.href);
    if (nextLang === "en") next.searchParams.delete("lang");
    else next.searchParams.set("lang", nextLang);
    window.location.assign(next.href);
  }
  return { lang, changeLang };
}