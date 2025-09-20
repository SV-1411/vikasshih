-- Allow anon users to SELECT colleges (needed during registration flow to read back the created row)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'colleges' AND policyname = 'Anyone (anon) can read colleges'
  ) THEN
    CREATE POLICY "Anyone (anon) can read colleges"
      ON colleges
      FOR SELECT
      TO anon
      USING (true);
  END IF;
END $$;
