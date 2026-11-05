import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { toolLimiter } from "./tools-limit.server";

export type FreeSourceResult = {
  title: string;
  url: string;
  date?: string;
  detail?: string;
};

const searchQuery = z.object({ query: z.string().trim().min(1).max(250) });
const userAgent = "Verfiai/1.0 (https://verfiai.app; mailto:hello@verfiai.app)";

async function guardFreeSearch() {
  const { getRequestHeader } = await import("@tanstack/react-start/server");
  const ip =
    getRequestHeader("cf-connecting-ip") ??
    getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const limit = toolLimiter.check(`ip:${ip}`);
  if (!limit.ok)
    throw new Error(
      `You've reached the free-tools limit. Please try again in about ${Math.ceil(limit.retryAfterSec / 60)} minute(s).`,
    );
}

export const searchGdeltNews = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => searchQuery.parse(data))
  .handler(async ({ data }): Promise<FreeSourceResult[]> => {
    await guardFreeSearch();
    const query = data.query
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 250);
    if (!query) throw new Error("Enter a news search query.");
    const { gdeltFetch } = await import("./gdelt-queue.server");
    const response = await gdeltFetch(
      `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(query)}&mode=ArtList&format=json&maxrecords=10&sort=datedesc`,
      { headers: { "User-Agent": userAgent } },
    );
    if (!response?.ok)
      throw new Error("GDELT is temporarily unavailable. Please try again shortly.");
    const payload = (await response.json()) as {
      articles?: { title?: string; url?: string; seendate?: string; domain?: string }[];
    };
    return (payload.articles ?? [])
      .flatMap((article) => {
        if (!article.title || !article.url?.startsWith("https://")) return [];
        return [{
          title: article.title,
          url: article.url,
          ...(article.seendate === undefined ? {} : { date: article.seendate }),
          ...(article.domain === undefined ? {} : { detail: article.domain }),
        }];
      });
  });

export const searchSecFilings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((data) => searchQuery.parse(data))
  .handler(async ({ data }): Promise<FreeSourceResult[]> => {
    await guardFreeSearch();
    const response = await fetch(
      `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(data.query.slice(0, 200))}&dateRange=all`,
      {
        headers: { "User-Agent": userAgent, Accept: "application/json" },
        signal: AbortSignal.timeout(10_000),
      },
    );
    if (!response.ok) {
      console.error("SEC EDGAR error", response.status);
      throw new Error("SEC EDGAR is temporarily unavailable. Please try again shortly.");
    }
    const payload = (await response.json()) as {
      hits?: {
        hits?: {
          _id?: string;
          _source?: {
            ciks?: string[];
            display_names?: string[];
            file_date?: string;
            form?: string;
            file_description?: string;
          };
        }[];
      };
    };
    return (payload.hits?.hits ?? []).flatMap((hit) => {
      const [accession, file] = (hit._id ?? "").split(":");
      const cik = hit._source?.ciks?.[0];
      const accessionNumber = accession?.replace(/-/g, "");
      if (
        !accession ||
        !/^\d{18}$/.test(accessionNumber ?? "") ||
        !file ||
        !/^[A-Za-z0-9._-]+$/.test(file) ||
        !cik ||
        !/^\d+$/.test(cik)
      )
        return [];
      const name = hit._source?.display_names?.[0] ?? "SEC filing";
      const form = hit._source?.form;
      return [
        {
          title: `${name}${form ? ` (${form})` : ""} filing`,
          url: `https://www.sec.gov/Archives/edgar/data/${Number(cik)}/${accessionNumber}/${file}`,
          ...(hit._source?.file_date === undefined ? {} : { date: hit._source.file_date }),
          ...(hit._source?.file_description === undefined ? {} : { detail: hit._source.file_description }),
        },
      ];
    });
  });
