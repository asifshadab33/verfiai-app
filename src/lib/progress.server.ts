import { admin } from "./db.server";
import { makeProgressEvent, signProgress, type ProgressEmitter, type ProgressInput } from "./progress";

/** Best effort: telemetry failure must not fail or refund a successful verification. */
export function createProgressEmitter(input?: ProgressInput): ProgressEmitter {
  let sequence = 0;
  return async stage => {
    if (!input) return;
    const event = makeProgressEvent(input.runId, stage, ++sequence);
    try {
      const signature = await signProgress(event, input.secret);
      const db = await admin();
      // Narrow adapter until generated database types pick up this additive migration.
      const rpc = db.rpc.bind(db) as unknown as (name: string, args: Record<string, unknown>) => PromiseLike<{ error: unknown }>;
      const { error } = await rpc("emit_progress_event", { p_run_id: input.runId, p_event: event, p_signature: signature });
      if (error) console.warn("progress: persistence/broadcast unavailable");
    } catch { console.warn("progress: persistence/broadcast unavailable"); }
  };
}