-- FIX RLS V8 (2024-01-13)
-- "The Simplified Fix": Breaks recursion by restricting profile visibility.
-- Priority: Unblock project creation.

--------------------------------------------------------------------------------
-- 1. PROFILES (The Circuit Breaker)
--------------------------------------------------------------------------------
-- To prevent recursion (Org -> Profile -> Org), users can ONLY see their own profile.
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING ( id = auth.uid() );

-- Update remains same
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ( id = auth.uid() );


--------------------------------------------------------------------------------
-- 2. ORGANIZATIONS
--------------------------------------------------------------------------------
-- Now we can safely query profiles because the profile policy above is simplistic (id=uid)
-- and won't trigger another Organization check.

DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (
    id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );

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
-- 3. PROJECTS
--------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view projects in their organization" ON public.projects;
CREATE POLICY "Users can view projects in their organization"
  ON public.projects FOR SELECT
  USING (
    org_id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can create projects in their organization" ON public.projects;
CREATE POLICY "Users can create projects in their organization"
  ON public.projects FOR INSERT
  WITH CHECK (
    org_id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update projects in their organization" ON public.projects;
CREATE POLICY "Users can update projects in their organization"
  ON public.projects FOR UPDATE
  USING (
    org_id IN (
        SELECT org_id FROM public.profiles 
        WHERE id = auth.uid()
    )
  );
