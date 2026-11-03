export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    const j = randomValues[0] % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function securePick<T>(array: T[], count: number): T[] {
  return secureShuffle(array).slice(0, count);
}
