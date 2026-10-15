DROP POLICY IF EXISTS "Drivers read own progress" ON public.stop_progress;
DROP POLICY IF EXISTS "Drivers insert own progress" ON public.stop_progress;
DROP POLICY IF EXISTS "Drivers update own progress" ON public.stop_progress;
DROP POLICY IF EXISTS "Drivers delete own progress" ON public.stop_progress;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.stop_progress TO anon;

CREATE POLICY "Anyone can read progress" ON public.stop_progress FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can insert progress" ON public.stop_progress FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Anyone can update progress" ON public.stop_progress FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete progress" ON public.stop_progress FOR DELETE TO anon, authenticated USING (true);

COMMENT ON COLUMN public.stop_progress.user_id IS 'DEPRECATED: prototype uses sample driver ids in driver_id; user_id only set for real-account rows.';