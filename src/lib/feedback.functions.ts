import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const FEEDBACK_KINDS = ["correct", "needs_review", "irrelevant_source", "better_source", "explain"] as const;

/** Stores verdict feedback. Returns only ok/limited — never scoring rules or provider details. */
export const sendVerdictFeedback = createServerFn({ method: "POST" })
  .validator(d => z.object({ kind: z.enum(FEEDBACK_KINDS), claim: z.string().trim().min(1).max(1000), verdict: z.string().max(40).optional(), note: z.string().trim().max(1000).optional() }).parse(d))
  .handler(async ({ data }) => {
    const { identify } = await import("./usage.server");
    const { admin } = await import("./db.server");
    const who = await identify();
    const db = await admin();
    const since = new Date(Date.now() - 3600_000).toISOString();
    const q = db.from("verdict_feedback").select("id", { count: "exact", head: true }).gte("created_at", since);
    const { count } = await (who.userId ? q.eq("user_id", who.userId) : q.eq("guest_hash", who.fingerprint));
    if ((count ?? 0) >= 30) return { ok: false as const };
    const { error } = await db.from("verdict_feedback").insert({ kind: data.kind, claim: data.claim, verdict: data.verdict ?? null, note: data.note ?? null, user_id: who.userId, guest_hash: who.userId ? null : who.fingerprint });
    if (error) { console.error("feedback insert failed", error.message); throw new Error("Feedback could not be saved. Please try again."); }
    return { ok: true as const };
  });
