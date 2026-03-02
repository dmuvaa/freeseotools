-- NUCLEAR RESET V2: DATA + RLS PURGE
-- WARNING: DELETES ALL DATA, DROPS ALL POLICIES, DROPS FUNCTIONS/TRIGGERS.
-- Use this to return to a "Schema Only" state (tables exist, but are empty and unsecured).
-- AFTER RUNNING THIS: You MUST re-run your setup scripts (auth_setup.sql, etc.) to restore functionality.

BEGIN;

-- 1. TRUNCATE DATA
RAISE NOTICE 'Wiping all data...';
TRUNCATE TABLE public.audit_runs CASCADE;
TRUNCATE TABLE public.chat_messages CASCADE;
TRUNCATE TABLE public.chat_sessions CASCADE;
TRUNCATE TABLE public.index_audits CASCADE;
TRUNCATE TABLE public.knowledge_audits CASCADE;
TRUNCATE TABLE public.audit_jobs CASCADE;
TRUNCATE TABLE public.projects CASCADE;
TRUNCATE TABLE public.profiles CASCADE;
TRUNCATE TABLE public.organizations CASCADE;

-- 2. DROP ALL RLS POLICIES
-- Dynamic SQL to find and drop every policy in the public schema
RAISE NOTICE 'Dropping all RLS policies...';
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, r.tablename);
        RAISE NOTICE 'Dropped policy: % on %', r.policyname, r.tablename;
    END LOOP;
END $$;

-- 3. DROP HELPER FUNCTIONS & TRIGGERS
-- We drop these to ensure "clean slate" when re-applying migrations.
RAISE NOTICE 'Dropping functions and triggers...';
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.get_my_org_id();
DROP FUNCTION IF EXISTS public.get_auth_org_id();
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

COMMIT;

RAISE NOTICE 'Nuclear Reset Complete. Data wiped. Policies dropped. You must re-run setup scripts.';
