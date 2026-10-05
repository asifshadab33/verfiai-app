// PageExtractionProvider: fetches a public https page and extracts readable
// article text. Extracted text is cached so repeat link checks are free.
import { cached, cacheKey, CACHE_TTL } from "./cache.server";

function isPublicHost(h: string) {
  if (/^(localhost|0\.0\.0\.0|\[?::1\]?)$/i.test(h) || h.endsWith(".local") || h.endsWith(".internal")) return false;
  if (/^\d+\.\d+\.\d+\.\d+$/.test(h)) { const [a, b] = h.split(".").map(Number); if (a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) || (a === 172 && b! >= 16 && b! <= 31) || (a === 192 && b === 168)) return false; }
  return !h.includes(":");
}

async function extract(url: string): Promise<string> {
  let u: URL;
  try { u = new URL(url); } catch { throw new Error("That link isn't a valid web address."); }
  if (u.protocol !== "https:" || !isPublicHost(u.hostname)) throw new Error("Only public https:// links can be checked.");
  let res: Response;
  try { res = await fetch(u, { headers: { "User-Agent": "Verfiai/1.0 (+https://verfiai.app)", Accept: "text/html,text/plain" }, redirect: "follow", signal: AbortSignal.timeout(15000) }); }
  catch { throw new Error("We couldn't open that page. It may block automated readers — paste the text instead."); }
  if (!res.ok) throw new Error("We couldn't open that page. It may block automated readers — paste the text instead.");
  const html = (await res.text()).slice(0, 2_000_000);
  const text = html.replace(/<(script|style|noscript|nav|footer|header|aside)[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, " ").trim();
  if (text.length < 200) throw new Error("We couldn't find readable article text on that page. Paste the text instead.");
  return text.slice(0, 15000);
}

/** Extracted article text for a public https URL (cached, errors still thrown to the caller). */
export async function fetchArticle(url: string): Promise<string> {
  let normalized = url.trim();
  try { const u = new URL(normalized); normalized = `https://${u.hostname.replace(/^www\./, "")}${u.pathname}${u.search}`; } catch { /* validated in extract */ }
  return cached({ key: cacheKey("page", [normalized]), kind: "page", ttlMs: CACHE_TTL.page(), compute: () => extract(url) });
}
