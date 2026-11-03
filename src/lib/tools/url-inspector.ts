export function inspectUrl(urlStr: string) {
  try {
    const url = new URL(urlStr);
    const params = Array.from(url.searchParams.keys());
    const trackingParams = params.filter(p => ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid'].includes(p));
    return {
      protocol: url.protocol,
      domain: url.hostname,
      punycode: url.hostname.includes('xn--') ? 'Yes (IDN detected)' : 'No',
      trackingParams,
      cleanUrl: (() => { const u = new URL(urlStr); trackingParams.forEach(p => u.searchParams.delete(p)); return u.toString(); })()
    };
  } catch { return null; }
}
