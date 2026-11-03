import { describe, it, expect } from 'vitest';
import { analyzeRhythm } from './sentence-rhythm';
describe('analyzeRhythm', () => {
  it('calculates stats', () => { const s = analyzeRhythm('Short sentence. Another short one.'); expect(s).not.toBeNull(); expect(s!.total).toBe(2); });
  it('returns null for empty', () => { expect(analyzeRhythm('')).toBeNull(); });
});
