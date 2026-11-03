export function calculateSimilarity(text1: string, text2: string) {
  const getWords = (t: string) => new Set(t.toLowerCase().match(/\b\w+\b/g) || []);
  const set1 = getWords(text1);
  const set2 = getWords(text2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  const jaccard = union.size === 0 ? 0 : (intersection.size / union.size) * 100;
  return { overlapPercent: Number(jaccard.toFixed(1)), uniqueWords1: set1.size, uniqueWords2: set2.size, sharedWords: intersection.size };
}
