import { describe, it, expect } from 'vitest';
import { detectInvisibleChars } from './invisible-chars';
describe('detectInvisibleChars', () => {
  it('detects zero width space', () => { expect(detectInvisibleChars('hello\u200Bworld').length).toBe(1); });
});
