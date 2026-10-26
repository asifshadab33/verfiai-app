CREATE OR REPLACE FUNCTION public.semantic_scholar_gate(_action text, _retry_ms bigint DEFAULT 0)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  state jsonb;
  now_ms bigint := floor(extract(epoch FROM clock_timestamp()) * 1000);
  next_ms bigint;
  failures integer;
BEGIN
  IF _action NOT IN ('reserve', 'limited', 'success') OR _retry_ms < 0 THEN
    RAISE EXCEPTION 'Invalid provider gate input';
  END IF;
  PERFORM pg_advisory_xact_lock(hashtextextended('provider:semanticscholar:gate', 0));
  SELECT payload INTO state FROM public.research_cache WHERE key = 'provider:semanticscholar:gate';
  state := coalesce(state, '{}'::jsonb);
  next_ms := coalesce((state->>'until')::bigint, 0);
  failures := coalesce((state->>'failures')::integer, 0);
  IF _action = 'reserve' THEN
    IF next_ms > now_ms THEN RETURN false; END IF;
    -- Skip, rather than queue, other callers for at least ten seconds.
    next_ms := now_ms + 10000;
  ELSIF _action = 'limited' THEN
    failures := least(failures + 1, 7);
    -- Exponential 60s to 1h backoff, never shorten a valid Retry-After.
    next_ms := greatest(next_ms, now_ms + greatest(_retry_ms, least(3600000::bigint, 60000::bigint * (1::bigint << (failures - 1)))));
  ELSE
    failures := 0;
    -- A successful response must not clear the request spacing reservation.
  END IF;
  INSERT INTO public.research_cache(key, kind, payload, created_at)
  VALUES ('provider:semanticscholar:gate', 'provider_backoff', jsonb_build_object('until', next_ms, 'failures', failures), now())
  ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, created_at = EXCLUDED.created_at;
  RETURN true;
END;
$$;
REVOKE ALL ON FUNCTION public.semantic_scholar_gate(text, bigint) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.semantic_scholar_gate(text, bigint) TO service_role;
COMMENT ON FUNCTION public.semantic_scholar_gate(text, bigint) IS 'Service-only atomic Semantic Scholar spacing and persistent exponential backoff; no client access.';