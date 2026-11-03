import {
  getRequestHeader,
  getRequestUrl,
  setResponseHeader,
  setResponseStatus,
} from "@tanstack/react-start/server";
import { admin } from "./db.server";
import { sha } from "./cache.server";
import {
  normalizeVerificationInput,
  verificationCacheFresh,
  VERIFICATION_TTL_MS,
} from "./verification-policy";

type Caller = { userId: string | null; fingerprint: string };

/** Shared atomic ceiling across reports, fact checks and citation scans, including cache hits. */
export async function guardVerificationRequest(who: Caller) {
  const { isAdminUser } = await import("./db.server");
  if (await isAdminUser(who.userId)) return;
  // Never include user-agent: changing it must not reset the guest rate bucket.
  const local = ["localhost", "127.0.0.1"].includes(new URL(getRequestUrl()).hostname);
  const ip =
    getRequestHeader("cf-connecting-ip") ??
    (local ? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() : undefined) ??
    "unknown";
  const subject = who.userId ? `user:${who.userId}` : `ip:${ip}`;
  const db = await admin();
  const { data, error } = await db.rpc("reserve_verification_request", {
    p_subject_hash: sha(`verification-rate-v1|${subject}`),
    p_authenticated: Boolean(who.userId),
  });
  const row = data?.[0];
  if (error || !row) {
    setResponseStatus(503);
    throw new Error("We couldn't check fair-use availability. Please try again shortly.");
  }
  if (!row.allowed) {
    const seconds = Math.max(1, Math.ceil((Date.parse(row.resets_at) - Date.now()) / 1000));
    setResponseStatus(429);
    setResponseHeader("Retry-After", String(seconds));
    throw new Error(
      `You've reached the fair-use limit of ${who.userId ? "20 checks per day" : "5 checks per hour"}. Please try again in ${Math.ceil(seconds / 60)} minutes. Your existing monthly allowance still applies.`,
    );
  }
}

/** Caller scope prevents private uploaded text/results being reused across accounts. */
export function verificationResponseKey(
  who: Caller,
  operation: "fact" | "scan",
  input: string,
  language = "en",
  isUrl = false,
) {
  return sha(
    JSON.stringify([
      "verification-v1",
      who.userId ?? who.fingerprint,
      operation,
      isUrl ? input.trim() : normalizeVerificationInput(input),
      language.trim().toLowerCase(),
    ]),
  );
}

export async function getVerificationResponse<T>(key: string): Promise<T | null> {
  try {
    const db = await admin();
    const { data, error } = await db
      .from("verification_cache")
      .select("result, created_at")
      .eq("claim_hash", key)
      .maybeSingle();
    if (error || !data || !verificationCacheFresh(data.created_at)) return null;
    return data.result as T;
  } catch {
    return null;
  }
}

export async function saveVerificationResponse(key: string, result: unknown) {
  try {
    const db = await admin();
    await db
      .from("verification_cache")
      .upsert({ claim_hash: key, result: result as never, created_at: new Date().toISOString() });
    // Bound retained private content: expired responses are removed opportunistically.
    await db
      .from("verification_cache")
      .delete()
      .lt("created_at", new Date(Date.now() - VERIFICATION_TTL_MS).toISOString());
  } catch {
    /* Cache failure does not discard a completed verification. */
  }
}
