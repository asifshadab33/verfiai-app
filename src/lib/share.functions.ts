import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const idInput = z.object({ id: z.string().uuid() });

async function ownReport(supabase: any, id: string) {
  const { data } = await supabase.from("reports").select("id, share_token").eq("id", id).maybeSingle();
  if (!data) throw new Error("Report not found.");
  return data as { id: string; share_token: string | null };
}

export const getShareState = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => ({ token: (await ownReport(context.supabase, data.id)).share_token }));

export const enableShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    const row = await ownReport(context.supabase, data.id);
    if (row.share_token) return { token: row.share_token };
    const token = randomBytes(16).toString("base64url");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("reports").update({ share_token: token }).eq("id", row.id);
    if (error) throw new Error("Couldn't create a share link. Please try again.");
    return { token };
  });

export const disableShare = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => idInput.parse(d))
  .handler(async ({ data, context }) => {
    const row = await ownReport(context.supabase, data.id);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("reports").update({ share_token: null }).eq("id", row.id);
    return { token: null };
  });

// Public read-only view: returns only the report content for a valid, unguessable token.
export const getSharedReport = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ token: z.string().min(16).max(64).regex(/^[A-Za-z0-9_-]+$/) }).parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row } = await supabaseAdmin.from("reports").select("title, content, created_at").eq("share_token", data.token).maybeSingle();
    if (!row) return null;
    return { title: row.title, content: row.content as unknown, created_at: row.created_at };
  });
