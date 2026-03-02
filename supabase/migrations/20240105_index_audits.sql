-- AI Index Knowledge Graph Schema
-- Run this migration to enable IKG features

-- Create index_audits table for storing AI Index Graph results
CREATE TABLE IF NOT EXISTS index_audits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE,
  model text NOT NULL,
  created_at timestamptz DEFAULT now(),

  -- Dominance metrics
  dominant_domain text,
  dominance_score float,

  -- Index artifacts (JSONB for flexibility)
  indexed_domains jsonb DEFAULT '[]'::jsonb,
  concept_anchors jsonb DEFAULT '[]'::jsonb,
  missing_entities jsonb DEFAULT '[]'::jsonb,
  conflicts jsonb DEFAULT '[]'::jsonb,

  -- Stability score
  index_stability_score float
);

-- Index for efficient project lookups
CREATE INDEX IF NOT EXISTS idx_index_audits_project_id ON index_audits(project_id);
CREATE INDEX IF NOT EXISTS idx_index_audits_created_at ON index_audits(created_at DESC);

-- Update audit_jobs to support INDEX_GRAPH job type
-- (This is a no-op if already text, but ensures the column accepts the new value)
ALTER TABLE audit_jobs 
  DROP CONSTRAINT IF EXISTS audit_jobs_job_type_check;

-- Add comment for documentation
COMMENT ON TABLE index_audits IS 'Stores AI Index Knowledge Graph audit results - reverse-engineered retrieval surface snapshots';
