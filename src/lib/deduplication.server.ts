// Document dedup: n-gram similarity on abstracts/descriptions. When a Scribd upload overlaps an
// open-access/academic record by >80%, keep the official record. Hard cap on document snippets.
import { shingles, ngramSimilarity, SYNDICATION_THRESHOLD } from "./dossier.server";
import type { DocSource } from "./providers/documents.server";

export const DOCUMENT_CAP = 20;
const RANK: Record<DocSource["kind"], number> = { unpaywall: 0, semanticscholar: 1, core: 2, scribd: 9 };

export function dedupeDocuments(docs: DocSource[], cap = DOCUMENT_CAP): DocSource[] {
  const ordered = [...docs].sort((a, b) => RANK[a.kind] - RANK[b.kind] || (b.citations ?? 0) - (a.citations ?? 0));
  const kept: { d: DocSource; g: Set<string> }[] = [];
  const seen = new Set<string>();
  for (const d of ordered) {
    const u = d.url.toLowerCase().replace(/[?#].*$/, "");
    if (seen.has(u)) continue;
    const g = shingles(`${d.title} ${d.content}`);
    if (kept.some(k => ngramSimilarity(k.g, g) > SYNDICATION_THRESHOLD)) continue;
    seen.add(u); kept.push({ d, g });
    if (kept.length >= cap) break;
  }
  return kept.map(k => k.d);
}
