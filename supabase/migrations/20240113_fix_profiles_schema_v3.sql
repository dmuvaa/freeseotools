-- FIX PROFILES SCHEMA V3 (2024-01-13)
-- Final Comprehensive Fix: Handles Orphans, Missing Org IDs, and Owner IDs.

-- 1. Ensure org_id column exists on profiles
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
        ALTER TABLE public.profiles ADD COLUMN org_id UUID REFERENCES public.organizations(id);
    END IF;
END $$;

-- 2. Comprehensive Backfill Block
DO $$
DECLARE
    u record;
    u_meta jsonb;
    new_org_id uuid;
    p_exists boolean;
    current_org_id uuid;
BEGIN
    -- Iterate over ALL users in auth.users
    FOR u IN SELECT * FROM auth.users LOOP
        
        -- Check if profile exists for this user
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = u.id) INTO p_exists;
        
        IF NOT p_exists THEN
            -- CASE A: User exists but has NO Profile (The "Orphan" Case)
            -- 1. Create Organization (and set owner_id!)
            INSERT INTO public.organizations (name, plan_tier, owner_id)
            VALUES (
                COALESCE(u.raw_user_meta_data->>'full_name', 'User') || '''s Organization', 
                'free',
                u.id -- CRITICAL: Set the owner_id
            )
            RETURNING id INTO new_org_id;

            -- 2. Create Profile
            INSERT INTO public.profiles (id, org_id, email, full_name, avatar_url, role)
            VALUES (
                u.id, 
                new_org_id, 
                u.email, 
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'avatar_url',
                'owner'
            );
            
            RAISE NOTICE 'Fixed orphan user: %', u.email;

        ELSE
            -- CASE B: Profile exists, check consistency
            SELECT org_id INTO current_org_id FROM public.profiles WHERE id = u.id;

            IF current_org_id IS NULL THEN
                 -- 1. Create Organization
                INSERT INTO public.organizations (name, plan_tier, owner_id)
                VALUES (
                    COALESCE(u.raw_user_meta_data->>'full_name', 'User') || '''s Organization', 
                    'free',
                    u.id
                )
                RETURNING id INTO new_org_id;

                -- 2. Link Profile
                UPDATE public.profiles 
                SET org_id = new_org_id, role = 'owner' 
                WHERE id = u.id;
                
                RAISE NOTICE 'Fixed detached profile: %', u.email;
            ELSE
                -- CASE C: Profile linked, but does Org have owner_id set?
                UPDATE public.organizations 
                SET owner_id = u.id 
                WHERE id = current_org_id AND owner_id IS NULL;
            END IF;
        END IF;

    END LOOP;
END $$;

-- 3. Update the handle_new_user trigger (The Future Fix)
-- Ensures correct setup for any NEW signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
  user_name text;
BEGIN
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'first_name', 'User');

  -- 1. Create Default Organization (WITH owner_id)
  INSERT INTO public.organizations (name, plan_tier, owner_id)
  VALUES (user_name || '''s Organization', 'free', new.id)
  RETURNING id INTO new_org_id;

  -- 2. Create Profile linked to Organization
  INSERT INTO public.profiles (id, org_id, full_name, avatar_url, email, role)
  VALUES (
    new.id, 
    new_org_id, 
    user_name, 
    new.raw_user_meta_data->>'avatar_url',
    new.email,
    'owner'
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
