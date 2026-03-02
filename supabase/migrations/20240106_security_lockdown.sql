-- SECURITY LOCKDOWN (Idempotent Fix)
-- Run this to fix data leakage and ensure strict isolation

-- 1. Helper function (Must exist)
CREATE OR REPLACE FUNCTION public.get_my_org_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT org_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Secure Organizations (Prevents seeing other orgs)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own organization" ON organizations;
CREATE POLICY "Users can view their own organization" ON organizations FOR SELECT
USING ( id = public.get_my_org_id() );

DROP POLICY IF EXISTS "Owners can update their organization" ON organizations;
CREATE POLICY "Owners can update their organization" ON organizations FOR UPDATE
USING (
  id = public.get_my_org_id() AND 
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'owner')
);

-- 3. Secure Projects (Prevents seeing other projects)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own projects" ON projects; -- Clean up old policy name if exists
DROP POLICY IF EXISTS "Users can view projects in their organization" ON projects;
CREATE POLICY "Users can view projects in their organization" ON projects FOR SELECT
USING ( org_id = public.get_my_org_id() );

DROP POLICY IF EXISTS "Users can create projects in their organization" ON projects;
CREATE POLICY "Users can create projects in their organization" ON projects FOR INSERT
WITH CHECK ( org_id = public.get_my_org_id() );

DROP POLICY IF EXISTS "Users can update projects in their organization" ON projects;
CREATE POLICY "Users can update projects in their organization" ON projects FOR UPDATE
USING ( org_id = public.get_my_org_id() );

-- 4. Audit Jobs
ALTER TABLE audit_jobs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view audit jobs in their organization" ON audit_jobs;
CREATE POLICY "Users can view audit jobs in their organization" ON audit_jobs FOR SELECT
USING (
  project_id IN (SELECT id FROM projects WHERE org_id = public.get_my_org_id())
);

-- 5. Index Audits
ALTER TABLE index_audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view audits in their organization" ON index_audits;
CREATE POLICY "Users can view audits in their organization" ON index_audits FOR SELECT
USING (
   project_id IN (SELECT id FROM projects WHERE org_id = public.get_my_org_id())
);

-- 6. Chat Sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view chat sessions in their organization" ON chat_sessions;
CREATE POLICY "Users can view chat sessions in their organization" ON chat_sessions FOR SELECT
USING (
  index_audit_id IN (
    SELECT ia.id FROM index_audits ia JOIN projects p ON ia.project_id = p.id WHERE p.org_id = public.get_my_org_id()
  )
);

DROP POLICY IF EXISTS "Users can create chat sessions for their organization" ON chat_sessions;
CREATE POLICY "Users can create chat sessions for their organization" ON chat_sessions FOR INSERT
WITH CHECK (
  index_audit_id IN (
    SELECT ia.id 
    FROM index_audits ia
    JOIN projects p ON ia.project_id = p.id
    WHERE p.org_id = public.get_my_org_id()
  )
);

DROP POLICY IF EXISTS "Users can delete chat sessions in their organization" ON chat_sessions;
CREATE POLICY "Users can delete chat sessions in their organization" ON chat_sessions FOR DELETE
USING (
  index_audit_id IN (
    SELECT ia.id 
    FROM index_audits ia
    JOIN projects p ON ia.project_id = p.id
    WHERE p.org_id = public.get_my_org_id()
  )
);

-- 7. Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view messages in their organization sessions" ON chat_messages;
CREATE POLICY "Users can view messages in their organization sessions" ON chat_messages FOR SELECT
USING (
  session_id IN (
    SELECT cs.id 
    FROM chat_sessions cs
    JOIN index_audits ia ON cs.index_audit_id = ia.id
    JOIN projects p ON ia.project_id = p.id
    WHERE p.org_id = public.get_my_org_id()
  )
);

DROP POLICY IF EXISTS "Users can send messages to their organization sessions" ON chat_messages;
CREATE POLICY "Users can send messages to their organization sessions" ON chat_messages FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT cs.id 
    FROM chat_sessions cs
    JOIN index_audits ia ON cs.index_audit_id = ia.id
    JOIN projects p ON ia.project_id = p.id
    WHERE p.org_id = public.get_my_org_id()
  )
);

-- 8. Knowledge Audits
CREATE TABLE IF NOT EXISTS knowledge_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ai_model TEXT,
  knowledge_map JSONB
);
ALTER TABLE knowledge_audits ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view knowledge audits in their organization" ON knowledge_audits;
CREATE POLICY "Users can view knowledge audits in their organization" ON knowledge_audits FOR SELECT
USING (
  project_id IN (SELECT id FROM projects WHERE org_id = public.get_my_org_id())
);
