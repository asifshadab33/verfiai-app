// Single home for the privileged Supabase admin client so no server module
// needs to import research.server (avoids import cycles in the provider layer).
export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Server-side admin check for an already-verified user id (roles live in user_roles). Admins bypass usage limits. */
export async function isAdminUser(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const db = await admin();
  const { data } = await db.rpc("has_role", { _user_id: userId, _role: "admin" });
  return data === true;
}
