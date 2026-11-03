export function getKeywordDensity(text: string) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const totalWords = words.length;
  const density: Record<string, { count: number; percentage: number }> = {};
  words.forEach((word) => {
    if (word.length > 3) {
      density[word] = density[word] || { count: 0, percentage: 0 };
      density[word].count += 1;
      density[word].percentage = Number(((density[word].count / totalWords) * 100).toFixed(2));
    }
  });
  return Object.entries(density)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([word, data]) => ({ word, ...data }));
}
