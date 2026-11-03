// Live HTTP checks for retrieved source URLs. Dead links (404/410, 5xx, DNS/connection failures)
// are excluded before a report is written, so the model never cites them. Bot-blocking responses
// (401/403/405/429) mean the server is up, so those links are kept.
import { cached, cacheKey } from "./cache.server";

export type LinkStatus = "ok" | "blocked" | "dead";
export const LINK_TIMEOUT_MS = 5000;
const UA = "Mozilla/5.0 (compatible; Verfiai-LinkCheck/1.0; +https://verfiai.app)";

/** Pure classification so the rule is testable. */
export function classifyStatus(status: number | null): LinkStatus {
  if (status === null) return "dead";
  if (status >= 200 && status < 400) return "ok";
  if ([401, 403, 405, 406, 429, 451].includes(status)) return "blocked";
  return "dead";
}

async function probe(url: string): Promise<number | null> {
  for (const method of ["HEAD", "GET"] as const) {
    try {
      const res = await fetch(url, {
        method,
        redirect: "follow",
        headers: { "User-Agent": UA, Accept: "text/html,application/pdf,*/*" },
        signal: AbortSignal.timeout(LINK_TIMEOUT_MS),
      });
      void res.body?.cancel();
      // Some servers reject HEAD; retry those with GET.
      if (
        method === "HEAD" &&
        (res.status === 405 || res.status === 403 || res.status === 404 || res.status >= 500)
      )
        continue;
      return res.status;
    } catch {
      if (method === "GET") return null;
    }
  }
  return null;
}

export async function checkLink(url: string): Promise<LinkStatus> {
  if (!/^https:\/\//.test(url)) return "dead";
  return cached({
    key: cacheKey("linkcheck", [url]),
    kind: "linkcheck",
    ttlMs: 6 * 3600_000,
    compute: async () => classifyStatus(await probe(url)),
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
