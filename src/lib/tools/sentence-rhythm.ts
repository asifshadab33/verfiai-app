export function analyzeRhythm(text: string) {
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
  if (sentences.length === 0) return null;
  const lengths = sentences.map(s => s.split(/\s+/).length);
  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / lengths.length;
  const longSentences = lengths.filter(l => l > 30).length;
  return { total: sentences.length, avg: avg.toFixed(1), variance: variance.toFixed(1), longSentences };
}
