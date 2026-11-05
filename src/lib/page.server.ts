// PageExtractionProvider: user-submitted URLs are sent only to the fixed Tavily Extract
// endpoint. VerifAI never opens an arbitrary user URL from its own server runtime, avoiding
// direct SSRF against the app's network, metadata endpoints, and private services.
import { cached, cacheKey, CACHE_TTL } from "./cache.server";

const TAVILY_EXTRACT_ENDPOINT = "https://api.tavily.com/extract";
const MAX_PROVIDER_RESPONSE_CHARS = 2_000_000;
const MAX_ARTICLE_CHARS = 15_000;

/** Reject non-HTTPS, credential-bearing, nonstandard-port, local and non-public IP URLs. */
export function normalizePublicArticleUrl(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      (url.port && url.port !== "443")
    ) {
      return null;
    }

    const hostname = url.hostname
      .toLowerCase()
      .replace(/^\[|\]$/g, "")
      .replace(/\.$/, "");
    if (
      !hostname ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".home.arpa") ||
      hostname.endsWith(".test") ||
      hostname.endsWith(".invalid") ||
      hostname.endsWith(".example")
    ) {
      return null;
    }

    // IPv6 literals are conservatively denied. URL canonicalization also converts common
    // shortened, octal, hexadecimal and integer IPv4 forms to dotted decimal before this test.
    if (hostname.includes(":")) return null;
    if (/^\d+(?:\.\d+){0,3}$/.test(hostname)) {
      const parts = hostname.split(".").map(Number);
      if (
        parts.length !== 4 ||
        parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
      ) {
        return null;
      }
      const [a, b, c] = parts as [number, number, number, number];
      if (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        a >= 224 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 0 && (c === 0 || c === 2)) ||
        (a === 192 && b === 88 && c === 99) ||
        (a === 192 && b === 168) ||
        (a === 198 && (b === 18 || b === 19)) ||
        (a === 198 && b === 51 && c === 100) ||
        (a === 203 && b === 0 && c === 113)
      ) {
        return null;
      }
    }

    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

async function extractWithTavily(url: string): Promise<string> {
  const key = process.env["TAVILY_API_KEY"];
  if (!key) {
    throw new Error("Live URL extraction requires a configured API key. You can paste the article text instead.");
  }

  // The only outbound request is to a fixed, trusted API host. The submitted URL is data in
  // the request body; it is never used as the destination of a fetch from VerifAI's runtime.
  const response = await fetch(TAVILY_EXTRACT_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ urls: [url], extract_depth: "basic", format: "text" }),
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) {
    throw new Error(
      "We couldn't open that page. It may block automated readers — paste the text instead.",
    );
  }

  const body = await response.text();
  if (body.length > MAX_PROVIDER_RESPONSE_CHARS) {
    throw new Error(
      "The extracted page is too large. Paste a shorter section of the article instead.",
    );
  }

  let payload: { results?: { url?: string; raw_content?: string }[] };
  try {
    payload = JSON.parse(body) as typeof payload;
  } catch {
    throw new Error(
      "The page extraction service returned an unreadable response. Paste the text instead.",
    );
  }
  const content = payload.results?.find((result) => result.raw_content)?.raw_content?.trim() ?? "";
  if (content.length < 200) {
    throw new Error(
      "We couldn't find enough readable article text on that page. Paste the text instead.",
    );
  }
  return content.slice(0, MAX_ARTICLE_CHARS);
}

/** Extract readable article text through the fixed external extraction provider (cached). */
export async function fetchArticle(input: string): Promise<string> {
  const url = normalizePublicArticleUrl(input);
  if (!url) throw new Error("Only public HTTPS links on the standard web port can be checked.");
  return cached({
    key: cacheKey("page", [url]),
    kind: "page",
    ttlMs: CACHE_TTL.page(),
    compute: () => extractWithTavily(url),
  });
}
