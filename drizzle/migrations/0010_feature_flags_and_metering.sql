DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','moderator','user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE POLICY "Read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Feature flag overrides. Server-only; defaults live in code.
CREATE TABLE public.feature_flags (
  key text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  admin_only boolean NOT NULL DEFAULT false,
  user_allowlist uuid[] NOT NULL DEFAULT '{}',
  org_allowlist text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.feature_flags TO service_role;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Every metered operation (cost tracking). Server writes only.
CREATE TABLE public.usage_meter (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  guest_fingerprint text,
  organization_id text,
  report_id uuid,
  resource_id uuid,
  plan text NOT NULL DEFAULT 'free',
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('quick_claim_check','report_created','claims_extracted','deep_research_report','document_upload','document_pages_processed','web_search','source_extraction','citation_lookup','ai_model_call','evaluator_escalation','tie_breaker_call','evidence_refresh','export_generation','resource_preview','resource_download')),
  quantity integer NOT NULL DEFAULT 1,
  provider text,
  model_route text,
  latency_ms integer,
  success boolean NOT NULL DEFAULT true,
  estimated_cost_usd numeric(12,6),
  actual_cost_usd numeric(12,6),
  idempotency_key text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX usage_meter_user_period ON public.usage_meter (user_id, period_start);
GRANT SELECT ON public.usage_meter TO authenticated;
GRANT ALL ON public.usage_meter TO service_role;
ALTER TABLE public.usage_meter ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own metering" ON public.usage_meter FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Credit ledger: negative = consumed, positive = refund/grant.
CREATE TABLE public.credit_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  operation text NOT NULL,
  delta integer NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX credit_ledger_user_period ON public.credit_ledger (user_id, period_start);
GRANT SELECT ON public.credit_ledger TO authenticated;
GRANT ALL ON public.credit_ledger TO service_role;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Read own credits" ON public.credit_ledger FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Atomic, idempotent credit consumption. Service role only.
CREATE OR REPLACE FUNCTION public.consume_credits(_user uuid, _op text, _cost integer, _allowance integer, _pstart timestamptz, _pend timestamptz, _key text)
RETURNS TABLE(ok boolean, used integer, remaining integer, replay boolean)
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE spent integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('credits:' || _user::text || ':' || _pstart::text));
  SELECT COALESCE(-SUM(delta),0) INTO spent FROM public.credit_ledger WHERE user_id = _user AND period_start = _pstart;
  IF EXISTS (SELECT 1 FROM public.credit_ledger WHERE idempotency_key = _key) THEN
    RETURN QUERY SELECT true, spent, GREATEST(_allowance - spent,0), true; RETURN;
  END IF;
  IF spent + _cost > _allowance THEN
    RETURN QUERY SELECT false, spent, GREATEST(_allowance - spent,0), false; RETURN;
  END IF;
  INSERT INTO public.credit_ledger(user_id, period_start, period_end, operation, delta, idempotency_key)
  VALUES (_user, _pstart, _pend, _op, -_cost, _key);
  RETURN QUERY SELECT true, spent + _cost, _allowance - spent - _cost, false;
END $$;
REVOKE ALL ON FUNCTION public.consume_credits(uuid,text,integer,integer,timestamptz,timestamptz,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_credits(uuid,text,integer,integer,timestamptz,timestamptz,text) TO service_role;