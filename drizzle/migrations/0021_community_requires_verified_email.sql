CREATE OR REPLACE FUNCTION public.member_email_is_verified()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users
    WHERE id = auth.uid()
      AND email_confirmed_at IS NOT NULL
  )
$$;

REVOKE EXECUTE ON FUNCTION public.member_email_is_verified() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.member_email_is_verified() TO authenticated, service_role;

DROP POLICY IF EXISTS posts_member_read ON public.community_posts;
CREATE POLICY posts_member_read ON public.community_posts
  FOR SELECT TO authenticated
  USING ((SELECT public.member_email_is_verified()));

DROP POLICY IF EXISTS comments_member_read ON public.community_comments;
CREATE POLICY comments_member_read ON public.community_comments
  FOR SELECT TO authenticated
  USING ((SELECT public.member_email_is_verified()));
