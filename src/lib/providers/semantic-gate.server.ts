import { admin } from "../db.server";

/** Respect numeric and HTTP-date Retry-After, including delays longer than one hour. */
export function retryAfterMs(value: string | null, now = Date.now()): number {
  if (!value?.trim()) return 0;
  const text = value.trim();
  if (/^\d+(\.\d+)?$/.test(text)) return Math.ceil(Number(text) * 1000);
  const date = Date.parse(text);
  return Number.isFinite(date) ? Math.max(0, date - now) : 0;
}

/** Atomic across workers; fail closed if coordination is unavailable. Never queue a user request. */
export async function semanticGate(
  action: "reserve" | "limited" | "success",
  retryMs = 0,
): Promise<boolean> {
  try {
    const db = await admin();
    const { data, error } = await db.rpc("semantic_scholar_gate", {
      _action: action,
      _retry_ms: retryMs,
    });
    return !error && data === true;
  } catch {
    return false;
  }
}
