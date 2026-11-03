const fillers = [
  "very",
  "really",
  "just",
  "actually",
  "basically",
  "literally",
  "simply",
  "quite",
  "somewhat",
  "rather",
  "in order to",
  "due to the fact that",
  "at this point in time",
];
export function detectFillers(text: string) {
  const matches: { word: string; index: number }[] = [];
  const lower = text.toLowerCase();
  for (const f of fillers) {
    const regex = new RegExp(`\\b${f}\\b`, "gi");
    let m;
    while ((m = regex.exec(lower)) !== null) matches.push({ word: f, index: m.index });
  }
  return matches.sort((a, b) => a.index - b.index);
}
