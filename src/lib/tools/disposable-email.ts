const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "tempmail.com",
  "throwawaymail.com",
  "guerrillamail.com",
  "sharklasers.com",
  "yopmail.com",
  "fakeinbox.com",
  "temp-mail.org",
  "dispostable.com",
  "trashmail.com",
]);
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase();
  return domain ? DISPOSABLE_DOMAINS.has(domain) : false;
}
