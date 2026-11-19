CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text DEFAULT 'live'::text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT CASE
    WHEN auth.role() = 'service_role' OR (auth.uid() IS NOT NULL AND auth.uid() = user_uuid)
    THEN EXISTS (
      SELECT 1 FROM public.subscriptions
      WHERE user_id = user_uuid
        AND environment = check_env
        AND product_id = 'pro_plan'
        AND status IN ('active', 'trialing', 'past_due', 'canceled')
        AND (status <> 'canceled' OR current_period_end > now())
        AND (current_period_end IS NULL OR current_period_end > now())
    )
    ELSE false
  END
$function$;
REVOKE ALL ON FUNCTION public.has_active_subscription(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_active_subscription(uuid, text) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT CASE
    WHEN auth.role() = 'service_role' OR (auth.uid() IS NOT NULL AND auth.uid() = _user_id)
    THEN EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_id = _user_id AND role = _role
    )
    ELSE false
  END
$function$;
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;