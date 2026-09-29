import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export type CitationStatus = "verified" | "retracted" | "unverified";
export type CitationResult = {
  raw: string;
  title: string;
  year?: string;
  doi?: string;
  status: CitationStatus;
  note: string;
  matchedTitle?: string;
};

const UA = "VerifAI/1.0 (https://verfiai.app; mailto:hello@verfiai.app)";

function tokens(s: string) {
  return new Set(s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2));
}
function similarity(a: string, b: string) {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  A.forEach((w) => { if (B.has(w)) inter++; });
  return inter / Math.min(A.size, B.size);
}

async function crossref(path: string) {
  const res = await fetch(`https://api.crossref.org/${path}`, { headers: { "User-Agent": UA } });
  if (!res.ok) return null;
  return (await res.json()) as { message: any };
}

async function isRetracted(doi: string, title: string) {
  if (/^\s*(retracted|withdrawn)\b/i.test(title)) return true;
  const r = await crossref(`works?filter=updates:${encodeURIComponent(doi)}&rows=5`);
  const items: any[] = r?.message?.items ?? [];
  return items.some((it) => (it["update-to"] ?? []).some((u: any) => /retract|withdraw/i.test(u.type ?? "") && String(u.DOI).toLowerCase() === doi.toLowerCase()));
}

async function checkOne(c: { raw: string; title: string; year?: string; doi?: string }): Promise<CitationResult> {
  try {
    let doi = c.doi?.replace(/^https?:\/\/(dx\.)?doi\.org\//i, "").trim();
    let found: any = null;
    if (doi) {
      found = (await crossref(`works/${encodeURIComponent(doi)}`))?.message ?? null;
      if (!found) return { ...c, doi, status: "unverified", note: "This DOI does not exist in Crossref. Possible fabrication or typo." };
    } else {
      const q = encodeURIComponent((c.title || c.raw).slice(0, 300));
      const hit = (await crossref(`works?query.bibliographic=${q}&rows=3&select=DOI,title`))?.message?.items ?? [];
      found = hit.find((h: any) => similarity(c.title || c.raw, h.title?.[0] ?? "") >= 0.7) ?? null;
      if (!found) return { ...c, status: "unverified", note: "No matching record found in Crossref. High risk of a fabricated or mis-cited source." };
      doi = found.DOI;
    }
    const matchedTitle: string = found.title?.[0] ?? "";
    if (c.title && matchedTitle && similarity(c.title, matchedTitle) < 0.5) {
      return { ...c, doi, matchedTitle, status: "unverified", note: "The DOI exists but points to a different paper than the cited title." };
    }
    if (await isRetracted(doi!, matchedTitle)) {
      return { ...c, doi, matchedTitle, status: "retracted", note: "Crossref lists a retraction notice for this paper." };
    }
    return { ...c, doi, matchedTitle, status: "verified", note: "Found in Crossref with no retraction notice." };
  } catch {
    return { ...c, status: "unverified", note: "Could not reach Crossref for this citation. Try again." };
  }
}

export const verifyCitations = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().trim().min(20).max(60000) }).parse(d))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("The verification service is not configured.");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: 'Extract every bibliographic citation/reference from the user text. Return JSON {"citations":[{"raw":string (the exact reference text as it appears, verbatim),"title":string,"year":string,"doi":string|null}]}. Do not invent or correct anything; copy what is written. Max 40 citations. If none, return {"citations":[]}.' },
          { role: "user", content: data.text },
        ],
      }),
    });
    if (res.status === 429) throw new Error("Too many scans right now. Please wait a minute and try again.");
    if (res.status === 402) throw new Error("The scanning service is temporarily unavailable. Please try later.");
    if (!res.ok) throw new Error("Could not read citations from this text. Please try again.");
    const json = await res.json();
    let parsed: { citations?: any[] } = {};
    try { parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}"); } catch { /* empty */ }
    const list = (parsed.citations ?? []).slice(0, 40).map((c) => ({
      raw: String(c.raw ?? "").slice(0, 600),
      title: String(c.title ?? "").slice(0, 400),
      year: c.year ? String(c.year) : undefined,
      doi: c.doi ? String(c.doi) : undefined,
    })).filter((c) => c.raw || c.title);
    const results: CitationResult[] = [];
    for (let i = 0; i < list.length; i += 6) {
      results.push(...(await Promise.all(list.slice(i, i + 6).map(checkOne))));
    }
    return { results };
  });
