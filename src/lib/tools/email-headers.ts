export interface HeaderAnalysis { received: string[]; spf: string; dkim: string; dmarc: string; }
export function parseEmailHeaders(raw: string): HeaderAnalysis {
  const received = raw.match(/Received:\s+[^\n]+/gi) || [];
  const authResults = raw.match(/Authentication-Results:\s+[^\n]+/gi)?.join('\n') || '';
  const spf = authResults.match(/spf=(pass|fail|softfail|neutral|none)/i)?.[1] || 'Not found';
  const dkim = authResults.match(/dkim=(pass|fail|none)/i)?.[1] || 'Not found';
  const dmarc = authResults.match(/dmarc=(pass|fail|none)/i)?.[1] || 'Not found';
  return { received, spf, dkim, dmarc };
}
