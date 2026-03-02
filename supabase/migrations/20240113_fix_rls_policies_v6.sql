-- FIX RLS POLICIES V6 (2024-01-13)
-- "The Visibility Fix": Replaces opaque helper functions with direct, explicit RLS policies.
-- This ensures the Dashboard can actually SEE the organization the user belongs to.

--------------------------------------------------------------------------------
-- 1. ORGANIZATIONS
--------------------------------------------------------------------------------
-- Allow users to view the organization they belong to (via profiles table)
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (
    id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );

-- Allow owners to update
DROP POLICY IF EXISTS "Owners can update their organization" ON public.organizations;
CREATE POLICY "Owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid() AND role = 'owner'
    )
  );


--------------------------------------------------------------------------------
-- 2. PROJECTS
--------------------------------------------------------------------------------
-- View
DROP POLICY IF EXISTS "Users can view projects in their organization" ON public.projects;
CREATE POLICY "Users can view projects in their organization"
  ON public.projects FOR SELECT
  USING (
    org_id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );

-- Create
DROP POLICY IF EXISTS "Users can create projects in their organization" ON public.projects;
CREATE POLICY "Users can create projects in their organization"
  ON public.projects FOR INSERT
  WITH CHECK (
    org_id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );

-- Update
DROP POLICY IF EXISTS "Users can update projects in their organization" ON public.projects;
CREATE POLICY "Users can update projects in their organization"
  ON public.projects FOR UPDATE
  USING (
    org_id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );


--------------------------------------------------------------------------------
-- 3. PROFILES
--------------------------------------------------------------------------------
-- View members
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.profiles;
CREATE POLICY "Users can view members of their organization"
  ON public.profiles FOR SELECT
  USING (
    -- Can view own profile OR anyone in the same org
    id = auth.uid() OR
    org_id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );


--------------------------------------------------------------------------------
-- 4. CLEANUP
--------------------------------------------------------------------------------
-- We don't delete the function get_my_org_id() just yet to avoid breaking other migrations,
-- but the policies above no longer rely on it.
