// Single home for the privileged Supabase admin client so no server module
// needs to import research.server (avoids import cycles in the provider layer).
export async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}
