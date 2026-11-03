import { Link } from "@tanstack/react-router";
import {
  Camera,
  BookOpen,
  Braces,
  Calculator,
  Clock,
  Eraser,
  FileText,
  FileSearch,
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
} from "lucide-react";

const BROWSER = "Runs in your browser";
const REGISTRY = "Looks up public registries";

const CATEGORIES = [
  {
    title: "Fact & source checks",
    tools: [
      {
        to: "/tools/claim-spotter",
        Icon: Highlighter,
        title: "Claim spotter",
        blurb: "Find checkable claims and vague or absolute wording in text.",
        note: BROWSER,
      },
      {
        to: "/tools/evidence-matrix",
        Icon: TableProperties,
        title: "Claim evidence matrix",
        blurb: "Organize excerpts and compare how sources relate to a claim.",
        note: BROWSER,
      },
      {
        to: "/tools/fallacy-spotter",
        Icon: ShieldCheck,
        title: "Fallacy spotter",
        blurb: "Flag wording that may signal a reasoning fallacy.",
        note: BROWSER,
      },
      {
        to: "/tools/source-checklist",
        Icon: ShieldCheck,
        title: "Source checklist",
        blurb: "Review a source's authorship, evidence and transparency.",
        note: BROWSER,
      },
      {
        to: "/tools/numbers-check",
        Icon: Calculator,
        title: "Numbers checker",
        blurb: "Inspect numerical claims for issues worth checking.",
        note: BROWSER,
      },
      {
        to: "/tools/phishing-checklist",
        Icon: ShieldCheck,
        title: "Phishing checklist",
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
        title: "Word counter",
        blurb: "Count words and characters and estimate reading time.",
        note: BROWSER,
      },
      {
        to: "/tools/character-counter",
        Icon: Hash,
        title: "Character counter",
        blurb: "Measure text length and character counts.",
        note: BROWSER,
      },
      {
        to: "/tools/text-cleaner",
        Icon: Eraser,
        title: "Text cleaner & case converter",
        blurb: "Clean copied text and change its capitalization.",
        note: BROWSER,
      },
      {
        to: "/tools/text-compare",
        Icon: GitCompare,
        title: "Text compare",
        blurb: "See which words changed between two versions.",
        note: BROWSER,
      },
      {
        to: "/tools/similarity",
        Icon: GitCompare,
        title: "Text similarity checker",
        blurb: "Compare overlap between two text passages.",
        note: BROWSER,
      },
      {
        to: "/tools/readability",
        Icon: FileText,
        title: "Readability scorer",
        blurb: "Estimate how easy a passage is to read.",
        note: BROWSER,
      },
      {
        to: "/tools/passive-hedge",
        Icon: Highlighter,
        title: "Passive & hedge detector",
        blurb: "Highlight possible passive phrasing and hedging.",
        note: BROWSER,
      },
      {
        to: "/tools/weasel-words",
        Icon: Highlighter,
        title: "Weasel-word finder",
        blurb: "Find vague wording that may need clearer support.",
        note: BROWSER,
      },
      {
        to: "/tools/cliche-filler",
        Icon: Highlighter,
        title: "Cliché & filler finder",
        blurb: "Flag common clichés and filler phrases.",
        note: BROWSER,
      },
      {
        to: "/tools/sentence-rhythm",
        Icon: FileText,
        title: "Sentence rhythm checker",
        blurb: "Compare sentence lengths and their variation.",
        note: BROWSER,
      },
      {
        to: "/tools/keyword-density",
        Icon: Hash,
        title: "Keyword density checker",
        blurb: "Measure how often terms appear in your text.",
        note: BROWSER,
      },
      {
        to: "/tools/title-case",
        Icon: FileText,
        title: "Title case converter",
        blurb: "Change title capitalization using supported styles.",
        note: BROWSER,
      },
      {
        to: "/tools/slugifier",
        Icon: Globe,
        title: "Slugifier",
        blurb: "Turn a title into a URL-friendly slug.",
        note: BROWSER,
      },
      {
        to: "/tools/invisible-chars",
        Icon: FileSearch,
        title: "Invisible character finder",
        blurb: "Find hidden characters in pasted text.",
        note: BROWSER,
      },
      {
        to: "/tools/markdown-editor",
        Icon: FileText,
        title: "Markdown editor",
        blurb: "Write and preview Markdown text.",
        note: BROWSER,
      },
      {
        to: "/tools/headline-analyzer",
        Icon: Newspaper,
        title: "Headline analyzer",
        blurb: "Check length, clickbait phrasing and absolute claims.",
        note: BROWSER,
      },
      {
        to: "/tools/serp-preview",
        Icon: Globe,
        title: "Search snippet preview",
        blurb: "Preview a page title and description as a search snippet.",
        note: BROWSER,
      },
      {
        to: "/tools/subject-line-preview",
        Icon: Mail,
        title: "Subject-line preview",
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
        title: "DOI & retraction checker",
        blurb: "Check DOI records for listed retractions or corrections.",
        note: REGISTRY,
      },
      {
        to: "/tools/citation-generator",
        Icon: Quote,
        title: "Citation generator",
        blurb: "Turn DOIs into references in six citation styles.",
        note: REGISTRY,
      },
      {
        to: "/tools/isbn-citer",
        Icon: BookOpen,
        title: "ISBN citation lookup",
        blurb: "Find book metadata using an ISBN.",
        note: "Looks up Open Library",
      },
      {
        to: "/tools/arxiv",
        Icon: FileSearch,
        title: "arXiv finder",
        blurb: "Search arXiv for research preprints.",
        note: "Looks up the public arXiv registry",
      },
      {
        to: "/tools/pubmed",
        Icon: FileSearch,
        title: "PubMed lookup",
        blurb: "Retrieve publication details from PubMed.",
        note: "Looks up the public PubMed registry",
      },
      {
        to: "/tools/orcid",
        Icon: BookOpen,
        title: "ORCID lookup",
        blurb: "Find public researcher records by ORCID identifier.",
        note: "Looks up the public ORCID registry",
      },
      {
        to: "/tools/link-expander",
        Icon: Globe,
        title: "Link expander",
        blurb: "Follow redirects to inspect a link's destination.",
        note: "Requests the linked website from your browser",
      },
      {
        to: "/tools/wayback",
        Icon: Clock,
        title: "Wayback checker",
        blurb: "Look for an archived capture of a web page.",
        note: "Looks up Internet Archive",
      },
      {
        to: "/tools/domain-age",
        Icon: Globe,
        title: "Domain age checker",
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
        title: "Sample-size calculator",
        blurb: "Estimate a survey sample size from your assumptions.",
        note: BROWSER,
      },
      {
        to: "/tools/reference-converter",
        Icon: BookOpen,
        title: "Reference converter",
        blurb: "Convert reference data between supported formats.",
        note: BROWSER,
      },
      {
        to: "/tools/url-inspector",
        Icon: Globe,
        title: "URL inspector",
        blurb: "Inspect a URL's structure and parameters.",
        note: BROWSER,
      },
      {
        to: "/tools/email-headers",
        Icon: Mail,
        title: "Email-header analyzer",
        blurb: "Inspect pasted email headers for useful clues.",
        note: BROWSER,
      },
      {
        to: "/tools/disposable-email",
        Icon: Mail,
        title: "Disposable-email checker",
        blurb: "Check an email domain against a disposable-domain list.",
        note: BROWSER,
      },
      {
        to: "/tools/mailto-builder",
        Icon: Mail,
        title: "Mailto link builder",
        blurb: "Build an email link with subject and message fields.",
        note: BROWSER,
      },
      {
        to: "/tools/foi-letter",
        Icon: FileText,
        title: "FOI letter builder",
        blurb: "Draft a request for access to public information.",
        note: BROWSER,
      },
      {
        to: "/tools/photo-check",
        Icon: Camera,
        title: "Photo check",
        blurb: "Read photo metadata and open reverse image searches.",
        note: "Metadata stays in your browser; search links open external services",
      },
      {
        to: "/tools/file-hash",
        Icon: Hash,
        title: "File hash calculator",
        blurb: "Calculate a file digest without uploading the file.",
        note: BROWSER,
      },
      {
        to: "/tools/csv-json",
        Icon: Braces,
        title: "CSV / JSON converter",
        blurb: "Convert structured data between CSV and JSON.",
        note: BROWSER,
      },
      {
        to: "/tools/qr-code",
        Icon: QrCode,
        title: "QR-code generator",
        blurb: "Create a QR code from text or a URL.",
        note: "Sends entered text to the public QR Server service",
      },
      {
        to: "/tools/password-generator",
        Icon: KeyRound,
        title: "Password generator",
        blurb: "Generate random passwords in your browser.",
        note: BROWSER,
      },
      {
        to: "/tools/random-picker",
        Icon: Shuffle,
        title: "Random picker",
        blurb: "Choose randomly from a list of options.",
        note: BROWSER,
      },
      {
        to: "/tools/pomodoro",
        Icon: Clock,
        title: "Pomodoro timer",
        blurb: "Time focus sessions and breaks.",
        note: BROWSER,
      },
      {
        to: "/tools/timestamp-converter",
        Icon: Clock,
        title: "Timestamp converter",
        blurb: "Convert timestamps and readable dates.",
        note: BROWSER,
      },
      {
        to: "/tools/quote-card",
        Icon: Quote,
        title: "Quote-card maker",
        blurb: "Format a quote and attribution as a shareable card.",
        note: BROWSER,
      },
      {
        to: "/tools/speech-to-text",
        Icon: Mic,
        title: "Speech-to-text",
        blurb: "Transcribe speech with your browser's recognition service.",
        note: "Uses browser speech recognition; processing depends on the browser",
      },
      {
        to: "/tools/text-to-speech",
        Icon: Volume2,
        title: "Text-to-speech",
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
        title: "PDF tools",
        blurb: "Work with PDF files using browser-based utilities.",
        note: BROWSER,
      },
    ],
  },
] as const;

export function ToolsHub() {
  return (
    <div className="space-y-10">
      {CATEGORIES.map((category) => (
        <section key={category.title} aria-label={category.title}>
          <h2 className="mb-4 font-display text-xl font-bold">{category.title}</h2>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.tools.map((t) => (
              <li key={t.to} className="min-w-0">
                <Link
                  to={t.to}
                  className="flex h-full flex-col rounded-lg border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <t.Icon aria-hidden="true" className="size-7 shrink-0 text-brand" />
                  <h3 className="mt-3 font-display text-lg font-bold">{t.title}</h3>
                  <p className="mt-1 flex-1 text-sm text-muted-foreground">{t.blurb}</p>
                  <p className="mt-3 text-xs font-medium text-muted-foreground">{t.note}</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
