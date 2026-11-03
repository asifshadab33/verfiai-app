import { describe, it, expect } from 'vitest';
import { inspectUrl } from './url-inspector';
describe('inspectUrl', () => {
  it('extracts domain', () => { expect(inspectUrl('https://example.com')!.domain).toBe('example.com'); });
  it('detects tracking params', () => { expect(inspectUrl('https://x.com?utm_source=google')!.trackingParams).toContain('utm_source'); });
  it('returns null for invalid', () => { expect(inspectUrl('not-a-url')).toBeNull(); });
});
