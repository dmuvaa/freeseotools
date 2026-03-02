-- Dynamic Constraint Update Script
-- This script safely finds and drops ANY foreign key from audit_jobs to projects, 
-- then re-creates it with ON DELETE CASCADE.

DO $$
DECLARE
    r RECORD;
BEGIN
    -- 1. Find and Drop constraint on audit_jobs -> projects
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.key_column_usage
        WHERE table_name = 'audit_jobs' 
          AND column_name = 'project_id'
          AND table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.audit_jobs DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
    END LOOP;

    -- 2. Find and Drop constraint on monitored_keywords -> projects
    FOR r IN (
        SELECT constraint_name
        FROM information_schema.key_column_usage
        WHERE table_name = 'monitored_keywords' 
          AND column_name = 'project_id'
          AND table_schema = 'public'
    ) LOOP
        EXECUTE 'ALTER TABLE public.monitored_keywords DROP CONSTRAINT ' || quote_ident(r.constraint_name);
        RAISE NOTICE 'Dropped constraint: %', r.constraint_name;
    END LOOP;
END $$;

-- 3. Re-add constraints with ON DELETE CASCADE
ALTER TABLE public.audit_jobs
ADD CONSTRAINT audit_jobs_project_id_fkey_cascade
FOREIGN KEY (project_id)
REFERENCES public.projects(id)
ON DELETE CASCADE;

ALTER TABLE public.monitored_keywords
ADD CONSTRAINT monitored_keywords_project_id_fkey_cascade
FOREIGN KEY (project_id)
REFERENCES public.projects(id)
ON DELETE CASCADE;
