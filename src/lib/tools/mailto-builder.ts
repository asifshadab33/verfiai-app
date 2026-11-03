export interface MailtoData {
  to: string;
  cc: string;
  bcc: string;
  subject: string;
  body: string;
}
export function buildMailtoLink(data: MailtoData): string {
  const params = new URLSearchParams();
  if (data.cc) params.set("cc", data.cc);
  if (data.bcc) params.set("bcc", data.bcc);
  if (data.subject) params.set("subject", data.subject);
  if (data.body) params.set("body", data.body);
  const qs = params.toString();
  return `mailto:${data.to}${qs ? "?" + qs : ""}`;
}
