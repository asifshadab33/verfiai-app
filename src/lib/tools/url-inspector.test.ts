import { describe, it, expect } from 'vitest';
import { inspectUrl } from './url-inspector';

describe('inspectUrl', () => {
  it('extracts domain and protocol', () => {
    const result = inspectUrl('https://example.com/path');
    expect(result).not.toBeNull();
    expect(result!.domain).toBe('example.com');
    expect(result!.protocol).toBe('https:');
  });

  it('detects tracking parameters', () => {
    const result = inspectUrl('https://example.com?utm_source=google&fbclid=123');
    expect(result!.trackingParams).toContain('utm_source');
    expect(result!.trackingParams).toContain('fbclid');
  });

  it('returns null for invalid URL', () => {
    expect(inspectUrl('not-a-url')).toBeNull();
  });

  it('detects Punycode domains', () => {
    const result = inspectUrl('https://xn--example.com');
    expect(result!.punycode).toContain('Yes');
  });
});
