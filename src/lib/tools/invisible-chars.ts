export interface InvisibleChar {
  char: string;
  code: string;
  name: string;
}
export function detectInvisibleChars(text: string): InvisibleChar[] {
  const map: Record<string, string> = {
    "\u200B": "Zero Width Space",
    "\u200C": "Zero Width Non-Joiner",
    "\u200D": "Zero Width Joiner",
    "\uFEFF": "Byte Order Mark",
    "\u202A": "Left-to-Right Embedding",
    "\u202B": "Right-to-Left Embedding",
    "\u202C": "Pop Directional Formatting",
    "\u202D": "Left-to-Right Override",
    "\u202E": "Right-to-Left Override",
  };
  const found: InvisibleChar[] = [];
  for (const [char, name] of Object.entries(map)) {
    if (text.includes(char))
      found.push({
        char: "␣",
        code: `U+${char.charCodeAt(0).toString(16).toUpperCase().padStart(4, "0")}`,
        name,
      });
  }
  return found;
}
