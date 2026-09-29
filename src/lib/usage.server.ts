import { getRequestHeader } from "@tanstack/react-start/server";
import { admin, sha } from "./research.server";

export const LIMITS = { scan: 3, fact: 3 } as const;
export const GUEST_LIMIT = 1;
export type UsageKind = keyof typeof LIMITS;

function monthStart() { const d = new Date(); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString(); }

// Resolves the caller from an optional bearer token; guests fall back to a hashed IP + browser fingerprint.
export async function identify(): Promise<{ userId: string | null; fingerprint: string }> {
  const ip = getRequestHeader("cf-connecting-ip") ?? getRequestHeader("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const fingerprint = sha(`${ip}|${getRequestHeader("user-agent") ?? ""}|verifai-guest`);
  const auth = getRequestHeader("authorization");
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    if (token.split(".").length === 3) {
      const db = await admin();
      const { data } = await db.auth.getUser(token);
      if (data.user) return { userId: data.user.id, fingerprint };
    }
  }
  return { userId: null, fingerprint };
}

export async function usageFor(kind: UsageKind) {
  const who = await identify();
  const db = await admin();
  if (who.userId) {
    const { count } = await db.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", who.userId).eq("kind", kind).gte("created_at", monthStart());
    return { signedIn: true, used: count ?? 0, limit: LIMITS[kind] };
  }
  const { data } = await db.from("guest_usage").select("fingerprint").eq("fingerprint", `${kind}:${who.fingerprint}`).maybeSingle();
  return { signedIn: false, used: data ? 1 : 0, limit: GUEST_LIMIT };
}

/** Reserves one use before doing paid work. Returns a release function to undo it if the work fails. */
export async function claimUsage(kind: UsageKind): Promise<{ signedIn: boolean; release: () => Promise<void> }> {
  const who = await identify();
  const db = await admin();
  if (who.userId) {
    const { count } = await db.from("usage_events").select("id", { count: "exact", head: true }).eq("user_id", who.userId).eq("kind", kind).gte("created_at", monthStart());
    if ((count ?? 0) >= LIMITS[kind]) throw new Error(`You've used your ${LIMITS[kind]} free ${kind === "scan" ? "citation scans" : "fact-checks"} this month.`);
    const { data } = await db.from("usage_events").insert({ user_id: who.userId, kind }).select("id").single();
    return { signedIn: true, release: async () => { if (data) await db.from("usage_events").delete().eq("id", data.id); } };
  }
  const fp = `${kind}:${who.fingerprint}`;
  const { error } = await db.from("guest_usage").insert({ fingerprint: fp });
  if (error) throw new Error(`You've used your free ${kind === "scan" ? "citation scan" : "fact-check"}. Sign in with Google or email to get ${LIMITS[kind]} every month.`);
  return { signedIn: false, release: async () => { await db.from("guest_usage").delete().eq("fingerprint", fp); } };
}
