-- Fix RLS policies for colleges to allow registration flow

-- Ensure RLS is enabled
ALTER TABLE colleges ENABLE ROW LEVEL SECURITY;

-- Drop overly restrictive update policy if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'colleges' AND policyname = 'College admins can update their college'
  ) THEN
    DROP POLICY "College admins can update their college" ON colleges;
  END IF;
END $$;

-- INSERT policies: allow both anon and authenticated to create a college (registration flow)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'colleges' AND policyname = 'Anyone can create colleges (anon)'
  ) THEN
    CREATE POLICY "Anyone can create colleges (anon)"
      ON colleges
      FOR INSERT
      TO anon
      WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'colleges' AND policyname = 'Anyone can create colleges (authenticated)'
  ) THEN
    CREATE POLICY "Anyone can create colleges (authenticated)"
      ON colleges
      FOR INSERT
      TO authenticated
      WITH CHECK (true);
  END IF;
END $$;

-- UPDATE policy: allow the new admin to claim the college by setting admin_id when it's currently NULL
-- The USING clause checks the existing row (admin_id IS NULL)
-- The WITH CHECK clause ensures the new value matches auth.uid()
CREATE POLICY "Admin can claim college when admin_id is NULL"
  ON colleges
  FOR UPDATE
  TO authenticated
  USING (admin_id IS NULL)
  WITH CHECK (admin_id = auth.uid());

-- Keep SELECT policy as-is; if missing, ensure read access for authenticated users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'colleges' AND policyname = 'Anyone can read colleges'
  ) THEN
    CREATE POLICY "Anyone can read colleges"
      ON colleges
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;
END $$;
