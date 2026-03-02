-- FIX SCHEMA INTEGRITY V5 (2024-01-13)
-- The "Superset" Fix:
-- 1. Fixes the missing column that caused the crash.
-- 2. Repair dangling references (Ghostbuster).
-- 3. Backfills missing data (Orphans).
-- 4. Ensures permissions (Owner IDs).

-- PART 1: FIX THE SCHEMA CRASH
-- The 'update_organizations_modtime' trigger fails if 'updated_at' is missing.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'organizations' AND column_name = 'updated_at') THEN
        ALTER TABLE public.organizations ADD COLUMN updated_at timestamptz DEFAULT now();
        RAISE NOTICE 'Fixed missing updated_at column on organizations';
    END IF;
END $$;

-- Ensure profiles.org_id exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'org_id') THEN
        ALTER TABLE public.profiles ADD COLUMN org_id UUID REFERENCES public.organizations(id);
    END IF;
END $$;


-- PART 2: DATA REPAIR (Ghostbuster + Backfill)
DO $$
DECLARE
    u record;
    u_profile record;
    org_exists boolean;
    p_exists boolean;
    new_org_id uuid;
    current_org_id uuid;
    user_name text;
BEGIN
    ----------------------------------------------------------------
    -- A. Fix "Ghost" Organizations (Dangling References)
    ----------------------------------------------------------------
    FOR u_profile IN SELECT * FROM public.profiles WHERE org_id IS NOT NULL LOOP
        SELECT EXISTS(SELECT 1 FROM public.organizations WHERE id = u_profile.org_id) INTO org_exists;

        IF NOT org_exists THEN
            user_name := COALESCE(u_profile.first_name, u_profile.email);
            
            INSERT INTO public.organizations (name, plan_tier, owner_id)
            VALUES (user_name || '''s Organization', 'free', u_profile.id)
            RETURNING id INTO new_org_id;

            UPDATE public.profiles
            SET org_id = new_org_id, role = 'owner'
            WHERE id = u_profile.id;

            RAISE NOTICE 'Fixed ghost org for user %', u_profile.email;
        END IF;
    END LOOP;

    ----------------------------------------------------------------
    -- B. Fix Orphans (No Profile) & Ensure Owner Setup
    ----------------------------------------------------------------
    FOR u IN SELECT * FROM auth.users LOOP
        
        -- Check if profile exists
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE id = u.id) INTO p_exists;
        
        IF NOT p_exists THEN
            -- Fix Orphan: Create Org & Profile
            INSERT INTO public.organizations (name, plan_tier, owner_id)
            VALUES (
                COALESCE(u.raw_user_meta_data->>'full_name', 'User') || '''s Organization', 
                'free',
                u.id
            )
            RETURNING id INTO new_org_id;

            INSERT INTO public.profiles (id, org_id, email, full_name, avatar_url, role)
            VALUES (
                u.id, 
                new_org_id, 
                u.email, 
                u.raw_user_meta_data->>'full_name',
                u.raw_user_meta_data->>'avatar_url',
                'owner'
            );
            
            RAISE NOTICE 'Created profile for orphan user: %', u.email;

        ELSE
            -- Profile exists, check if Org has owner_id
            SELECT org_id INTO current_org_id FROM public.profiles WHERE id = u.id;
            
            IF current_org_id IS NULL THEN
                -- Detached profile (null org_id) - Create Org
                 INSERT INTO public.organizations (name, plan_tier, owner_id)
                VALUES (
                    COALESCE(u.raw_user_meta_data->>'full_name', 'User') || '''s Organization', 
                    'free',
                    u.id
                )
                RETURNING id INTO new_org_id;

                UPDATE public.profiles SET org_id = new_org_id, role = 'owner' WHERE id = u.id;
                RAISE NOTICE 'Fixed detached profile for user: %', u.email;
            ELSE
                -- Ensure the User owns their Org (if no one else does)
                UPDATE public.organizations 
                SET owner_id = u.id 
                WHERE id = current_org_id AND owner_id IS NULL;
            END IF;
        END IF;

    END LOOP;
END $$;


-- PART 3: FUTURE PROOFING (Trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  new_org_id uuid;
  user_name text;
BEGIN
  user_name := COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'first_name', 'User');

  -- Create Default Organization (WITH owner_id)
  INSERT INTO public.organizations (name, plan_tier, owner_id)
  VALUES (user_name || '''s Organization', 'free', new.id)
  RETURNING id INTO new_org_id;

  -- Create Profile linked to Organization
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

-- PART 4: POLICIES
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
