export function detectPassiveAndHedge(text: string) {
  const passiveRegex = /\b(am|is|are|was|were|be|been|being)\b\s+\w+ed\b/gi;
  const hedgeWords = [
    "might",
    "could",
    "perhaps",
    "possibly",
    "somewhat",
    "arguably",
    "seems",
    "appears",
    "likely",
    "generally",
    "usually",
  ];
  const matches: { type: "passive" | "hedge"; word: string; index: number }[] = [];
  let match;
  while ((match = passiveRegex.exec(text)) !== null) {
    matches.push({ type: "passive", word: match[0], index: match.index });
  }
  const lowerText = text.toLowerCase();
  for (const hedge of hedgeWords) {
    const regex = new RegExp(`\\b${hedge}\\b`, "gi");
    while ((match = regex.exec(lowerText)) !== null) {
      matches.push({
        type: "hedge",
        word: text.slice(match.index, match.index + hedge.length),
        index: match.index,
      });
    }
  }
  return matches.sort((a, b) => a.index - b.index);
}
