import { documentLanguage } from "./page-language";
import { languages } from "./translations";

const ORIGIN = "https://verfiai.app";

/** Use primary page language, never a translated tool island, for search alternates. */
export function pageSeoLinks(pathname: string, selected?: unknown) {
  const path = pathname.split(/[?#]/)[0]?.replace(/\/+$/, "") || "/";
  const localized = documentLanguage(path, "de") === "de";
  const lang = documentLanguage(path, selected);
  const url = (code: string) => `${ORIGIN}${path}${code === "en" ? "" : `?lang=${code}`}`;
  return [
    { rel: "canonical", href: url(lang) },
    ...(localized ? [
      ...languages.map(({ code }) => ({ rel: "alternate", hrefLang: code, href: url(code) })),
      { rel: "alternate", hrefLang: "x-default", href: url("en") },
    ] : []),
  ];
}