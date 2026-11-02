/** Builds reverse-image-search links. Pure: nothing is fetched or uploaded by this code. */
export type SearchLink = { id: string; label: string; url: string };

const PRIVATE_V4 = /^(?:10\.|127\.|192\.168\.|169\.254\.|172\.(?:1[6-9]|2\d|3[01])\.|0\.)/;

export function normalizeImageUrl(raw: string): { ok: true; url: string } | { ok: false; error: string } {
  const text = raw.trim();
  if (!text) return { ok: false, error: "Enter the web address of an image." };
  if (text.length > 2000) return { ok: false, error: "That address is too long." };
  let u: URL;
  try { u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(text) ? text : `https://${text}`); } catch { return { ok: false, error: "That does not look like a web address." }; }
  if (u.protocol !== "http:" && u.protocol !== "https:") return { ok: false, error: "Only http and https addresses work." };
  if (u.username || u.password) return { ok: false, error: "Remove the username and password from the address." };
  const host = u.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal") || host === "[::1]" || PRIVATE_V4.test(host) || !host.includes(".") && !host.startsWith("["))
    return { ok: false, error: "That address is only reachable from your own network, so search engines cannot load it." };
  return { ok: true, url: u.toString() };
}

export function reverseSearchLinks(imageUrl: string): SearchLink[] {
  const e = encodeURIComponent(imageUrl);
  return [
    { id: "google", label: "Google Lens", url: `https://lens.google.com/uploadbyurl?url=${e}` },
    { id: "bing", label: "Bing Visual Search", url: `https://www.bing.com/images/search?view=detailv2&iss=sbi&FORM=SBIHMP&sbisrc=UrlPaste&q=imgurl:${e}` },
    { id: "yandex", label: "Yandex Images", url: `https://yandex.com/images/search?rpt=imageview&url=${e}` },
    { id: "tineye", label: "TinEye", url: `https://tineye.com/search?url=${e}` },
  ];
}

/** For a file on your device: open each engine and upload it there yourself. */
export const UPLOAD_SEARCH_PAGES: SearchLink[] = [
  { id: "google", label: "Google Lens", url: "https://lens.google.com/" },
  { id: "bing", label: "Bing Visual Search", url: "https://www.bing.com/visualsearch" },
  { id: "yandex", label: "Yandex Images", url: "https://yandex.com/images/" },
  { id: "tineye", label: "TinEye", url: "https://tineye.com/" },
];
