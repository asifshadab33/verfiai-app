CREATE TABLE public.verdict_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  user_id uuid,
  guest_hash text,
  kind text NOT NULL CHECK (kind IN ('correct','needs_review','irrelevant_source','better_source','explain')),
  claim text NOT NULL CHECK (char_length(claim) <= 1000),
  verdict text CHECK (char_length(verdict) <= 40),
  note text CHECK (char_length(note) <= 1000)
);
GRANT ALL ON public.verdict_feedback TO service_role;
GRANT SELECT ON public.verdict_feedback TO authenticated;
ALTER TABLE public.verdict_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins read feedback" ON public.verdict_feedback FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX verdict_feedback_created_idx ON public.verdict_feedback (created_at DESC);