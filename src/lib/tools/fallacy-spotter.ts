export interface FallacyMatch {
  name: string;
  snippet: string;
}
const patterns: Record<string, RegExp> = {
  "Ad Hominem": /\b(you are|he is|she is)\s+(stupid|idiot|moron|biased|corrupt)\b/gi,
  Strawman: /\b(what you're really saying is|so you believe that all)\b/gi,
  "Slippery Slope": /\b(if we.*then.*will.*then.*will)\b/gi,
  "Appeal to Authority": /\b(experts say|studies show|scientists agree)\b/gi,
  "False Dilemma": /\b(either.*or.*|you're either.*or.*)\b/gi,
  Bandwagon: /\b(everyone knows|most people believe|it's popular)\b/gi,
};
export function detectFallacies(text: string): FallacyMatch[] {
  const matches: FallacyMatch[] = [];
  for (const [name, regex] of Object.entries(patterns)) {
    let m;
    while ((m = regex.exec(text)) !== null) {
      matches.push({
        name,
        snippet: text.slice(
          Math.max(0, m.index - 20),
          Math.min(text.length, m.index + m[0].length + 20),
        ),
      });
    }
  }
  return matches;
}
