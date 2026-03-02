-- Add job_type to audit_jobs
ALTER TABLE audit_jobs ADD COLUMN IF NOT EXISTS job_type TEXT DEFAULT 'STANDARD';

-- Create knowledge_audits table
CREATE TABLE IF NOT EXISTS knowledge_audits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  ai_model TEXT NOT NULL,
  knowledge_map JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE knowledge_audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role has full access to knowledge_audits"
  ON knowledge_audits FOR ALL
  USING (true)
  WITH CHECK (true);
