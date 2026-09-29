CREATE TABLE public.usage_events (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, kind text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE INDEX usage_events_user_kind_idx ON public.usage_events (user_id, kind, created_at);
GRANT SELECT ON public.usage_events TO authenticated;
GRANT ALL ON public.usage_events TO service_role;
ALTER TABLE public.usage_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own usage" ON public.usage_events FOR SELECT TO authenticated USING (auth.uid() = user_id);