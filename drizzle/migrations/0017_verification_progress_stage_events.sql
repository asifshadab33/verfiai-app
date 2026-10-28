CREATE TABLE public.progress_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 run_id uuid NOT NULL,
 event jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.progress_events TO service_role;
GRANT USAGE, SELECT ON SEQUENCE public.progress_events_id_seq TO service_role;
ALTER TABLE public.progress_events ENABLE ROW LEVEL SECURITY;
CREATE INDEX progress_events_run_idx ON public.progress_events(run_id, created_at);
COMMENT ON TABLE public.progress_events IS 'Service-only coarse progress telemetry; no prompts, claims, reports or subscription secrets. Broadcast uses an opaque run topic and signed payloads for guest compatibility.';
CREATE FUNCTION public.emit_progress_event(p_run_id uuid, p_event jsonb, p_signature text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
 IF p_event->>'runId' IS DISTINCT FROM p_run_id::text OR p_event->>'stage' NOT IN ('validation','search','scoring','synthesis','rendering','complete') OR length(p_event::text) > 1500 OR p_signature !~ '^[a-f0-9]{64}$' THEN
  RAISE EXCEPTION 'Invalid progress event';
 END IF;
 INSERT INTO public.progress_events(run_id, event) VALUES (p_run_id, p_event);
 PERFORM realtime.send(jsonb_build_object('event', p_event, 'signature', p_signature), 'progress', 'progress:' || p_run_id::text, false);
END;
$$;
REVOKE ALL ON FUNCTION public.emit_progress_event(uuid, jsonb, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.emit_progress_event(uuid, jsonb, text) TO service_role;