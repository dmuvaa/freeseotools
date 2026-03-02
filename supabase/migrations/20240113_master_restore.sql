-- MASTER RESTORE V2 (2024-01-13)
-- Run this AFTER the Nuclear Reset to restore functionality.
-- Combines: Trigger Fixes (Schema Corrected) + V8 Simplified RLS.

--------------------------------------------------------------------------------
-- 1. UTILITY: UPDATE TIMESTAMP
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_organizations_modtime
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

--------------------------------------------------------------------------------
-- 2. AUTH HANDLER (Fixed for Schema: first_name, last_name)
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
  u_first_name text;
  u_last_name text;
  u_full_name text;
  display_name text;
BEGIN
  -- Extract Name Data
  u_first_name := new.raw_user_meta_data->>'first_name';
  u_last_name := new.raw_user_meta_data->>'last_name';
  u_full_name := new.raw_user_meta_data->>'full_name';
  
  -- Logic: If first_name is missing but we have full_name, use full_name as first_name
  -- (Simple fallback to avoid sql complex splitting)
  IF u_first_name IS NULL THEN
      IF u_full_name IS NOT NULL THEN
          u_first_name := u_full_name;
      ELSE
          u_first_name := 'User';
      END IF;
  END IF;

  display_name := u_first_name;
  IF u_last_name IS NOT NULL THEN
      display_name := display_name || ' ' || u_last_name;
  END IF;

  -- Create Default Organization (WITH owner_id)
  INSERT INTO public.organizations (name, plan_tier, owner_id)
  VALUES (display_name || '''s Organization', 'free', new.id)
  RETURNING id INTO new_org_id;

  -- Create Profile linked to Organization
  -- CRITICAL FIX: Inserting into 'first_name', 'last_name', NOT 'full_name'
  INSERT INTO public.profiles (id, org_id, first_name, last_name, avatar_url, email, role)
  VALUES (
    new.id, 
    new_org_id, 
    u_first_name,
    u_last_name,
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'owner'
  );

  return new;
END;
$$ language plpgsql security definer;

-- Bind the trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


--------------------------------------------------------------------------------
-- 3. RLS POLICIES (V8 Simplified - Recursion Safe)
--------------------------------------------------------------------------------

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- PROFILES: Only see yourself (Breaks recursion)
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING ( id = auth.uid() );

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ( id = auth.uid() );

-- ORGANIZATIONS: See org via profile
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

-- PROJECTS: See projects via profile's org
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

-- 4. GRANT PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;
