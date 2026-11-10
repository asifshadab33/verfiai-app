// Centralized affiliate registry for commercial SaaS tools listed on
// /executive-tools. Each entry maps a tool to its canonical (clean) URL and,
// when an approved partner program exists, an affiliate URL. The FTC
// disclosure on the page covers every entry so adding a partner link later is
// a data change, not a copy change.

export type AffiliateEntry = {
  /** Clean canonical destination, always safe to show. */
  fallbackUrl: string;
  /** Partner/affiliate URL, or null when no active program exists. */
  affiliateUrl: string | null;
};

const registry: Record<string, AffiliateEntry> = {
  Brevo: { fallbackUrl: "https://www.brevo.com/", affiliateUrl: null },
  Mailchimp: { fallbackUrl: "https://mailchimp.com/", affiliateUrl: null },
  MailerLite: { fallbackUrl: "https://www.mailerlite.com/", affiliateUrl: null },
  "HubSpot Marketing Hub": {
    fallbackUrl: "https://www.hubspot.com/products/marketing",
    affiliateUrl: null,
  },
  Sender: { fallbackUrl: "https://www.sender.net/", affiliateUrl: null },
  "Talkwalker Alerts": {
    fallbackUrl: "https://www.talkwalker.com/alerts",
    affiliateUrl: null,
  },
  Feedly: { fallbackUrl: "https://feedly.com/", affiliateUrl: null },
  Canva: { fallbackUrl: "https://www.canva.com/", affiliateUrl: null },
  "Sejda PDF": { fallbackUrl: "https://www.sejda.com/", affiliateUrl: null },
  "Adobe Acrobat online": {
    fallbackUrl: "https://www.adobe.com/acrobat/online.html",
    affiliateUrl: null,
  },
  Looker: { fallbackUrl: "https://lookerstudio.google.com/", affiliateUrl: null },
  Datawrapper: { fallbackUrl: "https://www.datawrapper.de/", affiliateUrl: null },
  Flourish: { fallbackUrl: "https://flourish.studio/", affiliateUrl: null },
  "Tableau Public": { fallbackUrl: "https://public.tableau.com/", affiliateUrl: null },
  Observable: { fallbackUrl: "https://observablehq.com/", affiliateUrl: null },
  Calendly: { fallbackUrl: "https://calendly.com/", affiliateUrl: null },
  Doodle: { fallbackUrl: "https://doodle.com/", affiliateUrl: null },
  Whereby: { fallbackUrl: "https://whereby.com/", affiliateUrl: null },
  "tl;dv": { fallbackUrl: "https://tldv.io/", affiliateUrl: null },
  WeTransfer: { fallbackUrl: "https://wetransfer.com/", affiliateUrl: null },
  Filemail: { fallbackUrl: "https://www.filemail.com/", affiliateUrl: null },
  Dropbox: { fallbackUrl: "https://www.dropbox.com/", affiliateUrl: null },
  LanguageTool: { fallbackUrl: "https://languagetool.org/", affiliateUrl: null },
  Grammarly: { fallbackUrl: "https://www.grammarly.com/", affiliateUrl: null },
  "DeepL Write": { fallbackUrl: "https://www.deepl.com/write", affiliateUrl: null },
  QuillBot: { fallbackUrl: "https://quillbot.com/", affiliateUrl: null },
  Wordtune: { fallbackUrl: "https://www.wordtune.com/", affiliateUrl: null },
};

export type ResolvedPartnerLink = {
  href: string;
  /** True when the href is an active partner (affiliate) link. */
  isPartner: boolean;
};

/**
 * Resolve the link for a listed tool. Returns the affiliate URL when one is
 * active, otherwise the clean fallback URL. Unknown tools return null so the
 * caller can keep its existing plain URL untouched.
 */
export function resolvePartnerLink(name: string): ResolvedPartnerLink | null {
  const entry = registry[name];
  if (!entry) return null;
  if (entry.affiliateUrl) {
    return { href: entry.affiliateUrl, isPartner: true };
  }
  return { href: entry.fallbackUrl, isPartner: false };
}

/** rel attribute value for a resolved link. */
export function partnerLinkRel(isPartner: boolean): string {
  return isPartner ? "noopener noreferrer sponsored" : "noopener noreferrer";
}
