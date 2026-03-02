-- Master Auth Setup (Recursive Fix)
-- Run this to set up Organizations, Profiles, and automated onboarding

-- 1. Create Tables
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text,
  plan_tier text DEFAULT 'free',
  subscription_status text DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  org_id uuid REFERENCES public.organizations(id),
  email text NOT NULL,
  first_name text,
  last_name text,
  avatar_url text,
  role text DEFAULT 'member', -- 'owner', 'admin', 'member'
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Helper to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 3. Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. Define Policies

-- Organizations Policies
DROP POLICY IF EXISTS "Users can view their own organization" ON public.organizations;
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (
    id = public.get_my_org_id()
  );

DROP POLICY IF EXISTS "Owners can update their organization" ON public.organizations;
CREATE POLICY "Owners can update their organization"
  ON public.organizations FOR UPDATE
  USING (
    id = public.get_my_org_id() AND 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
  );

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view members of their organization" ON public.profiles;
CREATE POLICY "Users can view members of their organization"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() OR org_id = public.get_my_org_id()
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ( id = auth.uid() );

-- 5. Automated Onboarding Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
  org_name text;
  u_first_name text;
  u_last_name text;
BEGIN
  -- Extract Metadata (if available)
  u_first_name := new.raw_user_meta_data->>'first_name';
  u_last_name := new.raw_user_meta_data->>'last_name';
  org_name := COALESCE(new.raw_user_meta_data->>'organization_name', 'My Organization');

  -- Create Default Organization
  INSERT INTO public.organizations (name, plan_tier)
  VALUES (org_name, 'free')
  RETURNING id INTO new_org_id;

  -- Create User Profile linked to Organization (as Owner)
  INSERT INTO public.profiles (id, org_id, email, first_name, last_name, role, avatar_url)
  VALUES (
    new.id, 
    new_org_id, 
    new.email, 
    u_first_name, 
    u_last_name, 
    'owner',
    new.raw_user_meta_data->>'avatar_url'
  );

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind Trigger
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 6. Utility: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_profiles_modtime ON public.profiles;
DROP TRIGGER IF EXISTS update_organizations_modtime ON public.organizations;

CREATE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_organizations_modtime
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 7. Backfill for Existing Users
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT * FROM auth.users LOOP
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = u.id) THEN
       WITH new_org AS (
         INSERT INTO public.organizations (name, plan_tier) 
         VALUES ('My Organization', 'free')
         RETURNING id
       )
       INSERT INTO public.profiles (id, org_id, email, role)
       SELECT u.id, (SELECT id FROM new_org), u.email, 'owner';
    END IF;
  END LOOP;
END;
$$;
