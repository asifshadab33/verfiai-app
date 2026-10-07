CREATE TABLE public.community_waitlist (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email text NOT NULL UNIQUE,
 consent_version text NOT NULL DEFAULT 'community-waitlist-v1',
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.community_waitlist TO service_role;
ALTER TABLE public.community_waitlist ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.community_waitlist_rate_limits (
 fingerprint text PRIMARY KEY,
 window_start timestamptz NOT NULL DEFAULT now(),
 attempts integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.community_waitlist_rate_limits TO service_role;
ALTER TABLE public.community_waitlist_rate_limits ENABLE ROW LEVEL SECURITY;
CREATE FUNCTION public.join_community_waitlist(p_email text, p_fingerprint text) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
 IF length(p_email) > 254 OR p_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
  RAISE EXCEPTION 'invalid_email';
 END IF;
 INSERT INTO public.community_waitlist_rate_limits(fingerprint, attempts) VALUES (p_fingerprint, 1)
 ON CONFLICT (fingerprint) DO UPDATE SET
 attempts = CASE WHEN community_waitlist_rate_limits.window_start < now() - interval '1 hour' THEN 1 ELSE community_waitlist_rate_limits.attempts + 1 END,
 window_start = CASE WHEN community_waitlist_rate_limits.window_start < now() - interval '1 hour' THEN now() ELSE community_waitlist_rate_limits.window_start END
 RETURNING attempts INTO n;
 IF n > 5 THEN RAISE EXCEPTION 'rate_limit'; END IF;
 INSERT INTO public.community_waitlist(email) VALUES (lower(trim(p_email))) ON CONFLICT (email) DO NOTHING;
END;
$$;
REVOKE ALL ON FUNCTION public.join_community_waitlist(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.join_community_waitlist(text, text) TO service_role;