-- EMERGENCY FIX: DROP ROGUE POLICIES
-- We found a policy named "Service role has full access to projects" that is likely leaking data to everyone.
-- This script deletes it and re-applies the secure policies.

-- 1. Projects - Drop the rogue policy
DROP POLICY IF EXISTS "Service role has full access to projects" ON public.projects;

-- 2. Drop any other potential rogue policies (just in case)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.projects;
DROP POLICY IF EXISTS "Public view" ON public.projects;

-- 3. Re-verify Security (Re-apply strict rules just to be sure)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view projects in their organization" ON public.projects;
CREATE POLICY "Users can view projects in their organization"
ON public.projects FOR SELECT
USING (
  org_id = public.get_my_org_id()
);
