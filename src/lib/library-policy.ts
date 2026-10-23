import { z } from "zod";

export const librarySearchInput = z.object({
  query: z.string().trim().max(160).default(""),
  category: z.string().trim().max(50).default("all"),
  region: z.string().trim().max(50).default("all"),
  kind: z.enum(["index", "library"]),
});
export const libraryIssueInput = z.object({
  id: z.string().uuid(),
  type: z.enum(["EVIDENCE_OUTDATED", "SOURCE_BROKEN", "COPYRIGHT_CONCERN", "INACCURATE_CONTENT", "OTHER"]),
  message: z.string().trim().min(10).max(2000),
});
export function safePublisherUrl(value: string | null | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}