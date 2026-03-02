-- FIX PROFILES SCHEMA V2 (2024-01-13)
-- Corrected version that does NOT assume 'owner_id' exists on organizations table.

-- 1. Ensure org_id exists on profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
        ALTER TABLE public.profiles ADD COLUMN org_id UUID REFERENCES public.organizations(id);
    END IF;
END $$;

-- 2. Backfill org_id for existing profiles
DO $$
DECLARE
    u record;
    new_org_id uuid;
BEGIN
    FOR u IN SELECT * FROM public.profiles WHERE org_id IS NULL LOOP
        -- Create a new organization for this user
        INSERT INTO public.organizations (name, plan_tier)
        VALUES (COALESCE(u.full_name, 'User') || '''s Organization', 'free')
        RETURNING id INTO new_org_id;
        
        -- Update profile with the new org_id
        UPDATE public.profiles SET org_id = new_org_id WHERE id = u.id;
    END LOOP;
END $$;

-- 3. Update the handle_new_user trigger
-- This ensures future users get an organization created correctly without 'owner_id' error
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
  user_name text;
BEGIN
  -- Get name or default
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'first_name', 'User');

  -- 1. Create Default Organization (Removed owner_id as it doesn't exist in schema)
  INSERT INTO public.organizations (name, plan_tier)
  VALUES (user_name || '''s Organization', 'free')
  RETURNING id INTO new_org_id;

  -- 2. Create Profile linked to Organization
  INSERT INTO public.profiles (id, org_id, full_name, avatar_url, email)
  VALUES (
    new.id, 
    new_org_id, 
    user_name, 
    new.raw_user_meta_data->>'avatar_url',
    new.email
  );

  return new;
END;
$$ language plpgsql security definer;

-- 4. Re-apply RLS policies for Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view members of their organization" ON public.profiles;
CREATE POLICY "Users can view members of their organization"
  ON public.profiles FOR SELECT
  USING (
    id = auth.uid() OR org_id = (SELECT org_id FROM public.profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING ( id = auth.uid() );
