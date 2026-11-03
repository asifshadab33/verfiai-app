export function bibtexToText(
  bibtex: string,
): { title: string; author: string; year: string } | null {
  const titleMatch = bibtex.match(/title\s*=\s*\{([^}]+)\}/i);
  const authorMatch = bibtex.match(/author\s*=\s*\{([^}]+)\}/i);
  const yearMatch = bibtex.match(/year\s*=\s*\{([^}]+)\}/i);
  if (!titleMatch) return null;
  return {
    title: titleMatch[1].trim(),
    author: authorMatch ? authorMatch[1].trim() : "Unknown",
    year: yearMatch ? yearMatch[1].trim() : "n.d.",
  };
}
export function formatReference(
  data: { title: string; author: string; year: string },
  style: "apa" | "mla" | "chicago",
): string {
  if (style === "apa") return `${data.author} (${data.year}). ${data.title}.`;
  if (style === "mla") return `${data.author}. "${data.title}." ${data.year}.`;
  return `${data.author}. "${data.title}." ${data.year}.`;
}
