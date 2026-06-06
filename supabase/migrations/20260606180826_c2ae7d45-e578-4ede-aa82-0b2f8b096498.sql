
CREATE TABLE public.founding_access_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  firm text,
  next_golive text,
  pain text,
  status text NOT NULL DEFAULT 'new',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.founding_access_requests TO authenticated;
GRANT INSERT ON public.founding_access_requests TO anon;
GRANT ALL ON public.founding_access_requests TO service_role;
ALTER TABLE public.founding_access_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit founding access request"
  ON public.founding_access_requests FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "admins read founding access requests"
  ON public.founding_access_requests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update founding access requests"
  ON public.founding_access_requests FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete founding access requests"
  ON public.founding_access_requests FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.ask_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer_id text,
  answer_title text,
  rating text NOT NULL,
  note text,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ask_feedback TO authenticated;
GRANT INSERT ON public.ask_feedback TO anon;
GRANT ALL ON public.ask_feedback TO service_role;
ALTER TABLE public.ask_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can submit ask feedback"
  ON public.ask_feedback FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
CREATE POLICY "admins read ask feedback"
  ON public.ask_feedback FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update ask feedback"
  ON public.ask_feedback FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins delete ask feedback"
  ON public.ask_feedback FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_founding_access_requests_updated_at
  BEFORE UPDATE ON public.founding_access_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ask_feedback_updated_at
  BEFORE UPDATE ON public.ask_feedback
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX founding_access_requests_created_at_idx ON public.founding_access_requests (created_at DESC);
CREATE INDEX ask_feedback_created_at_idx ON public.ask_feedback (created_at DESC);
