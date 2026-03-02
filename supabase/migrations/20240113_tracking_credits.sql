-- 1. ADD CREDITS TO ORGANIZATIONS
ALTER TABLE public.organizations 
ADD COLUMN IF NOT EXISTS credits_balance INTEGER DEFAULT 500;

-- 2. CREATE MONITORED KEYWORDS TABLE
CREATE TABLE IF NOT EXISTS public.monitored_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    query_phrase TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly')),
    next_run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_run_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. ENABLE RLS
ALTER TABLE public.monitored_keywords ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- View: If you can see the project, you can see the keywords
CREATE POLICY "Users can view keywords for their projects"
ON public.monitored_keywords FOR SELECT
using (
    project_id IN (
        SELECT id FROM public.projects
        WHERE org_id IN (
            SELECT org_id FROM public.profiles
            WHERE id = auth.uid()
        )
    )
);

-- Insert: If you can create projects (member of org), you can add keywords
CREATE POLICY "Users can add keywords to their projects"
ON public.monitored_keywords FOR INSERT
WITH CHECK (
    project_id IN (
        SELECT id FROM public.projects
        WHERE org_id IN (
            SELECT org_id FROM public.profiles
            WHERE id = auth.uid()
        )
    )
);

-- Update/Delete: Same logic
CREATE POLICY "Users can update keywords for their projects"
ON public.monitored_keywords FOR UPDATE
USING (
    project_id IN (
        SELECT id FROM public.projects
        WHERE org_id IN (
            SELECT org_id FROM public.profiles
            WHERE id = auth.uid()
        )
    )
);

CREATE POLICY "Users can delete keywords for their projects"
ON public.monitored_keywords FOR DELETE
USING (
    project_id IN (
        SELECT id FROM public.projects
        WHERE org_id IN (
            SELECT org_id FROM public.profiles
            WHERE id = auth.uid()
        )
    )
);

-- 5. GRANT PERMISSIONS
GRANT ALL ON public.monitored_keywords TO authenticated;
GRANT ALL ON public.monitored_keywords TO service_role;
