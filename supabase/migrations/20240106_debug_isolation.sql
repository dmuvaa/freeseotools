-- DEBUG SCRIPT: CHECK USER ISOLATION
-- Run this to check if two users are accidentally in the same organization.
-- It will fail with an error message containing the results - THIS IS EXPECTED.

DO $$
DECLARE
  -- Emails from your screenshots
  email_A text := 'dmuvaa70@gmail.com';
  email_B text := 'muvaadennis@gmail.com';
  
  org_A uuid;
  org_B uuid;
BEGIN
  SELECT org_id INTO org_A FROM profiles WHERE email = email_A;
  SELECT org_id INTO org_B FROM profiles WHERE email = email_B;

  IF org_A IS NULL THEN
     RAISE EXCEPTION 'DEBUG: User % has NO Organization linked. Setup incomplete.', email_A;
  END IF;
  
  IF org_B IS NULL THEN
     RAISE EXCEPTION 'DEBUG: User % has NO Organization linked. Setup incomplete.', email_B;
  END IF;

  IF org_A = org_B THEN
     RAISE EXCEPTION 'DEBUG: CRITICAL - Users share the SAME OrgID: %. This explains why they see the same projects.', org_A;
  ELSE
     RAISE EXCEPTION 'DEBUG: PASSED - Users have DIFFERENT OrgIDs (A: %, B: %). If leakage persists, verify you are not using SEARCH_ROLE_KEY in frontend.', org_A, org_B;
  END IF;
END $$;
