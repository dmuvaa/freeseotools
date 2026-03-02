-- Allow authenticated users to delete audit_jobs in their organization's projects
-- This enables ON DELETE CASCADE to work properly when deleting a project

-- Policy for authenticated users to DELETE audit_jobs
CREATE POLICY "Users can delete audit jobs in their organization"
ON public.audit_jobs FOR DELETE
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.org_id IN (
      SELECT om.org_id FROM public.org_memberships om
      WHERE om.user_id = auth.uid()
    )
  )
);

-- Also add policy for monitored_keywords if not present
CREATE POLICY "Users can delete monitored keywords in their organization"
ON public.monitored_keywords FOR DELETE
USING (
  project_id IN (
    SELECT p.id FROM public.projects p
    WHERE p.org_id IN (
      SELECT om.org_id FROM public.org_memberships om
      WHERE om.user_id = auth.uid()
    )
  )
);

-- Alternative simpler approach if you want service role to handle cascades:
-- Run this ONLY if the above policies don't work due to missing org_memberships table

-- GRANT DELETE ON public.audit_jobs TO authenticated;
-- GRANT DELETE ON public.monitored_keywords TO authenticated;
