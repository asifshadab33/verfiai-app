export const weaselWords = [
  "studies show",
  "experts agree",
  "many people say",
  "research indicates",
  "it is believed",
  "some say",
  "widely reported",
  "critics argue",
  "often",
  "usually",
];

export interface WeaselMatch {
  word: string;
  startIndex: number;
  endIndex: number;
}

export function detectWeaselWords(text: string): WeaselMatch[] {
  const matches: WeaselMatch[] = [];
  const lowerText = text.toLowerCase();
  for (const word of weaselWords) {
    const regex = new RegExp(`\\b${word}\\b`, "gi");
    let match;
    while ((match = regex.exec(lowerText)) !== null) {
      matches.push({
        word: text.slice(match.index, match.index + word.length),
        startIndex: match.index,
        endIndex: match.index + word.length,
      });
    }
  }
  return matches.sort((a, b) => a.startIndex - b.startIndex);
}
