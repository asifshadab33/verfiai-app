// Deterministic evidence aggregation: rejects made-up quotes and stops one site from dominating.
export type Stance = "supports" | "refutes" | "neutral";
export type AggVerdict = "SUPPORTED" | "CONTRADICTED" | "MIXED" | "UNVERIFIABLE";
export type Judgment = { excerptId: string; stance: Stance; quote: string };
export type SourceTier = 1 | 2 | 3;
export type ExcerptMeta = { originId: string; weight: number; tier: SourceTier };

export type EvidenceStrength = "Strong evidence" | "Moderate evidence" | "Limited evidence" | "Conflicting evidence" | "Insufficient evidence";
export type EvidenceBreakdown = { label: EvidenceStrength; authority: string; recency: string; independence: string };

/** A conservative description of observed evidence, not a probability of truth. */
export function evidenceStrength(verdict: AggVerdict, sources: { url: string; published?: string | undefined }[], checkedAt = new Date()): EvidenceBreakdown {
  const hosts = new Set(sources.map(s => sourceMeta(s.url).originId));
  const authoritative = sources.filter(s => sourceMeta(s.url).tier === 1).length;
  const dated = sources.filter(s => s.published && !Number.isNaN(Date.parse(s.published))).map(s => new Date(s.published as string).getTime());
  const recent = dated.some(d => d <= checkedAt.getTime() && checkedAt.getTime() - d < 2 * 365 * 86400000);
  const label: EvidenceStrength = verdict === "MIXED" ? "Conflicting evidence" : verdict === "UNVERIFIABLE" || !sources.length ? "Insufficient evidence"
    : hosts.size >= 2 && authoritative > 0 && recent ? "Strong evidence"
    : hosts.size >= 2 || authoritative > 0 ? "Moderate evidence" : "Limited evidence";
  return {
    label,
    authority: authoritative ? `${authoritative} source${authoritative === 1 ? "" : "s"} from Tier 1 (academic, government or institutional) domains${sources.some(s => sourceMeta(s.url).tier === 2) ? ", plus Tier 2 established press" : ""}; domain alone does not validate a claim.` : "No Tier 1 (academic, government or institutional) domain identified; authority has not been independently verified.",
    recency: dated.length ? `${dated.length} of ${sources.length} sources have parseable publication dates${recent ? "; at least one is within two years" : "; none is confirmed within two years"}.` : "Publication dates unavailable; freshness cannot be established.",
    independence: `${hosts.size} independent publisher${hosts.size === 1 ? "" : "s"} (subdomains of one base domain count once); shared ownership or reporting may still overlap.`,
  };
}

/** Report citations are model-generated and have not passed quote verification. Never label them strong. */
export function reportFindingStrength(status: string, detail: string, sources: { url: string; date: string }[]): EvidenceBreakdown {
  const indices = [...detail.matchAll(/\[(\d+)\]/g)].map(m => Number(m[1]) - 1);
  const cited = [...new Set(indices)].map(i => sources[i]).filter((s): s is { url: string; date: string } => Boolean(s));
  const result = evidenceStrength(status === "disputed" ? "MIXED" : status === "sourced" && cited.length ? "SUPPORTED" : "UNVERIFIABLE", cited.map(s => ({ url: s.url, published: s.date })));
  return { ...result, label: result.label === "Strong evidence" ? "Moderate evidence" : result.label,
    independence: `${result.independence} Report citations have not been checked against full source text.` };
}

export function deduplicateClaims(claims: string[]): string[] {
  const seen = new Set<string>();
  return claims.filter(claim => {
    const key = claim.toLocaleLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}\s]/gu, " ").replace(/\s+/g, " ").trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/** Removes repeated URLs, publishers, and near-identical syndicated excerpts before ranking or judging. */
/** Headline tokens without wire-service tags, for syndicated-story detection. */
export function headlineTokens(title: string): Set<string> {
  const t = title.toLowerCase().replace(/\b(ap|reuters|afp|associated press|update \d+|exclusive|breaking)\b/g, " ").replace(/\s[-|–—]\s[^-|–—]{2,40}$/, " ");
  return new Set(t.replace(/[^\p{L}\p{N}\s]/gu, " ").split(/\s+/).filter(w => w.length > 2));
}
export const jaccard = (a: Set<string>, b: Set<string>) => { let i = 0; for (const w of a) if (b.has(w)) i++; return i / Math.max(1, a.size + b.size - i); };

export function uniqueSources<T extends { url: string; title: string; content: string }>(sources: T[]): T[] {
  const seenUrls = new Set<string>(), seenText = new Set<string>(), seenHosts = new Set<string>();
  const seenHeads: Set<string>[] = [];
  return sources.filter(source => {
    let url: URL;
    try { url = new URL(source.url); } catch { return false; }
    if (url.protocol !== "https:") return false;
    url.hash = "";
    for (const key of [...url.searchParams.keys()]) if (/^(utm_|fbclid$|gclid$|mc_)/i.test(key)) url.searchParams.delete(key);
    const urlKey = url.toString().replace(/\/$/, "");
    const host = baseDomain(url.hostname);
    const textKey = `${source.title} ${source.content}`.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, "").slice(0, 400);
    const head = headlineTokens(source.title);
    if (seenUrls.has(urlKey) || seenHosts.has(host) || (textKey.length > 80 && seenText.has(textKey))) return false;
    // Syndicated wire stories: near-identical headlines on different hosts count once.
    if (head.size >= 4 && seenHeads.some(h => jaccard(h, head) >= 0.8)) return false;
    if (head.size >= 4) seenHeads.push(head);
    seenUrls.add(urlKey); seenHosts.add(host);
    if (textKey.length > 80) seenText.add(textKey);
    return true;
  });
}

export const MIN_EVIDENCE_THRESHOLD = 1.5;

const norm = (s: string) => s.toLowerCase().replace(/[“”]/g, '"').replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();

export function verifyQuotes(judgments: Judgment[], excerpts: Map<string, string>): Judgment[] {
  return judgments.filter(j => {
    const text = excerpts.get(j.excerptId);
    const q = norm(j.quote);
    if (!text || q.length < 8) return false;
    const t = norm(text);
    const i = t.indexOf(q);
    if (i < 0) return false;
    // word boundaries so "cat" doesn't match "catalog"
    const before = t[i - 1], after = t[i + q.length];
    return (!before || !/\w/.test(before)) && (!after || !/\w/.test(after));
  });
}

export function aggregateEvidence(judgments: Judgment[], meta: Map<string, ExcerptMeta>): AggVerdict {
  const score = { supports: 0, refutes: 0 };
  const seen = new Set<string>();
  for (const j of judgments) {
    const m = meta.get(j.excerptId);
    if (!m || j.stance === "neutral") continue;
    const key = `${m.originId}:${j.stance}`;
    if (seen.has(key)) continue;
    seen.add(key);
    score[j.stance] += m.weight;
  }
  const total = score.supports + score.refutes;
  if (total < MIN_EVIDENCE_THRESHOLD) return "UNVERIFIABLE";
  if (score.supports / total >= 0.8) return "SUPPORTED";
  if (score.refutes / total >= 0.8) return "CONTRADICTED";
  return "MIXED";
}

// Two-label public suffixes so news.bbc.co.uk and bbc.co.uk share one base domain.
const MULTI_SUFFIX = /\.(co|com|org|net|gov|ac|edu|gob|go|or|ne)\.[a-z]{2}$/i;
/** Registrable base domain: every subdomain of one publisher counts as a single independent voice. */
export function baseDomain(host: string): string {
  const h = host.toLowerCase().replace(/^www\./, "");
  const parts = h.split(".");
  return parts.slice(MULTI_SUFFIX.test(h) ? -3 : -2).join(".");
}

const TIER1 = /\.(gov|edu|int|mil)(\.[a-z]{2})?$|\.(gov|ac|edu|gob|go)\.[a-z]{2}$|^(nih\.gov|who\.int|nature\.com|science\.org|thelancet\.com|nejm\.org|bmj\.com|doi\.org|crossref\.org|openalex\.org|europa\.eu|un\.org|worldbank\.org|imf\.org|oecd\.org|springer\.com|wiley\.com|sciencedirect\.com|plos\.org|arxiv\.org|jstor\.org|cochrane\.org|britannica\.com)$/i;
const TIER2 = /^(reuters\.com|apnews\.com|afp\.com|bbc\.co\.uk|bbc\.com|nytimes\.com|washingtonpost\.com|wsj\.com|ft\.com|economist\.com|theguardian\.com|bloomberg\.com|npr\.org|pbs\.org|aljazeera\.com|dw\.com|france24\.com|lemonde\.fr|spiegel\.de|elpais\.com|cnn\.com|cbsnews\.com|nbcnews\.com|abcnews\.go\.com|abc\.net\.au|cbc\.ca|thehindu\.com|nikkei\.com|scmp\.com|politico\.com|axios\.com|time\.com|newsweek\.com|usatoday\.com|latimes\.com|wikipedia\.org|snopes\.com|politifact\.com|factcheck\.org|fullfact\.org)$/i;
const TIER3 = /^(medium\.com|substack\.com|blogspot\.com|wordpress\.com|reddit\.com|quora\.com|x\.com|twitter\.com|facebook\.com|instagram\.com|tiktok\.com|youtube\.com|tumblr\.com|stackexchange\.com|linkedin\.com|pinterest\.com|threads\.net)$/i;

/** Tier 1 academic/government/institutional, Tier 2 established press, Tier 3 blogs/forums/social and unknown. */
export function sourceTier(host: string): SourceTier {
  const h = host.toLowerCase().replace(/^www\./, ""), base = baseDomain(h);
  if (TIER3.test(base)) return 3;
  if (TIER1.test(h) || TIER1.test(base)) return 1;
  if (TIER2.test(base) || TIER2.test(h)) return 2;
  return 3;
}
const TIER_WEIGHT: Record<SourceTier, number> = { 1: 2, 2: 1.5, 3: 0.75 };

export function sourceMeta(url: string): ExcerptMeta {
  let host = "";
  try { host = new URL(url).hostname.replace(/^www\./, ""); } catch { /* ignore */ }
  if (!host) return { originId: url, weight: TIER_WEIGHT[3], tier: 3 };
  const tier = sourceTier(host);
  return { originId: baseDomain(host), weight: TIER_WEIGHT[tier], tier };
}
