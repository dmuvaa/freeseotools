-- CLAIM LEGACY DATA
-- Run this to assign ALL existing projects to a specific user
-- (Useful if you created data before Auth was set up)

DO $$
DECLARE
  -- REPLACE THIS WITH YOUR EMAIL (The account you want to own the data)
  -- If you are unsure, check the 'profiles' table or the Sidebar in the app.
  target_email text := 'dmuvaa70@gmail.com'; 
  
  target_org_id uuid;
  count_projects int;
BEGIN
  -- 1. Find the target organization
  SELECT org_id INTO target_org_id
  FROM public.profiles
  WHERE email = target_email
  LIMIT 1;

  IF target_org_id IS NULL THEN
    RAISE NOTICE 'User % not found! Please update the email in the script.', target_email;
    RETURN;
  END IF;

  -- 2. Update Projects
  -- This moves all projects that exist to your organization.
  -- (Since audits, jobs, chats etc. are linked to projects, they move with it)
  
  WITH moved_rows AS (
    UPDATE public.projects
    SET org_id = target_org_id
    WHERE org_id != target_org_id OR org_id IS NULL
    RETURNING 1
  )
  SELECT count(*) INTO count_projects FROM moved_rows;

  RAISE NOTICE 'Successfully moved % projects to % (User: %)', count_projects, target_org_id, target_email;

END $$;
