-- FIX PROFILES SCHEMA V4 (2024-01-13)
-- "The Ghostbuster Patch": Fixes profiles pointing to non-existent organizations.
-- This handles "Dangling References" which can occur if an Org was deleted but the Profile wasn't updated.

DO $$
DECLARE
    u_profile record;
    org_exists boolean;
    new_org_id uuid;
    user_name text;
BEGIN
    -- Loop through ALL profiles that have an org_id set
    FOR u_profile IN SELECT * FROM public.profiles WHERE org_id IS NOT NULL LOOP
        
        -- 1. Check if the Organization actually exists
        SELECT EXISTS(SELECT 1 FROM public.organizations WHERE id = u_profile.org_id) INTO org_exists;

        -- 2. If it DOES NOT exist (Ghost Org), we must fix it
        IF NOT org_exists THEN
            RAISE NOTICE 'Found dangling reference for user % (Org ID: %)', u_profile.email, u_profile.org_id;

            -- Determine a name for the new org
            user_name := COALESCE(u_profile.first_name, u_profile.email);
            
            -- Create a replacement Organization
            INSERT INTO public.organizations (name, plan_tier, owner_id)
            VALUES (
                user_name || '''s Organization', 
                'free',
                u_profile.id -- Set the owner immediately
            )
            RETURNING id INTO new_org_id;

            -- Update the Profile to point to the valid, new Organization
            UPDATE public.profiles
            SET org_id = new_org_id, role = 'owner'
            WHERE id = u_profile.id;

            RAISE NOTICE 'Fixed dangling reference. New Org ID: %', new_org_id;
        
        ELSE
            -- 3. If Org exists, just ensure owner_id is set (Double Check)
            UPDATE public.organizations
            SET owner_id = u_profile.id
            WHERE id = u_profile.org_id AND owner_id IS NULL;
        END IF;

    END LOOP;
END $$;
