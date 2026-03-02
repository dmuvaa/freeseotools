-- DEBUG SCRIPT: VERIFY RLS STATUS
-- This checks if Security is actually turned on for the 'projects' table.

DO $$
DECLARE
  is_enabled boolean;
  policy_count int;
  policy_names text;
BEGIN
  -- 1. Check if RLS is enabled on the table
  -- (relrowsecurity = true)
  SELECT relrowsecurity INTO is_enabled
  FROM pg_class
  WHERE oid = 'public.projects'::regclass;

  IF is_enabled IS NOT TRUE THEN
     RAISE EXCEPTION 'CRITICAL FAILURE: RLS is DISABLED on projects table. The lockdown script did not work or was not run.';
  END IF;

  -- 2. Check if policies exist
  SELECT count(*), string_agg(polname, ', ') INTO policy_count, policy_names
  FROM pg_policy
  WHERE polrelid = 'public.projects'::regclass;
  
  IF policy_count = 0 THEN
      RAISE EXCEPTION 'CRITICAL FAILURE: RLS is On, but NO POLICIES exist. This denies all access (or allows all if configured wrong), but usually denies.';
  END IF;
  
  -- 3. Success
  RAISE EXCEPTION 'PASSED: Security is Active. RLS Enabled: YES. Policies: [%]. If leakage persists, your frontend is likely using the SERVICE ROLE (Admin) key instead of ANON key.', policy_names;
END $$;
