import { isLang, type Lang } from "./translations";

// Only these pages translate their primary page copy. A selected tool locale is
// retained in the URL on English editorial/utility pages, but is not their language.
export function documentLanguage(pathname: string, selected: unknown): Lang {
  const path = pathname.replace(/\/$/, "") || "/";
  return (path === "/" || path === "/app") && isLang(selected) ? selected : "en";
}

export function sharedReportDescription(summary: unknown): string {
  const text = typeof summary === "string" ? summary.replace(/\s+/g, " ").trim() : "";
  return (
    text.slice(0, 155) ||
    "Read a shared, read-only Verfiai research report with source links and evidence limitations. Access is controlled by the report owner."
  );
}
