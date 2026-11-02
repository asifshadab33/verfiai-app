import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { lookupDoiRecord, type DoiRecord } from "./citation.server";
import { cached, cacheKey, CACHE_TTL } from "./cache.server";
import { acceptHeader, arrangeCitations, doiResolverUrl, styleById } from "./tools/cite-format";
import { normalizeDoi } from "./tools/doi";

export type { DoiRecord } from "./citation.server";
export type OpenAccessLink = { url: string; pdf?: string | undefined; version?: string | undefined };
export type DoiLookupItem = { record: DoiRecord; openAccess: OpenAccessLink | null };
export type FormattedItem = { doi: string; ok: true; text: string } | { doi: string; ok: false; error: string };

const UA = "Verfiai/1.0 (https://verfiai.app; mailto:hello@verfiai.app)";
const NO_DOI = "No valid DOI found. A DOI looks like 10.1038/nature14539.";
const doiList = z.array(z.string().trim().min(7).max(300)).min(1).max(10);
const encodeDoi = (doi: string) => doi.split("/").map(encodeURIComponent).join("/");
const uniqueDois = (list: string[]) => [...new Map(list.map(normalizeDoi).filter((d): d is string => !!d).map(d => [d.toLowerCase(), d] as const)).values()].slice(0, 10);

/** Best-effort per-instance limit; these tools only call free public registries and never use model credits. */
async function guardTool(cost: number) {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const { toolLimiter } = await import("./tools-limit.server");
  const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const r = toolLimiter.check(`ip:${ip}`, cost);
  if (!r.ok) throw new Error(`You've reached the free-tools limit. Please try again in about ${Math.ceil(r.retryAfterSec / 60)} minute(s).`);
}

/** Unpaywall (free, email-identified) finds a legal open-access copy; failures are never cached. */
async function openAccessFor(doi: string): Promise<OpenAccessLink | null> {
  try {
    const r = await cached<OpenAccessLink>({ key: cacheKey("unpaywall", [doi]), kind: "unpaywall", ttlMs: 7 * 24 * 3600_000, compute: async () => {
      const res = await fetch(`https://api.unpaywall.org/v2/${encodeDoi(doi)}?email=hello@verfiai.app`, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(6000) });
      if (res.status === 404) return { url: "" };
      if (!res.ok) throw new Error("unpaywall");
      const loc = ((await res.json()) as any)?.best_oa_location;
      return { url: String(loc?.url_for_landing_page ?? loc?.url ?? ""), pdf: loc?.url_for_pdf ?? undefined, version: loc?.version ?? undefined };
    } });
    return r.url ? r : null;
  } catch { return null; }
}

export const lookupDois = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ dois: doiList }).parse(d))
  .handler(async ({ data }): Promise<{ items: DoiLookupItem[] }> => {
    const dois = uniqueDois(data.dois);
    if (!dois.length) throw new Error(NO_DOI);
    await guardTool(dois.length);
    const items: DoiLookupItem[] = [];
    for (let i = 0; i < dois.length; i += 3) items.push(...await Promise.all(dois.slice(i, i + 3).map(async doi => {
      const record = await lookupDoiRecord(doi);
      return { record, openAccess: record.status === "found" ? await openAccessFor(record.doi) : null };
    })));
    return { items };
  });

async function formatOne(doi: string, csl: string): Promise<FormattedItem> {
  try {
    const text = await cached<string>({ key: cacheKey("cslfmt", [doi, csl]), kind: "doi-format", ttlMs: CACHE_TTL.citation(), compute: async () => {
      const res = await fetch(doiResolverUrl(doi), { headers: { Accept: acceptHeader(csl), "User-Agent": UA }, redirect: "follow", signal: AbortSignal.timeout(10000) });
      if (res.status === 404) throw new Error("not_found");
      if (!res.ok) throw new Error("unavailable");
      const body = (await res.text()).trim();
      if (!body || body.length > 4000 || /^<(!doctype|html)/i.test(body)) throw new Error("unavailable");
      return body;
    } });
    return { doi, ok: true, text };
  } catch (e) {
    return { doi, ok: false, error: e instanceof Error && e.message === "not_found" ? "DOI not found, or its registry does not provide citation data." : "Citation data is temporarily unavailable for this DOI." };
  }
}

export const formatDois = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ dois: doiList, style: z.enum(["apa", "mla", "chicago", "harvard", "ieee", "vancouver"]) }).parse(d))
  .handler(async ({ data }): Promise<{ style: string; items: FormattedItem[]; lines: string[] }> => {
    const dois = uniqueDois(data.dois);
    if (!dois.length) throw new Error(NO_DOI);
    await guardTool(dois.length);
    const style = styleById(data.style)!;
    const items: FormattedItem[] = [];
    for (let i = 0; i < dois.length; i += 3) items.push(...await Promise.all(dois.slice(i, i + 3).map(doi => formatOne(doi, style.csl))));
    return { style: data.style, items, lines: arrangeCitations(data.style, items.flatMap(i => (i.ok ? [i.text] : []))) };
  });
