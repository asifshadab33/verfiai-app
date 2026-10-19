import { useLocation } from "@tanstack/react-router";
import { recentText, localizedBreakdown } from "@/lib/recent-i18n";
export const UPLOAD_NOTICE = "Before uploading: Text and file contents are processed by Verfiai’s search and AI providers to generate results. Do not upload confidential, regulated, unpublished, or personally identifiable material.";
export function UploadNotice() {
 const lang = new URLSearchParams(useLocation().searchStr).get("lang") ?? "en";
 const t = (text: string) => recentText(lang, text);
  return <p role="note" className="mb-2 border-s-2 border-warning bg-warning-soft p-3 text-xs text-foreground">{t(UPLOAD_NOTICE)}</p>;
}
