import { z } from "zod";

export const MONTHLY_REPORT_LIMIT = 3;
export const MIN_WORDS = 1000; // roughly two printed pages

export const reportInput = z.object({
  question: z.string().trim().min(10).max(4000),
  attachment: z.string().max(12000).optional(),
  language: z.string().max(50),
  mode: z.enum(["Balanced", "Fast", "Focused", "Comparative"]),
  company: z.string().max(120).optional(),
  website: z.string().max(200).optional(),
  industry: z.string().max(120).optional(),
  competitors: z.string().max(300).optional(),
  focus: z.string().max(500).optional(),
});
export type ReportInput = z.infer<typeof reportInput>;

export const reportSchema = z.object({
  title: z.string(), summary: z.string(), background: z.string().default(""), analysis: z.string().default(""),
  findings: z.array(z.object({ title: z.string(), detail: z.string(), status: z.enum(["sourced", "inference", "disputed", "unverified"]) })).max(10),
  sources: z.array(z.object({ title: z.string(), url: z.string(), publisher: z.string(), date: z.string(), snippet: z.string().optional(), fetchedAt: z.string().optional() })).max(12),
  conflictingEvidence: z.string(), methodology: z.string(), limitations: z.string(), conclusion: z.string(),
  verification: z.enum(["web", "model"]).optional(),
  engines: z.array(z.string()).optional(),
});
export type ResearchReport = z.infer<typeof reportSchema>;

export function wordCount(r: ResearchReport) {
  const text = [r.summary, r.background, r.analysis, r.conflictingEvidence, r.methodology, r.limitations, r.conclusion, ...r.findings.map(f => `${f.title} ${f.detail}`)].join(" ");
  return text.split(/\s+/).filter(Boolean).length;
}
