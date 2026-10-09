import { z } from "zod";

export const MONTHLY_REPORT_LIMIT = 3;
export const MIN_WORDS = 1000; // roughly two printed pages

export const reportInput = z.object({
  task: z.enum(["claim", "topic", "business"]).optional(),
  question: z.string().trim().min(10).max(4000),
  attachment: z.string().max(12000).optional(),
  language: z.string().max(50),
  mode: z.enum(["Balanced", "Fast", "Focused", "Comparative"]),
  company: z.string().max(120).optional(),
  website: z.string().max(200).optional(),
  industry: z.string().max(120).optional(),
  competitors: z.string().max(300).optional(),
  focus: z.string().max(500).optional(),
  format: z.enum(["standard", "extended"]).default("standard"),
});
export type ReportFormat = "standard" | "extended";
// Extended Report target length in characters (all human-readable text).
export const EXTENDED_MIN_CHARS = 4000;
export const EXTENDED_MAX_CHARS = 20000;
export type ReportInput = z.input<typeof reportInput>;

export const reportSchema = z.object({
  title: z.string(), summary: z.string(), background: z.string().default(""), analysis: z.string().default(""),
  findings: z.array(z.object({ title: z.string(), detail: z.string(), status: z.enum(["sourced", "inference", "disputed", "unverified"]) })).max(10),
  sources: z.array(z.object({ title: z.string(), url: z.string(), publisher: z.string(), date: z.string(), snippet: z.string().optional(), fetchedAt: z.string().optional() })).max(12),
  conflictingEvidence: z.string(), methodology: z.string(), limitations: z.string(), conclusion: z.string(),
  verification: z.enum(["web", "model"]).optional(),
  engines: z.array(z.string()).optional(),
  format: z.enum(["standard", "extended"]).optional(),
  // Extended Report sections (Day 10). Absent on Standard Briefs.
  proceduralGuidance: z.string().optional(),
  timeline: z.array(z.object({ date: z.string(), event: z.string() })).max(20).optional(),
  blindSpots: z.string().optional(),
  searchAudit: z.array(z.string()).max(30).optional(),
  passes: z.array(z.string()).max(5).optional(),
});
export type ResearchReport = z.infer<typeof reportSchema>;

export function wordCount(r: ResearchReport) {
  const text = [r.summary, r.background, r.analysis, r.conflictingEvidence, r.methodology, r.limitations, r.conclusion, ...r.findings.map(f => `${f.title} ${f.detail}`)].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}

export function charCount(r: ResearchReport) {
  return [r.summary, r.background, r.analysis, r.conflictingEvidence, r.methodology, r.limitations, r.conclusion, r.proceduralGuidance ?? "", r.blindSpots ?? "",
    ...r.findings.map(f => `${f.title} ${f.detail}`), ...(r.timeline ?? []).map(t => `${t.date} ${t.event}`)].join(" ").length;
}

/** Trim an extended report so its prose never exceeds the 20,000-character ceiling. */
export function clampExtended(r: ResearchReport): ResearchReport {
  let over = charCount(r) - EXTENDED_MAX_CHARS;
  if (over <= 0) return r;
  const out = { ...r };
  for (const k of ["analysis", "background", "conflictingEvidence", "proceduralGuidance", "blindSpots"] as const) {
    const v = out[k] ?? ""; if (over <= 0 || v.length < 800) continue;
    const cut = Math.min(over, v.length - 800); out[k] = v.slice(0, v.length - cut).replace(/\s+\S*$/, "") + "…"; over -= cut;
  }
  return out;
}
