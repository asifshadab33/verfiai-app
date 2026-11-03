import { z } from "zod";

// A separate secret authenticates public Broadcast payloads (guests have no auth session).
// Neither token is placed in URLs or analytics; persisted events contain no submitted text.
export const progressInput = z.object({ runId: z.uuid(), secret: z.uuid() });
export type ProgressInput = z.infer<typeof progressInput>;
export const PROGRESS_STAGES = [
  "validation",
  "search",
  "scoring",
  "synthesis",
  "rendering",
] as const;
export type ProgressStage = (typeof PROGRESS_STAGES)[number] | "complete";
export const progressEventSchema = z.object({
  runId: z.uuid(),
  stage: z.enum([...PROGRESS_STAGES, "complete"]),
  label: z.string().max(100),
  detail: z.string().max(200),
  completedSteps: z.number().int().min(0).max(5),
  totalSteps: z.literal(5),
  timestamp: z.string(),
  sequence: z.number().int().positive(),
});
export type ProgressEvent = z.infer<typeof progressEventSchema>;
export type ProgressEmitter = (stage: ProgressStage) => Promise<void>;
export const PROGRESS_LABELS: Record<ProgressStage, [string, string]> = {
  validation: ["Input validated", "The request passed validation and usage checks."],
  search: ["Searching sources", "Retrieving sources or available cached evidence."],
  scoring: ["Deduplicating and ranking", "Selecting relevant sources and applying evidence rules."],
  synthesis: ["Synthesizing results", "Preparing evidence-grounded findings and explanations."],
  rendering: [
    "Preparing result for display",
    "Validating the final result and preparing its response.",
  ],
  complete: ["Complete", "The result is ready."],
};

export function makeProgressEvent(
  runId: string,
  stage: ProgressStage,
  sequence: number,
): ProgressEvent {
  const [label, detail] = PROGRESS_LABELS[stage];
  return {
    runId,
    stage,
    label,
    detail,
    sequence,
    completedSteps: stage === "complete" ? 5 : PROGRESS_STAGES.indexOf(stage),
    totalSteps: 5,
    timestamp: new Date().toISOString(),
  };
}

export async function signProgress(event: ProgressEvent, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(JSON.stringify(progressEventSchema.parse(event))),
  );
  return Array.from(new Uint8Array(signature), (n) => n.toString(16).padStart(2, "0")).join("");
}

export async function verifyProgress(
  payload: unknown,
  input: ProgressInput,
): Promise<ProgressEvent | null> {
  const parsed = z
    .object({ event: progressEventSchema, signature: z.string().regex(/^[a-f0-9]{64}$/) })
    .safeParse(payload);
  if (!parsed.success || parsed.data.event.runId !== input.runId) return null;
  const expected = await signProgress(parsed.data.event, input.secret);
  return expected === parsed.data.signature ? parsed.data.event : null;
}
