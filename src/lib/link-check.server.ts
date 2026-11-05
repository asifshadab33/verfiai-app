// Live HTTP checks for retrieved source URLs. Dead links (404/410, 5xx, DNS/connection failures)
// are excluded before a report is written, so the model never cites them. Bot-blocking responses
// (401/403/405/429) mean the server is up, so those links are kept.
//
// SSRF controls:
// - HTTPS only; reject credentials, local hostnames, IP literals outside global unicast IPv4.
// - Resolve DNS to IPv4 only and validate every answer.
// - Pin the validated DNS result to the actual TLS connection through https.request's custom lookup
//   callback. This closes the resolve-then-fetch DNS-rebinding gap present in a separate preflight.
// - Redirects are handled manually and each destination is parsed/resolved/validated independently.
// IPv6 is intentionally denied until a vetted global-unicast IPv6 classifier is added.
import dns from "node:dns";
import https from "node:https";
import type { LookupFunction } from "node:net";
import { isIP } from "node:net";
import { cached, cacheKey } from "./cache.server";

export type LinkStatus = "ok" | "blocked" | "dead";
export const LINK_TIMEOUT_MS = 5000;
const MAX_REDIRECTS = 3;
const UA = "Mozilla/5.0 (compatible; Verfiai-LinkCheck/1.0; +https://verfiai.app)";
const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/** Pure classification so the rule is testable. */
export function classifyStatus(status: number | null): LinkStatus {
  if (status === null) return "dead";
  if (status >= 200 && status < 400) return "ok";
  if ([401, 403, 405, 406, 429, 451].includes(status)) return "blocked";
  return "dead";
}

/** Deny special-purpose, private, loopback, link-local, documentation and multicast IPv4 ranges. */
export function isPublicAddress(address: string): boolean {
  if (isIP(address) !== 4) return false;
  const octets = address.split(".").map(Number);
  if (octets.length !== 4 || octets.some((n) => !Number.isInteger(n) || n < 0 || n > 255))
    return false;
  const [a, b, c] = octets as [number, number, number, number];
  if (a === 0 || a === 10 || a === 127 || a >= 224) return false;
  if (a === 100 && b >= 64 && b <= 127) return false; // shared address space
  if (a === 169 && b === 254) return false; // link-local
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 192 && b === 0 && c === 0) return false; // IETF protocol assignments
  if (a === 192 && b === 0 && c === 2) return false; // documentation
  if (a === 192 && b === 88 && c === 99) return false; // deprecated 6to4 relay
  if (a === 192 && b === 168) return false;
  if (a === 198 && (b === 18 || b === 19)) return false; // benchmarking
  if (a === 198 && b === 51 && c === 100) return false; // documentation
  if (a === 203 && b === 0 && c === 113) return false; // documentation
  if (a === 255) return false;
  return true;
}

/** Parse and validate a URL before any outbound request. */
export function parseSafeHttpsUrl(input: string): URL | null {
  try {
    const url = new URL(input);
    if (url.protocol !== "https:" || url.username || url.password) return null;
    const hostname = url.hostname
      .toLowerCase()
      .replace("[", "")
      .replace("]", "")
      .replace(/\.$/, "");
    if (
      !hostname ||
      hostname === "localhost" ||
      hostname.endsWith(".localhost") ||
      hostname.endsWith(".local") ||
      hostname.endsWith(".internal") ||
      hostname.endsWith(".home.arpa")
    )
      return null;
    // IPv6 is conservatively denied. Numeric IPv4 literals must be globally routable.
    if (isIP(hostname) === 6) return null;
    if (isIP(hostname) === 4 && !isPublicAddress(hostname)) return null;
    url.hash = "";
    return url;
  } catch {
    return null;
  }
}

/**
 * Resolve and pin a single public IPv4 address for this TLS connection.
 * The lookup result supplied to https.request is the same address that was validated,
 * preventing a second DNS resolution from changing the destination between check and connect.
 */
const publicIpv4Lookup: LookupFunction = (hostname, options, callback) => {
  dns.lookup(hostname, { all: true, family: 4, verbatim: true }, (error, addresses) => {
    if (error) {
      callback(error, "", 4);
      return;
    }
    if (!addresses.length || addresses.some((entry) => !isPublicAddress(entry.address))) {
      callback(new Error("Destination resolves to a non-public IPv4 address"), "", 4);
      return;
    }
    const selected = addresses[0];
    if (!selected) {
      callback(new Error("No public IPv4 address available"), "", 4);
      return;
    }
    if (typeof options === "object" && options.all) {
      callback(
        null,
        addresses.map((entry) => ({ address: entry.address, family: 4 })),
      );
    } else {
      callback(null, selected.address, 4);
    }
  });
};

type ProbeResponse = { status: number; location: string | undefined };

function requestOnce(url: URL, method: "HEAD" | "GET"): Promise<ProbeResponse> {
  return new Promise((resolve, reject) => {
    const hostname = url.hostname.replace("[", "").replace("]", "");
    const request = https.request(
      {
        protocol: "https:",
        hostname,
        port: url.port || 443,
        path: `${url.pathname}${url.search}`,
        method,
        headers: { "User-Agent": UA, Accept: "text/html,application/pdf,*/*" },
        // Disable pooled sockets so each request uses its own validated destination lookup.
        agent: false,
        lookup: isIP(hostname) === 4 ? undefined : publicIpv4Lookup,
        servername: isIP(hostname) ? undefined : hostname,
        timeout: LINK_TIMEOUT_MS,
      },
      (response) => {
        const result = { status: response.statusCode ?? 0, location: response.headers.location };
        response.resume();
        resolve(result);
      },
    );
    request.once("timeout", () => request.destroy(new Error("Link check timed out")));
    request.once("error", reject);
    request.end();
  });
}

/** Follow a small number of redirects; every hop gets a fresh pinned public-IP resolution. */
async function probe(input: string): Promise<number | null> {
  let current = parseSafeHttpsUrl(input);
  if (!current) return null;

  for (let redirects = 0; redirects <= MAX_REDIRECTS; redirects++) {
    let response: ProbeResponse | null = null;
    for (const method of ["HEAD", "GET"] as const) {
      try {
        response = await requestOnce(current, method);
        if (
          method === "HEAD" &&
          (
            response.status === 405 ||
            response.status === 403 ||
            response.status === 404 ||
            response.status >= 500
          )
        )
          continue;
        break;
      } catch {
        if (method === "GET") return null;
      }
    }
    if (!response) return null;

    if (REDIRECT_STATUSES.has(response.status)) {
      if (!response.location || redirects === MAX_REDIRECTS) return null;
      let next: URL;
      try {
        next = new URL(response.location, current);
      } catch {
        return null;
      }
      const safeNext = parseSafeHttpsUrl(next.toString());
      if (!safeNext) return null;
      current = safeNext;
      continue;
    }
    return response.status;
  }
  return null;
}

export async function checkLink(url: string): Promise<LinkStatus> {
  const safeUrl = parseSafeHttpsUrl(url);
  if (!safeUrl) return "dead";
  return cached({
    key: cacheKey("linkcheck", [safeUrl.toString()]),
    kind: "linkcheck",
    ttlMs: 6 * 3600_000,
    compute: async () => classifyStatus(await probe(safeUrl.toString())),
  }).catch(() => "blocked" as const);
}

/** Keeps live sources in order until `limit`; if every check fails (e.g. our network is down), returns the originals. */
export async function filterLiveSources<T extends { url: string }>(
  sources: T[],
  limit: number,
): Promise<{ kept: T[]; dead: T[] }> {
  const statuses = await Promise.all(sources.map((s) => checkLink(s.url)));
  const live = sources.filter((_, i) => statuses[i] !== "dead");
  const dead = sources.filter((_, i) => statuses[i] === "dead");
  if (!live.length) return { kept: sources.slice(0, limit), dead: [] };
  return { kept: live.slice(0, limit), dead };
}
