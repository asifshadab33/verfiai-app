CREATE TABLE public.member_facts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(),
 claim text NOT NULL CHECK (length(trim(claim)) BETWEEN 1 AND 2000),
 notes text NOT NULL DEFAULT '' CHECK (length(notes) <= 10000),
 source_url text NOT NULL DEFAULT '' CHECK (source_url = '' OR source_url ~ '^https://[^[:space:]]+$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.member_facts TO authenticated;
GRANT UPDATE (claim, notes, source_url) ON public.member_facts TO authenticated;
GRANT ALL ON public.member_facts TO service_role;
ALTER TABLE public.member_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY facts_owner_read ON public.member_facts FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY facts_owner_insert ON public.member_facts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY facts_owner_update ON public.member_facts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY facts_owner_delete ON public.member_facts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX member_facts_owner_date ON public.member_facts (user_id, created_at DESC);
CREATE TABLE public.member_tools (
 user_id uuid NOT NULL DEFAULT auth.uid(), tool_key text NOT NULL CHECK (length(tool_key) BETWEEN 1 AND 80), created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (user_id, tool_key)
);
GRANT SELECT, INSERT, DELETE ON public.member_tools TO authenticated;
GRANT ALL ON public.member_tools TO service_role;
ALTER TABLE public.member_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY tools_owner_read ON public.member_tools FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY tools_owner_insert ON public.member_tools FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY tools_owner_delete ON public.member_tools FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE TABLE public.community_posts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL DEFAULT auth.uid(),
 author_name text NOT NULL DEFAULT 'Community member' CHECK (length(trim(author_name)) BETWEEN 1 AND 60),
 title text NOT NULL CHECK (length(trim(title)) BETWEEN 1 AND 200),
 body text NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 10000),
 source_url text NOT NULL DEFAULT '' CHECK (source_url = '' OR source_url ~ '^https://[^[:space:]]+$'),
 created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.community_posts TO authenticated;
GRANT UPDATE (author_name, title, body, source_url) ON public.community_posts TO authenticated;
GRANT ALL ON public.community_posts TO service_role;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY posts_member_read ON public.community_posts FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY posts_owner_insert ON public.community_posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY posts_owner_update ON public.community_posts FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY posts_owner_delete ON public.community_posts FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX community_posts_date ON public.community_posts (created_at DESC);
CREATE INDEX community_posts_owner ON public.community_posts (user_id, created_at DESC);
CREATE TABLE public.community_comments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
 user_id uuid NOT NULL DEFAULT auth.uid(), author_name text NOT NULL DEFAULT 'Community member' CHECK (length(trim(author_name)) BETWEEN 1 AND 60),
 body text NOT NULL CHECK (length(trim(body)) BETWEEN 1 AND 4000), created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.community_comments TO authenticated;
GRANT UPDATE (body, author_name) ON public.community_comments TO authenticated;
GRANT ALL ON public.community_comments TO service_role;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY comments_member_read ON public.community_comments FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);
CREATE POLICY comments_owner_insert ON public.community_comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY comments_owner_update ON public.community_comments FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY comments_owner_delete ON public.community_comments FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE INDEX community_comments_post_date ON public.community_comments (post_id, created_at);
