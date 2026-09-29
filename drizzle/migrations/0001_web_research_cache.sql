CREATE TABLE public.research_cache (key text PRIMARY KEY, kind text NOT NULL, payload jsonb NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.research_cache TO service_role;
ALTER TABLE public.research_cache ENABLE ROW LEVEL SECURITY;
CREATE TABLE public.guest_usage (fingerprint text PRIMARY KEY, created_at timestamptz NOT NULL DEFAULT now());
GRANT ALL ON public.guest_usage TO service_role;
ALTER TABLE public.guest_usage ENABLE ROW LEVEL SECURITY;