import type { ResearchReport } from "./report-schema";

/** No model-generated verdicts or synthetic prose on the sources-only path. */
export function sourcesOnlyReport(question: string, sources: ResearchReport["sources"], fetchedAt: string): ResearchReport {
  return {
    title: question.slice(0, 120), summary: "AI research is temporarily unavailable. These are source links only, not an AI answer or a verified conclusion.",
    background: "", analysis: "", findings: [], sources,
    conflictingEvidence: "Not assessed.", methodology: `Sources retrieved at ${fetchedAt}. No AI synthesis or claim evaluation was completed.`,
    limitations: sources.length ? "Open the original sources and check their dates and context. These links do not establish support for your question." : "No source links are currently available. No answer has been generated.",
    conclusion: "", engines: [], format: "standard", delivery: { mode: "sources-only", generatedAt: fetchedAt },
  };
}

export function cachedReport(report: ResearchReport, generatedAt: string, stale: boolean): ResearchReport {
  return { ...report, delivery: { mode: stale ? "stale" : "cached", generatedAt } };
}