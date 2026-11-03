export function toTitleCase(text: string, style: "apa" | "chicago" | "mla" = "apa") {
  const minorWords = [
    "a",
    "an",
    "the",
    "and",
    "but",
    "or",
    "for",
    "nor",
    "on",
    "at",
    "to",
    "from",
    "by",
    "in",
    "of",
    "with",
  ];
  return text.toLowerCase().replace(/\w\S*/g, (word, index) => {
    if (index === 0 || !minorWords.includes(word)) {
      return word.charAt(0).toUpperCase() + word.slice(1);
    }
    return word;
  });
}
