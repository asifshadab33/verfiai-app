// Server-side feature flags. Code defaults < env var (e.g. DEEP_RESEARCH_ENABLED=true) < feature_flags table row.
// Allowlisted users and admins can access a disabled flag for private beta testing.
import { admin } from "./research.server";

export const FLAG_DEFAULTS = {
  ANALYST_PLAN_ENABLED: false,
  ANALYST_WAITLIST_ENABLED: true,
  EVIDENCE_LIBRARY_ENABLED: false,
  OPEN_KNOWLEDGE_INDEX_ENABLED: false,
  RESOURCE_DOWNLOADS_ENABLED: false,
  RESOURCE_ADMIN_ENABLED: false,
  DEEP_RESEARCH_ENABLED: false,
  ADVANCED_SOURCE_SCORING_ENABLED: false,
  MODEL_ESCALATION_ROUTING_ENABLED: false,
  PUBLIC_REPORT_SHARING_ENABLED: true,
} as const;
export type FlagKey = keyof typeof FLAG_DEFAULTS;
export const FLAG_KEYS = Object.keys(FLAG_DEFAULTS) as FlagKey[];

type Row = { key: string; enabled: boolean; admin_only: boolean; user_allowlist: string[]; org_allowlist: string[] };

function envValue(key: FlagKey): boolean | undefined {
  const v = process.env[key]?.trim().toLowerCase();
  if (v === "true" || v === "1") return true;
  if (v === "false" || v === "0") return false;
  return undefined;
}

export async function evaluateFlags(userId: string | null, orgId?: string | null): Promise<Record<FlagKey, boolean>> {
  const db = await admin();
  const [{ data: rows }, isAdmin] = await Promise.all([
    db.from("feature_flags").select("key, enabled, admin_only, user_allowlist, org_allowlist"),
    userId ? db.rpc("has_role", { _user_id: userId, _role: "admin" }).then((r) => !!r.data) : Promise.resolve(false),
  ]);
  const byKey = new Map(((rows ?? []) as Row[]).map((r) => [r.key, r]));
  const out = {} as Record<FlagKey, boolean>;
  for (const key of FLAG_KEYS) {
    const row = byKey.get(key);
    const globalOn = row ? row.enabled : (envValue(key) ?? FLAG_DEFAULTS[key]);
    let on = globalOn && !(row?.admin_only && !isAdmin);
    if (!on && userId && row?.user_allowlist?.includes(userId)) on = true;
    if (!on && orgId && row?.org_allowlist?.includes(orgId)) on = true;
    if (!on && isAdmin && row?.admin_only) on = true;
    out[key] = on;
  }
  return out;
}

export async function isEnabled(key: FlagKey, userId: string | null) {
  return (await evaluateFlags(userId))[key];
}

/** Throws a friendly error when the feature is off for this caller. Use at the top of server handlers. */
export async function requireFlag(key: FlagKey, userId: string | null) {
  if (!(await isEnabled(key, userId))) throw new Error("This feature is coming soon.");
}
