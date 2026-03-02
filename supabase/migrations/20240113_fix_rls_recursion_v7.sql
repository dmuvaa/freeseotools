-- FIX RLS RECURSION V7 (2024-01-13)
-- "The Bypass Fix": Solves Infinite Recursion (42P17)
-- Uses a SECURITY DEFINER function to read org_id without triggering RLS checks.

-- 1. Create Trusted Helper Function
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres/superuser),
-- bypassing RLS checks on the tables it reads. This is safe here because we only return the user's OWN org_id.
CREATE OR REPLACE FUNCTION public.get_auth_org_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

--------------------------------------------------------------------------------
-- 2. UPDATE POLICIES TO USE TRUSTED FUNCTION
--------------------------------------------------------------------------------

-- ORGANIZATIONS
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING ( id = public.get_auth_org_id() );

DROP POLICY IF EXISTS "Owners can update their organization" ON public.organizations;
CREATE POLICY "Owners can update their organization"
  ON public.organizations FOR UPDATE
  USING ( id = public.get_auth_org_id() );


-- PROJECTS
DROP POLICY IF EXISTS "Users can view projects in their organization" ON public.projects;
CREATE POLICY "Users can view projects in their organization"
  ON public.projects FOR SELECT
  USING ( org_id = public.get_auth_org_id() );

DROP POLICY IF EXISTS "Users can create projects in their organization" ON public.projects;
CREATE POLICY "Users can create projects in their organization"
  ON public.projects FOR INSERT
  WITH CHECK ( org_id = public.get_auth_org_id() );

DROP POLICY IF EXISTS "Users can update projects in their organization" ON public.projects;
CREATE POLICY "Users can update projects in their organization"
  ON public.projects FOR UPDATE
  USING ( org_id = public.get_auth_org_id() );


-- PROFILES
-- NOTE: For profiles, we can't easily rely on the function because the function reads profiles!
-- So we keep the simple "OR" logic which is generally safe for this table.
-- We optimize it to avoid "self-join" recursion if possible.
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.profiles;
CREATE POLICY "Users can view members of their organization"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() OR 
    org_id = public.get_auth_org_id() -- Now uses the bypass function!
  );
