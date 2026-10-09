ALTER TABLE public.community_waitlist ADD COLUMN IF NOT EXISTS interests text[] NOT NULL DEFAULT '{pro_teams}';

CREATE OR REPLACE FUNCTION public.join_community_waitlist(p_email text, p_fingerprint text, p_interest text DEFAULT 'pro_teams')
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE n integer;
BEGIN
 IF length(p_email) > 254 OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN RAISE EXCEPTION 'invalid_email'; END IF;
 IF p_interest NOT IN ('pro_teams','analyst') THEN RAISE EXCEPTION 'invalid_interest'; END IF;
 INSERT INTO public.community_waitlist_rate_limits(fingerprint, attempts) VALUES (p_fingerprint, 1)
 ON CONFLICT (fingerprint) DO UPDATE SET
 attempts = CASE WHEN community_waitlist_rate_limits.window_start < now() - interval '1 hour' THEN 1 ELSE community_waitlist_rate_limits.attempts + 1 END,
 window_start = CASE WHEN community_waitlist_rate_limits.window_start < now() - interval '1 hour' THEN now() ELSE community_waitlist_rate_limits.window_start END
 RETURNING attempts INTO n;
 IF n > 5 THEN RAISE EXCEPTION 'rate_limit'; END IF;
 INSERT INTO public.community_waitlist(email, interests) VALUES (lower(trim(p_email)), ARRAY[p_interest])
 ON CONFLICT (email) DO UPDATE SET interests = (SELECT array_agg(DISTINCT x) FROM unnest(community_waitlist.interests || ARRAY[p_interest]) x);
END;
$function$;
DROP FUNCTION IF EXISTS public.join_community_waitlist(text, text);
REVOKE ALL ON FUNCTION public.join_community_waitlist(text, text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_community_waitlist(text, text, text) TO service_role;

CREATE POLICY "Owners upload report media" ON storage.objects FOR INSERT TO authenticated
 WITH CHECK (bucket_id = 'report-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners read report media" ON storage.objects FOR SELECT TO authenticated
 USING (bucket_id = 'report-media' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Owners delete report media" ON storage.objects FOR DELETE TO authenticated
 USING (bucket_id = 'report-media' AND (storage.foldername(name))[1] = auth.uid()::text);