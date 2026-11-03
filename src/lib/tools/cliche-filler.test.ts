import { describe, it, expect } from 'vitest';
import { detectFillers } from './cliche-filler';
describe('detectFillers', () => {
  it('detects common fillers', () => { expect(detectFillers('This is very important.').length).toBeGreaterThan(0); });
  it('returns empty for clean text', () => { expect(detectFillers('The project completed.').length).toBe(0); });
});
