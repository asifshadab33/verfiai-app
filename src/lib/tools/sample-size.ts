export function calculateSampleSize(population: number, confidence: number, margin: number): number {
  const z = confidence === 99 ? 2.576 : confidence === 95 ? 1.96 : 1.645;
  const p = 0.5;
  const e = margin / 100;
  const numerator = Math.pow(z, 2) * p * (1 - p);
  const denominator = Math.pow(e, 2);
  const infinitePop = numerator / denominator;
  if (population <= 0) return Math.ceil(infinitePop);
  return Math.ceil(infinitePop / (1 + (infinitePop - 1) / population));
}
