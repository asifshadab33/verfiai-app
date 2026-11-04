export type FreeToolPage = {
  slug: string;
  title: string;
  description: string;
  category: string;
  keywords: string[];
  note: string;
};

export const FREE_TOOL_PAGES: FreeToolPage[] = [
  {
    slug: "doaj-journal-checker",
    title: "DOAJ Journal Checker",
    description:
      "Check whether a journal or article is indexed in the Directory of Open Access Journals.",
    category: "Research & Citations",
    keywords: ["DOAJ", "open access", "journal", "article"],
    note: "Queries the public DOAJ API from your browser",
  },
  {
    slug: "semantic-scholar",
    title: "Semantic Scholar Search",
    description:
      "Look up scholarly papers and authors with citations, year, venue, and open-access links.",
    category: "Research & Citations",
    keywords: ["papers", "authors", "citations", "Semantic Scholar"],
    note: "Queries the public Semantic Scholar API from your browser",
  },
  {
    slug: "opencitations",
    title: "OpenCitations DOI Explorer",
    description: "Explore inbound citations and references for a DOI using OpenCitations.",
    category: "Research & Citations",
    keywords: ["DOI", "citations", "references", "OpenCitations"],
    note: "Queries the public OpenCitations API from your browser",
  },
  {
    slug: "zenodo-finder",
    title: "Dataset & DOI Finder",
    description: "Search Zenodo datasets and resolve DOI metadata through DataCite.",
    category: "Research & Citations",
    keywords: ["Zenodo", "DataCite", "datasets", "DOI"],
    note: "Queries public Zenodo and DataCite APIs from your browser",
  },
  {
    slug: "dns-inspector",
    title: "DNS Inspector",
    description: "Inspect public A, AAAA, MX, TXT, NS, CNAME, and SOA DNS records.",
    category: "Verification & OSINT",
    keywords: ["DNS", "domain", "records", "IP"],
    note: "Queries Cloudflare DNS-over-HTTPS from your browser",
  },
  {
    slug: "certificate-explorer",
    title: "Certificate Explorer",
    description:
      "Review public TLS certificate history, issuers, dates, and discovered subdomains.",
    category: "Verification & OSINT",
    keywords: ["TLS", "certificate", "crt.sh", "subdomains"],
    note: "Queries the public crt.sh certificate database",
  },
  {
    slug: "phone-verifier",
    title: "Phone Number Verifier",
    description: "Parse and validate phone numbers locally, with country, type, and E.164 format.",
    category: "Verification & OSINT",
    keywords: ["phone", "number", "E.164", "validate"],
    note: "Validates locally; no network request",
  },
  {
    slug: "unit-converter",
    title: "Unit Converter",
    description: "Convert length, weight, temperature, speed, area, volume, and data size offline.",
    category: "Data & Numbers",
    keywords: ["measurement", "conversion", "units"],
    note: "Calculates offline in your browser",
  },
  {
    slug: "currency-converter",
    title: "Currency Converter",
    description:
      "Convert currencies with free public Frankfurter rates, including historical dates.",
    category: "Data & Numbers",
    keywords: ["exchange rate", "Frankfurter", "ECB", "money"],
    note: "Uses the keyless Frankfurter public API",
  },
  {
    slug: "percentage-calculator",
    title: "Percentage Calculator",
    description: "Calculate a percentage of a value, percentage share, or percentage change.",
    category: "Data & Numbers",
    keywords: ["percentage", "percent", "change", "calculator"],
    note: "Calculates offline in your browser",
  },
  {
    slug: "calculator",
    title: "Calculator",
    description: "A basic arithmetic calculator with keyboard support.",
    category: "Data & Numbers",
    keywords: ["calculator", "arithmetic", "math"],
    note: "Calculates offline in your browser",
  },
  {
    slug: "age-date-calculator",
    title: "Age & Date Calculator",
    description: "Calculate age, days between dates, or add and subtract calendar days.",
    category: "Data & Numbers",
    keywords: ["age", "date", "days", "calendar"],
    note: "Calculates offline in your browser",
  },
  {
    slug: "ip-checker",
    title: "IP Address Checker",
    description: "Check your public IP or look up an IP address, location, organization, and ASN.",
    category: "Verification & OSINT",
    keywords: ["IP", "address", "ASN", "timezone"],
    note: "Uses the keyless ipwho.is public API",
  },
  {
    slug: "flashcards",
    title: "Flashcard Maker",
    description:
      "Create private flashcard decks and review, shuffle, and track known cards locally.",
    category: "Productivity",
    keywords: ["flashcards", "study", "decks", "offline"],
    note: "Saved only in your browser",
  },
  {
    slug: "stopwatch-timer",
    title: "Stopwatch & Timer",
    description: "Use a stopwatch with laps or a visual countdown timer.",
    category: "Productivity",
    keywords: ["stopwatch", "timer", "laps", "countdown"],
    note: "Runs locally in your browser",
  },
  {
    slug: "scratch-notes",
    title: "Scratch Notes",
    description: "Write private notes with autosave and export them as a text file.",
    category: "Productivity",
    keywords: ["notes", "notepad", "autosave", "local"],
    note: "Saved only in your browser",
  },
  {
    slug: "dictionary",
    title: "English Dictionary",
    description:
      "Find English definitions, parts of speech, synonyms, antonyms, and pronunciation.",
    category: "Research & Citations",
    keywords: ["dictionary", "definitions", "synonyms", "pronunciation"],
    note: "Uses the keyless Free Dictionary API",
  },
  {
    slug: "translator",
    title: "Free Translator",
    description: "Translate text with your device's built-in translator or the free MyMemory API.",
    category: "Productivity",
    keywords: ["translation", "languages", "offline", "MyMemory"],
    note: "On-device first; keyless MyMemory fallback",
  },
  {
    slug: "transcript-translator",
    title: "Transcript Translator",
    description:
      "Translate a transcript locally when available or with a free keyless API, side by side.",
    category: "Productivity",
    keywords: ["transcript", "translation", "subtitles", "languages"],
    note: "On-device first; keyless MyMemory fallback",
  },
];

export const TOOL_GUIDE_PAGES = [
  {
    slug: "video-research",
    title: "Video Research",
    description:
      "A practical guide to researching video transcripts, quotes, publishers, and original uploads.",
    category: "Verification & OSINT",
    keywords: ["video", "transcript", "verify", "research"],
  },
  {
    slug: "how-to-check",
    title: "How to Check: Verification Questions & Answers",
    description:
      "Practical answers to common questions about checking photos, sources, quotes, and online claims.",
    category: "Verification & OSINT",
    keywords: ["how to verify", "fact check", "photo", "source", "quote"],
  },
  {
    slug: "templates",
    title: "Free Research Templates & Verification Guides",
    description: "Download checklists and logs for claims, evidence, citations, and compliance.",
    category: "Verification & OSINT",
    keywords: ["templates", "checklists", "research", "verification", "compliance"],
  },
];

export const freeToolPage = (slug: string) => FREE_TOOL_PAGES.find((tool) => tool.slug === slug);

export function freeToolCopyKey(slug: string, field: "Title" | "Description") {
  const slugKey = slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return `freeTool${field}${slugKey}`;
}
