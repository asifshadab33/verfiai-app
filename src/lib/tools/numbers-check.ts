export interface NumberWarning {
  type: string;
  snippet: string;
}
export function checkNumbers(text: string): NumberWarning[] {
  const warnings: NumberWarning[] = [];
  const percentMatches = text.match(/\b\d+(?:\.\d+)?%/g) || [];
  if (percentMatches.length > 0) {
    const sum = percentMatches.reduce((acc, val) => acc + parseFloat(val), 0);
    if (sum > 105 && sum < 500)
      warnings.push({
        type: "Percentages may not sum to 100%",
        snippet: `Found: ${percentMatches.join(", ")} (Sum: ${sum}%)`,
      });
  }
  const relativeMatches =
    text.match(/\b(increased|decreased|rose|fell)\s+by\s+\d+(?:\.\d+)?%/gi) || [];
  relativeMatches.forEach((m) => {
    if (!text.includes("from") && !text.match(/\d+\s+to\s+\d+/))
      warnings.push({ type: "Missing base number for relative change", snippet: m });
  });
  return warnings;
}
