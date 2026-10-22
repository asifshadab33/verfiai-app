import { z } from "zod";
import { sourceScoreSchema } from "./evidence";

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
export const EXTENDED_MIN_CHARS = 2000;
export const EXTENDED_MAX_CHARS = 4000;
export type ReportInput = z.infer<typeof reportInput>;

export const reportSchema = z.object({
  title: z.string(), summary: z.string(), background: z.string().default(""), analysis: z.string().default(""),
  findings: z.array(z.object({ title: z.string(), detail: z.string(), status: z.enum(["sourced", "inference", "disputed", "unverified"]), sourceScores: z.array(z.object({ url: z.string(), title: z.string(), quality: sourceScoreSchema })).optional() })).max(10),
  sources: z.array(z.object({ title: z.string(), url: z.string(), publisher: z.string(), date: z.string(), snippet: z.string().optional(), fetchedAt: z.string().optional(), quality: sourceScoreSchema.optional() })).max(50),
  conflictingEvidence: z.string(), methodology: z.string(), limitations: z.string(), conclusion: z.string(),
  verification: z.enum(["web", "model"]).optional(),
  engines: z.array(z.string()).optional(),
  format: z.enum(["standard", "extended", "dossier"]).optional(),
  // Extended Report sections (Day 10). Absent on Standard Briefs.
  proceduralGuidance: z.string().optional(),
  timeline: z.array(z.object({ date: z.string(), event: z.string() })).max(20).optional(),
  blindSpots: z.string().optional(),
  searchAudit: z.array(z.string()).max(30).optional(),
  passes: z.array(z.string()).max(5).optional(),
  // Deep Dossier sections: themes and an annotated bibliography (links + short contribution notes only, never article text).
  themes: z.array(z.object({ title: z.string(), summary: z.string() })).max(5).optional(),
  bibliography: z.array(z.object({ title: z.string(), url: z.string(), publisher: z.string(), date: z.string(), tier: z.string(), annotation: z.string() })).max(50).optional(),
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

/** Trim an extended report so its prose never exceeds the EXTENDED_MAX_CHARS ceiling. */
export function clampExtended(r: ResearchReport): ResearchReport {
  const out: ResearchReport = { ...r, findings: r.findings.map(f => ({ ...f })), timeline: r.timeline?.map(t => ({ ...t })) };
  const cutText = (v: string, by: number, floor: number) => { const keep = Math.max(floor, v.length - by); return keep >= v.length ? v : v.slice(0, keep).replace(/\s+\S*$/, "") + "…"; };
  const keys = ["analysis", "background", "conflictingEvidence", "proceduralGuidance", "blindSpots", "summary", "limitations", "methodology", "conclusion"] as const;
  // Pass 1 trims long sections down to a 150-char floor; pass 2 removes the floor so the ceiling is strict.
  for (const floor of [150, 0]) {
    for (const k of keys) {
      const over = charCount(out) - EXTENDED_MAX_CHARS; if (over <= 0) return out;
      const v = out[k] ?? ""; if (v) out[k] = cutText(v, over, floor);
    }
    while (charCount(out) > EXTENDED_MAX_CHARS && (out.timeline?.length ?? 0) > 0) out.timeline = out.timeline!.slice(0, -1);
    while (charCount(out) > EXTENDED_MAX_CHARS && out.findings.length > 1) out.findings = out.findings.slice(0, -1);
  }
  for (const f of out.findings) { const over = charCount(out) - EXTENDED_MAX_CHARS; if (over <= 0) break; f.detail = cutText(f.detail, over, 0); }
  return out;
}
