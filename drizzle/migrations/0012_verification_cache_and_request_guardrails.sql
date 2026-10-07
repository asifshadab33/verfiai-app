CREATE TABLE public.verification_cache (
 claim_hash text PRIMARY KEY,
 result jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.verification_cache TO service_role;
REVOKE ALL ON public.verification_cache FROM anon, authenticated;
ALTER TABLE public.verification_cache ENABLE ROW LEVEL SECURITY;
CREATE INDEX verification_cache_created_at_idx ON public.verification_cache(created_at);
COMMENT ON TABLE public.verification_cache IS 'Private caller-scoped SHA-256 verification responses; application enforces strict 24-hour TTL.';

CREATE TABLE public.verification_rate_limits (
 subject_hash text PRIMARY KEY,
 window_start timestamptz NOT NULL DEFAULT now(),
 attempts integer NOT NULL DEFAULT 0
);
GRANT ALL ON public.verification_rate_limits TO service_role;
REVOKE ALL ON public.verification_rate_limits FROM anon, authenticated;
ALTER TABLE public.verification_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.reserve_verification_request(p_subject_hash text, p_authenticated boolean)
RETURNS TABLE(allowed boolean, remaining integer, resets_at timestamptz)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE bucket public.verification_rate_limits%ROWTYPE;
 cap integer := CASE WHEN p_authenticated THEN 20 ELSE 5 END;
 span interval := CASE WHEN p_authenticated THEN interval '1 day' ELSE interval '1 hour' END;
 instant timestamptz := clock_timestamp();
BEGIN
 IF p_subject_hash !~ '^[a-f0-9]{64}$' THEN RAISE EXCEPTION 'invalid_subject'; END IF;
 INSERT INTO public.verification_rate_limits(subject_hash, window_start, attempts)
 VALUES(p_subject_hash, instant, 0) ON CONFLICT(subject_hash) DO NOTHING;
 SELECT * INTO bucket FROM public.verification_rate_limits WHERE subject_hash = p_subject_hash FOR UPDATE;
 IF bucket.window_start + span <= instant THEN
  bucket.window_start := instant;
  bucket.attempts := 0;
 END IF;
 IF bucket.attempts >= cap THEN
  RETURN QUERY SELECT false, 0, bucket.window_start + span;
  RETURN;
 END IF;
 UPDATE public.verification_rate_limits SET window_start = bucket.window_start, attempts = bucket.attempts + 1
 WHERE subject_hash = p_subject_hash;
 RETURN QUERY SELECT true, cap - bucket.attempts - 1, bucket.window_start + span;
END;
$$;
REVOKE ALL ON FUNCTION public.reserve_verification_request(text, boolean) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.reserve_verification_request(text, boolean) TO service_role;