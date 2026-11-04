import {
  Camera,
  BookOpen,
  Braces,
  Calculator,
  Clock,
  Eraser,
  FileText,
  FileSearch,
  FolderDown,
  GitCompare,
  Globe,
  Hash,
  Highlighter,
  KeyRound,
  Mail,
  Mic,
  Newspaper,
  QrCode,
  Quote,
  ShieldCheck,
  Shuffle,
  TableProperties,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import { NEW_TOOLS } from "@/lib/tools/new-tool-catalog";
import { FREE_TOOL_PAGES, freeToolCopyKey, TOOL_GUIDE_PAGES } from "@/lib/tools/free-tool-pages";
import { useLocation } from "@tanstack/react-router";
import { isLang } from "@/lib/translations";
import { siteText } from "@/lib/site-i18n";

const BROWSER = "Runs in your browser";
const REGISTRY = "Looks up public registries";

type HubToolEntry = {
  to: string;
  Icon: LucideIcon;
  title: string;
  blurb: string;
  note: string;
};

const CATEGORIES: { title: string; tools: HubToolEntry[] }[] = [
  {
    title: "Fact & source checks",
    tools: [
      {
        to: "/tools/claim-spotter",
        Icon: Highlighter,
        title: "Claim Spotter",
        blurb: "Find checkable claims and vague or absolute wording in text.",
        note: BROWSER,
      },
      {
        to: "/tools/evidence-matrix",
        Icon: TableProperties,
        title: "Claim Evidence Matrix",
        blurb: "Organize excerpts and compare how sources relate to a claim.",
        note: BROWSER,
      },
      {
        to: "/tools/fallacy-spotter",
        Icon: ShieldCheck,
        title: "Logical Fallacy Spotter",
        blurb: "Flag wording that may signal a reasoning fallacy.",
        note: BROWSER,
      },
      {
        to: "/tools/source-checklist",
        Icon: ShieldCheck,
        title: "Source Evaluation Checklist",
        blurb: "Review a source's authorship, evidence and transparency.",
        note: BROWSER,
      },
      {
        to: "/tools/evaluation-checklist",
        Icon: ShieldCheck,
        title: "Printable Evaluation Checklist",
        blurb: "Print a source evaluation worksheet for offline review.",
        note: BROWSER,
      },
      {
        to: "/tools/headline-quiz",
        Icon: Newspaper,
        title: "Spot the Fake Headline",
        blurb: "Test your eye for misleading framing in a scored quiz.",
        note: BROWSER,
      },
      {
        to: "/glossary",
        Icon: BookOpen,
        title: "Misinformation Glossary",
        blurb: "Browse plain-language definitions of reasoning and source-checking terms.",
        note: "Static reference",
      },
      {
        to: "/tools/numbers-check",
        Icon: Calculator,
        title: "Numbers-in-News Checker",
        blurb: "Inspect numerical claims for issues worth checking.",
        note: BROWSER,
      },
      {
        to: "/tools/phishing-checklist",
        Icon: ShieldCheck,
        title: "Phishing Red-Flag Checklist",
        blurb: "Work through a manual review of suspicious messages.",
        note: BROWSER,
      },
    ],
  },
  {
    title: "Writing & text analysis",
    tools: [
      {
        to: "/tools/word-counter",
        Icon: Hash,
        title: "Word & Character Counter",
        blurb: "Count words and characters and estimate reading time.",
        note: BROWSER,
      },
      {
        to: "/tools/character-counter",
        Icon: Hash,
        title: "Character Counter",
        blurb: "Measure text length and character counts.",
        note: BROWSER,
      },
      {
        to: "/tools/text-cleaner",
        Icon: Eraser,
        title: "Text Cleaner & Case Converter: Fix Copied Text",
        blurb: "Clean copied text and change its capitalization.",
        note: BROWSER,
      },
      {
        to: "/tools/text-compare",
        Icon: GitCompare,
        title: "Free Text Compare: See Differences Between Two Texts",
        blurb: "See which words changed between two versions.",
        note: BROWSER,
      },
      {
        to: "/tools/similarity",
        Icon: GitCompare,
        title: "Two-Text Similarity Checker",
        blurb: "Compare overlap between two text passages.",
        note: BROWSER,
      },
      {
        to: "/tools/readability",
        Icon: FileText,
        title: "Readability Scorer",
        blurb: "Estimate how easy a passage is to read.",
        note: BROWSER,
      },
      {
        to: "/tools/passive-hedge",
        Icon: Highlighter,
        title: "Passive Voice & Hedge Detector",
        blurb: "Highlight possible passive phrasing and hedging.",
        note: BROWSER,
      },
      {
        to: "/tools/weasel-words",
        Icon: Highlighter,
        title: "Weasel Word Detector",
        blurb: "Find vague wording that may need clearer support.",
        note: BROWSER,
      },
      {
        to: "/tools/cliche-filler",
        Icon: Highlighter,
        title: "Cliché & Filler Detector",
        blurb: "Flag common clichés and filler phrases.",
        note: BROWSER,
      },
      {
        to: "/tools/sentence-rhythm",
        Icon: FileText,
        title: "Sentence Rhythm Analyzer",
        blurb: "Compare sentence lengths and their variation.",
        note: BROWSER,
      },
      {
        to: "/tools/keyword-density",
        Icon: Hash,
        title: "Keyword Density Checker",
        blurb: "Measure how often terms appear in your text.",
        note: BROWSER,
      },
      {
        to: "/tools/title-case",
        Icon: FileText,
        title: "Title Case Converter",
        blurb: "Change title capitalization using supported styles.",
        note: BROWSER,
      },
      {
        to: "/tools/slugifier",
        Icon: Globe,
        title: "Slug & URL Encoder",
        blurb: "Turn a title into a URL-friendly slug.",
        note: BROWSER,
      },
      {
        to: "/tools/invisible-chars",
        Icon: FileSearch,
        title: "Invisible Character Detector",
        blurb: "Find hidden characters in pasted text.",
        note: BROWSER,
      },
      {
        to: "/tools/markdown-editor",
        Icon: FileText,
        title: "Markdown Editor & Preview",
        blurb: "Write and preview Markdown text.",
        note: BROWSER,
      },
      {
        to: "/tools/headline-analyzer",
        Icon: Newspaper,
        title: "Free Headline Analyzer: Length, Clickbait and Absolute Claims",
        blurb: "Check length, clickbait phrasing and absolute claims.",
        note: BROWSER,
      },
      {
        to: "/tools/serp-preview",
        Icon: Globe,
        title: "SERP & Open Graph Preview",
        blurb: "Preview a page title and description as a search snippet.",
        note: BROWSER,
      },
      {
        to: "/tools/subject-line-preview",
        Icon: Mail,
        title: "Subject Line Preview",
        blurb: "Preview email subject lines and their length.",
        note: BROWSER,
      },
    ],
  },
  {
    title: "Lookups",
    tools: [
      {
        to: "/tools/doi-checker",
        Icon: FileSearch,
        title: "Free DOI & Retraction Checker",
        blurb: "Check DOI records for listed retractions or corrections.",
        note: REGISTRY,
      },
      {
        to: "/tools/citation-generator",
        Icon: Quote,
        title: "Free DOI Citation Generator: APA, MLA, Chicago, Harvard",
        blurb: "Turn DOIs into references in six citation styles.",
        note: REGISTRY,
      },
      {
        to: "/tools/isbn-citer",
        Icon: BookOpen,
        title: "ISBN Book Citer",
        blurb: "Find book metadata using an ISBN.",
        note: "Looks up Open Library",
      },
      {
        to: "/tools/arxiv",
        Icon: FileSearch,
        title: "arXiv Paper Finder",
        blurb: "Search arXiv for research preprints.",
        note: "Looks up the public arXiv registry",
      },
      {
        to: "/tools/pubmed",
        Icon: FileSearch,
        title: "PubMed Lookup",
        blurb: "Retrieve publication details from PubMed.",
        note: "Looks up the public PubMed registry",
      },
      {
        to: "/tools/orcid",
        Icon: BookOpen,
        title: "ORCID Author Lookup",
        blurb: "Find public researcher records by ORCID identifier.",
        note: "Looks up the public ORCID registry",
      },
      {
        to: "/tools/link-expander",
        Icon: Globe,
        title: "Link Expander",
        blurb: "Follow redirects to inspect a link's destination.",
        note: "Requests the linked website from your browser",
      },
      {
        to: "/tools/wayback",
        Icon: Clock,
        title: "Wayback Machine Checker",
        blurb: "Look for an archived capture of a web page.",
        note: "Looks up Internet Archive",
      },
      {
        to: "/tools/domain-age",
        Icon: Globe,
        title: "Domain Age Checker",
        blurb: "Look up public domain registration information.",
        note: "Looks up public RDAP registration records",
      },
    ],
  },
  {
    title: "Utilities",
    tools: [
      {
        to: "/tools/sample-size",
        Icon: Calculator,
        title: "Sample Size Calculator",
        blurb: "Estimate a survey sample size from your assumptions.",
        note: BROWSER,
      },
      {
        to: "/tools/reference-converter",
        Icon: BookOpen,
        title: "Reference Format Converter",
        blurb: "Convert reference data between supported formats.",
        note: BROWSER,
      },
      {
        to: "/tools/url-inspector",
        Icon: Globe,
        title: "URL Inspector",
        blurb: "Inspect a URL's structure and parameters.",
        note: BROWSER,
      },
      {
        to: "/tools/email-headers",
        Icon: Mail,
        title: "Email Header Analyzer",
        blurb: "Inspect pasted email headers for useful clues.",
        note: BROWSER,
      },
      {
        to: "/tools/disposable-email",
        Icon: Mail,
        title: "Disposable Email Checker",
        blurb: "Check an email domain against a disposable-domain list.",
        note: BROWSER,
      },
      {
        to: "/tools/mailto-builder",
        Icon: Mail,
        title: "Mailto Link Builder",
        blurb: "Build an email link with subject and message fields.",
        note: BROWSER,
      },
      {
        to: "/tools/foi-letter",
        Icon: FileText,
        title: "FOI Request Generator",
        blurb: "Draft a request for access to public information.",
        note: BROWSER,
      },
      {
        to: "/tools/photo-check",
        Icon: Camera,
        title: "Photo Check: View Photo Metadata and Reverse Image Search",
        blurb: "Read photo metadata and open reverse image searches.",
        note: "Metadata stays in your browser; search links open external services",
      },
      {
        to: "/tools/file-hash",
        Icon: Hash,
        title: "File Hash Verifier",
        blurb: "Calculate a file digest without uploading the file.",
        note: BROWSER,
      },
      {
        to: "/tools/csv-json",
        Icon: Braces,
        title: "CSV to JSON Converter",
        blurb: "Convert structured data between CSV and JSON.",
        note: BROWSER,
      },
      {
        to: "/tools/qr-code",
        Icon: QrCode,
        title: "QR Code Generator",
        blurb: "Create a QR code from text or a URL.",
        note: "Sends entered text to the public QR Server service",
      },
      {
        to: "/tools/password-generator",
        Icon: KeyRound,
        title: "Password Generator",
        blurb: "Generate random passwords in your browser.",
        note: BROWSER,
      },
      {
        to: "/tools/random-picker",
        Icon: Shuffle,
        title: "Random Picker & Shuffler",
        blurb: "Choose randomly from a list of options.",
        note: BROWSER,
      },
      {
        to: "/tools/pomodoro",
        Icon: Clock,
        title: "Pomodoro Timer",
        blurb: "Time focus sessions and breaks.",
        note: BROWSER,
      },
      {
        to: "/tools/timestamp-converter",
        Icon: Clock,
        title: "Timestamp Converter",
        blurb: "Convert timestamps and readable dates.",
        note: BROWSER,
      },
      {
        to: "/tools/quote-card",
        Icon: Quote,
        title: "Quote Card Generator",
        blurb: "Format a quote and attribution as a shareable card.",
        note: BROWSER,
      },
      {
        to: "/tools/speech-to-text",
        Icon: Mic,
        title: "Speech-to-Text Dictation",
        blurb: "Transcribe speech with your browser's recognition service.",
        note: "Uses browser speech recognition; processing depends on the browser",
      },
      {
        to: "/tools/text-to-speech",
        Icon: Volume2,
        title: "Text-to-Speech Reader",
        blurb: "Read text aloud with available browser voices.",
        note: "Uses your browser's speech service",
      },
    ],
  },
  {
    title: "PDF tools",
    tools: [
      {
        to: "/tools/pdf-tools",
        Icon: FileText,
        title: "PDF Merge, Split & Rotate",
        blurb: "Work with PDF files using browser-based utilities.",
        note: BROWSER,
      },
    ],
  },
];

export function ToolsHub() {
  const { searchStr } = useLocation();
  const requestedLang = new URLSearchParams(searchStr).get("lang");
  const lang = isLang(requestedLang) ? requestedLang : "en";
  const oldTools = CATEGORIES.flatMap((category) => category.tools)
    .filter((tool) => tool.to.startsWith("/tools/") || tool.to === "/glossary")
    .map((tool) => ({
      ...tool,
      category: existingCategory(tool.to),
      keywords: [tool.title, tool.blurb],
    }));
  const newTools = NEW_TOOLS.filter(
    (tool) => !FREE_TOOL_PAGES.some((page) => page.slug === tool.slug),
  ).map((tool) => ({
    to: `/tools/${tool.slug}`,
    Icon: toolIcon(tool.category),
    title: tool.title,
    blurb:
      tool.slug === "citation-checker" ? siteText(lang, "citationCheckerHub") : tool.description,
    note:
      tool.kind === "launcher"
        ? "Opens an external free tool"
        : tool.kind === "api"
          ? "Uses a public keyless API"
          : tool.kind === "server"
            ? siteText(lang, "freeToolServerFetch")
            : BROWSER,
    category: tool.category,
    keywords: tool.keywords,
  }));
  const addedTools = FREE_TOOL_PAGES.map((tool) => ({
    to: `/tools/${tool.slug}`,
    Icon: toolIcon(tool.category),
    title: siteText(lang, freeToolCopyKey(tool.slug, "Title")) || tool.title,
    blurb: siteText(lang, freeToolCopyKey(tool.slug, "Description")) || tool.description,
    note: tool.note,
    category: tool.category,
    keywords: tool.keywords,
  }));
  const guides = TOOL_GUIDE_PAGES.map((page) => ({
    to: `/${page.slug}`,
    Icon: page.slug === "templates" ? FolderDown : page.slug === "video-research" ? Mic : BookOpen,
    title: siteText(lang, freeToolCopyKey(page.slug, "Title")) || page.title,
    blurb: siteText(lang, freeToolCopyKey(page.slug, "Description")) || page.description,
    note: "Static guide",
    category: page.category,
    keywords: page.keywords,
  }));
  const tools = [...oldTools, ...newTools, ...addedTools, ...guides];
  const categoryNames = [
    "Text & Writing",
    "Research & Citations",
    "Verification & OSINT",
    "Data & Numbers",
    "Email & Communication",
    "Developer & Utilities",
    "Productivity",
    "Professional Sources",
  ] as const;
  const categories = categoryNames.map((title) => ({
    title,
    tools: tools.filter((tool) => tool.category === title),
  }));
  const toolCount = tools.length;
  const localeForHref = new URLSearchParams(searchStr).get("lang");
  const hrefFor = (path: string) =>
    `${path}${localeForHref ? `?lang=${encodeURIComponent(localeForHref)}` : ""}`;
  return (
    <div>
      <p className="mb-5 text-sm font-medium text-muted-foreground">{toolCount} free tools</p>
      <nav aria-label="Tool categories" className="mb-7 lg:hidden">
        <ul className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <li key={category.title}>
              <a
                className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-border px-3 text-sm hover:border-primary focus-visible:outline-2 focus-visible:outline-ring"
                href={`#${categoryId(category.title)}`}
              >
                {category.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="grid gap-8 lg:grid-cols-[12rem_minmax(0,1fr)]">
        <nav aria-label="Tool categories" className="hidden lg:block">
          <ul className="sticky top-24 space-y-1">
            {categories.map((category) => (
              <li key={category.title}>
                <a
                  className="flex min-h-11 items-center rounded-md px-3 text-sm hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
                  href={`#${categoryId(category.title)}`}
                >
                  {category.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0 space-y-10">
          {categories.map((category) => (
            <section
              key={category.title}
              id={categoryId(category.title)}
              aria-label={category.title}
              className="scroll-mt-24"
            >
              <h2 className="mb-4 font-display text-xl font-bold">{category.title}</h2>
              <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {category.tools.map((t) => (
                  <li key={t.to} className="min-w-0">
                    <a
                      href={hrefFor(t.to)}
                      aria-label={`${t.title}: ${t.blurb}`}
                      className="flex min-h-[4.5rem] items-center gap-3 rounded-lg border border-border bg-card px-3 py-3 transition-colors hover:border-primary hover:bg-muted/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <t.Icon aria-hidden="true" className="size-5 shrink-0 text-brand" />
                      <span className="min-w-0">
                        <span className="block truncate font-display text-sm font-bold">
                          {t.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {t.blurb}
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">{t.note}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function categoryId(title: string) {
  return `tool-category-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function toolIcon(category: string) {
  if (category === "Text & Writing") return FileText;
  if (category === "Research & Citations") return Quote;
  if (category === "Verification & OSINT") return ShieldCheck;
  if (category === "Data & Numbers") return Calculator;
  if (category === "Email & Communication") return Mail;
  if (category === "Developer & Utilities") return Braces;
  if (category === "Productivity") return Clock;
  return BookOpen;
}

function existingCategory(path: string) {
  if (path === "/glossary") return "Verification & OSINT";
  if (
    [
      "/tools/word-counter",
      "/tools/character-counter",
      "/tools/text-cleaner",
      "/tools/text-compare",
      "/tools/similarity",
      "/tools/readability",
      "/tools/passive-hedge",
      "/tools/weasel-words",
      "/tools/cliche-filler",
      "/tools/sentence-rhythm",
      "/tools/keyword-density",
      "/tools/title-case",
      "/tools/slugifier",
      "/tools/invisible-chars",
      "/tools/markdown-editor",
      "/tools/headline-analyzer",
      "/tools/serp-preview",
    ].includes(path)
  )
    return "Text & Writing";
  if (
    [
      "/tools/email-headers",
      "/tools/disposable-email",
      "/tools/mailto-builder",
      "/tools/subject-line-preview",
      "/tools/speech-to-text",
      "/tools/text-to-speech",
    ].includes(path)
  )
    return "Email & Communication";
  if (
    [
      "/tools/sample-size",
      "/tools/numbers-check",
      "/tools/csv-json",
      "/tools/timestamp-converter",
    ].includes(path)
  )
    return "Data & Numbers";
  if (
    [
      "/tools/doi-checker",
      "/tools/citation-generator",
      "/tools/isbn-citer",
      "/tools/arxiv",
      "/tools/pubmed",
      "/tools/reference-converter",
    ].includes(path)
  )
    return "Research & Citations";
  if (["/tools/orcid", "/tools/domain-age", "/tools/wayback"].includes(path))
    return "Professional Sources";
  if (
    [
      "/tools/claim-spotter",
      "/tools/evidence-matrix",
      "/tools/fallacy-spotter",
      "/tools/source-checklist",
      "/tools/evaluation-checklist",
      "/tools/headline-quiz",
      "/tools/phishing-checklist",
      "/tools/photo-check",
      "/tools/link-expander",
    ].includes(path)
  )
    return "Verification & OSINT";
  if (
    [
      "/tools/qr-code",
      "/tools/file-hash",
      "/tools/password-generator",
      "/tools/url-inspector",
      "/tools/quote-card",
    ].includes(path)
  )
    return "Developer & Utilities";
  return "Productivity";
}
