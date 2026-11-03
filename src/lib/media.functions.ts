import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { MEDIA_BUCKET, MEDIA_URL_TTL_SECONDS, isOwnMediaPath } from "./media-policy";

/** Day 12: private media attachments are only ever served through 15-minute signed URLs, to their owner. */
export const getMediaSignedUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d) => z.object({ path: z.string().min(3).max(300) }).parse(d))
  .handler(async ({ data, context }) => {
    if (!isOwnMediaPath(data.path, context.userId)) throw new Error("You can only open your own attachments.");
    // RLS on storage.objects also restricts reads to the owner's folder.
    const { data: signed, error } = await context.supabase.storage.from(MEDIA_BUCKET).createSignedUrl(data.path, MEDIA_URL_TTL_SECONDS);
    if (error || !signed) throw new Error("That attachment could not be opened.");
    return { url: signed.signedUrl, expiresAt: new Date(Date.now() + MEDIA_URL_TTL_SECONDS * 1000).toISOString() };
  });
