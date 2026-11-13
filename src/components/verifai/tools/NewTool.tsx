import { lazy, Suspense } from "react";
import { useAuth } from "@/hooks/useAuth";
import { siteText } from "@/lib/site-i18n";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { ToolSignInPrompt } from "./ToolSignInPrompt";
import type { Props } from "./new-tool/shared";
const text = lazy(() => import("./new-tool/text"));
const developer = lazy(() => import("./new-tool/developer"));
const media = lazy(() => import("./new-tool/media"));
const sources = lazy(() => import("./new-tool/sources"));
const launchers = lazy(() => import("./new-tool/launchers"));
const categories = { text, developer, media, sources, launchers };
const categoryBySlug: Record<string, keyof typeof categories> = {
  "no-ai-summarizer": "text",
  "word-frequency": "text",
  "acronym-extractor": "text",
  "srt-shifter": "text",
  "regex-tester": "developer",
  "cron-explainer": "developer",
  "color-contrast": "developer",
  "date-calculator": "developer",
  "encode-hash": "developer",
  "margin-of-error": "developer",
  "image-compressor": "media",
  "qr-scanner": "media",
  "image-ocr": "media",
  "wikipedia-citations": "sources",
  "wikidata-lookup": "sources",
  "open-access-finder": "sources",
  "scholar-search": "sources",
  "europepmc-reader": "sources",
  "preprint-finder": "sources",
  "gdelt-news": "sources",
  "sec-filings": "sources",
  "world-bank-data": "sources",
  "factcheck-explorer": "launchers",
  "connected-papers": "launchers",
  "google-scholar": "launchers",
  "video-verify": "launchers",
  "image-forensics": "launchers"
};
function SelectedTool(props:Props) {
  const category = categoryBySlug[props.slug];
  if (!category) return <p role="alert">This free tool could not be found.</p>;
  const Tool = categories[category];
  return <Suspense fallback={<p role="status">Loading…</p>}><Tool key={props.slug} {...props} /></Suspense>;
}
export function NewTool({ slug, locale = "en" }: Props) {
  const definition = NEW_TOOLS.find((tool) => tool.slug === slug);
  if (definition?.kind === "server")
    return <ServerToolGate slug={slug} locale={locale} />;
  return <SelectedTool slug={slug} locale={locale ?? "en"} />;
}

function ServerToolGate({ slug, locale = "en" }: Props) {
  const { user, loading } = useAuth();
  if (loading) return <p role="status">{siteText(locale ?? "en", "checkingSignIn")}</p>;
  if (!user)
    return (
      <ToolSignInPrompt
        tool="this free tool"
        title={siteText(locale ?? "en", "signInContinue")}
        description={siteText(locale ?? "en", "freeToolServerFetch")}
        signInLabel={siteText(locale ?? "en", "navSignIn")}
      />
    );
  return <SelectedTool slug={slug} locale={locale} />;
}

