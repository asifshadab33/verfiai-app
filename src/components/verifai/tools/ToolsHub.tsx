import { Link } from "@tanstack/react-router";
import { Camera, Eraser, FileSearch, GitCompare, Hash, Highlighter, Newspaper, Quote, ScanSearch } from "lucide-react";

const TOOLS = [
  { to: "/tools/claim-spotter", Icon: Highlighter, title: "Claim spotter", blurb: "Find checkable claims and vague or absolute wording in any text.", note: "Runs in your browser" },
  { to: "/tools/doi-checker", Icon: FileSearch, title: "DOI & retraction checker", blurb: "See whether a DOI exists and whether a retraction or correction is listed.", note: "Looks up public registries" },
  { to: "/tools/citation-generator", Icon: Quote, title: "Citation generator", blurb: "Turn DOIs into APA, MLA, Chicago, Harvard, IEEE or Vancouver references.", note: "Looks up public registries" },
  { to: "/tools/photo-check", Icon: Camera, title: "Photo check", blurb: "Read a photo's metadata and open reverse image searches.", note: "Runs in your browser" },
  { to: "/tools/headline-analyzer", Icon: Newspaper, title: "Headline analyzer", blurb: "Check headline length, clickbait phrasing and absolute claims.", note: "Runs in your browser" },
  { to: "/tools/text-compare", Icon: GitCompare, title: "Text compare", blurb: "See exactly which words changed between two versions of a text.", note: "Runs in your browser" },
  { to: "/tools/word-counter", Icon: Hash, title: "Word counter", blurb: "Count words and characters and estimate reading time.", note: "Runs in your browser" },
  { to: "/tools/text-cleaner", Icon: Eraser, title: "Text cleaner & case converter", blurb: "Fix text copied from PDFs and change case in one click.", note: "Runs in your browser" },
] as const;

export function ToolsHub() {
  return <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{TOOLS.map(t => <li key={t.to}>
    <Link to={t.to} className="flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary">
      <t.Icon aria-hidden="true" className="size-7 text-brand" />
      <h2 className="mt-3 font-display text-lg font-bold">{t.title}</h2>
      <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.blurb}</p>
      <p className="mt-3 text-xs font-medium text-muted-foreground">{t.note}</p>
    </Link>
  </li>)}</ul>;
}
