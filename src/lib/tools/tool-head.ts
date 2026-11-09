const ORIGIN = "https://verfiai.app";

/** Head metadata shared by every free-tool page: title, description, canonical and free-app structured data. */
export function toolHead(m: { path: string; title: string; description: string; name: string }) {
  const url = `${ORIGIN}${m.path}`;
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: url }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: m.name,
          url,
          description: m.description,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          browserRequirements: "Requires JavaScript",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Verfiai", item: `${ORIGIN}/` },
            { "@type": "ListItem", position: 2, name: "Free tools", item: `${ORIGIN}/tools` },
            { "@type": "ListItem", position: 3, name: m.name, item: url },
          ],
        }),
      },
    ],
  };
}

const TOOL_PAGE_META: Record<string, { name: string; description: string }> = {
  "/tools/arxiv": {
    name: "arXiv Paper Finder",
    description: "Search arXiv for research preprints. Looks up the public arXiv registry.",
  },
  "/tools/character-counter": {
    name: "Character Counter",
    description: "Measure text length and character counts. Runs in your browser.",
  },
  "/tools/cliche-filler": {
    name: "Cliché & Filler Detector",
    description: "Flag common clichés and filler phrases. Runs in your browser.",
  },
  "/tools/csv-json": {
    name: "CSV to JSON Converter",
    description: "Convert structured data between CSV and JSON. Runs in your browser.",
  },
  "/tools/disposable-email": {
    name: "Disposable Email Checker",
    description: "Check an email domain against a disposable-domain list. Runs in your browser.",
  },
  "/tools/domain-age": {
    name: "Domain Age Checker",
    description: "Look up public domain registration information. Looks up public RDAP records.",
  },
  "/tools/email-headers": {
    name: "Email Header Analyzer",
    description: "Inspect pasted email headers for useful clues. Runs in your browser.",
  },
  "/tools/fallacy-spotter": {
    name: "Logical Fallacy Spotter",
    description: "Flag wording that may signal a reasoning fallacy. Runs in your browser.",
  },
  "/tools/file-hash": {
    name: "File Hash Verifier",
    description: "Calculate a file digest without uploading the file. Runs in your browser.",
  },
  "/tools/foi-letter": {
    name: "FOI Request Generator",
    description: "Draft a request for access to public information. Runs in your browser.",
  },
  "/tools/invisible-chars": {
    name: "Invisible Character Detector",
    description: "Find hidden characters in pasted text. Runs in your browser.",
  },
  "/tools/isbn-citer": {
    name: "ISBN Book Citer",
    description: "Find book metadata using an ISBN. Looks up Open Library.",
  },
  "/tools/keyword-density": {
    name: "Keyword Density Checker",
    description: "Measure how often terms appear in your text. Runs in your browser.",
  },
  "/tools/link-expander": {
    name: "Link Expander",
    description:
      "Follow redirects to inspect a link's destination. Requests the linked website from your browser.",
  },
  "/tools/mailto-builder": {
    name: "Mailto Link Builder",
    description: "Build an email link with subject and message fields. Runs in your browser.",
  },
  "/tools/markdown-editor": {
    name: "Markdown Editor & Preview",
    description: "Write and preview Markdown text. Runs in your browser.",
  },
  "/tools/numbers-check": {
    name: "Numbers-in-News Checker",
    description: "Inspect numerical claims for issues worth checking. Runs in your browser.",
  },
  "/tools/orcid": {
    name: "ORCID Author Lookup",
    description:
      "Find public researcher records by ORCID identifier. Looks up the public ORCID registry.",
  },
  "/tools/passive-hedge": {
    name: "Passive Voice & Hedge Detector",
    description: "Highlight possible passive phrasing and hedging. Runs in your browser.",
  },
  "/tools/password-generator": {
    name: "Password Generator",
    description: "Generate random passwords in your browser. Runs in your browser.",
  },
  "/tools/pdf-tools": {
    name: "PDF Merge, Split & Rotate",
    description: "Work with PDF files using browser-based utilities. Runs in your browser.",
  },
  "/tools/phishing-checklist": {
    name: "Phishing Red-Flag Checklist",
    description: "Work through a manual review of suspicious messages. Runs in your browser.",
  },
  "/tools/pomodoro": {
    name: "Pomodoro Timer",
    description: "Time focus sessions and breaks. Runs in your browser.",
  },
  "/tools/pubmed": {
    name: "PubMed Lookup",
    description: "Retrieve publication details from PubMed. Looks up the public PubMed registry.",
  },
  "/tools/qr-code": {
    name: "QR Code Generator",
    description:
      "Create a QR code from text or a URL. Sends entered text to the public QR Server service.",
  },
  "/tools/quote-card": {
    name: "Quote Card Generator",
    description: "Format a quote and attribution as a shareable card. Runs in your browser.",
  },
  "/tools/random-picker": {
    name: "Random Picker & Shuffler",
    description: "Choose randomly from a list of options. Runs in your browser.",
  },
  "/tools/readability": {
    name: "Readability Scorer",
    description: "Estimate how easy a passage is to read. Runs in your browser.",
  },
  "/tools/reference-converter": {
    name: "Reference Format Converter",
    description: "Convert reference data between supported formats. Runs in your browser.",
  },
  "/tools/sample-size": {
    name: "Sample Size Calculator",
    description: "Estimate a survey sample size from your assumptions. Runs in your browser.",
  },
  "/tools/sentence-rhythm": {
    name: "Sentence Rhythm Analyzer",
    description: "Compare sentence lengths and their variation. Runs in your browser.",
  },
  "/tools/serp-preview": {
    name: "SERP & Open Graph Preview",
    description: "Preview a page title and description as a search snippet. Runs in your browser.",
  },
  "/tools/similarity": {
    name: "Two-Text Similarity Checker",
    description: "Compare overlap between two text passages. Runs in your browser.",
  },
  "/tools/slugifier": {
    name: "Slug & URL Encoder",
    description: "Turn a title into a URL-friendly slug. Runs in your browser.",
  },
  "/tools/source-checklist": {
    name: "Source Evaluation Checklist",
    description: "Review a source's authorship, evidence and transparency. Runs in your browser.",
  },
  "/tools/speech-to-text": {
    name: "Speech-to-Text Dictation",
    description:
      "Transcribe speech with your browser's recognition service. Processing depends on the browser.",
  },
  "/tools/subject-line-preview": {
    name: "Subject Line Preview",
    description: "Preview email subject lines and their length. Runs in your browser.",
  },
  "/tools/text-to-speech": {
    name: "Text-to-Speech Reader",
    description:
      "Read text aloud with available browser voices. Uses your browser's speech service.",
  },
  "/tools/timestamp-converter": {
    name: "Timestamp Converter",
    description: "Convert timestamps and readable dates. Runs in your browser.",
  },
  "/tools/title-case": {
    name: "Title Case Converter",
    description: "Change title capitalization using supported styles. Runs in your browser.",
  },
  "/tools/url-inspector": {
    name: "URL Inspector",
    description: "Inspect a URL's structure and parameters. Runs in your browser.",
  },
  "/tools/wayback": {
    name: "Wayback Machine Checker",
    description: "Look for an archived capture of a web page. Looks up Internet Archive.",
  },
  "/tools/weasel-words": {
    name: "Weasel Word Detector",
    description: "Find vague wording that may need clearer support. Runs in your browser.",
  },
};

export function toolHeadForPath(path: string) {
  const page = TOOL_PAGE_META[path];
  if (!page) throw new Error(`Missing tool page metadata for ${path}.`);
  const title = `Free ${page.name} | Verfiai`;
  return toolHead({ path, name: page.name, title, description: page.description });
}
