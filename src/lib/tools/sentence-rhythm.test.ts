import { describe, it, expect } from 'vitest';
import { analyzeRhythm } from './sentence-rhythm';

describe('analyzeRhythm', () => {
  it('calculates basic stats', () => {
    const text = 'Short sentence. Another short one. This is a longer sentence with more words in it.';
    const stats = analyzeRhythm(text);
    expect(stats).not.toBeNull();
    expect(stats!.total).toBe(3);
    expect(parseFloat(stats!.avg)).toBeGreaterThan(2);
  });

  it('returns null for empty text', () => {
    expect(analyzeRhythm('')).toBeNull();
  });

  it('flags long sentences', () => {
    const longSentence = 'This is a very long sentence that contains many words and should be flagged as overly long because it exceeds thirty words in total length which makes it difficult to read.';
    const stats = analyzeRhythm(longSentence);
    expect(stats!.longSentences).toBeGreaterThan(0);
  });
});
