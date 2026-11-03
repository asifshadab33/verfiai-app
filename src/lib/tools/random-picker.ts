export function secureShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const randomValues = new Uint32Array(1);
    crypto.getRandomValues(randomValues);
    const randomValue = randomValues[0];
    if (randomValue === undefined) continue;
    const j = randomValue % (i + 1);
    const current = result.slice(i, i + 1);
    const selected = result.slice(j, j + 1);
    result.splice(i, 1, ...selected);
    result.splice(j, 1, ...current);
  }
  return result;
}
export function securePick<T>(array: T[], count: number): T[] {
  return secureShuffle(array).slice(0, count);
}
