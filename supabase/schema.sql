-- ============================================
-- BlitzGeo Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Organizations (SaaS Foundation)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  plan_tier TEXT DEFAULT 'free', -- 'free', 'pro', 'agency'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Projects (The Brand Context)
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,          -- e.g. "WebPrism"
  primary_domain TEXT,         -- e.g. "webprismio.com" (for citation checking)
  brand_aliases TEXT[],        -- e.g. ["WebPrism", "Web Prism", "WebPrismIO"]
  tracked_competitors TEXT[],  -- e.g. ["CompetitorA", "CompetitorB"]
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Audit Jobs (The "Ticket")
-- Represents one specific query sent to multiple models at a specific time.
CREATE TABLE IF NOT EXISTS audit_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  query_phrase TEXT NOT NULL,  -- "Best web dev in Nairobi"
  status TEXT DEFAULT 'QUEUED', -- 'QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'
  blitz_score INT,             -- 0-100 (Calculated after all runs finish)
  models_selected TEXT[],      -- ["gpt-4o", "perplexity/sonar"]
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 4. Audit Runs (The Individual AI Responses)
-- One Job = Multiple Runs (one per model).
CREATE TABLE IF NOT EXISTS audit_runs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES audit_jobs(id) ON DELETE CASCADE,
  ai_model TEXT NOT NULL,
  response_raw TEXT,           -- The full markdown answer
  is_mentioned BOOLEAN DEFAULT FALSE,
  sentiment_score FLOAT,       -- -1.0 to 1.0 (Future proofing)
  citations_found TEXT[],      -- URLs extracted from response
  execution_time_ms INT,       -- Performance tracking
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Speed
CREATE INDEX IF NOT EXISTS idx_jobs_project ON audit_jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON audit_jobs(status);
CREATE INDEX IF NOT EXISTS idx_runs_job ON audit_runs(job_id);

-- ============================================
-- Row Level Security (RLS) - Basic Setup
-- ============================================

-- Enable RLS on all tables
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_runs ENABLE ROW LEVEL SECURITY;

-- For now, allow service role full access (worker uses service role key)
-- You can add user-based policies later for multi-tenancy

CREATE POLICY "Service role has full access to organizations"
  ON organizations FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to projects"
  ON projects FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to audit_jobs"
  ON audit_jobs FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role has full access to audit_runs"
  ON audit_runs FOR ALL
  USING (true)
  WITH CHECK (true);
