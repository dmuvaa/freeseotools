-- RLS Policies for Features (Audits, Chat, Projects, Jobs)
-- specific to the new Auth/Org Schema

-- 0. Projects (The Pivot Table)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view projects in their organization" ON projects;
CREATE POLICY "Users can view projects in their organization"
ON projects FOR SELECT
USING (
  org_id = public.get_my_org_id()
);

DROP POLICY IF EXISTS "Users can create projects in their organization" ON projects;
CREATE POLICY "Users can create projects in their organization"
ON projects FOR INSERT
WITH CHECK (
  org_id = public.get_my_org_id()
);

DROP POLICY IF EXISTS "Users can update projects in their organization" ON projects;
CREATE POLICY "Users can update projects in their organization"
ON projects FOR UPDATE
USING (
  org_id = public.get_my_org_id()
);

-- 1. Index Audits
ALTER TABLE index_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view audits in their organization" ON index_audits;
CREATE POLICY "Users can view audits in their organization"
ON index_audits FOR SELECT
USING (
  project_id IN (
    SELECT id FROM projects WHERE org_id = public.get_my_org_id()
  )
);

-- 2. Chat Sessions
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view chat sessions in their organization" ON chat_sessions;
CREATE POLICY "Users can view chat sessions in their organization"
ON chat_sessions FOR SELECT
USING (
  index_audit_id IN (
    SELECT ia.id 
    FROM index_audits ia
    JOIN projects p ON ia.project_id = p.id
    WHERE p.org_id = public.get_my_org_id()
  )
);

DROP POLICY IF EXISTS "Users can create chat sessions for their organization" ON chat_sessions;
CREATE POLICY "Users can create chat sessions for their organization"
ON chat_sessions FOR INSERT
WITH CHECK (
  index_audit_id IN (
    SELECT ia.id 
    FROM index_audits ia
    JOIN projects p ON ia.project_id = p.id
    WHERE p.org_id = public.get_my_org_id()
  )
);

DROP POLICY IF EXISTS "Users can delete chat sessions in their organization" ON chat_sessions;
CREATE POLICY "Users can delete chat sessions in their organization"
ON chat_sessions FOR DELETE
USING (
  index_audit_id IN (
    SELECT ia.id 
    FROM index_audits ia
    JOIN projects p ON ia.project_id = p.id
    WHERE p.org_id = public.get_my_org_id()
  )
);

-- 3. Chat Messages
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view messages in their organization sessions" ON chat_messages;
CREATE POLICY "Users can view messages in their organization sessions"
ON chat_messages FOR SELECT
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
CREATE POLICY "Users can send messages to their organization sessions"
ON chat_messages FOR INSERT
WITH CHECK (
  session_id IN (
    SELECT cs.id 
    FROM chat_sessions cs
    JOIN index_audits ia ON cs.index_audit_id = ia.id
    JOIN projects p ON ia.project_id = p.id
    WHERE p.org_id = public.get_my_org_id()
  )
);

-- 4. Audit Jobs
ALTER TABLE audit_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view audit jobs in their organization" ON audit_jobs;
CREATE POLICY "Users can view audit jobs in their organization"
ON audit_jobs FOR SELECT
USING (
  project_id IN (
    SELECT id FROM projects WHERE org_id = public.get_my_org_id()
  )
);

-- 5. Knowledge Audits (if used)
CREATE TABLE IF NOT EXISTS knowledge_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ai_model TEXT,
  knowledge_map JSONB
);
ALTER TABLE knowledge_audits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view knowledge audits in their organization" ON knowledge_audits;
CREATE POLICY "Users can view knowledge audits in their organization"
ON knowledge_audits FOR SELECT
USING (
  project_id IN (
    SELECT id FROM projects WHERE org_id = public.get_my_org_id()
  )
);
