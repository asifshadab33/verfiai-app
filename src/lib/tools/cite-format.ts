/** Citation style catalogue for DOI content negotiation (CSL style ids from the public CSL repository). */
export type CitationStyleId = "apa" | "mla" | "chicago" | "harvard" | "ieee" | "vancouver";
export const CITATION_STYLES: { id: CitationStyleId; label: string; csl: string; numbered: boolean }[] = [
  { id: "apa", label: "APA 7th", csl: "apa", numbered: false },
  { id: "mla", label: "MLA 9th", csl: "modern-language-association", numbered: false },
  { id: "chicago", label: "Chicago (author-date)", csl: "chicago-author-date", numbered: false },
  { id: "harvard", label: "Harvard (Cite Them Right)", csl: "harvard-cite-them-right", numbered: false },
  { id: "ieee", label: "IEEE", csl: "ieee", numbered: true },
  { id: "vancouver", label: "Vancouver", csl: "vancouver", numbered: true },
];
export const styleById = (id: string) => CITATION_STYLES.find(s => s.id === id);
export const doiResolverUrl = (doi: string) => `https://doi.org/${doi.split("/").map(encodeURIComponent).join("/")}`;
export const acceptHeader = (csl: string) => `text/x-bibliography; style=${csl}; locale=en-US`;
const stripNumber = (t: string) => t.replace(/^\s*(?:\[\d+\]|\d+[.)])\s*/, "");

/** Alphabetical for author-date styles; sequentially numbered for IEEE and Vancouver. */
export function arrangeCitations(styleId: string, texts: string[]): string[] {
  const style = styleById(styleId);
  const clean = texts.map(t => t.replace(/\s+/g, " ").trim()).filter(Boolean);
  if (style?.numbered) return clean.map((t, n) => `${style.id === "ieee" ? `[${n + 1}]` : `${n + 1}.`} ${stripNumber(t)}`);
  return [...clean].sort((a, b) => a.localeCompare(b, "en", { sensitivity: "base" }));
}
