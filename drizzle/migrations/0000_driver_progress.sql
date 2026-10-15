CREATE TABLE public.stop_progress (
  driver_id text NOT NULL,
  stop_id text NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (driver_id, stop_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stop_progress TO anon, authenticated;
GRANT ALL ON public.stop_progress TO service_role;
ALTER TABLE public.stop_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Prototype drivers manage progress" ON public.stop_progress FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);