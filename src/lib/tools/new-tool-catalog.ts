import englishToolCopy from "@/lib/i18n/new-tools.en.json";

export type NewToolCategory =
  | "Text & Writing"
  | "Research & Citations"
  | "Verification & OSINT"
  | "Data & Numbers"
  | "Email & Communication"
  | "Developer & Utilities"
  | "Productivity"
  | "Professional Sources";

export type NewToolKind = "browser" | "api" | "launcher" | "existing";

export type NewToolDefinition = {
  slug: string;
  title: string;
  description: string;
  category: NewToolCategory;
  kind: NewToolKind;
  keywords: string[];
};

export const NEW_TOOLS: NewToolDefinition[] = [
  {
    slug: "no-ai-summarizer",
    title: englishToolCopy["no-ai-summarizer"].title,
    description: englishToolCopy["no-ai-summarizer"].description,
    category: "Text & Writing",
    kind: "browser",
    keywords: ["extractive", "summary", "sentences", "private"],
  },
  {
    slug: "word-frequency",
    title: englishToolCopy["word-frequency"].title,
    description: englishToolCopy["word-frequency"].description,
    category: "Text & Writing",
    kind: "browser",
    keywords: ["text analysis", "top words", "phrases"],
  },
  {
    slug: "regex-tester",
    title: englishToolCopy["regex-tester"].title,
    description: englishToolCopy["regex-tester"].description,
    category: "Developer & Utilities",
    kind: "browser",
    keywords: ["regular expression", "developer", "match"],
  },
  {
    slug: "cron-explainer",
    title: englishToolCopy["cron-explainer"].title,
    description: englishToolCopy["cron-explainer"].description,
    category: "Developer & Utilities",
    kind: "browser",
    keywords: ["schedule", "cronjob", "time"],
  },
  {
    slug: "unit-converter",
    title: englishToolCopy["unit-converter"].title,
    description: englishToolCopy["unit-converter"].description,
    category: "Data & Numbers",
    kind: "browser",
    keywords: ["measurement", "conversion", "units"],
  },
  {
    slug: "color-contrast",
    title: englishToolCopy["color-contrast"].title,
    description: englishToolCopy["color-contrast"].description,
    category: "Developer & Utilities",
    kind: "browser",
    keywords: ["WCAG", "accessibility", "colors", "ratio"],
  },
  {
    slug: "image-compressor",
    title: englishToolCopy["image-compressor"].title,
    description: englishToolCopy["image-compressor"].description,
    category: "Productivity",
    kind: "browser",
    keywords: ["image", "photo", "canvas", "resize"],
  },
  {
    slug: "qr-scanner",
    title: englishToolCopy["qr-scanner"].title,
    description: englishToolCopy["qr-scanner"].description,
    category: "Developer & Utilities",
    kind: "browser",
    keywords: ["decode", "camera", "barcode"],
  },
  {
    slug: "image-ocr",
    title: englishToolCopy["image-ocr"].title,
    description: englishToolCopy["image-ocr"].description,
    category: "Productivity",
    kind: "browser",
    keywords: ["OCR", "image", "Tesseract", "text recognition"],
  },
  {
    slug: "acronym-extractor",
    title: englishToolCopy["acronym-extractor"].title,
    description: englishToolCopy["acronym-extractor"].description,
    category: "Text & Writing",
    kind: "browser",
    keywords: ["abbreviations", "text", "context"],
  },
  {
    slug: "date-calculator",
    title: englishToolCopy["date-calculator"].title,
    description: englishToolCopy["date-calculator"].description,
    category: "Data & Numbers",
    kind: "browser",
    keywords: ["working days", "calendar", "deadline"],
  },
  {
    slug: "encode-hash",
    title: englishToolCopy["encode-hash"].title,
    description: englishToolCopy["encode-hash"].description,
    category: "Developer & Utilities",
    kind: "browser",
    keywords: ["hash", "base64", "URL", "cryptography"],
  },
  {
    slug: "srt-shifter",
    title: englishToolCopy["srt-shifter"].title,
    description: englishToolCopy["srt-shifter"].description,
    category: "Productivity",
    kind: "browser",
    keywords: ["subtitles", "captions", "timecode"],
  },
  {
    slug: "margin-of-error",
    title: englishToolCopy["margin-of-error"].title,
    description: englishToolCopy["margin-of-error"].description,
    category: "Data & Numbers",
    kind: "browser",
    keywords: ["poll", "survey", "confidence interval", "statistics"],
  },
  {
    slug: "citation-checker",
    title: englishToolCopy["citation-checker"].title,
    description: englishToolCopy["citation-checker"].description,
    category: "Research & Citations",
    kind: "existing",
    keywords: ["references", "retractions", "Crossref", "citations"],
  },
  {
    slug: "wikipedia-citations",
    title: englishToolCopy["wikipedia-citations"].title,
    description: englishToolCopy["wikipedia-citations"].description,
    category: "Research & Citations",
    kind: "api",
    keywords: ["citation", "bibliography", "Wikipedia"],
  },
  {
    slug: "wikidata-lookup",
    title: englishToolCopy["wikidata-lookup"].title,
    description: englishToolCopy["wikidata-lookup"].description,
    category: "Professional Sources",
    kind: "api",
    keywords: ["knowledge graph", "QID", "reference"],
  },
  {
    slug: "currency-converter",
    title: englishToolCopy["currency-converter"].title,
    description: englishToolCopy["currency-converter"].description,
    category: "Data & Numbers",
    kind: "api",
    keywords: ["exchange rate", "Frankfurter", "ECB", "money"],
  },
  {
    slug: "open-access-finder",
    title: englishToolCopy["open-access-finder"].title,
    description: englishToolCopy["open-access-finder"].description,
    category: "Research & Citations",
    kind: "api",
    keywords: ["DOI", "paper", "Unpaywall", "OpenAlex"],
  },
  {
    slug: "scholar-search",
    title: englishToolCopy["scholar-search"].title,
    description: englishToolCopy["scholar-search"].description,
    category: "Research & Citations",
    kind: "api",
    keywords: ["papers", "academic", "OpenAlex", "research"],
  },
  {
    slug: "europepmc-reader",
    title: englishToolCopy["europepmc-reader"].title,
    description: englishToolCopy["europepmc-reader"].description,
    category: "Professional Sources",
    kind: "api",
    keywords: ["biomedical", "PubMed", "PMCID", "open access"],
  },
  {
    slug: "preprint-finder",
    title: englishToolCopy["preprint-finder"].title,
    description: englishToolCopy["preprint-finder"].description,
    category: "Research & Citations",
    kind: "api",
    keywords: ["preprint", "biology", "medicine"],
  },
  {
    slug: "gdelt-news",
    title: englishToolCopy["gdelt-news"].title,
    description: englishToolCopy["gdelt-news"].description,
    category: "Verification & OSINT",
    kind: "api",
    keywords: ["news", "coverage", "global events"],
  },
  {
    slug: "sec-filings",
    title: englishToolCopy["sec-filings"].title,
    description: englishToolCopy["sec-filings"].description,
    category: "Professional Sources",
    kind: "api",
    keywords: ["EDGAR", "company", "filings", "investor"],
  },
  {
    slug: "world-bank-data",
    title: englishToolCopy["world-bank-data"].title,
    description: englishToolCopy["world-bank-data"].description,
    category: "Professional Sources",
    kind: "api",
    keywords: ["statistics", "indicators", "countries", "development"],
  },
  {
    slug: "factcheck-explorer",
    title: englishToolCopy["factcheck-explorer"].title,
    description: englishToolCopy["factcheck-explorer"].description,
    category: "Verification & OSINT",
    kind: "launcher",
    keywords: ["claim", "check", "Google", "external tool"],
  },
  {
    slug: "video-verify",
    title: englishToolCopy["video-verify"].title,
    description: englishToolCopy["video-verify"].description,
    category: "Verification & OSINT",
    kind: "launcher",
    keywords: ["video", "keyframes", "verification", "external tool"],
  },
  {
    slug: "image-forensics",
    title: englishToolCopy["image-forensics"].title,
    description: englishToolCopy["image-forensics"].description,
    category: "Verification & OSINT",
    kind: "launcher",
    keywords: ["ELA", "image", "forensics", "external tools"],
  },
  {
    slug: "connected-papers",
    title: englishToolCopy["connected-papers"].title,
    description: englishToolCopy["connected-papers"].description,
    category: "Research & Citations",
    kind: "launcher",
    keywords: ["paper graph", "academic", "external tool"],
  },
  {
    slug: "google-scholar",
    title: englishToolCopy["google-scholar"].title,
    description: englishToolCopy["google-scholar"].description,
    category: "Research & Citations",
    kind: "launcher",
    keywords: ["academic", "research", "external tool"],
  },
];
